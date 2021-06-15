const { Command } = require("commander");
const Web3 = require("web3");
const solc = require("solc");
const fs = require("fs");
const config = require("./config");
let web3;

const sleepMs = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "Ethereum RPC Url", config.rpcUrl)
      .option("--gasPrice <price>", "Manual gas price", config.gasPrice)
      .option("--deployerPK <key>", "Private key for test contract deployer account", config.deployerPK)
      .option("--creatorPK <key>", "Private key for test token creator account", config.creatorPK)
      .option("--sellerPK <key>", "Private key for Pasar test seller account", config.sellerPK)
      .option("--buyerPK <key>", "Private key for Pasar test buyer account", config.buyerPK)
      .option("--bidderPK <key>", "Private key for Pasar test bidder account", config.bidderPK)
      .option("--stickerAddr <address>", "Sticker NFT contract address", config.stickerAddr)
      .option("--pasarAddr <address>", "Pasar marketplace contract address", config.pasarAddr)
      .option("--tokenId <id>", "Test sticker ID", config.tokenId);
    program.parse();
    const options = program.opts();
    options.stickerABI = config.stickerABI;
    options.pasarABI = config.pasarABI;
    return options;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

const loadFile = async (path) => {
  return fs.readFileSync(path, "utf8");
};

const getWeb3 = async (url) => {
  try {
    if (!url && !web3) {
      console.error("Web3 not initialized");
      return;
    }
    if (url) {
      web3 = new Web3(new Web3.providers.HttpProvider(url));
      return web3;
    }
    return web3;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

const getAccount = async (privateKey) => {
  try {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    if (!privateKey.startsWith("0x")) {
      privateKey = `0x${privateKey}`;
    }
    const acc = web3.eth.accounts.privateKeyToAccount(privateKey);
    return acc;
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const compileContract = async (path, name) => {
  try {
    const content = await loadFile(path);
    const input = {
      language: "Solidity",
      sources: {
        "src.sol": {
          content,
        },
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    const abi = output.contracts["src.sol"][name].abi;
    const bytecode = output.contracts["src.sol"][name].evm.bytecode.object;
    return { abi, bytecode };
  } catch (err) {
    console.error(String(err));
    return;
  }
};

const sendTxWaitForReceipt = async (tx, acc) => {
  try {
    if (!web3) {
      console.error("Web3 not initialized");
    }
    if (!tx.gasPrice) {
      tx.gasPrice = await web3.eth.getGasPrice();
    }
    if (!tx.gas) {
      tx.gas = Math.round(parseInt(await web3.eth.estimateGas(tx)) * 1.2);
    }
    const signedTx = await acc.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  sleepMs,
  getParams,
  loadFile,
  getWeb3,
  getAccount,
  compileContract,
  sendTxWaitForReceipt,
};
