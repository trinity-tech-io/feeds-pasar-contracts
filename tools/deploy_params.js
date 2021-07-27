const { Command } = require("commander");
const config = require("./deploy_config");

const getParams = async () => {
  try {
    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "ETHSC rpc url", config.rpcUrl)
      .option("--gasPrice <price>", "Manual gas price", config.gasPrice)
      .option("--deployPK <key>", "Private key for test contract deployer account", config.deployPK)
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
