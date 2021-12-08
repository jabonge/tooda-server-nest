import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() { deviceId }: SignUpDto) {
    return this.authService.signUp(deviceId);
  }

  @Post('refresh')
  reIssueAccessToken(@Body() { refreshToken }: { refreshToken: string }) {
    const token = this.authService.reIssueAccessToken(refreshToken);
    return {
      accessToken: token,
    };
  }
}
