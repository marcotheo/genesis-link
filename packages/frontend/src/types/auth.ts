// POST API /api/v1/auth/signin
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

// POST API /api/v1/auth/create
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
