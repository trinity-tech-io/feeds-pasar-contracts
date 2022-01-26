module.exports = {
  // the address of Galleria contract (must be proxied address)
  galleriaAddr: '',
  newPlatformAddr: '',
  newMinFee:"100000000000000000",

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

