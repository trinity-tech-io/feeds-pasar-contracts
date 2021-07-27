const expect = require("chai").expect;
const { getParams } = require("./deploy_params");
const { getWeb3 } = require("./utils");
const { deployContracts } = require("./deploy_contracts");

(async () => {
  try {
    const { rpcUrl, gasPrice, deployPK } = await getParams();
    console.log(`rpcUrl  : ${rpcUrl}`);
    console.log(`gasPrice: ${gasPrice}`);
    console.log(`deployPK: ${deployPK}`);

    await getWeb3(rpcUrl);

    const {
      logicNftAddr: addr1,
      logicPasarAddr: addr2,
      proxiedNftAddr: addr3,
      proxiedPasarAddr: addr4 
    } = await deployContracts(deployPK, gasPrice);

    console.log(`Logic contract address (NFT)    : ${addr1}`)
    console.log(`Logic contract address (Pasar)  : ${addr2}`)
    console.log(`Proxied contract address (NFT)  : ${addr3}`)
    console.log(`Proxied contract address (Pasar): ${addr4}`)

    console.log("Contracts deployed successfully");
  } catch (err) {
    console.error(String(err));
    console.error("Contracts deployed failed");
  }
})();
