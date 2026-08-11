SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('player_statistics','match_lineups','match_batting','match_bowling','match_fielding','match_awards','attendance','academy_members')
ORDER BY table_name, ordinal_position;
