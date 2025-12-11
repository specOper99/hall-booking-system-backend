import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesModule } from '../venues/venues.module.js';
import { Hall } from './entities/hall.entity.js';
import { HallsController } from './halls.controller.js';
import { HallsService } from './halls.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Hall]), VenuesModule],
    controllers: [HallsController],
    providers: [HallsService],
    exports: [HallsService],
})
export class HallsModule { }
