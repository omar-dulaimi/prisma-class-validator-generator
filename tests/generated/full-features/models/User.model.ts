import { UserBase } from "./UserBase.model";
import { IsDefined } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Post } from "./";

export class User extends UserBase {
    @IsDefined()
    @ApiProperty({ isArray: true, type: () => Post })
    posts!: Post[];
}
