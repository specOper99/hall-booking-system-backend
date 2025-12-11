import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { HallsModule } from './halls/halls.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { UsersModule } from './users/users.module.js';
import { VenuesModule } from './venues/venues.module.js';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // Support DATABASE_URL for production (Railway, Render, etc.)
        if (databaseUrl) {
          // Allow DB_SYNC=true for initial schema creation, then set to false
          const shouldSync = configService.get<string>('DB_SYNC', 'false') === 'true';
          if (shouldSync) {
            console.log('⚠️ DB_SYNC is enabled - schema will be synchronized. Disable after initial setup!');
          }
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: shouldSync,
            ssl: { rejectUnauthorized: false },
          };
        }

        // Development configuration
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'hallhub'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),

    // Feature Modules
    UsersModule,
    AuthModule,
    VenuesModule,
    HallsModule,
    BookingsModule,
    UploadsModule,
    DashboardModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }




