import { GameResult, Team } from '@prisma/client';

export const ROUND_POINTS: Record<number, number> = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
};

export function getSeedBracket(seed: number): number {
    if (seed >= 1 && seed <= 3) return 1;
    if (seed >= 4 && seed <= 6) return 2;
    if (seed >= 7 && seed <= 9) return 3;
    if (seed >= 10 && seed <= 12) return 4;
    if (seed >= 13 && seed <= 15) return 5;
    if (seed === 16) return 6;
    return 0; // Should not happen for valid seeds
}

/**
 * Calculates a player's total score based on their drafted teams and game results.
 * 
 * @param draftedTeams List of teams drafted by the player
 * @param games List of all game results
 * @returns Total score
 */
export function calculatePlayerScore(
    draftedTeams: Team[],
    games: (GameResult & { winner: Team | null; loser: Team | null })[]
): number {
    let totalScore = 0;
    const teamIds = new Set(draftedTeams.map(t => t.id));

    for (const game of games) {
        // If the game has no winner yet, skip it
        if (!game.winner || !game.loser) continue;

        // Check if the winner is one of the player's drafted teams
        if (teamIds.has(game.winner.id)) {
            // 1. Base Points
            const basePoints = ROUND_POINTS[game.round] || 0;
            totalScore += basePoints;

            // 2. Upset Bonus Points
            const winnerSeed = game.winner.seed;
            const loserSeed = game.loser.seed;

            const winnerBracket = getSeedBracket(winnerSeed);
            const loserBracket = getSeedBracket(loserSeed);

            if (winnerBracket > loserBracket) {
                totalScore += (winnerBracket - loserBracket);
            }
        }
    }

    return totalScore;
}
