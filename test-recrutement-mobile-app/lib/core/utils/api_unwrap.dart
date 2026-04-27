import 'package:dio/dio.dart';

Map<String, dynamic> unwrapResponse(Response<dynamic> response) {
  if (response.data is Map<String, dynamic>) {
    final map = response.data as Map<String, dynamic>;
    if (map['data'] is Map<String, dynamic> || map['data'] is List<dynamic>) {
      return map;
    }
  }
  return {'data': response.data};
}
