# CabinWise Context

CabinWise is an award travel optimization app that helps users find smarter ways to book flights using transferable credit card points.

Current stack:
- Next.js app
- React/TypeScript
- Tailwind
- Vercel deployment
- Seats.aero cached award API
- Simulated fallback results when cached data is unavailable

Current features:
- Airport autocomplete
- Calendar picker
- Traveler counts
- Wallet/card ecosystem selection
- Point balance tracking
- Transfer partner optimization
- Seats.aero cached award results
- Booking links
- Saved trips
- Data notes
- Result cards with program badges

Important limitations:
- Current Seats.aero Pro API supports cached search, not live search
- Exact schedules, flight numbers, layovers, and aircraft are not guaranteed
- Simulated results must be clearly labeled

Current architecture:
- app/page.tsx manages state and renders screens
- components/SearchScreen.tsx
- components/ResultsScreen.tsx
- components/ResultCard.tsx
- components/WalletScreen.tsx
- components/SavedTrips.tsx
- components/DataNotes.tsx
- components/AirportAutocomplete.tsx
- components/CalendarInput.tsx
- components/TravelerCounter.tsx
- components/BrandBadge.tsx
- components/AwardText.ts
- app/adapters.ts handles Seats.aero mapping
- app/logic.ts handles scoring, recommendations, transfer logic
- app/data.ts holds cards and transfer partners

Working rules:
- Preserve functionality
- Make small/medium changes with clear placement
- Test after each batch
- Avoid giant rewrites unless explicitly requested
- Prioritize trust, clarity, and professional UX