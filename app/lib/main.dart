import 'package:flutter/material.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String nfcData = '';

  @override
  void initState() {
    super.initState();
    initNFC();
  }

  Future<void> initNFC() async {
    FlutterNfcKit.onNfcError().listen((error) {
      print('NFC Error: $error');
    });

    FlutterNfcKit.onNdef().listen((NdefMessage message) {
      final record = message.records.first;
      setState(() {
        nfcData = String.fromCharCodes(record.payload);
      });

      sendDataToServer(nfcData);
    });

    await FlutterNfcKit.start();
  }

  Future<void> sendDataToServer(String data) async {
    final url = 'http://129.21.133.128:8080/send';
    final response = await http.post(
      Uri.parse(url),
      body: {'nfcData': data},
    );

    if (response.statusCode == 200) {
      print('Data sent to server successfully');
    } else {
      print('Failed to send data to server. Status code: ${response.statusCode}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('NFC Reader'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('NFC Data: $nfcData'),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    FlutterNfcKit.stop();
    super.dispose();
  }
}
