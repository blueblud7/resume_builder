"use client";

import { Resume } from '@/types/resume';

interface ResumePreviewProps {
  resume: Resume;
  title?: string;
}

export default function ResumePreview({ resume, title = "Resume" }: ResumePreviewProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-6 pb-2 border-b">
          {title}
        </h3>
      )}

      {/* Personal Info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resume.personalInfo.name}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span>{resume.personalInfo.email}</span>
          {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
          {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
          {resume.personalInfo.linkedin && (
            <a
              href={resume.personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp, index) => (
              <div key={index} className="ml-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exp.position}
                  </h3>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <p className="text-md text-gray-700 font-medium mb-2">
                  {exp.company}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed">
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu, index) => (
              <div key={index} className="ml-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                    {edu.graduationDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2 ml-2">
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((project, index) => (
              <div key={index} className="ml-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {project.name}
                </h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Technologies:</span>{' '}
                  {project.technologies.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Certifications
          </h2>
          <div className="space-y-2">
            {resume.certifications.map((cert, index) => (
              <div key={index} className="ml-2">
                <p className="text-gray-700">
                  <span className="font-semibold">{cert.name}</span> - {cert.issuer} ({cert.date})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
