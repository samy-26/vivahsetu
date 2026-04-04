import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(6)
  password: string;
}
