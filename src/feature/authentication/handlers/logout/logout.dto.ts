import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class LogoutDto {
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    tokens: string[];
}
