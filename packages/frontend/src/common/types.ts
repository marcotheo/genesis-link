export type GetAPIMapping = {
  "/address": ListAddressResponse;
  "/posts/list": ListPostsResponse;
  "/users/{userId}": GetUserAPI;
  "/users/skills": GetUserSkills;
};

export type PostAPIMapping = {
  "/auth/signin": SignInResponse;
  "/posts/create": CreatePostResponse;
  "/s3/generate/url/put": GenerateS3SignedUrlPut;
  "/users/create/skills": GetUserSkills;
  "/users/update/info": null;
};

export type Address = {
  Addressid: string;
  Country: string;
  Region: string;
  Province: string;
  City: string;
  Barangay: string;
  Addressdetails: string;
};

// POST API /api/v1/auth/signin
export interface SignInResponse {
  status: string;
  message: string;
  data: {
    ExpiresIn: number;
  };
}

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
    resumeLink: string;
    createdAt: string;
    updatedAt: string;
  };
}

// GET API /api/v1/users/skills
export interface GetUserSkills {
  status: string;
  message: string;
  data: {
    skills: {
      skillId: string;
      skillName: string;
      skillLevel: string;
      skillCategory: string;
    }[];
  };
}
