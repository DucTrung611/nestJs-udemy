import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: "name khong duoc de trong" })
    name: string

    @IsNotEmpty({ message: "name khong duoc de trong" })
    apiPath: string

    @IsNotEmpty({ message: "name khong duoc de trong" })
    method: string

    @IsNotEmpty({ message: "name khong duoc de trong" })
    module: string
}
