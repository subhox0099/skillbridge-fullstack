const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = {
  uploadResume: upload.single('resume'),
  ensureDir,
};
