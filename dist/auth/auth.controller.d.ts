import { User } from '../users/entities/user.entity.js';
import { AuthResponse, AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './dto/index.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    getProfile(user: User): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: import("../users/index.js").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
}
