import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
    };
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    validateUser(email: string, password: string): Promise<User>;
    private generateToken;
}
