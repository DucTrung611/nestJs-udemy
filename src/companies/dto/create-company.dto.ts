import { IsNotEmpty } from 'class-validator';


export class CreateCompanyDto {
    @IsNotEmpty({ message: 'name khong duoc de trong', })
    name: string;

    @IsNotEmpty({ message: 'address khong duoc de trong', })
    address: string;

    @IsNotEmpty({ message: 'description khong duoc de trong', })
    description: string;

    @IsNotEmpty({ message: 'logo khong duoc de trong', })
    logo: string;
}
