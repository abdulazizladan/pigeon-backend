import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from './enums/role.enum';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.admin)
  @ApiOkResponse({ description: 'User created successfully' })
  @ApiOperation({ summary: 'Create user' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles(Role.admin, Role.director)
  @ApiOkResponse({description: "User stats found"})
  @ApiOperation({summary: "Get user stats by role and status"})
  @Get('stats')
  getStats() {
    return this.userService.getStats();
  }

  @Roles(Role.admin, Role.director)
  @ApiOkResponse({ description: 'User found' })
  @ApiNoContentResponse({ description: 'No users found' })
  @ApiOperation({ summary: 'Find all users' })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Roles(Role.admin)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Find one user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.userService.findOne(email);
  }

  @Roles(Role.admin)
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOperation({ summary: 'Update user' })
  @Patch(':id')
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(email, updateUserDto);
  }

  /**@Roles(Role.admin)
  @ApiOperation({ summary: 'Remove user' })
  @Delete(':email')
  remove(@Param('email') email: string) {
    return this.userService.remove(email);
  }**/
}
