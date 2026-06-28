import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    })
    name!: string;

    @Prop({
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email',
        ],
    })
    email!: string;

    @Prop({
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Never return password in queries
    })
    password!: string;

    @Prop({
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Role must be user or admin',
        },
        default: 'user',
    })
    role!: string;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ default: null })
    lastLogin!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});


UserSchema.methods.comparePassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};


UserSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};