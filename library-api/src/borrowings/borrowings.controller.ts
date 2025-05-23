import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { Borrowing } from './interfaces/borrowing.interface';

@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) { }

  @Post()
  create(@Body() createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    return this.borrowingsService.create(createBorrowingDto);
  }

  @Get('search')
  searchBorrowing(@Query('query') query: string): Promise<Borrowing[] | null> {
    return this.borrowingsService.searchBorrowing(query);
  }

  @Get()
  findAll(): Promise<Borrowing[]> {
    return this.borrowingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Borrowing> {
    return this.borrowingsService.findOne(id);
  }

  @Patch('return/:id')
  statusUpdate(@Param('id') id: string, @Body() updateBorrowingDto: UpdateBorrowingDto): Promise<Borrowing> {
    return this.borrowingsService.returnBook(id, updateBorrowingDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBorrowingDto: UpdateBorrowingDto): Promise<Borrowing> {
    return this.borrowingsService.update(id, updateBorrowingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowingsService.remove(id);
  }
}
