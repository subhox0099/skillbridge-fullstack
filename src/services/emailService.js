const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Email queue for retry mechanism
const emailQueue = [];
let isProcessingQueue = false;

// Create transporter with better error handling
let transporter = null;

function initializeTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email service not configured. Emails will be queued but not sent.');
    return null;
  }

  try {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // For development/testing
      },
    };

    transporter = nodemailer.createTransport(config);

    // Verify connection asynchronously (don't block)
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email service configuration error:', error.message);
      } else {
        console.log('✅ Email service is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    return null;
  }
}

// Initialize transporter
transporter = initializeTransporter();

// Process email queue
async function processEmailQueue() {
  if (isProcessingQueue || emailQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (emailQueue.length > 0) {
    const emailData = emailQueue.shift();
    try {
      await sendEmailInternal(emailData);
    } catch (error) {
      console.error('Failed to send queued email:', error);
      // Retry logic: re-queue if not exceeded max retries
      if (emailData.retries < 3) {
        emailData.retries = (emailData.retries || 0) + 1;
        emailQueue.push(emailData);
      }
    }
  }
  
  isProcessingQueue = false;
}

/**
 * Email templates
 */
const templates = {
  applicationReceived: ({ studentName, projectTitle, businessName }) => ({
    subject: `Application Received for ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillBridge</h1>
            <p>Application Received</p>
          </div>
          <div class="content">
            <h2>Hello ${studentName},</h2>
            <p>Great news! Your application for <strong>${projectTitle}</strong> has been received by <strong>${businessName}</strong>.</p>
            <p>They will review your application and get back to you soon. You can check your application status in your dashboard.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Dashboard</a>
            <p style="margin-top: 30px;">Best of luck!</p>
            <p>The SkillBridge Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationStatusUpdate: ({ studentName, projectTitle, status, businessName }) => ({
    subject: `Update on Your Application: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${status === 'SELECTED' ? '#10b981' : status === 'SHORTLISTED' ? '#3b82f6' : '#ef4444'} 0%, ${status === 'SELECTED' ? '#059669' : status === 'SHORTLISTED' ? '#1e40af' : '#dc2626'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; background: ${status === 'SELECTED' ? '#10b981' : status === 'SHORTLISTED' ? '#3b82f6' : '#ef4444'}; color: white; border-radius: 5px; font-weight: bold; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillBridge</h1>
            <p>Application Status Update</p>
          </div>
          <div class="content">
            <h2>Hello ${studentName},</h2>
            <p>Your application status for <strong>${projectTitle}</strong> has been updated by <strong>${businessName}</strong>.</p>
            <div class="status-badge">${status}</div>
            <p>${status === 'SELECTED' ? 'Congratulations! You have been selected for this project. The business will contact you soon with next steps.' : status === 'SHORTLISTED' ? 'Great news! You have been shortlisted. The business will review your profile further.' : 'Thank you for your interest. Unfortunately, you were not selected for this project. Keep applying to other opportunities!'}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Dashboard</a>
            <p style="margin-top: 30px;">Best regards,</p>
            <p>The SkillBridge Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newProjectMatch: ({ studentName, projectTitle, matchScore, businessName }) => ({
    subject: `New Project Match: ${projectTitle} - ${matchScore}% Match!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .match-score { font-size: 48px; font-weight: bold; color: #3b82f6; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillBridge</h1>
            <p>New Project Match!</p>
          </div>
          <div class="content">
            <h2>Hello ${studentName},</h2>
            <p>We found a great match for you!</p>
            <h3 style="text-align: center; margin: 20px 0;">${projectTitle}</h3>
            <p style="text-align: center;">by <strong>${businessName}</strong></p>
            <div class="match-score">${matchScore}% Match</div>
            <p style="text-align: center;">This project matches your skills and profile perfectly!</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">View Project & Apply</a>
            </div>
            <p style="margin-top: 30px;">Don't miss this opportunity!</p>
            <p>The SkillBridge Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  reviewReceived: ({ studentName, reviewerName, projectTitle, rating, comment }) => ({
    subject: `New Review Received for ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .rating { font-size: 24px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillBridge</h1>
            <p>New Review Received</p>
          </div>
          <div class="content">
            <h2>Hello ${studentName},</h2>
            <p><strong>${reviewerName}</strong> has left a review for your work on <strong>${projectTitle}</strong>.</p>
            <div class="rating">${'⭐'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</div>
            ${comment ? `<p style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;"><em>"${comment}"</em></p>` : ''}
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">View Profile</a>
            </div>
            <p style="margin-top: 30px;">Keep up the great work!</p>
            <p>The SkillBridge Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newApplicationReceived: ({ businessName, studentName, projectTitle }) => ({
    subject: `New Application Received: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 SkillBridge</h1>
            <p>New Application Received</p>
          </div>
          <div class="content">
            <h2>Hello ${businessName},</h2>
            <p><strong>${studentName}</strong> has applied to your project: <strong>${projectTitle}</strong>.</p>
            <p>Review their application and profile to see if they're a good fit for your project.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Review Application</a>
            </div>
            <p style="margin-top: 30px;">Best regards,</p>
            <p>The SkillBridge Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Internal email sending function
 */
async function sendEmailInternal({ to, subject, html, text, retries = 0 }) {
  if (!transporter) {
    // Queue email if transporter not ready
    emailQueue.push({ to, subject, html, text, retries });
    return { success: false, message: 'Email queued (transporter not ready)' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SkillBridge" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    console.log(`✅ Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    
    // Retry logic
    if (retries < 3) {
      console.log(`🔄 Retrying email to ${to} (attempt ${retries + 1}/3)...`);
      emailQueue.push({ to, subject, html, text, retries: retries + 1 });
      setTimeout(processEmailQueue, 5000 * (retries + 1)); // Exponential backoff
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Send email (public API - non-blocking)
 */
async function sendEmail({ to, subject, html, text }) {
  // Don't block the main flow - send asynchronously
  setImmediate(() => {
    sendEmailInternal({ to, subject, html, text }).catch(err => {
      console.error('Email sending failed:', err);
    });
  });
  
  // Return immediately
  return { success: true, message: 'Email queued for sending' };
}

/**
 * Send application received email to student
 */
async function sendApplicationReceivedEmail({ studentEmail, studentName, projectTitle, businessName }) {
  const template = templates.applicationReceived({ studentName, projectTitle, businessName });
  return sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send application status update email
 */
async function sendApplicationStatusUpdateEmail({ studentEmail, studentName, projectTitle, status, businessName }) {
  const template = templates.applicationStatusUpdate({ studentName, projectTitle, status, businessName });
  return sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send new project match email
 */
async function sendNewProjectMatchEmail({ studentEmail, studentName, projectTitle, matchScore, businessName }) {
  const template = templates.newProjectMatch({ studentName, projectTitle, matchScore, businessName });
  return sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send review received email
 */
async function sendReviewReceivedEmail({ studentEmail, studentName, reviewerName, projectTitle, rating, comment }) {
  const template = templates.reviewReceived({ studentName, reviewerName, projectTitle, rating, comment });
  return sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send new application received email to business
 */
async function sendNewApplicationReceivedEmail({ businessEmail, businessName, studentName, projectTitle }) {
  const template = templates.newApplicationReceived({ businessName, studentName, projectTitle });
  return sendEmail({
    to: businessEmail,
    subject: template.subject,
    html: template.html,
  });
}

module.exports = {
  sendEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusUpdateEmail,
  sendNewProjectMatchEmail,
  sendReviewReceivedEmail,
  sendNewApplicationReceivedEmail,
};
