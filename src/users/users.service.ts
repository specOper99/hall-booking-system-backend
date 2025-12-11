import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UsersService implements OnModuleInit {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit(): Promise<void> {
        await this.seedSuperadmin();
    }

    private async seedSuperadmin(): Promise<void> {
        const existingSuperadmin = await this.findByRole(UserRole.SUPERADMIN);

        if (existingSuperadmin) {
            this.logger.log('Superadmin already exists, skipping seed');
            return;
        }

        const email = this.configService.get<string>('SUPERADMIN_EMAIL', 'admin@hallhub.com');
        const password = this.configService.get<string>('SUPERADMIN_PASSWORD', 'Admin@123456');
        const fullName = this.configService.get<string>('SUPERADMIN_NAME', 'Super Admin');

        try {
            const superadmin = await this.create({
                email,
                password,
                fullName,
                role: UserRole.SUPERADMIN,
                isActive: true,
            });

            this.logger.log(`✅ Superadmin created successfully with email: ${superadmin.email}`);
        } catch (error) {
            this.logger.error('Failed to create superadmin:', error);
        }
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByRole(role: UserRole): Promise<User | null> {
        return this.userRepository.findOne({ where: { role } });
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
}
