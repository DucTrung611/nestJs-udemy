import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {
    @IsNotEmpty({ message: 'name khong duoc de trong', })
    name: string;

    @IsEmail({}, { message: 'Email khong dung dinh dang', })
    @IsNotEmpty({ message: 'email khong duoc de trong', })
    email: string;

    @IsNotEmpty({ message: 'password khong duoc de trong', })
    password: string;

    @IsNotEmpty({ message: 'password khong duoc de trong', })
    age: number;

    @IsNotEmpty({ message: 'gender khong duoc de trong', })
    gender: string;

    @IsNotEmpty({ message: 'address khong duoc de trong', })
    address: string;

    @IsNotEmpty({ message: 'role khong duoc de trong', })
    @IsMongoId({ message: 'role co dinh dang la mongo id', })
    role: mongoose.Schema.Types.ObjectId;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}


export class RegisterUserDto {
    @IsNotEmpty({ message: 'name khong duoc de trong', })
    name: string;

    @IsEmail({}, { message: 'Email khong dung dinh dang', })
    @IsNotEmpty({ message: 'email khong duoc de trong', })
    email: string;

    @IsNotEmpty({ message: 'password khong duoc de trong', })
    password: string;

    @IsNotEmpty({ message: 'password khong duoc de trong', })
    age: number;

    @IsNotEmpty({ message: 'gender khong duoc de trong', })
    gender: string;

    @IsNotEmpty({ message: 'address khong duoc de trong', })
    address: string;
}
