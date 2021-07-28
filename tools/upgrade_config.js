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

  // demo ABI should not be modified
  demoABI: [
    {
      "inputs": [],
      "name": "getA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getB",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_a",
          "type": "uint256"
        }
      ],
      "name": "setA",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_b",
          "type": "uint256"
        }
      ],
      "name": "setB",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],

};