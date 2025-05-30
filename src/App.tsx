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

const defaultPickImageOptions = {
  type: 'imageLibrary',
  editingType: 'native',
  allowsMultipleSelection: false,
  base64: true,
  cameraType: 'back',
  mediaTypes: 'images',
  quality: 0.2,
  stickers: [],
};

function App() {
  const [ colorScheme, setColorScheme ] = useState<ColorSchemeName>();
  const [ barcode, setBarcode ] = useState<string>('n/a');
  const [ supportNfcFeature, setSupportNfcFeature ] = useState<string>('n/a');
  const [ nfcTagValue, setNfcTagValue ] = useState<string>('n/a');
  const [ mimeType, setMimeType ] = useState<string | undefined>();
  const [ base64, setBase64 ] = useState<string | undefined>();
  const [ pickImageOptions, setPickImageOptions ] = useState<{
    type?: string;
    editingType?: string;
    allowsMultipleSelection?: boolean;
    mediaTypes?: string;
  }>({
    type: 'imageLibrary',
    editingType: 'native',
    allowsMultipleSelection: true,
    mediaTypes: 'images',
  });

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
    const options = {
      ...defaultPickImageOptions,
      ...pickImageOptions,
    };
    console.log('options:', options);
    const id = await bridge.pickPhoto(options);
    console.log('Webapp function pickPhoto: ', id);
  }

  const editPhoto = async () => {
    const id = await bridge.editPhoto({
      base64: base64,
      stickers: [],
    });
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
      bridge.addEventListener("pickPhotoResult", (message: any) => {
        console.log('Webapp message pickPhotoResult: ', message);
        setMimeType(message.assets[0].mimeType);
        setBase64(message.assets[0].base64);
      });
      bridge.addEventListener("editPhotoResult", (message: any) => {
        console.log('Webapp message editPhotoResult: ', message);
        setBase64(message.base64);
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
          <select name="type" 
            value={`${pickImageOptions.type}`} 
            onChange={e => setPickImageOptions(val => {
              return {
                ...val, 
                type: e.target.value,
              };
            })}
          >
            <option value="camera">Camera</option>
            <option value="imageLibrary">Image Library</option>
          </select>
          <select name="editingType"
            value={`${pickImageOptions.editingType}`}
            onChange={e => setPickImageOptions(val => {
              const editingType = e.target.value === 'undefined' ? undefined : e.target.value;
              return {
                ...val,
                editingType,
              };
            })}
          >
            <option value="native">Native</option>
            <option value="full">Full</option>
            <option value="undefined">Undefined</option>
          </select>
          <select name="allowsMultipleSelection"
            value={`${pickImageOptions.allowsMultipleSelection}`}
            onChange={e => setPickImageOptions(val => {
              var allowsMultipleSelection;
              switch (e.target.value) {
                case 'true':
                  allowsMultipleSelection = true;
                  break;
                case 'false':
                  allowsMultipleSelection = false;
                  break;
              }
              return {
                ...val,
                allowsMultipleSelection,
              };
            })}
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="undefined">Undefined</option>
          </select>
          <select name="mediaTypes"
            value={`${pickImageOptions.mediaTypes}`}
            onChange={e => setPickImageOptions(val => {
              const mediaTypes = e.target.value === 'undefined' ? undefined : e.target.value;
              return {
                ...val,
                mediaTypes,
              };
            })}
          >
            <option value="all">All</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
            <option value="undefined">Undefined</option>
          </select>
          <button onClick={pickPhoto}>Pick Photo</button>
        </div>
        <div>
          <button onClick={editPhoto} disabled={base64 === undefined}>Edit Photo</button>
        </div>
        <div>
          <div>Photo: {mimeType}</div>
          <div>
            {base64 && (
              <img 
                src={"data:" + mimeType + ";base64, " + base64} 
                style={{width: 300, height: 300}} 
                alt='n/a' 
              />
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
