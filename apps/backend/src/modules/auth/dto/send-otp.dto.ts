import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  target: string;

  @ApiProperty({ enum: ['email', 'phone'], example: 'email' })
  @IsEnum(['email', 'phone'])
  type: 'email' | 'phone';
}
