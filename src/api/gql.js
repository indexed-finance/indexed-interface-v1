import { getIPFSFile } from './ipfs';
import { computeUniswapPairAddress } from '@indexed-finance/indexed.js/dist/utils/address';
import { NDX, WETH } from '../assets/constants/addresses';
import { SUBGRAPH_URLS } from '@indexed-finance/subgraph-clients/dist/constants';

const SUBGRAPH_URL_UNISWAP = SUBGRAPH_URLS[process.env.REACT_APP_ETH_NETWORK].uniswap;
const SUBGRAPH_URL_INDEXED = SUBGRAPH_URLS[process.env.REACT_APP_ETH_NETWORK].indexedCore;

const execRequest = (query, url = SUBGRAPH_URL_INDEXED) => fetch(
  url,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query })
  }
).then(r => r.json());

const proposalAndDistributionQuery = () => `
  {
    proposals(first: 25){
      id
      eta
      for
      startBlock
      against
      proposer
      expiry
      state
      title
      description
      signatures
      calldatas
      values
      targets
      votes {
        id
        voter
        option
        weight
      }
    }
    dailyDistributionSnapshots(first: 30) {
      id
		  active
      inactive
      delegated
      voters
    }
  }
`

const swapQuery = (poolAddress) => `
{
 	swaps(orderBy: timestamp, orderDirection: desc, where: { pool: "${poolAddress}" }) {
    id
    tokenIn
    tokenOut
    tokenAmountIn
    tokenAmountOut
    timestamp
  }
}
`

const categoryInfoQuery = (id) => `
{
  category(id: "${id}") {
    tokens {
      address: id
      symbol
      priceUSD
      name
    }
  }
}
`;

const categoryMetadataQuery = (id) => `
{
  category(id: "${id}") {
    metadataHash
  }
}
`;

export async function getCategoryMetadata(id) {
  const { data: { category } } = await execRequest(categoryMetadataQuery(id));
  return getIPFSFile(category.metadataHash);
}

const categoriesQuery = () => `
{
  categories {
    id
    metadataHash
    tokens {
      id
    }
    indexPools {
      id
      size
      totalSupply
    }
  }
}`

const ndxPair = computeUniswapPairAddress(WETH, NDX).toLowerCase()

const priceQuery = () => `
{
  pairs(where: { id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"}) {
    token0Price
  }
}`

const marketMetadataQuery = (pairAddress) => `
{
	pairs(where:{ id: "${pairAddress}" })
  {
    reserveETH
    token0Price
    token1Price
    volumeUSD
  }
}
`

const pairQuery = (pairAddress) => `
{
	swaps(orderBy: timestamp, orderDirection: desc, where:{ pair: "${pairAddress}"}) {
    transaction {
      id
    }
    pair {
      token0 {
        id
      }
      token1 {
        id
      }
    }
    amount0In
    amount1In
    amount0Out
    amount1Out
    timestamp
  }
}
`

export async function getTokenCategories() {
  let { data: { categories } } = await execRequest(categoriesQuery());

    for (let category of categories) {
    const { name, symbol, description } = await getIPFSFile(category.metadataHash);
    Object.assign(category, { name, symbol, description });
  }
  return categories;
}

export async function getSwaps(poolAddress) {
  let { data: { swaps } } = await execRequest(swapQuery(poolAddress));
  return swaps;
}

export async function getCategory(id) {
  let { data: { category } } = await execRequest(categoryInfoQuery(id));
  return category.tokens;
}

export async function getMarketMetadata(pairAddress) {
  const results = await execRequest(
    marketMetadataQuery(pairAddress.toLowerCase()),
    SUBGRAPH_URL_UNISWAP
  );
  const pairs = results?.data?.pairs || [] 
  return pairs[0];
}

export async function getMarketTrades(pairAddress) {
  const results = await execRequest(
    pairQuery(pairAddress.toLowerCase()),
    SUBGRAPH_URL_UNISWAP
  );
  const swaps = results?.data?.swaps || [] 
  return swaps;
}

export async function getProposals() {
  const { data } = await execRequest(proposalAndDistributionQuery());
  return { ...data  }
}

export async function getETHPrice() {
  const res = await execRequest(
    priceQuery(),
    SUBGRAPH_URL_UNISWAP
  );
  if (!res || !res.data) {
    return fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      }
    ).then(r => r.json()).then(({ ethereum }) => ethereum.usd)
    .catch(err => 0);
  }
  const { data: { pairs } } = res;
  return pairs[0]?.token0Price;
}
