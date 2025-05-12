import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { db } from '../firebase';
import { Book } from './interfaces/book.interface';

@Injectable()
export class BooksService {

  private booksCollection = db.collection('book');

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const docRef = await this.booksCollection.add(createBookDto);
    return {id: docRef.id, ...createBookDto};
  }

  async findAll(): Promise<Book[]> {
    const snapshot = await this.booksCollection.get();
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
  }

  async findOne(id: string): Promise<Book | null> {
    const doc = await this.booksCollection.doc(id).get();
    if(!doc.exists){
      throw new NotFoundException('book not found');
    }
    return {id: doc.id, ...doc.data()};
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const doc = await this.booksCollection.doc(id);
    const docSnap = await doc.get();

    if(!docSnap.exists){
      throw new NotFoundException('book not found');
    }

    await doc.update(updateBookDto);
    const updateDoc = await doc.get();
    return updateDoc.data();
  }

  async remove(id: string){
    const doc = await this.booksCollection.doc(id);
    const docSnap = await doc.get();

    if(!docSnap.exists){
      throw new NotFoundException('book not found');
    }

    await doc.delete();
    return {message: 'book deleted successfully'};
  }

  async searchBook(query: string): Promise<Book[] | null> {
      const titleSnapshot = await this.booksCollection.where('title', '>=', query).where('title', '<=', query + '\uf8ff').get();
      const authorSnapshot = await this.booksCollection.where('author', '>=', query).where('author', '<=', query + '\uf8ff').get();
      const categorySnapshot = await this.booksCollection.where('category', '>=', query).where('category', '<=', query + '\uf8ff').get();
      
      const results = new Map<string, any>();
  
      titleSnapshot.docs.forEach(doc => results.set(doc.id, {id : doc.id, ...doc.data()}));
      authorSnapshot.docs.forEach(doc => results.set(doc.id, {id : doc.id, ...doc.data()}));
      categorySnapshot.docs.forEach(doc => results.set(doc.id, {id : doc.id, ...doc.data()}));
      
      return Array.from(results.values());
    }
}
