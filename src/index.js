const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const myKey = ec.keyFromPrivate(
  "082105733f9059fa0ffde9c3c5b1aaeb641ac663e858eed58d9419797907266b"
);
const myWalletAddress = myKey.getPublic("hex");

let coin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "public key , goes here", 100);
tx1.signTransaction(myKey);
coin.addTransaction(tx1);

console.log(`starting the miner ....`);
coin.minePendingTransactions(myWalletAddress);

console.log(
  "balance of yevhenii address",
  coin.getBalanceOfAddress(myWalletAddress)
);
