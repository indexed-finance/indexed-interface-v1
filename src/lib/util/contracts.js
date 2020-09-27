export function deploy(web3, from, abi, bytecode, args = []) {
  return new web3.eth.Contract(abi).deploy({
    data: bytecode,
    arguments: args,
  })
  .send({ from, gas: 6e6 });
}

export const toContract = (web3, abi, address) => {
  return new web3.eth.Contract(abi, address);
}
