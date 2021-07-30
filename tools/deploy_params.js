const { Command } = require("commander");
const config = require("./deploy_config");

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "eth smartcontract sidechain rpc url", config.rpcUrl)
      .option("--gasPrice <price>", "gas price", config.gasPrice)
      .option("--deployPK <key>", "private key of account to deploy the contracts", config.deployPK)
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
