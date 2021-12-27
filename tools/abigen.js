const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;
const {compileContract: compile } = require("./utils");
const abipath = "../abis";

const mkdir = () => {
  if(fs.existsSync(abipath))
    return ;
  else{
    fs.mkdirSync(abipath);
    return ;
  } 
}

const writeFile = async (abi, pathName) => {
  try {
    const jsonData = JSON.stringify(abi, undefined, 2);
    fs.writeFile(pathName, jsonData, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error("Write file failed", err);
  }
}

const generateAbi = async (solPath, bytecode, contractName) => {
  try {
    console.log(`Prepare generate ${contractName} ABIs`);
    //generate contract abi
    const { abi: contractABI, bytecode: contractByteCode } = await compile(
      path.resolve(__dirname, solPath),
      bytecode
    );
    expect(contractABI, "Contract ABI").to.be.an("array");
    expect(contractByteCode, "Contract bytecode").to.be.a("string");
    console.log(`Compiled: Logic contract (${contractName}) and ABIs generated`);
    return contractABI;
  } catch (error) {
   console.log('Generate abi failed', error); 
  }
}

(async () => {
  try {
    console.log("Prepare generate abis");
    mkdir();
    
    // //generate sticker contract abi
    const stickerAbi =  await generateAbi('../contracts/FeedsNFTSticker.sol', 'FeedsNFTSticker', 'Sticker');
    await writeFile(stickerAbi, '../abis/FeedsNFTSticker.json');

    // //generate Pasar contract abi
    // await generateAbi('../contracts/FeedsNFTPasar.sol', 'FeedsNFTPasar', '../abis/FeedsNFTPasar.json', 'Pasar');
    const pasarAbi = await generateAbi('../contracts/FeedsNFTPasarV2.sol', 'FeedsNFTPasarV2', 'Pasar');
    await writeFile(pasarAbi, '../abis/FeedsNFTPasarV2.json');

    // //generate Galleria contract abi
    const galleriaAbi = await generateAbi('../contracts/FeedsNFTGalleria.sol', 'FeedsNFTGalleria', 'Galleria');
    await writeFile(galleriaAbi, '../abis/FeedsNFTGalleria.json');
  } catch (err) {
    console.error("Contracts compiled failed");
  }
})();

module.exports = {
  generateAbi
};