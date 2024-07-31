import { Injectable } from '@nestjs/common';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private ResumeModel: SoftDeleteModel<ResumeDocument>) { }
  async create(createResumeDto: CreateUserCvDto, user: IUser) {
    const { _id, email } = user
    let newResume = await this.ResumeModel.create({
      ...createResumeDto,
      email,
      userId: _id,
      status: "PENDING",
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: user
        }
      ],
      createdBy: user
    })
    return {
      _id: newResume?._id,
      createAt: newResume?.createdAt
    };
  }

  findByUsers(user: IUser) {
    return this.ResumeModel.find({ userId: user._id })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.ResumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.ResumeModel.find(filter)
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
    return this.ResumeModel.findOne({ _id: id });
  }

  update(id: string, status: string, user: IUser) {
    return this.ResumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: user,
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: user
          }
        }
      });
  }

  async remove(id: string, user: IUser) {
    await this.ResumeModel.updateOne({ _id: id }, { deletedBy: user })
    return this.ResumeModel.softDelete({ _id: id });
  }
}
