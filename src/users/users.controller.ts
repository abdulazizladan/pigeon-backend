import { Controller, Post, Get, Param, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({ summary: 'List all users', description: 'Returns all registered users (without passwords). Admin and Director only.' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    const { password, ...result } = user;
    return result;
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Admin can create admins, directors, and managers. Director can only create managers.',
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request (validation failed)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (insufficient privileges)' })
  @ApiResponse({ status: 409, description: 'Conflict (username already exists)' })
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const creatorRole = req.user.role as Role;
    return this.usersService.createUser(createUserDto, creatorRole);
  }
}

