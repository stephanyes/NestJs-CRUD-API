import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser, Public } from './decorator';
import { AuthDto } from './dto';
import {
  JwtGuard,
  RefreshTokenGuard,
} from './guard';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(
    @Body() dto: AuthDto, // TODO: Learn about Pipes https://docs.nestjs.com/pipes
  ): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  // @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: number) {
    return this.authService.logout(userId);
  }

  @Public() // with this we are overpassing the JwtGuard that is Globally
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetUser('refreshToken') refreshToken: string,
    @GetUser('sub') userId: number,
  ) {
    return this.authService.refreshToken(
      userId,
      refreshToken,
    );
  }
}
