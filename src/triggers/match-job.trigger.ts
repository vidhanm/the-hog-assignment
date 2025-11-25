import { task } from "@trigger.dev/sdk/v3";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { createMatcher } from "../services/matcher.service.js";
import { notifyUserTask } from "./notify-user.trigger.js";
import { MOCK_DATA_PATHS } from "../config/index.js";
import type { Job, Resume } from "../types/index.js";

export const matchJobTask = task({
    id: "match-job",
    run: async (payload: { job: Job }) => {
        const { job } = payload;
        const matcher = createMatcher();

        // Load all users (currently just one in the mock file)
        // In a real app, this would fetch from a DB, potentially filtered by job criteria
        const resume = await loadUserResume();

        console.log(`Matching job ${job.id} against user ${resume.userId}`);

        // Check for match
        // Note: findMatches expects an array of jobs, but we are checking one.
        const matches = matcher.findMatches([job], resume);

        const match = matches[0];

        if (match) {
            console.log(`Match found! Score: ${match.score.total}`);

            // Trigger notification
            await notifyUserTask.trigger({
                match: match,
                resume: resume,
            });

            return {
                matched: true,
                score: match.score.total,
                userId: resume.userId,
            };
        }

        return {
            matched: false,
            userId: resume.userId,
        };
    },
});

async function loadUserResume(): Promise<Resume> {
    try {
        const resumePath = resolve(process.cwd(), MOCK_DATA_PATHS.resume);
        const fileContent = await readFile(resumePath, 'utf-8');
        const resume: Resume = JSON.parse(fileContent);
        return resume;
    } catch (error) {
        throw new Error(`Failed to load user resume: ${error}`);
    }
}
