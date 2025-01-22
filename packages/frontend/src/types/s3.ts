// POST API /s3//url/put
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
