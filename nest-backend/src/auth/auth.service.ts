import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('เบอร์โทรหรือ PIN ไม่ถูกต้อง');
    }

    const isPinValid = await argon2.verify(user.passwordHash, dto.pin);
    if (!isPinValid) {
      throw new UnauthorizedException('เบอร์โทรหรือ PIN ไม่ถูกต้อง');
    }

    const payload = {
      sub: user.id,
      storeId: user.storeId,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }
}
