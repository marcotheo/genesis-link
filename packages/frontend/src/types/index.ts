import {
  CreateOrgAddressApi,
  CreateOrganizationApi,
  CreateOrgJobPostApi,
  CreatePostJobDetailsApi,
  CreatePostRequirementsApi,
  GetAddresssesByOrgIdApi,
  GetOrganizationAssetsApi,
  GetOrganizationDetailsApi,
  GetOrganizationsByUserIdApi,
  GetPostsByOrgApi,
  UpdateOrganizationAssetsApi,
  UpdateOrganizationDetailsApi,
  UpdatePostAdditionalInfoLinkApi,
} from "./organizations";
import {
  CreateSavedPostApi,
  DeleteSavedPostApi,
  GetJobPostDetails,
  GetUserSavedPostApi,
  SearchJobsApi,
} from "./post";
import {
  CreateUserSkillsApi,
  GetAccountDetailsAPI,
  GetUserSkillsApi,
  UpdateUserInfoApi,
} from "./users";
import { RefreshTokenApi, RevokeTokenApi, SignInApi, SignUpApi } from "./auth";
import { CreateApplication } from "./application";
import { GenerateS3SignedUrlPutApi } from "./s3";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/register": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;
  "POST /auth/session/revoke": RevokeTokenApi;
  "PUT /users/update/info": UpdateUserInfoApi;
  "POST /users/skills": CreateUserSkillsApi;
  "POST /organizations": CreateOrganizationApi;
  "PUT /organizations/{orgId}/update/details": UpdateOrganizationDetailsApi;
  "PUT /organizations/{orgId}/update/assets": UpdateOrganizationAssetsApi;
  "POST /organizations/{orgId}/addresses": CreateOrgAddressApi;
  "POST /organizations/{orgId}/posts": CreateOrgJobPostApi;
  "POST /organizations/{orgId}/posts/{postId}/job_details": CreatePostJobDetailsApi;
  "POST /organizations/{orgId}/posts/{postId}/requirements": CreatePostRequirementsApi;
  "POST /organizations/{orgId}/posts/{postId}/update/additionalInfoLink": UpdatePostAdditionalInfoLinkApi;
  "POST /posts/{postId}/save": CreateSavedPostApi;
  "DELETE /posts/{postId}/save": DeleteSavedPostApi;
  "POST /s3/generate/signed/url/put": GenerateS3SignedUrlPutApi;
  "POST /applications": CreateApplication;
}

export interface QueryType {
  "GET /users/account/details": GetAccountDetailsAPI;
  "GET /users/skills": GetUserSkillsApi;
  "GET /organizations": GetOrganizationsByUserIdApi;
  "GET /organizations/{orgId}/addresses": GetAddresssesByOrgIdApi;
  "GET /organizations/{orgId}/posts": GetPostsByOrgApi;
  "GET /organizations/{orgId}/assets": GetOrganizationAssetsApi;
  "GET /organizations/{orgId}/details": GetOrganizationDetailsApi;
  "GET /posts/search/jobs": SearchJobsApi;
  "GET /posts/{postId}": GetJobPostDetails;
  "GET /posts/{postId}/save": GetUserSavedPostApi;
}
