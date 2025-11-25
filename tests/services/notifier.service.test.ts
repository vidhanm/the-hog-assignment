import { jest } from '@jest/globals';
import { ConsoleNotifierService } from '../../src/services/notifier.service.js';
import type { Match, Resume, Job } from '../../src/types/index.js';

/**
 * Unit Tests for Notifier Service
 *
 * Tests cover:
 * 1. Notification with matches
 * 2. Notification with no matches
 * 3. Console output formatting
 */

describe('ConsoleNotifierService', () => {
  let notifier: ConsoleNotifierService;
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  const mockResume: Resume = {
    userId: 'test-user-123',
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      yearsOfExperience: 3,
    },
    skills: ['React', 'TypeScript', 'Node.js'],
    preferences: {
      minSkillMatch: 2,
    },
  };

  beforeEach(() => {
    notifier = new ConsoleNotifierService();
    // Spy on console.log to capture output
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    consoleSpy.mockRestore();
  });

  describe('notify', () => {
    test('should notify with matches found', async () => {
      const mockJob: Job = {
        id: 'job-1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        postedAt: '2025-11-24T10:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React', 'TypeScript'],
        preferredSkills: ['Node.js'],
        location: 'Remote',
        salary: '$90k-$110k',
      };

      const mockMatch: Match = {
        job: mockJob,
        score: {
          total: 85,
          requiredSkillsScore: 70,
          preferredSkillsScore: 10,
          experienceScore: 5,
        },
        matchingRequiredSkills: ['React', 'TypeScript'],
        matchingPreferredSkills: ['Node.js'],
        reason: 'Perfect match - all 2 required skills present',
        matchedAt: '2025-11-24T10:30:00Z',
      };

      await notifier.notify([mockMatch], mockResume);

      // Verify console.log was called
      expect(consoleSpy).toHaveBeenCalled();

      // Check that user's name appears in output
      const output = consoleSpy.mock.calls.map((call: any[]) => call.join(' ')).join('\n');
      expect(output).toContain('John Doe');
      expect(output).toContain('john@example.com');
      expect(output).toContain('Frontend Developer');
      expect(output).toContain('TechCorp');
    });

    test('should handle no matches gracefully', async () => {
      await notifier.notify([], mockResume);

      // Verify console.log was called
      expect(consoleSpy).toHaveBeenCalled();

      // Check that "no matches" message appears
      const output = consoleSpy.mock.calls.map((call: any[]) => call.join(' ')).join('\n');
      expect(output).toContain('No new job matches');
    });

    test('should display multiple matches', async () => {
      const mockJob1: Job = {
        id: 'job-1',
        title: 'Frontend Developer',
        company: 'TechCorp',
        postedAt: '2025-11-24T10:00:00Z',
        yearsExperienceRequired: 3,
        requiredSkills: ['React'],
        preferredSkills: [],
        location: 'Remote',
        salary: '$90k',
      };

      const mockJob2: Job = {
        id: 'job-2',
        title: 'Full Stack Developer',
        company: 'WebCorp',
        postedAt: '2025-11-24T11:00:00Z',
        yearsExperienceRequired: 4,
        requiredSkills: ['TypeScript'],
        preferredSkills: [],
        location: 'Remote',
        salary: '$100k',
      };

      const mockMatches: Match[] = [
        {
          job: mockJob1,
          score: {
            total: 80,
            requiredSkillsScore: 70,
            preferredSkillsScore: 0,
            experienceScore: 10,
          },
          matchingRequiredSkills: ['React'],
          matchingPreferredSkills: [],
          reason: 'Strong match',
          matchedAt: '2025-11-24T10:30:00Z',
        },
        {
          job: mockJob2,
          score: {
            total: 75,
            requiredSkillsScore: 70,
            preferredSkillsScore: 0,
            experienceScore: 5,
          },
          matchingRequiredSkills: ['TypeScript'],
          matchingPreferredSkills: [],
          reason: 'Good match',
          matchedAt: '2025-11-24T11:30:00Z',
        },
      ];

      await notifier.notify(mockMatches, mockResume);

      const output = consoleSpy.mock.calls.map((call: any[]) => call.join(' ')).join('\n');

      // Both jobs should appear in output
      expect(output).toContain('Frontend Developer');
      expect(output).toContain('Full Stack Developer');
      expect(output).toContain('TechCorp');
      expect(output).toContain('WebCorp');

      // Should mention that 2 jobs were found
      expect(output).toContain('2 jobs');
    });
  });
});
