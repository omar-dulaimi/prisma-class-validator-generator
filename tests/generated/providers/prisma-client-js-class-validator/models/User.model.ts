import { IsInt, IsDefined, IsString } from "class-validator";
import "./";

export class User {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    email!: string;
}
