import { ApiProperty } from '@nestjs/swagger';
import { UserRo } from './user.ro';
import { PagingRo } from 'src/shared/interfaces/pagination';

export class UserListRo extends PagingRo {
    @ApiProperty({ type: [UserRo] })
    items: UserRo[];
}
