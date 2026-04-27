// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_toast.dart';

class NewPasswordPage extends StatefulWidget {
  const NewPasswordPage({super.key});

  @override
  State<NewPasswordPage> createState() => _NewPasswordPageState();
}

class _NewPasswordPageState extends State<NewPasswordPage> {
  final token = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  bool loading = false;

  @override
  void dispose() {
    token.dispose();
    password.dispose();
    confirmPassword.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (password.text != confirmPassword.text) {
      showAppToast(context, 'Les mots de passe ne correspondent pas.', error: true);
      return;
    }
    setState(() => loading = true);
    try {
      await ApiClient.put('/auth/new-password', data: {
        'token': token.text.trim(),
        'new_password': password.text.trim(),
      });
      showAppToast(context, 'Mot de passe mis à jour avec succès.');
    } catch (_) {
      showAppToast(context, 'Échec de la mise à jour du mot de passe.', error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nouveau mot de passe')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Token'),
                const SizedBox(height: 6),
                TextField(controller: token),
                const SizedBox(height: 12),
                const Text('Nouveau mot de passe'),
                const SizedBox(height: 6),
                TextField(controller: password, obscureText: true),
                const SizedBox(height: 12),
                const Text('Confirmer le mot de passe'),
                const SizedBox(height: 6),
                TextField(controller: confirmPassword, obscureText: true),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: loading ? null : submit,
                    style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                    child: Text(loading ? 'Mise à jour...' : 'Valider'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
