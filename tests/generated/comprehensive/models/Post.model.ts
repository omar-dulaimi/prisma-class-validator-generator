import { Prisma } from "@prisma/client";
import { IsInt, IsDefined, IsString, IsOptional, IsBoolean, IsNumber, IsDate } from "class-validator";
import { User, Tag } from "./";

export class Post {
    @IsDefined()
    @IsInt()
    id!: number;

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

    @IsDefined()
    @IsNumber()
    rating!: number;

    @IsOptional()
    metadata?: Prisma.JsonValue | null;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsDefined()
    @IsDate()
    updatedAt!: Date;

    @IsDefined()
    author!: User;

    @IsDefined()
    @IsInt()
    authorId!: number;

    @IsDefined()
    tags!: Tag[];
}
