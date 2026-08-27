enum Capability {
  academyCreate('academy:create'),
  academyUpdate('academy:update'),
  academyRegenerateJoinCode('academy:regenerate_join_code'),
  membersManage('members:manage'),
  playersRead('players:read'),
  playersManage('players:manage'),
  playersApprove('players:approve'),
  coachesRead('coaches:read'),
  coachesManage('coaches:manage'),
  batchesRead('batches:read'),
  batchesManage('batches:manage'),
  matchesRead('matches:read'),
  matchesManage('matches:manage'),
  sessionsRead('sessions:read'),
  sessionsManage('sessions:manage'),
  attendanceRead('attendance:read'),
  attendanceMark('attendance:mark'),
  drillsRead('drills:read'),
  drillsManage('drills:manage'),
  feedbackReadOwn('feedback:read_own'),
  feedbackWrite('feedback:write'),
  cricheroesManage('cricheroes:manage'),
  statsReadOwn('stats:read_own'),
  statsReadAll('stats:read_all'),
  billingReadOwn('billing:read_own'),
  billingManage('billing:manage'),
  reportsExport('reports:export'),
  notificationsRead('notifications:read'),
  announcementsRead('announcements:read'),
  announcementsManage('announcements:manage'),
  platformManage('platform:manage');

  final String value;
  const Capability(this.value);

  static Capability? fromString(String val) {
    for (var c in Capability.values) {
      if (c.value == val) return c;
    }
    return null;
  }
}

class Rbac {
  static const Map<String, List<Capability>> roleCapabilities = {
    'player': [
      Capability.playersRead,
      Capability.sessionsRead,
      Capability.attendanceRead,
      Capability.drillsRead,
      Capability.matchesRead,
      Capability.feedbackReadOwn,
      Capability.statsReadOwn,
      Capability.billingReadOwn,
      Capability.reportsExport,
      Capability.notificationsRead,
      Capability.announcementsRead,
    ],
    'coach': [
      Capability.playersRead,
      Capability.coachesRead,
      Capability.batchesRead,
      Capability.matchesRead,
      Capability.matchesManage,
      Capability.sessionsRead,
      Capability.sessionsManage,
      Capability.attendanceRead,
      Capability.attendanceMark,
      Capability.drillsRead,
      Capability.drillsManage,
      Capability.feedbackReadOwn,
      Capability.feedbackWrite,
      Capability.statsReadAll,
      Capability.reportsExport,
      Capability.notificationsRead,
      Capability.announcementsRead,
      Capability.announcementsManage,
    ],
    'academy_owner': [
      Capability.academyCreate,
      Capability.academyUpdate,
      Capability.academyRegenerateJoinCode,
      Capability.membersManage,
      Capability.playersRead,
      Capability.playersManage,
      Capability.playersApprove,
      Capability.coachesRead,
      Capability.coachesManage,
      Capability.batchesRead,
      Capability.batchesManage,
      Capability.matchesRead,
      Capability.matchesManage,
      Capability.sessionsRead,
      Capability.sessionsManage,
      Capability.attendanceRead,
      Capability.attendanceMark,
      Capability.drillsRead,
      Capability.drillsManage,
      Capability.feedbackReadOwn,
      Capability.feedbackWrite,
      Capability.cricheroesManage,
      Capability.statsReadAll,
      Capability.billingReadOwn,
      Capability.billingManage,
      Capability.reportsExport,
      Capability.notificationsRead,
      Capability.announcementsRead,
      Capability.announcementsManage,
    ],
    'parent': [
      Capability.playersRead,
      Capability.sessionsRead,
      Capability.attendanceRead,
      Capability.matchesRead,
      Capability.statsReadOwn,
      Capability.notificationsRead,
      Capability.announcementsRead,
    ],
    'super_admin': Capability.values,
  };

  static bool hasCapability(List<String> roles, Capability cap) {
    for (var r in roles) {
      final list = roleCapabilities[r];
      if (list != null && list.contains(cap)) {
        return true;
      }
    }
    return false;
  }
}
