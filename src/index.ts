import { runJobCheck } from './triggers/job-check.trigger.js';

async function main() {
  console.log('Starting manual job check...\n');

  try {
    await runJobCheck();
    console.log('\nJob check completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nJob check failed:', error);
    process.exit(1);
  }
}

// Run main function
main();
