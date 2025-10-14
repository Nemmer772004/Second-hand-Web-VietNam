import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

interface AuthPayload {
  sub: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  private buildAuthPayload(user: Omit<User, 'password'>): AuthPayload {
    return {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: Boolean(user.isAdmin),
    };
  }

  private buildAuthResponse(user: User) {
    const sanitized = this.sanitizeUser(user);
    const payload = this.buildAuthPayload(sanitized);
    return {
      access_token: this.jwtService.sign(payload),
      user: sanitized,
    };
  }

  private async syncAdminStatusFromProfile(user: User): Promise<boolean> {
    const userServiceBase =
      process.env.USER_SERVICE_INTERNAL_URL ||
      `http://${process.env.USER_SERVICE_HOST || 'localhost'}:${
        process.env.USER_SERVICE_PORT || '3004'
      }/users`;

    try {
      const response = await fetch(`${userServiceBase}/auth/${user.id}`);
      if (!response.ok) {
        return false;
      }

      const profile = await response.json();
      if (profile?.role === 'admin' && !user.isAdmin) {
        user.isAdmin = true;
        await this.userRepository.update(user.id, { isAdmin: true });
      }
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'name', 'isAdmin'] // Explicit select to include isAdmin
    });
    
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Get full user data with isAdmin field
    const fullUser = await this.userRepository.findOne({ 
      where: { id: user.id },
      select: ['id', 'email', 'password', 'name', 'isAdmin']
    });
    
    if (!fullUser) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản');
    }

    if (loginDto.isAdminLogin) {
      const hasAdminPrivileges =
        fullUser.isAdmin || (await this.syncAdminStatusFromProfile(fullUser));
      if (!hasAdminPrivileges) {
        throw new UnauthorizedException('Tài khoản không có quyền quản trị');
      }
    }

    return this.buildAuthResponse(fullUser);
  }

  async register(userData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isAdmin: Boolean(userData.isAdmin),
    });
    const savedUser = await this.userRepository.save(user);
    return this.buildAuthResponse(savedUser);
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.sanitizeUser(user) : null;
  }
}
