import { Signal } from "@builder.io/qwik";

// POST API /applications
export interface CreateApplicationApi {
  bodyParams: {
    postId: string;
    proposalLink: string;
  };
  response: {
    status: string;
    message: string;
    data: null;
  };
}

// GET API /applications
export interface GetApplicationsByUserIdApi {
  queryStrings: {
    page: Signal<number>;
  };
  response: {
    status: string;
    message: string;
    data: {
      total: number;
      applications: {
        applicationId: string;
        company: string;
        title: string;
        status: string;
        postId: string;
        createdAt: number;
      }[];
    };
  };
}

// GET API /posts/{postId}/applications
export interface GetApplicationsByPostIdApi {
  pathParams: {
    postId: string;
  };
  queryStrings: {
    page: Signal<number>;
  };
  response: {
    status: string;
    message: string;
    data: {
      total: number;
      applications: {
        applicationId: string;
        name: string;
        email: string;
        mobileNumber: string;
        resumeLink: string;
        userId: string;
        status: string;
        createdAt: number;
      }[];
    };
  };
}
