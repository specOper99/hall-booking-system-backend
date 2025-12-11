import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { Venue } from '../venues/entities/venue.entity.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { PlatformSettings } from './entities/platform-settings.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([User, Venue, PlatformSettings])],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
