import {
  TransactionMessage,
  PublicKey,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export async function createTokenTransferTransaction(
  from: string,
  to: string,
  tokenMint: string,
  amount: number
) {
  // Convert addresses to PublicKeys
  const fromPublicKey = new PublicKey(from);
  const toPublicKey = new PublicKey(to);
  const tokenMintPublicKey = new PublicKey(tokenMint);

  // Get associated token accounts for both addresses
  const senderTokenAccount = await getAssociatedTokenAddress(
    tokenMintPublicKey,
    fromPublicKey,
    true
  );
  const recipientTokenAccount = await getAssociatedTokenAddress(
    tokenMintPublicKey,
    toPublicKey,
    true
  );
  console.log("Sender token account:", senderTokenAccount);
  console.log("Recipient token account:", recipientTokenAccount);

  // Amount needs to be converted to base units (multiply by 10^6 for USDC)
  const amountInBaseUnits = amount * 1_000_000;

  // Create new transaction
  const instructions = [];
  const recipientAccountInfo = await connection.getAccountInfo(
    recipientTokenAccount
  );
  console.log("Recipient account info:", recipientAccountInfo);
  if (!recipientAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        fromPublicKey,
        recipientTokenAccount,
        toPublicKey,
        tokenMintPublicKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add the transfer instruction
  instructions.push(
    createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      fromPublicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const message = new TransactionMessage({
    instructions,
    recentBlockhash: "11111111111111111111111111111111",
    payerKey: new PublicKey("11111111111111111111111111111112"),
  }).compileToV0Message();

  return new VersionedTransaction(message);
}
