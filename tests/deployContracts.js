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

    // Instantiate contract objects via proxies
    const proxiedSticker = new web3.eth.Contract(stickerABI, proxyStickerAddr);
    const proxiedPasar = new web3.eth.Contract(pasarABI, proxyPasarAddr);

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

    return { stickerABI, pasarABI, stickerAddr, pasarAddr, proxyStickerAddr, proxyPasarAddr };
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
