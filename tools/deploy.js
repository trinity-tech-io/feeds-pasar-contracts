const path = require("path");
const expect = require("chai").expect;
const { getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./utils");
const { getParams } = require("./deploy_params");
const { generateStickerAbi, generatePasarAbi, generateGalleriaAbi, generateProxyAbi } = require("./abigen_utils");

const ContractType = {
  sticker:0,
  pasar:1,
  galleria:2
}
const deployContract = async(web3, account, gasPrice, abi, bytecode, logicAddress, contractName) => {
  try {
    const contract = new web3.eth.Contract(abi);
    let deployParam;
    if (logicAddress){
      deployParam = { data: bytecode , arguments: [logicAddress] };  
    }else{
      deployParam = { data: bytecode };
    }
    const data = contract.deploy(deployParam).encodeABI();
    const tx = {
      from: account.address,
      value: 0,
      data: data,
      gasPrice,
    };

    const { contractAddress, status } = await sendTxWaitForReceipt(tx, account);
    expect(status, `${contractName} contract deploy transaction status`).to.equal(true);
    expect(contractAddress, `${contractName} contract address`).to.be.a("string").with.lengthOf("42");
    return contractAddress;
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const initialProxy = async (proxyContract, account, gasPrice, proxyAddress, txData)=>{
  try {
    const tx = {
      from: account.address,
      to: proxyAddress,
      value: 0,
      data: txData,
      gasPrice,
    };
    const {status: status} = await sendTxWaitForReceipt(tx, account);
    let inited = await proxyContract.methods.initialized().call();
    expect(status, "Proxied contract initialize transaction status").to.equal(true);
    expect(inited, "Proxied contract initialized result").to.equal(true);
    return inited;
  } catch (error) {
    console.log(String(err));
  } 
}

const deployNFT = async(web3, account, gasPrice) => {
  try {
    const contractName = 'Sticker';
    const {contractABI: contractABI, contractByteCode: stickerBytecode} =  await generateStickerAbi();
    const contractAddress = await deployContract(web3, account, gasPrice, contractABI, stickerBytecode, null, contractName);
    return { contractABI, contractAddress };
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const deployPasar = async(web3, account, gasPrice) => {
  try {
    const contractName = 'Pasar';
    const {contractABI: contractABI, contractByteCode: pasarBytecode} =  await generatePasarAbi();
    const contractAddress = await deployContract(web3, account, gasPrice, contractABI, pasarBytecode, null, contractName);
    return { contractABI, contractAddress };
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const deployGalleria = async(web3, account, gasPrice) => {
  try {
    const contractName = 'Galleria';
    const {contractABI: contractABI, contractByteCode: galleriaBytecode} =  await generateGalleriaAbi();
    const contractAddress = await deployContract(web3, account, gasPrice, contractABI, galleriaBytecode, null, contractName);
    return { contractABI, contractAddress };
  } catch (err) {
    console.error(String(err));
    return;
  }
}

const deployProxy = async (web3, account, gasPrice, logicAbi, logicAddress, stickerProxyAddress, contractName) => {
  try {
    const {contractABI: proxyAbi, contractByteCode: proxyBytecode} =  await generateProxyAbi();
    const proxyAddress = await deployContract(web3, account, gasPrice, proxyAbi, proxyBytecode, logicAddress, contractName);
    return proxyAddress;
  } catch (err) {
    console.log('Deploy proxy error',String(err));
    return;
  }
}

const deployNFTProxy = async (web3, account, gasPrice, logicAbi, logicAddress, contractName) => {
  try {
    const proxyAddress = await deployProxy(web3, account, gasPrice, logicAbi, logicAddress, null, contractName);

    const proxyContract = new web3.eth.Contract(logicAbi, proxyAddress);
    const txData = proxyContract.methods.initialize().encodeABI();
    const inited = await initialProxy(proxyContract, account, gasPrice, proxyAddress, txData);

    if (inited){
      return proxyAddress;
    } else {
      console.log('Inited proxy failed')
    }
  } catch (err) {
    console.log(String(err));
    return;
  }
}

const deployPasarProxy = async (web3, account, gasPrice, logicAbi, logicAddress, contractName, stickerProxyAddress) => {
  try {
    const proxyAddress = await deployProxy(web3, account, gasPrice, logicAbi, logicAddress, stickerProxyAddress, contractName);

    const proxyContract = new web3.eth.Contract(logicAbi, proxyAddress);
    const txData = proxyContract.methods.initialize(stickerProxyAddress).encodeABI();
    const inited = await initialProxy(proxyContract, account, gasPrice, proxyAddress, txData);

    console.log('deployPasarProxy ==',inited);
    if (inited){
      return proxyAddress;
    } else {
      console.log('Inited proxy failed')
    }
  } catch (err) {
    console.log(String(err));
    return;
  }
}

const deployGalleriaProxy = async (web3, account, gasPrice, logicAbi, logicAddress, contractName, stickerProxyAddress, minFee, platformAddr) => {
  try {
    const proxyAddress = await deployProxy(web3, account, gasPrice, logicAbi, logicAddress, stickerProxyAddress, contractName);

    const proxyContract = new web3.eth.Contract(logicAbi, proxyAddress);
    const txData = proxyContract.methods.initialize(stickerProxyAddress, platformAddr, minFee).encodeABI();
    const inited = await initialProxy(proxyContract, account, gasPrice, proxyAddress, txData);

    if (inited){
      return proxyAddress;
    } else {
      console.log('Inited galleria proxy contract failed');
    }
  } catch (err) {
    console.log(String(err));
    return;
  }
}

module.exports = {
  deployContract,
};

if (require.main == module) {
  (async () => {
    try {
      const params = await getParams();
      if (!params){
        console.log("Config param error");
        return;
      }
        
      const { rpcUrl, gasPrice, deployPK, deployNewSticker, deployNewStickerProxy, originStickerProxy,
        deployNewPasar, deployNewPasarProxy, deployNewGalleria, deployNewGalleriaProxy, platformAddr, minFee} = params;

      const web3 = await getWeb3(rpcUrl);
      const account = await getAccount(deployPK);

      let stickerProxyAddress;

      //deploy Sticker
      if (deployNewSticker) {
        const { contractABI: nftABI, contractAddress: nftAddr } = await deployNFT(web3, account, gasPrice);
        if (!nftAddr)
          return;
        console.log(`NFT contract deployed at ${nftAddr}`);

        if (deployNewStickerProxy) {
          stickerProxyAddress = await deployNFTProxy(web3, account, gasPrice, nftABI, nftAddr,'NFTProxy');
          if (!stickerProxyAddress)
            return;
          console.log(`NFT proxy contract deployed at ${stickerProxyAddress}`);
        }
      } else {
        stickerProxyAddress = originStickerProxy;
      }

      // deploy Pasar
      if (deployNewPasar) {
        const { contractABI: pasarABI, contractAddress: pasarAddr } = await deployPasar(web3, account, gasPrice);
        if (!pasarAddr)
          return;
        console.log(`Pasar contract deployed at ${pasarAddr}`);

        if (deployNewPasarProxy) {
          console.log(`proxyNftAddr: ${stickerProxyAddress}`);
          const pasarProxyAddr = await deployPasarProxy(web3, account, gasPrice, pasarABI, pasarAddr, 'PasarProxy', stickerProxyAddress);
          if (!pasarProxyAddr)
            return;
          console.log(`Pasar proxy contract deployed at ${pasarProxyAddr}`);
        }
      }

      // deploy Galleria
      if (deployNewGalleria) {
        const { contractABI: galleriaABI, contractAddress: galleriaAddr } = await deployGalleria(web3, account, gasPrice);
        if (!galleriaAddr)
          return;
        console.log(`Galleria contract deployed at ${galleriaAddr}`);

        if (deployNewGalleriaProxy) {
          console.log(`proxyNftAddr: ${stickerProxyAddress}`);
          if (!minFee){
            console.log('Param minFee error, minFee is ',minFee);
            return ;
          }

          if (!platformAddr){
            console.log('Platform address error, platformAddr is ', platformAddr);
            return;
          }
          
          const galleriaProxyAddr = await deployGalleriaProxy(web3, account, gasPrice, galleriaABI, galleriaAddr, 'GalleriaProxy', stickerProxyAddress, minFee, platformAddr);
          if (!galleriaProxyAddr)
            return;
          console.log(`Pasar proxy contract deployed at ${galleriaProxyAddr}`);
        }
      }
      console.log("Contracts deployed successfully");
    } catch (err) {
      console.error(String(err));
      console.error("Contracts deployed failed");
    }
  })();
}
