import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
    name!: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email!: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
    password!: string;

    @IsOptional()
    @IsEnum(['user', 'admin'], { message: 'Role must be user or admin' })
    role?: string;
}