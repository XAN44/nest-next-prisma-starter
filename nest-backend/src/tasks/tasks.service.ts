import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly db: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    return this.db.task.create({ data: createTaskDto });
  }

  findAll() {
    return this.db.task.findMany();
  }

  async findOne(id: number) {
    const task = await this.db.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);
    return this.db.task.update({ where: { id }, data: updateTaskDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db.task.delete({ where: { id } });
  }
}
