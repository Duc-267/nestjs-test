import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ExtractRequestInformationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ipAddress =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const deviceInfo = request.headers['user-agent'];

    if (ipAddress) {
      request.body.ipAddress = ipAddress;
    }
    if (deviceInfo) {
      request.body.deviceInfo = deviceInfo;
    }
    return next.handle();
  }
}
