import { IsString, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  name: string;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(60)
  age: number;

  @ApiPropertyOptional({ example: "5'5\"" })
  @IsOptional()
  @IsString()
  height?: string;

  @ApiPropertyOptional({ example: '55 kg' })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({ example: 'Fair' })
  @IsOptional()
  @IsString()
  complexion?: string;

  @ApiPropertyOptional({ example: 'Single' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'B.Tech Computer Science' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({ example: '10-15 LPA' })
  @IsOptional()
  @IsString()
  income?: string;

  @ApiPropertyOptional({ example: 'Kashyap' })
  @IsOptional()
  @IsString()
  gotra?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  manglik?: boolean;

  @ApiPropertyOptional({ example: 'Looking for a compatible match...' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Nashik' })
  @IsOptional()
  @IsString()
  nativePlace?: string;
}
