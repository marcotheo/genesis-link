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
