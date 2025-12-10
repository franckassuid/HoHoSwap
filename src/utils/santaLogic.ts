import type { Participant } from '../context/WizardContext';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

/**
 * Tries to find a valid assignment for Secret Santa.
 * Returns a map of GiverID -> ReceiverID, or null if no solution found.
 */
export const matchSanta = (participants: Participant[], maxRetries = 100): Record<string, string> | null => {
    if (participants.length < 2) return null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        // We try a randomized approach with backtracking conceptually, 
        // but often just shuffling receivers and checking validity is fast enough for N < 50.
        // However, strictly "shuffling receivers until it matches" can fail hard on tight constraints.
        // Let's us a simple greedy approach with backtracking or just full random shuffle check.

        // For small N, random shuffle of receivers is usually fine. 
        // But let's be smarter:
        // 1. Sort participants by number of exclusions (most constrained first) -> tricky to implement simply.
        // Let's stick to "Shuffle Receivers" then check. If valid, return.

        const possibleReceivers = shuffle(participants);
        const assignments: Record<string, string> = {};
        let isValid = true;

        for (let i = 0; i < participants.length; i++) {
            const giver = participants[i];
            const receiver = possibleReceivers[i];

            // Constraint 1: Cannot give to self
            if (giver.id === receiver.id) {
                isValid = false;
                break;
            }

            // Constraint 2: Cannot give to excluded person
            if (giver.exclusions.includes(receiver.id)) {
                isValid = false;
                break;
            }

            assignments[giver.id] = receiver.id;
        }

        if (isValid) {
            return assignments;
        }
    }

    // If simple shuffle failed 100 times, let's try a slightly more robust backtracking (optional)
    // or just fail. For most family events, 100 retries of random shuffle is sufficient unless graph is almost disconnected.
    return null;
};

// If we needed better logic for highly constrained graphs, 
// we would implement a findHamiltonianPath style solution on the compatibility graph.
