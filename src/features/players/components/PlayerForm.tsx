import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/form';
import { Button, CardBody, CardFooter, Input, Select, Textarea } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { playerProfileFormSchema, type PlayerProfileFormValues } from '@/lib/validators';
import type { Player } from '@/types';
import {
  BATTING_STYLES,
  BATTING_STYLE_LABELS,
  PLAYER_ROLES,
  PLAYER_ROLE_LABELS,
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
} from '@/types/enums';

type PlayerFormProps = {
  player: Player;
  /** Staff see academy-controlled fields (player code, skill level, notes). */
  canManage: boolean;
  isSaving: boolean;
  error?: unknown;
  onSubmit: (values: PlayerProfileFormValues) => Promise<void>;
};

/** Shared by the staff editor and a player's own profile page. */
export function PlayerForm({ player, canManage, isSaving, error, onSubmit }: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PlayerProfileFormValues>({
    resolver: zodResolver(playerProfileFormSchema),
    values: {
      dateOfBirth: player.dateOfBirth ?? '',
      battingStyle: player.battingStyle ?? '',
      bowlingStyle: player.bowlingStyle ?? '',
      playerRole: player.playerRole ?? '',
      jerseyNumber: player.jerseyNumber === null ? '' : String(player.jerseyNumber),
      guardianName: player.guardianName ?? '',
      guardianPhone: player.guardianPhone ?? '',
      guardianEmail: player.guardianEmail ?? '',
      emergencyContact: player.emergencyContact ?? '',
      playerCode: player.playerCode ?? '',
      skillLevel: player.skillLevel,
      medicalNotes: player.medicalNotes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardBody className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date of birth" error={errors.dateOfBirth?.message}>
          {(field) => <Input {...field} {...register('dateOfBirth')} type="date" />}
        </FormField>

        <FormField label="Jersey number" error={errors.jerseyNumber?.message}>
          {(field) => (
            <Input {...field} {...register('jerseyNumber')} inputMode="numeric" placeholder="7" />
          )}
        </FormField>

        <FormField label="Batting style" error={errors.battingStyle?.message}>
          {(field) => (
            <Select {...field} {...register('battingStyle')}>
              <option value="">Not set</option>
              {BATTING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {BATTING_STYLE_LABELS[style]}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Playing role" error={errors.playerRole?.message}>
          {(field) => (
            <Select {...field} {...register('playerRole')}>
              <option value="">Not set</option>
              {PLAYER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {PLAYER_ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          label="Bowling style"
          hint="For example right arm off-break."
          error={errors.bowlingStyle?.message}
        >
          {(field) => <Input {...field} {...register('bowlingStyle')} />}
        </FormField>

        {canManage ? (
          <>
            <FormField
              label="Player code"
              hint="Academy roll number."
              error={errors.playerCode?.message}
            >
              {(field) => <Input {...field} {...register('playerCode')} />}
            </FormField>

            <FormField label="Skill level" error={errors.skillLevel?.message}>
              {(field) => (
                <Select {...field} {...register('skillLevel')}>
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {SKILL_LEVEL_LABELS[level]}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </>
        ) : null}

        <FormField label="Guardian name" error={errors.guardianName?.message}>
          {(field) => <Input {...field} {...register('guardianName')} />}
        </FormField>

        <FormField label="Guardian mobile" error={errors.guardianPhone?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('guardianPhone')}
              inputMode="tel"
              hasError={Boolean(errors.guardianPhone)}
            />
          )}
        </FormField>

        <FormField label="Guardian email" error={errors.guardianEmail?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('guardianEmail')}
              type="email"
              hasError={Boolean(errors.guardianEmail)}
            />
          )}
        </FormField>

        <FormField label="Emergency contact" error={errors.emergencyContact?.message}>
          {(field) => <Input {...field} {...register('emergencyContact')} />}
        </FormField>

        {canManage ? (
          <FormField
            label="Medical notes"
            className="sm:col-span-2"
            hint="Visible to academy staff only."
            error={errors.medicalNotes?.message}
          >
            {(field) => <Textarea {...field} {...register('medicalNotes')} rows={3} />}
          </FormField>
        ) : null}

        {error ? (
          <p role="alert" className="text-danger text-sm sm:col-span-2">
            {errorMessage(error)}
          </p>
        ) : null}
      </CardBody>

      <CardFooter>
        <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
          Save changes
        </Button>
      </CardFooter>
    </form>
  );
}
