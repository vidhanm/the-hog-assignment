import { task } from "@trigger.dev/sdk/v3";
import { createNotifier } from "../services/notifier.service.js";
import type { Match, Resume } from "../types/index.js";

export const notifyUserTask = task({
  id: "notify-user",
  run: async (payload: { match: Match; resume: Resume }) => {
    const { match, resume } = payload;
    const notifier = createNotifier();

    console.log(`Sending notification to ${resume.profile.email} for job ${match.job.id}`);
    
    // In a real app, this would send an email/SMS
    // For now, we reuse the console notifier which prints to stdout
    await notifier.notify([match], resume);

    return {
      success: true,
      jobId: match.job.id,
      userId: resume.userId,
      email: resume.profile.email,
    };
  },
});
