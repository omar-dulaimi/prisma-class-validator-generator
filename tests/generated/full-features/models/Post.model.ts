import { PostBase } from "./PostBase.model";
import { IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./";

export class Post extends PostBase {
    @IsOptional()
    @ApiProperty({ required: false, type: () => User })
    author?: User | null;
}
