import { firestore } from 'firebase-admin';

export interface Borrowing {
    id: string;
    userRef: firestore.DocumentReference;
    bookRef: firestore.DocumentReference;
    borrow_date: Date;
    due_date: Date;
    return_date?: Date; // Optional, in case the book is not yet returned
    status: string;
}