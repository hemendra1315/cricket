# Demo Data Seed Guide

## Overview

This directory contains the demo data seeding system for the Cricket Academy Manager. After running the seed process, your database will be populated with realistic cricket data for testing and demonstration.

## Generated Data

### Academy
- **Name**: Elite Cricket Academy
- **Location**: Mumbai, Maharashtra, India
- **Join Code**: Auto-generated (DEMOxxxx)

### Users (23 total)

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demo.com | Demo@123456 |
| Coach | coach1@demo.com | Demo@123456 |
| Coach | coach2@demo.com | Demo@123456 |
| Player 1 | player1@demo.com | Demo@123456 |
| ... | ... | ... |
| Player 20 | player20@demo.com | Demo@123456 |

### Batches (3)
- **U14**: Under 14, 7 players, Mon/Wed/Fri 16:00-18:00
- **U16**: Under 16, 7 players, Tue/Thu/Sat 17:00-19:00
- **Senior**: Senior, 6 players, Mon/Wed/Fri/Sun 06:00-08:00

### Players (20)
Realistic player profiles with:
- Full names and ages
- Jersey numbers (1-20)
- Primary roles: Batter, Bowler, All-rounder, Wicketkeeper
- Batting styles: Right hand bat, Left hand bat
- Bowling styles: Right arm fast, spin, left arm, etc.

### Training Sessions (40)
- Various session types: Batting, Bowling, Fielding, Fitness, etc.
- Distributed across last 60 days
- 80% average attendance rate
- Each session linked to a batch and coach

### Matches (25)
- Full scorecards with batting, bowling, fielding stats
- Realistic cricket scores and performances
- Playing XI with captain, vice-captain, wicketkeeper
- Match awards (Player of Match, Best Batter, Bowler, Fielder)
- Coach notes for ~50% of players

### Statistics
- Career statistics auto-generated via RPC calls
- Player milestones detected automatically
- Academy records computed
- Dashboard analytics populated

## How to Seed

### Option 1: Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create a new query
4. Paste the contents of `supabase/seed.sql`
5. Click "Run" to execute

### Option 2: Supabase CLI

```bash
# Make sure you're in the cricket directory
cd cricket

# Reset database and run migrations
supabase db reset

# Manually execute the seed file
supabase db execute --file supabase/seed.sql
```

### Option 3: TypeScript Seed Script (Advanced)

```bash
# Install dependencies (already done if you followed setup)
npm install

# Set environment variables in .env
echo "VITE_SUPABASE_URL=your-project-url" >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" >> .env

# Run the seed script
npx ts-node seed/seed.ts
```

## Verification

After seeding, verify the data was created correctly:

```sql
-- Check counts
SELECT 
  (SELECT count(*) FROM profiles) as total_users,
  (SELECT count(*) FROM academy_members WHERE role = 'player') as players,
  (SELECT count(*) FROM academy_members WHERE role = 'coach') as coaches,
  (SELECT count(*) FROM batches) as batches,
  (SELECT count(*) FROM sessions) as sessions,
  (SELECT count(*) FROM matches WHERE status = 'completed') as matches,
  (SELECT count(*) FROM attendance) as attendance_records,
  (SELECT count(*) FROM match_lineups) as lineup_entries;
```

## Logging In

1. Start the development server: `npm run dev`
2. Open http://localhost:5173
3. Use any of the demo credentials above
4. Password for all accounts: `Demo@123456`

## Re-seeding

To clear and re-seed the database:

```sql
-- Delete all demo data (keep schema)
DELETE FROM match_coach_notes WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM match_awards WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM match_fielding WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM match_bowling WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM match_batting WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM match_lineups WHERE match_id IN (SELECT id FROM matches WHERE academy_id = :academy_id);
DELETE FROM matches WHERE academy_id = :academy_id;
DELETE FROM attendance WHERE session_id IN (SELECT id FROM sessions WHERE academy_id = :academy_id);
DELETE FROM sessions WHERE academy_id = :academy_id;
DELETE FROM drill_assignments WHERE academy_id = :academy_id;
DELETE FROM batch_members WHERE batch_id IN (SELECT id FROM batches WHERE academy_id = :academy_id);
DELETE FROM batches WHERE academy_id = :academy_id;
DELETE FROM player_statistics WHERE academy_id = :academy_id;
DELETE FROM player_milestones WHERE academy_id = :academy_id;
DELETE FROM academy_records WHERE academy_id = :academy_id;
DELETE FROM academy_members WHERE academy_id = :academy_id;
DELETE FROM profiles WHERE email IN ('owner@demo.com', 'coach1@demo.com', 'coach2@demo.com', 'player1@demo.com', ..., 'player20@demo.com');
DELETE FROM academies WHERE id = :academy_id;
```

Then re-run the seed script.

## Notes

- All passwords use SHA256 hashing for demo purposes
- Player statistics are automatically calculated via database RPCs
- Academy records are automatically computed from match data
- The seed is idempotent - running it multiple times will create duplicate data unless you manually delete first
- All IDs are UUIDs generated by `gen_random_uuid()`
- Dates are randomized within the last 60-90 days for realistic data distribution

## Troubleshooting

**Error: "relation does not exist"**
- Make sure all migrations have been run before seeding
- Run `supabase db reset` to apply migrations

**Error: "duplicate key value violates unique constraint"**
- Data already exists. Delete existing data or use a fresh database

**Error: "permission denied"**
- Make sure you're using the service_role key, not the anon key
- Check RLS policies allow the insert operations

## Support

For issues with the seed data, check:
1. Database schema matches expected tables and columns
2. RLS policies are correctly configured
3. Service role key has necessary permissions