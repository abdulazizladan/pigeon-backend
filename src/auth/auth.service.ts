import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

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
      async validateUser(loginDto: LoginDto): Promise<Omit<User, 'password'> | null> {
        // Retrieve user including the password field
        const user = await this.usersService.findOne(loginDto.email);
        if (!user) {
          return null;
        }
    
        // Compare provided password with stored hash
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
          return null;
        }
    
        // Omit password from the returned user object
        const { password, ...result } = user;
        return result;
      }
    
      async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
    
        return {
          access_token: this.jwtService.sign({ ...user }),
        };
      }
}
