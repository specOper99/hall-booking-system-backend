import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateHallDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    venueId!: string;

    @ApiProperty({ example: 'Main Hall' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiProperty({ example: 100 })
    @IsInt()
    @Min(1)
    capacity!: number;

    @ApiProperty({ example: 50.0 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    pricePerHour!: number;

    @ApiPropertyOptional({
        example: { wifi: true, projector: true, soundSystem: true },
    })
    @IsObject()
    @IsOptional()
    amenities?: Record<string, unknown>;
}
