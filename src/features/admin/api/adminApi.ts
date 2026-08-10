import { supabase } from '@/lib/supabase/client';
import type { UUID } from '@/types';

export interface PlatformAnalytics {
  totalAcademies: number;
  activeAcademies: number;
  totalUsers: number;
  totalPlayers: number;
  totalCoaches: number;
  totalOwners: number;
  totalMatches: number;
  totalSessions: number;
}

export interface PlatformAcademy {
  id: UUID;
  name: string;
  slug: string;
  city: string | null;
  timezone: string;
  feeMode: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  playerCount: number;
  coachCount: number;
  memberCount: number;
  batchCount: number;
  matchCount: number;
}

export interface PlatformUserMembership {
  academyId: UUID;
  academyName: string;
  role: string;
  status: string;
}

export interface PlatformUser {
  id: UUID;
  fullName: string | null;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
  memberships: PlatformUserMembership[];
}

export interface PlatformAcademyDetails {
  academy: {
    id: UUID;
    name: string;
    slug: string;
    city: string | null;
    timezone: string;
    feeMode: string;
    createdAt: string;
    ownerName: string;
    ownerEmail: string;
  };
  members: Array<{
    id: UUID;
    userId: UUID;
    role: string;
    status: string;
    name: string;
    email: string;
  }>;
  batches: Array<{
    id: UUID;
    name: string;
    description: string | null;
  }>;
  matches: Array<{
    id: UUID;
    matchName: string;
    matchDate: string;
    opponentName: string | null;
    result: string | null;
    teamScore: string | null;
  }>;
}

type RpcCaller = (
  fn: string,
  args?: Record<string, unknown>,
) => Promise<{ data: unknown; error: unknown }>;

export async function fetchPlatformAnalytics(): Promise<PlatformAnalytics> {
  const { data, error } = await (supabase.rpc as unknown as RpcCaller)('get_platform_analytics');
  if (error) throw error;
  return data as unknown as PlatformAnalytics;
}

export async function fetchPlatformAcademies(): Promise<PlatformAcademy[]> {
  const { data, error } = await (supabase.rpc as unknown as RpcCaller)('get_platform_academies');
  if (error) throw error;
  return (data ?? []) as unknown as PlatformAcademy[];
}

export async function fetchPlatformUsers(): Promise<PlatformUser[]> {
  const { data, error } = await (supabase.rpc as unknown as RpcCaller)('get_platform_users');
  if (error) throw error;
  return (data ?? []) as unknown as PlatformUser[];
}

export async function fetchPlatformAcademyDetails(
  academyId: UUID,
): Promise<PlatformAcademyDetails> {
  const { data, error } = await (supabase.rpc as unknown as RpcCaller)(
    'get_platform_academy_details',
    {
      p_academy_id: academyId,
    },
  );
  if (error) throw error;
  return data as unknown as PlatformAcademyDetails;
}
