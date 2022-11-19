import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { BN, Cluster, CreateParams, getBN, StreamClient, StreamDirection, StreamType } from "@streamflow/stream";
import { useCallback, useMemo } from "react";

export function useStreamFlow() {
    const { publicKey, signAllTransactions, signTransaction }  = useWallet()
    
    const wallet = useMemo(() => {
        if(!publicKey) return null
        return {
            publicKey,
            signTransaction: signTransaction!,
            signAllTransactions: signAllTransactions!
        }
    },[publicKey]);

    const streamClient = useMemo(() => new StreamClient("https://api.devnet.solana.com", Cluster.Devnet, "confirmed") ,[]);

    const createStream = useCallback(
        (mintAddress: string, recipientAddress: string, streamName: string)  => {
            if (!wallet) throw "Please Connect First";
            return _createStream( streamClient, wallet, mintAddress, recipientAddress, streamName)
        },
        [wallet]
    );

    const getStreams = useCallback(
        () => {
            if (!wallet) throw "Please Connect First";
            return streamClient.get({wallet: wallet.publicKey, direction: StreamDirection.All, type: StreamType.All })
        },
        [wallet]
    );

    return {
        createStream, 
        streamClient, 
        getStreams
    };
}


async function _createStream(streamClient:StreamClient, wallet:Wallet, mintAdress: string, recipientAddress: string, streamName: string)  {

    const streamParams: CreateParams = {
        sender: wallet,
        recipient: recipientAddress, // Solana recipient address.
        mint: mintAdress, // SPL Token mint.
        start: Number((Date.now() / 1000+(10 *1000)).toFixed(0)), // Timestamp (in seconds) when the stream/token vesting starts.
        depositedAmount: getBN(1, 9), // Deposited amount of tokens (using smallest denomination).
        period: 1, // Time step (period) in seconds per which the unlocking occurs.
        cliff: Number((Date.now() / 1000+(10 *1000)).toFixed(0)), // Vesting contract "cliff" timestamp in seconds.
        cliffAmount: new BN(1), // Amount (smallest denomination) unlocked at the "cliff" timestamp.
        amountPerPeriod: getBN(1, 9), // Release rate: how many tokens are unlocked per each period.
        name: streamName, // The stream name or subject.
        canTopup: false, // setting to FALSE will effectively create a vesting contract.
        cancelableBySender: true, // Whether or not sender can cancel the stream.
        cancelableByRecipient: false, // Whether or not recipient can cancel the stream.
        transferableBySender: true, // Whether or not sender can transfer the stream.
        transferableByRecipient: false, // Whether or not recipient can transfer the stream.
        automaticWithdrawal: true, // [WIP] Whether or not a 3rd party (e.g. cron job, "cranker") can initiate a token withdraw/transfer.
        withdrawalFrequency: 10, // [WIP] Relevant when automatic withdrawal is enabled. If greater than 0 our withdrawor will take care of withdrawals. If equal to 0 our withdrawor will skip, but everyone else can initiate withdrawals.
        partner: null,
        isNative: true
    };

    return streamClient.create(streamParams);

}