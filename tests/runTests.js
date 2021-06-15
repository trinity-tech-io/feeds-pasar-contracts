const expect = require("chai").expect;
const { getParams, getWeb3 } = require("./utils");
const { testDeploy } = require("./deployContracts");
const { testSticker } = require("./testSticker");
const { testPasar } = require("./testPasar");

(async () => {
  try {
    console.log("=== Tests start ===");
    const { rpcUrl, gasPrice, deployerPK, creatorPK, sellerPK, buyerPK, bidderPK } = await getParams();
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
    const pasarResult = await testPasar(pasarABI, pasar, stickerABI, creatorPK, sellerPK, buyerPK, bidderPK, "42", gasPrice);
    expect(pasarResult, "Pasar contract tests result").to.equal(true);
    console.log("=== Pasar contract tests complete");
    console.log("=== Tests complete ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Tests failed ===");
  }
})();
