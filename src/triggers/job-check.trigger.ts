import { schedules } from "@trigger.dev/sdk/v3";
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { createScraper } from '../services/scraper.service.js';
import { createMatcher } from '../services/matcher.service.js';
import { createNotifier } from '../services/notifier.service.js';
import { MOCK_DATA_PATHS } from '../config/index.js';
import type { Resume } from '../types/index.js';

export const jobCheckTask = schedules.task({
  id: "job-check",
  // Run every 2 minutes for demo
  cron: "*/2 * * * *",
  run: async (payload, { ctx }) => {
    try {
      console.log('\n================================================================================');
      console.log('JOB CHECK TASK STARTED');
      console.log('Triggered at: ' + new Date().toISOString());
      console.log('================================================================================\n');

      // Initialize services
      const scraper = createScraper();
      const matcher = createMatcher();
      const notifier = createNotifier();

      // Step 1: Scrape job postings
      console.log('Step 1 of 4: Fetching job postings...');
      const jobs = await scraper.scrapeJobs();
      console.log(`   Found ${jobs.length} job postings\n`);

      // Step 2: Loading user resume
      console.log('Step 2 of 4: Loading user resume...');
      const resume = await loadUserResume();
      console.log(`   Loaded profile for ${resume.profile.name}`);
      console.log(`   Skills: ${resume.skills.join(', ')}`);
      console.log(`   Experience: ${resume.profile.yearsOfExperience} years\n`);

      // Step 3: Match jobs to resume
      console.log('Step 3 of 4: Matching jobs to resume...');
      const matches = matcher.findMatches(jobs, resume);
      console.log(`   Found ${matches.length} matching jobs\n`);

      // Step 4: Notify user
      console.log('Step 4 of 4: Notifying user...');
      await notifier.notify(matches, resume);

      console.log('\n================================================================================');
      console.log('JOB CHECK TASK COMPLETED SUCCESSFULLY');
      const startTime = ctx.run.startedAt ? new Date(ctx.run.startedAt).getTime() : Date.now();
      const duration = Date.now() - startTime;
      console.log(`Duration: ${duration}ms`);
      console.log('================================================================================\n');

      // Return summary to Trigger.dev dashboard
      return {
        success: true,
        jobsChecked: jobs.length,
        matchesFound: matches.length,
        userEmail: resume.profile.email,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('\nJOB CHECK TASK FAILED');
      console.error('Error:', error);

      // Re-throw so Trigger.dev knows the task failed
      throw error;
    }
  },
});


async function loadUserResume(): Promise<Resume> {
  try {
    const resumePath = resolve(process.cwd(), MOCK_DATA_PATHS.resume);
    const fileContent = await readFile(resumePath, 'utf-8');
    const resume: Resume = JSON.parse(fileContent);
    return resume;
  } catch (error) {
    throw new Error(`Failed to load user resume: ${error}`);
  }
}


export async function runJobCheck(): Promise<void> {
  const scraper = createScraper();
  const matcher = createMatcher();
  const notifier = createNotifier();

  const jobs = await scraper.scrapeJobs();
  const resume = await loadUserResume();
  const matches = matcher.findMatches(jobs, resume);
  await notifier.notify(matches, resume);
}
