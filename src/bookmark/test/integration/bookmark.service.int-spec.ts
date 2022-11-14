import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppModule } from '../../../app.module';
import { BookmarkService } from '../../bookmark.service';
import {
  CreateBookmarkDto,
  EditBookmarkDto,
} from '../../dto';
import * as argon from 'argon2';

describe('BookmarkService Int', () => {
  let prisma: PrismaService;
  let bookmarkService: BookmarkService;
  let userId: number;
  let bookmarkId: number;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    prisma = moduleRef.get(PrismaService);
    bookmarkService = moduleRef.get(
      BookmarkService,
    );
    await prisma.cleanDb();
  });
  describe('create bookmark', () => {
    const dto: CreateBookmarkDto = {
      title: 'INTEGRATION TESTING',
      description:
        'This bookmark was created during integration testing',
      link: 'www.google.com',
    };
    it('should create user', async () => {
      const hash = await argon.hash(
        'ultrasecret',
      );
      const user = await prisma.user.create({
        data: {
          email: 'integrationTesting@mail.com',
          hash,
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      userId = user.id;
    });

    it('should create bookmark', async () => {
      const bookmark =
        await bookmarkService.createBookmark(
          userId,
          dto,
        );
      expect(bookmark.title).toBe(dto.title);
      expect(bookmark.description).toBe(
        dto.description,
      );
      expect(bookmark.link).toBe(dto.link);

      bookmarkId = bookmark.id;
    });

    it('should throw on duplicate bookmark title', async () => {
      await bookmarkService
        .createBookmark(userId, dto)
        .then((bookmark) =>
          expect(bookmark).toBeUndefined(),
        )
        .catch((error) => {
          expect(error.status).toBe(403);
        });
    });
  });
  describe('edit bookmark', () => {
    const dto: EditBookmarkDto = {
      title: 'INTEGRATION TESTING Edit version',
      description:
        'This bookmark has been updated during edit test',
      link: 'www.NOTGOOGLE.com',
    };
    it('should edit created bookmark', async () => {
      const bookmark =
        await bookmarkService.editBookmarkById(
          userId,
          bookmarkId,
          dto,
        );
    });
  });
  describe('get list of bookmarks', () => {
    it('should get list of bookmarks by user', async () => {
      const list =
        await bookmarkService.getBookmarks(
          userId,
        );
      expect(list).toHaveLength(1);
    });
  });
  describe('get bookmarks by id', () => {
    const dto: EditBookmarkDto = {
      title: 'INTEGRATION TESTING Edit version',
      description:
        'This bookmark has been updated during edit test',
      link: 'www.NOTGOOGLE.com',
    };
    it('should get bookmark by id', async () => {
      const list =
        await bookmarkService.getBookmarkById(
          userId,
          bookmarkId,
        );
      expect(list.description).toStrictEqual(
        dto.description,
      );
      expect(list.title).toStrictEqual(dto.title);
      expect(list.link).toStrictEqual(dto.link);
    });
  });
  describe('delete bookmark', () => {
    it('should delete bookmark', async () => {
      const bookmarkToDelete =
        await bookmarkService.getBookmarkById(
          userId,
          bookmarkId,
        );
      const deleted =
        await bookmarkService.deleteBookmarkById(
          userId,
          bookmarkId,
        );
      const list =
        await bookmarkService.getBookmarks(
          userId,
        );

      expect(deleted).toStrictEqual(
        bookmarkToDelete,
      );
      expect(list).toHaveLength(0);
    });
  });
});
