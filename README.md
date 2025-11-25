# Job Matching System with Trigger.dev

Automated job matching system built with Node.js and Trigger.dev that notifies users when job postings match their resume.

## Features

- Weighted scoring algorithm (70% required skills, 20% preferred, 10% experience)
- Configurable matching threshold (default: 50/100 points)
- Experience-based filtering with ±1 year buffer
- Case-insensitive skill matching
- 15 comprehensive unit tests

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run demo (executes once)
npm run demo

# Run with Trigger.dev (scheduled every 2 minutes)
npx trigger.dev@latest dev
```

## Project Structure

```
src/
  ├── config/         # Configuration (thresholds, weights)
  ├── services/       # Business logic (scraper, matcher, notifier)
  ├── triggers/       # Trigger.dev scheduled tasks
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



## Architecture Principles

**Separation of Concerns:**
- Scraper: Fetches job data
- Matcher: Implements matching logic
- Notifier: Handles user notifications

**Dependency Injection:**
- Services implement interfaces (IScraper, IMatcher, INotifier)
- Easy to swap implementations (e.g., API scraper, email notifier)

**SOLID Principles:**
- Single Responsibility per service
- Open/Closed via interfaces
- Dependency Inversion through factory functions

## Scaling to Production

**What needs to change:**

The current system uses mock JSON files and prints to console. For production, here's what I'd do:

**Data & APIs:**
Replacing the mock JSON scraper with a API. Start Store everything in PostgreSQL - users, jobs, matches. Use Redis to track which jobs we've already seen so we don't spam users.

**Multi-user:**
Right now it's hardcoded to one user. Need a users table and process everyone's profile against new jobs each run. 

**Better notifications:**
Console logs don't work in production. Switch to email (SendGrid) or SMS (Twilio). Let users pick how they want to be notified.

**Reliability:**
- Add retry logic for API failures
- Set up error monitoring (Sentry)

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript (strict mode)
- **Scheduler:** Trigger.dev v4
- **Testing:** Jest with ts-jest
- **Architecture:** Service-oriented, dependency injection


