import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum.js';

export class UpdateUserDto {
    @ApiPropertyOptional({ description: 'User display name' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ enum: UserRole, description: 'User role' })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: 'Whether user is active (not banned)' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
