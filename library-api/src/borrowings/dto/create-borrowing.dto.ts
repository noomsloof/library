import { IsNotEmpty, IsString } from "class-validator";
import { DocumentReference } from 'firebase-admin/firestore';

export class CreateBorrowingDto {

    @IsNotEmpty()
    userRef: DocumentReference;

    @IsNotEmpty()
    bookRef: DocumentReference;

    @IsString()
    borrow_date: Date;

    @IsString()
    due_date: Date;

    @IsString()
    return_date: Date;

    @IsString()
    status: string;
}
