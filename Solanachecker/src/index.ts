import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import base58 from "bs58";
import nodemailer from "nodemailer";

const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "finalized"
);

const SECRET_KEY = process.env.SOL_PRIVATE_KEY || "";
const keypair = Keypair.fromSecretKey(base58.decode(SECRET_KEY));

const transport = nodemailer.createTransport({
  host: process.env.SMTP_ENDPOINT,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail(to: string, body: string) {
  await transport.sendMail({
    from: "your-email@example.com",
    to,
    subject: "New Solana Transaction",
    text: body,
  });
}

async function checkTransactions() {
  const currentBlockhash = await connection.getRecentBlockhash();
  const signatureInfo = await connection.getConfirmedSignaturesForAddress2(
    keypair.publicKey,
    { limit: 10 }
  );

  if (signatureInfo.length > 0) {
    for (const signature of signatureInfo) {
      const transaction = await connection.getTransaction(signature.signature);
      if (transaction) {
        // Processing the transaction
        const transactionDetails = JSON.stringify(transaction);
        await sendEmail(
          "your-email@example.com",
          `New transaction detected: ${transactionDetails}`
        );
      }
    }
  }
}

setInterval(checkTransactions, 60000);
