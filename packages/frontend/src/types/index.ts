import {
  CreateOrganizationApi,
  GetOrganizationsByUserIdApi,
} from "./organizations";
import { RefreshTokenApi, RevokeTokenApi, SignInApi, SignUpApi } from "./auth";
import { CreateUserSkillsApi, GetUserSkillsApi } from "./users";
import { GenerateS3SignedUrlPutApi } from "./s3";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/register": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;
  "POST /auth/session/revoke": RevokeTokenApi;

  "POST /organizations": CreateOrganizationApi;

  "POST /users/skills": CreateUserSkillsApi;

  "POST /s3/url/put": GenerateS3SignedUrlPutApi;
}

export interface QueryType {
  "GET /users/skills": GetUserSkillsApi;
  "GET /organizations": GetOrganizationsByUserIdApi;
}
