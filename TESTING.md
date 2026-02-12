# Testing Checklist

## Pre-Testing Setup

- [ ] Set up `.env.local` with valid `OPENAI_API_KEY`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run build` to verify the build succeeds
- [ ] Run `npm run dev` to start the development server

## File Upload Tests

### PDF Upload
- [ ] Upload a valid PDF resume
- [ ] Verify the resume is parsed correctly
- [ ] Check that the personal information is extracted
- [ ] Verify experience, education, and skills are parsed

### TXT Upload
- [ ] Upload a text resume file
- [ ] Verify AI structures the unformatted text correctly
- [ ] Check all sections are properly identified

### JSON Upload
- [ ] Upload the sample-resume.json file
- [ ] Verify it loads without modification
- [ ] Check that validation accepts valid JSON
- [ ] Test with invalid JSON (should show error)

### File Validation
- [ ] Try uploading a file larger than 10MB (should reject)
- [ ] Try uploading an unsupported file type (e.g., .docx, .png)
- [ ] Verify clear error messages are displayed

## Job Description Input

- [ ] Paste a job description
- [ ] Verify character counter works
- [ ] Test Clear button functionality
- [ ] Verify "Optimize Resume" button is disabled when JD is empty
- [ ] Check that very long job descriptions are handled

## AI Resume Modification

- [ ] Click "Optimize Resume" with a valid JD
- [ ] Verify loading state is shown
- [ ] Check that the AI returns a modified resume
- [ ] Verify the modified resume maintains factual accuracy
- [ ] Compare original vs modified - keywords should align with JD

### Error Handling
- [ ] Test with invalid OpenAI API key (should show error)
- [ ] Test with network disconnection (should handle gracefully)
- [ ] Verify error messages are user-friendly

## Resume Preview

- [ ] Verify original resume displays correctly
- [ ] Verify modified resume displays correctly
- [ ] Check side-by-side comparison view
- [ ] Verify all sections render properly:
  - [ ] Personal Info
  - [ ] Summary
  - [ ] Experience
  - [ ] Education
  - [ ] Skills
  - [ ] Projects (if present)
  - [ ] Certifications (if present)

## PDF Generation

- [ ] Click "Download as PDF" button
- [ ] Verify PDF downloads successfully
- [ ] Open the PDF and check:
  - [ ] All content is present
  - [ ] Formatting is professional
  - [ ] Text is readable and not cut off
  - [ ] All sections are included

## UI/UX Tests

### Desktop View
- [ ] Verify layout on large screens (1920x1080)
- [ ] Check that all components are properly aligned
- [ ] Verify buttons and interactions work smoothly

### Tablet View
- [ ] Test on tablet size (768px width)
- [ ] Verify responsive design adjustments
- [ ] Check that side-by-side comparison stacks properly

### Mobile View
- [ ] Test on mobile size (375px width)
- [ ] Verify all components are usable
- [ ] Check that text is readable
- [ ] Verify buttons are touch-friendly

### Progress Steps
- [ ] Verify progress indicator updates correctly
- [ ] Check that active step is highlighted
- [ ] Test navigation through all steps

## Error States

- [ ] No file uploaded - verify helpful message
- [ ] Empty job description - verify button is disabled
- [ ] API error - verify clear error message
- [ ] Network error - verify retry option or clear message

## Full Workflow Test

1. [ ] Upload resume (PDF)
2. [ ] Verify resume is displayed
3. [ ] Enter job description
4. [ ] Click "Optimize Resume"
5. [ ] Wait for AI processing
6. [ ] Review both resumes side-by-side
7. [ ] Download optimized resume as PDF
8. [ ] Verify downloaded PDF is correct
9. [ ] Click "Start Over"
10. [ ] Verify all state is reset

## Performance Tests

- [ ] Upload large PDF (close to 10MB) - verify it handles well
- [ ] Upload very detailed resume - verify AI processes it
- [ ] Test with very long job description (5000+ chars)

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Limitations to Verify

- [ ] AI doesn't fabricate experience
- [ ] Original facts (dates, companies, education) are preserved
- [ ] Only descriptions and wording are optimized
- [ ] Requires valid OpenAI API key
- [ ] Requires internet connection

## Sample Test Scenarios

### Scenario 1: Software Engineer
- Use: `sample-resumes/sample-resume.json`
- JD: `sample-resumes/sample-job-description.txt`
- Expected: Resume highlights React, Node.js, microservices experience

### Scenario 2: Career Change
- Create a resume for one field
- Use JD for a different field
- Verify: AI highlights transferable skills

### Scenario 3: Entry Level
- Use resume with minimal experience
- Use senior-level JD
- Verify: AI emphasizes education and projects

## Post-Testing

- [ ] Check browser console for errors
- [ ] Verify no memory leaks (use browser dev tools)
- [ ] Check network tab for failed requests
- [ ] Review application logs for errors
- [ ] Test "Start Over" functionality resets everything

## Production Readiness

- [ ] All environment variables documented
- [ ] README.md is complete and accurate
- [ ] Sample files are helpful
- [ ] Error handling is comprehensive
- [ ] User feedback is clear and helpful
- [ ] Build completes without errors
- [ ] No console errors in production build
