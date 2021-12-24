module.exports = {
  // whether to deploy NFT logic contract or not
  deployNewSticker: false,
  // whether to NFT proxy contracts or not
  deployNewStickerProxy: false,
  // nft proxy contract address
  // If the proxy is not deployed(deployNewProxy: false), must input this params
  originStickerProxy: '',

  // whether to deploy Pasar logic contract or not
  deployNewPasar: false,
  // whether to deploy Pasar proxy contract or not
  deployNewPasarProxy: false,

  // whether to deploy galleria logic contract or not
  deployNewGalleria: true,
  // whether to deploy galleria proxy contract or not
  deployNewGalleriaProxy: true,

  minFee:"100000000000000000",
  platformAddr:""
};