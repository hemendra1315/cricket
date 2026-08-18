import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/form';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from '@/components/ui';
import { useMemberships, useActiveAcademy } from '@/features/academies';
import { useLinkedChildren } from '@/features/parents';
import { InstallAppButton, ShareAppButton } from '@/features/pwa';
import { errorMessage } from '@/lib/api';
import { profileFormSchema, type ProfileFormValues } from '@/lib/validators';
import { useUiStore } from '@/stores';
import { ROLE_LABELS } from '@/types/enums';

import { useAuth } from '../hooks/useAuth';
import { useUpdateProfile } from '../hooks/useProfile';

function LinkedChildrenSection() {
  const { academyId } = useActiveAcademy();
  const { data: children = [], isLoading } = useLinkedChildren(academyId || undefined);

  if (!academyId) return null;

  return (
    <Card>
      <CardHeader
        title="Linked Children"
        description="Children linked to your account in this academy."
      />
      <CardBody className="space-y-2">
        {isLoading ? (
          <p className="text-fg-muted text-sm">Loading children...</p>
        ) : children.length === 0 ? (
          <p className="text-fg-muted text-sm">No children linked to your account yet.</p>
        ) : (
          children.map((child) => (
            <div
              key={child.player.id}
              className="border-border-subtle flex items-center gap-3 rounded-lg border p-3"
            >
              <Avatar name={child.player.fullName} src={child.player.avatarUrl} size="sm" />
              <div>
                <p className="text-fg text-sm font-medium">{child.player.fullName}</p>
                <p className="text-fg-muted text-xs">{child.player.batchName || 'No Batch'}</p>
              </div>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

/** Lets a user complete their own profile and see where they are a member. */
export default function ProfilePage() {
  const { profile } = useAuth();
  const { all } = useMemberships();
  const updateProfile = useUpdateProfile();
  const pushToast = useUiStore((state) => state.pushToast);

  const isParent = all.some((m) => m.role === 'parent');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      dateOfBirth: profile?.dateOfBirth ?? '',
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    await updateProfile.mutateAsync({
      fullName: formValues.fullName,
      phone: formValues.phone || null,
      dateOfBirth: formValues.dateOfBirth || null,
    });
    pushToast({ title: 'Profile saved', variant: 'success' });
  });

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">My profile</h1>

      <Card>
        <CardHeader
          title="Personal details"
          description="Google provides your name and photo; you can correct them here."
        />
        <form onSubmit={onSubmit} noValidate>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={profile?.fullName ?? profile?.email}
                src={profile?.avatarUrl}
                size="lg"
              />
              <div>
                <p className="text-fg text-sm font-medium">{profile?.email}</p>
                <p className="text-fg-muted text-xs">Signed in with Google</p>
              </div>
            </div>

            <FormField label="Full name" required error={errors.fullName?.message}>
              {(field) => (
                <Input
                  {...field}
                  {...register('fullName')}
                  autoComplete="name"
                  hasError={Boolean(errors.fullName)}
                />
              )}
            </FormField>

            <FormField
              label="Mobile number"
              hint="Used for academy communication."
              error={errors.phone?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register('phone')}
                  inputMode="tel"
                  placeholder="9876543210"
                  autoComplete="tel"
                  hasError={Boolean(errors.phone)}
                />
              )}
            </FormField>

            <FormField label="Date of birth" error={errors.dateOfBirth?.message}>
              {(field) => <Input {...field} {...register('dateOfBirth')} type="date" />}
            </FormField>

            {updateProfile.isError ? (
              <p role="alert" className="text-danger text-sm">
                {errorMessage(updateProfile.error)}
              </p>
            ) : null}
          </CardBody>

          <CardFooter>
            <Button type="submit" isLoading={updateProfile.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader title="My academies" description="Every academy you belong to." />
        <CardBody className="space-y-2">
          {all.map((membership) => (
            <div
              key={membership.id}
              className="border-border-subtle flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-fg text-sm font-medium">{membership.academyName}</p>
                <p className="text-fg-muted text-xs">{ROLE_LABELS[membership.role]}</p>
              </div>
              <Badge tone={membership.status === 'active' ? 'success' : 'warning'}>
                {membership.status}
              </Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      {isParent && <LinkedChildrenSection />}

      <Card>
        <CardHeader
          title="App"
          description="Install Cricket Academy Manager on this device or share it with someone."
        />
        <CardBody className="flex flex-wrap items-center gap-3">
          <InstallAppButton />
          <ShareAppButton />
        </CardBody>
      </Card>
    </div>
  );
}
