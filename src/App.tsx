import React, { useEffect, useState } from 'react';
import { type Bridge, type BridgeStore, linkBridge } from '@webview-bridge/web';
import './App.css';

type ColorSchemeName = 'light' | 'dark' | null | undefined;

export interface ServiceDeployment {
	url: string;
	stage: string;
	serviceName: string;
	createdAt: string;
}

export interface BridgeState extends Bridge {
  query: (obj: any) => Promise<any>;
  getColorScheme: () => Promise<ColorSchemeName>;
  scanBarcode: () => Promise<string>;
  supportNfc: () => Promise<boolean>;
  readNfcTag: (infinity?: boolean) => Promise<string>;
  pickPhoto: (options: any) => Promise<string>;
  editPhoto: (options: any) => Promise<string>;
  getApiUrl: () => Promise<string>;
  getToken: () => Promise<string>;
  setWorkforceUrls: (values: Array<ServiceDeployment> | null) => Promise<void>;
  getWorkforceUrls: () => Promise<Array<ServiceDeployment> | null>;
  submitUpload: (objectType: string, objectId: string, asset: any) => Promise<string | undefined>;
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
  const [ readNfcOptions, setReadNfcOptions ] = useState<{
    infinity?: boolean,
  }>({
    infinity: undefined,
  });
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
  const [ apiUrl, setApiUrl ] = useState<string>('');
  const [ token, setToken ] = useState<string>('');
  const [ servers, setServers ] = useState<ServiceDeployment[]>([]);
  const [ uploadOptions, setUploadOptions ] = useState<{
    objectType: string;
    objectId: string;
  }>({
    objectType: 'workrequest',
    objectId: '761611117396515',
  });
  const [ uploadStatus, setUploadStatus ] = useState<any | undefined>();

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
    const id = await bridge.readNfcTag(readNfcOptions.infinity);
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

  const getApiUrl = async () => {
    const url = await bridge.getApiUrl();
    console.log('Webapp function getApiUrl: ', url);
    setApiUrl(url);
  }

  const getToken = async () => {
    const t = await bridge.getToken();
    console.log('Webapp function getToken: ', t);
    setToken(t);
  }

  const showServerUrls = async () => {
    const values = await bridge.getWorkforceUrls();
    console.log('Webapp function showServerUrls: ', values);
    if (values) {
      setServers(values);
    }
  }

  const setServerUrls = async () => {
    const values = [{
      url: 'https://delta-workforce-dev-api.dev.deltasoft365.com',
      stage: 'dev',
      serviceName: 'WorkForce Dev',
      createdAt: new Date().toISOString(),
    }, {
      url: 'http://localhost:3001',
      stage: 'local',
      serviceName: 'WorkForce',
      createdAt: new Date().toISOString(),
    }];
    await bridge.setWorkforceUrls([]);
    console.log('Webapp function setServerUrls: ', values);
  }

  const uploadFile = async () => {
    const options = {
      type: 'imageLibrary',
			editingType: 'full',
			allowsMultipleSelection: false,
			base64: false,
			mediaTypes: 'images',
			stickers: [],
    };
    const operId = await bridge.pickPhoto(options);
    localStorage.setItem('operId', operId);
    console.log('==== operId:', operId);
  }

  useEffect(() => {
    // Subscribe to events from react native.
    return () => {
      bridge.addEventListener("scanBarcodeResult", (message: any) => {
        console.log('Webapp message scanBarcodeResult: ', message);
        if (!message.canceled) {
          setBarcode(message.values);
        }
      });
      bridge.addEventListener("readNfcTagResult", (message: any) => {
        console.log('Webapp message readNfcTagResult: ', message);
        if (!message.canceled) {
          setNfcTagValue(message.values);
        }
      });
      bridge.addEventListener("pickPhotoResult", (message: any) => {
        console.log('Webapp message pickPhotoResult: ', message);
        if (!message.canceled) {
          setImage(message.assets[0]);
          const operId = localStorage.getItem('operId');
          if (message.id === operId) {
            bridge.submitUpload(uploadOptions.objectType, uploadOptions.objectId, message.assets);
          }
        }
      });
      bridge.addEventListener("editPhotoResult", (message: any) => {
        console.log('Webapp message editPhotoResult: ', message);
        if (!message.canceled) {
          setImage(message.asset);
          const operId = localStorage.getItem('operId');
          if (message.id === operId) {
            bridge.submitUpload(uploadOptions.objectType, uploadOptions.objectId, [message.asset]);
          }
        }
      });
      bridge.addEventListener('uploadResult', (message: any) => {
        console.log('Webapp message uploadResult: ', message);
        setUploadStatus(message);
      });
    };
  });
  
  return (
    <div>
      <header>
        <h3>Color Scheme</h3>
        <div>
          <button onClick={getColorScheme}>Get Color Scheme</button>
          <div>Color Scheme: {colorScheme}</div>
        </div>
        <h3>Barcode</h3>
        <div>
          <button onClick={scanBarcode}>Scan Barcode</button>
          <div>Code: {barcode}</div>
        </div>
        <h3>NFC</h3>
        <div>
          <button onClick={checkSupportNfc}>Check NFC Support</button>
          <div>Support NFC: {supportNfcFeature}</div>
        </div>
        <div>
          <label>Infinity: </label>
          <select name="infinity"
            value={`${readNfcOptions.infinity}`}
            onChange={e => setReadNfcOptions(val => {
              var infinity;
              switch (e.target.value) {
                case 'true':
                  infinity = true;
                  break;
                case 'false':
                  infinity = false;
                  break;
              }
              return {
                ...val,
                infinity,
              };
            })}
          >
            <option value="true">True</option>
            <option value="false">False</option>
            <option value="undefined">Undefined</option>
          </select>
        </div>
        <div>
          <button onClick={readNfcTag}>Read NFC Tag</button>
          <div>Tag: {nfcTagValue}</div>
        </div>
        <h3>Pick Image</h3>
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
        <h3>Pick Image</h3>
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
        <h3>API URL</h3>
        <div>
          <button onClick={getApiUrl}>Get API URL</button>
          <div>API URL: {apiUrl}</div>
        </div>
        <h3>Token</h3>
        <div>
          <button onClick={getToken}>Get Token</button>
          <div>Token: {token}</div>
        </div>
        <h3>Server URLs</h3>
        <div>
          <button onClick={showServerUrls}>Show Server URLs</button>
          <button onClick={setServerUrls}>Set Server URLs</button>
          <div>
            <div>{JSON.stringify(servers)}</div>
          </div>
        </div>
        <h3>Upload File</h3>
        <div>
          <select name="uploadObjectType"
            value={`${uploadOptions.objectType}`}
            onChange={e => setUploadOptions(val => {
              const objectType = e.target.value;
              return {
                ...val,
                objectType,
              };
            })}
          >
            <option value="proposal">Proposal</option>
            <option value="workrequest">Workrequest</option>
            <option value="invoice">Invoice</option>
          </select>
          <input name='uploadObjectId' value={`${uploadOptions.objectId}`} onChange={e => setUploadOptions(val => {
            const id = e.target.value;
            return {
              ...val,
              objectId: id,
            };
          })} />
          <button onClick={uploadFile}>Edit & Upload</button>
          <div>
            <div>{JSON.stringify(uploadOptions)}</div>
            <div>{JSON.stringify(uploadStatus)}</div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
