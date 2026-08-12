import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileOnboardingPage from '@/features/onboarding/pages/ProfileOnboardingPage';
import { isProfileComplete, getMissingProfileFields } from '../utils/profileCompletion';
import { useAuthStore, useTestModeStore, useAcademyStore } from '@/stores';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query/queryClient';
import { act } from '@testing-library/react';
import type { Profile } from '@/types';

describe('Phase 52 — Google Profile + Phone OTP Onboarding Verification', () => {
  const queryWrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: createQueryClient() }, children);

  beforeEach(() => {
    act(() => {
      useTestModeStore.getState().exitTestMode();
      useAuthStore.setState({
        status: 'authenticated',
        identityStatus: 'ready',
        user: {
          id: 'user-google-uuid-52',
          email: 'googleuser@cricket.app',
          app_metadata: {},
          user_metadata: {
            full_name: 'Rahul Google User',
            avatar_url: 'https://lh3.googleusercontent.com/a/mock-photo',
          },
          aud: 'authenticated',
          created_at: '2026-01-01T00:00:00Z',
        },
        profile: {
          id: 'user-google-uuid-52',
          email: 'googleuser@cricket.app',
          fullName: 'Rahul Google User',
          phone: null,
          phoneVerified: false,
          avatarUrl: 'https://lh3.googleusercontent.com/a/mock-photo',
          dateOfBirth: null,
          locale: 'en',
          timezone: 'Asia/Kolkata',
          isSuperAdmin: false,
        },
        memberships: [],
        joinRequests: [],
      });
      useAcademyStore.getState().setActiveAcademy(null);
    });
  });

  describe('Profile Completion Utility Tests', () => {
    it('returns false for incomplete profiles and correctly identifies missing fields', () => {
      const incompleteProfile: Profile = {
        id: 'p-1',
        email: 'test@cricket.app',
        fullName: 'Rahul Test',
        phone: null,
        phoneVerified: false,
        avatarUrl: null,
        dateOfBirth: null,
        locale: 'en',
        timezone: 'Asia/Kolkata',
        isSuperAdmin: false,
      };

      expect(isProfileComplete(incompleteProfile)).toBe(false);
      const missing = getMissingProfileFields(incompleteProfile);
      expect(missing).toContain('dateOfBirth');
      expect(missing).toContain('phone');
      expect(missing).toContain('phoneVerified');
    });

    it('returns true for complete profiles with verified phone', () => {
      const completeProfile: Profile = {
        id: 'p-2',
        email: 'complete@cricket.app',
        fullName: 'Complete User',
        phone: '+919876543210',
        phoneVerified: true,
        avatarUrl: 'https://example.com/photo.jpg',
        dateOfBirth: '1998-05-15',
        locale: 'en',
        timezone: 'Asia/Kolkata',
        isSuperAdmin: false,
      };

      expect(isProfileComplete(completeProfile)).toBe(true);
      expect(getMissingProfileFields(completeProfile)).toHaveLength(0);
    });
  });

  describe('Profile Setup & Phone Verification UI Tests', () => {
    it('renders Complete Your Profile form with Google account name pre-filled', () => {
      render(
        <BrowserRouter>
          <ProfileOnboardingPage />
        </BrowserRouter>,
        { wrapper: queryWrapper },
      );

      expect(screen.getByRole('heading', { name: /complete your profile/i })).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText(/enter your full name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Rahul Google User');
    });

    it('validates required fields before proceeding to OTP verification', async () => {
      render(
        <BrowserRouter>
          <ProfileOnboardingPage />
        </BrowserRouter>,
        { wrapper: queryWrapper },
      );

      const nameInput = screen.getByPlaceholderText(/enter your full name/i);
      fireEvent.change(nameInput, { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /continue to phone verification/i });
      fireEvent.click(submitButton);

      expect(await screen.findByText(/please enter your full name/i)).toBeInTheDocument();
    });

    it('advances to OTP verification step when valid profile details are submitted', async () => {
      render(
        <BrowserRouter>
          <ProfileOnboardingPage />
        </BrowserRouter>,
        { wrapper: queryWrapper },
      );

      const dobInput = screen.getByLabelText(/date of birth/i);
      fireEvent.change(dobInput, { target: { value: '2000-01-15' } });

      const phoneInput = screen.getByPlaceholderText(/98765 43210/i);
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });

      const submitButton = screen.getByRole('button', { name: /continue to phone verification/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your phone/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/\+919876543210/i)).toBeInTheDocument();
    });

    it('allows user to return to edit phone number from OTP step', async () => {
      render(
        <BrowserRouter>
          <ProfileOnboardingPage />
        </BrowserRouter>,
        { wrapper: queryWrapper },
      );

      const dobInput = screen.getByLabelText(/date of birth/i);
      fireEvent.change(dobInput, { target: { value: '2000-01-15' } });

      const phoneInput = screen.getByPlaceholderText(/98765 43210/i);
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });

      const submitButton = screen.getByRole('button', { name: /continue to phone verification/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /verify your phone/i })).toBeInTheDocument();
      });

      const changePhoneBtn = screen.getByRole('button', { name: /change phone number/i });
      fireEvent.click(changePhoneBtn);

      expect(screen.getByRole('heading', { name: /complete your profile/i })).toBeInTheDocument();
    });
  });
});
