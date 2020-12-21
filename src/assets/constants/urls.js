export const SUBGRAPH_URL_INDEXED = process.env.REACT_APP_ETH_NETWORK === 'mainnet'
  ? 'https://api.thegraph.com/subgraphs/name/indexed-finance/indexed'
  : 'https://api.thegraph.com/subgraphs/name/indexed-finance/indexed-v1';

export const SUBGRAPH_URL_UNISWAP = process.env.REACT_APP_ETH_NETWORK === 'mainnet'
  ? 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
  : 'https://api.thegraph.com/subgraphs/name/samgos/uniswap-v2-rinkeby';