import { IsInt, IsDefined, IsDate, IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { User } from "./";

export class Post {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsDefined()
    @IsDate()
    updatedAt!: Date;

    @IsDefined()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    content?: string | null;

    @IsDefined()
    @IsBoolean()
    published!: boolean;

    @IsDefined()
    @IsInt()
    viewCount!: number;

    @IsOptional()
    author?: User | null;

    @IsOptional()
    @IsInt()
    authorId?: number | null;

    @IsDefined()
    @IsNumber()
    rating!: number;
}
