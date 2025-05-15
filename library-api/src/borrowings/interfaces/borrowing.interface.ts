import { DocumentReference } from 'firebase-admin/firestore';

export interface Borrowing {
    id: string;
    userRef: DocumentReference;
    bookRef: DocumentReference;
    borrow_date: Date;
    due_date: Date;
    return_date?: Date;
    status: string;
}