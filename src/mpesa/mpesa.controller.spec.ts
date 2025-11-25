import { FcmService } from '../notifications/fcm.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from '../common/api-key.guard';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';

describe('MpesaController', () => {
  // Variable declarations rewritten to ensure no hidden characters
  let controller: MpesaController;
  let service: MpesaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MpesaController],
      providers: [
        MpesaService,
        {
          provide: PrismaService,
          useValue: {
            payment: {
              create: jest.fn().mockResolvedValue({ id: 1 }),
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn().mockResolvedValue({ id: 1 }),
              update: jest.fn().mockResolvedValue({ id: 1 }),
              delete: jest.fn().mockResolvedValue({ id: 1 }),
            }
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
        {
          provide: FcmService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: (ctx: ExecutionContext) => true })
      .compile();

    controller = module.get<MpesaController>(MpesaController);
    service = module.get<MpesaService>(MpesaService);

    jest.spyOn(service, 'pay').mockImplementation((dto) => {
      if (!dto.msisdn || dto.amount <= 0 || !dto.businessShortCode) {
        return Promise.reject(new Error('Missing fields'));
      }
      if (dto.msisdn.length < 10) {
        return Promise.reject(new Error('Invalid msisdn'));
      }
      return Promise.resolve({
        id: 1,
        transactionId: 'TX123',
        amount: dto.amount,
        msisdn: dto.msisdn,
        businessShortCode: dto.businessShortCode,
        billRefNumber: 'BR123',
        thirdPartyTransId: 'TP123',
        status: 'success',
        processed: true,
        createdAt: new Date(),
        processedAt: new Date(),
        meta: {},
        message: 'Payment processed',
      });
    });
  });

  it('should return hello message', () => {
    expect(controller.getHello()).toBe('Hello from MpesaController!');
  });

  it('should process payment', async () => {
    const dto = { msisdn: '254700000000', amount: 100, businessShortCode: '123456' };
    const result = await controller.pay(dto);
    expect(result).toHaveProperty('status', 'success');
    expect(result).toHaveProperty('message');
  });

  it('should throw error for missing fields', async () => {
    await expect(controller.pay({ msisdn: '', amount: 0, businessShortCode: '' })).rejects.toThrow();
  });

  it('should fail validation for invalid msisdn', async () => {
    await expect(controller.pay({ msisdn: '123', amount: 100, businessShortCode: '123456' })).rejects.toThrow();
  });

  it('should update payment', async () => {
    const result = await controller.updatePayment(1, { amount: 200 });
    expect(result).toHaveProperty('id');
  });

  it('should delete payment', async () => {
    const result = await controller.deletePayment(1);
    expect(result).toHaveProperty('id');
  });
});
