import { Controller, Body, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  // /auth/local-auth.guard.ts
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body) {
    console.log('==> ', body);
    // { username: '', password: '' }
    return this.authService.login(body.data);
  }
}
