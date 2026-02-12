import { binToUuid } from '../util/uuid';

export interface UserCreationParams {
  email: string;
  password: string;
  user_name: string;
}

export interface UserLoginParams {
  email: string;
  password: string;
}

export interface UserRegisterParams {
  email: string;
  nickname: string;
  birthdate: Date;
  gender: 'male' | 'female';
}

export interface DefaultUserInterface {
  user_id: string;
  user_name?: string;
  user_birth?: Date;
  gender?: 'male' | 'female';
  profile_image?: string;
  income_goal?: number;
  email?: string;
}

export class ResponseFromUser implements DefaultUserInterface {
  user_id: string;
  user_name?: string;
  user_birth?: Date;
  gender?: 'male' | 'female';
  profile_image?: string;
  income_goal?: number;
  email?: string;

  constructor(userId: Uint8Array<ArrayBufferLike>, userInfo: Partial<DefaultUserInterface>) {
    this.user_id = binToUuid(userId);
    this.user_name = userInfo.user_name;
    this.user_birth = userInfo.user_birth;
    this.gender = userInfo.gender;
    this.profile_image = userInfo.profile_image;
    this.income_goal = userInfo.income_goal;
    this.email = userInfo.email;
  }
}

export class ResponseFromInitialRegion {
  region_id: number[];
  constructor(data: { user_id: Uint8Array<ArrayBufferLike>; region_id: number }[]) {
    this.region_id = data.map((item) => item.region_id);
  }
}
