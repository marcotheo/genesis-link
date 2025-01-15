import { CreateUserSkillsApi, GetUserSkillsApi } from "./users";
import { RefreshTokenApi, SignInApi, SignUpApi } from "./auth";
import { GetOrganizationsByUserIdApi } from "./organizations";
import { GenerateS3SignedUrlPutApi } from "./s3";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/create": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;

  "POST /users/skills": CreateUserSkillsApi;

  "POST /s3/url/put": GenerateS3SignedUrlPutApi;
}

export interface QueryType {
  "GET /users/skills": GetUserSkillsApi;
  "GET /organizations": GetOrganizationsByUserIdApi;
}
