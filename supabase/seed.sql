-- ============================================================
-- Cricket Academy Manager - Demo Data Seed
-- Run this in Supabase SQL Editor or via CLI:
--   supabase db reset && supabase db seed
-- ============================================================

-- ============================================================
-- Cricket Academy Manager - Demo Data Seed
-- Run this in Supabase SQL Editor or via CLI:
--   supabase db reset && supabase db seed
-- ============================================================

-- Wrap everything in an anonymous block so we can use variables
do $$
declare
  v_academy_id uuid;
  v_owner_id uuid;
  v_coach_ids uuid[];
  v_player_ids uuid[];
  v_batch_ids uuid[];
  v_session_ids uuid[];
  v_match_ids uuid[];
begin
  -- ============================================================
  -- 1. ACADEMY
  -- ============================================================
  insert into academies (name, city, state, country, join_code)
  values (
    'Elite Cricket Academy',
    'Mumbai',
    'Maharashtra',
    'India',
    'DEMO' || floor(random() * 9000 + 1000)::text
  ) returning id into v_academy_id;

  -- ============================================================
  -- 2. PROFILES & ACADEMY_MEMBERS
  -- ============================================================

  -- Owner
  insert into profiles (id, email, full_name, phone, password_hash)
  values (
    gen_random_uuid(),
    'owner@demo.com',
    'Rajesh Kumar',
    '+919876543210',
    'sha256$Demo@123456'
  ) returning id into v_owner_id;

  insert into academy_members (academy_id, user_id, role, status)
  values (v_academy_id, v_owner_id, 'academy_owner', 'active');


  -- Coaches
  insert into profiles (email, full_name, phone, password_hash)
  values 
    ('coach1@demo.com', 'Suresh Menon', '+919876543211', 'sha256$Demo@123456'),
    ('coach2@demo.com', 'Vikram Singh', '+919876543212', 'sha256$Demo@123456')
  returning id into v_coach_ids;

  insert into academy_members (academy_id, user_id, role, status)
  select v_academy_id, id, 'coach', 'active'
  from unnest(v_coach_ids) as id;


  -- Players (20 players)
  insert into profiles (email, full_name, phone, password_hash)
  values
    ('player1@demo.com', 'Arjun Sharma', '+919876541001', 'sha256$Demo@123456'),
    ('player2@demo.com', 'Rahul Verma', '+919876541002', 'sha256$Demo@123456'),
    ('player3@demo.com', 'Karthik Iyer', '+919876541003', 'sha256$Demo@123456'),
    ('player4@demo.com', 'Aditya Patel', '+919876541004', 'sha256$Demo@123456'),
    ('player5@demo.com', 'Vihaan Gupta', '+919876541005', 'sha256$Demo@123456'),
    ('player6@demo.com', 'Ishaan Reddy', '+919876541006', 'sha256$Demo@123456'),
    ('player7@demo.com', 'Arnav Joshi', '+919876541007', 'sha256$Demo@123456'),
    ('player8@demo.com', 'Dhruv Agarwal', '+919876541008', 'sha256$Demo@123456'),
    ('player9@demo.com', 'Kabir Singh', '+919876541009', 'sha256$Demo@123456'),
    ('player10@demo.com', 'Yash Malhotra', '+919876541010', 'sha256$Demo@123456'),
    ('player11@demo.com', 'Reyansh Khanna', '+919876541011', 'sha256$Demo@123456'),
    ('player12@demo.com', 'Ananya Mukherjee', '+919876541012', 'sha256$Demo@123456'),
    ('player13@demo.com', 'Pranav Nair', '+919876541013', 'sha256$Demo@123456'),
    ('player14@demo.com', 'Siddharth Rao', '+919876541014', 'sha256$Demo@123456'),
    ('player15@demo.com', 'Tara Choudhury', '+919876541015', 'sha256$Demo@123456'),
    ('player16@demo.com', 'Vikramjeet Singh', '+919876541016', 'sha256$Demo@123456'),
    ('player17@demo.com', 'Meera Kapoor', '+919876541017', 'sha256$Demo@123456'),
    ('player18@demo.com', 'Krishna Pillai', '+919876541018', 'sha256$Demo@123456'),
    ('player19@demo.com', 'Rohan Das', '+919876541019', 'sha256$Demo@123456'),
    ('player20@demo.com', 'Aarav Mehta', '+919876541020', 'sha256$Demo@123456')
  returning id into v_player_ids;

  insert into academy_members (academy_id, user_id, role, status, joined_at)
  select 
    v_academy_id, 
    id, 
    'player', 
    'active',
    current_date - (random() * 365)::int
  from unnest(v_player_ids) as id;


  -- ============================================================
  -- 3. BATCHES
  -- ============================================================
  insert into batches (academy_id, name, age_group, coach_id, training_days, training_time, status)
  values
    (v_academy_id, 'U14', 'Under 14', (select id from unnest(v_coach_ids) limit 1), 'Mon, Wed, Fri', '16:00-18:00', 'active'),
    (v_academy_id, 'U16', 'Under 16', (select id from unnest(v_coach_ids) limit 1 offset 1), 'Tue, Thu, Sat', '17:00-19:00', 'active'),
    (v_academy_id, 'Senior', 'Senior', (select id from unnest(v_coach_ids) limit 1), 'Mon, Wed, Fri, Sun', '06:00-08:00', 'active')
  returning id into v_batch_ids;


  -- Assign players to batches (distribute realistically)
  -- U14: players 1-7
  insert into batch_members (batch_id, player_id)
  select 
    (select id from batches where name = 'U14' and academy_id = v_academy_id),
    p.id
  from unnest(v_player_ids) as p(id)
  where id in (select id from unnest(v_player_ids) limit 7);

  -- U16: players 8-14
  insert into batch_members (batch_id, player_id)
  select 
    (select id from batches where name = 'U16' and academy_id = v_academy_id),
    p.id
  from unnest(v_player_ids) as p(id)
  where id in (select id from unnest(v_player_ids) limit 7 offset 7);

  -- Senior: players 15-20
  insert into batch_members (batch_id, player_id)
  select 
    (select id from batches where name = 'Senior' and academy_id = v_academy_id),
    p.id
  from unnest(v_player_ids) as p(id)
  where id in (select id from unnest(v_player_ids) limit 6 offset 14);


  -- ============================================================
  -- 4. TRAINING SESSIONS (40 sessions)
  -- ============================================================
  insert into sessions (academy_id, title, session_date, start_at, end_at, batch_id, coach_id, status, ground)
  select
    v_academy_id,
    title,
    current_date - (random() * 60)::int,
    lpad((6 + floor(random() * 4))::text, 2, '0') || ':00',
    lpad((6 + floor(random() * 4))::text, 2, '0') || ':30',
    (select id from batches where academy_id = v_academy_id order by random() limit 1),
    (select id from unnest(v_coach_ids) order by random() limit 1),
    'completed',
    'Main Ground'
  from (
    select unnest(array[
      'Batting Technique', 'Bowling Speed', 'Fielding Drills', 'Fitness Training',
      'Net Practice', 'Match Simulation', 'Spin Bowling', 'Fast Bowling',
      'Wicketkeeping Skills', 'Running Between Wickets', 'Power Hitting',
      'Death Bowling', 'Slip Fielding', 'Yoga & Flexibility', 'Reaction Training',
      'Catching Practice', 'Throwdown Session', 'Video Analysis', 'Team Strategy',
      'Practice Match', 'Batting Timing', 'Bowling Accuracy', 'Agility Training',
      'Core Strength', 'Speed Work', 'Endurance Run', 'Reaction Drills',
      'Throwdown Session', 'Net Session', 'Match Preparation'
    ]) as title
  ) as titles
  limit 40
  returning id into v_session_ids;


  -- ============================================================
  -- 5. ATTENDANCE (80% attendance rate)
  -- ============================================================
  insert into attendance (academy_id, session_id, player_id, status)
  select
    s.academy_id,
    s.id,
    p.id,
    case when random() < 0.8 then 'present' else 'absent' end
  from sessions s
  cross join (select id from unnest(v_player_ids) as id) p
  where s.academy_id = v_academy_id
    and s.id in (select id from unnest(v_session_ids));


  -- ============================================================
  -- 6. DRILL ASSIGNMENTS (2-5 per player)
  -- ============================================================
  insert into drill_assignments (academy_id, player_id, drill_name, drill_category, status, assigned_at, due_date)
  select
    v_academy_id,
    p.id,
    drill_name,
    category,
    case when random() < 0.6 then 'completed' else 'pending' end,
    current_timestamp - (random() * 30)::int * interval '1 day',
    current_date + (random() * 15)::int
  from (select id from unnest(v_player_ids)) p
  cross join (
    select unnest(array['Cone Drill', 'Throwdown Batting', 'Yorker Practice', 'Catching Drills']) as drill_name,
           unnest(array['fielding', 'batting', 'bowling', 'fielding']) as category
  ) drills
  where random() < 0.5
  limit 100;


  -- ============================================================
  -- 7. MATCHES (25 matches with full scorecards)
  -- ============================================================

  -- Create 25 matches
  insert into matches (academy_id, match_name, match_date, venue, opponent_name, tournament, match_type, format, overs, team_score, wickets_lost, overs_played, result, winning_margin, status, created_by)
  select
    v_academy_id,
    'Match ' || i || ' vs ' || opponent,
    current_date - (random() * 90)::int,
    'Main Cricket Ground',
    opponent,
    case when random() < 0.5 then 'League 2024' else null end,
    case when random() < 0.3 then 'practice' when random() < 0.6 then 'friendly' when random() < 0.9 then 'league' else 'tournament' end,
    case when random() < 0.5 then 't20' else 'odi' end,
    case when random() < 0.5 then 20 else 50 end,
    (random() * 200 + 100)::int || '/' || (random() * 8 + 1)::int,
    (random() * 8 + 1)::int,
    (random() * 10 + 15)::numeric(4,1),
    case when random() < 0.6 then 'won' when random() < 0.95 then 'lost' else 'tie' end,
    'by ' || (random() * 45 + 5)::int || ' runs',
    'completed',
    (select id from unnest(v_coach_ids) limit 1)
  from generate_series(1, 25) as i,
       unnest(array[
         'City Cricket Club', 'Riverside CC', 'Royal XI', 'Thunderbolts CC',
         'Phoenix Cricket Academy', 'National School XI', 'District Select', 'Young Stars CC',
         'Premier League XI', 'Cricket Warriors', 'Victory CC', 'Sunrise Academy',
         'Champions XI', 'Sports Authority XI', 'Talent Hunt CC', 'Metro Cricket Club',
         'Galaxy CC', 'Star Cricket Academy', 'Rising Stars', 'Power Play XI',
         'Elite CC', 'Pro Cricket Academy', 'Dynamic XI', 'Goal CC',
         'Supreme Cricket Club'
       ]) as opponent
  where i = generate_series
  returning id, academy_id into v_match_ids, null;


  -- Create lineups, batting, bowling, fielding for each match
  declare
    match_record record;
  begin
    for match_record in select id from unnest(v_match_ids) as id loop
      -- Insert 11 players for this match
      insert into match_lineups (match_id, academy_member_id, batting_order, is_captain, is_vice_captain, is_wicketkeeper)
      select
        match_record.id,
        id,
        row_number() over (order by random()),
        row_number() over (order by random()) = 1,
        row_number() over (order by random()) = 2,
        row_number() over (order by random()) = 3
      from (select id from unnest(v_player_ids) order by random() limit 11) as players;

      -- Insert batting stats
      insert into match_batting (match_id, academy_member_id, runs, balls, fours, sixes, is_out, dismissal_type, batting_order)
      select
        match_record.id,
        academy_member_id,
        (random() * 80)::int,
        (random() * 60 + 10)::int,
        (random() * 8)::int,
        (random() * 4)::int,
        random() < 0.7,
        case when random() < 0.7 then 'bowled' when random() < 0.8 then 'caught' when random() < 0.9 then 'lbw' else 'run_out' end,
        batting_order
      from match_lineups
      where match_id = match_record.id;

      -- Insert bowling stats
      insert into match_bowling (match_id, academy_member_id, overs, maidens, runs_conceded, wickets, wides, no_balls)
      select
        match_record.id,
        academy_member_id,
        (random() * 8 + 2)::numeric(4,1),
        (random() * 2)::int,
        (random() * 50 + 20)::int,
        (random() * 5)::int,
        (random() * 5)::int,
        (random() * 2)::int
      from match_lineups
      where match_id = match_record.id
      order by random()
      limit 7;

      -- Insert fielding stats
      insert into match_fielding (match_id, academy_member_id, catches, run_outs, stumpings)
      select
        match_record.id,
        academy_member_id,
        (random() * 3)::int,
        (random() * 2)::int,
        (random() * 2)::int
      from match_lineups
      where match_id = match_record.id;

      -- Insert match awards
      insert into match_awards (match_id, player_of_match_id, best_batter_id, best_bowler_id, best_fielder_id)
      select
        match_record.id,
        (select academy_member_id from match_lineups where match_id = match_record.id order by random() limit 1),
        (select academy_member_id from match_lineups where match_id = match_record.id order by random() limit 1),
        (select academy_member_id from match_lineups where match_id = match_record.id order by random() limit 1),
        (select academy_member_id from match_lineups where match_id = match_record.id order by random() limit 1);
    end loop;
  end;


  -- ============================================================
  -- 8. COACH NOTES (50% of players per match)
  -- ============================================================
  insert into match_coach_notes (match_id, academy_member_id, coach_id, notes)
  select
    m.id,
    ml.academy_member_id,
    (select id from unnest(v_coach_ids) order by random() limit 1),
    'Good performance. Keep practicing hard!'
  from matches m
  join match_lineups ml on ml.match_id = m.id
  where random() < 0.5;


  -- ============================================================
  -- 9. REFRESH STATISTICS & RECORDS
  -- ============================================================
  perform refresh_academy_records(v_academy_id);

  -- Refresh statistics for all players
  declare
    player_record record;
  begin
    for player_record in select id from unnest(v_player_ids) as id loop
      perform refresh_player_statistics(v_academy_id, player_record.id);
    end loop;
  end;


  -- ============================================================
  -- 10. DRILL ASSIGNMENTS (if table exists)
  -- ============================================================
  -- Note: Adjust based on your actual drill_assignments schema
  /*
  insert into drill_assignments (academy_id, player_id, drill_name, status)
  select
    v_academy_id,
    p.id,
    unnest(array['Cone Drill', 'Throwdown Batting', 'Yorker Practice', 'Catching Drills']),
    case when random() < 0.6 then 'completed' else 'pending' end
  from (select id from unnest(v_player_ids)) p
  cross join generate_series(1, 3)
  where random() < 0.5;
  */


  -- ============================================================
  -- VERIFICATION
  -- ============================================================
  raise info 'Academy: %', (select name from academies where id = v_academy_id);
  raise info 'Owner: %', (select email from profiles where id = v_owner_id);
  raise info 'Coaches: %', (select count(*) from academy_members where academy_id = v_academy_id and role = 'coach');
  raise info 'Players: %', (select count(*) from academy_members where academy_id = v_academy_id and role = 'player');
  raise info 'Batches: %', (select count(*) from batches where academy_id = v_academy_id);
  raise info 'Sessions: %', (select count(*) from sessions where academy_id = v_academy_id);
  raise info 'Matches: %', (select count(*) from matches where academy_id = v_academy_id);
  raise info 'Attendance Records: %', (select count(*) from attendance where academy_id = v_academy_id);

end $$;


-- ============================================================
-- DEMO CREDENTIALS
-- ============================================================
-- Owner:  owner@demo.com / Demo@123456
-- Coach1: coach1@demo.com / Demo@123456
-- Coach2: coach2@demo.com / Demo@123456
-- Players: player1@demo.com through player20@demo.com / Demo@123456
-- ============================================================
