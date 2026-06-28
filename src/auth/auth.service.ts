import { ConflictException, Injectable, UnauthorizedException, ForbiddenException, NotFoundException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  private generateTokens(userId: string, role: string) {
    const accessToken = this.jwtService.sign(
      { id: userId, role } as any,
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE'),
      } as any,
    );

    const refreshToken = this.jwtService.sign(
      { id: userId } as any,
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
      } as any,
    );

    return { accessToken, refreshToken };
  }


  async register(registerDto: RegisterDto) {
    const { name, email, password, role } = registerDto;


    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }


    const user = await this.userModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
      user.role,
    );

    return {
      user: (user as any).getPublicProfile(),
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;


    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated. Contact support.',
      );
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }


    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = this.generateTokens(
      user._id.toString(),
      user.role,
    );

    return {
      user: (user as any).getPublicProfile(),
      accessToken,
      refreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return { user: (user as any).getPublicProfile() };
  }


  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userModel.findById(decoded.id);
      if (!user) throw new UnauthorizedException('User not found');

      const accessToken = this.jwtService.sign(
        { id: user._id.toString(), role: user.role } as any,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE'),
        } as any,
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }
  }
}
