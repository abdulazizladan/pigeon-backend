import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Role } from './enums/role.enum';
import { UserStatus } from './enums/user-status.enum';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Default seed password; override with SEED_PASSWORD in .env.
    const seedPassword = process.env.SEED_PASSWORD || 'password';
    const defaultUsers = [
      { username: 'admin', firstName: 'System', lastName: 'Administrator', role: Role.ADMIN },
      { username: 'director', firstName: 'Regional', lastName: 'Director', role: Role.DIRECTOR },
      { username: 'manager', firstName: 'Support', lastName: 'Manager', role: Role.MANAGER },
    ];

    for (const u of defaultUsers) {
      const existingUser = await this.findOneByUsername(u.username);
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(seedPassword, 10);
        const newUser = this.usersRepository.create({
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: null,
          password: hashedPassword,
          role: u.role,
        });
        await this.usersRepository.save(newUser);
      }
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /** All users with the manager role, optionally filtered by status, newest username first. */
  async findManagers(status?: UserStatus): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      where: status ? { role: Role.MANAGER, status } : { role: Role.MANAGER },
      order: { username: 'ASC' },
    });
    return users.map(({ password, ...rest }) => rest);
  }

  async updateStatus(id: string, status: UserStatus): Promise<Omit<User, 'password'>> {
    const user = await this.findOneById(id);
    if (!user) throw new NotFoundException(`User with id "${id}" not found`);
    user.status = status;
    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      return null;
    }
    // TypeORM case-insensitivity might need QueryBuilder depending on collation,
    // but SQLite doesn't natively do case-insensitive exact matching unless configured.
    // Assuming usernames are typically saved lowercase or exactly matched.
    return user;
  }

  async createUser(createUserDto: CreateUserDto, creatorRole: Role): Promise<Omit<User, 'password'>> {
    // 1. Role-based user creation validation
    if (creatorRole === Role.DIRECTOR) {
      if (createUserDto.role !== Role.MANAGER) {
        throw new ForbiddenException('Directors can only create manager users');
      }
    } else if (creatorRole === Role.MANAGER) {
      throw new ForbiddenException('Managers cannot create users');
    } else if (creatorRole !== Role.ADMIN) {
      throw new ForbiddenException('Unauthorized role to create users');
    }

    // 2. Check if username is taken
    const existingUser = await this.findOneByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // 3. Hash password and save user
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      username: createUserDto.username,
      firstName: createUserDto.firstName.trim(),
      lastName: createUserDto.lastName.trim(),
      phoneNumber: createUserDto.phoneNumber?.trim() || null,
      password: hashedPassword,
      role: createUserDto.role,
    });

    await this.usersRepository.save(newUser);

    // Return user without password
    const { password, ...result } = newUser;
    return result;
  }
}
