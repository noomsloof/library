import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { db } from '../firebase';
import { Borrowing } from './interfaces/borrowing.interface';
import { database } from 'firebase-admin';

@Injectable()
export class BorrowingsService {

  private borrowingsCollection = db.collection('borrowings');
  private usersCollection = db.collection('users');
  private booksCollection = db.collection('book');

  async create(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    const docRef = await this.borrowingsCollection.add(createBorrowingDto);
    const availableCheck = await this.checkBookAvailable(typeof createBorrowingDto.bookRef === 'string' ? createBorrowingDto.bookRef : createBorrowingDto.bookRef.id);
    if (availableCheck == true) {
      await this.bookBorrowCount(typeof createBorrowingDto.bookRef === 'string' ? createBorrowingDto.bookRef : createBorrowingDto.bookRef.id);
      return { id: docRef.id, ...createBorrowingDto };
    } else {
      throw new NotFoundException('book not available');
    }

  }

  async findAll(): Promise<Borrowing[]> {

    const snapshot = await this.borrowingsCollection.get();

    if (snapshot.empty) {
      throw new Error('borrowing not found');
    }

    const borrowings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();

      const userSnap = await this.usersCollection.doc(data.userRef).get();
      const bookSnap = await this.booksCollection.doc(data.bookRef).get();

      const userData = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;
      const bookData = bookSnap.exists ? { id: bookSnap.id, ...bookSnap.data() } : null;

      return {
        id: doc.id, ...data,
        user: userData,
        book: bookData,
      };
    }));
    return borrowings;
  }

  async findOne(id: string): Promise<Borrowing> {
    const doc = await this.borrowingsCollection.doc(id).get();

    if (!doc.exists) {
      throw new Error('borrowing not found');
    }

    const data = doc.data();
    const userSnap = await this.usersCollection.doc(data.userRef).get();
    const bookSnap = await this.booksCollection.doc(data.bookRef).get();
    const userData = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;
    const bookData = bookSnap.exists ? { id: bookSnap.id, ...bookSnap.data() } : null;

    const borrowing = {
      id: doc.id, ...data,
      user: userData,
      book: bookData,
    };

    return borrowing;
  }

  async update(id: string, updateBorrowingDto: UpdateBorrowingDto): Promise<Borrowing> {
    const doc = await this.borrowingsCollection.doc(id);
    const docSnap = await doc.get();

    if (!docSnap.exists) {
      throw new NotFoundException('borrowing not found');
    }

    await doc.update(updateBorrowingDto);
    const updateDoc = await doc.get();
    return updateDoc.data();
  }

  async remove(id: string) {
    const doc = await this.borrowingsCollection.doc(id);
    const docSnap = await doc.get();
    if (!docSnap.exists) {
      throw new NotFoundException('borrowing not found');
    }
    await doc.delete();
    return { message: 'book deleted successfully' };
  }

  async searchBorrowing(query: string): Promise<Borrowing[]> {
    const snapshot = await this.borrowingsCollection.get();

    if (snapshot.empty) {
      throw new NotFoundException('borrowing not found');
    }

    const borrowings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();

      const userSnap = await this.usersCollection.doc(data.userRef).get();
      const bookSnap = await this.booksCollection.doc(data.bookRef).get();

      const userData = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;
      const bookData = bookSnap.exists ? { id: bookSnap.id, ...bookSnap.data() } : null;

      const matchUser = userData && (
        userData.name.toLowerCase().includes(query.toLowerCase()) ||
        userData.email.toLowerCase().includes(query.toLowerCase())
      );

      const matchBook = bookData && (
        bookData.title.toLowerCase().includes(query.toLowerCase()) ||
        bookData.author.toLowerCase().includes(query.toLowerCase())
      );

      if (matchUser || matchBook) {
        return {
          id: doc.id, ...data,
          user: userData,
          book: bookData,
        };
      }

      return null;
    }));

    return borrowings.filter(borrowing => borrowing !== null) as Borrowing[];
  }

  async returnBook(id: string, updateBorrowingDto: UpdateBorrowingDto): Promise<Borrowing> {

    const doc = this.borrowingsCollection.doc(id);
    const docSnap = await doc.get();

    if (!docSnap.exists) {
      throw new NotFoundException('borrowing not found');
    }

    const data = docSnap.data();
    const dueDate = new Date(data.due_date);
    const returnDate = new Date(updateBorrowingDto.return_date || Date.now());


    if (returnDate.getTime() > dueDate.getTime()) {
      updateBorrowingDto.status = 'late';
    } else {
      updateBorrowingDto.status = 'returned';
    }

    await this.bookReturnCount(data.bookRef);

    await doc.update(updateBorrowingDto);
    const updateDoc = await doc.get();

    return { id: updateDoc.id, ...updateDoc.data() } as Borrowing;
  }

  async bookReturnCount(id: string) {
    const doc = this.booksCollection.doc(id);
    const docSnap = await doc.get();

    if (!docSnap.exists) {
      throw new NotFoundException('book not found');
    }

    const data = docSnap.data();
    await doc.update({ available_copies: data.available_copies + 1 });
  }

  async bookBorrowCount(id: string) {
    const doc = this.booksCollection.doc(id);
    const docSnap = await doc.get();

    if (!docSnap.exists) {
      throw new NotFoundException('book not found');
    }

    const data = docSnap.data();
    await doc.update({ available_copies: data.available_copies - 1 });
  }

  async checkBookAvailable(id: string) {
    const doc = this.booksCollection.doc(id);
    const docSnap = await doc.get();

    if (!docSnap.exists) {
      throw new NotFoundException('book not found');
    }

    const data = docSnap.data();
    if (data.available_copies > 0) {
      return true;
    } else {
      return false;
    }
  }
}
