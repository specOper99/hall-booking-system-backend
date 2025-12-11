import { UserRole } from '../enums/user-role.enum.js';
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
