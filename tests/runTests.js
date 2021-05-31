const { getParams, getWeb3 } = require("./utils");
const { testDeploy } = require("./deployContracts");

(async () => {
  try {
    console.log("=== Tests start ===");
    const { rpcUrl, deployerPK } = await getParams();
    console.log("=== Params loaded ===");
    console.log(`rpcUrl ${rpcUrl}`);
    console.log(`deployerPK ${deployerPK}`);
    await getWeb3(rpcUrl);
    console.log("=== Web3 initialized ===");
    console.log("=== Deploy contracts ===")
    const { proxyStickerAddr: sticker, proxyPasarAddr: pasar } = await testDeploy(deployerPK);
    console.log("=== Contracts deployed ===")
    console.log({ sticker, pasar });
    console.log("=== Tests complete ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Tests failed ===");
  }
})();
