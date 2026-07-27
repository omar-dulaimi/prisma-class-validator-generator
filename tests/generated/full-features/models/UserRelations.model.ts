import { IsDefined } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Post } from "./";

export class UserRelations {
    @IsDefined()
    @ApiProperty({ isArray: true, type: () => Post })
    posts!: Post[];
}
