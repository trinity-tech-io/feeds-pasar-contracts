const { generateAbi, mkdir, writeFile, generateStickerAbi, generatePasarAbi, generateGalleriaAbi } = require("./abigen_utils");
const abipath = "../abis";

(async () => {
  try {
    console.log("Prepare generate abis");
    mkdir(abipath);
    
    // //generate sticker contract abi
    const {contractABI: stickerAbi} =  await generateStickerAbi();
    await writeFile(stickerAbi, '../abis/FeedsNFTSticker.json');

    // //generate Pasar contract abi
    // await generateAbi('../contracts/FeedsNFTPasar.sol', 'FeedsNFTPasar', '../abis/FeedsNFTPasar.json', 'Pasar');
    const {contractABI: pasarAbi} = await generatePasarAbi();
    await writeFile(pasarAbi, '../abis/FeedsNFTPasarV2.json');

    // //generate Galleria contract abi
    const {contractABI: galleriaAbi} = await generateGalleriaAbi();
    await writeFile(galleriaAbi, '../abis/FeedsNFTGalleria.json');
  } catch (err) {
    console.error("Contracts compiled failed");
  }
})();

module.exports = {
};