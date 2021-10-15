const { getParams, getWeb3, scanEvents } = require("./utils");

const getFilledTotal = async (pasarABI, pasarAddr, startBlock, endBlock) => {
  const web3 = await getWeb3();
  const pasarContract = new web3.eth.Contract(pasarABI, pasarAddr);
  const filledEvents = await scanEvents(pasarContract, "OrderFilled", startBlock, endBlock);
  let totalPrice = BigInt(0);
  let totalRoyalty = BigInt(0);
  for (let item of filledEvents) {
    const values = item.returnValues;
    totalPrice += BigInt(values._price);
    totalRoyalty += BigInt(values._royalty);
  }
  console.log(`filled count: ${filledEvents.length} total filled: ${totalPrice} total royalty: ${totalRoyalty}`);
};

if (require.main == module) {
  (async () => {
    const { rpcUrl, pasarABI, pasarAddr } =
      await getParams();
    await getWeb3(rpcUrl);
    await getFilledTotal(pasarABI, pasarAddr);
  })();
}
