const assert = require("assert");
const expect = require("chai").expect;
const { sleepMs, getParams, getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");

const testPasar = async (pasarABI, pasarAddr, stickerABI, creator, seller, buyer, bidder, tokenId, gasPrice) => {
  try {
    // Instantiate contract objects
    const web3 = await getWeb3();
    const pasarContract = new web3.eth.Contract(pasarABI, pasarAddr);
    const stickerAddr = await pasarContract.methods.getTokenAddress().call();
    const stickerContract = new web3.eth.Contract(stickerABI, stickerAddr);

    // Prepare accounts
    const accCreator = await getAccount(creator);
    const accSeller = await getAccount(seller);
    const accBuyer = await getAccount(buyer);
    const accBidder = await getAccount(bidder);
    console.log("Creator, seller, buyer and bidder accounts generated");

    // Token test parameters
    const gasBuffer = BigInt("100000000000000000");
    const saleAmount = "1";
    const salePrice = "600000000000000000";
    const auctionAmount = "3";
    const auctionPrice = "1500000000000000000";
    const bid1Price = "1500000000000000000";
    const bid2Price = "1700000000000000000";
    const orderAmount = "7";
    const orderPrice1 = "800000000000000000";
    const orderPrice2 = "1300000000000000000";

    // Check pre-conditions
    const sellerTokenBalance = BigInt(await stickerContract.methods.balanceOf(accSeller.address, tokenId).call());
    assert(
      sellerTokenBalance >= BigInt(saleAmount) + BigInt(auctionAmount) + BigInt(orderAmount),
      `Seller not enough token balance of id ${tokenId} before test`
    );
    const buyerEthBalance = BigInt(await web3.eth.getBalance(accBuyer.address));
    expect(
      buyerEthBalance >= BigInt(salePrice) + BigInt(bid1Price) + gasBuffer,
      "Buyer not enough ETH balance before test"
    );
    const bidderEthBalance = BigInt(await web3.eth.getBalance(accBidder.address));
    expect(bidderEthBalance >= BigInt(bid2Price) + gasBuffer, "Bidder not enough ETH balance before test");
    console.log("Pre-conditions checked, all accounts have enough balances");

    // Seller approve pasar
    const approveData = stickerContract.methods.setApprovalForAll(pasarAddr, true).encodeABI();
    const approveTx = {
      from: accSeller.address,
      to: stickerAddr,
      value: 0,
      data: approveData,
      gasPrice,
    };

    const { status: approveStatus } = await sendTxWaitForReceipt(approveTx, accSeller);
    const pasarApproved = await stickerContract.methods.isApprovedForAll(accSeller.address, pasarAddr).call();
    expect(approveStatus, "Approve token transaction status").to.equal(true);
    expect(pasarApproved, "Pasar is approved by seller").to.equal(true);
    console.log(`${accSeller.address} approved ${pasarAddr} successfully`);

    // Seller place token for sale
    const sellerTokenBalanceBeforeSale = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const saleData = pasarContract.methods.createOrderForSale(tokenId, saleAmount, salePrice).encodeABI();
    const saleTx = {
      from: accSeller.address,
      to: pasarAddr,
      value: 0,
      data: saleData,
      gasPrice,
    };

    const { status: saleStatus } = await sendTxWaitForReceipt(saleTx, accSeller);
    const sellerTokenBalanceAfterSale = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(saleStatus, "Sale order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceBeforeSale - sellerTokenBalanceAfterSale,
      "Seller token balance changed placing sale order"
    ).to.equal(BigInt(saleAmount));

    const openOrderCountAfterSale = BigInt(await pasarContract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterSale = await pasarContract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterSale - BigInt(1)))
      .call();
    const saleOrderId = String(lastOpenOrderAfterSale[0]);
    console.log(`${accSeller.address} successfully placed token for sale with order id ${saleOrderId}`);

    // Buyer purchase token
    const creatorEthBalanceBeforePurchase = BigInt(await web3.eth.getBalance(accCreator.address));
    const sellerEthBalanceBeforePurchase = BigInt(await web3.eth.getBalance(accSeller.address));
    const buyerEthBalanceBeforePurchase = BigInt(await web3.eth.getBalance(accBuyer.address));
    const buyerTokenBalanceBeforePurchase = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );
    const purchaseData = pasarContract.methods.buyOrder(saleOrderId).encodeABI();
    const purchaseTx = {
      from: accBuyer.address,
      to: pasarAddr,
      value: salePrice,
      data: purchaseData,
      gasPrice,
    };

    const {
      transactionHash: purchaseTxhash,
      gasUsed: purchaseGas,
      status: purchaseStatus,
    } = await sendTxWaitForReceipt(purchaseTx, accBuyer);
    const { gasPrice: purchaseGasPrice } = await web3.eth.getTransaction(purchaseTxhash);
    const purchaseFee = BigInt(purchaseGas) * BigInt(purchaseGasPrice);
    const creatorEthBalanceAfterPurchase = BigInt(await web3.eth.getBalance(accCreator.address));
    const sellerEthBalanceAfterPurchase = BigInt(await web3.eth.getBalance(accSeller.address));
    const buyerEthBalanceAfterPurchase = BigInt(await web3.eth.getBalance(accBuyer.address));
    const buyerTokenBalanceAfterPurchase = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );
    const orderAfterPurchase = await pasarContract.methods.getOrderById(saleOrderId).call();
    const filledValueAfterPurchase = BigInt(orderAfterPurchase[12]);
    const royaltyValueAfterPurchase = BigInt(orderAfterPurchase[14]);
    const sellerEarningAfterPurchase = filledValueAfterPurchase - royaltyValueAfterPurchase;
    expect(purchaseStatus, "Purchase order transaction status").to.equal(true);
    expect(
      creatorEthBalanceAfterPurchase - creatorEthBalanceBeforePurchase,
      "Creator eth balance changed by sale royalty"
    ).to.equal(royaltyValueAfterPurchase);
    expect(
      sellerEthBalanceAfterPurchase - sellerEthBalanceBeforePurchase,
      "Seller eth balance changed by sale earning"
    ).to.equal(sellerEarningAfterPurchase);
    expect(
      buyerTokenBalanceAfterPurchase - buyerTokenBalanceBeforePurchase,
      "Buyer token balance changed by purchasing token"
    ).to.equal(BigInt(saleAmount));
    expect(
      buyerEthBalanceBeforePurchase - purchaseFee - buyerEthBalanceAfterPurchase,
      "Buyer eth balance changed by purchasing token"
    ).to.equal(filledValueAfterPurchase);
    console.log(`${accBuyer.address} successfully purchased token from sale with order id ${saleOrderId}`);

    // Auction test parameters
    const currentBlock = await web3.eth.getBlock("latest");
    const auctionEndTime = String(parseInt(currentBlock.timestamp) + 120);

    // Seller place token for auction
    const sellerTokenBalanceBeforeAuction = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const auctionData = pasarContract.methods
      .createOrderForAuction(tokenId, auctionAmount, auctionPrice, auctionEndTime)
      .encodeABI();
    const auctionTx = {
      from: accSeller.address,
      to: pasarAddr,
      value: 0,
      data: auctionData,
      gasPrice,
    };

    const { status: auctionStatus } = await sendTxWaitForReceipt(auctionTx, accSeller);
    const sellerTokenBalanceAfterAuction = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(auctionStatus, "Auction order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceBeforeAuction - sellerTokenBalanceAfterAuction,
      "Seller token balance changed placing auction order"
    ).to.equal(BigInt(auctionAmount));

    const openOrderCountAfterAuction = BigInt(await pasarContract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterAuction = await pasarContract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterAuction - BigInt(1)))
      .call();
    const auctionOrderId = String(lastOpenOrderAfterAuction[0]);
    console.log(`${accSeller.address} successfully placed token for auction with order id ${auctionOrderId}`);

    // Buyer bid token
    const buyerEthBalanceBeforeBid1 = BigInt(await web3.eth.getBalance(accBuyer.address));
    const bid1Data = pasarContract.methods.bidForOrder(auctionOrderId).encodeABI();
    const bid1Tx = {
      from: accBuyer.address,
      to: pasarAddr,
      value: bid1Price,
      data: bid1Data,
      gasPrice,
    };

    const {
      transactionHash: bid1Txhash,
      gasUsed: bid1Gas,
      status: bid1Status,
    } = await sendTxWaitForReceipt(bid1Tx, accBuyer);
    const { gasPrice: bid1GasPrice } = await web3.eth.getTransaction(bid1Txhash);
    const bid1Fee = BigInt(bid1Gas) * BigInt(bid1GasPrice);
    const buyerEthBalanceAfterBid1 = BigInt(await web3.eth.getBalance(accBuyer.address));
    expect(bid1Status, "First bid transaction status").to.equal(true);
    expect(
      buyerEthBalanceBeforeBid1 - bid1Fee - buyerEthBalanceAfterBid1,
      "Buyer eth balance changed by first bid on token"
    ).to.equal(BigInt(bid1Price));
    console.log(
      `${accBuyer.address} successfully placed first bid on token for auction with order id ${auctionOrderId}`
    );

    // Bidder bid token
    const buyerEthBalanceBeforeBid2 = BigInt(await web3.eth.getBalance(accBuyer.address));
    const bidderEthBalanceBeforeBid2 = BigInt(await web3.eth.getBalance(accBidder.address));
    const bid2Data = pasarContract.methods.bidForOrder(auctionOrderId).encodeABI();
    const bid2Tx = {
      from: accBidder.address,
      to: pasarAddr,
      value: bid2Price,
      data: bid2Data,
      gasPrice,
    };

    const {
      transactionHash: bid2Txhash,
      gasUsed: bid2Gas,
      status: bid2Status,
    } = await sendTxWaitForReceipt(bid2Tx, accBidder);
    const { gasPrice: bid2GasPrice } = await web3.eth.getTransaction(bid2Txhash);
    const bid2Fee = BigInt(bid2Gas) * BigInt(bid2GasPrice);
    const buyerEthBalanceAfterBid2 = BigInt(await web3.eth.getBalance(accBuyer.address));
    const bidderEthBalanceAfterBid2 = BigInt(await web3.eth.getBalance(accBidder.address));
    expect(bid2Status, "Second bid transaction status").to.equal(true);
    expect(
      buyerEthBalanceAfterBid2 - buyerEthBalanceBeforeBid2,
      "Buyer eth balance returned by second bid on token"
    ).to.equal(BigInt(bid1Price));
    expect(
      bidderEthBalanceBeforeBid2 - bid2Fee - bidderEthBalanceAfterBid2,
      "Buyer eth balance changed by second bid on token"
    ).to.equal(BigInt(bid2Price));
    console.log(
      `${accBidder.address} successfully placed second bid on token for auction with order id ${auctionOrderId}`
    );

    // Wait for auction to end
    console.log("Wait 120s for auction to end...");
    await sleepMs(120000);
    console.log("Auction should have ended by now");

    // Settle auction (anyone can settle an ended auction, let buyer do it here)
    const creatorEthBalanceBeforeDeal = BigInt(await web3.eth.getBalance(accCreator.address));
    const sellerEthBalanceBeforeDeal = BigInt(await web3.eth.getBalance(accSeller.address));
    const bidderTokenBalanceBeforeDeal = BigInt(
      await stickerContract.methods.balanceOf(accBidder.address, tokenId).call()
    );
    const settleData = pasarContract.methods.settleAuctionOrder(auctionOrderId).encodeABI();
    const settleTx = {
      from: accBuyer.address,
      to: pasarAddr,
      value: 0,
      data: settleData,
      gasPrice,
    };

    const { status: settleStatus } = await sendTxWaitForReceipt(settleTx, accBuyer);
    const creatorEthBalanceAfterDeal = BigInt(await web3.eth.getBalance(accCreator.address));
    const sellerEthBalanceAfterDeal = BigInt(await web3.eth.getBalance(accSeller.address));
    const bidderTokenBalanceAfterDeal = BigInt(
      await stickerContract.methods.balanceOf(accBidder.address, tokenId).call()
    );
    const orderAfterDeal = await pasarContract.methods.getOrderById(auctionOrderId).call();
    const filledValueAfterDeal = BigInt(orderAfterDeal[12]);
    const royaltyValueAfterDeal = BigInt(orderAfterDeal[14]);
    const sellerEarningAfterDeal = filledValueAfterDeal - royaltyValueAfterDeal;
    expect(settleStatus, "Settle auction order transaction status").to.equal(true);
    expect(
      creatorEthBalanceAfterDeal - creatorEthBalanceBeforeDeal,
      "Creator eth balance changed by auction royalty"
    ).to.equal(royaltyValueAfterDeal);
    expect(
      sellerEthBalanceAfterDeal - sellerEthBalanceBeforeDeal,
      "Seller eth balance changed by auction earning"
    ).to.equal(sellerEarningAfterDeal);
    expect(
      bidderTokenBalanceAfterDeal - bidderTokenBalanceBeforeDeal,
      "Bidder token balance changed by winning auction token"
    ).to.equal(BigInt(auctionAmount));
    console.log(`${accBidder.address} successfully won token from auction with order id ${auctionOrderId}`);

    // Seller place test order to test change price and cancel functionalities
    const sellerTokenBalanceBeforeOrder = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const orderData = pasarContract.methods.createOrderForSale(tokenId, orderAmount, orderPrice1).encodeABI();
    const orderTx = {
      from: accSeller.address,
      to: pasarAddr,
      value: 0,
      data: orderData,
      gasPrice,
    };

    const { status: orderStatus } = await sendTxWaitForReceipt(orderTx, accSeller);
    const sellerTokenBalanceAfterOrder = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(orderStatus, "Test order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceBeforeOrder - sellerTokenBalanceAfterOrder,
      "Seller token balance changed placing test order"
    ).to.equal(BigInt(orderAmount));

    const openOrderCountAfterOrder = BigInt(await pasarContract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterOrder = await pasarContract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterOrder - BigInt(1)))
      .call();
    const testOrderId = String(lastOpenOrderAfterOrder[0]);
    console.log(`${accSeller.address} successfully placed token order for test with order id ${testOrderId}`);

    // Seller change order price
    const testOrderBeforeChange = await pasarContract.methods.getOrderById(testOrderId).call();
    const orderPriceBeforeChange = BigInt(testOrderBeforeChange[5]);
    expect(orderPriceBeforeChange, "Test order price before change").to.equal(BigInt(orderPrice1));

    const changeData = pasarContract.methods.changeOrderPrice(testOrderId, orderPrice2).encodeABI();
    const changeTx = {
      from: accSeller.address,
      to: pasarAddr,
      value: 0,
      data: changeData,
      gasPrice,
    };
    const { status: changeStatus } = await sendTxWaitForReceipt(changeTx, accSeller);
    expect(changeStatus, "Test change price transaction status").to.equal(true);
    const testOrderAfterChange = await pasarContract.methods.getOrderById(testOrderId).call();
    const orderPriceAfterChange = BigInt(testOrderAfterChange[5]);
    expect(orderPriceAfterChange, "Test order price before change").to.equal(BigInt(orderPrice2));
    console.log(`${accSeller.address} successfully changed order price with order id ${testOrderId}`);

    // Seller cancel order
    const sellerTokenBalanceBeforeCancel = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const cancelData = pasarContract.methods.cancelOrder(testOrderId).encodeABI();
    const cancelTx = {
      from: accSeller.address,
      to: pasarAddr,
      value: 0,
      data: cancelData,
      gasPrice,
    };
    const { status: cancelStatus } = await sendTxWaitForReceipt(cancelTx, accSeller);
    const sellerTokenBalanceAfterCancel = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(cancelStatus, "Test change price transaction status").to.equal(true);
    expect(
      sellerTokenBalanceAfterCancel - sellerTokenBalanceBeforeCancel,
      "Seller token balance changed canceling test order"
    ).to.equal(BigInt(orderAmount));
    const testOrderAfterCancel = await pasarContract.methods.getOrderById(testOrderId).call();
    const orderStateAfterCancel = BigInt(testOrderAfterCancel[2]);
    expect(orderStateAfterCancel, "Order state after getting canceled").to.equal(BigInt(3));
    console.log(`${accSeller.address} successfully canceled order with order id ${testOrderId}`);

    return true;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  testPasar,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, pasarABI, pasarAddr, stickerABI, creatorPK, sellerPK, buyerPK, bidderPK, tokenId } =
      await getParams();
    await getWeb3(rpcUrl);
    await testPasar(pasarABI, pasarAddr, stickerABI, creatorPK, sellerPK, buyerPK, bidderPK, tokenId, gasPrice);
  })();
}
