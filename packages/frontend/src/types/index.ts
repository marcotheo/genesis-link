import {
  CreateOrgAddressApi,
  CreateOrganizationApi,
  GetAddresssesByOrgIdApi,
  GetOrganizationsByUserIdApi,
} from "./organizations";
import {
  CreateUserSkillsApi,
  GetAccountDetailsAPI,
  GetUserSkillsApi,
  UpdateUserInfoApi,
} from "./users";
import { RefreshTokenApi, RevokeTokenApi, SignInApi, SignUpApi } from "./auth";
import { GenerateS3SignedUrlPutApi } from "./s3";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/register": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;
  "POST /auth/session/revoke": RevokeTokenApi;

  "PUT /users/update/info": UpdateUserInfoApi;
  "POST /users/skills": CreateUserSkillsApi;

  "POST /organizations": CreateOrganizationApi;
  "POST /organizations/{orgId}/addresses": CreateOrgAddressApi;

  "POST /s3/url/put": GenerateS3SignedUrlPutApi;
}

export interface QueryType {
  "GET /users/account/details": GetAccountDetailsAPI;
  "GET /users/skills": GetUserSkillsApi;
  "GET /organizations": GetOrganizationsByUserIdApi;

  "GET /organizations/{orgId}/addresses": GetAddresssesByOrgIdApi;
}
