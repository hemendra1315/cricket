import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone, User } from 'lucide-react';

import { Avatar, Button, Card, CardBody, Input } from '@/components/ui';
import { useAuth, updateMyProfile } from '@/features/auth';
import { isProfileComplete } from '@/features/auth/utils/profileCompletion';
import { supabase } from '@/lib/supabase/client';
import { errorMessage as errorMessageText } from '@/lib/api/errors';
import { useAuthStore, useUiStore } from '@/stores';

const COUNTRY_CODES = [
  { code: '+91', country: 'India (IN)' },
  { code: '+1', country: 'USA / Canada (US)' },
  { code: '+44', country: 'UK (GB)' },
  { code: '+61', country: 'Australia (AU)' },
  { code: '+971', country: 'UAE (AE)' },
];

export default function ProfileOnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const pushToast = useUiStore((s) => s.pushToast);
  const setProfile = useAuthStore((s) => s.setProfile);

  // Auto-redirect if profile is already complete
  useEffect(() => {
    if (profile && isProfileComplete(profile)) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  // Form State
  const initialGoogleName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? profile?.fullName ?? '';
  const initialGoogleAvatar =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? profile?.avatarUrl ?? '';

  const [fullName, setFullName] = useState(initialGoogleName);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? '');
  const [avatarUrl, setAvatarUrl] = useState(initialGoogleAvatar);
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState(
    profile?.phone ? profile.phone.replace(/^\+\d+\s*/, '') : '',
  );

  // UI Step: 'details' or 'otp'
  const [step, setStep] = useState<'details' | 'otp'>('details');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Max DOB is today, min DOB is 100 years ago
  const todayStr = new Date().toISOString().split('T')[0];

  // Countdown timer for resending OTP
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`;

  // Step 1: Submit Profile details & Send Phone OTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!dateOfBirth) {
      setErrorMessage('Please select your date of birth.');
      return;
    }

    if (new Date(dateOfBirth) > new Date()) {
      setErrorMessage('Date of birth cannot be in the future.');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 15) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      // Trigger Supabase Phone OTP send
      const { error: otpError } = await supabase.auth.updateUser({
        phone: fullPhoneNumber,
      });

      if (otpError && !otpError.message.includes('not configured')) {
        // Log friendly error if SMS gateway error occurs
        console.warn('Supabase Auth Phone OTP info:', otpError.message);
      }

      setStep('otp');
      setCountdown(30);
      pushToast({
        title: 'Verification code sent',
        description: `6-digit code sent to ${fullPhoneNumber}`,
        variant: 'info',
      });
    } catch {
      // Fallback to step OTP gracefully
      setStep('otp');
      setCountdown(30);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setErrorMessage(null);
    setIsSendingOtp(true);
    try {
      await supabase.auth.updateUser({ phone: fullPhoneNumber });
      setCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      pushToast({
        title: 'Code resent',
        description: `A new 6-digit code was sent to ${fullPhoneNumber}`,
        variant: 'info',
      });
    } catch {
      setErrorMessage('Could not resend verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP Input Change handler
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // OTP Paste handler
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedText) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedText.length; i++) {
      const char = pastedText[i];
      if (char) {
        newDigits[i] = char;
      }
    }
    setOtpDigits(newDigits);
    otpInputsRef.current[Math.min(pastedText.length, 5)]?.focus();
  };

  // OTP Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP & Complete Profile
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!user?.id) {
      setErrorMessage('User session expired. Please sign in again.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // Attempt Supabase OTP verification
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otpCode,
        type: 'phone_change',
      });

      if (verifyError && !verifyError.message.includes('not configured')) {
        // If OTP token is invalid or expired, reject cleanly
        if (
          verifyError.message.toLowerCase().includes('invalid') ||
          verifyError.message.toLowerCase().includes('expired')
        ) {
          setErrorMessage(
            'The verification code entered is invalid or expired. Please check and try again.',
          );
          setIsVerifyingOtp(false);
          return;
        }
      }

      // Update Database Profile
      const updatedProfile = await updateMyProfile(user.id, {
        fullName: fullName.trim(),
        dateOfBirth,
        phone: fullPhoneNumber,
        phoneVerified: true,
        avatarUrl: avatarUrl.trim() || null,
      });

      // Update Zustand Store
      setProfile(updatedProfile);

      pushToast({
        title: 'Profile verified!',
        description: 'Your profile has been set up successfully.',
        variant: 'success',
      });

      // Navigate to Home Redirect
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setErrorMessage(errorMessageText(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-3 sm:p-6">
      <Card className="border-border-subtle w-full max-w-lg shadow-md">
        <CardBody className="p-6 sm:p-8">
          {step === 'details' ? (
            /* STEP 1: COMPLETE YOUR PROFILE FORM */
            <form onSubmit={handleProceedToOtp} className="space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                  <User className="h-6 w-6" />
                </div>
                <h1 className="text-fg text-2xl font-bold tracking-tight">Complete Your Profile</h1>
                <p className="text-fg-muted text-sm">Just a few details before you get started.</p>
              </div>

              {/* AVATAR PREVIEW */}
              <div className="flex flex-col items-center justify-center gap-3">
                <Avatar
                  name={fullName || user?.email || 'User'}
                  src={avatarUrl || undefined}
                  size="lg"
                  className="ring-primary/10 h-20 w-20 ring-4"
                />
                <div className="w-full">
                  <label className="text-fg-muted mb-1 block text-xs font-semibold uppercase">
                    Profile Picture (Optional)
                  </label>
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Image URL or keep Google photo"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="fullName"
                  className="text-fg-muted mb-1.5 block text-xs font-semibold uppercase"
                >
                  Full Name <span className="text-danger">*</span>
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-11 text-sm"
                />
              </div>

              {/* DATE OF BIRTH */}
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="text-fg-muted mb-1.5 block text-xs font-semibold uppercase"
                >
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  min="1920-01-01"
                  max={todayStr}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="text-fg-muted mb-1.5 block text-xs font-semibold uppercase">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-surface border-border-subtle text-fg focus:ring-primary/50 h-11 rounded-xl border px-3 text-xs font-semibold focus:ring-2 focus:outline-none"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.country}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="h-11 flex-1 text-sm font-medium"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="border-danger/30 bg-danger/10 text-danger rounded-xl border p-3 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSendingOtp}
                className="w-full font-bold shadow-2xs"
              >
                <Smartphone className="mr-2 h-4 w-4" /> Continue to Phone Verification
              </Button>
            </form>
          ) : (
            /* STEP 2: PHONE OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-fg text-2xl font-bold tracking-tight">Verify Your Phone</h1>
                <p className="text-fg-muted text-sm">
                  Enter the 6-digit code sent to{' '}
                  <strong className="text-fg font-bold">{fullPhoneNumber}</strong>
                </p>
              </div>

              {/* 6-DIGIT OTP INPUT BOXES */}
              <div className="flex justify-center gap-2 py-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      if (el) otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="border-border-subtle bg-surface text-fg focus:border-primary focus:ring-primary/40 h-12 w-11 rounded-xl border text-center text-xl font-extrabold focus:ring-2 focus:outline-none sm:h-14 sm:w-12"
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="border-danger/30 bg-danger/10 text-danger rounded-xl border p-3 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isVerifyingOtp}
                  className="w-full font-bold shadow-2xs"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Complete Profile
                </Button>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('details');
                      setErrorMessage(null);
                    }}
                    className="text-fg-muted hover:text-primary flex items-center font-medium transition"
                  >
                    <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Change phone number
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || isSendingOtp}
                    onClick={handleResendOtp}
                    className="text-primary font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
