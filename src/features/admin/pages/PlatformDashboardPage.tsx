import { useState } from 'react';
import { Building2, Calendar, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Input, Modal } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import {
  usePlatformAnalytics,
  usePlatformAcademies,
  usePlatformUsers,
  usePlatformAcademyDetails,
} from '../hooks/useAdmin';
import type { UUID } from '@/types';

export default function PlatformDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'academies' | 'users'>('overview');
  const [academySearch, setAcademySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedAcademyId, setSelectedAcademyId] = useState<UUID | null>(null);

  const analyticsQuery = usePlatformAnalytics();
  const academiesQuery = usePlatformAcademies();
  const usersQuery = usePlatformUsers();
  const academyDetailsQuery = usePlatformAcademyDetails(selectedAcademyId);

  const analytics = analyticsQuery.data;
  const academies = academiesQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const filteredAcademies = academies.filter(
    (a) =>
      a.name.toLowerCase().includes(academySearch.toLowerCase()) ||
      a.ownerName.toLowerCase().includes(academySearch.toLowerCase()) ||
      a.ownerEmail.toLowerCase().includes(academySearch.toLowerCase()) ||
      (a.city && a.city.toLowerCase().includes(academySearch.toLowerCase())),
  );

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-fg text-2xl font-bold tracking-tight">Super Admin Control Panel</h1>
          <p className="text-fg-muted text-sm">
            Platform-wide management for academies, registered users, and system analytics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface-subtle border-border-subtle flex rounded-xl border p-1">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'academies' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('academies')}
          >
            Academies ({academies.length})
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </Button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {analyticsQuery.isPending ? (
            <p className="text-fg-muted text-sm">Loading platform analytics…</p>
          ) : analyticsQuery.isError ? (
            <ErrorState
              error={analyticsQuery.error}
              onRetry={() => void analyticsQuery.refetch()}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardBody className="flex items-center gap-4 p-4">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-fg-muted text-xs font-medium tracking-wider uppercase">
                      Academies
                    </p>
                    <p className="text-fg text-2xl font-bold">{analytics?.totalAcademies ?? 0}</p>
                    <p className="text-fg-muted text-xs">
                      {analytics?.activeAcademies ?? 0} active
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-fg-muted text-xs font-medium tracking-wider uppercase">
                      Platform Users
                    </p>
                    <p className="text-fg text-2xl font-bold">{analytics?.totalUsers ?? 0}</p>
                    <p className="text-fg-muted text-xs">
                      {analytics?.totalPlayers ?? 0} Players · {analytics?.totalCoaches ?? 0}{' '}
                      Coaches
                    </p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-fg-muted text-xs font-medium tracking-wider uppercase">
                      Total Matches
                    </p>
                    <p className="text-fg text-2xl font-bold">{analytics?.totalMatches ?? 0}</p>
                    <p className="text-fg-muted text-xs">Recorded platform matches</p>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-fg-muted text-xs font-medium tracking-wider uppercase">
                      Training Sessions
                    </p>
                    <p className="text-fg text-2xl font-bold">{analytics?.totalSessions ?? 0}</p>
                    <p className="text-fg-muted text-xs">Scheduled training sessions</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Quick Recent Academies Overview */}
          <Card>
            <CardHeader
              title="Recent Academies"
              description="Latest academies registered on the platform."
            />
            <CardBody>
              {academiesQuery.isPending ? (
                <p className="text-fg-muted text-sm">Loading academies…</p>
              ) : academies.length === 0 ? (
                <p className="text-fg-muted text-sm">No academies created yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-border-subtle text-fg-muted border-b text-xs tracking-wider uppercase">
                      <tr>
                        <th className="py-2">Academy</th>
                        <th className="py-2">Owner</th>
                        <th className="py-2">Members</th>
                        <th className="py-2">Matches</th>
                        <th className="py-2">Created</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border-subtle divide-y">
                      {academies.slice(0, 5).map((acad) => (
                        <tr key={acad.id} className="hover:bg-surface-subtle/50">
                          <td className="text-fg py-3 font-medium">
                            {acad.name}
                            {acad.city ? (
                              <span className="text-fg-muted text-xs font-normal">
                                {' '}
                                · {acad.city}
                              </span>
                            ) : null}
                          </td>
                          <td className="text-fg-muted py-3">{acad.ownerName}</td>
                          <td className="text-fg py-3">{acad.memberCount}</td>
                          <td className="text-fg py-3">{acad.matchCount}</td>
                          <td className="text-fg-muted py-3">{formatDate(acad.createdAt)}</td>
                          <td className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedAcademyId(acad.id);
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ACADEMIES TAB */}
      {activeTab === 'academies' && (
        <Card>
          <CardHeader
            title="Academy Management"
            description="Manage all registered cricket academies on the platform."
            action={
              <div className="w-64">
                <Input
                  placeholder="Search academy, owner, city..."
                  value={academySearch}
                  onChange={(e) => setAcademySearch(e.target.value)}
                />
              </div>
            }
          />
          <CardBody>
            {academiesQuery.isPending ? (
              <p className="text-fg-muted text-sm">Loading academies…</p>
            ) : academiesQuery.isError ? (
              <ErrorState
                error={academiesQuery.error}
                onRetry={() => void academiesQuery.refetch()}
              />
            ) : filteredAcademies.length === 0 ? (
              <p className="text-fg-muted text-sm">No academies found matching your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-border-subtle text-fg-muted border-b text-xs tracking-wider uppercase">
                    <tr>
                      <th className="px-2 py-3">Academy</th>
                      <th className="px-2 py-3">Owner</th>
                      <th className="px-2 py-3">Players</th>
                      <th className="px-2 py-3">Coaches</th>
                      <th className="px-2 py-3">Batches</th>
                      <th className="px-2 py-3">Matches</th>
                      <th className="px-2 py-3">Created</th>
                      <th className="px-2 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border-subtle divide-y">
                    {filteredAcademies.map((acad) => (
                      <tr key={acad.id} className="hover:bg-surface-subtle/50">
                        <td className="text-fg px-2 py-3 font-medium">
                          <div>{acad.name}</div>
                          <div className="text-fg-muted text-xs">
                            /{acad.slug} {acad.city ? `· ${acad.city}` : ''}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="text-fg">{acad.ownerName}</div>
                          <div className="text-fg-muted text-xs">{acad.ownerEmail}</div>
                        </td>
                        <td className="text-fg px-2 py-3">{acad.playerCount}</td>
                        <td className="text-fg px-2 py-3">{acad.coachCount}</td>
                        <td className="text-fg px-2 py-3">{acad.batchCount}</td>
                        <td className="text-fg px-2 py-3">{acad.matchCount}</td>
                        <td className="text-fg-muted px-2 py-3">{formatDate(acad.createdAt)}</td>
                        <td className="px-2 py-3 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedAcademyId(acad.id);
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader
            title="User Management"
            description="Manage all registered platform profiles and system access."
            action={
              <div className="w-64">
                <Input
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            }
          />
          <CardBody>
            {usersQuery.isPending ? (
              <p className="text-fg-muted text-sm">Loading users…</p>
            ) : usersQuery.isError ? (
              <ErrorState error={usersQuery.error} onRetry={() => void usersQuery.refetch()} />
            ) : filteredUsers.length === 0 ? (
              <p className="text-fg-muted text-sm">No users found matching your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-border-subtle text-fg-muted border-b text-xs tracking-wider uppercase">
                    <tr>
                      <th className="px-2 py-3">User</th>
                      <th className="px-2 py-3">Role Status</th>
                      <th className="px-2 py-3">Academy Memberships</th>
                      <th className="px-2 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border-subtle divide-y">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-subtle/50">
                        <td className="px-2 py-3">
                          <div className="text-fg font-medium">{u.fullName ?? u.email}</div>
                          <div className="text-fg-muted text-xs">{u.email}</div>
                        </td>
                        <td className="px-2 py-3">
                          {u.isSuperAdmin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
                              <ShieldCheck className="h-3 w-3" /> Super Admin
                            </span>
                          ) : (
                            <span className="text-fg-muted text-xs">Standard User</span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          {u.memberships.length === 0 ? (
                            <span className="text-fg-muted text-xs">No active memberships</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {u.memberships.map((m) => (
                                <span
                                  key={m.academyId}
                                  className="bg-surface-muted text-fg border-border-subtle inline-flex rounded border px-2 py-0.5 text-xs"
                                >
                                  {m.academyName} ({m.role})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="text-fg-muted px-2 py-3 text-xs">
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* ACADEMY DETAILS MODAL */}
      <Modal
        open={Boolean(selectedAcademyId)}
        title="Academy Details"
        onClose={() => setSelectedAcademyId(null)}
        size="lg"
      >
        {academyDetailsQuery.isPending ? (
          <p className="text-fg-muted py-4 text-center text-sm">Loading academy details…</p>
        ) : academyDetailsQuery.isError ? (
          <ErrorState
            error={academyDetailsQuery.error}
            onRetry={() => void academyDetailsQuery.refetch()}
          />
        ) : !academyDetailsQuery.data ? (
          <p className="text-fg-muted py-4 text-center text-sm">Academy details unavailable.</p>
        ) : (
          <div className="space-y-6">
            {/* Overview info */}
            <div className="border-border-subtle bg-surface-subtle grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
              <div>
                <h3 className="text-fg text-lg font-bold">
                  {academyDetailsQuery.data.academy.name}
                </h3>
                <p className="text-fg-muted text-xs">
                  Slug: /{academyDetailsQuery.data.academy.slug}
                </p>
                <p className="text-fg-muted text-xs">
                  City: {academyDetailsQuery.data.academy.city ?? 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs">
                  Owner:{' '}
                  <span className="text-fg font-medium">
                    {academyDetailsQuery.data.academy.ownerName}
                  </span>
                </p>
                <p className="text-fg-muted text-xs">
                  Owner Email:{' '}
                  <span className="text-fg">{academyDetailsQuery.data.academy.ownerEmail}</span>
                </p>
                <p className="text-fg-muted text-xs">
                  Created: {formatDate(academyDetailsQuery.data.academy.createdAt)}
                </p>
              </div>
            </div>

            {/* Members */}
            <div>
              <h4 className="text-fg mb-2 text-sm font-semibold">
                Roster & Staff ({academyDetailsQuery.data.members.length})
              </h4>
              <div className="border-border-subtle max-h-48 overflow-y-auto rounded-xl border p-2">
                <div className="divide-border-subtle divide-y">
                  {academyDetailsQuery.data.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-1 py-2 text-xs">
                      <div>
                        <p className="text-fg font-medium">{m.name}</p>
                        <p className="text-fg-muted">{m.email}</p>
                      </div>
                      <span className="text-fg-muted bg-surface-muted rounded px-2 py-0.5 capitalize">
                        {m.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Batches & Matches */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-fg mb-2 text-sm font-semibold">
                  Batches ({academyDetailsQuery.data.batches.length})
                </h4>
                <div className="border-border-subtle max-h-36 overflow-y-auto rounded-xl border p-2">
                  {academyDetailsQuery.data.batches.length === 0 ? (
                    <p className="text-fg-muted text-xs">No batches created</p>
                  ) : (
                    academyDetailsQuery.data.batches.map((b) => (
                      <div key={b.id} className="text-fg py-1 text-xs font-medium">
                        • {b.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-fg mb-2 text-sm font-semibold">
                  Matches ({academyDetailsQuery.data.matches.length})
                </h4>
                <div className="border-border-subtle max-h-36 overflow-y-auto rounded-xl border p-2">
                  {academyDetailsQuery.data.matches.length === 0 ? (
                    <p className="text-fg-muted text-xs">No matches recorded</p>
                  ) : (
                    academyDetailsQuery.data.matches.map((m) => (
                      <div key={m.id} className="text-fg py-1 text-xs">
                        • {m.matchName}{' '}
                        <span className="text-fg-muted">({formatDate(m.matchDate)})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
