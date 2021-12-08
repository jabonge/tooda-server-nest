import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  async signUp(deviceId: string) {
    let user = await User.findOne({
      where: {
        deviceId,
      },
    });
    if (!user) {
      user = new User();
      user.deviceId = deviceId;
      await user.save();
    }
    return user;
  }
}
