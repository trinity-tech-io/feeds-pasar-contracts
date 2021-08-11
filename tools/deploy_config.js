module.exports = {
  // ethereum node RPC URL
  rpcUrl: "https://api.elastos.io/eth",
  
  // leave empty to get gasPrice automatically
  gasPrice: "",

  // owner to deploy and upgrade contract 
  deployPK: "",

  // whether to deploy NFT logic contract or not
  withNFT: true,
  // whether to deploy Pasar logic contract or not

  withPasar: true,

  // whether to deploy Proxy contracts or not
  withProxy: true,

  // nft proxy contract address
  nftAddr: "",
};