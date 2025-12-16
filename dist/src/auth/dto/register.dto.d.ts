import { UserRole } from '../../users/enums/user-role.enum.js';
export declare class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
}
