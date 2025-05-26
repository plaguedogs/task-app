# Task App Settings - Project Log

## Recent Fixes

### React State Update Error (Fixed on 5/26/2025)
- **Issue**: "Cannot update a component (`Home`) while rendering a different component (`TaskTimer`)"
- **Cause**: `onTimerEnd` was being called inside a state setter in `TaskTimer` component
- **Solution**: Separated the timer logic into two useEffect hooks:
  1. One for updating the countdown time
  2. Another for detecting when timer reaches 0 and calling `onTimerEnd`
- **File Modified**: `components/task-timer.tsx` (lines 29-50)

## Project Structure
- Next.js app with Google Sheets integration
- Electron wrapper for desktop app
- Task management with timer functionality
- Settings stored in localStorage

## Key Commands
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run lint` - Run linting
- `npm run typecheck` - Run TypeScript type checking