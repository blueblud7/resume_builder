import { Resume } from './resume';

// Upload API
export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileType?: string;
  error?: string;
}

// Parse API
export interface ParseRequest {
  file: File;
}

export interface ParseResponse {
  success: boolean;
  resume?: Resume;
  rawText?: string;
  error?: string;
}

// Modify Resume API
export interface ModifyResumeRequest {
  resume: Resume;
  jobDescription: string;
}

export interface ModifyResumeResponse {
  success: boolean;
  modifiedResume?: Resume;
  error?: string;
}

// Generate PDF API
export interface GeneratePDFRequest {
  resume: Resume;
}

export interface GeneratePDFResponse {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
}
