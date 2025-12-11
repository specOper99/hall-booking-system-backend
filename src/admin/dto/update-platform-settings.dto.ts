import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdatePlatformSettingsDto {
    @ApiPropertyOptional({ description: 'Platform commission rate (0-100)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    commissionRate?: number;

    @ApiPropertyOptional({ description: 'Enable maintenance mode' })
    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;

    @ApiPropertyOptional({ description: 'Max bookings per user per month' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1000)
    maxBookingsPerUser?: number;
}
