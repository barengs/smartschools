import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from './decorators/roles.decorator';
import { CreateUserDto, UpdateUserRolesDto } from './dto/users.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersService } from './users.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @Roles('SUPER_ADMIN', 'KEPALA_SEKOLAH', 'STAF_TU')
  listUsers() {
    return this.usersService.listUsers();
  }

  @Post('users')
  @Roles('SUPER_ADMIN', 'STAF_TU')
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch('users/:id/roles')
  @Roles('SUPER_ADMIN')
  replaceRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    return this.usersService.replaceUserRoles(id, dto.roleCodes);
  }

  @Get('roles')
  @Roles('SUPER_ADMIN', 'KEPALA_SEKOLAH', 'STAF_TU')
  listRoles() {
    return this.usersService.listRoles();
  }
}

