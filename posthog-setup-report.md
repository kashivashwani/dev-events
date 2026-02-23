<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **DevEvent** Next.js App Router project. Here's a summary of all changes made:

- **`instrumentation-client.ts`** (new): Client-side PostHog initialization using the recommended Next.js 15.3+ approach. Initializes via a reverse proxy (`/ingest`), enables automatic exception/error tracking (`capture_exceptions: true`), and enables debug mode in development.
- **`next.config.ts`** (edited): Added PostHog reverse proxy rewrites for `/ingest/static/*` and `/ingest/*` to route analytics traffic through the Next.js server, avoiding ad blockers. Also added `skipTrailingSlashRedirect: true` for PostHog API compatibility.
- **`components/ExploreBtn.tsx`** (edited): Added `posthog.capture('explore_events_clicked')` in the button's click handler — tracks the top-of-funnel CTA action. Converted inline `onClick` to a named handler.
- **`components/EventCard.tsx`** (edited): Added `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` to the link's click handler — tracks which events users are most interested in. Added `'use client'` directive to enable client-side tracking.
- **`.env.local`** (created): Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables. Keys are never hardcoded in source files.

## Events

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" CTA button on the homepage, indicating top-of-funnel interest | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view details, indicating conversion intent for a specific event. Properties: `event_title`, `event_slug`, `event_location`, `event_date` | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- 📊 **Dashboard – Analytics basics**: https://us.posthog.com/project/321120/dashboard/1300448
- 📈 **Daily Event Engagement (Explore + Card Clicks)**: https://us.posthog.com/project/321120/insights/OXUKCJmR
- 🔽 **Homepage → Event Detail Conversion Funnel**: https://us.posthog.com/project/321120/insights/T25Eq9hJ
- 👤 **Unique Users Clicking Event Cards**: https://us.posthog.com/project/321120/insights/VFtUTHBz
- 🏆 **Most Clicked Events (by Title)**: https://us.posthog.com/project/321120/insights/VzIl7MXL
- 📅 **Weekly Engagement Trend**: https://us.posthog.com/project/321120/insights/iTvbp9jy

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
