import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../firebase';
import * as admin from 'firebase-admin';
import { User } from './interfaces/user.interface'

@Injectable()
export class UsersService {

  private usersCollection = db.collection('users')

  async create(createUserDto: CreateUserDto): Promise<User> {
    const docRef = await this.usersCollection.add(createUserDto);
    return {id: docRef.id, ...createUserDto}
    
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map(doc => ({id : doc.id, ...doc.data() }));
  }

  async findOne(id: string): Promise<User | null> {
    const doc = await this.usersCollection.doc(id).get();
    if(!doc.exists){
      throw new NotFoundException('user not found');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const doc = await this.usersCollection.doc(id);
    const docSnap = await doc.get();
    if(!docSnap.exists){
      throw new NotFoundException('user not found');
    }
    await doc.update(updateUserDto);
    const updatedDoc = await doc.get();
    return updatedDoc.data();
  }

  async remove(id: string) {
    const doc = this.usersCollection.doc(id);
    const docSnap = await doc.get();
    if(!docSnap.exists){
      throw new NotFoundException('user not found');
    }
    await doc.delete();
    return { message: 'user deleted successfully' };
  }

  async searchByRole(role: string): Promise<User[] | null> {
    const snapshot = await this.usersCollection.where('role', '==', role).get();
    return snapshot.docs.map(doc => ({id : doc.id, ...doc.data()}));
  }

  async searchUsers(query: string): Promise<User[] | null> {
    const nameSnapshot = await this.usersCollection.where('name', '>=', query).where('name', '<=', query + '\uf8ff').get();
    const emailSnapshot = await this.usersCollection.where('email', '>=', query).where('email', '<=', query + '\uf8ff').get();

    const results = new Map<string, any>();

    nameSnapshot.docs.forEach(doc => results.set(doc.id, {id : doc.id, ...doc.data()}));
    emailSnapshot.docs.forEach(doc => results.set(doc.id, {id : doc.id, ...doc.data()}));
    
    return Array.from(results.values());
  }
}
