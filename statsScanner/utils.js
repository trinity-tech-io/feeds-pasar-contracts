const { Command } = require("commander");
const Web3 = require("web3");
const config = require("./config");
let web3;

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "Ethereum RPC Url", config.rpcUrl)
      .option("--pasarAddr <address>", "Pasar marketplace contract address", config.pasarAddr);
    program.parse();
    const options = program.opts();
    options.pasarABI = config.pasarABI;
    return options;
  } catch (err) {
    console.error(String(err));
    return;
  }
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

const scanEvents = async(conObj, evName, startBlock, endBlock) => {
  try {
    if (!evName) {
      evName = "allEvents";
    }
    if (!startBlock) {
      startBlock = "earliest";
    }
    if (!endBlock) {
      endBlock = "latest";
    }
    const events = await conObj.getPastEvents(evName, {fromBlock: startBlock, toBlock: endBlock});
    return events;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  getParams,
  getWeb3,
  scanEvents,
};
