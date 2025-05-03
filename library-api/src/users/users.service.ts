import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { db } from '../firebase';

@Injectable()
export class UsersService {

  // private users = [
  //   { id: 1, name: 'Adam' },
  //   { id: 2, name: 'Bob' },
  // ]

  private usersCollection = db.collection('users')

  async create(createUserDto: CreateUserDto) {
    // const newUser = {
    //   id: this.users.length+1,
    //   ...createUserDto,
    // };
    // this.users.push(newUser);
    // return newUser;

    const docRef = await this.usersCollection.add(createUserDto);
    return {id: docRef.id, ...createUserDto}
    
  }

  async findAll() {
    const snapshot = await this.usersCollection.get();
    return snapshot.docs.map(doc => ({id : doc.id, ...doc.data() }));
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
