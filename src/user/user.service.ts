import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Info } from './entities/info.entity';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Info)
    private readonly infoRepository: Repository<Info>
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
        //role: createUserDto.role,
      });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
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
        'contact'
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
      const user = await this.userRepository.findOne({where: {email: email}, relations: ['info']});
      if(user) {
        return user;
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

  update(email: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${email} user`;
  }

  remove(email: string) {
    return `This action removes a #${email} user`;
  }
}
