import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Terminer le test technique' })
  title: string;

  @ApiPropertyOptional({ example: 'Ajouter la doc Swagger sur tous les endpoints' })
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-01T10:00:00.000Z' })
  due_date?: Date;
}

export class GetTasksQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;

  @ApiPropertyOptional({ example: 'swagger' })
  search?: string;

  @ApiPropertyOptional({ example: true })
  is_done?: boolean | string | number;

  @ApiPropertyOptional({ example: 'created_at' })
  sort?: string;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  order?: 'asc' | 'desc';
}
