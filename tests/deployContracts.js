const path = require("path");
const expect = require("chai").expect;
const { getParams, getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./utils");

const testDeploy = async (deployer, gasPrice) => {
  try {
    // Compile contract code
    const { abi: stickerABI, bytecode: stickerCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTSticker.sol"),
      "FeedsNFTSticker"
    );
    expect(stickerABI, "Sticker contract ABI").to.be.an("array");
    expect(stickerCode, "Sticker contract bytecode").to.be.a("string");
    console.log("Sticker contract compiled");

    const { abi: pasarABI, bytecode: pasarCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasar.sol"),
      "FeedsNFTPasar"
    );
    expect(pasarABI, "Pasar contract ABI").to.be.an("array");
    expect(pasarCode, "Pasar contract bytecode").to.be.a("string");
    console.log("Pasar contract compiled");

    const { abi: pasarLibABI, bytecode: pasarLibCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasar.sol"),
      "FeedsNFTPasarLibrary"
    );
    expect(pasarLibABI, "Pasar library contract ABI").to.be.an("array");
    expect(pasarLibCode, "Pasar library contract bytecode").to.be.a("string");
    console.log("Pasar library contract compiled");


    const { abi: galleriaABI, bytecode: galleriaCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTGalleria.sol"),
      "FeedsNFTGalleria"
    );
    expect(galleriaABI, "Galleria contract ABI").to.be.an("array");
    expect(galleriaCode, "Galleria contract bytecode").to.be.a("string");
    console.log("Galleria contract compiled");

    const { abi: proxyABI, bytecode: proxyCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(proxyABI, "Proxy contract ABI").to.be.an("array");
    expect(proxyCode, "Proxy contract bytecode").to.be.a("string");
    console.log("Proxy contract compiled");

    // Instantiate contract objects
    const web3 = await getWeb3();
    const stickerContract = new web3.eth.Contract(stickerABI);
    const pasarContract = new web3.eth.Contract(pasarABI);
    const pasarLibContract = new web3.eth.Contract(pasarLibABI);
    const galleriaContract = new web3.eth.Contract(galleriaABI);
    const proxyContract = new web3.eth.Contract(proxyABI);

    //Prepare deployer account
    const acc = await getAccount(deployer);
    console.log("Deployer account generated");

    // Deploy the Sticker contract
    const stickerData = stickerContract.deploy({ data: stickerCode }).encodeABI();
    const stickerTx = {
      from: acc.address,
      value: 0,
      data: stickerData,
      gasPrice,
    };

    const { contractAddress: stickerAddr, status: stickerStatus } = await sendTxWaitForReceipt(stickerTx, acc);
    expect(stickerStatus, "Sticker contract deploy transaction status").to.equal(true);
    expect(stickerAddr, "Sticker contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Sticker contract deployed successfully at address ${stickerAddr}`);

    //Deploy the Pasar contract
    const pasarData = pasarContract.deploy({ data: pasarCode }).encodeABI();
    const pasarTx = {
      from: acc.address,
      value: 0,
      data: pasarData,
      gasPrice,
    };

    const { contractAddress: pasarAddr, status: pasarStatus } = await sendTxWaitForReceipt(pasarTx, acc);
    expect(pasarStatus, "Pasar contract deploy transaction status").to.equal(true);
    expect(pasarAddr, "Pasar contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Pasar contract deployed successfully at address ${pasarAddr}`);

    //Deploy the Pasar library contract
    const pasarLibData = pasarLibContract.deploy({ data: pasarLibCode }).encodeABI();
    const pasarLibTx = {
      from: acc.address,
      value: 0,
      data: pasarLibData,
      gasPrice,
    };

    const { contractAddress: pasarLibAddr, status: pasarLibStatus } = await sendTxWaitForReceipt(pasarLibTx, acc);
    expect(pasarLibStatus, "Pasar library contract deploy transaction status").to.equal(true);
    expect(pasarLibAddr, "Pasar library contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Pasar library contract deployed successfully at address ${pasarLibAddr}`);

    //Deploy the Galleria contract
    const galleriaData = galleriaContract.deploy({ data: galleriaCode }).encodeABI();
    const galleriaTx = {
      from: acc.address,
      value: 0,
      data: galleriaData,
      gasPrice,
    };

    const { contractAddress: galleriaAddr, status: galleriaStatus } = await sendTxWaitForReceipt(galleriaTx, acc);
    expect(galleriaStatus, "Galleria contract deploy transaction status").to.equal(true);
    expect(galleriaAddr, "Galleria contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Galleria contract deployed successfully at address ${galleriaAddr}`);

    //Deploy the Proxy contract for Sticker
    const proxyStickerData = proxyContract.deploy({ data: proxyCode, arguments: [stickerAddr] }).encodeABI();
    const proxyStickerTx = {
      from: acc.address,
      value: 0,
      data: proxyStickerData,
      gasPrice,
    };

    const { contractAddress: proxyStickerAddr, status: proxyStickerStatus } = await sendTxWaitForReceipt(
      proxyStickerTx,
      acc
    );
    expect(proxyStickerStatus, "Proxy Sticker contract deploy transaction status").to.equal(true);
    expect(proxyStickerAddr, "Proxy Sticker contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy Sticker contract deployed successfully at address ${proxyStickerAddr}`);

    //Deploy the Proxy contract for Pasar
    const proxyPasarData = proxyContract.deploy({ data: proxyCode, arguments: [pasarAddr] }).encodeABI();
    const proxyPasarTx = {
      from: acc.address,
      value: 0,
      data: proxyPasarData,
      gasPrice,
    };

    const { contractAddress: proxyPasarAddr, status: proxyPasarStatus } = await sendTxWaitForReceipt(
      proxyPasarTx,
      acc
    );
    expect(proxyPasarStatus, "Proxy Pasar contract deploy transaction status").to.equal(true);
    expect(proxyPasarAddr, "Proxy Pasar contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy Pasar contract deployed successfully at address ${proxyPasarAddr}`);

    //Deploy the Proxy contract for Galleria
    const proxyGalleriaData = proxyContract.deploy({ data: proxyCode, arguments: [galleriaAddr] }).encodeABI();
    const proxyGalleriaTx = {
      from: acc.address,
      value: 0,
      data: proxyGalleriaData,
      gasPrice,
    };

    const { contractAddress: proxyGalleriaAddr, status: proxyGalleriaStatus } = await sendTxWaitForReceipt(
      proxyGalleriaTx,
      acc
    );
    expect(proxyGalleriaStatus, "Proxy Galleria contract deploy transaction status").to.equal(true);
    expect(proxyGalleriaAddr, "Proxy Galleria contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy Galleria contract deployed successfully at address ${proxyGalleriaAddr}`);

    // Instantiate contract objects via proxies
    const proxiedSticker = new web3.eth.Contract(stickerABI, proxyStickerAddr);
    const proxiedPasar = new web3.eth.Contract(pasarABI, proxyPasarAddr);
    const proxiedGalleria = new web3.eth.Contract(galleriaABI, proxyGalleriaAddr);

    // Initialize proxied Sticker contract
    const initStickerData = proxiedSticker.methods.initialize().encodeABI();
    const initStickerTx = {
      from: acc.address,
      to: proxyStickerAddr,
      value: 0,
      data: initStickerData,
      gasPrice,
    };

    const { status: initStickerStatus } = await sendTxWaitForReceipt(initStickerTx, acc);
    const initedSticker = await proxiedSticker.methods.initialized().call();
    expect(initStickerStatus, "Proxied Sticker contract initialize transaction status").to.equal(true);
    expect(initedSticker, "Proxied Sticker contract initialized result").to.equal(true);
    console.log("Proxied Sticker contract initialized successfully");

    // Initialize proxied Pasar contract
    const initPasarData = proxiedPasar.methods.initialize(proxyStickerAddr).encodeABI();
    const initPasarTx = {
      from: acc.address,
      to: proxyPasarAddr,
      value: 0,
      data: initPasarData,
      gasPrice,
    };

    const { status: initPasarStatus } = await sendTxWaitForReceipt(initPasarTx, acc);
    const initedPasar = await proxiedPasar.methods.initialized().call();
    const tokenAddrPasar = await proxiedPasar.methods.getTokenAddress().call();
    expect(initPasarStatus, "Proxied Pasar contract initialize transaction status").to.equal(true);
    expect(initedPasar, "Proxied Pasar contract initialized result").to.equal(true);
    expect(tokenAddrPasar, "Proxied Pasar initialized with token address").to.equal(proxyStickerAddr);
    console.log(`Proxied Pasar contract initialized successfully with token address ${proxyStickerAddr}`);

    // Set library contract address for proxied Pasar contract
    const setLibPasarData = proxiedPasar.methods.setLibraryLogicContract(pasarLibAddr).encodeABI();
    const setLibPasarTx = {
      from: acc.address,
      to: proxyPasarAddr,
      value: 0,
      data: setLibPasarData,
      gasPrice,
    };

    const { status: setLibPasarStatus } = await sendTxWaitForReceipt(setLibPasarTx, acc);
    const libAddrPasar = await proxiedPasar.methods.getLibraryLogicContract().call();
    expect(setLibPasarStatus, "Proxied Pasar contract set library transaction status").to.equal(true);
    expect(libAddrPasar, "Proxied Pasar library logic contract address").to.equal(pasarLibAddr);
    console.log(`Proxied Pasar contract library logic set successfully with contract address ${pasarLibAddr}`);

    // Set platform fee rate
    const platformAddr = "0xF25F7A31d308ccf52b8EBCf4ee9FabdD8c8C5077";
    const platformFeeRate = "20000";
    const platformFeeData = proxiedPasar.methods.setPlatformFee(platformAddr, platformFeeRate).encodeABI();
    const platformFeeTx = {
      from: acc.address,
      to: proxyPasarAddr,
      value: 0,
      data: platformFeeData,
      gasPrice,
    };

    const { status: platformFeeStatus } = await sendTxWaitForReceipt(platformFeeTx, acc);
    const { _platformAddress, _platformFeeRate } = await proxiedPasar.methods.getPlatformFee().call();
    expect(platformFeeStatus, "Proxied Pasar set platform fee transaction status").to.equal(true);
    expect(_platformAddress, "Proxied Pasar platform address").to.equal(platformAddr);
    expect(_platformFeeRate, "Proxied Pasar platform fee rate").to.equal(platformFeeRate);
    console.log(`Proxied Pasar platform fee parameters set successfully with platform address ${_platformAddress} and fee rate ${_platformFeeRate}`);

    // Initialize proxied Galleria contract
    const minFee = "100000000000000000";
    const initGalleriaData = proxiedGalleria.methods.initialize(proxyStickerAddr, platformAddr, minFee).encodeABI();
    const initGalleriaTx = {
      from: acc.address,
      to: proxyGalleriaAddr,
      value: 0,
      data: initGalleriaData,
      gasPrice,
    };

    const { status: initGalleriaStatus } = await sendTxWaitForReceipt(initGalleriaTx, acc);
    const initedGalleria = await proxiedGalleria.methods.initialized().call();
    const tokenAddrGalleria = await proxiedGalleria.methods.getTokenAddress().call();
    const { _platformAddress: _platformAddress2, _minFee} = await proxiedGalleria.methods.getFeeParams().call();
    expect(initGalleriaStatus, "Proxied Galleria contract initialize transaction status").to.equal(true);
    expect(initedGalleria, "Proxied Galleria contract initialized result").to.equal(true);
    expect(tokenAddrGalleria, "Proxied Galleria initialized with token address").to.equal(proxyStickerAddr);
    expect(_platformAddress2, "Proxied Galleria platform address").to.equal(platformAddr);
    expect(_minFee, "Proxied Galleria minimum fee").to.equal(minFee);
    console.log(`Proxied Galleria contract initialized successfully with token address ${proxyStickerAddr}, platform address ${platformAddr} and minimum fee ${minFee}`);

    return { stickerABI, pasarABI, galleriaABI, stickerAddr, pasarAddr, galleriaAddr, proxyStickerAddr, proxyPasarAddr, proxyGalleriaAddr };
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
    const { rpcUrl, gasPrice, deployerPK } = await getParams();
    await getWeb3(rpcUrl);
    await testDeploy(deployerPK, gasPrice);
  })();
}
