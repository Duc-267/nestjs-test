import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AuthRo } from '../response-objects/auth.ro';
import { User } from 'src/data/schema/user.schema';
import { ConfigService } from '@nestjs/config';

export interface AuthToken {
    token: string;
    refreshToken: string;
}

export interface AccessToken {
    token: string;
}

@Injectable()
export class AuthenticationService {
    constructor(@Inject(User.name) private userModel: Model<User>, private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

    generateNewToken(user: User): AccessToken {
        const token = this.jwtService.sign(
            { id: user._id, email: user.email },
            {
                secret: user.password,
                expiresIn: Number(this.configService.get('TOKEN_EXPIRED')),
            },
        );

        return { token };
    }

    generateTokenAndRefreshToken(user: User): AuthToken {
        const token = this.jwtService.sign(
            { id: user._id, email: user.email },
            {
                secret: user.password,
                expiresIn: Number(this.configService.get('TOKEN_EXPIRED')),
            },
        );
        const refreshToken = this.jwtService.sign(
            { id: user._id, email: user.email },
            {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                expiresIn: Number(this.configService.get('REFRESH_TOKEN_EXPIRED')),
            },
        );

        return { token, refreshToken };
    }

    mappingToResponseAuthRo(user: User, authToken: AuthToken): AuthRo {
        return {
            jwt: { token: authToken.token, refreshToken: authToken.refreshToken },
            user: {
                id: user._id as string,
                email: user.email,
                role: user.role,
            },
        };
    }
}
