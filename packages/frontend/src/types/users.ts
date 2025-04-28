import { Signal } from "@builder.io/qwik";

// GET API /users/account/details"
export interface GetAccountDetailsAPI {
  response: {
    status: string;
    message: string;
    data: {
      userId: string;
      email: string;
      mobileNumber: string;
      resumeLink: string;
      createdAt: number;
      updatedAt: number;
    };
  };
}

// PUT API /users/update/info"
export interface UpdateUserInfoApi {
  bodyParams: {
    resumeLink?: string;
    email?: string;
    mobileNumber?: string;
  };
  response: {
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
  };
}

type UserSkill = {
  skillId: string;
  skillName: string;
  skillLevel: string;
  skillCategory: string;
};

// GET API /users/skills
export interface GetUserSkillsApi {
  response: {
    status: string;
    message: string;
    data: {
      skills: UserSkill[];
    };
  };
}

// POST API /users/skills
export interface CreateUserSkillsApi {
  bodyParams: {
    skills: {
      skillName: string;
      skillLevel: string;
      skillCategory: string;
    }[];
  };
  response: {
    status: string;
    message: string;
    data: {
      skills: UserSkill[];
    };
  };
}

// GET API /users/saved-posts
export interface GetSavedPostByUserIdApi {
  queryStrings: {
    page: Signal<number>;
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
        isSaved: boolean;
        postedAt: number; // Assuming it's a timestamp (UNIX time in seconds or milliseconds)
      }[];
    };
  };
}
