import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/session_store.dart';

class ApiClient {
  ApiClient._();
  static final Dio _dio = Dio(BaseOptions(baseUrl: kApiBaseUrl));

  static Future<Response<dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool auth = false,
  }) async {
    return _dio.get(
      path,
      queryParameters: queryParameters,
      options: await _options(auth),
    );
  }

  static Future<Response<dynamic>> post(
    String path, {
    dynamic data,
    bool auth = false,
  }) async {
    return _dio.post(path, data: data, options: await _options(auth));
  }

  static Future<Response<dynamic>> put(
    String path, {
    dynamic data,
    bool auth = false,
  }) async {
    return _dio.put(path, data: data, options: await _options(auth));
  }

  static Future<Response<dynamic>> delete(
    String path, {
    bool auth = false,
  }) async {
    return _dio.delete(path, options: await _options(auth));
  }

  static Future<Options> _options(bool auth) async {
    if (!auth) return Options(headers: {'Content-Type': 'application/json'});
    final token = await SessionStore.getAccessToken();
    return Options(headers: {
      'Content-Type': 'application/json',
      'Authorization': token != null ? 'Bearer $token' : '',
    });
  }
}
