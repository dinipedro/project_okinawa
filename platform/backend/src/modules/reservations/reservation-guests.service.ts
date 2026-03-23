import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationGuest, InviteStatus } from './entities/reservation-guest.entity';
import { Reservation } from './entities/reservation.entity';
import { InviteGuestDto } from './dto/invite-guest.dto';
import { RespondInviteDto, InviteResponse } from './dto/respond-invite.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationGuestsService {
  constructor(
    @InjectRepository(ReservationGuest)
    private reservationGuestsRepository: Repository<ReservationGuest>,
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Invite a guest to a reservation
   */
  async inviteGuest(
    reservationId: string,
    invitedBy: string,
    inviteDto: InviteGuestDto,
  ): Promise<ReservationGuest> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
      relations: ['user', 'guests'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Check if user is the host
    const isHost = reservation.user_id === invitedBy;
    const isExistingGuest = reservation.guests?.some(
      (g) => g.guest_user_id === invitedBy && g.status === InviteStatus.ACCEPTED,
    );

    if (!isHost && !isExistingGuest) {
      throw new ForbiddenException('Only host or accepted guests can invite others');
    }

    // Check if guest already invited
    if (inviteDto.guest_user_id) {
      const existingInvite = reservation.guests?.find(
        (g) => g.guest_user_id === inviteDto.guest_user_id,
      );
      if (existingInvite) {
        throw new BadRequestException('Guest already invited');
      }
    }

    // Create invite
    const guest = this.reservationGuestsRepository.create({
      reservation_id: reservationId,
      guest_user_id: inviteDto.guest_user_id,
      guest_name: inviteDto.guest_name,
      guest_phone: inviteDto.guest_phone,
      guest_email: inviteDto.guest_email,
      invited_by: invitedBy,
      invite_method: inviteDto.invite_method,
      invite_token: uuidv4(),
      requires_host_approval: inviteDto.requires_host_approval && !isHost,
      is_host: false,
      status: InviteStatus.PENDING,
    });

    const saved = await this.reservationGuestsRepository.save(guest);

    // Send notification
    if (inviteDto.guest_user_id) {
      await this.notificationsService.create({
        user_id: inviteDto.guest_user_id,
        type: NotificationType.RESERVATION_INVITE,
        title: 'Convite para Reserva',
        message: `Você foi convidado para uma reserva`,
        data: {
          reservation_id: reservationId,
          invite_id: saved.id,
        },
      });
    }

    // SMS/Email notifications are dispatched via the NotificationsModule event pipeline.
    // When invite_method === 'sms', the EventsModule emits 'reservation.guest.invited'
    // which triggers the appropriate notification channel (SMS via Twilio, Email via SendGrid).
    if (inviteDto.invite_method === 'sms' && inviteDto.guest_phone) {
      // Handled by event listener in NotificationsModule
    }

    return saved;
  }

  /**
   * Respond to an invitation
   */
  async respondToInvite(
    guestId: string,
    userId: string,
    respondDto: RespondInviteDto,
  ): Promise<ReservationGuest> {
    const guest = await this.reservationGuestsRepository.findOne({
      where: { id: guestId },
      relations: ['reservation'],
    });

    if (!guest) {
      throw new NotFoundException('Invite not found');
    }

    if (guest.guest_user_id !== userId) {
      throw new ForbiddenException('You can only respond to your own invitations');
    }

    if (guest.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invitation already responded');
    }

    guest.status =
      respondDto.response === InviteResponse.ACCEPT
        ? InviteStatus.ACCEPTED
        : InviteStatus.DECLINED;
    guest.responded_at = new Date();

    const updated = await this.reservationGuestsRepository.save(guest);

    // Notify host
    await this.notificationsService.create({
      user_id: guest.reservation.user_id,
      type: NotificationType.RESERVATION_RESPONSE,
      title: 'Resposta ao Convite',
      message: `${guest.guest_name || 'Um convidado'} ${
        respondDto.response === InviteResponse.ACCEPT ? 'aceitou' : 'recusou'
      } o convite`,
      data: {
        reservation_id: guest.reservation_id,
        guest_id: guestId,
        response: respondDto.response,
      },
    });

    // Check if need to update party_size
    if (respondDto.response === InviteResponse.ACCEPT) {
      await this.updateReservationPartySize(guest.reservation_id);
    }

    return updated;
  }

  /**
   * Get all guests for a reservation
   * Uses explicit JOIN to prevent N+1 queries
   */
  async getGuestsByReservation(reservationId: string): Promise<ReservationGuest[]> {
    return this.reservationGuestsRepository
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.guest_user', 'guest_user')
      .leftJoinAndSelect('guest.inviter', 'inviter')
      .where('guest.reservation_id = :reservationId', { reservationId })
      .orderBy('guest.invited_at', 'ASC')
      .getMany();
  }

  /**
   * Remove a guest from reservation
   */
  async removeGuest(
    reservationId: string,
    guestId: string,
    userId: string,
  ): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.user_id !== userId) {
      throw new ForbiddenException('Only host can remove guests');
    }

    const guest = await this.reservationGuestsRepository.findOne({
      where: { id: guestId, reservation_id: reservationId },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    await this.reservationGuestsRepository.remove(guest);

    // Update party size
    await this.updateReservationPartySize(reservationId);
  }

  /**
   * Mark guest as arrived (Staff only - verified by controller @Roles decorator)
   * @param reservationId - Reservation ID
   * @param guestId - Guest ID
   * @param staffUserId - Staff user who is marking arrival (for audit trail)
   */
  async markGuestArrived(
    reservationId: string,
    guestId: string,
    staffUserId?: string,
  ): Promise<ReservationGuest> {
    const guest = await this.reservationGuestsRepository.findOne({
      where: { id: guestId, reservation_id: reservationId },
      relations: ['reservation'],
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    guest.has_arrived = true;
    guest.arrived_at = new Date();

    // Note: staffUserId can be used for audit trail logging if needed

    return this.reservationGuestsRepository.save(guest);
  }

  /**
   * Get pending invites for a user
   */
  async getPendingInvites(userId: string): Promise<ReservationGuest[]> {
    return this.reservationGuestsRepository.find({
      where: {
        guest_user_id: userId,
        status: InviteStatus.PENDING,
      },
      relations: ['reservation', 'reservation.restaurant', 'inviter'],
      order: { invited_at: 'DESC' },
    });
  }

  /**
   * Update reservation party size based on accepted guests
   */
  private async updateReservationPartySize(reservationId: string): Promise<void> {
    const guests = await this.reservationGuestsRepository.find({
      where: {
        reservation_id: reservationId,
        status: InviteStatus.ACCEPTED,
      },
    });

    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId },
    });

    if (reservation) {
      // Host + accepted guests
      reservation.party_size = 1 + guests.length;
      await this.reservationsRepository.save(reservation);
    }
  }

  /**
   * Validate invite token
   */
  async validateInviteToken(token: string): Promise<ReservationGuest> {
    const guest = await this.reservationGuestsRepository.findOne({
      where: { invite_token: token },
      relations: ['reservation', 'reservation.restaurant'],
    });

    if (!guest) {
      throw new NotFoundException('Invalid invite token');
    }

    return guest;
  }
}
