import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity.js';
import { Hall } from '../halls/entities/hall.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Venue } from '../venues/entities/venue.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([User, Venue, Hall, Booking])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
