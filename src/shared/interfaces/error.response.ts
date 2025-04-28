import { BaseResponse } from './base.response';

export class ErrorResponse implements BaseResponse<any> {
  constructor(message: string) {
    this.message = message;
  }
  success = false;
  statusCode = 400;
  message: string;
}
