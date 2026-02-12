"use client";

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumePreview from '@/components/ResumePreview';
import PDFExport from '@/components/PDFExport';
import { Resume } from '@/types/resume';

type Step = 'upload' | 'parse' | 'input-jd' | 'optimize' | 'preview';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null);
  const [modifiedResume, setModifiedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError('');
    setIsLoading(true);
    setCurrentStep('parse');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success || !data.resume) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setOriginalResume(data.resume);
      setCurrentStep('input-jd');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume');
      setCurrentStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeResume = async () => {
    if (!originalResume || !jobDescription.trim()) return;

    setError('');
    setIsLoading(true);
    setCurrentStep('optimize');

    try {
      const response = await fetch('/api/modify-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: originalResume,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.modifiedResume) {
        throw new Error(data.error || 'Failed to optimize resume');
      }

      setModifiedResume(data.modifiedResume);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume');
      setCurrentStep('input-jd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setOriginalResume(null);
    setModifiedResume(null);
    setJobDescription('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            AI Resume Builder
          </h1>
          <p className="text-lg text-gray-600">
            Optimize your resume for any job description using AI
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'input-jd', label: 'Job Description' },
              { id: 'preview', label: 'Preview' },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-semibold
                    ${
                      currentStep === step.id ||
                      (currentStep === 'parse' && step.id === 'upload') ||
                      (currentStep === 'optimize' && step.id === 'input-jd') ||
                      (currentStep === 'preview' && index < 2)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm md:text-base font-medium text-gray-700 hidden md:inline">
                  {step.label}
                </span>
                {index < 2 && (
                  <div className="w-8 md:w-16 h-1 mx-2 bg-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        {(currentStep === 'upload' || currentStep === 'parse') && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Upload Your Resume
            </h2>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p>Parsing your resume...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Job Description Input */}
        {currentStep === 'input-jd' && originalResume && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Resume
              </h2>
              <ResumePreview resume={originalResume} title="" />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Enter Job Description
              </h2>
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                onSubmit={handleOptimizeResume}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Step 3: Optimizing */}
        {currentStep === 'optimize' && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Optimizing Your Resume
            </h2>
            <p className="text-gray-600">
              AI is analyzing the job description and tailoring your resume...
            </p>
          </div>
        )}

        {/* Step 4: Preview Results */}
        {currentStep === 'preview' && originalResume && modifiedResume && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResumePreview resume={originalResume} title="Original Resume" />
              </div>
              <div>
                <ResumePreview
                  resume={modifiedResume}
                  title="Optimized Resume"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Download Your Optimized Resume
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <PDFExport
                    resume={modifiedResume}
                    fileName="optimized-resume.pdf"
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
