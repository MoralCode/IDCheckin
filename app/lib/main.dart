import 'package:flutter/material.dart';
import 'package:nfc_in_flutter/nfc_in_flutter.dart';

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
    NfcData data = await Nfc.startSession(
      alertMessageIOS: 'Approach the NFC tag',
      onDiscovered: (NfcData data) async {
        setState(() {
          nfcData = String.fromCharCodes(data.content);
        });

        sendDataToServer(nfcData);
      },
    );
    print('NFC session started: $data');
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
    Nfc.stopSession();
    super.dispose();
  }
}
