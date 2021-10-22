const { Command } = require("commander");
const config = require("./activity_config");

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "eth smartcontract sidechain rpc url", config.rpcUrl)
      .option("--nftAddr <address>", "the address of NFT contract", config.nftAddr)
      .option("--pasarAddr <address>", "the address of Pasar contract", config.pasarAddr);
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
