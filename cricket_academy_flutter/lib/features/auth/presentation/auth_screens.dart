import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cricket_academy_flutter/providers/auth_provider.dart';

class SignInScreen extends ConsumerWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sign In')),
      body: Center(
        child: authState.isLoading
            ? const CircularProgressIndicator()
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton(
                    onPressed: () => ref.read(authControllerProvider.notifier).signInWithGoogle(),
                    child: const Text('Sign In with Google'),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      // Navigate to phone OTP or trigger SMS login
                    },
                    child: const Text('Sign In with Phone OTP'),
                  ),
                ],
              ),
      ),
    );
  }
}

class PhoneOtpScreen extends ConsumerStatefulWidget {
  const PhoneOtpScreen({super.key});

  @override
  ConsumerState<PhoneOtpScreen> createState() => _PhoneOtpScreenState();
}

class _PhoneOtpScreenState extends ConsumerState<PhoneOtpScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Phone Authentication')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: authState.isLoading
              ? const CircularProgressIndicator()
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (!_otpSent) ...[
                      TextField(
                        controller: _phoneController,
                        decoration: const InputDecoration(labelText: 'Phone Number (+91...)'),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () async {
                          await ref.read(authControllerProvider.notifier).sendOtp(_phoneController.text);
                          setState(() {
                            _otpSent = true;
                          });
                        },
                        child: const Text('Send OTP'),
                      ),
                    ] else ...[
                      TextField(
                        controller: _otpController,
                        decoration: const InputDecoration(labelText: 'Verification Code'),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () async {
                          await ref.read(authControllerProvider.notifier).verifyOtp(
                                _phoneController.text,
                                _otpController.text,
                              );
                        },
                        child: const Text('Verify OTP'),
                      ),
                    ]
                  ],
                ),
        ),
      ),
    );
  }
}

class ProfileOnboardingScreen extends ConsumerWidget {
  const ProfileOnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile Onboarding')),
      body: const Center(
        child: Text('Onboarding Profile Form placeholder'),
      ),
    );
  }
}

class SelectAcademyScreen extends ConsumerWidget {
  const SelectAcademyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Select Academy')),
      body: authState.memberships.isEmpty
          ? const Center(child: Text('No memberships found. Join an academy.'))
          : ListView.builder(
              itemCount: authState.memberships.length,
              itemBuilder: (context, index) {
                final membership = authState.memberships[index];
                final academy = membership.academy;
                return ListTile(
                  title: Text(academy?['name'] ?? 'Academy'),
                  subtitle: Text(membership.role),
                  onTap: () {
                    ref.read(authControllerProvider.notifier).selectAcademy(membership.academyId);
                  },
                );
              },
            ),
    );
  }
}
