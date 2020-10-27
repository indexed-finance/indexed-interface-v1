import IERC20 from '../assets/constants/abi/IERC20.json';
import { toContract } from './util/contracts'

export function getERC20(web3, tokenAddress){
   return toContract(web3, IERC20.abi, tokenAddress)
}

export async function allowance(web3, tokenAddress, sender, spender){
  let contract = getERC20(web3, tokenAddress)

  return await contract.methods.allowance(sender, spender).call()
}

export async function balanceOf(web3, tokenAddress, owner){
  let contract = getERC20(web3, tokenAddress)

  return await contract.methods.balanceOf(owner).call()
}
