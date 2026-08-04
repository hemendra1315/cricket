import type { AppRole, MemberStatus, UUID } from '@/types';

export type Batch = {
  id: UUID;
  academyId: UUID;
  name: string;
  ageGroup: string;
  description: string | null;
  trainingDays: string;
  trainingTime: string;
  coachId: UUID;
  coach: {
    id: UUID;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  playerCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BatchPlayer = {
  id: UUID;
  batchId: UUID;
  academyMemberId: UUID;
  joinedAt: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: AppRole | null;
  status: MemberStatus | null;
};

export type CreateBatchInput = {
  academyId: UUID;
  name: string;
  ageGroup: string;
  description: string | null;
  trainingDays: string;
  trainingTime: string;
  coachId: UUID;
};

export type UpdateBatchInput = Omit<CreateBatchInput, 'academyId'>;
