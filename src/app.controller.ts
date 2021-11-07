import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  // /auth/local-auth.guard.ts
  @UseGuards(LocalAuthGuard)
  @Post('login')
  // Passport 根据从 validate() 方法返回的值自动创建一个 user 对象，并将其作为 req.user 分配给请求对象
  // 参数在body里
  // { username: '', password: '' }
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
