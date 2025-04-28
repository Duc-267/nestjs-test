import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { UserRo } from '../../response-objects/user.ro';

export class GetUserProfileQuery {
    constructor(public readonly loggedUserId: string) {}
}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler implements IQueryHandler<GetUserProfileQuery> {
    constructor(@Inject(User.name) private userModel: Model<User>) {}

    async execute(Query: GetUserProfileQuery): Promise<BaseResponse<UserRo>> {
        const { loggedUserId } = Query;

        const user = await this.userModel.findOne({
            _id: loggedUserId,
        });

        if (!user) throw new NotFoundException('User not found!');

        return new OkResponse({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
}
