import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProcessPaymentDto, PaymentMethod } from '../process-payment.dto';

describe('ProcessPaymentDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data using tokenized card', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CREDIT_CARD,
        amount: 150.99,
        tokenized_card: {
          payment_token: 'tok_123456789',
          last_four: '4242',
          brand: 'visa',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid data using saved payment method', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CREDIT_CARD,
        amount: 100,
        saved_payment_method: {
          payment_method_id: '123e4567-e89b-12d3-a456-426614174001',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with PIX payment', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
        amount: 50.5,
        pix_key: 'email@example.com',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with wallet payment', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.WALLET,
        amount: 75,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with cash payment', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CASH,
        amount: 200,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid order_id', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: 'invalid-uuid',
        payment_method: PaymentMethod.CREDIT_CARD,
        amount: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('order_id');
    });

    it('should fail validation with invalid payment_method', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: 'invalid_method',
        amount: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('payment_method');
    });

    it('should fail validation with non-numeric amount', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CREDIT_CARD,
        amount: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amount');
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with invalid saved_payment_method id', async () => {
      const dto = plainToInstance(ProcessPaymentDto, {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CREDIT_CARD,
        amount: 100,
        saved_payment_method: {
          payment_method_id: 'invalid-uuid',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('PaymentMethod enum', () => {
    it('should have all expected payment methods', () => {
      expect(PaymentMethod.CREDIT_CARD).toBe('credit_card');
      expect(PaymentMethod.DEBIT_CARD).toBe('debit_card');
      expect(PaymentMethod.PIX).toBe('pix');
      expect(PaymentMethod.WALLET).toBe('wallet');
      expect(PaymentMethod.CASH).toBe('cash');
    });
  });
});
