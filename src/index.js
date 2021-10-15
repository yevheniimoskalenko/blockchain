const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data)
    ).toString();
  }
}
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }
  createGenesisBlock() {
    return new Block(0, "15/10/2021", "genesis block", "0");
  }
  getLatesBlock() {
    return this.chain[this.chain.length - 1];
  }
  addBlock(newblock) {
    newblock.previousHash = this.getLatesBlock().hash;
    newblock.hash = newblock.calculateHash();
    this.chain.push(newblock);
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
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

let coin = new Blockchain();

coin.addBlock(new Block(1, "15/10/2021", { amount: 10 }));
coin.addBlock(new Block(2, "14/10/2021", { amount: 14 }));

console.log(coin.isChainValid());

// console.log(JSON.stringify(coin, null, 4));
