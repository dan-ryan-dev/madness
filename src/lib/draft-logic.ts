/**
 * Calculates the index of the picker for a given pick number in a standard Snake Draft.
 * 
 * Logic:
 * - Round 1 (Odd): 0 -> N-1
 * - Round 2 (Even): N-1 -> 0
 * 
 * @param pickNumber 1-based total pick number (e.g., 1, 2, ... 64)
 * @param totalPlayers Total number of players in the group
 * @returns 0-based index of the player who owns the pick
 */
export function getCurrentPicker(pickNumber: number, totalPlayers: number): number {
    if (totalPlayers === 0) return -1;

    // 0-based index for calculation
    const pickIndex = pickNumber - 1;

    const roundIndex = Math.floor(pickIndex / totalPlayers);
    const positionInRound = pickIndex % totalPlayers;

    // Even rounds (0, 2, 4...) are passing forward (0 -> N)
    // Odd rounds (1, 3, 5...) are snakeing back (N -> 0)
    // Wait, Snake Draft usually implies:
    // Round 1 (1-10): 0, 1, 2...
    // Round 2 (11-20): 9, 8, 7...

    const isEvenRound = roundIndex % 2 === 0;

    if (isEvenRound) {
        return positionInRound;
    } else {
        return (totalPlayers - 1) - positionInRound;
    }
}
