import { IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./";

export class PostRelations {
    @IsOptional()
    @ApiProperty({ required: false, type: () => User })
    author?: User | null;
}
