import { IsNumber, IsString } from "class-validator";

export class CreateBookDto {
    
    @IsString()
    title: string;

    @IsString()
    author: string;

    @IsString()
    category: string;

    @IsNumber()
    total_copies: number;

    @IsNumber()
    available_copies: number;

    @IsString()
    description: string;

    @IsString()
    cover_image: string;
}
