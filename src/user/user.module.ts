import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Info } from './entities/info.entity';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        User, 
        Info, 
        Contact
      ]
    )
  ],
  controllers: [
    UserController
  ],
  providers: [
    UserService
  ],
  exports: [
    UserService
  ]
})
export class UserModule {}
