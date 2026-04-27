import 'package:flutter_test/flutter_test.dart';
import 'package:test_recrutement_mobile_app/main.dart';

void main() {
  testWidgets('Affiche l écran d auth au démarrage', (WidgetTester tester) async {
    await tester.pumpWidget(const DigiLumApp());
    await tester.pumpAndSettle();

    expect(find.text('Connexion / Inscription'), findsOneWidget);
  });
}
