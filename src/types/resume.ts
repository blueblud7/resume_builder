export interface Resume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }[];
  skills: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

export type FileType = 'pdf' | 'txt' | 'json';

export interface ParsedResume {
  resume: Resume;
  rawText: string;
}
