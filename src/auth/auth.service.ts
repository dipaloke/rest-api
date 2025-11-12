import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(validateEmployeeDto: Prisma.EmployeesCreateInput) {
    const existing = await this.databaseService.employees.findUnique({
      where: { email: validateEmployeeDto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword: string = await bcrypt.hash(
      validateEmployeeDto.password,
      10,
    );
    const role = validateEmployeeDto.role || 'INTERN';

    const employee = await this.databaseService.employees.create({
      data: {
        name: validateEmployeeDto.name,
        email: validateEmployeeDto.email,
        password: hashedPassword,
        role: role,
      },
    });
    return { message: 'Registration successful', employeeId: employee.id };
  }

  async login(email: string, password: string) {
    const employee = await this.databaseService.employees.findUnique({
      where: { email },
    });
    if (!employee) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await bcrypt.compare(password, employee.password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid Credentials');

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
