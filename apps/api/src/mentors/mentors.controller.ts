import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { CreateMentorDto, UpdateMentorDto } from './dto/create-mentor.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/types/role.enum';

@ApiTags('mentors')
@ApiBearerAuth()
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findAll() {
    return this.mentors.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mentors.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() dto: CreateMentorDto) {
    return this.mentors.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMentorDto) {
    return this.mentors.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mentors.remove(id);
  }
}
