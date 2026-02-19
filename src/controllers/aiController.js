async function chat(req, res, next) {
  try {
    const { message } = req.body;
    const text = (message || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const lower = text.toLowerCase();

    let reply;
    if (lower.includes('apply') || lower.includes('application')) {
      reply =
        'To apply for a project, go to your Student Dashboard, open the Projects tab, and click the Apply button on a project card. You can then track your applications under the “My Applications” tab.';
    } else if (lower.includes('project') || lower.includes('business')) {
      reply =
        'Businesses can create projects from the Business Dashboard using the “Create Project” button. Each project can specify skills, stipend, and location so students can find the best match.';
    } else if (lower.includes('match') || lower.includes('matching')) {
      reply =
        'The matching engine compares project skills, your profile skills, rating, and location to compute a match score. Higher scores mean a better fit between student and project.';
    } else if (lower.includes('resume')) {
      reply =
        'You can upload your resume from the Student Dashboard in the “Resume” tab. The system parses your PDF and extracts skills to improve matching.';
    } else if (lower.includes('notification')) {
      reply =
        'Notifications appear via the bell icon in the navbar. You can open the Notification Center to read, mark as read, or delete them. Important events like new applications and status updates will show up there.';
    } else if (lower.includes('chat') || lower.includes('message')) {
      reply =
        'Students and businesses can use the in-app chat from their dashboards on a specific project/application. Open the project/application and use the chat button to talk to the other side.';
    } else {
      reply =
        'I am the SkillBridge Assistant. I can help you with how to use the platform: creating projects, applying, matching, resumes, notifications, and chat. Try asking things like “How do I apply to a project?” or “How do businesses find candidates?”.';
    }

    return res.json({
      reply,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  chat,
};

