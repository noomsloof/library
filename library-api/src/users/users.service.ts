import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../firebase';


@Injectable()
export class UsersService {

  private usersCollection = db.collection('users')

  async create(createUserDto: CreateUserDto) {
    const docRef = await this.usersCollection.add(createUserDto);
    return {id: docRef.id, ...createUserDto}
    
  }

  async findAll() {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map(doc => ({id : doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.usersCollection.doc(id).get();
    if(!doc.exists){
      throw new NotFoundException('user not found');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>) {
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
    return this.findAll();
  }

  async searchByRole(role: string) {
    const snapshot = await this.usersCollection.where('role', '==', role).get();
    return snapshot.docs.map(doc => ({id : doc.id, ...doc.data()}));
  }
}
