import { IsNotEmpty, IsString } from "class-validator";
import { firestore } from 'firebase-admin';

export class CreateBorrowingDto {

    @IsNotEmpty()
    userRef: firestore.DocumentReference;

    @IsNotEmpty()
    bookRef: firestore.DocumentReference;

    @IsString()
    borrow_date: Date;

    @IsString()
    due_date: Date;

    @IsString()
    return_date: Date;

    @IsString()
    status: string;
}
