import type { MatchingConfig } from '../types/index.js';

export const MATCHING_CONFIG: MatchingConfig = {
  /**
   * Minimum score (out of 100) required to notify user
   * 50 = balanced (not too strict, not too loose)
   */
  threshold: parseInt(process.env.MATCH_THRESHOLD || '50', 10),

  /**
   * Weight for required skills (out of 100)
   * This is the most important factor
   */
  requiredSkillsWeight: parseInt(process.env.REQUIRED_SKILLS_WEIGHT || '70', 10),

  /**
   * Weight for preferred skills (out of 100)
   * Nice to have but not critical
   */
  preferredSkillsWeight: parseInt(process.env.PREFERRED_SKILLS_WEIGHT || '20', 10),

  /**
   * Weight for experience match (out of 100)
   * Bonus points for experience alignment
   */
  experienceWeight: parseInt(process.env.EXPERIENCE_WEIGHT || '10', 10),

  /**
   * Allow user to be X years below job requirement
   * Example: Job needs 5 years, user has 4 years exp. still matches with buffer=1
   * This accounts for people growing into roles
   */
  experienceBufferYears: 1,
};

/**
 * File paths for mock data
 */
export const MOCK_DATA_PATHS = {
  jobs: './mocks/job-postings.json',
  resume: './mocks/user-profile.json',
};


/**
 * Validation: Ensure weights add up to 100
 */
const totalWeight =
  MATCHING_CONFIG.requiredSkillsWeight +
  MATCHING_CONFIG.preferredSkillsWeight +
  MATCHING_CONFIG.experienceWeight;

if (totalWeight !== 100) {
  console.warn(
    `Warning: Weights don't add up to 100 (current: ${totalWeight}). This may cause scoring issues.`
  );
}
