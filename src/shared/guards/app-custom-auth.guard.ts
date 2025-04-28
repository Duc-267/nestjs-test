import { TokenExpiredError } from 'jsonwebtoken';
import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/data/schema/user.schema';
import { UserAttachment } from 'src/shared/interfaces/user-attachment';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { AuthSessionStatusEnum } from '../enums/auth-section-status.enum';
import { AuthenticationService } from 'src/feature/authentication/services/authentication.service';

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
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization ? (request.headers.authorization as string).split(' ') : null;

        if (!token || !token[1]) {
            throw new UnauthorizedException();
        }
        let user: User | null = null;
        try {
            const jwtPayload = this.jwtService.decode(token[1]) as JwtPayload;
            //TODO: Fix relationship between user and auth session
            const session:any = await this.authSessionModel.findOne({
                accessToken: token[1]
            }).populate('userId', {
                password: 1,
                email: 1,
                role: 1,
            }); 
            user = this.userModel.findById(session.userId) as User;
            if (!session || session.status === AuthSessionStatusEnum.REVOKED) {
                return false;
            }
        } catch (e) {
            const refreshToken = request.headers.refreshtoken;
            if (!(e instanceof TokenExpiredError) || !refreshToken || !user)
                throw new UnauthorizedException('Token invalid');

            try {
                await this.jwtService.verifyAsync(refreshToken, { secret: token[1] });
            } catch (e) {
                throw new UnauthorizedException('Refresh Token invalid');
            }

            const authTokenNew = this.authenticationService.generateTokenAndRefreshToken(user);

            // await user.save();

            request.headers.newToken = authTokenNew.token;
            request.headers.newRefreshToken = authTokenNew.refreshToken;
        }

        request.user = AppCustomAuthGuard.getUserAttachment(user);
        return true;
    }

    private static getUserAttachment(user: User): UserAttachment {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        } as UserAttachment;
    }
}
