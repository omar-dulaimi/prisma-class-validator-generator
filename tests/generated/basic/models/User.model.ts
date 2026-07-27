import { IsInt, IsDefined, IsString, IsOptional } from "class-validator";
import { Post } from "./";

export class User {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    email!: string;

    @IsOptional()
    @IsString()
    name?: string | null;

    @IsDefined()
    posts!: Post[];
}
