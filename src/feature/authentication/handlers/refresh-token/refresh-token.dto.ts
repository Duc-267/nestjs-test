import {
	IsEmail,
	IsNotEmpty
} from 'class-validator';

export class RefreshTokenDto {
    @IsNotEmpty()
    refreshToken: string;
}
