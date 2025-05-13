import React, { useEffect, useState } from 'react';
import { type Bridge, type BridgeStore, linkBridge } from '@webview-bridge/web';
import './App.css';

type ColorSchemeName = 'light' | 'dark' | null | undefined;

export interface BridgeState extends Bridge {
  query: (obj: any) => Promise<any>;
  getColorScheme: () => Promise<ColorSchemeName>;
  scanBarcode: () => Promise<string>;
  supportNfc: () => Promise<boolean>;
  readNfcTag: () => Promise<string>;
  pickPhoto: (options: any) => Promise<string>;
  editPhoto: (options: any) => Promise<string>;
}

type AppBridge = BridgeStore<BridgeState>;
const bridge = linkBridge<AppBridge>();

function App() {
  const [ colorScheme, setColorScheme ] = useState<ColorSchemeName>();
  const [ barcode, setBarcode ] = useState<string>('n/a');
  const [ supportNfcFeature, setSupportNfcFeature ] = useState<string>('n/a');
  const [ nfcTagValue, setNfcTagValue ] = useState<string>('n/a');
  const [ photo, setPhoto ] = useState<string | undefined>();

  const getColorScheme = async () => {
    const cs = await bridge.getColorScheme();
    console.log('Webapp function getColorScheme: ', cs);
    setColorScheme(cs);
  }

  const scanBarcode = async () => {
    const id = await bridge.scanBarcode();
    console.log('Webapp function scanBarcode: ', id);
  }

  const checkSupportNfc = async () => {
    const support = await bridge.supportNfc();
    console.log('Webapp function supportNfc: ', support);
    setSupportNfcFeature(JSON.stringify(support));
  }

  const readNfcTag = async () => {
    const id = await bridge.readNfcTag();
    console.log('Webapp function readNfcTag: ', id);
  }

  const pickPhoto = async () => {
    const id = await bridge.pickPhoto({});
    console.log('Webapp function pickPhoto: ', id);
  }

  const editPhoto = async () => {
    const id = await bridge.editPhoto({});
    console.log('Webapp function editPhoto: ', id);
  }

  useEffect(() => {
    // Subscribe to events from react native.
    return () => {
      bridge.addEventListener("scanBarcodeResult", (message: any) => {
        console.log('Webapp message scanBarcodeResult: ', message);
        setBarcode(message.value);
      });
      bridge.addEventListener("readNfcTagResult", (message: any) => {
        console.log('Webapp message readNfcTagResult: ', message);
        setNfcTagValue(message.value);
      });
      bridge.addEventListener("pickPhoto", (message: any) => {
        console.log('Webapp message pickPhotoResult: ', message);
        setPhoto(message.value);
      });
      bridge.addEventListener("editPhoto", (message: any) => {
        console.log('Webapp message editPhotoResult: ', message);
        setPhoto(message.value);
      });
    };
  }, []);
  
  return (
    <div>
      <header>
        <div>
          <button onClick={getColorScheme}>Get Color Scheme</button>
          <div>Color Scheme: {colorScheme}</div>
        </div>
        <div>
          <button onClick={scanBarcode}>Scan Barcode</button>
          <div>Code: {barcode}</div>
        </div>
        <div>
          <button onClick={checkSupportNfc}>Check NFC Support</button>
          <div>Support NFC: {supportNfcFeature}</div>
        </div>
        <div>
          <button onClick={readNfcTag}>Read NFC Tag</button>
          <div>Tag: {nfcTagValue}</div>
        </div>
        <div>
          <button onClick={pickPhoto}>Pick Photo</button>
          <button onClick={editPhoto}>Edit Photo</button>
          <div>Photo: {photo}</div>
        </div>
      </header>
    </div>
  );
}

export default App;
