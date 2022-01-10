const expect = require("chai").expect;
const { getParams, getWeb3 } = require("./utils");
const { testDeploy } = require("./deployContracts");
const { testSticker } = require("./testSticker");
const { testPasar } = require("./testPasar");
const { testGalleria } = require("./testGalleria");

(async () => {
  try {
    console.log("=== Tests start ===");
    const { rpcUrl, gasPrice, deployerPK, creatorPK, sellerPK, buyerPK, bidderPK } = await getParams();
    console.log("=== Params loaded ===");
    await getWeb3(rpcUrl);
    console.log("=== Web3 initialized ===");
    console.log("=== Deploy contracts ===");
    const {
      stickerABI,
      pasarABI,
      galleriaABI,
      proxyStickerAddr: sticker,
      proxyPasarAddr: pasar,
      proxyGalleriaAddr: galleria,
    } = await testDeploy(deployerPK, gasPrice);
    console.log("=== Contracts deployed ===");
    const stickerResult = await testSticker(stickerABI, sticker, creatorPK, sellerPK, "42", gasPrice);
    expect(stickerResult, "Sticker token tests result").to.equal(true);
    console.log("=== Sticker token tests complete");
    const galleriaResult = await testGalleria(galleriaABI, galleria, stickerABI, creatorPK, "42", gasPrice);
    expect(galleriaResult, "Galleria contract tests result").to.equal(true);
    console.log("=== Galleria contract tests complete");
    const pasarResult = await testPasar(pasarABI, pasar, stickerABI, creatorPK, sellerPK, buyerPK, bidderPK, "42", gasPrice);
    expect(pasarResult, "Pasar contract tests result").to.equal(true);
    console.log("=== Pasar contract tests complete");
    console.log("=== Tests complete ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Tests failed ===");
  }
})();
