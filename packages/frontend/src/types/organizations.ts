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
  queryStrings: null;
  parameters: {
    orgId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      Addressid: string;
      Country: string;
      Region: string;
      Province: string;
      City: string;
      Barangay: string;
      Addressdetails: string;
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
  status: string;
  message: string;
  data: {
    postId: string;
  };
}

// POST API /organizations/{orgId}/posts/{postId}/update/additionalInfoLink
export interface UpdatePostAdditionalInfoLinkApi {
  status: string;
  message: string;
  data: null;
}

// POST API /organizations/{orgId}/posts/{postId}/job_details
export interface CreatePostJobDetailsApi {
  status: string;
  message: string;
  data: null;
}

// POST API /organizations/{orgId}/posts/{postId}/requirements
export interface CreatePostRequirementsApi {
  status: string;
  message: string;
  data: null;
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
