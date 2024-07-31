import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    logo: string
}

export class CreateJobDto {

    @IsNotEmpty({ message: "name khong duoc de trong" })
    name: string;

    @IsNotEmpty({ message: "skills khong duoc de trong" })
    @IsArray({ message: "skills phai co dinh dang array" })
    @IsString({ each: true, message: "skill dinh dang la string" })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "salary khong duoc de trong" })
    salary: number;

    @IsNotEmpty({ message: "quantity khong duoc de trong" })
    quantity: number;

    @IsNotEmpty({ message: "level khong duoc de trong" })
    level: string;

    @IsNotEmpty({ message: "description khong duoc de trong" })
    description: string;

    @IsNotEmpty({ message: "salary khong duoc de trong" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "startDate co dinh dang la date" })
    startDate: Date;

    @IsNotEmpty({ message: "salary khong duoc de trong" })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "endDate co dinh dang la date" })
    endDate: Date;

    @IsNotEmpty({ message: "salary khong duoc de trong" })
    @IsBoolean({ message: 'isActive co dinh dang boolean' })
    isActive: boolean;

    @IsNotEmpty({ message: 'location co dinh dang string' })
    location: string;
}
