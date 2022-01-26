const { Command } = require("commander");
const global_config = require("./global_config");
const config = require("./update_platform_config");

const checkDeployPK = (deployPk)=>{
  try {
    if (deployPk == ''){
      return false;
    }
    return true;
  } catch (error) {
  }
}

const getParams = async () => {
  try {
    let rpcUrl = global_config.testNet.rpcUrl;
    let gasPrice = global_config.testNet.gasPrice;
    let deployPK = global_config.testNet.deployPK;
    switch(global_config.netType){
      case 'testNet':
        rpcUrl = global_config.testNet.rpcUrl;
        gasPrice = global_config.testNet.gasPrice;
        deployPK = global_config.testNet.deployPK;
        break;
      case 'mainNet':
        rpcUrl = global_config.mainNet.rpcUrl;
        gasPrice = global_config.mainNet.gasPrice;
        deployPK = global_config.mainNet.deployPK;
        break;
      case 'customNet':
        rpcUrl = global_config.customNet.rpcUrl;
        gasPrice = global_config.customNet.gasPrice;
        deployPK = global_config.customNet.deployPK;
        break;
    }

    if (!checkDeployPK(deployPK)){
      console.log('Deploy PK is null, current netType is',global_config.netType);
      return false;
    }


    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "eth smartcontract sidechain rpc url", rpcUrl)
      .option("--gasPrice <price>", "gas price", gasPrice)
      .option("--deployPK <key>", "private key of account to deploy the contracts", deployPK)
      .option("--galleriaAddr <address>", "the address of Galleria contract", config.galleriaAddr)

      .option("--newPlatformAddr <address>", "the new platform address of Galleria contract", config.newPlatformAddr)
      .option("--newMinFee <price>", "the new min fee of Galleria contract", config.newMinFee);

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
