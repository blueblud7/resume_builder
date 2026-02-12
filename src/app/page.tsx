"use client";

import { useState, useCallback, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumePreview from '@/components/ResumePreview';
import PDFExport from '@/components/PDFExport';
import { Resume } from '@/types/resume';
import { generateCoverLetterPDF } from '@/lib/pdf/generator';

type Step = 'upload' | 'parse' | 'input-jd' | 'optimize' | 'preview';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalResume, setOriginalResume] = useState<Resume | null>(null);
  // editedResume: user's edits to the parsed resume before optimization
  const [editedResume, setEditedResume] = useState<Resume | null>(null);
  const [modifiedResume, setModifiedResume] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [savedResumeTimestamp, setSavedResumeTimestamp] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: number; label: string | null; createdAt: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const hasEdits = editedResume !== null;

  // The resume to send to the optimizer (edited version takes priority)
  const resumeForOptimization = editedResume ?? originalResume;

  // Auto-load saved resume and history on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/resume').then(res => res.json()),
      fetch('/api/resume/history').then(res => res.json()),
    ])
      .then(([resumeData, historyData]) => {
        if (resumeData.success && resumeData.resume) {
          setOriginalResume(resumeData.resume);
          setSavedResumeTimestamp(resumeData.updatedAt);
          setCurrentStep('input-jd');
        }
        if (historyData.success && historyData.history) {
          setHistory(historyData.history);
        }
      })
      .catch(() => {
        // ignore — just show upload screen
      })
      .finally(() => setIsInitialLoading(false));
  }, []);

  const saveResumeToDb = (resume: Resume, label?: string) => {
    fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, label }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.updatedAt) {
          setSavedResumeTimestamp(data.updatedAt);
          loadHistory();
        }
      })
      .catch(() => {
        // fire-and-forget
      });
  };

  const loadHistory = () => {
    fetch('/api/resume/history')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.history) {
          setHistory(data.history);
        }
      })
      .catch(() => {});
  };

  const handleRestoreFromHistory = (id: number) => {
    fetch(`/api/resume/history?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.entry) {
          setOriginalResume(data.entry.data);
          setEditedResume(null);
          setCurrentStep('input-jd');
          setShowHistory(false);
          // Save as current active resume
          saveResumeToDb(data.entry.data, `Restored from ${data.entry.label || new Date(data.entry.createdAt).toLocaleString()}`);
        }
      })
      .catch(() => {});
  };

  const handleDeleteHistoryEntry = (id: number) => {
    fetch(`/api/resume/history?id=${id}`, { method: 'DELETE' })
      .then(() => loadHistory())
      .catch(() => {});
  };

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
      setEditedResume(null);
      setCurrentStep('input-jd');

      // Auto-save parsed resume
      saveResumeToDb(data.resume, 'Uploaded resume');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume');
      setCurrentStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeEdit = useCallback((updated: Resume) => {
    setEditedResume(updated);
  }, []);

  const handleResetEdits = useCallback(() => {
    setEditedResume(null);
  }, []);

  const handleSaveAsBaseResume = () => {
    if (!resumeForOptimization) return;
    setOriginalResume(resumeForOptimization);
    setEditedResume(null);
    saveResumeToDb(resumeForOptimization, 'Manual save');
  };

  const handleOptimizeResume = async () => {
    if (!resumeForOptimization || !jobDescription.trim()) return;

    setError('');
    setIsLoading(true);
    setCurrentStep('optimize');

    try {
      const [resumeResponse, coverLetterResponse] = await Promise.all([
        fetch('/api/modify-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume: resumeForOptimization,
            jobDescription,
          }),
        }),
        fetch('/api/generate-cover-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume: resumeForOptimization,
            jobDescription,
            companyName: companyName.trim() || undefined,
          }),
        }),
      ]);

      const resumeData = await resumeResponse.json();
      const coverLetterData = await coverLetterResponse.json();

      if (!resumeData.success || !resumeData.modifiedResume) {
        throw new Error(resumeData.error || 'Failed to optimize resume');
      }

      setModifiedResume(resumeData.modifiedResume);

      if (coverLetterData.success && coverLetterData.coverLetter) {
        setCoverLetter(coverLetterData.coverLetter);
      }

      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume');
      setCurrentStep('input-jd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewJobDescription = () => {
    setModifiedResume(null);
    setCoverLetter('');
    setJobDescription('');
    setCompanyName('');
    setError('');
    setCurrentStep('input-jd');
  };

  const handleClearSavedResume = () => {
    fetch('/api/resume', { method: 'DELETE' }).catch(() => {});
    setCurrentStep('upload');
    setSelectedFile(null);
    setOriginalResume(null);
    setEditedResume(null);
    setModifiedResume(null);
    setCoverLetter('');
    setJobDescription('');
    setCompanyName('');
    setError('');
    setSavedResumeTimestamp(null);
  };

  if (isInitialLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Your Resume
                  </h2>
                  {savedResumeTimestamp && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last saved: {new Date(savedResumeTimestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {hasEdits && (
                    <>
                      <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        Edited
                      </span>
                      <button
                        onClick={handleSaveAsBaseResume}
                        className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        Save as base resume
                      </button>
                      <button
                        onClick={handleResetEdits}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Reset to original
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {showHistory ? 'Hide history' : 'History'}
                  </button>
                  <span className="text-xs text-gray-400">
                    Click any field to edit
                  </span>
                </div>
              </div>

              {/* History Panel */}
              {showHistory && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Resume History</h3>
                  {history.length === 0 ? (
                    <p className="text-sm text-gray-400">No history yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {history.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {entry.label || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(entry.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleRestoreFromHistory(entry.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDeleteHistoryEntry(entry.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <ResumePreview
                resume={resumeForOptimization!}
                title=""
                editable
                onUpdate={handleResumeEdit}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Enter Job Description
              </h2>
              {hasEdits && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  Your edited resume will be used for optimization.
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Amazon, Meta..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                onSubmit={handleOptimizeResume}
                isLoading={isLoading}
              />
            </div>

            {/* Clear saved resume */}
            <div className="text-center">
              <button
                onClick={handleClearSavedResume}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear saved resume &amp; start over
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Optimizing */}
        {currentStep === 'optimize' && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Optimizing Your Resume & Generating Cover Letter
            </h2>
            <p className="text-gray-600">
              AI is analyzing the job description, tailoring your resume, and writing a cover letter...
            </p>
          </div>
        )}

        {/* Step 4: Preview Results */}
        {currentStep === 'preview' && originalResume && modifiedResume && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ResumePreview
                  resume={resumeForOptimization!}
                  title="Original Resume"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">
                    Click any field to edit
                  </span>
                </div>
                <ResumePreview
                  resume={modifiedResume}
                  title="Optimized Resume"
                  editable
                  onUpdate={setModifiedResume}
                />
              </div>
            </div>

            {/* Cover Letter Section */}
            {coverLetter && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Cover Letter
                </h2>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg text-gray-800 leading-relaxed resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const pdfDataUri = generateCoverLetterPDF(
                        coverLetter,
                        modifiedResume.personalInfo,
                        companyName.trim() || undefined
                      );
                      const link = document.createElement('a');
                      link.href = pdfDataUri;
                      link.download = `${modifiedResume.personalInfo.name.replace(/\s+/g, '_')}${companyName.trim() ? '_' + companyName.trim().replace(/\s+/g, '_') : ''}_CoverLetter.pdf`;
                      link.click();
                    }}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Download Cover Letter PDF
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Download Your Optimized Resume
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <PDFExport
                    resume={modifiedResume}
                    fileName={`${modifiedResume.personalInfo.name.replace(/\s+/g, '_')}${companyName.trim() ? '_' + companyName.trim().replace(/\s+/g, '_') : ''}.pdf`}
                  />
                </div>
                <button
                  onClick={handleNewJobDescription}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  New Job Description
                </button>
                <button
                  onClick={handleClearSavedResume}
                  className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Clear Saved Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
