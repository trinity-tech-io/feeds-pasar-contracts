const { Command } = require("commander");
const config = require("./upgrade_config");

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "ELA/ETHSC RPC Url", config.rpcUrl)
      .option("--gasPrice <price>", "Manual gas price", config.gasPrice)
      .option("--ownerPK <key>", "Private key for owner account", config.ownerPK)
      .option("--proxiedNftAddr <address>", "Proxied NFT contract address", config.proxiedNftAddr)
      .option("--newNftAddr <address>", "New Nft contract address", config.newNftAddr)
      .option("--proxiedPasarAddr <address>", "Proxied Pasar contract address", config.proxiedPasarAddr)
      .option("--newPasarAddr <address>", "New Pasar contract address", config.newPasarAddr);
    program.parse();
    const options = program.opts(); 
    return options;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  getParams
};
