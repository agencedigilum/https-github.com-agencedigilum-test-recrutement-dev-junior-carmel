// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/api_unwrap.dart';
import '../../../core/widgets/app_toast.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final currentPasswordMail = TextEditingController();
  final newEmail = TextEditingController();
  final currentPassword = TextEditingController();
  final newPassword = TextEditingController();
  bool loadingProfile = true;
  bool updating = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    currentPasswordMail.dispose();
    newEmail.dispose();
    currentPassword.dispose();
    newPassword.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    try {
      final res = await ApiClient.get('/auth/profile', auth: true);
      final data = unwrapResponse(res)['data'] as Map<String, dynamic>;
      firstName.text = data['first_name']?.toString() ?? '';
      lastName.text = data['last_name']?.toString() ?? '';
    } catch (_) {
      showAppToast(context, 'Échec de chargement du profil.', error: true);
    } finally {
      if (mounted) setState(() => loadingProfile = false);
    }
  }

  Future<void> _updateProfile() async {
    setState(() => updating = true);
    try {
      await ApiClient.put('/auth/profile', auth: true, data: {
        'first_name': firstName.text.trim(),
        'last_name': lastName.text.trim(),
      });
      showAppToast(context, 'Profil mis à jour avec succès.');
    } catch (_) {
      showAppToast(context, 'Échec de la mise à jour du profil.', error: true);
    } finally {
      if (mounted) setState(() => updating = false);
    }
  }

  Future<void> _changeEmail() async {
    setState(() => updating = true);
    try {
      await ApiClient.put('/auth/change-mail', auth: true, data: {
        'current_password': currentPasswordMail.text.trim(),
        'new_email': newEmail.text.trim(),
      });
      showAppToast(context, 'Email mis à jour avec succès.');
    } catch (_) {
      showAppToast(context, 'Échec de la mise à jour de l’email.', error: true);
    } finally {
      if (mounted) setState(() => updating = false);
    }
  }

  Future<void> _changePassword() async {
    setState(() => updating = true);
    try {
      await ApiClient.put('/auth/change-password', auth: true, data: {
        'current_password': currentPassword.text.trim(),
        'new_password': newPassword.text.trim(),
      });
      showAppToast(context, 'Mot de passe mis à jour avec succès.');
    } catch (_) {
      showAppToast(context, 'Échec de la mise à jour du mot de passe.', error: true);
    } finally {
      if (mounted) setState(() => updating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: loadingProfile
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Informations générales', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  const Text('Prénom'),
                  const SizedBox(height: 6),
                  TextField(controller: firstName),
                  const SizedBox(height: 10),
                  const Text('Nom'),
                  const SizedBox(height: 6),
                  TextField(controller: lastName),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: updating ? null : _updateProfile,
                    style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                    child: Text(updating ? 'Sauvegarde...' : 'Sauvegarder'),
                  ),
                  const SizedBox(height: 22),
                  const Text('Changer l’email', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  const Text('Mot de passe actuel'),
                  const SizedBox(height: 6),
                  TextField(controller: currentPasswordMail, obscureText: true),
                  const SizedBox(height: 10),
                  const Text('Nouvel email'),
                  const SizedBox(height: 6),
                  TextField(controller: newEmail),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: updating ? null : _changeEmail,
                    style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                    child: Text(updating ? 'Mise à jour...' : 'Mettre à jour'),
                  ),
                  const SizedBox(height: 22),
                  const Text('Changer le mot de passe', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  const Text('Mot de passe actuel'),
                  const SizedBox(height: 6),
                  TextField(controller: currentPassword, obscureText: true),
                  const SizedBox(height: 10),
                  const Text('Nouveau mot de passe'),
                  const SizedBox(height: 6),
                  TextField(controller: newPassword, obscureText: true),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: updating ? null : _changePassword,
                    style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                    child: Text(updating ? 'Mise à jour...' : 'Mettre à jour'),
                  ),
                ],
              ),
            ),
    );
  }
}
