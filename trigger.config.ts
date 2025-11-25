import { defineConfig } from "@trigger.dev/sdk/v3";

/**
 * Trigger.dev Configuration
 *
 * This configures how Trigger.dev should run your tasks.
 * For local development, most of these can be minimal.
 *
 * Documentation: https://trigger.dev/docs/config
 */
export default defineConfig({
  // Your Trigger.dev project ID from cloud.trigger.dev
  project: "proj_acikkoenvxpdnkjxzufu",

  // Maximum duration for tasks (in seconds)
  // Job matching currently takes ~2-3 seconds, but 5 minutes provides headroom for production
  maxDuration: 300,

  // Retry configuration for failed tasks
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },

  // Directory where trigger files are located
  dirs: ["./src/triggers"],
});
