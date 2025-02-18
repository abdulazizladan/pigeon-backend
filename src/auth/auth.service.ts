import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    
  constructor(
        private usersService: UserService,
        private jwtService: JwtService
      ) {}
    
      /**
       * 
       * @param userData 
       * @returns 
       */
      async validateUser(userData: LoginDto): Promise<any> {
        try {
          const user = await this.usersService.findOne(userData.email);
          if (user && user.password === userData.password) {
            const { password, ...result } = user;
            return result;
          }
        } catch (error) {
          return {
            success: false,
            message: error.message
          }
        }
      }
    
      async login(user: LoginDto) {
        try {
          const userData = await this.validateUser(user);
          if(userData) {
            return {
              access_token: this.jwtService.sign(userData),
            };
          }else {
            return {
              success: true,
              user: null,
              message: "User not found"
            }
          }
        }catch(error) {
          return {
            success: false,
            message: error.message
          }
        }
      }
}
