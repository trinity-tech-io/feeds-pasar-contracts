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

(async () => {
  try {
    console.log("==> try to compile NFT contract");

    mkdir();
    const { abi: nftABI, bytecode: nftCode } = await compile(
      path.resolve(__dirname, "../contracts/FeedsNFTSticker.sol"),
      "FeedsNFTSticker"
    );
    expect(nftABI, "NFT contract ABI").to.be.an("array");
    expect(nftCode, "NFT contract bytecode").to.be.a("string");

    writeFile(nftABI, "../abis/FeedsNFTSticker.json");
    console.log("Compiled: Logic contract (NFT) and ABIs generated");

    const { abi: pasarABI, bytecode: pasarCode} = await compile(
      path.resolve(__dirname, "../contracts/FeedsNFTPasar.sol"),
      "FeedsNFTPasar"
    );

    expect(pasarABI, "Pasar contract ABI").to.be.an("array");
    expect(pasarCode, "Pasar contract bytecode").to.be.a("string");

    writeFile(pasarABI, "../abis/FeedsNFTPasar.json");
    console.log("Compiled: Logic contract (Pasar) and ABIs generated");
  } catch (err) {
    console.error("Contracts compiled failed");
  }
})();
