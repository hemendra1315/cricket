# ⏸️ Flutter Rewrite Project: PAUSED

> [!IMPORTANT]
> This native Flutter client project is **PAUSED** and is **NOT** the active production development track. The active production development track remains the React + TypeScript + Capacitor web/mobile application. Do not perform active feature changes or production deployments from this Flutter directory.

## Reason for Pausing
Development was halted to focus resources and priority on the existing production React + TypeScript + Capacitor application.

## Current Implementation Status
The project compiles cleanly, compiles successfully with zero warnings/errors, and passes all unit/widget tests.

### Completed Phase 1 Work
* **Authentication**: Real Supabase Auth integrations (Google OAuth + SMS OTP) wired to a secure `AuthRepository`.
* **Academy Context & Selection**: Fetching profiles and multi-tenant academy memberships mapped into Riverpod state.
* **Role-Based Routing**: 3-layer GoRouter guard redirect chains landing on super admin (`/admin`), owner (`/owner`), coach (`/coach`), player (`/player`), and parent (`/parent`) dashboard entry screens.
* **Authorization Gates**: A declarative `<Can />` widget checking roles and capabilities before rendering children components.
* **Data Models**: Typed `UserProfile` and `AcademyMember` models replacing untyped map accessors.

### Remaining Planned Phases
* **Phase 2A (Dashboards)**: Connect metrics counters and today's sessions lists to repository queries.
* **Phase 2B (Members Directory)**: Roster search, filters, and directory detail lookups.
* **Phase 2C (Player Profiles)**: Career averages, attendance trends, match histories, and awards.
* **Phase 2D (Batches)**: Batch details, batch member rosters, and weekly schedules.
* **Phase 2E (Sessions)**: Schedule listing, details, and rapid attendance marking.
* **Phase 2F (Attendance & Sync)**: Hive offline queue and background synchronization engine.
* **Phase 2G (Matches & CricHeroes)**: Multi-step scorecard wizard and CricHeroes Edge Function PDF import.
* **Phase 2H (Parent Portal)**: Linked child toggles and RPC linking code redemption.
* **Phase 2I (Announcements)**: Structured announcement feed list.

## Important Architectural Decisions
* **Nullability in Repositories**: Made `SupabaseClient?` nullable inside `AuthRepository` and notifier classes to support clean dependency injection and mocking in tests.
* **Super Parameters**: Refactored exceptions (`AppException`) to modern super-parameters to keep up with Dart 3 lints.
* **Connectivity Checks**: Handled the modern `List<ConnectivityResult>` signature from `connectivity_plus` to avoid unrelated type checks.

## Known Issues
* **None**. Compilation has zero warnings/errors (`flutter analyze` is green) and tests are passing (`flutter test` is green).

## Resuming Development
When resumption is approved, start directly with **Phase 2A (Dashboards)** data wiring by using the prepared `DashboardRepository` and `dashboard_provider.dart` classes.
