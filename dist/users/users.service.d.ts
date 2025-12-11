import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { UserRole } from './enums/user-role.enum.js';
export declare class UsersService implements OnModuleInit {
    private readonly userRepository;
    private readonly configService;
    private readonly logger;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private seedSuperadmin;
    create(userData: Partial<User>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByRole(role: UserRole): Promise<User | null>;
    findAll(): Promise<User[]>;
}
