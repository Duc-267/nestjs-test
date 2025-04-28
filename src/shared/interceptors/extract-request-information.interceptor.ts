import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { globalValue } from '../global-settings';

@Injectable()
export class ExtractRequestInformationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ipAddress =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const deviceInfo = request.headers['user-agent'];

    if (ipAddress && deviceInfo) {
      globalValue.ipAddress = ipAddress;
      globalValue.deviceInfo = deviceInfo
    }   
    return next.handle();
  }
}
