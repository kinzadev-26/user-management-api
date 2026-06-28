import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async findAll(query: any) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const { role, isActive, search, sortBy = 'createdAt', order } = query;

        const filter: any = {};

        if (role && ['user', 'admin'].includes(role)) {
            filter.role = role;
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const totalUsers = await this.userModel.countDocuments(filter);

        const users = await this.userModel
            .find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('-__v');

        return {
            users: users.map((u) => (u as any).getPublicProfile()),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
                limit,
                hasNextPage: page < Math.ceil(totalUsers / limit),
                hasPrevPage: page > 1,
            },
        };
    }

    async findById(id: string, requestingUser: UserDocument) {
        const isSelf = requestingUser._id.toString() === id;
        const isAdmin = requestingUser.role === 'admin';

        if (!isSelf && !isAdmin) {
            throw new ForbiddenException(
                'Access denied. You can only view your own profile.',
            );
        }

        const user = await this.userModel.findById(id).select('-__v');
        if (!user) throw new NotFoundException('User not found');

        return { user: (user as any).getPublicProfile() };
    }

    async update(
        id: string,
        updateUserDto: UpdateUserDto,
        requestingUser: UserDocument,
    ) {
        const isSelf = requestingUser._id.toString() === id;
        const isAdmin = requestingUser.role === 'admin';

        if (!isSelf && !isAdmin) {
            throw new ForbiddenException(
                'Access denied. You can only update your own profile.',
            );
        }

        const user = await this.userModel.findById(id).select('+password');
        if (!user) throw new NotFoundException('User not found');

        const { name, email, password, role } = updateUserDto;

        if (name) user.name = name.trim();

        if (email) {
            const emailExists = await this.userModel.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id },
            });
            if (emailExists) {
                throw new ConflictException(
                    'Email is already in use by another account',
                );
            }
            user.email = email.toLowerCase().trim();
        }

        if (password) user.password = password;

        if (role) {
            if (!isAdmin) {
                throw new ForbiddenException(
                    'Only admins can change user roles.',
                );
            }
            user.role = role;
        }

        await user.save();
        return { user: (user as any).getPublicProfile() };
    }

    async remove(id: string, requestingUser: UserDocument) {
        if (requestingUser._id.toString() === id) {
            throw new ForbiddenException(
                'You cannot delete your own admin account',
            );
        }

        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) throw new NotFoundException('User not found');

        return { deletedUser: user.name };
    }

    async toggleStatus(id: string, requestingUser: UserDocument) {
        if (requestingUser._id.toString() === id) {
            throw new ForbiddenException(
                'You cannot deactivate your own account',
            );
        }

        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
        };
    }
}
