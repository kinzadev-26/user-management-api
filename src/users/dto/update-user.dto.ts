import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength, } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
    password?: string;

    @IsOptional()
    @IsEnum(['user', 'admin'], { message: 'Role must be user or admin' })
    role?: string;
}