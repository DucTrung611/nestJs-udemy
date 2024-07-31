import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private PermissionModel: SoftDeleteModel<PermissionDocument>) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const isExist = await this.PermissionModel.findOne({ apiPath: createPermissionDto.apiPath, method: createPermissionDto.method })
    if (isExist) {
      throw new BadRequestException(`apiPath ${createPermissionDto.apiPath}, method ${createPermissionDto.method} da ton tai tren he thong vui long su dung apiPath khac`)
    }
    let newPermission = await this.PermissionModel.create({ ...createPermissionDto, createdBy: user });
    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.PermissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.PermissionModel.find(filter)
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
    return this.PermissionModel.findOne({ _id: id });
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    return this.PermissionModel.updateOne({ _id: id }, { ...updatePermissionDto, updatedBy: user });
  }

  async remove(id: string, user: IUser) {
    await this.PermissionModel.updateOne({ _id: id }, { deletedBy: user });
    return this.PermissionModel.softDelete({ _id: id });
  }
}
