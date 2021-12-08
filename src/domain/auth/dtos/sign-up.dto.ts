import { Length } from 'class-validator';

export class SignUpDto {
  @Length(36, 36)
  deviceId: string;
}
