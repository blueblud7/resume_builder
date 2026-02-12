import { jsPDF } from 'jspdf';
import { Resume } from '@/types/resume';

/**
 * Generate PDF from Resume object
 * @param resume - Resume object to convert to PDF
 * @returns PDF as base64 string
 */
export function generateResumePDF(resume: Resume): string {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, yPosition);
    yPosition += lines.length * lineHeight;
  };

  const addSection = (title: string) => {
    yPosition += 5;
    doc.setDrawColor(0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    addText(title, margin, 14, true);
    yPosition += 2;
  };

  // Personal Info
  addText(resume.personalInfo.name, margin, 20, true);
  const contactInfo = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedin,
  ]
    .filter(Boolean)
    .join(' | ');
  addText(contactInfo, margin, 10);
  yPosition += 5;

  // Summary
  if (resume.summary) {
    addSection('SUMMARY');
    addText(resume.summary, margin);
  }

  // Experience
  if (resume.experience.length > 0) {
    addSection('EXPERIENCE');
    resume.experience.forEach((exp) => {
      addText(`${exp.position} at ${exp.company}`, margin, 12, true);
      addText(`${exp.startDate} - ${exp.endDate}`, margin, 10);
      exp.description.forEach((desc) => {
        addText(`• ${desc}`, margin + 5, 11);
      });
      yPosition += 3;
    });
  }

  // Education
  if (resume.education.length > 0) {
    addSection('EDUCATION');
    resume.education.forEach((edu) => {
      addText(`${edu.degree} in ${edu.field}`, margin, 12, true);
      addText(`${edu.institution} - ${edu.graduationDate}`, margin, 10);
      yPosition += 3;
    });
  }

  // Skills
  if (resume.skills.length > 0) {
    addSection('SKILLS');
    addText(resume.skills.join(', '), margin, 11);
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    addSection('PROJECTS');
    resume.projects.forEach((project) => {
      addText(project.name, margin, 12, true);
      addText(project.description, margin + 5, 11);
      addText(`Technologies: ${project.technologies.join(', ')}`, margin + 5, 10);
      yPosition += 3;
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    addSection('CERTIFICATIONS');
    resume.certifications.forEach((cert) => {
      addText(`${cert.name} - ${cert.issuer} (${cert.date})`, margin, 11);
    });
  }

  // Return as base64
  return doc.output('datauristring');
}
