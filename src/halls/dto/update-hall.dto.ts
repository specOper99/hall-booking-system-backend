import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHallDto } from './create-hall.dto.js';

export class UpdateHallDto extends PartialType(
    OmitType(CreateHallDto, ['venueId'] as const),
) { }
