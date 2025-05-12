import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksService } from './books/books.service';
import { BooksModule } from './books/books.module';
import { BorrowingsModule } from './borrowings/borrowings.module';

@Module({
  imports: [UsersModule, BooksModule, BorrowingsModule],
  controllers: [AppController],
  providers: [AppService, BooksService],
})
export class AppModule {}
