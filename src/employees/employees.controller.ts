import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';

import { Prisma, Role } from '@prisma/client';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

interface EmployeeProfile {
  name: string;
  email: string;
  role: string;
}
interface AuthRequest extends Request {
  user: { userId: string };
}

@SkipThrottle() // applies most of the methods.
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  private readonly logger = new MyLoggerService(EmployeesController.name);

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthRequest): Promise<EmployeeProfile> {
    console.log(req);
    const userId = req.user.userId;
    const employee = await this.employeesService.findOne(userId);

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${userId} not found`);
    }

    // return {
    //   name: employee.name,
    //   email: employee.email,
    //   role: employee.role,
    // };
    return employee;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() body: { name: string; email: string; password?: string },
  ) {
    const userId = req.user.userId;
    const updatedData: Prisma.EmployeesUpdateInput = {
      name: body.name,
      email: body.email,
    };
    if (body.password && body.password.trim() !== '') {
      updatedData.password = await bcrypt.hash(body.password, 10);
    }
    return this.employeesService.update(userId, updatedData);
  }

  @Post()
  create(@Body() createEmployeeDto: Prisma.EmployeesCreateInput) {
    return this.employeesService.create(createEmployeeDto);
  }

  @SkipThrottle({ default: false }) // allows rate limit for this requests
  @Get()
  findAll(@Ip() ip: string, @Query('role') role?: Role) {
    this.logger.log(
      `Request for All Employees\t${ip}`,
      EmployeesController.name,
    );
    return this.employeesService.findAll(role);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } }) //over-ride the short throttle in app.module.ts
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get(':email')
  findOneByEmail(@Param('email') email: string) {
    return this.employeesService.findOne(email);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: Prisma.EmployeesUpdateInput,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
