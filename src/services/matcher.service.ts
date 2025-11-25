import type { Job, Resume, Match, MatchScore, IMatcher } from '../types/index.js';
import { MATCHING_CONFIG } from '../config/index.js';


export class MatcherService implements IMatcher {
  /**
   * Find all jobs that match the user's resume above threshold
   *
   * @param jobs - Array of job postings to evaluate
   * @param resume - User's resume and preferences
   * @returns Array of matches sorted by score (highest first)
   */
  findMatches(jobs: Job[], resume: Resume): Match[] {
    const matches: Match[] = [];

    for (const job of jobs) {
      // Filter by experience preferences BEFORE scoring
      if (resume.preferences.maxYearsRequired !== undefined) {
        if (job.yearsExperienceRequired > resume.preferences.maxYearsRequired) {
          // Skip jobs that require more experience than user's max preference
          continue;
        }
      }

      // Calculate match score
      const score = this.calculateScore(job, resume);

      // Check if score exceeds threshold
      if (score.total >= MATCHING_CONFIG.threshold) {
        // Identify which skills matched
        const matchingRequiredSkills = this.getMatchingSkills(
          resume.skills,
          job.requiredSkills
        );

        const matchingPreferredSkills = this.getMatchingSkills(
          resume.skills,
          job.preferredSkills
        );

        // Generate human-readable reason
        const reason = this.generateMatchReason(
          job,
          resume,
          score,
          matchingRequiredSkills,
          matchingPreferredSkills
        );

        matches.push({
          job,
          score,
          matchingRequiredSkills,
          matchingPreferredSkills,
          reason,
          matchedAt: new Date().toISOString(),
        });
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score.total - a.score.total);
  }

  
  calculateScore(job: Job, resume: Resume): MatchScore {
    /**
   * Calculate match score for a single job
   *
   * @param job - Job posting to evaluate
   * @param resume - User's resume
   * @returns Detailed score breakdown
   */
    // 1. REQUIRED SKILLS SCORE (0-70 points)
    const requiredSkillsScore = this.calculateSkillScore(
      resume.skills,
      job.requiredSkills,
      MATCHING_CONFIG.requiredSkillsWeight
    );

    // 2. PREFERRED SKILLS SCORE (0-20 points)
    const preferredSkillsScore = this.calculateSkillScore(
      resume.skills,
      job.preferredSkills,
      MATCHING_CONFIG.preferredSkillsWeight
    );

    // 3. EXPERIENCE SCORE (0-10 points)
    const experienceScore = this.calculateExperienceScore(
      resume.profile.yearsOfExperience,
      job.yearsExperienceRequired
    );

    // Total score (0-100)
    const total = requiredSkillsScore + preferredSkillsScore + experienceScore;

    return {
      total: Math.round(total * 10) / 10, // Round to 1 decimal place
      requiredSkillsScore: Math.round(requiredSkillsScore * 10) / 10,
      preferredSkillsScore: Math.round(preferredSkillsScore * 10) / 10,
      experienceScore: Math.round(experienceScore * 10) / 10,
    };
  }

  /**
   * Calculate score for skill matching
   *
   * @param userSkills - Skills the user has
   * @param requiredSkills - Skills needed for the job
   * @param maxPoints - Maximum points for this category
   * @returns Score (0 to maxPoints)
   */
  private calculateSkillScore(
    userSkills: string[],
    requiredSkills: string[],
    maxPoints: number
  ): number {
    if (requiredSkills.length === 0) {
      return 0;
    }

    // Normalize skills to lowercase for case-insensitive matching
    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());
    const normalizedRequiredSkills = requiredSkills.map((s) => s.toLowerCase());

    // Count how many required skills the user has
    const matchCount = normalizedRequiredSkills.filter((skill) =>
      normalizedUserSkills.includes(skill)
    ).length;

    // Calculate percentage and apply weight
    const percentage = matchCount / requiredSkills.length;
    return percentage * maxPoints;
  }

  /**
   * Calculate score for experience match
   *
   * @param userExperience - User's years of experience
   * @param requiredExperience - Job's required years of experience
   * @returns Score (0 to experienceWeight)
   */
  private calculateExperienceScore(
    userExperience: number,
    requiredExperience: number
  ): number {
    const maxPoints = MATCHING_CONFIG.experienceWeight;
    const buffer = MATCHING_CONFIG.experienceBufferYears;

    if (userExperience >= requiredExperience) {
      return maxPoints;
    }

    const difference = requiredExperience - userExperience;
    if (difference <= buffer) {
      // Linear interpolation: 1 year short = 50% points, 2 years short = 0%
      const ratio = 1 - difference / (buffer + 1);
      return ratio * maxPoints;
    }

    return 0;
  }

  /**
   * Get skills that appear in both lists
   *
   * @param userSkills - User's skills
   * @param jobSkills - Job's required/preferred skills
   * @returns Array of matching skills
   */
  private getMatchingSkills(userSkills: string[], jobSkills: string[]): string[] {
    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

    return jobSkills.filter((skill) =>
      normalizedUserSkills.includes(skill.toLowerCase())
    );
  }

  
  private generateMatchReason(
    job: Job,
    resume: Resume,
    score: MatchScore,
    matchingRequired: string[],
    matchingPreferred: string[]
  ): string {
    const reasons: string[] = [];
    /**
   * Generate human-readable explanation of why job matched
   *
   * @param job - Matched job
   * @param resume - User's resume
   * @param score - Match score
   * @param matchingRequired - Required skills that matched
   * @param matchingPreferred - Preferred skills that matched
   * @returns Human-readable reason string
   */

    // Skill match quality
    if (matchingRequired.length === job.requiredSkills.length) {
      reasons.push(`Perfect match - all ${matchingRequired.length} required skills present`);
    } else {
      reasons.push(
        `Strong skill match (${matchingRequired.length}/${job.requiredSkills.length} required skills)`
      );
    }

    // Preferred skills bonus
    if (matchingPreferred.length > 0) {
      reasons.push(`${matchingPreferred.length} preferred skills`);
    }

    // Experience fit
    if (resume.profile.yearsOfExperience >= job.yearsExperienceRequired) {
      reasons.push(`Experience requirement met (${job.yearsExperienceRequired}+ years)`);
    } else {
      reasons.push(`Close to experience requirement (need ${job.yearsExperienceRequired} years)`);
    }

    // Overall rating
    if (score.total >= 80) {
      reasons.unshift('Excellent match');
    } else if (score.total >= 65) {
      reasons.unshift('Strong match');
    } else {
      reasons.unshift('Good match');
    }

    return reasons.join(' " ');
  }
}


export function createMatcher(): IMatcher {
  return new MatcherService();
}
