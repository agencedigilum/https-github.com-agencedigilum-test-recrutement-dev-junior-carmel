// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_toast.dart';

class ConfirmMailPage extends StatefulWidget {
  const ConfirmMailPage({super.key});

  @override
  State<ConfirmMailPage> createState() => _ConfirmMailPageState();
}

class _ConfirmMailPageState extends State<ConfirmMailPage> {
  final token = TextEditingController();
  bool loading = false;

  @override
  void dispose() {
    token.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() => loading = true);
    try {
      await ApiClient.post('/auth/confirm-mail', data: {'token': token.text.trim()});
      showAppToast(context, 'Email confirmé avec succès.');
    } catch (_) {
      showAppToast(context, 'Token invalide ou expiré.', error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Confirmation email')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Token'),
                const SizedBox(height: 6),
                TextField(controller: token),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: loading ? null : submit,
                    style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                    child: Text(loading ? 'Confirmation...' : 'Confirmer'),
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
