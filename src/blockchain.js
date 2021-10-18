const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }
  signTransaction(signinKey) {
    if (signinKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets!");
    }
    const hashTx = this.calculateHash();
    const sig = signinKey.sign(hashTx, "base64");
    this.signature = sig.toDER("hex");
  }
  isValid() {
    if (this.fromAddress === null) return true;
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }
    const publickey = ec.keyFromPublic(this.fromAddress, "hex");
    return publickey.verify(this.calculateHash(), this.signature);
  }
}
class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }
  mineBlock(defficulty) {
    while (
      this.hash.substring(0, defficulty) !== Array(defficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.defficulty = 2;
    this.pendingTranactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("15/10/2021", "genesis block", "0");
  }

  getLatesBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTranactions);
    block.mineBlock(this.defficulty);
    console.log(`Block  successfull mined`);
    this.chain.push(block);
    this.pendingTranactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("transaction must include from and to address");
    }
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }
    this.pendingTranactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    for (let block of this.chain) {
      for (let trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
