const path = require("path");
const expect = require("chai").expect;
const { getParams, getWeb3, getAccount, compileContract, sendTxWaitForReceipt } = require("./demoUtils");
const { upgrader } = require("./upgrader");

(async () => {
  try {
    console.log("=== Demo start ===");
    const { rpcUrl, gasPrice, ownerPK, demoABI } = await getParams();
    console.log("=== Params loaded ===");
    const web3 = await getWeb3(rpcUrl);
    console.log("=== Web3 initialized ===");
    const accOwner = await getAccount(ownerPK);
    console.log("=== Owner account generated ===");

    console.log("=== Deploy demo contracts ===");
    // Compile demo contracts and proxy contract
    const { abi: proxyABI, bytecode: proxyCode } = await compileContract(
      path.resolve(__dirname, "../contracts/FeedsContractProxy.sol"),
      "FeedsContractProxy"
    );
    expect(proxyABI, "Proxy contract ABI").to.be.an("array");
    expect(proxyCode, "Proxy contract bytecode").to.be.a("string");
    console.log("Proxy contract compiled");

    const { abi: demo1ABI, bytecode: demo1Code } = await compileContract(
      path.resolve(__dirname, "./Demo1.sol"),
      "Demo1"
    );
    const { abi: demo2ABI, bytecode: demo2Code } = await compileContract(
      path.resolve(__dirname, "./Demo2.sol"),
      "Demo2"
    );
    expect(demo1ABI, "Demo1 contract ABI").to.be.an("array");
    expect(demo1Code, "Demo1 contract bytecode").to.be.a("string");
    expect(demo2ABI, "Demo2 contract ABI").to.be.an("array");
    expect(demo2Code, "Demo2 contract bytecode").to.be.a("string");
    console.log("Demo contracts compiled");

    // Prepare to deploy contracts
    const proxyContract = new web3.eth.Contract(proxyABI);
    const demo1Contract = new web3.eth.Contract(demo1ABI);
    const demo2Contract = new web3.eth.Contract(demo2ABI);

    // Deploy demo1 contract
    const demo1Data = demo1Contract.deploy({ data: demo1Code }).encodeABI();
    const demo1Tx = {
      from: accOwner.address,
      value: 0,
      data: demo1Data,
      gasPrice,
    };
    const { contractAddress: demo1Addr, status: demo1Status } = await sendTxWaitForReceipt(demo1Tx, accOwner);
    expect(demo1Status, "Demo1 contract deploy transaction status").to.equal(true);
    expect(demo1Addr, "Demo1 contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Demo1 contract deployed successfully at address ${demo1Addr}`);

    // Deploy demo2 contract
    const demo2Data = demo2Contract.deploy({ data: demo2Code }).encodeABI();
    const demo2Tx = {
      from: accOwner.address,
      value: 0,
      data: demo2Data,
      gasPrice,
    };
    const { contractAddress: demo2Addr, status: demo2Status } = await sendTxWaitForReceipt(demo2Tx, accOwner);
    expect(demo2Status, "Demo2 contract deploy transaction status").to.equal(true);
    expect(demo2Addr, "Demo2 contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Demo2 contract deployed successfully at address ${demo2Addr}`);

    // Deploy proxy contract with demo1 as logic contract
    const proxyData = proxyContract.deploy({ data: proxyCode, arguments: [demo1Addr] }).encodeABI();
    const proxyTx = {
      from: accOwner.address,
      value: 0,
      data: proxyData,
      gasPrice,
    };
    const { contractAddress: proxyAddr, status: proxyStatus } = await sendTxWaitForReceipt(
      proxyTx,
      accOwner
    );
    expect(proxyStatus, "Proxy contract deploy transaction status").to.equal(true);
    expect(proxyAddr, "Proxy contract address").to.be.a("string").with.lengthOf("42");
    console.log(`Proxy contract deployed successfully at address ${proxyAddr}`);

    // Initialize proxy contract
    const proxiedDemo1 = new web3.eth.Contract(demo1ABI, proxyAddr);
    const initData = proxiedDemo1.methods.initialize().encodeABI();
    const initTx = {
      from: accOwner.address,
      to: proxyAddr,
      value: 0,
      data: initData,
      gasPrice,
    };
    const { status: initStatus } = await sendTxWaitForReceipt(initTx, accOwner);
    const inited = await proxiedDemo1.methods.initialized().call();
    expect(initStatus, "Proxied demo1 contract initialize transaction status").to.equal(true);
    expect(inited, "Proxied demo1 contract initialized result").to.equal(true);
    console.log("Proxied demo1 contract initialized successfully");
    console.log("=== Demo contracts deployed successfully");

    // Showcase the upgradeability of the proxied contract
    const demoContract = new web3.eth.Contract(demoABI, proxyAddr);
    console.log("=== Demo contract object instantiated ===");

    console.log("=== Test demo contract with demo1 as logic contract === ");
    const aValue = "1";
    const bValue = "2";
    const setAData = demoContract.methods.setA(aValue).encodeABI();
    const setATx = {
      from: accOwner.address,
      to: proxyAddr,
      value: 0,
      data: setAData,
      gasPrice,
    };
    const setBData = demoContract.methods.setB(bValue).encodeABI();
    const setBTx = {
      from: accOwner.address,
      to: proxyAddr,
      value: 0,
      data: setBData,
      gasPrice,
    };

    // execute setA method
    const { status: setAStatus } = await sendTxWaitForReceipt(setATx, accOwner);
    expect(setAStatus, "Method setA transaction status").to.equal(true);

    // call getA method
    const getAResult = await demoContract.methods.getA().call();
    expect(getAResult, "Method getA return value").to.equal(aValue);
    console.log(`Variable a is successfully set and read with value ${getAResult}`);

    // clone setBTx to send twice as the send transaction process may modify the params
    const setBTxClone = JSON.parse(JSON.stringify(setBTx));

    // execute setB method with demo1 as logic contract
    const setBTxResult = await sendTxWaitForReceipt(setBTxClone, accOwner);
    expect(setBTxResult, "Result of method setB executed with demo1 logic").to.be.undefined;
    console.log("Method setB correctly failed for now");

    console.log("=== Upgrade logic contract from demo1 to demo2");
    const upgradeResult = await upgrader(ownerPK, proxyAddr, demo2Addr, gasPrice, rpcUrl);
    expect(upgradeResult, "Result of upgrading logic contract from demo1 to demo2").to.equal(true);
    console.log("Logic contract successfully upgraded to demo2");

    console.log("=== Test demo contract with demo2 as logic contract === ");
    // call getA method
    const getAResult2 = await demoContract.methods.getA().call();
    expect(getAResult2, "Method getA return value").to.equal(aValue);
    console.log(`Result of method getA with demo2 logic stays at value ${getAResult2}`);

    // execute setB method with demo2 as logic contract
    const { status: setBStatus } = await sendTxWaitForReceipt(setBTx, accOwner);
    expect(setBStatus, "Method setB transaction status").to.equal(true);

    // call getB method
    const getBResult = await demoContract.methods.getB().call();
    expect(getBResult, "Method getA return value").to.equal(bValue);
    console.log(`Variable b is successfully set and read with value ${getBResult}`);
    console.log("=== Proxied contract upgraded correctly with new code logic ===");

    console.log("=== Demo end ===");
  } catch (err) {
    console.error(String(err));
    console.error("=== Demo failed ===");
  }
})();
