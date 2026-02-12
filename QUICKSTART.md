# Quick Start Guide

## 1. Environment Setup

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

## 2. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 3. Test the Application

### Option A: Use Sample JSON Resume

1. Click or drag the sample file into the upload area:
   ```
   sample-resumes/sample-resume.json
   ```

2. Copy the sample job description:
   ```
   sample-resumes/sample-job-description.txt
   ```

3. Paste it into the Job Description field

4. Click "Optimize Resume"

5. Wait for AI to process (15-30 seconds)

6. Review the comparison

7. Download the optimized PDF

### Option B: Use Your Own Resume

1. **PDF or TXT**: Upload your existing resume
   - The AI will automatically structure it

2. **JSON**: Format your resume according to the schema in README.md

## Common Issues

### Build Fails
```bash
# Clear build cache
rm -rf .next
npm run build
```

### OpenAI API Error
- Verify your API key is correct
- Check you have GPT-4 access
- Ensure you have available credits

### PDF Parsing Issues
- Ensure PDF is text-based (not scanned image)
- Try converting to TXT format first
- Use the JSON format for best results

## File Size Limits

- Maximum upload: 10MB
- Recommended: < 5MB for faster processing

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Review [TESTING.md](TESTING.md) for comprehensive testing
3. Customize the prompts in `src/lib/ai/openai.ts`
4. Adjust the PDF template in `src/lib/pdf/generator.ts`

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# OPENAI_API_KEY
```

### Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Set environment variables in your hosting platform

## Tips for Best Results

1. **Detailed Resumes**: More detail = better optimization
2. **Specific JDs**: Complete job descriptions yield better results
3. **Review Output**: Always review AI suggestions before using
4. **Iterative Process**: Try different JDs to see variations
5. **JSON Format**: Use JSON for most control and consistency

## Support

- Check [README.md](README.md) for full documentation
- Review [TESTING.md](TESTING.md) for troubleshooting
- Ensure Node.js version is 20.16.0 or higher
