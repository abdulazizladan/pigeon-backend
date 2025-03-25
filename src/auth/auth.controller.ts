import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/enums/role.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly  authService: AuthService
    ){

    }

    /**
     * 
     * @param user 
     * @returns 
     */
    @ApiOperation(
        {
            summary: 'Login',
            description: 'Login to the system'
        }
    )
    @Post("login")
    login(@Body() user: LoginDto) {
        return this.authService.login(user);
    }

    /**@ApiOperation(
        {
            summary: "User registration"
        }
    )
    @Post("register")
    register() {

    }
    **/
   
    @ApiOperation(
        {
            summary: "Password reset",
            description: "Password reset"
        }
    )
    @Post("reset-password")
    resetPassword() {

    }
}
