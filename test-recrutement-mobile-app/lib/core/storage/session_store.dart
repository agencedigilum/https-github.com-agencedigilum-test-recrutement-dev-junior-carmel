import 'package:shared_preferences/shared_preferences.dart';
import '../../features/auth/models/auth_payload.dart';
import '../../features/auth/models/mobile_user.dart';

class SessionStore {
  static const _access = 'access_token';
  static const _refresh = 'refresh_token';
  static const _email = 'user_email';
  static const _firstName = 'user_first_name';
  static const _lastName = 'user_last_name';

  static Future<void> save(AuthPayload payload) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_access, payload.accessToken);
    await prefs.setString(_refresh, payload.refreshToken);
    await prefs.setString(_email, payload.user.email);
    await prefs.setString(_firstName, payload.user.firstName ?? '');
    await prefs.setString(_lastName, payload.user.lastName ?? '');
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_access);
    await prefs.remove(_refresh);
    await prefs.remove(_email);
    await prefs.remove(_firstName);
    await prefs.remove(_lastName);
  }

  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_access);
  }

  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_refresh);
  }

  static Future<MobileUser?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString(_email);
    if (email == null) return null;
    return MobileUser(
      email: email,
      firstName: prefs.getString(_firstName),
      lastName: prefs.getString(_lastName),
    );
  }
}
