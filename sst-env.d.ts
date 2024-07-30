/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    GenesisLinkMainUserClient: {
      id: string
      secret: string
      type: "sst.aws.CognitoUserPoolClient"
    }
    GenesisLinkMainUserPool: {
      id: string
      type: "sst.aws.CognitoUserPool"
    }
  }
}
export {}