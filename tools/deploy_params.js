const { Command } = require("commander");
const config = require("./deploy_config");
const global_config = require("./global_config");

const checkParamNull = ()=>{
  try {
    if (!(config.deployNewSticker || config.deployNewPasar || config.deployNewGalleria)){
      console.log('Select at least one contract for deployment');
      return false;
    }
    return true;
  } catch (error) {
  }
}

const checkStickerParams = ()=>{
  try {
    if (!config.deployNewStickerProxy && config.originStickerProxy == ''){
      console.log('Select at least one contract for deployment');
      return false;
    }
    return true;
  } catch (error) {
  }
}

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

    if (!checkParamNull()){
      console.log('One of these config items(deployNewSticker/deployNewPasar/deployNewGalleria) must be true.');
      return false;
    };

    if (!checkStickerParams()){
      console.log('One of sticker config items(deployNewStickerProxy/originStickerProxy) must input.');
      return false;
    }

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

    // print input params
    console.log(`rpcUrl  : ${rpcUrl}`);
    console.log(`gasPrice: ${gasPrice}`);

    console.log("Deploy contracts:")
    console.log(`\tdeployNewSticker: ${config.deployNewSticker}`);
    console.log(`\tdeployNewStickerProxy: ${config.deployNewStickerProxy}`);
    console.log(`\toriginStickerProxy: ${config.originStickerProxy}`);
    console.log('\t');

    console.log(`\tdeployNewPasar: ${config.deployNewPasar}`);
    console.log(`\tdeployNewPasarProxy: ${config.deployNewPasarProxy}`);
    console.log('\t');

    console.log(`\tdeployNewGalleria: ${config.deployNewGalleria}`);
    console.log(`\tdeployNewGalleriaProxy: ${config.deployNewGalleriaProxy}`);

    console.log(`\tminFee: ${config.minFee}`);
    console.log(`\tplatformAddr: ${config.platformAddr}`);

    const program = new Command();
    program.version("1.0.0");
    program
      .option("--rpcUrl <url>", "eth smartcontract sidechain rpc url", rpcUrl)
      .option("--gasPrice <price>", "gas price", gasPrice)
      .option("--deployPK <key>", "private key of account to deploy the contracts", deployPK)
      .option("--deployNewSticker <bool>", "deploy new Sticker", config.deployNewSticker)
      .option("--deployNewStickerProxy <bool>", "deploy new sticker proxy", config.deployNewStickerProxy)
      .option("--originStickerProxy <bool>", "origin sticker proxy", config.originStickerProxy)
      .option("--deployNewPasar <address>", "deploy new pasar", config.deployNewPasar)
      .option("--deployNewPasarProxy <address>", "deploy new pasar proxy", config.deployNewPasarProxy)
      .option("--deployNewGalleria <address>", "deploy new galleria", config.deployNewGalleria)
      .option("--deployNewGalleriaProxy <address>", "deploy new galleria proxy", config.deployNewGalleriaProxy)
      .option("--platformAddr <address>", "platformAddr", config.platformAddr)
      .option("--minFee <price>", "minFee", config.minFee);
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
