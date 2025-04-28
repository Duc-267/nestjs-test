import { ApiResponseProperty } from '@nestjs/swagger';
import { JwtRo } from './jwt.ro';
import { UserRo } from './user.ro';

export class AuthRo {
  jwt: JwtRo;
  user: UserRo;
}
