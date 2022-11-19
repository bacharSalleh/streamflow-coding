import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import Home from "./Home";


require('@solana/wallet-adapter-react-ui/styles.css'); 


function App() {
  const solNetwork = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter()];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Home />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
