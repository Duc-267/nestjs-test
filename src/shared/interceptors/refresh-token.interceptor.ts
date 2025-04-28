import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(data => {
        const request = context.switchToHttp().getRequest();
        if (request.headers.newToken && request.headers.newRefreshToken) {
          data = {
            jwt: {
              token: request.headers.newToken,
              refreshToken: request.headers.newRefreshToken,
            },
            ...data,
          };
        }
        return data;
      }));
  }
}
