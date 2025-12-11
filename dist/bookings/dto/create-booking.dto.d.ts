import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class IsAfterNowConstraint implements ValidatorConstraintInterface {
    validate(date: string): boolean;
    defaultMessage(): string;
}
export declare class IsAfterStartConstraint implements ValidatorConstraintInterface {
    validate(endTime: string, args: ValidationArguments): boolean;
    defaultMessage(): string;
}
export declare class CreateBookingDto {
    hallId: string;
    startTime: string;
    endTime: string;
}
