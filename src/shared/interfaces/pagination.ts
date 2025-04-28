import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max } from 'class-validator';

export class PagingDto {
  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Type(() => Number)
  @Max(100, {
    message: 'The maximum allowed page size is 100',
  })
  pageSize?: number;
}


export class PagingRo {
  @ApiProperty({ type: Number })
  page: number;

  @ApiProperty({ type: Number })
  pageSize: number;

  @ApiProperty({ type: Number })
  total: number;
}
