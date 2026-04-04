import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertKundliDto {
  @ApiProperty({ example: '1998-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: '06:30 AM' })
  @IsOptional()
  @IsString()
  birthTime?: string;

  @ApiPropertyOptional({ example: 'Pune, Maharashtra' })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({ example: 'Vrishabha' })
  @IsOptional()
  @IsString()
  rashi?: string;

  @ApiPropertyOptional({ example: 'Rohini' })
  @IsOptional()
  @IsString()
  nakshatra?: string;
}
