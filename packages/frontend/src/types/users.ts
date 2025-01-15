// GET API /api/v1/users/{userId}
export interface GetUserAPI {
  parameters: null;
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

// GET API /api/v1/users/skills
export interface GetUserSkillsApi {
  parameters: null;
  response: {
    status: string;
    message: string;
    data: {
      skills: UserSkill[];
    };
  };
}

// POST API /api/v1/users/skills
export interface CreateUserSkillsApi {
  parameters: {
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
