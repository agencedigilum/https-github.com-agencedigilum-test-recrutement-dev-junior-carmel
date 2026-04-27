import 'mobile_user.dart';

class AuthPayload {
  final String accessToken;
  final String refreshToken;
  final MobileUser user;

  AuthPayload({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthPayload.fromJson(Map<String, dynamic> json) => AuthPayload(
        accessToken: json['access_token']?.toString() ?? '',
        refreshToken: json['refresh_token']?.toString() ?? '',
        user: MobileUser.fromJson(json['user'] as Map<String, dynamic>),
      );
}
