import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Role } from './enums/role.enum';
import { ForbiddenException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed default admin', async () => {
    const admin = await service.findOneByUsername('admin');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe(Role.ADMIN);
  });

  describe('createUser', () => {
    it('should allow admin to create a director', async () => {
      const newUser = await service.createUser(
        {
          username: 'director_user',
          firstName: 'Test',
          lastName: 'User',
          password: 'Password123!',
          role: Role.DIRECTOR,
        },
        Role.ADMIN,
      );
      expect(newUser.username).toBe('director_user');
      expect(newUser.role).toBe(Role.DIRECTOR);
    });

    it('should allow admin to create a manager', async () => {
      const newUser = await service.createUser(
        {
          username: 'manager_user',
          firstName: 'Test',
          lastName: 'User',
          password: 'Password123!',
          role: Role.MANAGER,
        },
        Role.ADMIN,
      );
      expect(newUser.username).toBe('manager_user');
      expect(newUser.role).toBe(Role.MANAGER);
    });

    it('should allow director to create a manager', async () => {
      const newUser = await service.createUser(
        {
          username: 'dir_manager_user',
          firstName: 'Test',
          lastName: 'User',
          password: 'Password123!',
          role: Role.MANAGER,
        },
        Role.DIRECTOR,
      );
      expect(newUser.username).toBe('dir_manager_user');
      expect(newUser.role).toBe(Role.MANAGER);
    });

    it('should NOT allow director to create a director', async () => {
      await expect(
        service.createUser(
          {
            username: 'dir_director_user',
            firstName: 'Test',
            lastName: 'User',
            password: 'Password123!',
            role: Role.DIRECTOR,
          },
          Role.DIRECTOR,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should NOT allow manager to create any user', async () => {
      await expect(
        service.createUser(
          {
            username: 'some_user',
            firstName: 'Test',
            lastName: 'User',
            password: 'Password123!',
            role: Role.MANAGER,
          },
          Role.MANAGER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if username already exists', async () => {
      await service.createUser(
        {
          username: 'duplicate_user',
          firstName: 'Test',
          lastName: 'User',
          password: 'Password123!',
          role: Role.MANAGER,
        },
        Role.ADMIN,
      );

      await expect(
        service.createUser(
          {
            username: 'duplicate_user',
            firstName: 'Test',
            lastName: 'User',
            password: 'Password123!',
            role: Role.MANAGER,
          },
          Role.ADMIN,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });
});
