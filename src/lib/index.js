const BN = require('bn.js');

const GovTokens = require('./govtokens.json');
const deployments = require('./deployments.json');

const LiquidityAdderABI = require('./abi/LiquidityAdder.json');
const OracleABI = require('./abi/UniSwapV2PriceOracle.json');
const ControllerABI = require('./abi/MarketCapSqrtController.json');
const InitializerABI = require('./abi/PoolInitializer.json');

const toBN = (bn) => {
  if (BN.isBN(bn)) return bn;
  if (bn._hex) return new BN(bn._hex.slice(2), 'hex');
  if (typeof bn == 'string' && bn.slice(0, 2) == '0x') {
    return new BN(bn.slice(2), 'hex');
  }
  return new BN(bn);
};
const oneToken = new BN('de0b6b3a7640000', 'hex');
const toHex = (bn) => '0x' + bn.toString('hex');
const waitSeconds = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

async function addLiquidityAll(web3, from, updatePrices = false)  {
  const liquidityAdder = new web3.eth.Contract(LiquidityAdderABI.abi, deployments.liquidityAdder);
  const oracle = new web3.eth.Contract(OracleABI, deployments.HourlyTWAPUniswapV2Oracle);
  const addresses = [];
  for (let token of GovTokens) {
    const { marketcap, price } = token;
    const totalLiquidity = toBN(marketcap).divn(price);
    const amountToken = totalLiquidity.divn(100);
    const amountWeth = toBN(marketcap).divn(100);
    const input = {
      token: deployments[token.symbol.toLowerCase()],
      amountToken: toHex(amountToken.mul(oneToken)),
      amountWeth: toHex(amountWeth.mul(oneToken))
    };
    addresses.push(input.token);
    console.log(`Adding liquidity to ${token.symbol}:ETH market`)
    await liquidityAdder.methods.addLiquiditySingle(
      input.token,
      input.amountToken,
      input.amountWeth,
    ).send({ from, gas: 2700000 })
    console.log(`Added liquidity to ${token.symbol}:ETH market`)
  }
  if (updatePrices) {
    console.log('Updating prices on oracle...')
    await oracle.methods.updatePrices(addresses).send({ from, gas: 2000000 });
    console.log('Updated prices on oracle!')
  }
}

async function prepareOracle(web3, from) {
  const controller = new web3.eth.Contract(ControllerABI, '0xe9AE62e04CD55F7e57DE760e190Eb2D43ecE8b40');
  const govi6rAddress = await controller.methods.computePoolAddress(2, 6).call();
  const govi6rInitAddress = await controller.methods.computeInitializerAddress(govi6rAddress).call();
  const govi6rInit = new web3.eth.Contract(InitializerABI, govi6rInitAddress);
  const tokens = await govi6rInit.methods.getDesiredTokens().call();
  const balances = await govi6rInit.methods.getDesiredAmounts(tokens).call();
  const isZero = val => new BN(val).eqn(0);
  const oneToken = new BN('de0b6b3a7640000', 'hex');
  const credits = await Promise.all(tokens.map(t => govi6rInit.methods.getCreditForTokens(t, oneToken).call()));
  const doUpdate = credits.some(isZero)

  if (doUpdate) {
    console.log('Adding UniSwap liquidity and updating prices on oracle...');
    await addLiquidityAll(web3, from, true);
    console.log('Waiting 5 minutes to update price...');
  }
  await waitSeconds(300);
  await addLiquidityAll(web3, from, false);
  console.log('Adding UniSwap liquidity...');
  
  console.log('Oracle ready!')
}

module.exports = { prepareOracle };
