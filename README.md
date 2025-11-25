# Job Matching System with Trigger.dev

Automated job matching system built with Node.js and Trigger.dev that notifies users when job postings match their resume.

## Features

- **Event-Driven Architecture**: Decoupled tasks for sourcing, matching, and notifying.
- **Weighted Scoring Algorithm**: 70% required skills, 20% preferred, 10% experience.
- **Configurable Matching Threshold**: Default 50/100 points.
- **Experience-based Filtering**: With ±1 year buffer.
- **Case-insensitive Skill Matching**.
- **15 Comprehensive Unit Tests**.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with Trigger.dev (Starts local dev server)
npx trigger.dev@latest dev
```

## Architecture

The system uses an **Event-Driven Architecture** with three decoupled tasks:

1.  **`source-jobs`** (Scheduled): Runs every 2 minutes. Fetches jobs from the source (currently mock JSON) and triggers a `match-job` task for each job found.
2.  **`match-job`** (Triggered): Runs for a specific job. Matches it against all users. If a match is found, triggers `notify-user`.
3.  **`notify-user`** (Triggered): Sends a notification to the user (currently logs to console).

## Project Structure

```
src/
  ├── config/         # Configuration (thresholds, weights)
  ├── services/       # Business logic (scraper, matcher, notifier)
  ├── triggers/       # Trigger.dev tasks
  │   ├── source-jobs.trigger.ts
  │   ├── match-job.trigger.ts
  │   └── notify-user.trigger.ts
  └── types/          # TypeScript interfaces
tests/
  └── services/       # Unit tests for all services
mocks/
  ├── job-postings.json
  └── user-profile.json
```

## Matching Algorithm

**Scoring (out of 100 points):**
- Required Skills: 70 points (% of skills matched)
- Preferred Skills: 20 points (bonus for nice-to-haves)
- Experience Match: 10 points (full points if meets requirement, partial within ±1 year)
- Threshold: 50 points required to notify

**Example:**
- Job needs: React, TypeScript, Node.js, PostgreSQL (4 skills), 3 years exp
- User has: React, TypeScript, Node.js, AWS, Git (3/4 skills), 3 years exp
- Score: (3/4 × 70) + 0 + 10 = **62.5 points** ✓ Notifies user

## Configuration

Settings use environment variables with defaults. To customize:

1. Copy `.env.example` to `.env`
2. Adjust values as needed

Available options:
- `MATCH_THRESHOLD` - Minimum score to notify (default: 50)
- `REQUIRED_SKILLS_WEIGHT` - Weight for required skills (default: 70)
- `PREFERRED_SKILLS_WEIGHT` - Weight for preferred skills (default: 20)
- `EXPERIENCE_WEIGHT` - Weight for experience match (default: 10)

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript (strict mode)
- **Scheduler:** Trigger.dev v4
- **Testing:** Jest with ts-jest
- **Architecture:** Event-Driven, Service-oriented
