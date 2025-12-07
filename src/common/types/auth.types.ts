export interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    isPmr?: boolean;
    role: 'user' | 'admin';
    totalPoints: number;
    totalKm: number;
  };
}
