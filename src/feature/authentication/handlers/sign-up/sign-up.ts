import { NotFoundException, Inject, ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuthenticationService } from '../../services/authentication.service';
import { SignUpDto } from './sign-up.dto';
import { RegisterRo } from '../../response-objects/register.ro';
import { BaseResponse } from 'src/shared/interfaces/base.response';

export class SignUpCommand {
  constructor(public readonly dto: SignUpDto) {}
}

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: SignUpCommand): Promise<BaseResponse<RegisterRo>> {
    const { email = '', password } = command.dto;

    const existingUser = await this.userModel.find({ email });
    if (existingUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    const newUser = new this.userModel({
      email,
      password,
    });

    await newUser.save();
    return new OkResponse({
      user: {
        id: newUser._id as string,
        email: newUser.email,
        role: newUser.role,
      },
    });
  }
}
