// POST API /auth/signin
export interface SignInApi {
  bodyParams: {
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
  bodyParams: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
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
  response: {
    status: string;
    message: string;
    data: null;
  };
}
