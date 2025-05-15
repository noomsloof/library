import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DocumentReference } from 'firebase-admin/firestore';

export class CreateBorrowingDto {

    @IsNotEmpty()
    userRef: DocumentReference;

    @IsNotEmpty()
    bookRef: DocumentReference;

    @IsDate()
    @Type(() => Date)
    borrow_date: Date;

    @IsDate()
    @Type(() => Date)
    due_date: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    return_date: Date;

    @IsString()
    status: string;
}
