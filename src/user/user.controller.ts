import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard) // Global level
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getUser(
    @GetUser() user: User,
    // @GetUser('updatedAt') email: string,
  ) {
    // console.log({
    //   email,
    // });
    return user;
  }

  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }
}
