const path = require("path");
const expect = require("chai").expect;
const { getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./utils");
const { getParams } = require("./deploy_params");

const deployContracts = async (deployPK, gasPrice) => {
  try {
    const { abi: nftABI, bytecode: nftCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTSticker.sol"),
      "FeedsNFTSticker"
    );
    expect(nftABI, "NFT contract ABI").to.be.an("array");
    expect(nftCode, "NFT contract bytecode").to.be.a("string");
    console.log("Compiled: Logic contract (NFT)");

    const { abi: pasarABI, bytecode: pasarCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasar.sol"),
      "FeedsNFTPasar"
    );
    expect(pasarABI, "Pasar contract ABI").to.be.an("array");
    expect(pasarCode, "Pasar contract bytecode").to.be.a("string");
    console.log("Compiled: Logic contract (Pasar)");

    const { abi: proxyABI, bytecode: proxyCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(proxyABI, "Proxy contract ABI").to.be.an("array");
    expect(proxyCode, "Proxy contract bytecode").to.be.a("string");
    console.log("Compiled: Proxy contract");

    const web3 = await getWeb3();

    const nftContract   = new web3.eth.Contract(nftABI);
    const pasarContract = new web3.eth.Contract(pasarABI);
    const proxyContract = new web3.eth.Contract(proxyABI);

    const ownerAccount = await getAccount(deployPK);

    // to deploy nft logic contract.
    const nftData = nftContract.deploy({ data: nftCode }).encodeABI();
    const nftTx = {
      from: ownerAccount.address,
      value: 0,
      data: nftData,
      gasPrice,
    };

    const { contractAddress: nftAddr, status: nftStatus } = await sendTxWaitForReceipt(nftTx, ownerAccount);
    expect(nftStatus, "NFT contract deploy transaction status").to.equal(true);
    expect(nftAddr, "NFT contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Deployed: logic NFT contract at address ${nftAddr}`);

    // to deploy pasar logic contract
    const pasarData = pasarContract.deploy({ data: pasarCode }).encodeABI();
    const pasarTx = {
      from: ownerAccount.address,
      value: 0,
      data: pasarData,
      gasPrice,
    };

    const { contractAddress: pasarAddr, status: pasarStatus } = await sendTxWaitForReceipt(pasarTx, ownerAccount);
    expect(pasarStatus, "Pasar contract deploy transaction status").to.equal(true);
    expect(pasarAddr, "Pasar contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Deployed: logic Pasar contract at address ${pasarAddr}`);

    // to deploy proxied contract for NFT logic contract.
    const proxiedNftData = proxyContract.deploy({ data: proxyCode, arguments: [nftAddr] }).encodeABI();
    const proxiedNftTx = {
      from: ownerAccount.address,
      value: 0,
      data: proxiedNftData,
      gasPrice,
    };

    const { contractAddress: proxiedNftAddr, status: proxiedNftStatus} = await sendTxWaitForReceipt(
      proxiedNftTx,
      ownerAccount
    );
    expect(proxiedNftStatus, "Proxy NFT contract deploy transaction status").to.equal(true);
    expect(proxiedNftAddr, "Proxy NFT contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Deployed: proxied NFT contract at address ${proxiedNftAddr}`);

    // to deploy proxied Pasar contract for Pasar logic contract
    const proxiedPasarData = proxyContract.deploy({ data: proxyCode, arguments: [pasarAddr] }).encodeABI();
    const proxiedPasarTx = {
      from: ownerAccount.address,
      value: 0,
      data: proxiedPasarData,
      gasPrice,
    };

    const { contractAddress: proxiedPasarAddr, status: proxiedPasarStatus } = await sendTxWaitForReceipt(
      proxiedPasarTx,
      ownerAccount
    );
    expect(proxiedPasarStatus, "Proxy Pasar contract deploy transaction status").to.equal(true);
    expect(proxiedPasarAddr, "Proxy Pasar contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Deployed: proxied Pasar contract at address: ${proxiedPasarAddr}`);

    const proxiedNft = new web3.eth.Contract(nftABI, proxiedNftAddr);
    const proxiedPasar = new web3.eth.Contract(pasarABI, proxiedPasarAddr);

    // to initalize proxied NFT contract
    const initedNftData = proxiedNft.methods.initialize().encodeABI();
    const initedNftTx = {
      from: ownerAccount.address,
      to: proxiedNftAddr,
      value: 0,
      data: initedNftData,
      gasPrice,
    };

    const { status: initedNftStatus } = await sendTxWaitForReceipt(initedNftTx, ownerAccount);
    const initedNft = await proxiedNft.methods.initialized().call();
    expect(initedNftStatus, "Proxied Nft contract initialize transaction status").to.equal(true);
    expect(initedNft, "Proxied Nft contract initialized result").to.equal(true);
    console.log('Initialized: proxied NFT contract')

    // to initialize proxied Pasar contract
    const initedPasarData = proxiedPasar.methods.initialize(proxiedNftAddr).encodeABI();
    const initedPasarTx = {
      from: ownerAccount.address,
      to: proxiedPasarAddr,
      value: 0,
      data: initedPasarData,
      gasPrice,
    };

    const { status: initedPasarStatus } = await sendTxWaitForReceipt(initedPasarTx, ownerAccount);
    const initedPasar = await proxiedPasar.methods.initialized().call();
    const tokenAddrPasar = await proxiedPasar.methods.getTokenAddress().call();
    expect(initedPasarStatus, "Proxied Pasar contract initialize transaction status").to.equal(true);
    expect(initedPasar, "Proxied Pasar contract initialized result").to.equal(true);
    expect(tokenAddrPasar, "Proxied Pasar initialized with token address").to.equal(proxiedNftAddr);
    console.log(`Initalized: proxied Pasar contract with token address ${proxiedNftAddr}`);

    return { nftABI, pasarABI, nftAddr, pasarAddr, proxiedNftAddr, proxiedPasarAddr };
  } catch (err) {
    console.error(String(err));
    return;
  }
};

module.exports = {
  deployContracts
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, gasPrice, deployPK } = await getParams();
    await getWeb3(rpcUrl);
    await deployContracts(deployPK, gasPrice);
  })();
}
