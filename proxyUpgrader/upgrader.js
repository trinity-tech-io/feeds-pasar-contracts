const { getParams, getWeb3, getAccount, sendTxWaitForReceipt } = require("./upgraderUtils");
const { proxiableABI } = require("./upgraderConfig");

const upgrader = async (owner, proxyAddr, newCodeAddr, gasPrice, rpcUrl = null) => {
  try {
    // Instantiate proxy contract object
    const web3 = await getWeb3(rpcUrl);
    const proxyContract = new web3.eth.Contract(proxiableABI, proxyAddr);

    // Prepare owner account
    const accOwner = await getAccount(owner);

    // Upgrade logic contract to new code address
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
      return;
    }
    console.info(`Logic contract upgraded to ${newCodeAddr} for proxy contract ${proxyAddr} successfully`);
    return true;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  upgrader,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, ownerPK, proxyAddr, newCodeAddr } = await getParams();
    await getWeb3(rpcUrl);
    await upgrader(ownerPK, proxyAddr, newCodeAddr, tokenId, gasPrice);
  })();
}
