import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '@/modules/users/entities/profile.entity';
import { TokenBlacklistService } from '@/modules/identity';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let profileRepository: any;
  let tokenBlacklistService: any;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
  };

  const mockTokenBlacklistService = {
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepository },
        { provide: TokenBlacklistService, useValue: mockTokenBlacklistService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    profileRepository = module.get(getRepositoryToken(Profile));
    tokenBlacklistService = module.get(TokenBlacklistService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user when user exists and is active', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      is_active: true,
      roles: [{ role: 'client' }],
    };
    mockProfileRepository.findOne.mockResolvedValue(mockUser);
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

    const payload = { sub: 'user-1', jti: 'test-jti-123' };
    const result = await strategy.validate(payload);

    expect(result).toEqual(mockUser);
    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: ['id', 'email', 'full_name', 'avatar_url', 'phone', 'is_active', 'marketing_consent'],
      relations: ['roles'],
    });
    expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith('test-jti-123');
  });

  it('should throw UnauthorizedException when user not found', async () => {
    mockProfileRepository.findOne.mockResolvedValue(null);
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

    const payload = { sub: 'user-1', jti: 'test-jti-123' };
    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('User not found or inactive'),
    );
  });

  it('should throw UnauthorizedException when user is inactive', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      is_active: false,
      roles: [],
    };
    mockProfileRepository.findOne.mockResolvedValue(mockUser);
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);

    const payload = { sub: 'user-1', jti: 'test-jti-123' };
    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('User not found or inactive'),
    );
  });

  it('should throw UnauthorizedException when token is blacklisted', async () => {
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

    const payload = { sub: 'user-1', jti: 'blacklisted-jti' };
    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('Token has been revoked'),
    );
  });

  it('should throw UnauthorizedException when token has no JTI', async () => {
    const payload = { sub: 'user-1' }; // No jti claim
    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('Invalid token format'),
    );
  });
});
