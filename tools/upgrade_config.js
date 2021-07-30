module.exports = {
  // ethereum node RPC URL
  rpcUrl: "",
  
  // leave empty to get gasPrice automatically
  gasPrice: "",

  // owner to deploy and upgrade contract 
  ownerPK: "",

  // the proxied contract address for logic NFT contract
  proxiedNftAddr: "",

  // the proxied contract address for logic Pasar contract
  proxiedPasarAddr: "",

  // the new logic NFT address to replace with the old one
  newNftAddr: "",

  // the new logic Pasar address to replace with the old one
  newPasarAddr: "",

  proxiableABI: [
    {
      "inputs": [],
      "name": "getCodeAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newAddress",
          "type": "address"
        }
      ],
      "name": "updateCodeAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};
