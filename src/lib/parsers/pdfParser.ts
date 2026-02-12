/**
 * Parse PDF file and extract text content
 * @param buffer - PDF file buffer
 * @returns Extracted text from PDF
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic require to avoid webpack bundling issues
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('PDF contains no extractable text. Please ensure it is a text-based PDF, not a scanned image.');
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
    throw new Error('Failed to parse PDF file');
  }
}
