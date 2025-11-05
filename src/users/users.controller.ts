import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('users') //* will handle /users route (parent route)
export class UsersController {
  @Get() //GET /users or /users?role?=value
  findAll(@Query('role') role?: 'INTERN' | 'ENGINEER' | 'ADMIN') {
    return [];
  }
  //   @Get('interns') //* GET /users/interns (will work)
  //   findAllInterns() {
  //     return [];
  //   }

  @Get(':id') //GET /users/:id
  findOne(@Param('id') id: string) {
    return { id };
  }

  //   @Get('interns') //! GET /users/interns (will not work)
  //   findAllInterns() {
  //     return [];
  //   }

  @Post() //POST /users
  create(@Body() user: object) {
    return user;
  }

  @Patch(':id') //PATCH /users/:id
  update(@Param('id') id: string, @Body() userUpdate: object) {
    return { id, ...userUpdate };
  }

  @Delete(':id') //DELETE /users/:id
  delete(@Param('id') id: string) {
    return { id };
  }
}
