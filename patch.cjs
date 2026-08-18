const fs = require('fs');

let o = fs.readFileSync('src/features/dashboard/pages/OwnerDashboardPage.tsx', 'utf8');
o = o.replace("import { formatDate } from '@/lib/utils/date';\n", '');
fs.writeFileSync('src/features/dashboard/pages/OwnerDashboardPage.tsx', o, 'utf8');

let c = fs.readFileSync('src/features/dashboard/pages/CoachDashboardPage.tsx', 'utf8');
c = c.replace("import { getTimeOfDayGreeting } from '@/lib/utils/time';\n", '');
c = c.replace("{getTimeOfDayGreeting()}, Coach", "{profile?.fullName ? `Welcome, ${profile.fullName}` : 'Welcome, Coach'}");
fs.writeFileSync('src/features/dashboard/pages/CoachDashboardPage.tsx', c, 'utf8');
