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
  const [ image, setImage ] = useState<any | undefined>();
  const [ pickImageOptions, setPickImageOptions ] = useState<{
    type?: string;
    editingType?: string;
    allowsMultipleSelection?: boolean;
    mediaTypes?: string;
    base64?: boolean;
  }>({
    type: 'imageLibrary',
    editingType: 'native',
    allowsMultipleSelection: true,
    mediaTypes: 'images',
    base64: true,
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
      path: image?.uri ?? '',
      stickers: [],
      base64: pickImageOptions.base64,
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
        setImage(message.assets[0]);
      });
      bridge.addEventListener("editPhotoResult", (message: any) => {
        console.log('Webapp message editPhotoResult: ', message);
        setImage(message.asset);
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
          <label>Pick image, Type: </label>
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
        </div>
        <div>
        <label>Edit type: </label>
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
        </div>
        <div>
          <label>Allows Multiple Selection: </label>
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
        </div>
        <div>
          <label>Base64: </label>
          <select name="base64"
            value={`${pickImageOptions.base64}`}
            onChange={e => setPickImageOptions(val => {
              var base64;
              switch (e.target.value) {
                case 'true':
                  base64 = true;
                  break;
                case 'false':
                  base64 = false;
                  break;
              }
              return {
                ...val,
                base64,
              };
            })}
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="undefined">Undefined</option>
          </select>
        </div>
        <div>
        <label>Media Types: </label>
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
          <button onClick={editPhoto} disabled={image === undefined}>Edit Photo</button>
        </div>
        <div>
          <div>Image file name: {image?.fileName}</div>
          <div>Image file size: {image?.fileSize}</div>
          <div>Image height: {image?.height}</div>
          <div>Image width: {image?.width}</div>
          <div>Image type: {image?.type}</div>
          <div>Image mime type: {image?.mimeType}</div>
          <div>Image URI: {image?.uri}</div>
          <div>
            {image?.mimeType && image?.base64 && (
              <img 
                src={"data:" + image.mimeType + ";base64, " + image.base64} 
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
