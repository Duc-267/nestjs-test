import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
    logger = new Logger(CustomHttpExceptionFilter.name);
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof HttpException) {
            // throw error for http exception
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const errors = exceptionResponse.hasOwnProperty('errors') ? exceptionResponse['errors'] : null;

            response.status(status).json({
                statusCode: status,
                success: false,
                message: exception.message,
                errors: errors || exception['response']?.message || null,
                path: request.url,
            });
        } else {
            this.logger.error(exception + '');

            const dataError = exception?.['response'];
            const status = dataError?.['status'] || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = dataError?.['data']?.['error'] || dataError?.['message'] || exception + '';
            const errors = (dataError?.['data']?.['message'] as any[])?.map((item) => ({ message: item })) || null;

            response.status(status).json({
                statusCode: status,
                success: false,
                message,
                errors,
                path: request.url,
            });
        }
    }
}
