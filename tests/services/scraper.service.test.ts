import { ScraperService } from '../../src/services/scraper.service.js';

/**
 * Unit Tests for Scraper Service
 *
 * Tests cover:
 * 1. Loading jobs from mock data successfully
 * 2. Validating job data structure
 * 3. Filtering jobs by date
 */

describe('ScraperService', () => {
  let scraper: ScraperService;

  beforeEach(() => {
    scraper = new ScraperService();
  });

  describe('scrapeJobs', () => {
    test('should load jobs from mock JSON file', async () => {
      const jobs = await scraper.scrapeJobs();

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
    });

    test('should return valid job objects with required fields', async () => {
      const jobs = await scraper.scrapeJobs();
      const firstJob = jobs[0];

      // Verify all required fields are present
      expect(firstJob).toHaveProperty('id');
      expect(firstJob).toHaveProperty('title');
      expect(firstJob).toHaveProperty('company');
      expect(firstJob).toHaveProperty('postedAt');
      expect(firstJob).toHaveProperty('yearsExperienceRequired');
      expect(firstJob).toHaveProperty('requiredSkills');
      expect(firstJob).toHaveProperty('preferredSkills');
      expect(firstJob).toHaveProperty('location');
      expect(firstJob).toHaveProperty('salary');

      // Verify field types
      expect(typeof firstJob?.id).toBe('string');
      expect(typeof firstJob?.title).toBe('string');
      expect(typeof firstJob?.company).toBe('string');
      expect(typeof firstJob?.yearsExperienceRequired).toBe('number');
      expect(Array.isArray(firstJob?.requiredSkills)).toBe(true);
      expect(Array.isArray(firstJob?.preferredSkills)).toBe(true);
    });
  });

  describe('scrapeJobsSince', () => {
    test('should filter jobs by date', async () => {
      // Get all jobs first
      const allJobs = await scraper.scrapeJobs();

      // Get jobs from far in the future (should return empty)
      const futureDate = '2099-01-01T00:00:00Z';
      const futureJobs = await scraper.scrapeJobsSince(futureDate);

      expect(futureJobs).toHaveLength(0);

      // Get jobs from far in the past (should return all)
      const pastDate = '2020-01-01T00:00:00Z';
      const pastJobs = await scraper.scrapeJobsSince(pastDate);

      expect(pastJobs.length).toBeGreaterThanOrEqual(allJobs.length);
    });
  });
});
