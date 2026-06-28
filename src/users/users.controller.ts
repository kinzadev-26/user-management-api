import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as userSchema from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('admin')
    async findAll(@Query() query: any) {
        const data = await this.usersService.findAll(query);
        return {
            success: true,
            message: 'Users fetched successfully',
            count: data.users.length,
            pagination: data.pagination,
            data: data.users,
        };
    }

    @Get('profile')
    async getProfile(@CurrentUser() user: userSchema.UserDocument) {
        return {
            success: true,
            message: 'Profile fetched successfully',
            data: { user: (user as any).getPublicProfile() },
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: userSchema.UserDocument,
    ) {
        const data = await this.usersService.findById(id, user);
        return {
            success: true,
            message: 'User fetched successfully',
            data,
        };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() user: userSchema.UserDocument,
    ) {
        const data = await this.usersService.update(id, updateUserDto, user);
        return {
            success: true,
            message: 'User updated successfully',
            data,
        };
    }

    @Delete(':id')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: userSchema.UserDocument,
    ) {
        const data = await this.usersService.remove(id, user);
        return {
            success: true,
            message: `User '${data.deletedUser}' deleted successfully`,
            data: null,
        };
    }


    @Patch(':id/status')
    @Roles('admin')
    async toggleStatus(
        @Param('id') id: string,
        @CurrentUser() user: userSchema.UserDocument,
    ) {
        const data = await this.usersService.toggleStatus(id, user);
        const statusText = data.isActive ? 'activated' : 'deactivated';
        return {
            success: true,
            message: `User account ${statusText} successfully`,
            data,
        };
    }
}