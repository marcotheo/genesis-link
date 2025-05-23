import {
  CreateOrgAddressApi,
  CreateOrganizationApi,
  CreateOrgJobPostApi,
  CreatePostJobDetailsApi,
  CreatePostRequirementsApi,
  DeleteOrgAddressApi,
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
  CreateApplicationApi,
  GetApplicationsByPostIdApi,
  GetApplicationsByUserIdApi,
  GetProposalLinkByApplicationIdApi,
  GetResumeLinkByApplicationIdApi,
} from "./application";
import {
  CreateUserSkillsApi,
  GetAccountDetailsAPI,
  GetSavedPostByUserIdApi,
  GetUserSkillsApi,
  UpdateUserInfoApi,
} from "./users";
import {
  CreateSavedPostApi,
  DeleteSavedPostApi,
  GetJobPostDetailsApi,
  GetUserSavedPostApi,
  SearchJobsApi,
} from "./post";
import {
  OAuthCallbackApi,
  RefreshTokenApi,
  RevokeTokenApi,
  SignInApi,
  SignUpApi,
} from "./auth";
import { GenerateS3SignedUrlPutApi } from "./s3";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/oauth/callback": OAuthCallbackApi;
  "POST /auth/register": SignUpApi;
  "POST /auth/token/refresh": RefreshTokenApi;
  "POST /auth/session/revoke": RevokeTokenApi;
  "PUT /users/update/info": UpdateUserInfoApi;
  "POST /users/skills": CreateUserSkillsApi;
  "POST /organizations": CreateOrganizationApi;
  "PUT /organizations/{orgId}/update/details": UpdateOrganizationDetailsApi;
  "PUT /organizations/{orgId}/update/assets": UpdateOrganizationAssetsApi;
  "POST /organizations/{orgId}/addresses": CreateOrgAddressApi;
  "DELETE /organizations/{orgId}/addresses/{addressId}": DeleteOrgAddressApi;
  "POST /organizations/{orgId}/posts": CreateOrgJobPostApi;
  "POST /organizations/{orgId}/posts/{postId}/job_details": CreatePostJobDetailsApi;
  "POST /organizations/{orgId}/posts/{postId}/requirements": CreatePostRequirementsApi;
  "POST /organizations/{orgId}/posts/{postId}/update/additionalInfoLink": UpdatePostAdditionalInfoLinkApi;
  "POST /posts/{postId}/save": CreateSavedPostApi;
  "DELETE /posts/{postId}/save": DeleteSavedPostApi;
  "POST /s3/generate/signed/url/put": GenerateS3SignedUrlPutApi;
  "POST /applications": CreateApplicationApi;
}

export interface QueryType {
  "GET /users/account/details": GetAccountDetailsAPI;
  "GET /users/skills": GetUserSkillsApi;
  "GET /users/saved-posts": GetSavedPostByUserIdApi;
  "GET /organizations": GetOrganizationsByUserIdApi;
  "GET /organizations/{orgId}/addresses": GetAddresssesByOrgIdApi;
  "GET /organizations/{orgId}/posts": GetPostsByOrgApi;
  "GET /organizations/{orgId}/assets": GetOrganizationAssetsApi;
  "GET /organizations/{orgId}/details": GetOrganizationDetailsApi;
  "GET /posts/search/jobs": SearchJobsApi;
  "GET /posts/{postId}": GetJobPostDetailsApi;
  "GET /posts/{postId}/save": GetUserSavedPostApi;
  "GET /posts/{postId}/applications": GetApplicationsByPostIdApi;
  "GET /applications": GetApplicationsByUserIdApi;
  "GET /applications/{applicationId}/proposal-link": GetProposalLinkByApplicationIdApi;
  "GET /applications/{applicationId}/resume-link": GetResumeLinkByApplicationIdApi;
}
