module.exports = {
  mainNet: {
    //ethereum node RPC URL
    rpcUrl: 'https://api.elastos.io/eth',
    // leave empty to get gasPrice automatically
    gasPrice: '',
    // owner to deploy and upgrade contract 
    deployPK: '',
  },

  testNet: {
    //ethereum node RPC URL
    rpcUrl: 'https://api-testnet.elastos.io/eth',
    // leave empty to get gasPrice automatically
    gasPrice: '',
    // owner to deploy and upgrade contract 
    deployPK: '',
  },

  customNet: {
    //ethereum node RPC URL
    rpcUrl: 'https://api-testnet.elastos.io/eth',
    // leave empty to get gasPrice automatically
    gasPrice: '',
    // owner to deploy and upgrade contract 
    deployPK: '',
  },

  //config net: mainNet/testNet/customNet
  netType: 'testNet',
};