import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Stream } from "@streamflow/stream";
import { useEffect, useState } from "react";
import useAccountTokens from "./hooks/useAccountTokens";
import { useStreamFlow } from "./hooks/useStreamFlow";

const Home = () => {
  const { tokens: userTokens } = useAccountTokens();
  const { createStream, getStreams } = useStreamFlow();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedMintTokenAddress, setSelectedMintTokenAddress] = useState('');
  const [streamName, setStreamName] = useState('');
  const [tx, setTx] = useState('');
  const [streams, setStreams] = useState<[string, Stream][]>([]);
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) return setStreams([]);

    (async () => {
      const streams = await getStreams();
      setStreams(streams)
    })();

  }, [tx, publicKey])

  const onCreateStreamClick = async () => {
    setTx('');
    setLoading(true)
    const { tx } = await createStream(selectedMintTokenAddress, recipientAddress, streamName);
    setLoading(false)
    setTx(tx);
  }



  return (
    <div className="main">
    
      <WalletMultiButton />

      <div>
        <label htmlFor="userTokens">User Tokens: </label>
        <select id="userTokens" onChange={(e) => setSelectedMintTokenAddress(e.target.value)}>
          <option value={''}>Please Select</option>
          {userTokens.map((token, i) => <option key={i} value={token.mintAddress}>{token.name} / {token.balanace}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="recipient" >Recipient Address: </label>
        <input id="recipient" type="text" onChange={(e) => setRecipientAddress(e.target.value)} />
      </div>

      <div>
        <label htmlFor="streamName" >Stream Name: </label>
        <input id="streamName" type="text" onChange={(e) => setStreamName(e.target.value)} />
      </div>

      <div>
        <button className="btn" onClick={onCreateStreamClick}>Create Stream</button>
      </div>

      <hr />

      {loading && "Please wait..."}
      {tx && <b>Stream Created: {tx}</b>}

      {!!streams.length && ( 
        <div>
          <h1>My Streams:</h1>
          <ul>
            {streams.map((stream, i) => <li key={i}>
              <b>Name:</b> {stream[1].name}  --  <b>Recipient: </b> {stream[1].recipient} -- <b>Token: </b> {stream[1].mint}
            </li>)}
          </ul>
        </div>  
      )}



    </div>
  );
};

export default Home;

