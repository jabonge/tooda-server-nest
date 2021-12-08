import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  jwtRefreshKey: string;
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.jwtRefreshKey = this.configService.get<string>('JWT_REFRESH_KEY');
  }

  issueAccessToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  issueRefreshToken(payload: JwtPayload) {
    const signOption: JwtSignOptions = {
      secret: this.jwtRefreshKey,
      expiresIn: '365d',
    };

    const token = this.jwtService.sign(payload, signOption);
    return token;
  }

  reIssueAccessToken(token: string) {
    const decodedUser = this.verifyRefreshToken(token);
    if (decodedUser) {
      return this.issueAccessToken({
        id: decodedUser.id,
        deviceId: decodedUser.deviceId,
      });
    } else {
      throw new BadRequestException('Invalid Refresh Token');
    }
  }

  verifyRefreshToken(token: string) {
    const decoded = this.jwtService.verify<JwtPayload>(token, {
      secret: this.jwtRefreshKey,
    });
    return decoded;
  }

  async signUp(deviceId: string) {
    const user = await this.userService.signUp(deviceId);
    const payload = { id: user.id, deviceId: user.deviceId };
    const accessToken = this.issueAccessToken(payload);
    const refreshToken = this.issueRefreshToken(payload);
    return {
      accessToken,
      refreshToken,
    };
  }
}
