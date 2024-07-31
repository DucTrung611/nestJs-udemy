import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private RoleModel: SoftDeleteModel<RoleDocument>) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const isExist = await this.RoleModel.findOne({ name: createRoleDto.name });
    if (isExist) {
      throw new BadRequestException(`role name: ${createRoleDto.name} da ton tai vui long doi role name khac`)
    }

    let newRole = await this.RoleModel.create({ ...createRoleDto, createdBy: user })
    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.RoleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.RoleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection as any)
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
    return this.RoleModel.findOne({ _id: id });
  }

  update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    return this.RoleModel.updateOne({ _id: id }, { ...updateRoleDto, updatedBy: user });
  }

  async remove(id: string, user: IUser) {
    await this.RoleModel.updateOne({ _id: id }, { deletedBy: user });
    return this.RoleModel.softDelete({ _id: id });
  }
}
