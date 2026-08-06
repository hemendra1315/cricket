// Demo data generators for Cricket Academy Manager
// Produces realistic cricket data for testing and demonstration

export const ACADEMY = {
  name: 'Elite Cricket Academy',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
};

export const OWNER = {
  email: 'owner@demo.com',
  password: 'Demo@123456',
  fullName: 'Rajesh Kumar',
  phone: '+919876543210',
};

export const COACHES = [
  { email: 'coach1@demo.com', password: 'Demo@123456', fullName: 'Suresh Menon', phone: '+919876543211' },
  { email: 'coach2@demo.com', password: 'Demo@123456', fullName: 'Vikram Singh', phone: '+919876543212' },
];

export const BATCHES = [
  { name: 'U14', ageGroup: 'Under 14', trainingDays: 'Mon, Wed, Fri', trainingTime: '16:00-18:00' },
  { name: 'U16', ageGroup: 'Under 16', trainingDays: 'Tue, Thu, Sat', trainingTime: '17:00-19:00' },
  { name: 'Senior', ageGroup: 'Senior', trainingDays: 'Mon, Wed, Fri, Sun', trainingTime: '06:00-08:00' },
];

// Realistic player names and profiles
export const PLAYERS = [
  { fullName: 'Arjun Sharma', jerseyNumber: 1, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_medium', batchIndex: 0, dob: '2011-03-15' },
  { fullName: 'Rahul Verma', jerseyNumber: 2, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_fast', batchIndex: 0, dob: '2010-07-22' },
  { fullName: 'Karthik Iyer', jerseyNumber: 3, primaryRole: 'wicketkeeper', battingStyle: 'right_hand_bat', bowlingStyle: null, batchIndex: 0, dob: '2011-01-10' },
  { fullName: 'Aditya Patel', jerseyNumber: 4, primaryRole: 'all_rounder', battingStyle: 'left_hand_bat', bowlingStyle: 'left_arm_orthodox', batchIndex: 1, dob: '2009-05-18' },
  { fullName: 'Vihaan Gupta', jerseyNumber: 5, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_offbreak', batchIndex: 1, dob: '2008-11-25' },
  { fullName: 'Ishaan Reddy', jerseyNumber: 6, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_fast_medium', batchIndex: 1, dob: '2009-09-03' },
  { fullName: 'Arnav Joshi', jerseyNumber: 7, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: null, batchIndex: 1, dob: '2008-12-12' },
  { fullName: 'Dhruv Agarwal', jerseyNumber: 8, primaryRole: 'all_rounder', battingStyle: 'left_hand_bat', bowlingStyle: 'left_arm_medium', batchIndex: 2, dob: '2005-04-08' },
  { fullName: 'Kabir Singh', jerseyNumber: 9, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_legbreak', batchIndex: 2, dob: '2004-08-16' },
  { fullName: 'Yash Malhotra', jerseyNumber: 10, primaryRole: 'wicketkeeper', battingStyle: 'right_hand_bat', bowlingStyle: null, batchIndex: 2, dob: '2006-01-20' },
  { fullName: 'Reyansh Khanna', jerseyNumber: 11, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_medium', batchIndex: 0, dob: '2011-06-30' },
  { fullName: 'Ananya Mukherjee', jerseyNumber: 12, primaryRole: 'all_rounder', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_offbreak', batchIndex: 0, dob: '2010-02-14' },
  { fullName: 'Pranav Nair', jerseyNumber: 13, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'left_arm_fast_medium', batchIndex: 1, dob: '2009-10-05' },
  { fullName: 'Siddharth Rao', jerseyNumber: 14, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: null, batchIndex: 1, dob: '2008-07-19' },
  { fullName: 'Tara Choudhury', jerseyNumber: 15, primaryRole: 'wicketkeeper', battingStyle: 'right_hand_bat', bowlingStyle: null, batchIndex: 2, dob: '2005-12-01' },
  { fullName: 'Vikramjeet Singh', jerseyNumber: 16, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_fast', batchIndex: 2, dob: '2004-05-25' },
  { fullName: 'Meera Kapoor', jerseyNumber: 17, primaryRole: 'batter', battingStyle: 'left_hand_bat', bowlingStyle: 'right_arm_medium', batchIndex: 0, dob: '2011-09-08' },
  { fullName: 'Krishna Pillai', jerseyNumber: 18, primaryRole: 'all_rounder', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_legbreak', batchIndex: 1, dob: '2009-03-22' },
  { fullName: 'Rohan Das', jerseyNumber: 19, primaryRole: 'bowler', battingStyle: 'right_hand_bat', bowlingStyle: 'left_arm_orthodox', batchIndex: 2, dob: '2006-06-14' },
  { fullName: 'Aarav Mehta', jerseyNumber: 20, primaryRole: 'batter', battingStyle: 'right_hand_bat', bowlingStyle: 'right_arm_offbreak', batchIndex: 2, dob: '2005-11-30' },
];

export const OPPONENTS = [
  'City Cricket Club', 'Riverside CC', 'Royal XI', 'Thunderbolts CC',
  'Phoenix Cricket Academy', 'National School XI', 'District Select', 'Young Stars CC',
  'Premier League XI', 'Cricket Warriors', 'Victory CC', 'Sunrise Academy',
  'Champions XI', 'Sports Authority XI', 'Talent Hunt CC', 'Metro Cricket Club',
  'Galaxy CC', 'Star Cricket Academy', 'Rising Stars', 'Power Play XI',
  'Elite CC', 'Pro Cricket Academy', 'Dynamic XI', 'Goal CC',
  'Supreme Cricket Club'
];

export const SESSION_TITLES = [
  'Batting Technique', 'Bowling Speed', 'Fielding Drills', 'Fitness Training',
  'Net Practice', 'Match Simulation', 'Spin Bowling', 'Fast Bowling',
  'Wicketkeeping Skills', 'Running Between Wickets', 'Power Hitting',
  'Death Bowling', 'Slip Fielding', 'Yoga & Flexibility', 'Reaction Training',
  'Catching Practice', 'Throwdown Session', 'Video Analysis', 'Team Strategy',
  'Practice Match'
];

export const DRILL_NAMES = [
  { name: 'Cone Drill', category: 'fielding' },
  { name: 'Throwdown Batting', category: 'batting' },
  { name: 'Yorker Practice', category: 'bowling' },
  { name: 'Catching Drills', category: 'fielding' },
  { name: 'Sprint Intervals', category: 'fitness' },
  { name: 'Spin Bowling Practice', category: 'bowling' },
  { name: 'Power Hitting', category: 'batting' },
  { name: 'Slip Catching', category: 'fielding' },
  { name: 'Reaction Ball', category: 'fielding' },
  { name: 'Accuracy Target', category: 'bowling' },
];

// Generate random date within last N days
export function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Generate random integer between min and max
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random decimal between min and max
export function randomDecimal(min: number, max: number, precision: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
}

// Weighted random selection
export function weightedRandom(items: { value: any; weight: number }[]): any {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.value;
  }
  return items[0].value;
}

// Generate realistic cricket score
export function generateTeamScore(overs: number, isT20: boolean = true): { runs: number; wickets: number; overs: number } {
  const runRate = isT20 ? randomDecimal(6, 12) : randomDecimal(4, 8);
  const totalRuns = Math.floor(runRate * overs);
  const wickets = randomInt(1, 8);
  const oversPlayed = randomDecimal(overs * 0.8, overs, 1);
  return { runs: totalRuns, wickets, overs: oversPlayed };
}

// Generate player match batting performance
export function generateBattingPerformance(isBatter: boolean): {
  runs: number; balls: number; fours: number; sixes: number; isOut: boolean; dismissalType: string | null;
} | null {
  if (!isBatter && Math.random() > 0.3) return null;
  
  const balls = randomInt(0, 60);
  const strikeRate = randomDecimal(80, 160);
  const runs = Math.floor((strikeRate * balls) / 100);
  const fours = Math.floor(runs / 15);
  const sixes = Math.floor(runs / 30);
  const actualRuns = Math.max(0, runs - fours * 4 - sixes * 6);
  const isOut = Math.random() > 0.3;
  const dismissalTypes = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'not_out'];
  const dismissalType = isOut ? weightedRandom([
    { value: 'bowled', weight: 30 },
    { value: 'caught', weight: 40 },
    { value: 'lbw', weight: 20 },
    { value: 'run_out', weight: 5 },
    { value: 'stumped', weight: 5 },
  ]) : 'not_out';
  
  return { runs: actualRuns + fours * 4 + sixes * 6, balls, fours, sixes, isOut, dismissalType: isOut ? dismissalType : null };
}

// Generate player match bowling performance
export function generateBowlingPerformance(isBowler: boolean): {
  overs: number; maidens: number; runsConceded: number; wickets: number; wides: number; noBalls: number;
} | null {
  if (!isBowler && Math.random() > 0.3) return null;
  
  const overs = randomDecimal(2, 10, 1);
  const maidens = Math.floor(Math.random() * 3);
  const economy = randomDecimal(6, 12);
  const runsConceded = Math.floor(economy * overs);
  const wickets = Math.random() > 0.6 ? randomInt(0, 4) : 0;
  const wides = randomInt(0, 5);
  const noBalls = randomInt(0, 2);
  
  return { overs, maidens, runsConceded, wickets, wides, noBalls };
}

// Generate fielding performance
export function generateFieldingPerformance(): { catches: number; runOuts: number; stumpings: number } {
  return {
    catches: randomInt(0, 3),
    runOuts: randomInt(0, 1),
    stumpings: Math.random() > 0.8 ? randomInt(0, 2) : 0,
  };
}