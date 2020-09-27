const { abi: erc20ABI, bytecode: erc20Bytecode } = require('../assets/constants/abi/MockERC20.json');
const { deploy } = require('./util/contracts');

export async function deployERC20(web3, from, name, symbol) {
  return deploy(web3, from, erc20ABI, erc20Bytecode, [name, symbol]);
}

export function getERC20(web3, contract) {
  if (typeof contract == 'string') {
    return new web3.eth.Contract(erc20ABI, contract);
  }
  return contract;
}
