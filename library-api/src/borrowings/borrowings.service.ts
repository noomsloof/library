import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { db } from '../firebase';
import { Borrowing } from './interfaces/borrowing.interface';

@Injectable()
export class BorrowingsService {

  private borrowingsCollection = db.collection('borrowing');
  private usersCollection = db.collection('users');
  private booksCollection = db.collection('book');

  async create(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    const docRef = await this.borrowingsCollection.add(createBorrowingDto);
    return { id: docRef.id, ...createBorrowingDto };
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

    if(!docSnap.exists) {
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
    return {message: 'book deleted successfully'};
  }

  async searchBorrowing(query: string): Promise<Borrowing[] | null> {
    const snapshot = await this.borrowingsCollection.get();

    if (!snapshot.exists) {
      throw new NotFoundException('borrowing not found');
    }

    const borrowings = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();

      const userSnap = await this.usersCollection.doc(data.userRef).get();
      const bookSnap = await this.booksCollection.doc(data.bookRef).get();

      const userData = userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null;
      const bookData = bookSnap.exists ? { id: bookSnap.id, ...bookSnap.data() } : null;

      const macthuser = userData && (userData.name.toLowerCase().includes(query.toLowerCase()) || userData.email.toLowerCase().includes(query.toLowerCase()));
      const macthbook = bookData && (bookData.title.toLowerCase().includes(query.toLowerCase()) || bookData.author.toLowerCase().includes(query.toLowerCase()));

      if (!macthuser || macthbook) {
        return {
          id: doc.id, ...data,
          user: userData,
          book: bookData,
        };
      }
      return null;
    }));

    return borrowings;
  }
}
