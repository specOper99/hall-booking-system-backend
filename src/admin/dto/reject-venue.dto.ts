import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectVenueDto {
    @ApiPropertyOptional({ description: 'Reason for rejection' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
