import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/shared/enums/user-role.enum';

export class UserRo {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: UserRoleEnum;
}
