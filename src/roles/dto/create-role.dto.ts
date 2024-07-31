import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: "name khong duoc de trong" })
    name: string

    @IsNotEmpty({ message: "description khong duoc de trong" })
    description: string

    @IsNotEmpty({ message: "isActive khong duoc de trong" })
    @IsBoolean({ message: 'isActive co dinh dang boolean' })
    isActive: boolean;

    @IsNotEmpty({ message: "permissions khong duoc de trong" })
    @IsMongoId({ each: true })
    @IsArray({ message: "permissions phai co dinh dang array" })
    permissions: mongoose.Schema.Types.ObjectId[];
}
