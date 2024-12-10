import React from 'react';
import { type Bridge, type BridgeStore, linkBridge } from '@webview-bridge/web';
import { ColorSchemeName, ScaledSize } from '@delta/mobile-workforce-app/src/bridge';
import './App.css';
import { SyncPayloadV2, syncPayload } from './syncPayload';

export interface BridgeState extends Bridge {
  query: (obj: any) => Promise<any>;

	getColorScheme: () => Promise<ColorSchemeName>;

	getDimensions: () => Promise<ScaledSize>;

	setSyncPayload: (payload: SyncPayloadV2) => Promise<void>;
}

type AppBridge = BridgeStore<BridgeState>;
const bridge = linkBridge<AppBridge>();

function App() {

  React.useEffect(() => {
    bridge.setSyncPayload(syncPayload);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          React Bridge Demo
        </p>
      </header>
    </div>
  );
}

export default App;
