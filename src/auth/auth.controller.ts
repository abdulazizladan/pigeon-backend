import { Body, Controller, Post, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/enums/role.enum';
import { ApiOperation, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';

import { RolesGuard } from './roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { Public } from './public.decorator';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {

    }

    /**
     * Login to the system with email and password.
     */
    @ApiOperation({
        summary: 'Login',
        description: 'Login to the system with email and password'
    })
    @ApiOkResponse({
        description: 'Login successful',
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({
        type: LoginDto,
        examples: {
            director: {
                summary: 'Director/Admin',
                value: {
                    email: 'abdulazizladan@gmail.com',
                    password: 'password'
                }
            },
            manager1: {
                summary: 'Manager 1',
                value: {
                    email: 'useelikoro@gmail.com',
                    password: 'password'
                }
            },
            manager2: {
                summary: 'Manager 2',
                value: {
                    email: 'manager2@gmail.com',
                    password: 'password'
                }
            }
        }
    })
    @Post("login")
    login(@Body() user: LoginDto) {
        return this.authService.login(user);
    }

    // ... (register route)

    /**
     * Reset user password.
     */
    @ApiOperation({
        summary: "Password reset",
        description: "Reset user password"
    })
    @ApiOkResponse({
        description: 'Password reset successful',
        // ... (rest of ApiOkResponse)
    })
    @ApiBadRequestResponse({ description: 'Invalid email address' })
    @Post("reset-password")
    resetPassword() {
        // TODO: Implement password reset functionality
        return {
            success: true,
            message: 'Password reset functionality not yet implemented'
        };
    }

    // --- The changePassword method is now the *only* guarded route ---

    /**
     * Change current user's password
     */
    // **APPLY GUARDS HERE ONLY** (AuthGuard runs first, then RolesGuard)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.admin, Role.director, Role.manager) // <--- Role check is here
    @ApiOperation({ summary: 'Change password', description: 'Change the password of the authenticated user' })
    @ApiOkResponse({ description: 'Password changed successfully' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @Patch('change-password')
    changePassword(@Request() req: any, @Body() body: ChangePasswordDto) {
        return this.authService.changePassword(req.user.email, body.newPassword);
    }
}