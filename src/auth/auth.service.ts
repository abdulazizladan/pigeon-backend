import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserStatus } from '../users/enums/user-status.enum';
import { ActivitiesService } from '../activities/activities.service';

/**
 * Hash compared against when the username does not exist, so an unknown
 * username takes the same time to reject as a wrong password. This prevents
 * username enumeration via response timing.
 */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password-for-constant-time', 10);

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activitiesService: ActivitiesService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByUsername(loginDto.username);

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user?.password ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('This account has been deactivated. Contact an administrator.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);
    void this.activitiesService.log({ actor: payload, action: 'auth.login', description: 'Signed in' });
    return { access_token };
  }
}
