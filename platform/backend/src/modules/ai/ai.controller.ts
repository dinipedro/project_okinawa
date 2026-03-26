import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';
import { AuditLogService } from '@/modules/auth/services/audit-log.service';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('sentiment/:reviewId')
  @ApiOperation({ summary: 'Analyze sentiment of a specific review' })
  analyzeSentiment(@Param('reviewId') reviewId: string) {
    return this.aiService.analyzeSentiment(reviewId);
  }

  @Get('sentiment/restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Batch analyze sentiments for restaurant' })
  batchAnalyzeSentiments(@Param('restaurantId') restaurantId: string) {
    return this.aiService.batchAnalyzeSentiments(restaurantId);
  }

  @Get('recommendations/menu')
  @ApiOperation({ summary: 'Get personalized menu recommendations for user' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  getMenuRecommendations(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.aiService.getMenuRecommendations(user.id, restaurantId);
  }

  @Get('churn/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Predict customer churn risk' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  predictChurnRisk(
    @Param('userId') userId: string,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.aiService.predictChurnRisk(userId, restaurantId);
  }

  @Get('forecast/demand')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Forecast demand for next N days' })
  @ApiQuery({ name: 'restaurant_id', required: true, type: String })
  @ApiQuery({ name: 'days', required: false, type: Number })
  forecastDemand(
    @Query('restaurant_id') restaurantId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.aiService.forecastDemand(restaurantId, days);
  }

  @Get('menu-analysis/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Analyze menu performance and get suggestions' })
  analyzeMenuPerformance(@Param('restaurantId') restaurantId: string) {
    return this.aiService.analyzeMenuPerformance(restaurantId);
  }

  @Get('insights/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get business insights and recommendations for restaurant',
  })
  getBusinessInsights(@Param('restaurantId') restaurantId: string) {
    return this.aiService.getBusinessInsights(restaurantId);
  }

  // ========== LGPD Art. 20 — Right to review automated decisions ==========

  @Post('decisions/:decisionId/review-request')
  @ApiOperation({
    summary: 'Request human review of an automated AI decision (LGPD Art. 20)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: {
          type: 'string',
          description: 'Why the user is requesting a review of this decision',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Review request acknowledged',
  })
  async requestDecisionReview(
    @Param('decisionId') decisionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { reason: string },
    @Req() req: Request,
  ) {
    // Create an audit log entry for the review request
    await this.auditLogService.log({
      userId: user.sub,
      action: 'DECISION_REVIEW_REQUESTED',
      entityType: 'ai_decision',
      entityId: decisionId,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      metadata: {
        reason: body.reason,
        decision_id: decisionId,
        requested_at: new Date().toISOString(),
      },
      success: true,
    });

    // LGPD Art. 20: The controller must provide a response within 15 days
    const reviewDeadline = new Date();
    reviewDeadline.setDate(reviewDeadline.getDate() + 15);

    return {
      status: 'review_requested',
      decision_id: decisionId,
      message:
        'Your request to review this automated decision has been received. ' +
        'A human reviewer will analyze it within 15 business days as required by LGPD Art. 20.',
      review_deadline: reviewDeadline.toISOString(),
      reference_number: `REV-${Date.now()}-${decisionId.slice(0, 8)}`,
    };
  }
}
