import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto): Promise<Tokens> {
    const hash = await this.hashData(
      dto.password,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      const tokens = await this.signToken(
        user.id,
        user.email,
      );
      await this.updateRefreshToken(
        user.id,
        tokens.refresh_token,
      );
      return tokens;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          // Prisma's specific code -> P2002
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    // find user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    //if user doesnt exist throw exception
    if (!user) {
      throw new ForbiddenException(
        'Credentials incorrect :@',
      );
    }

    const pwMatches = await bcrypt.compareSync(
      dto.password,
      user.hash,
    );
    // if password incorrect throw excepion
    if (!pwMatches) {
      throw new ForbiddenException(
        'Credentials Incorrect :@',
      );
    }

    const tokens = await this.signToken(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async logout(userId: number) {
    //get user by userId only if hashedRt not null
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
  }
  async refreshToken(
    userId: number,
    refresh_token: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new ForbiddenException(
        'Credentials incorrect :@',
      );
    }

    //compare password
    const hashMatches = await bcrypt.compareSync(
      refresh_token,
      user.hashedRt,
    );

    // if password incorrect throw excepion
    if (!hashMatches) {
      throw new ForbiddenException(
        'Credentials Incorrect :@',
      );
    }

    const tokens = await this.signToken(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(
      user.id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async hashData(data: string) {
    const saltRounds = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(data, saltRounds);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<Tokens> {
    const payload = {
      sub: userId,
      email,
    };

    const [access_token, refresh_token] =
      await Promise.all([
        await this.jwt.signAsync(payload, {
          expiresIn: '15m',
          secret: this.config.get('JWT_SECRET'),
        }),
        await this.jwt.signAsync(payload, {
          expiresIn: 60 * 60 * 24 * 7,
          secret: this.config.get(
            'REFRESH_TOKEN_SECRET',
          ),
        }),
      ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async updateRefreshToken(
    userId: number,
    refresh_token: string,
  ) {
    const hash = await this.hashData(
      refresh_token,
    );
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }
}
