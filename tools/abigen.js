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
    console.error("Write file failed");
    throw err
  }
}

const generateAbi = async (solPath, bytecode ,outputAbiPath, contractName) => {
    console.log(`Prepare generate ${contractName} ABIs`);
    //generate contract abi
    const { abi: contractABI, bytecode: contractByteCode } = await compile(
      path.resolve(__dirname, solPath),
      bytecode
    );
    expect(contractABI, "Contract ABI").to.be.an("array");
    expect(contractByteCode, "Contract bytecode").to.be.a("string");

    writeFile(contractABI, outputAbiPath);
    console.log(`Compiled: Logic contract (${contractName}) and ABIs generated`);
}

(async () => {
  try {
    console.log("==> Try to compile NFT contract");
    mkdir();
    
    // //generate sticker contract abi
    await generateAbi('../contracts/FeedsNFTSticker.sol', 'FeedsNFTSticker', '../abis/FeedsNFTSticker.json', 'Sticker');

    // //generate Pasar contract abi
    await generateAbi('../contracts/FeedsNFTPasar.sol', 'FeedsNFTPasar', '../abis/FeedsNFTPasar.json', 'Pasar');

    // //generate Galleria contract abi
    await generateAbi('../contracts/FeedsNFTGalleria.sol', 'FeedsNFTGalleria', '../abis/FeedsNFTGalleria.json', 'Galleria');
  } catch (err) {
    console.error("Contracts compiled failed");
  }
})();
