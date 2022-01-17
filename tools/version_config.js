module.exports = {
  // ethereum node RPC URL
  rpcUrl: "",
  
  // the address of NFT contract (must be proxied address)
  nftAddr: "",

  // the address of Pasar contract (must be proxied address)
  pasarAddr: "",

  // the address of Galleria contract (must be proxied address)
  galleriaAddr: "",

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

