// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/session_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/api_unwrap.dart';
import '../../../core/widgets/app_toast.dart';
import '../../../core/widgets/labeled_field.dart';
import '../../../features/auth/models/mobile_user.dart';
import '../../../features/tasks/models/task_item.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int page = 1;
  int limit = 10;
  String search = '';
  String isDone = '';
  String sort = 'created_at';
  String order = 'desc';

  bool loading = true;
  bool creating = false;
  bool updating = false;
  bool deleting = false;

  MobileUser? user;
  List<TaskItem> tasks = [];
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();
  final dueDateController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _boot();
  }

  @override
  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
    dueDateController.dispose();
    super.dispose();
  }

  Future<void> _boot() async {
    final token = await SessionStore.getAccessToken();
    if (token == null) {
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed('/auth');
      return;
    }
    user = await SessionStore.getUser();
    await _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => loading = true);
    try {
      final res = await ApiClient.get('/tasks', auth: true, queryParameters: {
        'page': page,
        'limit': limit,
        'search': search,
        'is_done': isDone,
        'sort': sort,
        'order': order,
      });
      final data = unwrapResponse(res)['data'] as Map<String, dynamic>;
      tasks = (data['data'] as List<dynamic>)
          .map((e) => TaskItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      showAppToast(context, 'Échec du chargement des tâches.', error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _createTaskFromDialog() async {
    if (titleController.text.trim().isEmpty) {
      showAppToast(context, 'Le titre est obligatoire.', error: true);
      return;
    }
    setState(() => creating = true);
    try {
      await ApiClient.post('/tasks', auth: true, data: {
        'title': titleController.text.trim(),
        'description': descriptionController.text.trim().isEmpty
            ? null
            : descriptionController.text.trim(),
        'due_date': dueDateController.text.trim().isEmpty
            ? null
            : dueDateController.text.trim(),
      });
      showAppToast(context, 'Tâche créée avec succès.');
      titleController.clear();
      descriptionController.clear();
      dueDateController.clear();
      if (mounted) Navigator.of(context).pop();
      await _loadTasks();
    } catch (_) {
      showAppToast(context, 'Échec de la création de la tâche.', error: true);
    } finally {
      if (mounted) setState(() => creating = false);
    }
  }

  Future<void> _toggleTask(TaskItem task) async {
    setState(() => updating = true);
    try {
      await ApiClient.put('/tasks/${task.id}', auth: true, data: {
        'is_done': !task.isDone,
      });
      showAppToast(context, 'Statut mis à jour.');
      await _loadTasks();
    } catch (_) {
      showAppToast(context, 'Échec de la mise à jour.', error: true);
    } finally {
      if (mounted) setState(() => updating = false);
    }
  }

  Future<void> _editTask(TaskItem task) async {
    titleController.text = task.title;
    descriptionController.text = task.description ?? '';
    dueDateController.text = task.dueDate ?? '';

    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Modifier la tâche'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Titre'),
              const SizedBox(height: 6),
              TextField(controller: titleController),
              const SizedBox(height: 10),
              const Text('Description'),
              const SizedBox(height: 6),
              TextField(controller: descriptionController),
              const SizedBox(height: 10),
              const Text('Date d’échéance (ISO)'),
              const SizedBox(height: 6),
              TextField(controller: dueDateController),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Fermer'),
          ),
          ElevatedButton(
            onPressed: updating
                ? null
                : () async {
                    setState(() => updating = true);
                    try {
                      await ApiClient.put('/tasks/${task.id}', auth: true, data: {
                        'title': titleController.text.trim(),
                        'description': descriptionController.text.trim(),
                        'due_date': dueDateController.text.trim().isEmpty
                            ? null
                            : dueDateController.text.trim(),
                      });
                      if (mounted) Navigator.of(context).pop();
                      showAppToast(context, 'Tâche modifiée avec succès.');
                      await _loadTasks();
                    } catch (_) {
                      showAppToast(context, 'Échec de la modification.', error: true);
                    } finally {
                      if (mounted) setState(() => updating = false);
                    }
                  },
            style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow),
            child: Text(updating ? 'Sauvegarde...' : 'Sauvegarder'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteTask(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Confirmation'),
        content: const Text('Confirmer la suppression de cette tâche ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => deleting = true);
    try {
      await ApiClient.delete('/tasks/$id', auth: true);
      showAppToast(context, 'Tâche supprimée avec succès.');
      await _loadTasks();
    } catch (_) {
      showAppToast(context, 'Échec de la suppression.', error: true);
    } finally {
      if (mounted) setState(() => deleting = false);
    }
  }

  Future<void> _openCreateDialog() async {
    titleController.clear();
    descriptionController.clear();
    dueDateController.clear();

    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Ajouter une tâche'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Titre'),
              const SizedBox(height: 6),
              TextField(controller: titleController),
              const SizedBox(height: 10),
              const Text('Description'),
              const SizedBox(height: 6),
              TextField(controller: descriptionController),
              const SizedBox(height: 10),
              const Text('Date d’échéance (ISO)'),
              const SizedBox(height: 6),
              TextField(controller: dueDateController),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Fermer'),
          ),
          ElevatedButton(
            onPressed: creating ? null : _createTaskFromDialog,
            style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow),
            child: Text(creating ? 'Création...' : 'Créer'),
          ),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    await SessionStore.clear();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/auth');
  }

  @override
  Widget build(BuildContext context) {
    final greeting = user == null
        ? ''
        : ((user!.firstName ?? '').isNotEmpty || (user!.lastName ?? '').isNotEmpty)
            ? '${user!.firstName ?? ''} ${user!.lastName ?? ''}'.trim()
            : user!.email;

    return Scaffold(
      appBar: AppBar(
        title: const Text('DIGILUM', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pushNamed('/profile').then((_) => _loadTasks()),
            child: const Text('Mon profil'),
          ),
          TextButton(
            onPressed: _logout,
            child: const Text('Déconnexion'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bonjour $greeting',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: kTitleBlack),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                LabeledField(
                  label: 'Recherche',
                  child: TextField(
                    onChanged: (v) => search = v,
                    decoration: const InputDecoration(hintText: 'Recherche...'),
                  ),
                ),
                LabeledField(
                  label: 'Résultats/page',
                  child: DropdownButtonFormField<int>(
                    value: limit,
                    items: const [
                      DropdownMenuItem(value: 10, child: Text('10 / page')),
                      DropdownMenuItem(value: 20, child: Text('20 / page')),
                    ],
                    onChanged: (v) => limit = v ?? 10,
                  ),
                ),
                LabeledField(
                  label: 'Statut',
                  child: DropdownButtonFormField<String>(
                    value: isDone,
                    items: const [
                      DropdownMenuItem(value: '', child: Text('Tous')),
                      DropdownMenuItem(value: 'true', child: Text('Fait')),
                      DropdownMenuItem(value: 'false', child: Text('Non fait')),
                    ],
                    onChanged: (v) => isDone = v ?? '',
                  ),
                ),
                ElevatedButton(
                  onPressed: _loadTasks,
                  style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
                  child: const Text('Appliquer'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _openCreateDialog,
              style: ElevatedButton.styleFrom(backgroundColor: kPrimaryYellow, foregroundColor: kTitleBlack),
              child: const Text('Ajouter'),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.separated(
                      itemCount: tasks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final task = tasks[index];
                        return Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFEDEDED)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: ListTile(
                            title: Text(
                              task.title,
                              style: TextStyle(
                                decoration: task.isDone ? TextDecoration.lineThrough : null,
                              ),
                            ),
                            subtitle: Text(task.description?.isEmpty ?? true
                                ? 'Aucune description'
                                : task.description!),
                            trailing: Wrap(
                              spacing: 4,
                              children: [
                                IconButton(
                                  onPressed: updating ? null : () => _editTask(task),
                                  icon: const Icon(Icons.edit),
                                ),
                                IconButton(
                                  onPressed: updating ? null : () => _toggleTask(task),
                                  icon: const Icon(Icons.check),
                                ),
                                IconButton(
                                  onPressed: deleting ? null : () => _deleteTask(task.id),
                                  icon: const Icon(Icons.delete),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton(
                  onPressed: page > 1
                      ? () async {
                          setState(() => page -= 1);
                          await _loadTasks();
                        }
                      : null,
                  child: const Text('Précédent'),
                ),
                const SizedBox(width: 10),
                Text('Page $page'),
                const SizedBox(width: 10),
                OutlinedButton(
                  onPressed: () async {
                    setState(() => page += 1);
                    await _loadTasks();
                  },
                  child: const Text('Suivant'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
