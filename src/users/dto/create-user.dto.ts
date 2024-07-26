import { IsEmail, IsNotEmpty } from 'class-validator';


export class CreateUserDto {
    @IsEmail({}, { message: 'Email khong dung dinh dang', })
    @IsNotEmpty({ message: 'email khong duoc de trong', })
    email: string;

    @IsNotEmpty({ message: 'password khong duoc de trong', })
    password: string;
    name: string;
    address: string;
}
