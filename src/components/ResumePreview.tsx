"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Resume } from '@/types/resume';

interface ResumePreviewProps {
  resume: Resume;
  title?: string;
  editable?: boolean;
  onUpdate?: (resume: Resume) => void;
}

// --- Inline editable text ---
function EditableText({
  value,
  onSave,
  className,
  as: Tag = 'span',
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h3';
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (editing) {
    const common = {
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onBlur: () => {
        setEditing(false);
        if (draft.trim() !== value) onSave(draft.trim());
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
          (e.target as HTMLElement).blur();
        }
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      },
      className: `${className ?? ''} w-full border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white`,
    };

    return multiline ? (
      <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} rows={3} {...common} />
    ) : (
      <input ref={ref as React.RefObject<HTMLInputElement>} type="text" {...common} />
    );
  }

  return (
    <Tag
      className={`${className ?? ''} cursor-pointer hover:bg-blue-50 rounded px-0.5 transition-colors`}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">Click to edit</span>}
    </Tag>
  );
}

// --- Reorder / Delete buttons ---
function ItemControls({
  index,
  total,
  onMove,
  onDelete,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onDelete: (index: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 ml-2 flex-shrink-0">
      <button
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        className="px-1 py-0.5 text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        ▲
      </button>
      <button
        onClick={() => onMove(index, index + 1)}
        disabled={index === total - 1}
        className="px-1 py-0.5 text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        ▼
      </button>
      <button
        onClick={() => onDelete(index)}
        className="px-1 py-0.5 text-xs text-red-400 hover:text-red-600"
        title="Delete"
      >
        ✕
      </button>
    </span>
  );
}

export default function ResumePreview({
  resume,
  title = "Resume",
  editable = false,
  onUpdate,
}: ResumePreviewProps) {
  // Deep-clone helper to avoid mutating props
  const update = useCallback(
    (mutator: (draft: Resume) => void) => {
      if (!onUpdate) return;
      const draft: Resume = JSON.parse(JSON.stringify(resume));
      mutator(draft);
      onUpdate(draft);
    },
    [resume, onUpdate],
  );

  // Generic array reorder
  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length) return arr;
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-8 border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-6 pb-2 border-b">
          {title}
        </h3>
      )}

      {/* Personal Info */}
      <div className="mb-6">
        {editable ? (
          <EditableText
            value={resume.personalInfo.name}
            onSave={(v) => update((d) => { d.personalInfo.name = v; })}
            className="text-3xl font-bold text-gray-900 mb-2 block"
            as="h1"
          />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {resume.personalInfo.name}
          </h1>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {editable ? (
            <>
              <EditableText
                value={resume.personalInfo.email}
                onSave={(v) => update((d) => { d.personalInfo.email = v; })}
              />
              {resume.personalInfo.phone !== undefined && (
                <>
                  <span>•</span>
                  <EditableText
                    value={resume.personalInfo.phone || ''}
                    onSave={(v) => update((d) => { d.personalInfo.phone = v; })}
                  />
                </>
              )}
              {resume.personalInfo.location !== undefined && (
                <>
                  <span>•</span>
                  <EditableText
                    value={resume.personalInfo.location || ''}
                    onSave={(v) => update((d) => { d.personalInfo.location = v; })}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <span>{resume.personalInfo.email}</span>
              {resume.personalInfo.phone && <span>• {resume.personalInfo.phone}</span>}
              {resume.personalInfo.location && <span>• {resume.personalInfo.location}</span>}
            </>
          )}
          {resume.personalInfo.linkedin && (
            editable ? (
              <EditableText
                value={resume.personalInfo.linkedin}
                onSave={(v) => update((d) => { d.personalInfo.linkedin = v; })}
                className="text-blue-600"
              />
            ) : (
              <a
                href={resume.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            )
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-300">
            Summary
          </h2>
          {editable ? (
            <EditableText
              value={resume.summary}
              onSave={(v) => update((d) => { d.summary = v; })}
              className="text-gray-700 leading-relaxed block"
              as="p"
              multiline
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          )}
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
                  <div className="flex items-center">
                    {editable ? (
                      <EditableText
                        value={exp.position}
                        onSave={(v) => update((d) => { d.experience[index].position = v; })}
                        className="text-lg font-semibold text-gray-900"
                        as="h3"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exp.position}
                      </h3>
                    )}
                    {editable && (
                      <ItemControls
                        index={index}
                        total={resume.experience.length}
                        onMove={(from, to) =>
                          update((d) => { d.experience = moveItem(d.experience, from, to); })
                        }
                        onDelete={(i) =>
                          update((d) => { d.experience.splice(i, 1); })
                        }
                      />
                    )}
                  </div>
                  {editable ? (
                    <span className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap ml-4">
                      <EditableText
                        value={exp.startDate}
                        onSave={(v) => update((d) => { d.experience[index].startDate = v; })}
                      />
                      <span>-</span>
                      <EditableText
                        value={exp.endDate}
                        onSave={(v) => update((d) => { d.experience[index].endDate = v; })}
                      />
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  )}
                </div>
                {editable ? (
                  <EditableText
                    value={exp.company}
                    onSave={(v) => update((d) => { d.experience[index].company = v; })}
                    className="text-md text-gray-700 font-medium mb-2 block"
                    as="p"
                  />
                ) : (
                  <p className="text-md text-gray-700 font-medium mb-2">
                    {exp.company}
                  </p>
                )}
                <ul className="list-disc list-inside space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed flex items-start gap-1">
                      {editable ? (
                        <>
                          <span className="mt-0.5 flex-shrink-0">•</span>
                          <EditableText
                            value={desc}
                            onSave={(v) =>
                              update((d) => { d.experience[index].description[i] = v; })
                            }
                            className="flex-1"
                          />
                          <ItemControls
                            index={i}
                            total={exp.description.length}
                            onMove={(from, to) =>
                              update((d) => {
                                d.experience[index].description = moveItem(
                                  d.experience[index].description,
                                  from,
                                  to,
                                );
                              })
                            }
                            onDelete={(bi) =>
                              update((d) => { d.experience[index].description.splice(bi, 1); })
                            }
                          />
                        </>
                      ) : (
                        desc
                      )}
                    </li>
                  ))}
                </ul>
                {editable && (
                  <button
                    onClick={() =>
                      update((d) => { d.experience[index].description.push('New bullet point'); })
                    }
                    className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    + Add bullet
                  </button>
                )}
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
                  <div className="flex items-center">
                    <div>
                      {editable ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <EditableText
                            value={edu.degree}
                            onSave={(v) => update((d) => { d.education[index].degree = v; })}
                            className="text-lg font-semibold text-gray-900"
                            as="h3"
                          />
                          <span className="text-lg font-semibold text-gray-900">in</span>
                          <EditableText
                            value={edu.field}
                            onSave={(v) => update((d) => { d.education[index].field = v; })}
                            className="text-lg font-semibold text-gray-900"
                            as="h3"
                          />
                        </div>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900">
                          {edu.degree} in {edu.field}
                        </h3>
                      )}
                      {editable ? (
                        <EditableText
                          value={edu.institution}
                          onSave={(v) => update((d) => { d.education[index].institution = v; })}
                          className="text-gray-700"
                          as="p"
                        />
                      ) : (
                        <p className="text-gray-700">{edu.institution}</p>
                      )}
                    </div>
                    {editable && (
                      <ItemControls
                        index={index}
                        total={resume.education.length}
                        onMove={(from, to) =>
                          update((d) => { d.education = moveItem(d.education, from, to); })
                        }
                        onDelete={(i) =>
                          update((d) => { d.education.splice(i, 1); })
                        }
                      />
                    )}
                  </div>
                  {editable ? (
                    <EditableText
                      value={edu.graduationDate}
                      onSave={(v) => update((d) => { d.education[index].graduationDate = v; })}
                      className="text-sm text-gray-600 whitespace-nowrap ml-4"
                    />
                  ) : (
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                      {edu.graduationDate}
                    </span>
                  )}
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
                className={`px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm ${
                  editable ? 'flex items-center gap-1' : ''
                }`}
              >
                {editable ? (
                  <>
                    <EditableText
                      value={skill}
                      onSave={(v) => update((d) => { d.skills[index] = v; })}
                    />
                    <button
                      onClick={() => update((d) => { d.skills.splice(index, 1); })}
                      className="text-xs text-red-400 hover:text-red-600 ml-1"
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  skill
                )}
              </span>
            ))}
            {editable && (
              <button
                onClick={() => update((d) => { d.skills.push('New Skill'); })}
                className="px-3 py-1 border border-dashed border-blue-400 text-blue-500 rounded-full text-sm hover:bg-blue-50"
              >
                + Add skill
              </button>
            )}
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
                <div className="flex items-center mb-1">
                  {editable ? (
                    <EditableText
                      value={project.name}
                      onSave={(v) => update((d) => { d.projects![index].name = v; })}
                      className="text-lg font-semibold text-gray-900"
                      as="h3"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.name}
                    </h3>
                  )}
                  {editable && (
                    <ItemControls
                      index={index}
                      total={resume.projects!.length}
                      onMove={(from, to) =>
                        update((d) => { d.projects = moveItem(d.projects!, from, to); })
                      }
                      onDelete={(i) =>
                        update((d) => { d.projects!.splice(i, 1); })
                      }
                    />
                  )}
                </div>
                {editable ? (
                  <EditableText
                    value={project.description}
                    onSave={(v) => update((d) => { d.projects![index].description = v; })}
                    className="text-gray-700 mb-2 block"
                    as="p"
                    multiline
                  />
                ) : (
                  <p className="text-gray-700 mb-2">{project.description}</p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Technologies:</span>{' '}
                  {editable ? (
                    <EditableText
                      value={project.technologies.join(', ')}
                      onSave={(v) =>
                        update((d) => {
                          d.projects![index].technologies = v
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                        })
                      }
                    />
                  ) : (
                    project.technologies.join(', ')
                  )}
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
              <div key={index} className="ml-2 flex items-center">
                {editable ? (
                  <>
                    <p className="text-gray-700 flex items-center gap-1 flex-wrap">
                      <EditableText
                        value={cert.name}
                        onSave={(v) => update((d) => { d.certifications![index].name = v; })}
                        className="font-semibold"
                      />
                      <span>-</span>
                      <EditableText
                        value={cert.issuer}
                        onSave={(v) => update((d) => { d.certifications![index].issuer = v; })}
                      />
                      <span>(</span>
                      <EditableText
                        value={cert.date}
                        onSave={(v) => update((d) => { d.certifications![index].date = v; })}
                      />
                      <span>)</span>
                    </p>
                    <ItemControls
                      index={index}
                      total={resume.certifications!.length}
                      onMove={(from, to) =>
                        update((d) => {
                          d.certifications = moveItem(d.certifications!, from, to);
                        })
                      }
                      onDelete={(i) =>
                        update((d) => { d.certifications!.splice(i, 1); })
                      }
                    />
                  </>
                ) : (
                  <p className="text-gray-700">
                    <span className="font-semibold">{cert.name}</span> - {cert.issuer} ({cert.date})
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
