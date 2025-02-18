import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ description: 'User created successfully' })
  @ApiOperation({ summary: 'Create user' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOkResponse({ description: 'User found' })
  @ApiNoContentResponse({ description: 'No users found' })
  @ApiOperation({ summary: 'Find all users' })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Find one user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':id')
  findOne(@Param('email') email: string) {
    return this.userService.findOne(email);
  }

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOperation({ summary: 'Update user' })
  @Patch(':id')
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(email, updateUserDto);
  }

  @ApiOperation({ summary: 'Remove user' })
  @Delete(':id')
  remove(@Param('email') email: string) {
    return this.userService.remove(email);
  }
}
