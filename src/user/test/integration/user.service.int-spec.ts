import { Test } from '@nestjs/testing';
import {
  CreateUserDto,
  EditUserDto,
} from 'user/dto';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserService } from '../..//user.service';
import * as bcrypt from 'bcrypt';

describe('UserService Int', () => {
  let prisma: PrismaService;
  let userService: UserService;
  let userId: number;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    prisma = moduleRef.get(PrismaService);
    userService = moduleRef.get(UserService);
    await prisma.cleanDb();
  });

  describe('createUser()', () => {
    it('should create user', async () => {
      const password = await bcrypt.hash(
        'ultrasecret',
        10,
      );
      const dto: CreateUserDto = {
        email: 'userIntegrationTest@mail.com',
        password,
      };
      const user = await userService.createUser(
        dto,
      );
      userId = user.id;
      expect(user.email).toEqual(dto.email);
      expect(user.firstName).toBeNull();
    });
  });
  describe('editUser()', () => {
    const dto: EditUserDto = {
      firstName: 'UNIT',
      lastName: 'TESTING',
    };
    it('should edit user', async () => {
      const user = await userService.editUser(
        userId,
        dto,
      );

      expect(user.firstName).toBe(dto.firstName);
      expect(user.lastName).toBe(dto.lastName);
    });
  });
});
