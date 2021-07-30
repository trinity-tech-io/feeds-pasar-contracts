const { getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");
const { getParams } = require("./upgrade_params");
const { proxiableABI } = require("./upgrade_config");
const { expect } = require("chai");

const upgradeContracts = async (owner, proxyAddr, newCodeAddr, gasPrice, rpcUrl = null) => {
  try {
    const web3 = await getWeb3(rpcUrl);
    const proxyContract = new web3.eth.Contract(proxiableABI, proxyAddr);

    const accOwner = await getAccount(owner);

    const upgradeData = proxyContract.methods.updateCodeAddress(newCodeAddr).encodeABI();
    const upgradeTx = {
      from: accOwner.address,
      to: proxyAddr,
      value: 0,
      data: upgradeData,
      gasPrice,
    };

    const { status: upgradeStatus } = await sendTxWaitForReceipt(upgradeTx, accOwner);
    if (!upgradeStatus) {
      console.error(`Upgrade logic contract for proxy contract ${proxyAddr} transaction failed`);
      return false;
    }
    console.info(`Logic contract upgraded to ${newCodeAddr} for proxy contract ${proxyAddr} successfully`);
    return true;
  } catch (err) {
    console.error(String(err));
    return false;
  }
};

module.exports = {
  upgradeContracts,
};

if (require.main == module) {
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

      console.log("gasPrice       :", gasPrice);
      console.log("rpcUrl         :", rpcUrl);
      console.log("ProxiedNftAddr :", proxiedNftAddr);
      console.log("newNftAddr     :", newNftAddr);
      console.log("ProxiedPasarAddr:", proxiedPasarAddr);
      console.log("NewPasarAddr   :", newPasarAddr);
      console.log("");

      if (proxiedNftAddr && newNftAddr) {
        console.log("=== upgrade logic NFT contract");
        const result = await upgradeContracts(ownerPK, proxiedNftAddr, newNftAddr, gasPrice, rpcUrl);
        console.log(`result: ${result}`);
        expect(result, "Result of upgrading logic NFT contract ").to.equal(true);
        console.log("Logic NFT contract successfully has been upgraded");
      } else {
        console.log("No need to upgrade for logic NFT contract");
      }

      if (proxiedPasarAddr && newPasarAddr) {
        console.log("=== upgrade logic Pasar contract");
        const result = await upgradeContracts(ownerPK, proxiedPasarAddr, newPasarAddr, gasPrice, rpcUrl);
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
}
