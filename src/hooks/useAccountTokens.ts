import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  GetProgramAccountsFilter,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import { useEffect, useState } from "react";

interface TokenRes {
  address: string;
  name: string;
  symbol: string;
}

interface TokenListRes {
  [key: string]: any;
  tokens: TokenRes[];
}

interface UserToken {
  name: string;
  tokenAccountAddress: string;
  mintAddress: string;
  balanace: number;
}

export default function useAccountTokens() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<UserToken[]>([]);

  useEffect(() => {

    if (!publicKey) return setTokens([]);

    (async () => {
      const userTokensInfo = await getTokenAccounts(publicKey, connection);
      const tokenLisRest: TokenListRes = await fetch("https://cdn.jsdelivr.net/gh/solflare-wallet/token-list/solana-tokenlist.json").then((res) => res.json());
      const userTokens = userTokensInfo.map((tokenInfo) => {
        const meta = tokenLisRest.tokens.find((tokenMetaData) => tokenMetaData.address == tokenInfo.mintAddress);
        return {
          name: meta?.name || tokenInfo.mintAddress.slice(0,10)+"...",
          tokenAccountAddress: tokenInfo.tokenAccountAddress,
          mintAddress: tokenInfo.mintAddress,
          balanace: tokenInfo.balanace,
        };
      }).filter(token => token.balanace !== 0);

      
      setTokens(userTokens);

    })();

  }, [publicKey]);

  return {
    tokens,
  };
}

async function getTokenAccounts(pubkey: PublicKey, connection: Connection) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32,
        bytes: pubkey.toBase58(),
      },
    },
  ];

  const tokenAccounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    { filters }
  );

  return tokenAccounts.map((token) => ({
    mintAddress: String((token.account.data as ParsedAccountData)["parsed"]["info"]["mint"]),
    tokenAccountAddress: token.pubkey.toString(),
    balanace: Number((token.account.data as ParsedAccountData)["parsed"]["info"]["tokenAmount"]["uiAmount"])
  }));

}
