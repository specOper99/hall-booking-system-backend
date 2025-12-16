import { UserRole } from '../../users/enums/user-role.enum.js';
export declare class UpdateUserDto {
    name?: string;
    role?: UserRole;
    isActive?: boolean;
}
