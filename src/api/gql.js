import { getIPFSFile } from './ipfs';

const subgraph_url = 'https://api.thegraph.com/subgraphs/name/d1ll0n/indexed-rinkeby';
const uniswap_url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const market_url = 'https://api.thegraph.com/subgraphs/name/blockrockettech/uniswap-v2-subgraph-rinkeby'

const execRequest = (query, url = subgraph_url) => fetch(
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

const categoriesQuery = () => `
{
  categories {
    id
    metadataHash
    tokens
    indexPools {
      id
      size
      totalSupply
    }
  }
}
`;

const tokenQuery = (category) => `
{
  Tokens(where: { id: "${category}"}) {
  id
  }
}
`;

const poolQuery = (address) => `
{
  indexPools(where: { id: "${address}" }) {
    id
    size
    category { id }
    tokens {
      id
      balance
      token { id }
      denorm
      desiredDenorm
    }
    totalWeight
    totalSupply
  }
}
`;

const snapshotQuery = (address, timestampFrom, timestampTo) => `
{
  dailyPoolSnapshots(where: { pool: "${address}", timestamp_gt: "${timestampFrom}", timestamp_lt: "${timestampTo}" }) {
    id
    timestamp
    tokens { id }
    balances
  }
}
`;

// where: { date_gt: "${timestampFrom}", date_lt: "${timestampTo}" }

const tokenDayDataQuery = (tokenAddress, days) => `
{
  tokenDayDatas(orderBy: date, orderDirection: desc, first: ${days}, where: { token: "${tokenAddress}" }) {
    date
    priceUSD
  }
}
`

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

export async function getTokenCategories() {
  const { data: { categories } } = await execRequest(categoriesQuery());
  for (let category of categories) {
    const { name, symbol, description } = await getIPFSFile(category.metadataHash);
    Object.assign(category, { name, symbol, description });
  }
  return categories;
}

export async function getIndexPool(address) {
  const { data: { indexPools } } = await execRequest(poolQuery(address));
  return indexPools;
}

export async function getPoolSnapshots(address, timestampFrom, timestampTo) {
  const { data: { dailyPoolSnapshots } } = await execRequest(
    snapshotQuery(address, timestampFrom, timestampTo)
  );
  return dailyPoolSnapshots;
}

export async function getTokenPriceHistory(tokenAddress, days) {
  const { data: { tokenDayDatas } } = await execRequest(
    tokenDayDataQuery(tokenAddress, days),
    uniswap_url
  );
  return tokenDayDatas;
}

export async function getMarketMetadata(pairAddress) {
  const { data: { pairs } } = await execRequest(
    marketMetadataQuery(pairAddress.toLowerCase()),
    market_url
  );
  return pairs[0];
}
