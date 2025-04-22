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

// GET API /applications/applicant
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
        proposalLink: string;
        status: string;
        postId: string;
        createdAt: number;
      };
    }[];
  };
}
