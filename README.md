# AI Resume Builder

An AI-powered resume optimization tool that helps job seekers tailor their resumes to specific job descriptions using OpenAI's GPT-4.

## Features

- **Multi-format Support**: Upload resumes in PDF, TXT, or JSON format
- **AI-Powered Optimization**: Automatically optimize your resume for any job description
- **Side-by-Side Comparison**: Compare original and optimized resumes
- **PDF Export**: Download your optimized resume as a professional PDF
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **AI**: OpenAI API (GPT-4)
- **Styling**: Tailwind CSS
- **File Processing**: pdf-parse, jsPDF
- **File Upload**: react-dropzone

## Getting Started

### Prerequisites

- Node.js 20.16.0 or higher
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd resumebuilder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Upload Your Resume**
   - Drag and drop your resume file (PDF, TXT, or JSON)
   - Maximum file size: 10MB

2. **Enter Job Description**
   - Paste the job description for the position you're applying to
   - The AI will analyze the requirements and keywords

3. **Review Optimized Resume**
   - Compare your original resume with the AI-optimized version
   - See how the AI tailored your experience to match the job description

4. **Download**
   - Download your optimized resume as a professional PDF

## Resume JSON Format

If you're uploading a JSON file, use this format:

```json
{
  "personalInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-234-567-8900",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "description": [
        "Led development of key features",
        "Mentored junior developers"
      ]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduationDate": "May 2019"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["React", "TypeScript"]
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2023"
    }
  ]
}
```

## Project Structure

```
resumebuilder/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── parse/        # Resume parsing endpoint
│   │   │   ├── modify-resume/ # AI optimization endpoint
│   │   │   └── generate-pdf/  # PDF generation endpoint
│   │   ├── page.tsx          # Main application page
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── FileUpload.tsx
│   │   ├── JobDescriptionInput.tsx
│   │   ├── ResumePreview.tsx
│   │   └── PDFExport.tsx
│   ├── lib/
│   │   ├── parsers/          # File parsers
│   │   ├── ai/               # OpenAI integration
│   │   └── pdf/              # PDF generation
│   └── types/                # TypeScript type definitions
├── .env.local.example        # Environment variables template
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum upload file size in bytes | 10485760 (10MB) |

## Limitations

- The AI maintains factual accuracy and won't fabricate experience
- File size limit: 10MB
- Supported formats: PDF, TXT, JSON
- Requires internet connection for AI processing

## Troubleshooting

### Build Errors

If you encounter build errors related to `pdf-parse`:
- Ensure you're using Node.js 20.16.0 or higher
- Clear the `.next` folder and rebuild:
  ```bash
  rm -rf .next
  npm run build
  ```

### OpenAI API Errors

- Verify your API key is correct in `.env.local`
- Check your OpenAI account has sufficient credits
- Ensure you have access to GPT-4 model

## Future Enhancements

- User authentication and resume storage
- Multiple resume templates
- Cover letter generation
- LinkedIn profile optimization
- Resume version management
- A/B testing for multiple versions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
