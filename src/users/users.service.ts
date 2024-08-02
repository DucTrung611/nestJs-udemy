import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserM, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash
  }

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    let { name, email, password, address, age, company, gender, role } = createUserDto;
    let isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email ${email} da ton tai vui long tao email khac`)
    }
    const hastPassword = this.getHashPassword(password);
    let newUser = this.userModel.create({
      name,
      email,
      password: hastPassword,
      address,
      age,
      company,
      gender,
      role,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newUser;
  }

  async register(newUser: RegisterUserDto) {
    let { name, email, age, gender, address, password } = newUser;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`email ${email} da ton tai tren he thong vui long su dung email khac`)
    }

    // fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    const hastPassword = this.getHashPassword(password);
    let user = await this.userModel.create({
      name,
      email,
      password: hastPassword,
      age,
      gender,
      address,
      role: userRole?._id
    })
    return user;
  }

  async findAll(currentPage, limit, qs) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .select("-password")
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "not found user"
    }
    return this.userModel.findOne({ _id: id }).select("-password")
      .populate({ path: "role", select: { name: 1, _id: 1 } });
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({ email: username })
      .populate({ path: "role", select: { name: 1 } });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash); // true
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto, updatedBy: user });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "not found user"
    }
    const foundUser = await this.userModel.findById({ _id: id })
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("khong the xoa tai khoan admin");
    }
    await this.userModel.updateOne({ _id: id }, { deletedBy: user })
    return this.userModel.softDelete({ _id: id });
  }

  updateUserToken = (refreshToken: string, _id: string) => {
    return this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = (refreshToken: string) => {
    return this.userModel.findOne({ refreshToken })
      .populate({ path: "role", select: { name: 1 } });
  }
}
