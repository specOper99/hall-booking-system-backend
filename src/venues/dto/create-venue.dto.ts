import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CreateVenueDto {
    @ApiProperty({ example: 'Grand Convention Center' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiPropertyOptional({ example: 'A beautiful venue for events' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Mosul, Iraq' })
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];
}
