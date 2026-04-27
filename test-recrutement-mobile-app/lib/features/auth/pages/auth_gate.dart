import 'package:flutter/material.dart';
import '../../../core/storage/session_store.dart';
import '../../dashboard/pages/dashboard_page.dart';
import 'auth_page.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _loading = true;
  bool _connected = false;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    _connected = (await SessionStore.getAccessToken()) != null;
    if (!mounted) return;
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return _connected ? const DashboardPage() : const AuthPage();
  }
}
