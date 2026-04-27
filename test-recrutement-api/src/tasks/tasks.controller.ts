import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, GetTasksQueryDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../shared/guards/auth.guard';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Lister les tâches (pagination, filtres, recherche)
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les tâches (pagination/filtres/recherche)' })
  @ApiResponse({ status: 200, description: 'Liste des tâches récupérée' })
  async getTasks(
    @CurrentUser('id') userId: string,
    @Query() query: GetTasksQueryDto,
  ) {
    return this.tasksService.findAll(userId, query);
  }

  /**
   * Créer une nouvelle tâche
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle tâche' })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès' })
  async createTask(
    @CurrentUser('id') userId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(userId, createTaskDto);
  }

  /**
   * Modifier une tâche
   */
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour' })
  async updateTask(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
    @Body() updateData: UpdateTaskDto,
  ) {
    return this.tasksService.update(taskId, userId, updateData);
  }

  /**
   * Supprimer une tâche
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche supprimée' })
  async deleteTask(
    @Param('id') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tasksService.delete(taskId, userId);
  }
}
