import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: Prisma.EmployeesCreateInput) {
    return this.databaseService.employees.create({
      data: createEmployeeDto,
    });
  }

  async findAll(role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    if (role)
      return this.databaseService.employees.findMany({
        where: {
          role,
        },
      });
    return this.databaseService.employees.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.employees.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.databaseService.employees.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: string, updateEmployeeDto: Prisma.EmployeesUpdateInput) {
    return this.databaseService.employees.update({
      where: {
        id,
      },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.employees.delete({
      where: {
        id,
      },
    });
  }
}
