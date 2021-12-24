const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;
const {compileContract: compile } = require("./utils");

const mkdir = (abipath) => {
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
    return {contractABI, contractByteCode};
  } catch (error) {
   console.log('Generate abi failed', error); 
  }
}

const generateStickerAbi = async ()=>{
  // generate sticker contract abi
  const {contractABI, contractByteCode} =  await generateAbi('../contracts/FeedsNFTSticker.sol', 'FeedsNFTSticker', 'Sticker');
  return {contractABI, contractByteCode};
}

const generatePasarAbi = async ()=>{
  // generate Pasar contract abi
  const {contractABI, contractByteCode} = await generateAbi('../contracts/FeedsNFTPasar.sol', 'FeedsNFTPasar', 'Pasar');
  return {contractABI, contractByteCode};
}

const generateGalleriaAbi = async ()=>{
  // generate Galleria contract abi
  const {contractABI, contractByteCode} = await generateAbi('../contracts/FeedsNFTGalleria.sol', 'FeedsNFTGalleria', 'Galleria');
  return {contractABI, contractByteCode};
}

const generateProxyAbi = async ()=>{
  // generate Galleria contract abi
  const {contractABI, contractByteCode} = await generateAbi('../contracts/FeedsContractProxy.sol', 'FeedsContractProxy', 'Proxy');
  return {contractABI, contractByteCode};
}

module.exports = {
  generateAbi,
  mkdir,
  writeFile,
  generateStickerAbi,
  generatePasarAbi,
  generateGalleriaAbi,
  generateProxyAbi,
};