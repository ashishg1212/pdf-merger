import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { mergePdfs } from './merge.js'; // Adjust the path as needed

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;

// Resolve __dirname and __filename for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates/index.html'));
});

// Handle PDF merging
app.post('/merge', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // Check if there are more than 10 files or not
    if (req.files.length > 10) {
      return res.status(400).send('You can only upload up to 10 files.');
    }

    // Define the path for the merged file
    const mergedFilePath = path.join(__dirname, 'public/merged.pdf');
    
    // Delete the previous merged file if it exists
    if (fs.existsSync(mergedFilePath)) {
      console.log('Deleting old merged file:', mergedFilePath);
      fs.unlinkSync(mergedFilePath);
      console.log('Old merged file deleted.');
    }

    const files = req.files.map(file => file.path);
    await mergePdfs(files);

    // Serve the new merged file
    res.redirect('/static/merged.pdf');
  } catch (error) {
    console.error('Error during PDF merging:', error);
    res.status(500).send('An error occurred while merging PDFs.');
  } finally {
    // Clean up uploaded files
    req.files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        console.log('Deleted uploaded file:', file.path);
      } catch (cleanupError) {
        console.error('Error deleting uploaded file:', file.path, cleanupError);
      }
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
