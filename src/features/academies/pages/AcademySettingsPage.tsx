import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Copy, RefreshCw, Check } from 'lucide-react';

import { Button, Card, CardBody, CardFooter, CardHeader, Input, Select } from '@/components/ui';
import { FormField } from '@/components/form';
import { MobilePageHeader } from '@/components/mobile';
import { errorMessage } from '@/lib/api';
import { useUiStore } from '@/stores';
import type { UUID } from '@/types';
import {
  useAcademy,
  useActiveAcademy,
  useJoinCode,
  useRegenerateJoinCode,
  useUpdateAcademy,
} from '../hooks/useAcademies';

interface FormValues {
  name: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
}

export default function AcademySettingsPage() {
  const { academyId, membership } = useActiveAcademy();
  const pushToast = useUiStore((s) => s.pushToast);
  const [copied, setCopied] = useState(false);

  const academyQuery = useAcademy(academyId);
  const updateAcademy = useUpdateAcademy(academyId as UUID);
  const joinCodeQuery = useJoinCode(academyId);
  const regenerateJoinCode = useRegenerateJoinCode(academyId as UUID);

  const academy = academyQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      city: '',
      contactEmail: '',
      contactPhone: '',
      timezone: 'UTC',
    },
  });

  useEffect(() => {
    if (academy) {
      reset({
        name: academy.name ?? '',
        city: academy.city ?? '',
        contactEmail: academy.contactEmail ?? '',
        contactPhone: academy.contactPhone ?? '',
        timezone: academy.timezone ?? 'UTC',
      });
    }
  }, [academy, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!academyId) return;
    try {
      await updateAcademy.mutateAsync({
        name: values.name.trim(),
        city: values.city.trim() || null,
        contactEmail: values.contactEmail.trim() || null,
        contactPhone: values.contactPhone.trim() || null,
        timezone: values.timezone,
      });
      pushToast({ title: 'Academy settings saved', variant: 'success' });
    } catch (err) {
      pushToast({
        title: 'Failed to save academy settings',
        description: errorMessage(err),
        variant: 'error',
      });
    }
  });

  const handleCopyCode = async () => {
    if (!joinCodeQuery.data) return;
    try {
      await navigator.clipboard.writeText(joinCodeQuery.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      pushToast({ title: 'Join code copied to clipboard', variant: 'success' });
    } catch {
      pushToast({ title: 'Failed to copy join code', variant: 'error' });
    }
  };

  const handleRegenerateCode = async () => {
    try {
      await regenerateJoinCode.mutateAsync();
      pushToast({ title: 'New join code generated', variant: 'success' });
    } catch (err) {
      pushToast({
        title: 'Failed to regenerate join code',
        description: errorMessage(err),
        variant: 'error',
      });
    }
  };

  if (!academyId) return null;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="md:hidden">
        <MobilePageHeader
          title="Academy Settings"
          subtitle={membership?.academyName ?? 'Manage Academy'}
        />
      </div>

      <div className="hidden md:block">
        <h1 className="text-fg text-2xl font-bold tracking-tight">Academy Settings</h1>
        <p className="text-fg-muted mt-1 text-sm">
          Update your academy profile, contact details, and student join codes.
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} noValidate>
          <CardHeader
            title="General Information"
            description="Basic profile details visible to coaches and students."
          />
          <CardBody className="space-y-4">
            <FormField label="Academy Name" required error={errors.name?.message}>
              {(field) => (
                <Input
                  {...field}
                  {...register('name', { required: 'Academy name is required' })}
                  hasError={Boolean(errors.name)}
                />
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="City / Location" error={errors.city?.message}>
                {(field) => (
                  <Input {...field} {...register('city')} placeholder="e.g. Mumbai, London" />
                )}
              </FormField>

              <FormField label="Timezone">
                {(field) => (
                  <Select {...field} {...register('timezone')}>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Contact Email" error={errors.contactEmail?.message}>
                {(field) => (
                  <Input
                    {...field}
                    {...register('contactEmail')}
                    type="email"
                    placeholder="info@academy.com"
                  />
                )}
              </FormField>

              <FormField label="Contact Phone" error={errors.contactPhone?.message}>
                {(field) => (
                  <Input
                    {...field}
                    {...register('contactPhone')}
                    type="tel"
                    placeholder="+91 9876543210"
                  />
                )}
              </FormField>
            </div>
          </CardBody>
          <CardFooter>
            <Button
              type="submit"
              isLoading={updateAcademy.isPending}
              disabled={!isDirty || updateAcademy.isPending}
            >
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Student Join Code"
          description="Share this code with players to let them request joining your academy."
        />
        <CardBody className="space-y-4">
          <div className="border-border-subtle bg-surface-elevated flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
            <div>
              <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                Active Code
              </p>
              <p className="text-primary mt-1 font-mono text-2xl font-bold tracking-widest">
                {joinCodeQuery.isLoading ? '...' : (joinCodeQuery.data ?? 'N/A')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleCopyCode()}
                disabled={!joinCodeQuery.data}
              >
                {copied ? <Check className="text-success h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleRegenerateCode()}
                isLoading={regenerateJoinCode.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
