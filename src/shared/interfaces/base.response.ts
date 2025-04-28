import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    data?: T | T[];

    @ApiProperty()
    message?: string;

    @ApiProperty()
    statusCode: number;
}
