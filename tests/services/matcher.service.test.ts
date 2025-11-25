import { MatcherService } from '../../src/services/matcher.service.js'
import type { Job, Resume } from '../../src/types/index.js';

/**
 * Unit Tests for Matcher Service
 *
 * Tests cover:
 * 1. Perfect match scenario
 * 2. No match scenario
 * 3. Partial match at threshold (edge case)
 * 4. Experience filtering (senior roles)
 * 5. Case-insensitive skill matching
 * 6. Preferred skills bonus
 * 7. Match score calculation
 */

describe('MatcherService', () => {
  let matcher: MatcherService;

  // Mock resume - represents a mid-level developer
  const mockResume: Resume = {
    userId: 'test-user-123',
    profile: {
      name: 'Test User',
      email: 'test@example.com',
      yearsOfExperience: 3,
    },
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git'],
    preferences: {
      minYearsRequired: 0,
      maxYearsRequired: 5,
      minSkillMatch: 2,
    },
  };

  beforeEach(() => {
    matcher = new MatcherService();
  });

  describe('findMatches', () => {
    test('should find a perfect match when all required skills are present', () => {
      const job: Job = {
        id: 'job-1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        postedAt: '2025-11-24T10:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript', 'Git'],
        preferredSkills: ['Node.js'],
        location: 'Remote',
        salary: '$90k-$110k',
      };

      const matches = matcher.findMatches([job], mockResume);

      expect(matches).toHaveLength(1);
      expect(matches[0]?.job.id).toBe('job-1');
      expect(matches[0]?.score.total).toBeGreaterThan(80); // Perfect match
      expect(matches[0]?.matchingRequiredSkills).toEqual(['React', 'TypeScript', 'Git']);
    });

    test('should NOT match when required skills are completely different', () => {
      const job: Job = {
        id: 'job-2',
        title: 'Python Developer',
        company: 'DataCorp',
        postedAt: '2025-11-24T11:00:00Z',
        yearsExperienceRequired: 2,
        requiredSkills: ['Python', 'Django', 'MySQL'],
        preferredSkills: [],
        location: 'Remote',
        salary: '$80k-$100k',
      };

      const matches = matcher.findMatches([job], mockResume);

      expect(matches).toHaveLength(0); // No match
    });

    test('should filter out senior roles when user is too junior', () => {
      const seniorJob: Job = {
        id: 'job-3',
        title: 'Senior Architect',
        company: 'BigTech',
        postedAt: '2025-11-24T12:00:00Z',
        yearsExperienceRequired: 10, // Way too senior
        requiredSkills: ['React', 'TypeScript'], // User has these skills
        preferredSkills: [],
        location: 'San Francisco',
        salary: '$200k-$250k',
      };

      const matches = matcher.findMatches([seniorJob], mockResume);

      // Should not match because experience gap is too large
      expect(matches).toHaveLength(0);
    });

    test('should match when at exact threshold (edge case)', () => {
      // Job with 2/4 required skills = 50% * 70 = 35 points
      // Plus experience match = ~10 points
      // Total = ~45-50 points (right at threshold)
      const job: Job = {
        id: 'job-4',
        title: 'Junior Developer',
        company: 'Startup',
        postedAt: '2025-11-24T13:00:00Z',
        yearsExperienceRequired: 2,
        requiredSkills: ['React', 'TypeScript', 'AWS', 'Kubernetes'], // User has 2/4
        preferredSkills: ['PostgreSQL'], // User has this
        location: 'Remote',
        salary: '$70k-$85k',
      };

      const matches = matcher.findMatches([job], mockResume);

      // Should match (or be close to threshold)
      expect(matches[0]?.score.total).toBeGreaterThanOrEqual(45);
    });

    test('should handle case-insensitive skill matching', () => {
      const job: Job = {
        id: 'job-5',
        title: 'Full Stack Developer',
        company: 'WebCorp',
        postedAt: '2025-11-24T14:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['REACT', 'typescript', 'node.JS'], // Different casing
        preferredSkills: [],
        location: 'Remote',
        salary: '$85k-$105k',
      };

      const matches = matcher.findMatches([job], mockResume);

      expect(matches).toHaveLength(1);
      expect(matches[0]?.matchingRequiredSkills).toEqual(['REACT', 'typescript', 'node.JS']);
    });

    test('should give bonus points for preferred skills', () => {
      const jobWithoutPreferred: Job = {
        id: 'job-6',
        title: 'Developer A',
        company: 'CompanyA',
        postedAt: '2025-11-24T15:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript'],
        preferredSkills: [], // No preferred skills
        location: 'Remote',
        salary: '$90k',
      };

      const jobWithPreferred: Job = {
        id: 'job-7',
        title: 'Developer B',
        company: 'CompanyB',
        postedAt: '2025-11-24T16:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript'],
        preferredSkills: ['Node.js', 'PostgreSQL'], // User has both
        location: 'Remote',
        salary: '$90k',
      };

      const matchesA = matcher.findMatches([jobWithoutPreferred], mockResume);
      const matchesB = matcher.findMatches([jobWithPreferred], mockResume);

      // Job B should have higher score due to preferred skills bonus
      expect(matchesB[0]?.score.total).toBeGreaterThan(matchesA[0]?.score.total ?? 0);
      expect(matchesB[0]?.score.preferredSkillsScore).toBeGreaterThan(0);
    });

    test('should sort matches by score (highest first)', () => {
      const goodMatch: Job = {
        id: 'job-8',
        title: 'Perfect Job',
        company: 'DreamCorp',
        postedAt: '2025-11-24T17:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], // 4/4 match
        preferredSkills: ['Git'], // Bonus
        location: 'Remote',
        salary: '$100k',
      };

      const okayMatch: Job = {
        id: 'job-9',
        title: 'Okay Job',
        company: 'OkayCorp',
        postedAt: '2025-11-24T18:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'Python'], // 3/4 match
        preferredSkills: [],
        location: 'Remote',
        salary: '$90k',
      };

      const matches = matcher.findMatches([okayMatch, goodMatch], mockResume);

      // Matches should be sorted: goodMatch first (higher score)
      expect(matches[0]?.job.id).toBe('job-8');
      expect(matches[1]?.job.id).toBe('job-9');
    });
  });

  describe('calculateScore', () => {
    test('should calculate correct score breakdown', () => {
      const job: Job = {
        id: 'job-10',
        title: 'Test Job',
        company: 'TestCorp',
        postedAt: '2025-11-24T19:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript'], // User has 2/2 = 100% * 70 = 70 points
        preferredSkills: ['Node.js', 'AWS', 'Docker'], // User has 1/3 = 33% * 20 = ~6.7 points
        location: 'Remote',
        salary: '$95k',
      };

      const score = matcher.calculateScore(job, mockResume);

      expect(score.requiredSkillsScore).toBe(70); // Perfect required skills match
      expect(score.preferredSkillsScore).toBeCloseTo(6.7, 1); // ~1/3 of preferred skills
      expect(score.experienceScore).toBe(10); // Perfect experience match
      expect(score.total).toBeCloseTo(86.7, 1); // Sum of all
    });

    test('should give zero points for no skill overlap', () => {
      const job: Job = {
        id: 'job-11',
        title: 'Unrelated Job',
        company: 'DifferentCorp',
        postedAt: '2025-11-24T20:00:00Z',
        yearsExperienceRequired: 5,
        requiredSkills: ['Rust', 'Solidity', 'WebAssembly'],
        preferredSkills: ['Haskell'],
        location: 'Remote',
        salary: '$120k',
      };

      const score = matcher.calculateScore(job, mockResume);

      expect(score.requiredSkillsScore).toBe(0);
      expect(score.preferredSkillsScore).toBe(0);
      expect(score.experienceScore).toBeLessThan(10); // Less than required
      expect(score.total).toBeLessThan(50); // Below threshold
    });
  });
});
