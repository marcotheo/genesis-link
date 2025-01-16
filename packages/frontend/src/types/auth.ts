// POST API /auth/signin
export interface SignInApi {
  parameters: {
    email: string;
    password: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      ExpiresIn: number;
    };
  };
}

// POST API /auth/create
export interface SignUpApi {
  parameters: { email: string; password: string };
  response: {
    status: string;
    message: string;
    data: {
      email: string;
      password: string;
    };
  };
}

// POST API /auth/token/refresh
export interface RefreshTokenApi {
  parameters: null;
  response: {
    status: string;
    message: string;
    data: {
      ExpiresIn: number;
    };
  };
}

// POST API /auth/session/revoke
export interface RevokeTokenApi {
  parameters: null;
  response: {
    status: string;
    message: string;
    data: null;
  };
}
