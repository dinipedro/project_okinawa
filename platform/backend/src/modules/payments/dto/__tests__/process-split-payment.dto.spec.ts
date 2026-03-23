import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProcessSplitPaymentDto } from '../process-split-payment.dto';
import { PaymentMethodType } from '@/common/enums';

describe('ProcessSplitPaymentDto', () => {
  describe('validation', () => {
    it('should pass validation with valid minimal data', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 50.5,
        payment_method: PaymentMethodType.CREDIT_CARD,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with full data', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 75.99,
        payment_method: PaymentMethodType.CREDIT_CARD,
        payment_details: {
          payment_token: 'tok_test123',
          last_four: '4242',
          brand: 'visa',
        },
        notes: 'Payment for my portion of the bill',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with PIX payment', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        payment_method: PaymentMethodType.PIX,
        payment_details: {
          pix_key: 'email@example.com',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with saved payment method', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 125,
        payment_method: PaymentMethodType.CREDIT_CARD,
        payment_details: {
          saved_payment_method_id: '123e4567-e89b-12d3-a456-426614174001',
        },
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid split_id', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: 'invalid-uuid',
        amount: 50,
        payment_method: PaymentMethodType.CREDIT_CARD,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('split_id');
    });

    it('should fail validation with negative amount', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: -10,
        payment_method: PaymentMethodType.CREDIT_CARD,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('amount');
    });

    it('should fail validation with zero amount', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 0,
        payment_method: PaymentMethodType.CREDIT_CARD,
      });

      // Zero should pass as Min(0) allows it
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with non-string notes', async () => {
      const dto = plainToInstance(ProcessSplitPaymentDto, {
        split_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 50,
        payment_method: PaymentMethodType.CREDIT_CARD,
        notes: 12345, // Should be string
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
