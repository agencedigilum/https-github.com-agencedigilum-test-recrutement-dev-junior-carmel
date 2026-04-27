class MobileUser {
  final String email;
  final String? firstName;
  final String? lastName;
  final String? id;

  MobileUser({required this.email, this.firstName, this.lastName, this.id});

  factory MobileUser.fromJson(Map<String, dynamic> json) => MobileUser(
        id: json['id']?.toString(),
        email: json['email']?.toString() ?? '',
        firstName: json['first_name']?.toString(),
        lastName: json['last_name']?.toString(),
      );
}
