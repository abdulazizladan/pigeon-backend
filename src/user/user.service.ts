import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * 
   * @param createUserDto 
   * @returns new user
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
        data: createUserDto,
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
   * 
   * @returns user stats by status and roles
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
   * 
   * @returns array of users
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
        'station'
      ]
    });
    try {
      if(users.length === 0) {
        return {
          message: 'No users found'
        }
      }else{
        return users;
      }
      
    } catch (error) {
      return{
        message: 'Error fetching users',
        error: error
      }
    }
  }

  /**
   * 
   * @param email 
   * @returns single user by email
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
          success: true,
          user: null,
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
   * 
   * @param email 
   * @returns 
   */
  async findByEmail(email: string): Promise<any> {
    try{
      const user = await this.userRepository.findOne({where: {email}})
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

  /**
   * 
   * @param email 
   * @param updateUserDto 
   * @returns 
   */
  async update(email: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne(
        {
          where: {
            email: email
          }
        }
      );
      if(user) {
        await this.userRepository.update(email, updateUserDto);
        return {
          success: true,
          data: updateUserDto,
          message: 'User updated successfully'
        }
      }else{
        return {
          success: false,
          message: `User with email ${email} not found`
        }
      }
    }
    catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  async remove(email: string) {
    const user  = await this.userRepository.findOne(
      {
        where: { email }
    }
  )
    try {
      if(user) {
        this.userRepository.remove(user);
        return {
          success: true,
          message: "User deleted successfully"
        }
      } else {
        return {
          success: false,
          messsage: `User with email ${email} not found`
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
