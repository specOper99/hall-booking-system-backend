import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
    data: T;
    statusCode: number;
    timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, SuccessResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<SuccessResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data) => ({
                data,
                statusCode,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}
