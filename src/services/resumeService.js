const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const natural = require('natural');
// const pdfParse = typeof pdfParseLib === 'function'
//   ? pdfParseLib
//   : pdfParseLib.default;
//   const pdfParseLib = require('pdf-parse');

// console.log("PDF PARSE LIB TYPE:", typeof pdfParseLib);
// console.log("PDF PARSE LIB VALUE:", pdfParseLib);

const { User, Skill, UserSkill } = require('../models');

// Upload directory for resumes (relative to project root)
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['application/pdf'];

/**
 * Ensures upload directory exists.
 */
async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Extracts text from a PDF buffer.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return (data?.text || '').trim();
}

/**
 * Tokenizes text and normalizes for keyword extraction.
 * Uses natural library for stemming and tokenization.
 */
function tokenizeAndNormalize(text) {
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return (tokens || []).map((t) => stemmer.stem(t)).filter(Boolean);
}

/**
 * Extracts education mentions from resume text using regex patterns.
 */
function extractEducation(text) {
  const education = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const degreePatterns = [
    /\b(b\.?s\.?|b\.?tech|b\.?e\.?|b\.?c\.?a|b\.?a\.?|b\.?com|m\.?s\.?|m\.?tech|m\.?b\.?a|m\.?c\.?a|phd|bachelor|master|graduation)\b/i,
    /\b(b\.?e\.?\.?h\.?e\.?|b\.?s\.?c|m\.?s\.?c|b\.?a\.?\.?h\.?\.?e\.?)\b/i,
  ];

  const institutionPattern = /\b(college|university|institute|school|polytechnic|iit|nit|bits)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of degreePatterns) {
      if (pat.test(line)) {
        const match = line.match(pat);
        if (match) {
          education.push({ text: line, type: 'degree' });
          break;
        }
      }
    }
    if (institutionPattern.test(line) && !education.some((e) => e.text === line)) {
      education.push({ text: line, type: 'institution' });
    }
  }

  return education.slice(0, 10); // Limit to 10 entries
}

/**
 * Extracts experience mentions from resume text.
 */
function extractExperience(text) {
  const experience = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const rolePatterns = [
    /\b(intern|internship|developer|engineer|analyst|manager|consultant|associate|lead)\b/i,
    /\b(junior|senior|software|data|full.?stack|front.?end|back.?end)\b/i,
  ];

  const companyPattern = /\b(at|@|company|work|experience)\s+([\w\s\-\.&]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (rolePatterns.some((p) => p.test(line))) {
      experience.push({ text: line, type: 'role' });
    } else if (companyPattern.test(line)) {
      experience.push({ text: line, type: 'company' });
    }
  }

  return experience.slice(0, 15);
}

/**
 * Matches extracted keywords to existing Skill records.
 * Uses stemmed token overlap and fuzzy matching.
 */
async function matchSkillsFromText(text) {
  const dbSkills = await Skill.findAll({ attributes: ['id', 'name'] });
  const textLower = text.toLowerCase();
  const stemmedText = tokenizeAndNormalize(text);
  const textSet = new Set(stemmedText);

  const matched = [];

  for (const skill of dbSkills) {
    const skillName = (skill.name || '').toLowerCase();
    const skillStems = tokenizeAndNormalize(skillName);

    const stemMatch = skillStems.length > 0 && skillStems.every((s) => textSet.has(s));
    const substringMatch = textLower.includes(skillName);

    if (stemMatch || substringMatch) {
      matched.push({ skillId: skill.id, name: skill.name });
    }
  }

  return matched;
}

/**
 * Parses resume buffer and returns structured data.
 */
async function parseResumeBuffer(buffer) {
  const text = await extractTextFromPdf(buffer);
  if (!text || text.length < 50) {
    const error = new Error('Could not extract sufficient text from resume');
    error.status = 400;
    throw error;
  }

  const [skills, education, experience] = await Promise.all([
    matchSkillsFromText(text),
    Promise.resolve(extractEducation(text)),
    Promise.resolve(extractExperience(text)),
  ]);

  const keywords = tokenizeAndNormalize(text).slice(0, 50);

  return {
    skills: skills.map((s) => ({ skillId: s.skillId, name: s.name })),
    education,
    experience,
    extractedKeywords: keywords,
    rawTextLength: text.length,
  };
}

/**
 * Updates user's skill profile from parsed resume data.
 * Merges extracted skills with existing UserSkills (avoids duplicates).
 */
async function updateUserSkillsFromParsedData(userId, parsedData) {
  const existingUserSkills = await UserSkill.findAll({
    where: { user_id: userId },
    attributes: ['skill_id'],
  });
  const existingIds = new Set(existingUserSkills.map((us) => us.skill_id));

  const toAdd = parsedData.skills.filter((s) => !existingIds.has(s.skillId));

  if (toAdd.length > 0) {
    await UserSkill.bulkCreate(
      toAdd.map((s) => ({
        user_id: userId,
        skill_id: s.skillId,
        proficiency_level: 'intermediate',
      })),
    );
  }

  return toAdd.length;
}

/**
 * Full flow: save file, parse, update user profile.
 */
async function processResumeUpload(userId, fileBuffer, originalName) {
  await ensureUploadDir();

  const ext = path.extname(originalName || '') || '.pdf';
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const relativePath = path.join('uploads', 'resumes', filename).replace(/\\/g, '/');

  await fs.writeFile(filepath, fileBuffer);

  const parsedData = await parseResumeBuffer(fileBuffer);
  const addedSkills = await updateUserSkillsFromParsedData(userId, parsedData);

  const user = await User.findByPk(userId);
  if (user) {
    await user.update({
      resume_path: relativePath,
      parsed_resume_data: parsedData,
    });
  }

  return {
    resume_path: relativePath,
    parsed: parsedData,
    skills_added: addedSkills,
  };
}

/**
 * Validates file for resume upload.
 */
function validateResumeFile(file) {
  if (!file || !file.buffer) {
    const error = new Error('No file provided');
    error.status = 400;
    throw error;
  }
  if (file.size > MAX_FILE_SIZE) {
    const error = new Error('File size exceeds 5MB limit');
    error.status = 400;
    throw error;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('Only PDF resumes are allowed');
    error.status = 400;
    throw error;
  }
}

/**
 * Check if a business user is allowed to view a student's resume.
 * Allowed when the student has applied to at least one project owned by the business.
 */
async function canBusinessViewStudentResume(studentUserId, businessUserId) {
  const { Application, Project } = require('../models');
  const application = await Application.findOne({
    where: { student_user_id: studentUserId },
    include: [{ model: Project, required: true, where: { business_user_id: businessUserId } }],
  });
  return !!application;
}

/**
 * Get absolute file path for a student's resume if the business is allowed to view it.
 * @returns {Promise<{ absolutePath: string, studentName: string }>}
 */
async function getResumeForBusinessView(studentUserId, businessUserId) {
  const allowed = await canBusinessViewStudentResume(studentUserId, businessUserId);
  if (!allowed) {
    const error = new Error('You can only view resumes of students who have applied to your projects');
    error.status = 403;
    throw error;
  }

  const user = await User.findByPk(studentUserId, {
    attributes: ['id', 'name', 'resume_path'],
  });

  if (!user || !user.resume_path) {
    const error = new Error('Student has not uploaded a resume');
    error.status = 404;
    throw error;
  }

  const absolutePath = path.join(process.cwd(), user.resume_path);
  try {
    await fs.access(absolutePath);
  } catch (e) {
    const error = new Error('Resume file not found');
    error.status = 404;
    throw error;
  }

  return { absolutePath, studentName: user.name };
}

module.exports = {
  processResumeUpload,
  parseResumeBuffer,
  validateResumeFile,
  ensureUploadDir,
  getResumeForBusinessView,
  canBusinessViewStudentResume,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
};