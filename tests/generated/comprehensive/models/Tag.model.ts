import { IsInt, IsDefined, IsString } from "class-validator";
import { Post } from "./";

export class Tag {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    name!: string;

    @IsDefined()
    posts!: Post[];
}
