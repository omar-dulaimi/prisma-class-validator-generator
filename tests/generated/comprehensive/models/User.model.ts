import { IsInt, IsDefined, IsString, IsOptional, IsIn, IsDate } from "class-validator";
import { Post, Profile } from "./";
import { getEnumValues } from "../helpers";
import { Role, Status } from "../enums";

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
    @IsIn(getEnumValues(Role))
    role!: Role;

    @IsDefined()
    @IsIn(getEnumValues(Status))
    status!: Status;

    @IsDefined()
    @IsDate()
    createdAt!: Date;

    @IsDefined()
    @IsDate()
    updatedAt!: Date;

    @IsDefined()
    posts!: Post[];

    @IsOptional()
    profile?: Profile | null;
}
