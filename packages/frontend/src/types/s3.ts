export type PresignedHTTPRequest = {
  Method: string; // HTTP method, e.g., "GET", "PUT"
  URL: string; // Presigned URL
  SignedHeader?: Record<string, string>; // Optional headers for the request
};

// POST API /s3/generate/signed/url/put
export interface GenerateS3SignedUrlPutApi {
  bodyParams: {
    key: string;
  };
  response: {
    status: string;
    message: string;
    data: {
      URL: string;
      Method: "PUT" | "GET" | "POST";
      SignedHeader: {
        Host: string[];
      };
    };
  };
}
