const expect = require("chai").expect;
const { getParams, getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");

const testSticker = async (stickerABI, stickerAddr, creator, seller, tokenId, gasPrice) => {
  try {
    // Instantiate contract object
    const web3 = await getWeb3();
    const stickerContract = new web3.eth.Contract(stickerABI, stickerAddr);

    // Prepare accounts
    const accCreator = await getAccount(creator);
    const accSeller = await getAccount(seller);
    console.log("Creator and seller accounts generated");

    // Mint to creator
    const beforeMintBalance = BigInt(await stickerContract.methods.balanceOf(accCreator.address, tokenId).call());
    expect(beforeMintBalance, `Token balance of id ${tokenId} before mint`).to.equal(BigInt(0));

    const supply = "123";
    const uri = "https://github.com/elastos-trinity/feeds-nft-contract#readme";
    const royalty = "30000";
    const mintData = stickerContract.methods.mint(tokenId, supply, uri, royalty).encodeABI();
    const mintTx = {
      from: accCreator.address,
      to: stickerAddr,
      value: 0,
      data: mintData,
      gasPrice,
    };

    const { status: mintStatus } = await sendTxWaitForReceipt(mintTx, accCreator);
    const afterMintBalance = BigInt(await stickerContract.methods.balanceOf(accCreator.address, tokenId).call());
    expect(mintStatus, "Mint token transaction status").to.equal(true);
    expect(afterMintBalance, `Token balance of id ${tokenId} after mint`).to.equal(BigInt(supply));
    console.log(`Mint token with id ${tokenId} supply ${supply} to address ${accCreator.address} successfully`);

    // Transfer from creator to seller
    const beforeTransferFromBalance = afterMintBalance;
    const beforeTransferToBalance = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );

    const transferValue = "25";
    const transferData = stickerContract.methods
      .safeTransferFrom(accCreator.address, accSeller.address, tokenId, transferValue)
      .encodeABI();
    const transferTx = {
      from: accCreator.address,
      to: stickerAddr,
      value: 0,
      data: transferData,
      gasPrice,
    };

    const { status: transferStatus } = await sendTxWaitForReceipt(transferTx, accCreator);
    const afterTransferFromBalance = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const afterTransferToBalance = BigInt(await stickerContract.methods.balanceOf(accSeller.address, tokenId).call());
    expect(transferStatus, "Transfer token transaction status").to.equal(true);
    expect(
      beforeTransferFromBalance - afterTransferFromBalance,
      "Token transfer balance changed for creator"
    ).to.equal(BigInt(transferValue));
    expect(afterTransferToBalance - beforeTransferToBalance, "Token transfer balance changed for seller").to.equal(
      BigInt(transferValue)
    );
    console.log(`Token transfer from ${accCreator.address} to ${accSeller.address} successfully`);

    // Creator approve seller
    const approveData = stickerContract.methods.setApprovalForAll(accSeller.address, true).encodeABI();
    const approveTx = {
      from: accCreator.address,
      to: stickerAddr,
      value: 0,
      data: approveData,
      gasPrice,
    };

    const { status: approveStatus } = await sendTxWaitForReceipt(approveTx, accCreator);
    const sellerApproved = await stickerContract.methods
      .isApprovedForAll(accCreator.address, accSeller.address)
      .call();
    expect(approveStatus, "Approve token transaction status").to.equal(true);
    expect(sellerApproved, "Seller is approved by creator").to.equal(true);
    console.log(`${accCreator.address} approved ${accSeller.address} successfully`);

    // Approved token transfer
    const beforeApprovedTransferFromBalance = afterTransferFromBalance;
    const beforeApprovedTransferToBalance = afterTransferToBalance;

    const approvedTransferValue = "35";
    const approvedTransferData = stickerContract.methods
      .safeTransferFrom(accCreator.address, accSeller.address, tokenId, approvedTransferValue)
      .encodeABI();
    const approvedTransferTx = {
      from: accSeller.address,
      to: stickerAddr,
      value: 0,
      data: approvedTransferData,
      gasPrice,
    };

    const { status: approvedTransferStatus } = await sendTxWaitForReceipt(approvedTransferTx, accSeller);
    const afterApprovedTransferFromBalance = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    const afterApprovedTransferToBalance = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(approvedTransferStatus, "Approved transfer token transaction status").to.equal(true);
    expect(
      beforeApprovedTransferFromBalance - afterApprovedTransferFromBalance,
      "Token approved transfer balance changed for creator"
    ).to.equal(BigInt(approvedTransferValue));
    expect(
      afterApprovedTransferToBalance - beforeApprovedTransferToBalance,
      "Token approved transfer balance changed for seller"
    ).to.equal(BigInt(approvedTransferValue));
    console.log(`Token approved transfer from ${accCreator.address} to ${accSeller.address} successfully`);

    // Burn token
    const beforeBurnBalance = afterApprovedTransferFromBalance;

    const burnValue = "5";
    const burnData = stickerContract.methods.burn(tokenId, burnValue).encodeABI();
    const burnTx = {
      from: accCreator.address,
      to: stickerAddr,
      value: 0,
      data: burnData,
      gasPrice,
    };

    const { status: burnStatus } = await sendTxWaitForReceipt(burnTx, accCreator);
    const afterBurnBalance = BigInt(await stickerContract.methods.balanceOf(accCreator.address, tokenId).call());
    expect(burnStatus, "Burn token transaction status").to.equal(true);
    expect(beforeBurnBalance - afterBurnBalance, "Token burn balance change for creator").to.equal(BigInt(burnValue));
    console.log(`Token burned from ${accCreator.address} successfully`);

    // Approved burn token
    const beforeApprovedBurnBalance = afterBurnBalance;

    const approvedBurnValue = "6";
    const approvedBurnData = stickerContract.methods
      .burnFrom(accCreator.address, tokenId, approvedBurnValue)
      .encodeABI();
    const approvedBurnTx = {
      from: accSeller.address,
      to: stickerAddr,
      value: 0,
      data: approvedBurnData,
      gasPrice,
    };

    const { status: approvedBurnStatus } = await sendTxWaitForReceipt(approvedBurnTx, accSeller);
    const afterApprovedBurnBalance = BigInt(
      await stickerContract.methods.balanceOf(accCreator.address, tokenId).call()
    );
    expect(approvedBurnStatus, "Approved burn token transaction status").to.equal(true);
    expect(
      beforeApprovedBurnBalance - afterApprovedBurnBalance,
      "Token approved burn balance change for creator"
    ).to.equal(BigInt(approvedBurnValue));
    console.log(`Token approved burned from ${accCreator.address} by ${accSeller.address} successfully`);

    return true;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  testSticker,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, stickerABI, stickerAddr, creatorPK, sellerPK, tokenId } = await getParams();
    await getWeb3(rpcUrl);
    await testSticker(stickerABI, stickerAddr, creatorPK, sellerPK, tokenId, gasPrice);
  })();
}
