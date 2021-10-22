const { loadFile, getWeb3 } = require("./utils");
const { getParams } = require("./activity_params");
const { proxiableABI } = require("./activity_config");

const getNFTData = async (abiPath, codeAddr, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const abi = JSON.parse(jsonStr);

  const web3 = await getWeb3(rpcUrl);
  const contract = new web3.eth.Contract(abi, codeAddr);

  const supply = await contract.methods.totalSupply().call();

  console.log(`Contract address\t: ${codeAddr}`);
  console.log(`Total supply\t: ${supply}`);
}

const getPasarData = async (abiPath, codeAddr, rpcUrl = null) => {
  const jsonStr = await loadFile(abiPath);
  const abi = JSON.parse(jsonStr);

  const web3 = await getWeb3(rpcUrl);
  const contract = new web3.eth.Contract(abi, codeAddr);

  const totolOpenOrder = await contract.methods.getOpenOrderCount().call();
  const buyerAccount = await contract.methods.getBuyerCount().call();
  const sellerAccount = await contract.methods.getSellerCount().call();
  const totalOrderAccount = await contract.methods.getOrderCount().call();

  console.log(`Contract address\t: ${codeAddr}`);

  console.log(`Total orders (onsale)\t: ${totolOpenOrder}`);
  console.log(`Total buyers\t: ${buyerAccount}`);
  console.log(`Total sellers\t: ${sellerAccount}`);
  console.log(`Total orders (bought/canceled/onsale)\t: ${totalOrderAccount}`);
}

module.exports = {
  getNFTData,
  getPasarData
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
        await getNFTData("../abis/FeedsNFTSticker.json", nftAddr, rpcUrl);
      }

      if (pasarAddr) {
        console.log("====>>> Pasar contract address details =====");
        await getPasarData("../abis/FeedsNFTPasar.json", pasarAddr, rpcUrl);
      }
    } catch (err) {
      console.error(String(err));
    }
  })();
}
