const path = require("path");
const expect = require("chai").expect;
const { getParams, getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./utils");

const testDeploy = async (deployer, creator, seller, buyer, bidder, tokenId, gasPrice) => {
  try {
    // Compile contract code
    const { abi: stickerABI, bytecode: stickerCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTSticker.sol"),
      "FeedsNFTSticker"
    );
    expect(stickerABI, "Sticker contract ABI").to.be.an("array");
    expect(stickerCode, "Sticker contract bytecode").to.be.a("string");
    console.log("Sticker contract compiled");

    const { abi: pasarV2ABI, bytecode: pasarV2Code } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasarV2.sol"),
      "FeedsNFTPasarV2"
    );
    expect(pasarV2ABI, "PasarV2 contract ABI").to.be.an("array");
    expect(pasarV2Code, "PasarV2 contract bytecode").to.be.a("string");
    console.log("PasarV2 contract compiled");

    const { abi: pasarV2LibABI, bytecode: pasarV2LibCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasarV2.sol"),
      "FeedsNFTPasarV2Library"
    );
    expect(pasarV2LibABI, "PasarV2 library contract ABI").to.be.an("array");
    expect(pasarV2LibCode, "PasarV2 library contract bytecode").to.be.a("string");
    console.log("PasarV2 library contract compiled");

    const { abi: proxyABI, bytecode: proxyCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(proxyABI, "Proxy contract ABI").to.be.an("array");
    expect(proxyCode, "Proxy contract bytecode").to.be.a("string");
    console.log("Proxy contract compiled");

    const { abi: erc20TokenABI, bytecode: erc20TokenCode } = await compileContract(
      path.resolve(__dirname, "./ERC20Token.sol"),
      "ERC20Token"
    );
    expect(erc20TokenABI, "erc20Token contract ABI").to.be.an("array");
    expect(erc20TokenCode, "erc20Token contract bytecode").to.be.a("string");
    console.log("erc20Token contract compiled");

    // Instantiate contract objects
    const web3 = await getWeb3();
    const stickerContract = new web3.eth.Contract(stickerABI);
    const pasarV2Contract = new web3.eth.Contract(pasarV2ABI);
    const pasarV2LibContract = new web3.eth.Contract(pasarV2LibABI);
    const proxyContract = new web3.eth.Contract(proxyABI);
    const erc20TokenContract = new web3.eth.Contract(erc20TokenABI);

    // Prepare deployer account
    const accDeployer = await getAccount(deployer);
    console.log("Deployer account generated");

    // Deploy the Sticker contract
    const stickerData = stickerContract.deploy({ data: stickerCode }).encodeABI();
    const stickerTx = {
      from: accDeployer.address,
      value: 0,
      data: stickerData,
      gasPrice,
    };

    const { contractAddress: stickerAddr, status: stickerStatus } = await sendTxWaitForReceipt(
      stickerTx,
      accDeployer
    );
    expect(stickerStatus, "Sticker contract deploy transaction status").to.equal(true);
    expect(stickerAddr, "Sticker contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Sticker contract deployed successfully at address ${stickerAddr}`);

    //Deploy the PasarV2 contract
    const pasarV2Data = pasarV2Contract.deploy({ data: pasarV2Code }).encodeABI();
    const pasarV2Tx = {
      from: accDeployer.address,
      value: 0,
      data: pasarV2Data,
      gasPrice,
    };

    const { contractAddress: pasarV2Addr, status: pasarV2Status } = await sendTxWaitForReceipt(
      pasarV2Tx,
      accDeployer
    );
    expect(pasarV2Status, "PasarV2 contract deploy transaction status").to.equal(true);
    expect(pasarV2Addr, "PasarV2 contract address").to.be.a("string").with.lengthOf("42");
    console.log(`PasarV2 contract deployed successfully at address ${pasarV2Addr}`);

    //Deploy the PasarV2 library contract
    const pasarV2LibData = pasarV2LibContract.deploy({ data: pasarV2LibCode }).encodeABI();
    const pasarV2LibTx = {
      from: accDeployer.address,
      value: 0,
      data: pasarV2LibData,
      gasPrice,
    };

    const { contractAddress: pasarV2LibAddr, status: pasarV2LibStatus } = await sendTxWaitForReceipt(
      pasarV2LibTx,
      accDeployer
    );
    expect(pasarV2LibStatus, "PasarV2 library contract deploy transaction status").to.equal(true);
    expect(pasarV2LibAddr, "PasarV2 library contract address").to.be.a("string").with.lengthOf("42");
    console.log(`PasarV2 library contract deployed successfully at address ${pasarV2LibAddr}`);

    //Deploy the Proxy contract for Sticker
    const proxyStickerData = proxyContract.deploy({ data: proxyCode, arguments: [stickerAddr] }).encodeABI();
    const proxyStickerTx = {
      from: accDeployer.address,
      value: 0,
      data: proxyStickerData,
      gasPrice,
    };

    const { contractAddress: proxyStickerAddr, status: proxyStickerStatus } = await sendTxWaitForReceipt(
      proxyStickerTx,
      accDeployer
    );
    expect(proxyStickerStatus, "Proxy Sticker contract deploy transaction status").to.equal(true);
    expect(proxyStickerAddr, "Proxy Sticker contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy Sticker contract deployed successfully at address ${proxyStickerAddr}`);

    //Deploy the Proxy contract for PasarV2
    const proxyPasarV2Data = proxyContract.deploy({ data: proxyCode, arguments: [pasarV2Addr] }).encodeABI();
    const proxyPasarV2Tx = {
      from: accDeployer.address,
      value: 0,
      data: proxyPasarV2Data,
      gasPrice,
    };

    const { contractAddress: proxyPasarV2Addr, status: proxyPasarV2Status } = await sendTxWaitForReceipt(
      proxyPasarV2Tx,
      accDeployer
    );
    expect(proxyPasarV2Status, "Proxy PasarV2 contract deploy transaction status").to.equal(true);
    expect(proxyPasarV2Addr, "Proxy PasarV2 contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy PasarV2 contract deployed successfully at address ${proxyPasarV2Addr}`);

    // Instantiate contract objects via proxies
    const proxiedSticker = new web3.eth.Contract(stickerABI, proxyStickerAddr);
    const proxiedPasarV2 = new web3.eth.Contract(pasarV2ABI, proxyPasarV2Addr);

    // Initialize proxied Sticker contract
    const initStickerData = proxiedSticker.methods.initialize().encodeABI();
    const initStickerTx = {
      from: accDeployer.address,
      to: proxyStickerAddr,
      value: 0,
      data: initStickerData,
      gasPrice,
    };

    const { status: initStickerStatus } = await sendTxWaitForReceipt(initStickerTx, accDeployer);
    const initedSticker = await proxiedSticker.methods.initialized().call();
    expect(initStickerStatus, "Proxied Sticker contract initialize transaction status").to.equal(true);
    expect(initedSticker, "Proxied Sticker contract initialized result").to.equal(true);
    console.log("Proxied Sticker contract initialized successfully");

    // Initialize proxied PasarV2 contract
    const initPasarV2Data = proxiedPasarV2.methods.initialize(proxyStickerAddr).encodeABI();
    const initPasarV2Tx = {
      from: accDeployer.address,
      to: proxyPasarV2Addr,
      value: 0,
      data: initPasarV2Data,
      gasPrice,
    };

    const { status: initPasarV2Status } = await sendTxWaitForReceipt(initPasarV2Tx, accDeployer);
    const initedPasarV2 = await proxiedPasarV2.methods.initialized().call();
    const tokenAddrPasarV2 = await proxiedPasarV2.methods.getTokenAddress().call();
    expect(initPasarV2Status, "Proxied PasarV2 contract initialize transaction status").to.equal(true);
    expect(initedPasarV2, "Proxied PasarV2 contract initialized result").to.equal(true);
    expect(tokenAddrPasarV2, "Proxied PasarV2 initialized with token address").to.equal(proxyStickerAddr);
    console.log(`Proxied PasarV2 contract initialized successfully with token address ${proxyStickerAddr}`);

    // Set library contract address for proxied PasarV2 contract
    const setLibPasarV2Data = proxiedPasarV2.methods.setLibraryLogicContract(pasarV2LibAddr).encodeABI();
    const setLibPasarV2Tx = {
      from: accDeployer.address,
      to: proxyPasarV2Addr,
      value: 0,
      data: setLibPasarV2Data,
      gasPrice,
    };

    const { status: setLibPasarV2Status } = await sendTxWaitForReceipt(setLibPasarV2Tx, accDeployer);
    const libAddrPasarV2 = await proxiedPasarV2.methods.getLibraryLogicContract().call();
    expect(setLibPasarV2Status, "Proxied PasarV2 contract set library transaction status").to.equal(true);
    expect(libAddrPasarV2, "Proxied PasarV2 library logic contract address").to.equal(pasarV2LibAddr);
    console.log(`Proxied PasarV2 contract library logic set successfully with contract address ${pasarV2LibAddr}`);

    // Set platform fee rate
    const platformAddr = "0xF25F7A31d308ccf52b8EBCf4ee9FabdD8c8C5077";
    const platformFeeRate = "20000";
    const platformFeeData = proxiedPasarV2.methods.setPlatformFee(platformAddr, platformFeeRate).encodeABI();
    const platformFeeTx = {
      from: accDeployer.address,
      to: proxyPasarV2Addr,
      value: 0,
      data: platformFeeData,
      gasPrice,
    };

    const { status: platformFeeStatus } = await sendTxWaitForReceipt(platformFeeTx, accDeployer);
    const { _platformAddress, _platformFeeRate } = await proxiedPasarV2.methods.getPlatformFee().call();
    expect(platformFeeStatus, "Proxied PasarV2 set platform fee transaction status").to.equal(true);
    expect(_platformAddress, "Proxied PasarV2 platform address").to.equal(platformAddr);
    expect(_platformFeeRate, "Proxied PasarV2 platform fee rate").to.equal(platformFeeRate);
    console.log(
      `Proxied PasarV2 platform fee parameters set successfully with platform address ${_platformAddress} and fee rate ${_platformFeeRate}`
    );

    // Deploy ERC20Token contract
    const erc20TokenData = erc20TokenContract.deploy({ data: erc20TokenCode }).encodeABI();
    const erc20TokenTx = {
      from: accDeployer.address,
      value: 0,
      data: erc20TokenData,
      gasPrice,
    };

    const { contractAddress: erc20TokenAddr, status: erc20TokenStatus } = await sendTxWaitForReceipt(
      erc20TokenTx,
      accDeployer
    );
    expect(erc20TokenStatus, "erc20Token contract deploy transaction status").to.equal(true);
    expect(erc20TokenAddr, "erc20Token contract address").to.be.a("string").with.lengthOf("42");
    console.log(`erc20Token contract deployed successfully at address ${erc20TokenAddr}`);

    // Prepare test accounts
    const accCreator = await getAccount(creator);
    const accSeller = await getAccount(seller);
    const accBuyer = await getAccount(buyer);
    const accBidder = await getAccount(bidder);
    console.log("Test accounts generated");

    // Mint and distribute tokens
    const supply = "123";
    const uri = "https://github.com/elastos-trinity/feeds-nft-contract#readme";
    const royalty = "30000";
    const didUri = "https://github.com/";
    const mintData = proxiedSticker.methods.mint(tokenId, supply, uri, royalty, didUri).encodeABI();
    const mintTx = {
      from: accCreator.address,
      to: proxyStickerAddr,
      value: 0,
      data: mintData,
      gasPrice,
    };

    // Only test for transaction status as the token logic should have passed the tests already
    const { status: mintStatus } = await sendTxWaitForReceipt(mintTx, accCreator);
    expect(mintStatus, "Mint token transaction status").to.equal(true);
    console.log(`Mint token with id ${tokenId} supply ${supply} to address ${accCreator.address} successfully`);

    const transferValue = "60";
    const transferData = proxiedSticker.methods
      .safeTransferFrom(accCreator.address, accSeller.address, tokenId, transferValue)
      .encodeABI();
    const transferTx = {
      from: accCreator.address,
      to: proxyStickerAddr,
      value: 0,
      data: transferData,
      gasPrice,
    };

    const { status: transferStatus } = await sendTxWaitForReceipt(transferTx, accCreator);
    expect(transferStatus, "Transfer token transaction status").to.equal(true);
    console.log(`Token transfer from ${accCreator.address} to ${accSeller.address} successfully`);

    // Give buyer and bidder a million ERC20 tokens
    const erc20TransferValue = "1000000000000000000000000";

    const erc20ToBuyerData = erc20TokenContract.methods.transfer(accBuyer.address, erc20TransferValue).encodeABI();
    const erc20ToBuyerTx = {
      from: accDeployer.address,
      to: erc20TokenAddr,
      value: 0,
      data: erc20ToBuyerData,
      gasPrice,
    };

    // Again need not test ERC20 token logic here, just make sure the transaction succeeded
    const { status: erc20ToBuyerStatus } = await sendTxWaitForReceipt(erc20ToBuyerTx, accDeployer);
    expect(erc20ToBuyerStatus, "erc20ToBuyer transaction status").to.equal(true);
    console.log(`erc20 transfer from ${accDeployer.address} to ${accBuyer.address} successfully`);

    const erc20ToBidderData = erc20TokenContract.methods.transfer(accBidder.address, erc20TransferValue).encodeABI();
    const erc20ToBidderTx = {
      from: accDeployer.address,
      to: erc20TokenAddr,
      value: 0,
      data: erc20ToBidderData,
      gasPrice,
    };

    const { status: erc20ToBidderStatus } = await sendTxWaitForReceipt(erc20ToBidderTx, accDeployer);
    expect(erc20ToBidderStatus, "erc20ToBidder transaction status").to.equal(true);
    console.log(`erc20 transfer from ${accDeployer.address} to ${accBidder.address} successfully`);

    return {
      stickerABI,
      pasarV2ABI,
      erc20TokenABI,
      stickerAddr,
      pasarV2Addr,
      proxyStickerAddr,
      proxyPasarV2Addr,
      erc20TokenAddr,
    };
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  testDeploy,
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, deployerPK, creatorPK, sellerPK, buyerPK, bidderPK, tokenId } = await getParams();
    await getWeb3(rpcUrl);
    await testDeploy(deployerPK, creatorPK, sellerPK, buyerPK, bidderPK, tokenId, gasPrice);
  })();
}
