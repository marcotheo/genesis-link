// POST API /applications/create
export interface CreateApplication {
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
