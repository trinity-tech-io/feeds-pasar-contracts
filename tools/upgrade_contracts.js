const expect = require("chai").expect;
const { getParams, getNftContractParams, getPasarContractParams } = require("./upgrade_utils");
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
    console.log("ProxyNftAddr: ", proxiedNftAddr);
    console.log("newNftAddr: ", newNftAddr);
    console.log("ProxyPasarAddr: ", ProxixedPasarAddr);
    console.log("NewPasarAddr: ", newPasarAddr);
    console.log("");

    if (proxyNftAddr && newNftAddr) {
      console.log("=== upgrade logic NFT contract");
      const result = await upgrader(ownerPK, proxiedNftAddr, newNftAddr, gasPrice, rpcUrl);
      expect(result, "Result of upgrading logic NFT contract ").to.equal(true);
      console.log("Logic NFT contract successfully has been upgraded");
    } 
    else {
      console.log("No need to upgrade for logic NFT contract ");
    }

    if (proxyPasarAddr && newPasarAddr) {
      console.log("=== upgrade logic Pasar contract");
      const result = await upgrader(ownerPK, ProxixedPasarAddr, newPasarAddr, gasPrice, rpcUrl);
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
