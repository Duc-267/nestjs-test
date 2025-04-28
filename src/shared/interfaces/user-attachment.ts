import { UserRoleEnum } from "../enums/user-role.enum"

export interface UserAttachment {
  id: string,
  email: string
  role: UserRoleEnum
}