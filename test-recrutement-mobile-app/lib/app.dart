import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/pages/auth_gate.dart';
import 'features/auth/pages/auth_page.dart';
import 'features/auth/pages/confirm_mail_page.dart';
import 'features/auth/pages/forget_password_page.dart';
import 'features/auth/pages/new_password_page.dart';
import 'features/dashboard/pages/dashboard_page.dart';
import 'features/profile/pages/profile_page.dart';

class DigiLumApp extends StatelessWidget {
  const DigiLumApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'DigiLum',
      theme: buildAppTheme(),
      home: const AuthGate(),
      routes: {
        '/auth': (_) => const AuthPage(),
        '/dashboard': (_) => const DashboardPage(),
        '/profile': (_) => const ProfilePage(),
        '/forget-password': (_) => const ForgetPasswordPage(),
        '/new-password': (_) => const NewPasswordPage(),
        '/confirm-mail': (_) => const ConfirmMailPage(),
      },
    );
  }
}
