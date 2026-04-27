class TaskItem {
  final String id;
  final String title;
  final String? description;
  final bool isDone;
  final String? dueDate;

  TaskItem({
    required this.id,
    required this.title,
    this.description,
    required this.isDone,
    this.dueDate,
  });

  factory TaskItem.fromJson(Map<String, dynamic> json) => TaskItem(
        id: json['id'].toString(),
        title: json['title']?.toString() ?? '',
        description: json['description']?.toString(),
        isDone: json['is_done'] == true,
        dueDate: json['due_date']?.toString(),
      );
}
