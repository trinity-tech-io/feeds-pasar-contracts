const expect = require("chai").expect;
const { getParams, getWeb3 } = require("./utils");
const { testDeploy } = require("./deployContracts");
const { testPasarV2 } = require("./testPasarV2");

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
      pasarV2ABI,
      erc20TokenABI,
      proxyStickerAddr: sticker,
      proxyPasarV2Addr: pasarV2,
      erc20TokenAddr: erc20Token,
    } = await testDeploy(deployerPK, creatorPK, sellerPK, buyerPK, bidderPK, "42", gasPrice);
    console.log("=== Contracts deployed ===");
    const pasarV2Result = await testPasarV2(pasarV2ABI, pasarV2, stickerABI, erc20TokenABI, erc20Token, creatorPK, sellerPK, buyerPK, bidderPK, "42", gasPrice);
    expect(pasarV2Result, "PasarV2 contract tests result").to.equal(true);
    console.log("=== PasarV2 contract tests complete");
    console.log("=== Tests complete ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Tests failed ===");
  }
})();
