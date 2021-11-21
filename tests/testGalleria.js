const assert = require("assert");
const expect = require("chai").expect;
const { getParams, getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");

const testGalleria = async (galleriaABI, galleriaAddr, stickerABI, creator, tokenId, gasPrice) => {
  try {
    // Instantiate contract objects
    const web3 = await getWeb3();
    const galleriaContract = new web3.eth.Contract(galleriaABI, galleriaAddr);
    const stickerAddr = await galleriaContract.methods.getTokenAddress().call();
    const stickerContract = new web3.eth.Contract(stickerABI, stickerAddr);

    // Prepare accounts
    const accCreator = await getAccount(creator);
    console.log("Creator account generated");

    // Test parameters
    const gasBuffer = BigInt("100000000000000000");
    const showAmount = "6";
    const showFee = "100000000000000000";
    const didUriCreator = "https://github.com/elastos-trinity/pasar-contracts";
    const platformAddr = "0xF25F7A31d308ccf52b8EBCf4ee9FabdD8c8C5077";

    // Check pre-conditions
    const creatorTokenBalance = BigInt(await stickerContract.methods.balanceOf(accCreator.address, tokenId).call());
    assert(
      creatorTokenBalance >= BigInt(showAmount),
      `Creator not enough token balance of id ${tokenId} before test`
    );
    const creatorEthBalance = BigInt(await web3.eth.getBalance(accCreator.address));
    expect(creatorEthBalance >= BigInt(showFee) + gasBuffer, "Creator not enough ETH balance before test");
    console.log("Pre-conditions checked, account has enough balances");

    // Creator approve galleria
    const approveData = stickerContract.methods.setApprovalForAll(galleriaAddr, true).encodeABI();
    const approveTx = {
      from: accCreator.address,
      to: stickerAddr,
      value: 0,
      data: approveData,
      gasPrice,
    };

    const { status: approveStatus } = await sendTxWaitForReceipt(approveTx, accCreator);
    const galleriaApproved = await stickerContract.methods.isApprovedForAll(accCreator.address, galleriaAddr).call();
    expect(approveStatus, "Approve token transaction status").to.equal(true);
    expect(galleriaApproved, "Galleria is approved by creator").to.equal(true);
    console.log(`${accCreator.address} approved ${galleriaAddr} successfully`);

    // Creator place token for show
    const creatorTokenBalanceBeforeShow = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const platformBalanceBeforeShow = BigInt(await web3.eth.getBalance(platformAddr));
    const creatorEthBalanceBeforeShow = BigInt(await web3.eth.getBalance(accCreator.address));
    const showData = galleriaContract.methods.createPanel(tokenId, showAmount, didUriCreator).encodeABI();
    const showTx = {
      from: accCreator.address,
      to: galleriaAddr,
      value: showFee,
      data: showData,
      gasPrice,
    };

    const {
      transactionHash: showTxhash,
      gasUsed: showGas,
      status: showStatus,
    } = await sendTxWaitForReceipt(showTx, accCreator);
    const { gasPrice: showGasPrice } = await web3.eth.getTransaction(showTxhash);
    const showGasFee = BigInt(showGas) * BigInt(showGasPrice);
    const creatorTokenBalanceAfterShow = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const platformBalanceAfterShow = BigInt(await web3.eth.getBalance(platformAddr));
    const creatorEthBalanceAfterShow = BigInt(await web3.eth.getBalance(accCreator.address));

    const activePanelCountAfterShow = BigInt(await galleriaContract.methods.getActivePanelCount().call());
    const lastActivePanelAfterShow = await galleriaContract.methods
      .getActivePanelByIndex(String(activePanelCountAfterShow - BigInt(1)))
      .call();
    const lastPanelId = String(lastActivePanelAfterShow.panelId);
    const creatorUriAfterShow = lastActivePanelAfterShow.didUri;
    const activePanelState = lastActivePanelAfterShow.panelState;
    
    expect(showStatus, "Create panel transaction status").to.equal(true);
    expect(
      creatorEthBalanceBeforeShow - showGasFee - creatorEthBalanceAfterShow,
      "Creator eth balance changed by creating panel"
    ).to.equal(BigInt(showFee));
    expect(
      platformBalanceAfterShow - platformBalanceBeforeShow,
      "Platform eth balance changed by panel platform fee"
    ).to.equal(BigInt(showFee));
    expect(
      creatorTokenBalanceBeforeShow - creatorTokenBalanceAfterShow,
      "Creator token balance changed by creating panel"
    ).to.equal(BigInt(showAmount));
    expect(creatorUriAfterShow, "Creator DID URI recorded in the panel").to.equal(didUriCreator);
    expect(String(activePanelState), "State of active panel").to.equal("1");
    console.log(`${accCreator.address} successfully placed token for show with panel id ${lastPanelId}`);

    // Creator remove token from galleria
    const creatorTokenBalanceBeforeRemove = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const activePanelCountBeforeRemove = BigInt(await galleriaContract.methods.getActivePanelCount().call());
    const removeData = galleriaContract.methods.removePanel(lastPanelId).encodeABI();
    const removeTx = {
      from: accCreator.address,
      to: galleriaAddr,
      value: 0,
      data: removeData,
      gasPrice,
    };

    const { status: removeStatus } = await sendTxWaitForReceipt(removeTx, accCreator);
    const creatorTokenBalanceAfterRemove = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const activePanelCountAfterRemove = BigInt(await galleriaContract.methods.getActivePanelCount().call());
    const { panelState: removePanelState } = await galleriaContract.methods.getPanelById(lastPanelId).call();
    expect(removeStatus, "Remove panel transaction status").to.equal(true);
    expect(
      creatorTokenBalanceAfterRemove - creatorTokenBalanceBeforeRemove,
      "Creator token balance changed by removing panel"
    ).to.equal(BigInt(showAmount));
    expect(
      activePanelCountBeforeRemove - activePanelCountAfterRemove,
      "Active panel count changed by removing panel"
    ).to.equal(BigInt(1));
    expect(String(removePanelState), "State of removed panel").to.equal("2");
    console.log(`${accCreator.address} successfully removed panel with id ${lastPanelId}`);

    return true;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  testGalleria,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, galleriaABI, galleriaAddr, stickerABI, creatorPK, tokenId } =
      await getParams();
    await getWeb3(rpcUrl);
    await testGalleria(galleriaABI, galleriaAddr, stickerABI, creatorPK, tokenId, gasPrice);
  })();
}
