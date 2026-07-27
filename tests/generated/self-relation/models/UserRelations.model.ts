import { IsOptional, IsDefined } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "./User.model";

export class UserRelations {
    @IsOptional()
    @ApiProperty({ required: false, type: () => User })
    mentor?: User | null;

    @IsDefined()
    @ApiProperty({ isArray: true, type: () => User })
    mentees!: User[];
}
