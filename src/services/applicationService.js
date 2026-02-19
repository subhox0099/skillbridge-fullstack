const { Application, Project, User } = require('../models');
const emailService = require('./emailService');
const notificationService = require('./notificationService');

async function applyToProject({ projectId, studentUserId, coverLetter }) {
  const project = await Project.findByPk(projectId, {
    include: [{ model: User, as: 'business', attributes: ['id', 'name', 'email'] }],
  });
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const existing = await Application.findOne({
    where: {
      project_id: projectId,
      student_user_id: studentUserId,
    },
  });

  if (existing) {
    const error = new Error('You have already applied to this project');
    error.status = 400;
    throw error;
  }

  const student = await User.findByPk(studentUserId);
  const application = await Application.create({
    project_id: projectId,
    student_user_id: studentUserId,
    cover_letter: coverLetter,
  });

  // Send email and notification to student (non-blocking)
  if (student) {
    emailService.sendApplicationReceivedEmail({
      studentEmail: student.email,
      studentName: student.name,
      projectTitle: project.title,
      businessName: project.business?.name || 'Business',
    }).catch(err => console.error('Failed to send email to student:', err));

    notificationService.createNotification({
      userId: studentUserId,
      type: 'APPLICATION_SUBMITTED',
      message: `Your application for "${project.title}" has been received.`,
      relatedId: application.id,
      relatedType: 'application',
      sendEmail: false,
    }).catch(err => console.error('Failed to create notification:', err));
  }

  // Send email and notification to business (non-blocking)
  if (project.business) {
    emailService.sendNewApplicationReceivedEmail({
      businessEmail: project.business.email,
      businessName: project.business.name,
      studentName: student?.name || 'A student',
      projectTitle: project.title,
    }).catch(err => console.error('Failed to send email to business:', err));

    notificationService.createNotification({
      userId: project.business.id,
      type: 'NEW_APPLICATION',
      message: `${student?.name || 'A student'} applied to your project "${project.title}".`,
      relatedId: application.id,
      relatedType: 'application',
      sendEmail: false,
    }).catch(err => console.error('Failed to create notification:', err));
  }

  return application;
}

async function updateApplicationStatus({ applicationId, status, businessUserId }) {
  const application = await Application.findByPk(applicationId, {
    include: [
      { model: Project, include: [{ model: User, as: 'business' }] },
      { model: User, as: 'student' },
    ],
  });

  if (!application) {
    const error = new Error('Application not found');
    error.status = 404;
    throw error;
  }

  if (application.Project.business_user_id !== businessUserId) {
    const error = new Error('Unauthorized');
    error.status = 403;
    throw error;
  }

  application.status = status;
  await application.save();

  // Send email and notification to student (non-blocking)
  if (application.student) {
    emailService.sendApplicationStatusUpdateEmail({
      studentEmail: application.student.email,
      studentName: application.student.name,
      projectTitle: application.Project.title,
      status,
      businessName: application.Project.business?.name || 'Business',
    }).catch(err => console.error('Failed to send status update email:', err));

    notificationService.createNotification({
      userId: application.student_user_id,
      type: 'APPLICATION_STATUS_UPDATE',
      message: `Your application for "${application.Project.title}" has been ${status.toLowerCase()}.`,
      relatedId: application.id,
      relatedType: 'application',
      sendEmail: false,
    }).catch(err => console.error('Failed to create notification:', err));
  }

  return application;
}

async function getApplications({ projectId, studentUserId, businessUserId }) {
  const where = {};
  
  if (projectId) {
    where.project_id = projectId;
  }
  
  if (studentUserId) {
    where.student_user_id = studentUserId;
  }

  const applications = await Application.findAll({
    where,
    include: [
      {
        model: Project,
        include: [
          { model: User, as: 'business', attributes: ['id', 'name', 'email'] },
        ],
      },
      { model: User, as: 'student', attributes: ['id', 'name', 'email', 'average_rating'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Filter by business if provided
  if (businessUserId) {
    return applications.filter(app => app.Project.business_user_id === businessUserId);
  }

  return applications;
}

module.exports = {
  applyToProject,
  updateApplicationStatus,
  getApplications,
};

