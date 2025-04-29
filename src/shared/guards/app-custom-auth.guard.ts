import { TokenExpiredError } from 'jsonwebtoken';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/data/schema/user.schema';
import { UserAttachment } from 'src/shared/interfaces/user-attachment';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { AuthSessionStatusEnum } from '../enums/auth-section-status.enum';
import { AuthenticationService } from 'src/feature/authentication/services/authentication.service';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  id: string;
}

@Injectable()
export class AppCustomAuthGuard implements CanActivate {
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
    private readonly authenticationService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization
      ? (request.headers.authorization as string).split(' ')
      : null;

    if (!token || !token[1]) {
      throw new UnauthorizedException();
    }
    let session: AuthSession | null = null;
    try {
      session = await this.authSessionModel
      .findOne({
        accessToken: token[1],
      })
      .populate('user');
      if (!session || session.status === AuthSessionStatusEnum.REVOKED) {
        throw new UnauthorizedException('Session not found');
      }
      await this.jwtService.verifyAsync(token[1], {
        secret: session.user.password,
      });
    } catch (e) {
      const refreshToken = request.headers.refreshtoken;
      if (!(e instanceof TokenExpiredError) || !refreshToken || !session ){
        throw new UnauthorizedException('Token invalid');
      }

      try {
        await this.jwtService.verifyAsync(refreshToken, { secret: this.configService.get('REFRESH_TOKEN_SECRET') });
      } catch (e) {
        throw new UnauthorizedException('Refresh Token invalid');
      }

      const authTokenNew = this.authenticationService.generateNewToken(
        session.user,
      );
      await this.authSessionModel.updateOne(
        {
          accessToken: authTokenNew.token,
        },
        { where: { _id: session._id } },
      );
      request.headers.newToken = authTokenNew.token;
    }

    request.user = AppCustomAuthGuard.getUserAttachment(session.user);
    return true;
  }

  private static getUserAttachment(user: User): UserAttachment {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
