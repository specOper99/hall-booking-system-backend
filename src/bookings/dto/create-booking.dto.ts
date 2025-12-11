import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsUUID,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsAfterNow', async: false })
export class IsAfterNowConstraint implements ValidatorConstraintInterface {
    validate(date: string): boolean {
        return new Date(date) > new Date();
    }

    defaultMessage(): string {
        return 'startTime must be in the future';
    }
}

@ValidatorConstraint({ name: 'IsAfterStart', async: false })
export class IsAfterStartConstraint implements ValidatorConstraintInterface {
    validate(endTime: string, args: ValidationArguments): boolean {
        const object = args.object as { startTime?: string };
        if (!object.startTime) return true;
        return new Date(endTime) > new Date(object.startTime);
    }

    defaultMessage(): string {
        return 'endTime must be after startTime';
    }
}

export class CreateBookingDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    @IsUUID()
    @IsNotEmpty()
    hallId!: string;

    @ApiProperty({ example: '2025-12-15T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    @Validate(IsAfterNowConstraint)
    startTime!: string;

    @ApiProperty({ example: '2025-12-15T12:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    @Validate(IsAfterStartConstraint)
    endTime!: string;
}
