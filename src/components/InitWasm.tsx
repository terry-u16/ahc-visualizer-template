import type { FC } from 'react';
import { useState, useEffect } from 'react';
import init from '../../public/wasm/rust';
import AHCLikeVisualizer from './AHCLikeVisualizer';

const InitWasm: FC = () => {
  const [wasmInitialized, setWasmInitialized] = useState(false);

  useEffect(() => {
    const initFunc = async () => {
      await init();
      setWasmInitialized(true);
    };
    initFunc().catch((e) => {
      console.log(e);
    });
  }, []);

  return wasmInitialized ? (
    <AHCLikeVisualizer />
  ) : (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: '#4c6078',
        fontWeight: 600,
      }}
    >
      Initializing WASM...
    </div>
  );
};

export default InitWasm;
