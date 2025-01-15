import { CreateUserSkillsApi, GetUserSkillsApi } from "./users";
import { RefreshTokenApi, SignInApi, SignUpApi } from "./auth";
import { GetOrganizationsByUserIdApi } from "./organizations";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/create": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;

  "POST /users/skills": CreateUserSkillsApi;
}

export interface QueryType {
  "GET /users/skills": GetUserSkillsApi;
  "GET /organizations": GetOrganizationsByUserIdApi;
}
