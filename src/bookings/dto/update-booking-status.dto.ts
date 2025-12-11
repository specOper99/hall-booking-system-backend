import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingStatus } from '../enums/booking-status.enum.js';

export class UpdateBookingStatusDto {
    @ApiProperty({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
    @IsEnum(BookingStatus)
    @IsNotEmpty()
    status!: BookingStatus;
}
