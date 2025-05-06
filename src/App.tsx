import React, { useEffect, useState } from 'react';
import { type Bridge, type BridgeStore, linkBridge } from '@webview-bridge/web';
import './App.css';

type ColorSchemeName = 'light' | 'dark' | null | undefined;

export interface BridgeState extends Bridge {
  query: (obj: any) => Promise<any>;
  getColorScheme: () => Promise<ColorSchemeName>;
  scanCode: () => Promise<string>;
  supportNfc: () => Promise<boolean>;
  readNfcTag: () => Promise<string>;
}

type AppBridge = BridgeStore<BridgeState>;
const bridge = linkBridge<AppBridge>();

function App() {
  const [ colorScheme, setColorScheme ] = useState<ColorSchemeName>();
  const [ qrCode, setQrCode ] = useState<string>('n/a');
  const [ supportNfcFeature, setSupportNfcFeature ] = useState<boolean>(false);
  const [ tagValue, setTagValue ] = useState<string>('n/a');

  const clickGetColorScheme = async () => {
    const cs = await bridge.getColorScheme();
    console.log('Webapp: clickGetColorScheme: ', cs);
    setColorScheme(cs);
  }

  const scanQrCode = async () => {
    const id = await bridge.scanCode();
    console.log('Webapp: scanQrCode: ', id);
  }

  const checkSupportNfc = async () => {
    const support = await bridge.supportNfc();
    console.log('Webapp: support: ', support);
    setSupportNfcFeature(support);
  }

  const readNfcTag = async () => {
    const id = await bridge.readNfcTag();
    console.log('Webapp: scanTag: ', id);
  }

  useEffect(() => {
    // Subscribe to events from react native.
    return () => {
      bridge.addEventListener("scanCodeResult", (message: any) => {
        console.log('Webapp: scanCodeResult: ', message);
        setQrCode(message.value);
      });
      bridge.addEventListener("readNfcTagResult", (message: any) => {
        console.log('Webapp: readNfcTagResult: ', message);
        setTagValue(message.value);
      });
    };
  }, []);
  
  return (
    <div>
      <header>
        <div>
          <button onClick={clickGetColorScheme}>Get Color Scheme</button>
          <div>Color Scheme: {colorScheme}</div>
        </div>
        <div>
          <button onClick={scanQrCode}>Scan QR Code</button>
          <div>Code: {qrCode}</div>
        </div>
        <div>
          <button onClick={checkSupportNfc}>Check NFC Support</button>
          <div>Support NFC: {JSON.stringify(supportNfcFeature)}</div>
        </div>
        <div>
          <button onClick={readNfcTag}>Read NFC Tag</button>
          <div>Tag: {tagValue}</div>
        </div>
      </header>
    </div>
  );
}

export default App;
