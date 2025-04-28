import { PipeTransform, ArgumentMetadata, BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {

    async transform(value, metadata: ArgumentMetadata) {
        if (!value) {
            throw new BadRequestException('No data submitted');
        }

        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            throw new HttpException({
                message: 'Input data validation failed',
                errors: this.buildError(errors),
            }, HttpStatus.BAD_REQUEST);
        }
        return value;
    }

    private buildError(errors) {
        try {
            const result = [];
            this.pushResultError(errors, result);
            return result;
        } catch (e) {
        }
        return [];
    }

    private toValidate(metatype): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.find((type) => metatype === type);
    }

    private pushResultError(errors: any[], result: any[], propPath = '') {
        for (const error of errors) {
            const prop = propPath ? `${propPath}.${error.property}` : error.property;
            if (error.children.length > 0) {
                this.pushResultError(
                    error.children, 
                    result, 
                    prop
                );
            } else {
                result.push(...Object.entries(error.constraints).map(constraint => {
                    return {
                        prop: prop,
                        message: `${constraint[1]}`,
                    };
                }));
            }
        }
    }
}
