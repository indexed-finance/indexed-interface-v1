import { getIPFSFile } from './ipfs';
import { SUBGRAPH_URL_UNISWAP, SUBGRAPH_URL_INDEXED } from '../assets/constants/urls';

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
      for
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
      symbol
      priceUSD
      name
    }
  }
}
`;

const categoryMetadataQuery = (id) => `
{
  category(id: "0x${id.toString(16)}") {
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
  const { data: { pairs } } = await execRequest(
    marketMetadataQuery(pairAddress.toLowerCase()),
    SUBGRAPH_URL_UNISWAP
  );
  return pairs[0];
}

export async function getMarketTrades(pairAddress) {
  const { data: { swaps } } = await execRequest(
    pairQuery(pairAddress.toLowerCase()),
    SUBGRAPH_URL_UNISWAP
  );
  return swaps;
}

export async function getProposals() {
  const { data } = await execRequest(proposalAndDistributionQuery());
  return { ...data  }
}

export async function getETHPrice() {
  const { data: { pairs } } = await execRequest(
    priceQuery(),
    'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
  );
  return pairs[0].token0Price;
}
