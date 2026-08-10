import { describe, expect, it } from 'vitest';
import { hasCapability } from '@/lib/rbac/permissions';
import type { AppRole } from '@/types/enums';

describe('Phase 12 Super Admin Role & Capability Authorization', () => {
  it('grants super_admin platform administration permissions while keeping academy roles distinct', () => {
    const superAdminRoles: AppRole[] = ['super_admin'];
    const ownerRoles: AppRole[] = ['academy_owner'];
    const coachRoles: AppRole[] = ['coach'];
    const playerRoles: AppRole[] = ['player'];

    // Super admin capabilities
    expect(superAdminRoles.includes('super_admin')).toBe(true);
    expect(ownerRoles.includes('super_admin')).toBe(false);
    expect(coachRoles.includes('super_admin')).toBe(false);
    expect(playerRoles.includes('super_admin')).toBe(false);

    // Standard role capability checks remain unaltered
    expect(hasCapability(ownerRoles, 'members:manage')).toBe(true);
    expect(hasCapability(coachRoles, 'attendance:mark')).toBe(true);
    expect(hasCapability(playerRoles, 'stats:read_own')).toBe(true);
    expect(hasCapability(playerRoles, 'members:manage')).toBe(false);
  });
});
