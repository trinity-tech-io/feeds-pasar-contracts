const expect = require("chai").expect;
const { getParams } = require("./upgrade_params");
const { upgrader } = require("../proxyUpgrader/upgrader");

(async () => {
  try {
    console.log("=== Start to upgrade contracts.");
    const {
      ownerPK, 
      gasPrice,
      rpcUrl,
      proxiedNftAddr,
      newNftAddr,
      proxiedPasarAddr,
      newPasarAddr } = await getParams();
    
    console.log("gasPrice: ", gasPrice);
    console.log("rpcUrl:", rpcUrl);
    console.log("ProxiedNftAddr: ", proxiedNftAddr);
    console.log("newNftAddr: ", newNftAddr);
    console.log("ProxiedPasarAddr: ", proxiedPasarAddr);
    console.log("NewPasarAddr: ", newPasarAddr);
    console.log("");

    if (proxiedNftAddr && newNftAddr) {
      const result = await upgrader(ownerPK, proxiedNftAddr, newNftAddr, gasPrice, rpcUrl);
      expect(result, "Result of upgrading logic NFT contract ").to.equal(true);
      console.log("")
      console.log("Logic NFT contract successfully has been upgraded");
    } else {
      console.log("No need to upgrade for logic NFT contract");
    }

    if (proxiedPasarAddr && newPasarAddr) {
      console.log("=== upgrade logic Pasar contract");
      const result = await upgrader(ownerPK, proxiedPasarAddr, newPasarAddr, gasPrice, rpcUrl);
      expect(result, "Result of upgrading logic Pasar contract ").to.equal(true);
      console.log("Logic Pasar contract successfully has been upgraded");
    }
    else {
      console.log("No need to upgrade for logic Pasar contract");
    }

    console.log("=== Upgrade contracts finished ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Upgrade contracts failed ===");
  }
})();
