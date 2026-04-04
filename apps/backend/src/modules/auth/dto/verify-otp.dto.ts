import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  target: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}
