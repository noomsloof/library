import { Injectable } from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { db } from '../firebase';
import { Borrowing } from './interfaces/borrowing.interface';

@Injectable()
export class BorrowingsService {

  private borrowingsCollection = db.collection('borrowing');

  async create(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    const docRef = await this.borrowingsCollection.add(createBorrowingDto);
    return { id: docRef.id, ...createBorrowingDto};
  }

  async findAll(): Promise<Borrowing[]> {
    const snapshot = await this.borrowingsCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowing`;
  }

  update(id: number, updateBorrowingDto: UpdateBorrowingDto) {
    return `This action updates a #${id} borrowing`;
  }

  remove(id: number) {
    return `This action removes a #${id} borrowing`;
  }
}
