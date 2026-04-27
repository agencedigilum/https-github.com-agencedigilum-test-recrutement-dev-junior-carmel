// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/session_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/api_unwrap.dart';
import '../../../core/widgets/app_toast.dart';
import '../models/auth_payload.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _firstNameController = TextEditingController();

  String _mode = 'signup';
  bool _stepAuth = false;
  bool _loading = false;
  String? _infoMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _firstNameController.dispose();
    super.dispose();
  }

  Future<void> _verifyMail() async {
    setState(() {
      _loading = true;
      _infoMessage = null;
    });
    try {
      final res = await ApiClient.post('/auth/verify-mail', data: {
        'email': _emailController.text.trim(),
      });
      final data = unwrapResponse(res)['data'] as Map<String, dynamic>;
      final exists = data['exists'] == true;
      final active = data['is_active'] == true;
      if (exists && !active) {
        setState(() => _infoMessage = 'Compte inactif. Vérifie ton email.');
        showAppToast(context, 'Compte inactif. Vérifie ton email.', error: true);
      } else {
        setState(() {
          _mode = exists ? 'signin' : 'signup';
          _stepAuth = true;
        });
        showAppToast(context, 'Email vérifié.');
      }
    } catch (_) {
      showAppToast(context, 'Échec de la vérification email.', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submitAuth() async {
    if (_passwordController.text.trim().isEmpty) {
      showAppToast(context, 'Mot de passe obligatoire.', error: true);
      return;
    }
    setState(() => _loading = true);
    try {
      final path = _mode == 'signin' ? '/auth/sign-in' : '/auth/sign-up';
      final payload = {
        'email': _emailController.text.trim(),
        'password': _passwordController.text.trim(),
        if (_mode == 'signup' && _firstNameController.text.trim().isNotEmpty)
          'first_name': _firstNameController.text.trim(),
      };
      final res = await ApiClient.post(path, data: payload);
      final data = unwrapResponse(res)['data'] as Map<String, dynamic>;
      final auth = AuthPayload.fromJson(data);
      await SessionStore.save(auth);
      if (!mounted) return;
      showAppToast(
        context,
        _mode == 'signin' ? 'Connexion réussie.' : 'Compte créé avec succès.',
      );
      Navigator.of(context).pushReplacementNamed('/dashboard');
    } catch (_) {
      showAppToast(context, 'Échec de l’authentification.', error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: const BorderSide(color: Color(0xFFEAEAEA)),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Center(
                        child: Text(
                          'DIGILUM',
                          style: TextStyle(
                            color: kTitleBlack,
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Connexion / Inscription',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Entrez votre email pour continuer.',
                        style: TextStyle(color: kTextGray),
                      ),
                      const SizedBox(height: 16),
                      const Text('Email'),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 14),
                      if (!_stepAuth)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _verifyMail,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kPrimaryYellow,
                              foregroundColor: kTitleBlack,
                            ),
                            child: Text(_loading ? 'Vérification...' : 'Continuer'),
                          ),
                        ),
                      if (_stepAuth) ...[
                        if (_mode == 'signup') ...[
                          const Text('Prénom (optionnel)'),
                          const SizedBox(height: 6),
                          TextField(controller: _firstNameController),
                          const SizedBox(height: 14),
                        ],
                        const Text('Mot de passe'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _submitAuth,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kPrimaryYellow,
                              foregroundColor: kTitleBlack,
                            ),
                            child: Text(_loading
                                ? 'Chargement...'
                                : _mode == 'signin'
                                    ? 'Se connecter'
                                    : 'Créer mon compte'),
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => Navigator.of(context).pushNamed('/forget-password'),
                          child: const Text('Mot de passe oublié ?'),
                        ),
                      ),
                      if (_infoMessage != null)
                        Text(
                          _infoMessage!,
                          style: const TextStyle(color: Colors.red),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
