const path = require("path");
const expect = require("chai").expect;
const { getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./utils");
const { getParams } = require("./deploy_params");

const deployNFT = async(web3, account, gasPrice) => {
  try {
    const { abi, bytecode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTSticker.sol"),
      "FeedsNFTSticker"
    );
    expect(abi, "NFT contract ABI").to.be.an("array");
    expect(bytecode, "NFT contract byteCode").to.be.a("string");

    const contract = new web3.eth.Contract(abi);

    const data = contract.deploy({ data: bytecode }).encodeABI();
    const tx = {
      from: account.address,
      value: 0,
      data: data,
      gasPrice,
    };

    const { contractAddress, status } = await sendTxWaitForReceipt(tx, account);
    expect(status, "NFT contract deploy transaction status").to.equal(true);
    expect(contractAddress, "NFT contract address").to.be.a("string").with.lengthOf("42");

    return { abi, contractAddress };
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const deployPasar = async(web3, account, gasPrice) => {
  try {
    const { abi, bytecode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsNFTPasar.sol"),
      "FeedsNFTPasar"
    );
    expect(abi, "Pasar contract ABI").to.be.an("array");
    expect(bytecode, "Pasar contract byteCode").to.be.an("string");

    const contract = new web3.eth.Contract(abi);

    const data = contract.deploy({ data: bytecode }).encodeABI();
    const tx = {
      from: account.address,
      value: 0,
      data: data,
      gasPrice,
    };

    const { contractAddress, status } = await sendTxWaitForReceipt(tx, account);
    expect(status, "Pasar contract deploy transaction status").to.equal(true);
    expect(contractAddress, "Pasar contract address").to.be.a("string").with.lengthOf("42");

    return { abi, contractAddress };
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const deployNFTProxy = async (web3, account, gasPrice, logicABI, codeAddr) => {
  try {
    const { abi, bytecode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(abi, "Proxy contract ABI").to.be.an("array");
    expect(bytecode, "Proxy contract bytecode").to.be.a("string");

    const contract = new web3.eth.Contract(abi);
    let data = contract.deploy({ data: bytecode, arguments: [codeAddr] }).encodeABI();
    let tx = {
      from: account.address,
      value: 0,
      data: data,
      gasPrice,
    };

    const { contractAddress, status} = await sendTxWaitForReceipt(tx, account);
    expect(status, "Proxy contract deploy transaction status").to.equal(true);
    expect(contractAddress, "Proxy contract address").to.be.a("string").with.lengthOf("42");

    const proxyContract = new web3.eth.Contract(logicABI, contractAddress);

    data = proxyContract.methods.initialize().encodeABI();
    tx = {
      from: account.address,
      to: contractAddress,
      value: 0,
      data: data,
      gasPrice,
    };

    const {status: status2} = await sendTxWaitForReceipt(tx, account);
    const inited = await proxyContract.methods.initialized().call();
    expect(status2, "Proxied contract initialize transaction status").to.equal(true);
    expect(inited, "Proxied contract initialized result").to.equal(true);

    return contractAddress;
  } catch (err) {
    console.log(String(err));
    return;
  }
}

const deployPasarProxy = async (web3, account, gasPrice, logicABI, codeAddr, parameterAddr) => {
  try {
    const { abi, bytecode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(abi, "Proxy contract ABI").to.be.an("array");
    expect(bytecode, "Proxy contract bytecode").to.be.a("string");

    const contract = new web3.eth.Contract(abi);
    let data = contract.deploy({ data: bytecode, arguments: [codeAddr] }).encodeABI();
    let tx = {
      from: account.address,
      value: 0,
      data: data,
      gasPrice,
    };

    const { contractAddress, status} = await sendTxWaitForReceipt(tx, account);
    expect(status, "Proxy contract deploy transaction status").to.equal(true);
    expect(contractAddress, "Proxy contract address").to.be.a("string").with.lengthOf("42");

    const proxyContract = new web3.eth.Contract(logicABI, contractAddress);

    data = proxyContract.methods.initialize(parameterAddr).encodeABI();
    tx = {
      from: account.address,
      to: contractAddress,
      value: 0,
      data: data,
      gasPrice,
    };

    const {status: status2} = await sendTxWaitForReceipt(tx, account);
    const inited = await proxyContract.methods.initialized().call();
    expect(status2, "Proxied contract initialize transaction status").to.equal(true);
    expect(inited, "Proxied contract initialized result").to.equal(true);

    return contractAddress;
  } catch (err) {
    console.log(String(err));
    return;
  }
}

module.exports = {
  deployNFT,
  deployPasar,
  deployNFTProxy,
  deployPasarProxy
};

if (require.main == module) {
  (async () => {
    try {
      const { rpcUrl, gasPrice, deployPK, withNFT, withPasar, withProxy, nftAddr } = await getParams();
      console.log(`rpcUrl  : ${rpcUrl}`);
      console.log(`gasPrice: ${gasPrice}`);
      //console.log(`deployPK: ${deployPK}`);
      console.log(`NFT contract addr: ${nftAddr}`);

      console.log("Deploy contracts:")
      if (withNFT)
        console.log("\tNFT");
      if (withPasar)
        console.log("\tPasar");
      if (withProxy)
        console.log("\tProxied");

      const web3 = await getWeb3(rpcUrl);
      const account = await getAccount(deployPK);

      let proxyNftAddr;

     if (withNFT) {
        const { abi: nftABI, contractAddress: nftAddr } = await deployNFT(web3, account, gasPrice);
        console.log(`NFT contract deployed at ${nftAddr}`);

        if (withProxy) {
          proxyNftAddr = await deployNFTProxy(web3, account, gasPrice, nftABI, nftAddr);
          console.log(`NFT proxy contract deployed at ${proxyNftAddr}`);
        }
      } else {
        proxyNftAddr = nftAddr;
      }

      if (withPasar) {
        if (withProxy & !proxyNftAddr) {
          console.error("Error: need nft proxy address.");
          return;
        }

        const { abi: pasarABI, contractAddress: pasarAddr } = await deployPasar(web3, account, gasPrice);
        console.log(`Pasar contract deployed at ${pasarAddr}`);

        if (withProxy) {
          console.log(`proxyNftAddr: ${proxyNftAddr}`);

          const proxyPasarAddr = await deployPasarProxy(web3, account, gasPrice, pasarABI, pasarAddr, proxyNftAddr);
          console.log(`Pasar proxy contract deployed at ${proxyPasarAddr}`);
        }
      }
      console.log("Contracts deployed successfully");
    } catch (err) {
      console.error(String(err));
      console.error("Contracts deployed failed");
    }
  })();
}
