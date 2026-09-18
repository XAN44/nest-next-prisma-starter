// src/auth/dto/login.dto.ts
import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'PIN ต้องมี 6 หลัก' })
  pin: string;
}
