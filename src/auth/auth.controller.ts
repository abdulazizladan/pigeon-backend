import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/enums/role.enum';
import { ApiOperation, ApiTags, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly  authService: AuthService
    ){

    }

    /**
     * Login to the system with email and password.
     * @param user - Login credentials
     * @returns JWT token and user information
     */
    @ApiOperation({
            summary: 'Login',
        description: 'Login to the system with email and password'
    })
    @ApiOkResponse({
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        email: { type: 'string', example: 'abdulazizladan@gmail.com' },
                        role: { type: 'string', example: 'admin' },
                        status: { type: 'string', example: 'active' }
                    }
                }
            }
        }
    })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiBody({
        type: LoginDto,
        examples: {
            admin: {
                summary: 'Admin Login',
                description: 'Login as admin user',
                value: {
                    email: 'abdulazizladan@gmail.com',
                    password: 'password'
                }
            },
            director: {
                summary: 'Director Login',
                description: 'Login as director user',
                value: {
                    email: 'useelikoro@gmail.com',
                    password: 'password'
                }
            },
            manager: {
                summary: 'Manager Login',
                description: 'Login as manager user',
                value: {
                    email: 'manager@gmail.com',
                    password: 'password'
                }
            }
        }
    })
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
   
    /**
     * Reset user password.
     * @returns Password reset response
     */
    @ApiOperation({
            summary: "Password reset",
        description: "Reset user password"
    })
    @ApiOkResponse({
        description: 'Password reset successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password reset email sent successfully' }
            }
        }
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
}
