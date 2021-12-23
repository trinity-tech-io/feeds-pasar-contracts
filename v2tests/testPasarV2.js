const assert = require("assert");
const expect = require("chai").expect;
const { sleepMs, getParams, getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");

const testPasarV2 = async (pasarV2ABI, pasarV2Addr, stickerABI, erc20ABI, erc20Addr, creator, seller, buyer, bidder, tokenId, gasPrice) => {
  try {
    // Instantiate contract objects
    const web3 = await getWeb3();
    const pasarV2Contract = new web3.eth.Contract(pasarV2ABI, pasarV2Addr);
    const stickerAddr = await pasarV2Contract.methods.getTokenAddress().call();
    const stickerContract = new web3.eth.Contract(stickerABI, stickerAddr);
    const erc20Contract = new web3.eth.Contract(erc20ABI, erc20Addr);

    // Prepare accounts
    const accCreator = await getAccount(creator);
    const accSeller = await getAccount(seller);
    const accBuyer = await getAccount(buyer);
    const accBidder = await getAccount(bidder);
    console.log("Creator, seller, buyer and bidder accounts generated");

    // Token test parameters
    const erc20ApproveValue = "1000000000000000000000000";
    const saleAmount = "1";
    const salePrice = "600000000000000000";
    const auctionAmount = "3";
    const auctionPrice = "1500000000000000000";
    const bid1Price = "1500000000000000000";
    const bid2Price = "1700000000000000000";
    const orderAmount = "7";
    const orderPrice1 = "800000000000000000";
    const orderPrice2 = "1300000000000000000";
    const didUriSeller = "https://github.com/elastos-trinity/feeds-nft-contract";
    const didUriBuyer = "https://github.com/elastos-trinity/pasarV2-contracts";
    const platformAddr = "0xF25F7A31d308ccf52b8EBCf4ee9FabdD8c8C5077";
    const splittableAmount = "20";
    const splittablePrice = "9000000000000000000";
    const partialAmount = "12";
    const partialPrice = String((BigInt(splittablePrice) * BigInt(partialAmount)) / BigInt(splittableAmount));

    // Check pre-conditions
    const sellerTokenBalance = BigInt(await stickerContract.methods.balanceOf(accSeller.address, tokenId).call());
    assert(
      sellerTokenBalance >=
        BigInt(saleAmount) + BigInt(auctionAmount) + BigInt(orderAmount) + BigInt(splittableAmount),
      `Seller not enough token balance of id ${tokenId} before test`
    );
    const buyerERC20Balance = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    assert(
      buyerERC20Balance >= BigInt(salePrice) + BigInt(bid1Price) + BigInt(partialPrice),
      "Buyer not enough ERC20 balance before test"
    );
    const bidderERC20Balance = BigInt(await erc20Contract.methods.balanceOf(accBidder.address).call());
    assert(bidderERC20Balance >= BigInt(bid2Price), "Bidder not enough ERC20 balance before test");  
    console.log("Pre-conditions checked, all accounts have enough balances");

    // Seller approve pasarV2
    const approveData = stickerContract.methods.setApprovalForAll(pasarV2Addr, true).encodeABI();
    const approveTx = {
      from: accSeller.address,
      to: stickerAddr,
      value: 0,
      data: approveData,
      gasPrice,
    };

    const { status: approveStatus } = await sendTxWaitForReceipt(approveTx, accSeller);
    const pasarV2Approved = await stickerContract.methods.isApprovedForAll(accSeller.address, pasarV2Addr).call();
    expect(approveStatus, "Approve token transaction status").to.equal(true);
    expect(pasarV2Approved, "Pasar is approved by seller").to.equal(true);
    console.log(`${accSeller.address} approved ${pasarV2Addr} successfully`);

    // Buyer approve pasarV2
    const erc20BuyerApproveData = erc20Contract.methods.approve(pasarV2Addr, erc20ApproveValue).encodeABI();
    const erc20BuyerApproveTx = {
      from: accBuyer.address,
      to: erc20Addr,
      value: 0,
      data: erc20BuyerApproveData,
      gasPrice,
    };

    const { status: erc20BuyerApproveStatus } = await sendTxWaitForReceipt(erc20BuyerApproveTx, accBuyer);
    expect(erc20BuyerApproveStatus, "erc20BuyerApprove transaction status").to.equal(true);
    console.log(`erc20 approve from ${accBuyer.address} to ${pasarV2Addr} successfully`);

    // Bidder approve pasarV2
    const erc20BidderApproveData = erc20Contract.methods.approve(pasarV2Addr, erc20ApproveValue).encodeABI();
    const erc20BidderApproveTx = {
      from: accBidder.address,
      to: erc20Addr,
      value: 0,
      data: erc20BidderApproveData,
      gasPrice,
    };

    const { status: erc20BidderApproveStatus } = await sendTxWaitForReceipt(erc20BidderApproveTx, accBidder);
    expect(erc20BidderApproveStatus, "erc20BidderApprove transaction status").to.equal(true);
    console.log(`erc20 approve from ${accBidder.address} to ${pasarV2Addr} successfully`);

    // Seller place token for sale
    const sellerTokenBalanceBeforeSale = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const saleData = pasarV2Contract.methods
      .createOrderForSale(tokenId, saleAmount, erc20Addr, salePrice, didUriSeller)
      .encodeABI();
    const saleTx = {
      from: accSeller.address,
      to: pasarV2Addr,
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

    const openOrderCountAfterSale = BigInt(await pasarV2Contract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterSale = await pasarV2Contract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterSale - BigInt(1)))
      .call();
    const saleOrderId = String(lastOpenOrderAfterSale.orderId);
    console.log(`${accSeller.address} successfully placed token for sale with order id ${saleOrderId}`);

    // Buyer purchase token
    const platformBalanceBeforePurchase = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceBeforePurchase = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceBeforePurchase = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const buyerERC20BalanceBeforePurchase = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const buyerTokenBalanceBeforePurchase = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );
    const purchaseData = pasarV2Contract.methods.buyOrder(saleOrderId, didUriBuyer).encodeABI();
    const purchaseTx = {
      from: accBuyer.address,
      to: pasarV2Addr,
      value: 0,
      data: purchaseData,
      gasPrice,
    };

    const {
      status: purchaseStatus
    } = await sendTxWaitForReceipt(purchaseTx, accBuyer);
    const platformBalanceAfterPurchase = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceAfterPurchase = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceAfterPurchase = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const buyerERC20BalanceAfterPurchase = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const buyerTokenBalanceAfterPurchase = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );
    const orderAfterPurchase = await pasarV2Contract.methods.getOrderById(saleOrderId).call();
    const filledValueAfterPurchase = BigInt(orderAfterPurchase.filled);
    const royaltyValueAfterPurchase = BigInt(orderAfterPurchase.royaltyFee);

    // Get extra order info
    const orderExtraAfterPurchase = await pasarV2Contract.methods.getOrderExtraById(saleOrderId).call();
    const platformFeeAfterPurchase = BigInt(orderExtraAfterPurchase.platformFee);
    const sellerUriAfterPurchase = orderExtraAfterPurchase.sellerUri;
    const buyerUriAfterPurchase = orderExtraAfterPurchase.buyerUri;

    const sellerEarningAfterPurchase =
      filledValueAfterPurchase - royaltyValueAfterPurchase - platformFeeAfterPurchase;
    expect(purchaseStatus, "Purchase order transaction status").to.equal(true);
    expect(
      creatorERC20BalanceAfterPurchase - creatorERC20BalanceBeforePurchase,
      "Creator erc20 balance changed by sale royalty"
    ).to.equal(royaltyValueAfterPurchase);
    expect(
      platformBalanceAfterPurchase - platformBalanceBeforePurchase,
      "Platform erc20 balance changed by sale platform fee"
    ).to.equal(platformFeeAfterPurchase);
    expect(
      sellerERC20BalanceAfterPurchase - sellerERC20BalanceBeforePurchase,
      "Seller erc20 balance changed by sale earning"
    ).to.equal(sellerEarningAfterPurchase);
    expect(
      buyerTokenBalanceAfterPurchase - buyerTokenBalanceBeforePurchase,
      "Buyer token balance changed by purchasing token"
    ).to.equal(BigInt(saleAmount));
    expect(
      buyerERC20BalanceBeforePurchase - buyerERC20BalanceAfterPurchase,
      "Buyer erc20 balance changed by purchasing token"
    ).to.equal(filledValueAfterPurchase);
    expect(sellerUriAfterPurchase, "Seller DID URI recorded in the order").to.equal(didUriSeller);
    expect(buyerUriAfterPurchase, "Buyer DID URI recorded in the order").to.equal(didUriBuyer);
    console.log(`${accBuyer.address} successfully purchased token from sale with order id ${saleOrderId}`);

    // Auction test parameters
    const currentBlock = await web3.eth.getBlock("latest");
    const auctionEndTime = String(parseInt(currentBlock.timestamp) + 120);

    // Seller place token for auction
    const sellerTokenBalanceBeforeAuction = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const auctionData = pasarV2Contract.methods
      .createOrderForAuction(tokenId, auctionAmount, erc20Addr, auctionPrice, auctionEndTime, didUriSeller)
      .encodeABI();
    const auctionTx = {
      from: accSeller.address,
      to: pasarV2Addr,
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

    const openOrderCountAfterAuction = BigInt(await pasarV2Contract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterAuction = await pasarV2Contract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterAuction - BigInt(1)))
      .call();
    const auctionOrderId = String(lastOpenOrderAfterAuction.orderId);
    console.log(`${accSeller.address} successfully placed token for auction with order id ${auctionOrderId}`);

    // Buyer bid token
    const buyerERC20BalanceBeforeBid1 = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const bid1Data = pasarV2Contract.methods.bidForOrder(auctionOrderId, bid1Price, didUriBuyer).encodeABI();
    const bid1Tx = {
      from: accBuyer.address,
      to: pasarV2Addr,
      value: 0,
      data: bid1Data,
      gasPrice,
    };

    const {
      status: bid1Status
    } = await sendTxWaitForReceipt(bid1Tx, accBuyer);
    const buyerERC20BalanceAfterBid1 = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    expect(bid1Status, "First bid transaction status").to.equal(true);
    expect(
      buyerERC20BalanceBeforeBid1 - buyerERC20BalanceAfterBid1,
      "Buyer erc20 balance changed by first bid on token"
    ).to.equal(BigInt(bid1Price));
    console.log(
      `${accBuyer.address} successfully placed first bid on token for auction with order id ${auctionOrderId}`
    );

    // Bidder bid token
    const buyerERC20BalanceBeforeBid2 = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const bidderERC20BalanceBeforeBid2 = BigInt(await erc20Contract.methods.balanceOf(accBidder.address).call());
    const bid2Data = pasarV2Contract.methods.bidForOrder(auctionOrderId, bid2Price, didUriBuyer).encodeABI();
    const bid2Tx = {
      from: accBidder.address,
      to: pasarV2Addr,
      value: 0,
      data: bid2Data,
      gasPrice,
    };

    const {
      status: bid2Status
    } = await sendTxWaitForReceipt(bid2Tx, accBidder);
    const buyerERC20BalanceAfterBid2 = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const bidderERC20BalanceAfterBid2 = BigInt(await erc20Contract.methods.balanceOf(accBidder.address).call());
    expect(bid2Status, "Second bid transaction status").to.equal(true);
    expect(
      buyerERC20BalanceAfterBid2 - buyerERC20BalanceBeforeBid2,
      "Buyer erc20 balance returned by second bid on token"
    ).to.equal(BigInt(bid1Price));
    expect(
      bidderERC20BalanceBeforeBid2 - bidderERC20BalanceAfterBid2,
      "Buyer erc20 balance changed by second bid on token"
    ).to.equal(BigInt(bid2Price));
    console.log(
      `${accBidder.address} successfully placed second bid on token for auction with order id ${auctionOrderId}`
    );

    // Wait for auction to end
    console.log("Wait 150s for auction to end...");
    await sleepMs(150000);
    console.log("Auction should have ended by now");

    // Settle auction (anyone can settle an ended auction, let buyer do it here)
    const platformBalanceBeforeDeal = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceBeforeDeal = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceBeforeDeal = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const bidderTokenBalanceBeforeDeal = BigInt(
      await stickerContract.methods.balanceOf(accBidder.address, tokenId).call()
    );
    const settleData = pasarV2Contract.methods.settleAuctionOrder(auctionOrderId).encodeABI();
    const settleTx = {
      from: accBuyer.address,
      to: pasarV2Addr,
      value: 0,
      data: settleData,
      gasPrice,
    };

    const { status: settleStatus } = await sendTxWaitForReceipt(settleTx, accBuyer);
    const platformBalanceAfterDeal = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceAfterDeal = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceAfterDeal = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const bidderTokenBalanceAfterDeal = BigInt(
      await stickerContract.methods.balanceOf(accBidder.address, tokenId).call()
    );
    const orderAfterDeal = await pasarV2Contract.methods.getOrderById(auctionOrderId).call();
    const filledValueAfterDeal = BigInt(orderAfterDeal.filled);
    const royaltyValueAfterDeal = BigInt(orderAfterDeal.royaltyFee);

    // Get extra order info
    const orderExtraAfterDeal = await pasarV2Contract.methods.getOrderExtraById(auctionOrderId).call();
    const platformFeeAfterDeal = BigInt(orderExtraAfterDeal.platformFee);
    const sellerUriAfterDeal = orderExtraAfterDeal.sellerUri;
    const buyerUriAfterDeal = orderExtraAfterDeal.buyerUri;

    const sellerEarningAfterDeal = filledValueAfterDeal - royaltyValueAfterDeal - platformFeeAfterDeal;
    expect(settleStatus, "Settle auction order transaction status").to.equal(true);
    expect(
      creatorERC20BalanceAfterDeal - creatorERC20BalanceBeforeDeal,
      "Creator erc20 balance changed by auction royalty"
    ).to.equal(royaltyValueAfterDeal);
    expect(
      platformBalanceAfterDeal - platformBalanceBeforeDeal,
      "Platform erc20 balance changed by auction platform fee"
    ).to.equal(platformFeeAfterDeal);
    expect(
      sellerERC20BalanceAfterDeal - sellerERC20BalanceBeforeDeal,
      "Seller erc20 balance changed by auction earning"
    ).to.equal(sellerEarningAfterDeal);
    expect(
      bidderTokenBalanceAfterDeal - bidderTokenBalanceBeforeDeal,
      "Bidder token balance changed by winning auction token"
    ).to.equal(BigInt(auctionAmount));
    expect(sellerUriAfterDeal, "Seller DID URI recorded in the order").to.equal(didUriSeller);
    expect(buyerUriAfterDeal, "Buyer DID URI recorded in the order").to.equal(didUriBuyer);
    console.log(`${accBidder.address} successfully won token from auction with order id ${auctionOrderId}`);

    // Seller place test order to test change price and cancel functionalities
    const sellerTokenBalanceBeforeOrder = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const orderData = pasarV2Contract.methods
      .createOrderForSale(tokenId, orderAmount, erc20Addr, orderPrice1, didUriSeller)
      .encodeABI();
    const orderTx = {
      from: accSeller.address,
      to: pasarV2Addr,
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

    const openOrderCountAfterOrder = BigInt(await pasarV2Contract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterOrder = await pasarV2Contract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterOrder - BigInt(1)))
      .call();
    const testOrderId = String(lastOpenOrderAfterOrder.orderId);
    console.log(`${accSeller.address} successfully placed token order for test with order id ${testOrderId}`);

    // Seller change order price
    const testOrderBeforeChange = await pasarV2Contract.methods.getOrderById(testOrderId).call();
    const orderPriceBeforeChange = BigInt(testOrderBeforeChange.price);
    expect(orderPriceBeforeChange, "Test order price before change").to.equal(BigInt(orderPrice1));

    const changeData = pasarV2Contract.methods.changeOrderPrice(testOrderId, orderPrice2).encodeABI();
    const changeTx = {
      from: accSeller.address,
      to: pasarV2Addr,
      value: 0,
      data: changeData,
      gasPrice,
    };
    const { status: changeStatus } = await sendTxWaitForReceipt(changeTx, accSeller);
    expect(changeStatus, "Test change price transaction status").to.equal(true);
    const testOrderAfterChange = await pasarV2Contract.methods.getOrderById(testOrderId).call();
    const orderPriceAfterChange = BigInt(testOrderAfterChange.price);
    expect(orderPriceAfterChange, "Test order price before change").to.equal(BigInt(orderPrice2));
    console.log(`${accSeller.address} successfully changed order price with order id ${testOrderId}`);

    // Seller cancel order
    const sellerTokenBalanceBeforeCancel = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const cancelData = pasarV2Contract.methods.cancelOrder(testOrderId).encodeABI();
    const cancelTx = {
      from: accSeller.address,
      to: pasarV2Addr,
      value: 0,
      data: cancelData,
      gasPrice,
    };
    const { status: cancelStatus } = await sendTxWaitForReceipt(cancelTx, accSeller);
    const sellerTokenBalanceAfterCancel = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(cancelStatus, "Test cancel order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceAfterCancel - sellerTokenBalanceBeforeCancel,
      "Seller token balance changed canceling test order"
    ).to.equal(BigInt(orderAmount));
    const testOrderAfterCancel = await pasarV2Contract.methods.getOrderById(testOrderId).call();
    const orderStateAfterCancel = BigInt(testOrderAfterCancel.orderState);
    expect(orderStateAfterCancel, "Order state after getting canceled").to.equal(BigInt(3));
    console.log(`${accSeller.address} successfully canceled order with order id ${testOrderId}`);

    // Seller place splittable order
    const sellerTokenBalanceBeforeSplittable = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const splittableData = pasarV2Contract.methods
      .createSplittableOrder(tokenId, splittableAmount, erc20Addr, splittablePrice, didUriSeller)
      .encodeABI();
    const splittableTx = {
      from: accSeller.address,
      to: pasarV2Addr,
      value: 0,
      data: splittableData,
      gasPrice,
    };

    const { status: splittableStatus } = await sendTxWaitForReceipt(splittableTx, accSeller);
    const sellerTokenBalanceAfterSplittable = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    expect(splittableStatus, "Splittable order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceBeforeSplittable - sellerTokenBalanceAfterSplittable,
      "Seller token balance changed placing splittable order"
    ).to.equal(BigInt(splittableAmount));

    const openOrderCountAfterSplittable = BigInt(await pasarV2Contract.methods.getOpenOrderCount().call());
    const lastOpenOrderAfterSplittable = await pasarV2Contract.methods
      .getOpenOrderByIndex(String(openOrderCountAfterSplittable - BigInt(1)))
      .call();
    const splittableOrderId = String(lastOpenOrderAfterSplittable.orderId);
    console.log(`${accSeller.address} successfully placed splittable order with order id ${splittableOrderId}`);

    // Buyer purchase partial order
    const platformBalanceBeforePartial = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceBeforePartial = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceBeforePartial = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const buyerERC20BalanceBeforePartial = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const buyerTokenBalanceBeforePartial = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );
    const partialData = pasarV2Contract.methods.buySplittableOrder(splittableOrderId, partialAmount, didUriBuyer).encodeABI();
    const partialTx = {
      from: accBuyer.address,
      to: pasarV2Addr,
      value: 0,
      data: partialData,
      gasPrice,
    };

    const {
      status: partialStatus
    } = await sendTxWaitForReceipt(partialTx, accBuyer);
    const platformBalanceAfterPartial = BigInt(await erc20Contract.methods.balanceOf(platformAddr).call());
    const creatorERC20BalanceAfterPartial = BigInt(await erc20Contract.methods.balanceOf(accCreator.address).call());
    const sellerERC20BalanceAfterPartial = BigInt(await erc20Contract.methods.balanceOf(accSeller.address).call());
    const buyerERC20BalanceAfterPartial = BigInt(await erc20Contract.methods.balanceOf(accBuyer.address).call());
    const buyerTokenBalanceAfterPartial = BigInt(
      await stickerContract.methods.balanceOf(accBuyer.address, tokenId).call()
    );

    const orderExtraAfterPartial = await pasarV2Contract.methods.getOrderExtraById(splittableOrderId).call();
    const partialFillInfoAfterPartial = orderExtraAfterPartial.partialFills.slice(-1)[0];
    const filledValueAfterPartial = BigInt(partialFillInfoAfterPartial.value);
    const filledAmountAfterPartial = BigInt(partialFillInfoAfterPartial.amount);
    const royaltyValueAfterPartial = BigInt(partialFillInfoAfterPartial.royaltyFee);
    const platformFeeAfterPartial = BigInt(partialFillInfoAfterPartial.platformFee);
    const buyerUriAfterPartial = partialFillInfoAfterPartial.buyerUri;
    const priceLeftAfterPartial = BigInt(orderExtraAfterPartial.priceLeft);
    const amountLeftAfterPartial = BigInt(orderExtraAfterPartial.amountLeft);

    const sellerEarningAfterPartial = filledValueAfterPartial - royaltyValueAfterPartial - platformFeeAfterPartial;
    expect(partialStatus, "Partial purchase order transaction status").to.equal(true);
    expect(
      creatorERC20BalanceAfterPartial - creatorERC20BalanceBeforePartial,
      "Creator erc20 balance changed by partial order royalty"
    ).to.equal(royaltyValueAfterPartial);
    expect(
      platformBalanceAfterPartial - platformBalanceBeforePartial,
      "Platform erc20 balance changed by partial order platform fee"
    ).to.equal(platformFeeAfterPartial);
    expect(
      sellerERC20BalanceAfterPartial - sellerERC20BalanceBeforePartial,
      "Seller erc20 balance changed by partial order earning"
    ).to.equal(sellerEarningAfterPartial);
    expect(
      buyerTokenBalanceAfterPartial - buyerTokenBalanceBeforePartial,
      "Buyer token balance changed by partial purchase order"
    ).to.equal(filledAmountAfterPartial);
    expect(
      buyerERC20BalanceBeforePartial - buyerERC20BalanceAfterPartial,
      "Buyer erc20 balance changed by partial purchase order"
    ).to.equal(filledValueAfterPartial);
    expect(
      BigInt(splittablePrice) - filledValueAfterPartial,
      "Order price left after partial purchase order"
    ).to.equal(priceLeftAfterPartial);
    expect(
      BigInt(splittableAmount) - filledAmountAfterPartial,
      "Order amount left after partial purchase order"
    ).to.equal(amountLeftAfterPartial);
    expect(buyerUriAfterPartial, "Buyer DID URI recorded in the partial order").to.equal(didUriBuyer);
    console.log(`${accBuyer.address} successfully purchased partial order with order id ${splittableOrderId}`);

    // Seller cancel splittable order
    const sellerTokenBalanceBeforeCancel2 = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );
    const cancel2Data = pasarV2Contract.methods.cancelOrder(splittableOrderId).encodeABI();
    const cancel2Tx = {
      from: accSeller.address,
      to: pasarV2Addr,
      value: 0,
      data: cancel2Data,
      gasPrice,
    };
    const { status: cancel2Status } = await sendTxWaitForReceipt(cancel2Tx, accSeller);
    const sellerTokenBalanceAfterCancel2 = BigInt(
      await stickerContract.methods.balanceOf(accSeller.address, tokenId).call()
    );

    const orderInfoAfterCancel2 = await pasarV2Contract.methods.getOrderById(splittableOrderId).call();
    const orderStateAfterCancel2 = BigInt(orderInfoAfterCancel2.orderState);
    const orderExtraAfterCancel2 = await pasarV2Contract.methods.getOrderExtraById(splittableOrderId).call();
    const amountLeftAfterCancel2 = BigInt(orderExtraAfterCancel2.amountLeft);

    expect(cancel2Status, "Cancel splittable order transaction status").to.equal(true);
    expect(
      sellerTokenBalanceAfterCancel2 - sellerTokenBalanceBeforeCancel2,
      "Seller token balance changed canceling splittable order"
    ).to.equal(amountLeftAfterCancel2);
    expect(orderStateAfterCancel2, "Splittable order state after getting canceled").to.equal(BigInt(3));
    console.log(`${accSeller.address} successfully canceled splittable order with order id ${splittableOrderId}`);

    return true;
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  testPasarV2,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, pasarV2ABI, pasarV2Addr, stickerABI, erc20ABI, erc20Addr, creatorPK, sellerPK, buyerPK, bidderPK, tokenId } =
      await getParams();
    await getWeb3(rpcUrl);
    await testPasarV2(pasarV2ABI, pasarV2Addr, stickerABI, erc20ABI, erc20Addr, creatorPK, sellerPK, buyerPK, bidderPK, tokenId, gasPrice);
  })();
}
