module.exports = {
  // ethereum node RPC URL
  rpcUrl: "",
  
  // leave empty to get gasPrice automatically
  gasPrice: "",

  // standard interface for upgradeable proxied contract, should not be modified
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
  ],

};
