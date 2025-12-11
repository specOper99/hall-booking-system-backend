import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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
}
