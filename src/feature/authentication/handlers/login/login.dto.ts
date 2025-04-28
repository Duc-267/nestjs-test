import {
	IsEmail,
	IsNotEmpty,
    IsOptional
} from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    deviceInfo?: string;

    @IsOptional()
    ipAddress?: string;
}
