import { IsString, IsNumber, IsNotEmpty, Min, Matches } from 'class-validator';

export class PaymentDto {
  @IsString()
  @Matches(/^2547\d{8}$/)
  msisdn: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  businessShortCode: string;
}
