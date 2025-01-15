import { CreateUserSkillsApi } from "./users";
import { SignInApi, SignUpApi } from "./auth";

export interface MutationsType {
  "POST /auth/signin": SignInApi;
  "POST /auth/create": SignUpApi;

  "POST /users/skills": CreateUserSkillsApi;
}
