import { schedules } from "@trigger.dev/sdk/v3";
import { createScraper } from "../services/scraper.service.js";
import { matchJobTask } from "./match-job.trigger.js";

export const sourceJobsTask = schedules.task({
    id: "source-jobs",
    // Run every 2 minutes
    cron: "*/2 * * * *",
    run: async (payload, { ctx }) => {
        console.log('Starting job sourcing...');
        const scraper = createScraper();

        // Fetch all jobs
        // In a real app, we might pass a 'since' timestamp to only get new ones
        const jobs = await scraper.scrapeJobs();
        console.log(`Found ${jobs.length} jobs`);

        // Trigger match task for each job
        const triggerResults = [];
        for (const job of jobs) {
            const handle = await matchJobTask.trigger({ job });
            triggerResults.push(handle.id);
        }

        console.log(`Triggered ${triggerResults.length} match tasks`);

        return {
            success: true,
            jobsFound: jobs.length,
            triggeredTasks: triggerResults,
        };
    },
});
