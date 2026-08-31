export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

export interface MeResponse {
  id: number;
  username: string;
  email: string;
  total_trips: number;
}
