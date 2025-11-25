/**
 * Type Definitions for Job Matching System
 *
 * These interfaces define the shape of data throughout the application.
 * TypeScript uses these to catch errors at compile time and provide autocomplete.
 */

// ==================== JOB POSTING ====================

/**
 * Represents a single job posting from a job board
 */
export interface Job {
  /** Unique identifier for the job */
  id: string;

  /** Job title (e.g., "Senior Frontend Developer") */
  title: string;

  /** Company name */
  company: string;

  /** ISO 8601 timestamp when job was posted */
  postedAt: string;

  /** Minimum years of experience required */
  yearsExperienceRequired: number;

  /** Skills that MUST be present for the job */
  requiredSkills: string[];

  /** Skills that are nice to have but not mandatory */
  preferredSkills: string[];

  /** Job location (e.g., "Remote", "San Francisco, CA") */
  location: string;

  /** Salary range (e.g., "$100k-$150k") */
  salary: string;
}

// ==================== USER PROFILE ====================

/**
 * User's preferences for job matching
 */
export interface UserPreferences {
  /** Minimum years of experience in job posting (filter out entry-level if user wants mid-level) */
  minYearsRequired?: number;

  /** Maximum years of experience in job posting (filter out senior roles if user is junior) */
  maxYearsRequired?: number;

  /** Minimum number of skills that must match to consider it a potential match */
  minSkillMatch: number;
}

/**
 * User's profile information
 */
export interface UserProfile {
  /** User's name */
  name: string;

  /** Contact email */
  email: string;

  /** Total years of professional experience */
  yearsOfExperience: number;
}

/**
 * Complete user resume including skills and preferences
 */
export interface Resume {
  /** Unique user identifier */
  userId: string;

  /** User's basic profile info */
  profile: UserProfile;

  /** List of skills the user possesses */
  skills: string[];

  /** Job search preferences */
  preferences: UserPreferences;
}

// ==================== MATCHING SYSTEM ====================

/**
 * Breakdown of how well a job matches a user's resume
 */
export interface MatchScore {
  /** Overall score (0-100) */
  total: number;

  /** Score from required skills match (0-70) */
  requiredSkillsScore: number;

  /** Score from preferred skills match (0-20) */
  preferredSkillsScore: number;

  /** Score from experience match (0-10) */
  experienceScore: number;
}

/**
 * Represents a job that matches the user's resume
 */
export interface Match {
  /** The job posting that matched */
  job: Job;

  /** Detailed scoring breakdown */
  score: MatchScore;

  /** List of user's skills that match required skills */
  matchingRequiredSkills: string[];

  /** List of user's skills that match preferred skills */
  matchingPreferredSkills: string[];

  /** Human-readable explanation of why this job matched */
  reason: string;

  /** Timestamp when this match was found */
  matchedAt: string;
}

// ==================== SERVICE INTERFACES ====================

/**
 * Interface for job scraping service
 * Allows easy swapping of implementations (mock data, real API, database, etc.)
 */
export interface IScraper {
  /**
   * Fetch job postings from a source
   * @returns Promise that resolves to array of jobs
   */
  scrapeJobs(): Promise<Job[]>;
}

/**
 * Interface for matching service
 * Allows different matching algorithms to be plugged in
 */
export interface IMatcher {
  /**
   * Find jobs that match a user's resume
   * @param jobs - Array of job postings to check
   * @param resume - User's resume to match against
   * @returns Array of matches that exceed the threshold
   */
  findMatches(jobs: Job[], resume: Resume): Match[];

  /**
   * Calculate match score for a single job
   * @param job - Job to score
   * @param resume - User's resume
   * @returns Match score breakdown
   */
  calculateScore(job: Job, resume: Resume): MatchScore;
}

/**
 * Interface for notification service
 * Allows different notification methods (email, SMS, console, etc.)
 */
export interface INotifier {
  /**
   * Notify user about job matches
   * @param matches - Array of jobs that matched
   * @param resume - User's resume (for personalization)
   * @returns Promise that resolves when notification is sent
   */
  notify(matches: Match[], resume: Resume): Promise<void>;
}

// ==================== CONFIGURATION ====================

/**
 * Configuration for the matching algorithm
 */
export interface MatchingConfig {
  /** Minimum score (0-100) required to notify user */
  threshold: number;

  /** Weight for required skills in scoring (0-100) */
  requiredSkillsWeight: number;

  /** Weight for preferred skills in scoring (0-100) */
  preferredSkillsWeight: number;

  /** Weight for experience match in scoring (0-100) */
  experienceWeight: number;

  /** Allow user to be X years below job requirement */
  experienceBufferYears: number;
}
