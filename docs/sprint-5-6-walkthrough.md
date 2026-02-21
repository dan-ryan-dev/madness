# Walkthrough - Sprint 5.6: Tie-Breaker Implementation

I have implemented a comprehensive tie-breaker system to resolve potential stalemates in the group standings. Users are now prompted to finalize their entry with two key predictions after completing their draft picks.

## 1. Schema & Data Capture
The `GroupMembership` model has been updated to store participant predictions:
- **`finalScoreGuess`**: A numeric prediction for the total points scored in the championship game.
- **`nitWinnerGuess`**: A team prediction for the NIT tournament winner.

## 2. "Finalize Your Entry" Flow
Once a player completes their **8th pick**, the draft interface triggers a mandatory modal.
- **Validation**: Users cannot exit or "finish" until both predictions are saved.
- **Premium UI**: Styled with the "Madness 2026" brand colors (Basketball Orange) and target/trophy iconography.
- **Smart Search**: The NIT winner input features a datalist for quick team selection.

## 3. Leaderboard Integration
The tie-breaker data is now visible across all standings views:
- **Global Leaderboard**: A compact "TB" display underneath the score.
- **Group Standings**: A dedicated "Tie-Breaker" column showing the NIT winner and score guess.
- **Dynamic Highlighting**: When two players are tied in total points, their tie-breaker info is highlighted in **Basketball Orange** with a subtle pulse animation, indicating these values are being used to decide their rank.

## Verification Results

### Post-Draft Modal
Verified that the modal correctly triggers when the pick count reaches 8 and remains open until predictions are saved. Validation prevents bypass.

### Standing Tie-Logic
Verified that the orange highlighting only triggers when scores are identical, helping players quickly identify who holds the tie-breaker advantage.

---
> [!NOTE]
> Run `npx prisma db push` or `npx prisma migrate dev` to ensure your local database has the new `finalScoreGuess` and `nitWinnerGuess` fields.
