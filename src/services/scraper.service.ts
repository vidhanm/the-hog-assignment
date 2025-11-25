import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type { Job, IScraper } from '../types/index.js';
import { MOCK_DATA_PATHS } from '../config/index.js';


export class ScraperService implements IScraper {
 
  async scrapeJobs(): Promise<Job[]> {
    try {
      // Resolve path relative to project root
      const jobsPath = resolve(process.cwd(), MOCK_DATA_PATHS.jobs);

      console.log(`=� Loading jobs from: ${jobsPath}`);

      // Read and parse JSON file
      const fileContent = await readFile(jobsPath, 'utf-8');
      const jobs: Job[] = JSON.parse(fileContent);

      // Validate that we got an array
      if (!Array.isArray(jobs)) {
        throw new Error('Job data is not an array');
      }

      console.log(` Loaded ${jobs.length} job postings`);

      return jobs;
    } catch (error) {
      // Provide helpful error messages
      if (error instanceof Error) {
        console.error(`L Failed to load jobs: ${error.message}`);
      }
      throw new Error(`Unable to scrape jobs: ${error}`);
    }
  }


  async scrapeJobsSince(since: string): Promise<Job[]> {
    const allJobs = await this.scrapeJobs();

    return allJobs.filter((job) => {
      const jobDate = new Date(job.postedAt);
      const sinceDate = new Date(since);
      return jobDate > sinceDate;
    });
  }
}

export function createScraper(): IScraper {
  return new ScraperService();
}
