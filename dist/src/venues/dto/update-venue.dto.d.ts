import { VenueStatus } from '../entities/venue.entity.js';
import { CreateVenueDto } from './create-venue.dto.js';
declare const UpdateVenueDto_base: import("@nestjs/common").Type<Partial<CreateVenueDto>>;
export declare class UpdateVenueDto extends UpdateVenueDto_base {
    status?: VenueStatus;
}
export {};
