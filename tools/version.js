const { loadFile, getWeb3 } = require("./utils");
const { getParams } = require("./version_params");
const { proxiableABI } = require("./version_config");

const getVersion = async (abiPath, codeAddr, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const nftABI = JSON.parse(jsonStr);

  const web3 = await getWeb3(rpcUrl);
  const nftContract = new web3.eth.Contract(nftABI, codeAddr);
  const proxyContract = new web3.eth.Contract(proxiableABI, codeAddr);

  const version = await nftContract.methods.getVersion().call();
  const magic = await nftContract.methods.getMagic().call();
  const logicAddr = await proxyContract.methods.getCodeAddress().call();

  console.log(`Contract address: ${codeAddr}`);
  console.log(`Version: ${version}`);
  console.log(`Magic: ${magic}`);
  console.log(`LogicAddr: ${logicAddr}`);
}

const getPlatformFee = async(abiPath, codeAddr, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const nftABI = JSON.parse(jsonStr);

  const web3 = await getWeb3(rpcUrl);
  const nftContract = new web3.eth.Contract(nftABI, codeAddr);

  const {_platformAddress, _platformFeeRate} = await nftContract.methods.getPlatformFee().call();
  console.log(`platformAddr: ${_platformAddress}`);
  console.log(`platformFee : ${_platformFeeRate}`);
}

module.exports = {
  getVersion,
};

if (require.main == module) {
  (async () => {
    try {
      const { rpcUrl, nftAddr, pasarAddr } = await getParams();
      console.log("rpcUrl   : ", rpcUrl);
      console.log("nftAddr  : ", nftAddr);
      console.log("pasarAddr: ", pasarAddr);
      console.log("");

      if (nftAddr) {
        console.log("====>>> NFT contract address details =====");
        await getVersion("../abis/FeedsNFTSticker.json", nftAddr, rpcUrl);
      }

      if (pasarAddr) {
        console.log("====>>> Pasar contract address details =====");
        await getVersion("../abis/FeedsNFTPasar.json", pasarAddr, rpcUrl);
        await getPlatformFee("../abis/FeedsNFTPasar.json", pasarAddr, rpcUrl);
      }

    } catch (err) {
      console.error(String(err));
    }
  })();
}
