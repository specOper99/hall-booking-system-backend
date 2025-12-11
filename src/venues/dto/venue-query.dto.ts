import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class VenueQueryDto {
    @ApiPropertyOptional({ example: 'Mosul', description: 'Filter by city name' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    offset?: number = 0;
}
