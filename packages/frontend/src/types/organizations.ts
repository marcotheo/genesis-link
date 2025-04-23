import { PresignedHTTPRequest } from "./s3";
import { Signal } from "@builder.io/qwik";

// POST API /organizations
export interface CreateOrganizationApi {
  bodyParams: {
    company: string;
    email: string;
    contactNumber?: string;
    bannerLink?: string;
    logoLink?: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      orgId: string;
    };
  };
}

export type OrgPartialItem = {
  orgId: string;
  company: string;
  email: string;
  createdAt: number;
};

// GET API /organizations
export interface GetOrganizationsByUserIdApi {
  queryStrings: {
    page: Signal<number>;
  };
  response: {
    status: string;
    message: string;
    data: {
      total: number;
      organizations: OrgPartialItem[];
    };
  };
}

// GET API /organizations/{orgId}/assets
export interface GetOrganizationAssetsApi {
  pathParams: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      bannerLink: PresignedHTTPRequest | null;
      logoLink: PresignedHTTPRequest | null;
    };
  };
}

// GET API /organizations/{orgId}/details
export interface GetOrganizationDetailsApi {
  pathParams: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      company: string;
      email: string;
      contactNumber?: string;
      createdAt: number;
    };
  };
}

// PUT API /organizations/{orgId}/update/details
export interface UpdateOrganizationDetailsApi {
  pathParams: {
    orgId: string;
  };
  bodyParams: {
    email?: string;
    contactNumber?: string;
  };
  response: {
    status: string;
    message: string;
    data: null;
  };
}

// PUT API /organizations/{orgId}/update/assets
export interface UpdateOrganizationAssetsApi {
  pathParams: {
    orgId: string;
  };
  bodyParams: {
    bannerLink?: string;
    logoLink?: string;
  };
  response: {
    status: string;
    message: string;
    data: null;
  };
}

// ============ ORG ADDRESSES ============
// POST API /organizations/{orgId}/addresses
export interface CreateOrgAddressApi {
  pathParams: {
    orgId: string;
  };
  bodyParams: {
    country: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    addressDetails: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      addressId: string;
    };
  };
}

// GET API /organizations/{orgId}/addresses
export interface GetAddresssesByOrgIdApi {
  pathParams: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      addressId: string;
      country: string;
      region: string;
      province: string;
      city: string;
      barangay: string;
      addressDetails: string;
    }[];
  };
}

// DELETE API /organizations/{orgId}/addresses/{addressId}
export interface DeleteOrgAddressApi {
  status: string;
  message: string;
  data: null;
}
// ============ ORG ADDRESSES ============

// ============ ORG POSTS ============
// POST API /organizations/{orgId}/posts
export interface CreateOrgJobPostApi {
  bodyParams: {
    title: string;
    description?: string;
    additionalInfoLink?: string;
    wfh: 0 | 1;
    deadline: string;
    addressId: string;
    tags: {
      tagName: string;
      tagCategory: string;
    }[];
  };
  pathParams: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      postId: string;
    };
  };
}

// POST API /organizations/{orgId}/posts/{postId}/update/additionalInfoLink
export interface UpdatePostAdditionalInfoLinkApi {
  pathParams: {
    orgId: string;
    postId: string;
  };
  bodyParams: { additionalInfoLink: string };
  response: { status: string; message: string; data: null };
}

// POST API /organizations/{orgId}/posts/{postId}/job_details
export interface CreatePostJobDetailsApi {
  pathParams: {
    orgId: string;
    postId: string;
  };
  bodyParams: {
    jobType: "full-time" | "part-time" | "contract" | "internship";
    salaryType?: "fixed" | "hourly" | "monthly";
    salaryAmountMin: number;
    salaryAmountMax: number;
    salaryCurrency: string;
  };
  response: { status: string; message: string; data: null };
}

// POST API /organizations/{orgId}/posts/{postId}/requirements
export interface CreatePostRequirementsApi {
  pathParams: {
    orgId: string;
    postId: string;
  };
  bodyParams: {
    requirements: {
      requirementType: string;
      requirement: string;
    }[];
  };
  response: { status: string; message: string; data: null };
}

// GET API /organizations/{orgId}/posts
export interface GetPostsByOrgApi {
  queryStrings: {
    page: Signal<number>;
  };
  pathParams: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      posts: {
        postId: string;
        title: string;
        deadline: number;
      }[];
      total: number;
    };
  };
}
// ============ ORG POSTS ============
