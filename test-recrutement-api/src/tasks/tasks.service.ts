import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, GetTasksQueryDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskListResponse, TaskResponse } from './interfaces/tasks.interface';



@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  /**
   * Lister les tâches avec pagination, filtres et recherche
   */
  async findAll(
    userId: string,
    query: GetTasksQueryDto,
  ): Promise<TaskListResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || 'created_at';
    const order = query.order || 'desc';

    // Construire le query builder
    let qb = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId });

    // Appliquer la recherche
    if (query.search) {
      qb = qb.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Appliquer le filtre is_done
    if (query.is_done !== undefined && query.is_done !== null && query.is_done !== '') {
      const isDoneValue =
        query.is_done === true ||
        query.is_done === 'true' ||
        query.is_done === 1 ||
        query.is_done === '1';
      qb = qb.andWhere('task.is_done = :is_done', { is_done: isDoneValue });
    }

    // Appliquer le tri
    qb = qb.orderBy(`task.${sort}`, order.toUpperCase() as 'ASC' | 'DESC');

    // Récupérer le total et les données
    const [tasks, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: tasks.map((task) => this.formatTaskResponse(task)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Créer une nouvelle tâche
   */
  async create(userId: string, createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    if (!createTaskDto.title || !createTaskDto.title.trim()) {
      throw new BadRequestException('Le titre est requis');
    }

    const task = this.tasksRepository.create({
      user_id: userId,
      title: createTaskDto.title.trim(),
      description: createTaskDto.description,
      due_date: createTaskDto.due_date,
      is_done: false,
    });

    await this.tasksRepository.save(task);

    return this.formatTaskResponse(task);
  }

  /**
   * Modifier le statut (fait / non fait)
   */
  async update(
    taskId: string,
    userId: string,
    updateData: UpdateTaskDto,
  ): Promise<TaskResponse> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, user_id: userId },
    });

    if (!task) {
      throw new NotFoundException('Tâche non trouvée');
    }

    Object.assign(task, updateData);
    await this.tasksRepository.save(task);

    return this.formatTaskResponse(task);
  }

  /**
   * Supprimer une tâche
   */
  async delete(taskId: string, userId: string): Promise<{ deleted: boolean }> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, user_id: userId },
    });

    if (!task) {
      throw new NotFoundException('Tâche non trouvée');
    }

    await this.tasksRepository.remove(task);
    return { deleted: true };
  }

  // ============================================================================
  // Private methods
  // ============================================================================

  private formatTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description,
      is_done: task.is_done,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}
