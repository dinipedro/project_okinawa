import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';

describe('AddressesService', () => {
  let service: AddressesService;

  const mockAddress: Address = {
    id: 'addr-1',
    user_id: 'user-1',
    restaurant_id: null,
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 4',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01310-100',
    country: 'BR',
    latitude: -23.5505,
    longitude: -46.6333,
    is_default: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    user: null as any,
  };

  const mockAddressRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepo,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);

    jest.clearAllMocks();
  });

  describe('findByUser', () => {
    it('should return all addresses for a user ordered by default first', async () => {
      const addresses = [{ ...mockAddress, is_default: true }, { ...mockAddress, id: 'addr-2', is_default: false }];
      mockAddressRepo.find.mockResolvedValue(addresses);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(addresses);
      expect(mockAddressRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { is_default: 'DESC', created_at: 'DESC' },
      });
    });

    it('should return an empty array when user has no addresses', async () => {
      mockAddressRepo.find.mockResolvedValue([]);

      const result = await service.findByUser('user-no-addresses');

      expect(result).toEqual([]);
      expect(mockAddressRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-no-addresses' },
        order: { is_default: 'DESC', created_at: 'DESC' },
      });
    });
  });

  describe('findDefault', () => {
    it('should return the default address for a user', async () => {
      const defaultAddress = { ...mockAddress, is_default: true };
      mockAddressRepo.findOne.mockResolvedValue(defaultAddress);

      const result = await service.findDefault('user-1');

      expect(result).toEqual(defaultAddress);
      expect(mockAddressRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_default: true },
      });
    });

    it('should return null when user has no default address', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      const result = await service.findDefault('user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto = {
      label: 'Trabalho',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      postal_code: '01310-100',
      is_default: false,
    };

    it('should create a new address for a user', async () => {
      const newAddress = { ...mockAddress, ...createDto };
      mockAddressRepo.create.mockReturnValue(newAddress);
      mockAddressRepo.save.mockResolvedValue(newAddress);

      const result = await service.create('user-1', createDto);

      expect(result).toEqual(newAddress);
      expect(mockAddressRepo.create).toHaveBeenCalledWith({ ...createDto, user_id: 'user-1' });
      expect(mockAddressRepo.save).toHaveBeenCalledWith(newAddress);
      expect(mockAddressRepo.update).not.toHaveBeenCalled();
    });

    it('should clear existing defaults when creating a default address', async () => {
      const defaultDto = { ...createDto, is_default: true };
      const newAddress = { ...mockAddress, ...defaultDto };
      mockAddressRepo.update.mockResolvedValue({ affected: 1 });
      mockAddressRepo.create.mockReturnValue(newAddress);
      mockAddressRepo.save.mockResolvedValue(newAddress);

      const result = await service.create('user-1', defaultDto);

      expect(result).toEqual(newAddress);
      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        { user_id: 'user-1', is_default: true },
        { is_default: false },
      );
      expect(mockAddressRepo.create).toHaveBeenCalledWith({ ...defaultDto, user_id: 'user-1' });
    });
  });

  describe('update', () => {
    it('should update an existing address owned by the user', async () => {
      const updateDto = { label: 'Novo Label', city: 'Rio de Janeiro' };
      const existingAddress = { ...mockAddress };
      const updatedAddress = { ...mockAddress, ...updateDto };
      mockAddressRepo.findOne.mockResolvedValue(existingAddress);
      mockAddressRepo.save.mockResolvedValue(updatedAddress);

      const result = await service.update('addr-1', 'user-1', updateDto);

      expect(result).toEqual(updatedAddress);
      expect(mockAddressRepo.findOne).toHaveBeenCalledWith({ where: { id: 'addr-1' } });
      expect(mockAddressRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if address does not exist', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', 'user-1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if address belongs to another user', async () => {
      const otherUsersAddress = { ...mockAddress, user_id: 'other-user' };
      mockAddressRepo.findOne.mockResolvedValue(otherUsersAddress);

      await expect(service.update('addr-1', 'user-1', {})).rejects.toThrow(ForbiddenException);
    });

    it('should clear existing defaults when updating address to be default', async () => {
      const updateDto = { is_default: true };
      const existingAddress = { ...mockAddress };
      mockAddressRepo.findOne.mockResolvedValue(existingAddress);
      mockAddressRepo.update.mockResolvedValue({ affected: 1 });
      mockAddressRepo.save.mockResolvedValue({ ...existingAddress, is_default: true });

      await service.update('addr-1', 'user-1', updateDto);

      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        { user_id: 'user-1', is_default: true },
        { is_default: false },
      );
    });
  });

  describe('remove', () => {
    it('should delete an address owned by the user and return success message', async () => {
      mockAddressRepo.findOne.mockResolvedValue({ ...mockAddress });
      mockAddressRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('addr-1', 'user-1');

      expect(result).toEqual({ message: 'Address deleted successfully' });
      expect(mockAddressRepo.remove).toHaveBeenCalledWith({ ...mockAddress });
    });

    it('should throw NotFoundException when trying to delete a non-existent address', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when trying to delete another user address', async () => {
      const otherUsersAddress = { ...mockAddress, user_id: 'other-user' };
      mockAddressRepo.findOne.mockResolvedValue(otherUsersAddress);

      await expect(service.remove('addr-1', 'user-1')).rejects.toThrow(ForbiddenException);
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('setDefault', () => {
    it('should set an address as the default and clear other defaults', async () => {
      const address = { ...mockAddress, is_default: false };
      mockAddressRepo.findOne.mockResolvedValue(address);
      mockAddressRepo.update.mockResolvedValue({ affected: 1 });
      mockAddressRepo.save.mockResolvedValue({ ...address, is_default: true });

      const result = await service.setDefault('addr-1', 'user-1');

      expect(result.is_default).toBe(true);
      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        { user_id: 'user-1', is_default: true },
        { is_default: false },
      );
      expect(mockAddressRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when address does not exist', async () => {
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(service.setDefault('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when address belongs to another user', async () => {
      const otherUsersAddress = { ...mockAddress, user_id: 'different-user' };
      mockAddressRepo.findOne.mockResolvedValue(otherUsersAddress);

      await expect(service.setDefault('addr-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
