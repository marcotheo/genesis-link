// POST API /posts/search/jobs
export interface SearchJobsApi {
  bodyParams: {
    keyword: string;
    page: number;
    workSetup?: string;
    province?: string;
    city?: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      posts: {
        postId: string;
        title: string;
        company?: string;
        description: string;
        workSetup: string;
        jobType: string;
        salaryAmountMin: number;
        salaryAmountMax: number;
        salaryCurrency: string;
        salaryType: string;
        country: string;
        city: string;
        tags: string[];
        postedAt: number; // Assuming it's a timestamp (UNIX time in seconds or milliseconds)
      }[];
    };
  };
}

// GET API /posts/{postId}
export interface GetJobPostDetails {
  pathParams: {
    postId: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      postId: string;
      title: string;
      company?: string;
      additionalInfoLink: string;
      description: string;
      workSetup: string;
      jobType: string;
      salaryAmountMin: number;
      salaryAmountMax: number;
      salaryCurrency: string;
      salaryType: string;
      country: string;
      city: string;
      tags: string[];
      requirements: {
        requirementType: "responsibility" | "qualification";
        requirement: string;
      }[];
      postedAt: number; // Assuming it's a timestamp (UNIX time in seconds or milliseconds)
    };
  };
}

// POST API /posts/{postId}/save
export interface CreateSavedPostApi {
  pathParams: {
    postId: string;
  };
  response: {
    status: string;
    message: string;
    data: null;
  };
}

// GET API /posts/{postId}/save
export interface GetUserSavedPostApi {
  pathParams: {
    postId: string;
  };
  response: {
    status: string;
    message: string;
    data: { savePostId: string };
  };
}
