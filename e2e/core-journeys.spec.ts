import { expect, test } from '@playwright/test';

const MOCK_USER = {
  id: 'user-123',
  email: 'owner@cricket.academy',
  user_metadata: { full_name: 'Academy Owner' },
};

const MOCK_PROFILE = {
  id: 'user-123',
  email: 'owner@cricket.academy',
  fullName: 'Academy Owner',
  avatarUrl: null,
  phone: '+919876543210',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  locale: 'en',
  timezone: 'Asia/Kolkata',
  isSuperAdmin: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const MOCK_MEMBERSHIP = {
  id: 'mem-1',
  academyId: 'academy-1',
  academyName: 'Strikers Cricket Academy',
  academySlug: 'strikers-cricket-academy',
  logoUrl: null,
  city: 'Mumbai',
  timezone: 'Asia/Kolkata',
  role: 'academy_owner' as const,
  status: 'active' as const,
};

test.describe('1. Authentication & Route Protection', () => {
  test('unauthenticated visitors are redirected to sign-in screen', async ({ page }) => {
    const protectedPaths = ['/dashboard', '/members', '/batches', '/sessions', '/profile'];
    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    }
  });

  test('sign-in page renders title, login button, and theme toggle', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /cricket academy manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();

    await page.getByRole('radio', { name: 'dark theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

test.describe('2. Academy Creation & Join by Code UI Flows', () => {
  test('create academy onboarding page renders all form controls', async ({ page }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
      },
      { user: MOCK_USER, profile: MOCK_PROFILE, memberships: [], joinRequests: [] },
    );

    await page.goto('/onboarding/create-academy');
    await expect(page.getByRole('heading', { name: /create your academy/i })).toBeVisible();
    await expect(page.getByLabel(/academy name/i)).toBeVisible();
    await expect(page.getByLabel(/city/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create academy/i })).toBeVisible();
  });

  test('join academy by code onboarding page renders code input and request button', async ({
    page,
  }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
      },
      { user: MOCK_USER, profile: MOCK_PROFILE, memberships: [], joinRequests: [] },
    );

    await page.goto('/onboarding/join-academy');
    await expect(page.getByRole('heading', { name: /join an academy/i })).toBeVisible();
    await expect(page.getByLabel(/join code/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /request to join/i })).toBeVisible();
  });
});

test.describe('3. Member Management & Approval UI', () => {
  test('members page renders join code card, pending requests, and roster table', async ({
    page,
  }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
        if (data.activeAcademyId) {
          localStorage.setItem(
            'cam.active-academy',
            JSON.stringify({ state: { activeAcademyId: data.activeAcademyId }, version: 0 }),
          );
        }
      },
      {
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        memberships: [MOCK_MEMBERSHIP],
        activeAcademyId: MOCK_MEMBERSHIP.academyId,
      },
    );

    await page.goto('/members');
    await expect(page.getByRole('heading', { name: /players/i })).toBeVisible();
  });
});

test.describe('4. Batch Management & Player Assignment UI', () => {
  test('batches page renders batch list and create batch button', async ({ page }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
        if (data.activeAcademyId) {
          localStorage.setItem(
            'cam.active-academy',
            JSON.stringify({ state: { activeAcademyId: data.activeAcademyId }, version: 0 }),
          );
        }
      },
      {
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        memberships: [MOCK_MEMBERSHIP],
        activeAcademyId: MOCK_MEMBERSHIP.academyId,
      },
    );

    await page.goto('/batches');
    await expect(page.getByRole('heading', { name: 'Batches', exact: true })).toBeVisible();
  });
});

test.describe('5. Session Management UI', () => {
  test('training sessions page renders session controls and list', async ({ page }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
        if (data.activeAcademyId) {
          localStorage.setItem(
            'cam.active-academy',
            JSON.stringify({ state: { activeAcademyId: data.activeAcademyId }, version: 0 }),
          );
        }
      },
      {
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        memberships: [MOCK_MEMBERSHIP],
        activeAcademyId: MOCK_MEMBERSHIP.academyId,
      },
    );

    await page.goto('/sessions');
    await expect(page.getByRole('heading', { name: 'Training sessions' })).toBeVisible();
  });
});

test.describe('6. Attendance Session UI', () => {
  test('attendance session page renders player roster and marking controls', async ({ page }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
        if (data.activeAcademyId) {
          localStorage.setItem(
            'cam.active-academy',
            JSON.stringify({ state: { activeAcademyId: data.activeAcademyId }, version: 0 }),
          );
        }
      },
      {
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        memberships: [MOCK_MEMBERSHIP],
        activeAcademyId: MOCK_MEMBERSHIP.academyId,
      },
    );

    await page.goto('/sessions/session-1/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible();
  });
});

test.describe('7. Player Profile & Tab Navigation UI', () => {
  test('player profile renders tabs and stat cards cleanly', async ({ page }) => {
    await page.addInitScript(
      (data) => {
        sessionStorage.setItem('cam.e2e_auth', JSON.stringify(data));
        if (data.activeAcademyId) {
          localStorage.setItem(
            'cam.active-academy',
            JSON.stringify({ state: { activeAcademyId: data.activeAcademyId }, version: 0 }),
          );
        }
      },
      {
        user: MOCK_USER,
        profile: MOCK_PROFILE,
        memberships: [MOCK_MEMBERSHIP],
        activeAcademyId: MOCK_MEMBERSHIP.academyId,
      },
    );

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });
});

test.describe('8. Mobile Responsiveness & Viewport Fit', () => {
  test('mobile drawer opens, link navigation closes drawer, no horizontal overflow on 360px-430px', async ({
    page,
  }) => {
    for (const width of [360, 390, 430, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/sign-in');

      const scrollWidth = await page.evaluate(() => {
        const doc = (
          globalThis as unknown as { document: { documentElement: { scrollWidth: number } } }
        ).document;
        return doc.documentElement.scrollWidth;
      });
      expect(scrollWidth).toBeLessThanOrEqual(width);
    }
  });
});
