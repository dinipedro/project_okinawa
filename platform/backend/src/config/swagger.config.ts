import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Okinawa API')
  .setDescription('Restaurant Technology Platform - Complete API Documentation')
  .setVersion('1.0')
  .setContact('Okinawa Team', 'https://okinawa.com', 'contact@okinawa.com')
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  // Primary JWT Bearer Authentication
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT access token',
      in: 'header',
    },
    'access-token',
  )
  // API Key Authentication (for webhooks and external integrations)
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
      description: 'API key for webhook and integration endpoints',
    },
    'api-key',
  )
  // OAuth2 Configuration (for future social login integration)
  .addOAuth2(
    {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: '/api/v1/auth/oauth/authorize',
          tokenUrl: '/api/v1/auth/oauth/token',
          scopes: {
            'read:profile': 'Read user profile',
            'write:profile': 'Update user profile',
            'read:orders': 'Read orders',
            'write:orders': 'Create and update orders',
            'read:restaurants': 'Read restaurant data',
            'write:restaurants': 'Manage restaurants (owners only)',
          },
        },
      },
    },
    'oauth2',
  )
  .addTag('auth', 'Authentication & Authorization')
  .addTag('users', 'User management')
  .addTag('restaurants', 'Restaurant management')
  .addTag('orders', 'Order management & processing')
  .addTag('reservations', 'Reservation management')
  .addTag('payments', 'Payment processing & wallet')
  .addTag('menu-items', 'Menu item management')
  .addTag('tables', 'Table management & floor plan')
  .addTag('reviews', 'Customer reviews & ratings')
  .addTag('loyalty', 'Loyalty program')
  .addTag('tips', 'Tips & gratuity management')
  .addTag('notifications', 'Push & in-app notifications')
  .addTag('webhooks', 'External webhooks')
  .addTag('analytics', 'Analytics & reports')
  .addTag('ai', 'AI-powered features')
  .addTag('hr', 'Human resources & staff management')
  .addTag('financial', 'Financial management & reporting')
  .build();
