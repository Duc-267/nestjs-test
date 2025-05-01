import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AuthRo } from '../response-objects/auth.ro';
import { User } from 'src/data/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { QueueNameEnum } from 'src/shared/enums/queue.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface AuthToken {
    token: string;
    refreshToken: string;
}

export interface AccessToken {
    token: string;
}

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly jwtService: JwtService, 
        private readonly configService: ConfigService,
    ) {}

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

    async generateTokenAndRefreshToken(user: User): Promise<AuthToken> {
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
        // const redisKey = `refresh_token:${user._id}`;
        // const ttl = 60 * 60 * 24 * 7; // 1 week
    
        // await this.redis.set(redisKey, refreshToken, 'EX', ttl);
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
