import PDFMerger from 'pdf-merger-js';
import path from 'path';

const merger = new PDFMerger();

const mergePdfs = async (filePaths) => {
  try {
    for (const filePath of filePaths) {
      await merger.add(filePath);
    }
    const outputPath = path.join(process.cwd(), 'public/merged.pdf');
    await merger.save(outputPath);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw error;
  }
};

export { mergePdfs };
