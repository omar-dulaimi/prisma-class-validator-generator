import { UserBase } from "./UserBase.model";
import { IsOptional, IsDefined } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class User extends UserBase {
    @IsOptional()
    @ApiProperty({ required: false, type: () => User })
    mentor?: User | null;

    @IsDefined()
    @ApiProperty({ isArray: true, type: () => User })
    mentees!: User[];
}
