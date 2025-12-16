import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { VenueStatus } from '../entities/venue.entity.js';
import { CreateVenueDto } from './create-venue.dto.js';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {
    @ApiPropertyOptional({ enum: VenueStatus, description: 'Venue status' })
    @IsOptional()
    @IsEnum(VenueStatus)
    status?: VenueStatus;
}
