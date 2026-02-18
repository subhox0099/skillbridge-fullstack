const resumeService = require('../services/resumeService');

async function uploadResume(req, res, next) {
  try {
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'No resume file provided' });
    }

    resumeService.validateResumeFile({
      buffer: file.buffer,
      size: file.size,
      mimetype: file.mimetype,
    });

    const userId = req.user.id;
    const result = await resumeService.processResumeUpload(
      userId,
      file.buffer,
      file.originalname,
    );

    return res.status(201).json({
      message: 'Resume parsed and profile updated',
      resume_path: result.resume_path,
      parsed: result.parsed,
      skills_added: result.skills_added,
    });
  } catch (err) {
    return next(err);
  }
}

async function getParsedResume(req, res, next) {
  try {
    const userId = req.user.id;
    const { User } = require('../models');
    const user = await User.findByPk(userId, {
      attributes: ['id', 'resume_path', 'parsed_resume_data'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      resume_path: user.resume_path,
      parsed_resume_data: user.parsed_resume_data,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  uploadResume,
  getParsedResume,
};
