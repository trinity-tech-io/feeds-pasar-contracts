const { loadFile, getWeb3, getAccount, sendTxWaitForReceipt } = require("./utils");

const { getParams } = require("./update_platform_params");
const { proxiableABI } = require("./update_platform_config");

const getVersion = async (web3, abiPath, proxyContractAddress, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const nftABI = JSON.parse(jsonStr);

  const nftContract = new web3.eth.Contract(nftABI, proxyContractAddress);
  const proxyContract = new web3.eth.Contract(proxiableABI, proxyContractAddress);

  const version = await nftContract.methods.getVersion().call();
  const magic = await nftContract.methods.getMagic().call();
  const logicAddr = await proxyContract.methods.getCodeAddress().call();

  console.log(`Contract address: ${proxyContractAddress}`);
  console.log(`Version: ${version}`);
  console.log(`Magic: ${magic}`);
  console.log(`LogicAddr: ${logicAddr}`);
}

const getFeeParams = async(web3, abiPath, proxyContractAddress, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const nftABI = JSON.parse(jsonStr);

  const nftContract = new web3.eth.Contract(nftABI, proxyContractAddress);

  const {_platformAddress, _minFee} = await nftContract.methods.getFeeParams().call();
  console.log(`platformAddr: ${_platformAddress}`);
  console.log(`minFee : ${_minFee}`);
}

const setFeeParams = async(web3, gasPrice, account, abiPath, proxyContractAddress, rpcUrl = null, newPlatformAddr, newMinFee) => {
  try {
    const jsonStr = await loadFile(abiPath);
    const abi = JSON.parse(jsonStr);

    const nftContract = new web3.eth.Contract(abi, proxyContractAddress);

    console.log("newPlatformAddr: ", newPlatformAddr);
    console.log("newMinFee: ", newMinFee);

    const data = nftContract.methods.setFeeParams(newPlatformAddr, newMinFee).encodeABI();
    const tx = {
      from: account.address,
      to: proxyContractAddress,
      value: 0,
      data: data,
      gasPrice,
    };

    const {
      transactionHash: transactionHash,
      gasUsed: gasUsed,
      status: status,
    } = await sendTxWaitForReceipt(tx, account);

    console.log('transactionHash',transactionHash);
    console.log('gasUsed',gasUsed);
    console.log('status',status);
  } catch (error) {
    console.log('setFeeParams error',error);
  }
}

if (require.main == module) {
  (async () => {
    try {
      const { rpcUrl, gasPrice, deployPK, galleriaAddr, newPlatformAddr, newMinFee } = await getParams();

      const web3 = await getWeb3(rpcUrl);
      const account = await getAccount(deployPK);

      console.log("account   : ", account.address);
      console.log("rpcUrl   : ", rpcUrl);
      console.log("galleriaAddr: ", galleriaAddr);
      console.log("newPlatformAddr: ", newPlatformAddr);
      console.log("newMinFee: ", newMinFee);

      if (galleriaAddr && newPlatformAddr && newMinFee) {
        console.log("====>>> Start change galleria platform param =====");
        console.log("====>>> Origin Galleria info =====");
        await getVersion(web3, "../abis/FeedsNFTGalleria.json", galleriaAddr, rpcUrl);
        await getFeeParams(web3, "../abis/FeedsNFTGalleria.json", galleriaAddr, rpcUrl);
        console.log("--------");
        await setFeeParams(web3, gasPrice, account, "../abis/FeedsNFTGalleria.json", galleriaAddr, rpcUrl, newPlatformAddr, newMinFee);
        console.log("--------");
        console.log("====>>> New Galleria info =====");
        await getVersion(web3, "../abis/FeedsNFTGalleria.json", galleriaAddr, rpcUrl);
        await getFeeParams(web3, "../abis/FeedsNFTGalleria.json", galleriaAddr, rpcUrl);
      }
    } catch (err) {
      console.error(String(err));
    }
  })();
}
