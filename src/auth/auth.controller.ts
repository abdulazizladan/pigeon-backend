import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/enums/role.enum';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly  authService: AuthService
    ){

    }

    @Post("login")
    login(@Body() user: LoginDto) {
        return this.authService.login(user);
    }

    @Post("register")
    register() {

    }

    @Post("reset-password")
    resetPassword() {

    }
}
