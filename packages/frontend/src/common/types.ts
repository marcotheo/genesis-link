export type Address = {
  Addressid: string;
  Country: string;
  Region: string;
  Province: string;
  City: string;
  Barangay: string;
  Addressdetails: string;
};

// GET API /api/v1/address
export interface ListAddressResponse {
  status: string;
  message: string;
  data: Address[];
}

export type Post = {
  Postid: string;
  Title: string;
  Company: string;
  Deadline: number;
};

// GET /api/v1/posts/list
export interface ListPostsResponse {
  status: string;
  message: string;
  data: {
    Posts: Post[];
    Total: number;
  };
}

// POST /api/v1/posts/create
export interface CreatePostResponse {
  status: string;
  message: string;
  data: {
    PostId: string;
  };
}

// POST API /api/v1/s3/generate/url/put
export interface GenerateS3SignedUrlPut {
  status: string;
  message: string;
  data: {
    URL: string;
    Method: "PUT" | "GET" | "POST";
    SignedHeader: {
      Host: string[];
    };
  };
}

// GET API /api/v1/users/{userId}
export interface GetUserAPI {
  status: string;
  message: string;
  data: {
    userId: string;
    email: string;
    mobileNumber: string;
    resumelink: string;
    createdAt: string;
    updatedAt: string;
  };
}
