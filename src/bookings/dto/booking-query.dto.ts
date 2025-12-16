import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum.js';

export class BookingQueryDto {
    @ApiPropertyOptional({ description: 'Filter by venue ID' })
    @IsOptional()
    @IsUUID()
    venueId?: string;

    @ApiPropertyOptional({ description: 'Filter by hall ID' })
    @IsOptional()
    @IsUUID()
    hallId?: string;

    @ApiPropertyOptional({ enum: BookingStatus, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
