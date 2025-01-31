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
        company: string;
        description: string;
        tags: string[];
        postedAt: number;
      }[];
    };
  };
}
