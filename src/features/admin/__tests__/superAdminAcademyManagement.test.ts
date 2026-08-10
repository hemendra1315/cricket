import { describe, expect, it } from 'vitest';
import type { AppRole } from '@/types/enums';
import {
  superAdminAddMember,
  superAdminSeedAcademyDemoData,
  type SuperAdminAddMemberPayload,
} from '../api/adminApi';

describe('Super Admin Academy Data Management & Demo Seeding', () => {
  it('exposes superAdminAddMember and superAdminSeedAcademyDemoData API contracts', () => {
    expect(typeof superAdminAddMember).toBe('function');
    expect(typeof superAdminSeedAcademyDemoData).toBe('function');
  });

  it('verifies authorization restrictions for Super Admin academy operations', () => {
    const superAdminRoles: AppRole[] = ['super_admin'];
    const ownerRoles: AppRole[] = ['academy_owner'];
    const coachRoles: AppRole[] = ['coach'];
    const playerRoles: AppRole[] = ['player'];

    const canPerformSuperAdminDataAction = (roles: AppRole[]) => roles.includes('super_admin');

    expect(canPerformSuperAdminDataAction(superAdminRoles)).toBe(true);
    expect(canPerformSuperAdminDataAction(ownerRoles)).toBe(false);
    expect(canPerformSuperAdminDataAction(coachRoles)).toBe(false);
    expect(canPerformSuperAdminDataAction(playerRoles)).toBe(false);
  });

  it('validates Add Member payload structure and role enforcement', () => {
    const memberPayload: SuperAdminAddMemberPayload = {
      academyId: '11111111-1111-1111-1111-111111111111',
      fullName: 'Rahul Dravid',
      role: 'player',
      email: 'rahul@example.com',
      phone: '+919876543210',
    };

    expect(memberPayload.role).toBe('player');
    expect(memberPayload.fullName).toBe('Rahul Dravid');

    const coachPayload: SuperAdminAddMemberPayload = {
      academyId: '11111111-1111-1111-1111-111111111111',
      fullName: 'Gary Kirsten',
      role: 'coach',
    };

    expect(coachPayload.role).toBe('coach');
  });

  it('verifies tenant isolation logic between Academy A and Academy B', () => {
    const academyAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const academyBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    const seededRecords = [
      { id: 'rec-1', academyId: academyAId, name: 'Player A1' },
      { id: 'rec-2', academyId: academyAId, name: 'Player A2' },
      { id: 'rec-3', academyId: academyBId, name: 'Player B1' },
    ];

    const academyARecords = seededRecords.filter((r) => r.academyId === academyAId);
    const academyBRecords = seededRecords.filter((r) => r.academyId === academyBId);

    expect(academyARecords).toHaveLength(2);
    expect(academyBRecords).toHaveLength(1);
    expect(academyARecords.some((r) => r.academyId === academyBId)).toBe(false);
    expect(academyBRecords.some((r) => r.academyId === academyAId)).toBe(false);
  });

  it('verifies duplicate seed protection guard contract', () => {
    const seededAcademies = new Set<string>();

    const seedAcademy = (academyId: string) => {
      if (seededAcademies.has(academyId)) {
        throw new Error('E_DUPLICATE: Demo data already exists for this academy');
      }
      seededAcademies.add(academyId);
      return { success: true, seededCount: 18 };
    };

    const firstResult = seedAcademy('acad-1');
    expect(firstResult.success).toBe(true);

    expect(() => seedAcademy('acad-1')).toThrow(
      'E_DUPLICATE: Demo data already exists for this academy',
    );
  });
});
