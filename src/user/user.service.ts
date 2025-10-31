import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Info } from './entities/info.entity';
import { Contact } from './entities/contact.entity';
import { Status } from './enums/status.enum';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Info)
    private readonly infoRepository: Repository<Info>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>
  ) {}

  /**
   * Creates a new user in the database, including related contact and info.
   * @param createUserDto - DTO containing user, contact, and info details
   * @returns An object indicating success or failure, the user data, and a message
   */
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await User.hashPassword(createUserDto.password);
    try {
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        contact: await this.contactRepository.save(createUserDto.contact),
        info: await this.infoRepository.save(createUserDto.info)
      });
      await this.userRepository.save(user);
      return {
        success: true,
        data: user,
        message: 'User added successfully'
      }
    } catch (error) {
      return {
        success: false,
        messahe: error.message
      }
    }
  }

  /**
   * Retrieves statistics about users by status and roles.
   * @returns An object containing user stats and a message
   */
  async getStats() {
    const totalUsers = await this.userRepository.count()
    const activeUsers = await this.userRepository.countBy({status: Status.active})
    const suspendedUsers = await this.userRepository.countBy({status: Status.suspended})
    const removedUsers = await this.userRepository.countBy({status: Status.removed})
    const adminCount = await this.userRepository.countBy({role: Role.admin})
    const directorsCount = await this.userRepository.countBy({role: Role.director})
    const managersCount = await this.userRepository.countBy({role: Role.manager})
    try {
      return {
        success: true,
        data: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          removed: removedUsers,
          admin: adminCount,
          directors: directorsCount,
          managers: managersCount
        },
        message: "Status fetched successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Retrieves all users, including their info, contact, and station relations.
   * @returns An object with users array and a message
   */
  async findAll() {
    const users = await this.userRepository.find({
      relations: [
        'info', 
        'contact',
        'station',
      ],
      select: [
        'email', 
        'contact', 
        'info', 
        'station',
        'role',
        'status'
      ]
    });
    try {
      return {
        success: true,
        data: users,
        message: users.length === 0 ? 'No users found' : 'Users fetched successfully'
      }
    } catch (error) {
      return{
        success: false,
        message: 'Error fetching users'
      }
    }
  }

  /**
   * Retrieves a single user by email, including info, contact, reports, and tickets.
   * @param email - The email of the user
   * @returns An object with the user or not found message
   */
  async findOne(email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne(
        {
          where: {email}, 
            relations: [
              'info',
              'contact',
              'reports',
              'tickets',
            ]
          }
        );
      if(user) {
        return {
          success: true,
          data: user,
          message: "User found"
        }
      }else {
        return {
          success: false,
          data: null,
          message: "User not found"
        }
      }
      
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
    
  }

  /**
   * Finds a user by email.
   * @param email - The email of the user
   * @returns An object with the user or a message if not found
   */
  async findByEmail(email: string): Promise<any> {
    try{
      const user = await this.userRepository.findOne({
        where: {email}
      })
      if(user) {
        return {
          success: true, 
          data: user,
          message: "User found"
        }
      } else {
        return {
          success: false, 
          data: null,
          message: "User not found"
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
    
  }

  async findManagers(): Promise<any> {
    try{
      const managers =await this.userRepository.find({
        where: {
          role: Role.manager
        },
        relations: [
          'info',
          'contact'
        ],
        select: [
          'id',
          'email', 
          'contact', 
          'info', 
          'role',
          'status'
        ]
      })
      return managers;

    } catch (error) {
      return{
        success: false,
        message: error.message
      }
    }
  }

  /**
   * Updates a user by email.
   * @param email - The email of the user
   * @param updateUserDto - DTO containing updated user data
   * @returns An object indicating success or failure and a message
   */
  async update(email: string, updateUserDto: UpdateUserDto) {

    const updateResult: UpdateResult = await this.userRepository.update(
      {email: email},
      updateUserDto
    )
    if(updateResult.affected === 0) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    const updatedUser = this.userRepository.findOne({
      where: {email},
      relations: ['contact', 'info']
    })

    if(!updatedUser) {
      throw new NotFoundException('User not found')
    }

    return updatedUser;
    
  }

  /**
   * Deletes a user by email.
   * @param email - The email of the user
   * @returns An object indicating success or failure and a message
   */
  async remove(email: string) {
    const user  = await this.userRepository.findOne(
      {
        where: { email }
    }
  )
    try {
      if(user) {
        await this.userRepository.remove(user);
        return {
          success: true,
          message: "User deleted successfully"
        }
      } else {
        return {
          success: false,
          message: `User with email ${email} not found`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
