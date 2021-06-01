const expect = require("chai").expect;
const { getParams, getWeb3 } = require("./utils");
const { testDeploy } = require("./deployContracts");
const { testSticker } = require("./testSticker");

(async () => {
  try {
    console.log("=== Tests start ===");
    const { rpcUrl, gasPrice, deployerPK, creatorPK, sellerPK } = await getParams();
    console.log("=== Params loaded ===");
    console.log(`rpcUrl ${rpcUrl}`);
    console.log(`gasPrice ${gasPrice}`);
    console.log(`deployerPK ${deployerPK}`);
    await getWeb3(rpcUrl);
    console.log("=== Web3 initialized ===");
    console.log("=== Deploy contracts ===");
    const {
      stickerABI,
      pasarABI,
      proxyStickerAddr: sticker,
      proxyPasarAddr: pasar,
    } = await testDeploy(deployerPK, gasPrice);
    console.log("=== Contracts deployed ===");
    const stickerResult = await testSticker(stickerABI, sticker, creatorPK, sellerPK, "42", gasPrice);
    expect(stickerResult, "Sticker token tests result").to.equal(true);
    console.log("=== Sticker token tests complete");
    console.log("=== Tests complete ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Tests failed ===");
  }
})();
