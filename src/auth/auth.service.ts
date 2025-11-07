import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

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
        const user = await this.usersService.findByEmail(loginDto.email);
        if (user && await bcrypt.compare(loginDto.password, user.data.password)) {
          const { password, ...result } = user;
          console.log(result)
          return result;
        }
        return null;
        /**const isPasswordValid = await bcrypt.compare(loginDto.password, user.data.password);
        if (!isPasswordValid) {
          return null;
        }
        // Return user without password
        const { password, ...result } = user;
        return result;**/
      }
    
      /**
       *
       * @param loginDto
       * @returns
       */
      async login(loginDto: LoginDto) {

        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
          throw new UnauthorizedException();
        } else{
          const match = await bcrypt.compare(loginDto.password, user.data.password);
          if (!match) {
            throw new UnauthorizedException();
          }else{
            const payload = { 
              email: user.data.email, 
              //password: user.data.password, 
              sub: user.data.id, 
              role: user.data.role 
            };
            return {
              access_token: this.jwtService.sign(payload)
            }
          }
        } 
        /**try{
        const user = await this.validateUser(loginDto);
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        } else
        return {
          access_token: this.jwtService.sign({ ...user }),
        };
        } catch (error) {
          return {
            success: false,
            message: error.message
          }
        }**/
      }

      /**
       * Changes the password of the currently authenticated user
       * @param email - Email of the user whose password is being changed
       * @param newPassword - The new password in plain text
       */
      async changePassword(email: string, newPassword: string) {
    
        const hashedPassword = await User.hashPassword(newPassword);
        const updateDto = { password: hashedPassword };
        const updated = await this.usersService.update(email, updateDto);
        if (!updated) {
            throw new NotFoundException(`User with email "${email}" not found.`); 
        }
        const newToken = await this.login({ email: updated.email, password: newPassword });
        return {
          success: true,
          message: 'Password updated successfully',
          data: newToken
        }
    }
}
