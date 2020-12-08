import { getIPFSFile } from './ipfs';

let uniswap_url, subgraph_url;
if (process.env.REACT_APP_ETH_NETWORK === 'rinkeby') {
  subgraph_url = 'https://api.thegraph.com/subgraphs/name/indexed-finance/indexed-v1';
  uniswap_url = 'https://api.thegraph.com/subgraphs/name/samgos/uniswap-v2-rinkeby';
} else {
  subgraph_url = 'https://api.thegraph.com/subgraphs/name/indexed-finance/indexed';
  uniswap_url = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
}

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

const proposalAndDistributionQuery = () => `
  {
    proposals(first: 25){
      id
      for
      against
      description
      expiry
      state
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

const stakingQuery = () => `
{
  ndxStakingPools(first: 5) {
    id
    startsAt
		isReady
    indexPool
    stakingToken
    totalSupply
    periodFinish
    lastUpdateTime
    totalRewards
    claimedRewards
    rewardRate
  }
}
`

const stakeQuery = (stakingAddress, isWethPair) => (`
{
  ndxStakingPools(where: { indexPool: "${stakingAddress}", isWethPair: ${isWethPair}}) {
    id
    startsAt
		isReady
    indexPool
    stakingToken
    totalSupply
    periodFinish
    lastUpdateTime
    totalRewards
    claimedRewards
    rewardRate
  }
}
`);

const proposalQuery = id => `
  {
    proposals(where: { id: "${id}" }){
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
  }
`

const categoryMetadataQuery = (id) => `
{
  category(id: "0x${id.toString(16)}") {
    metadataHash
  }
}
`;

export async function getCategoryMetadata(id) {
  console.log(`C ID ${id} H 0x${id.toString(16)}`)
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
    exchanges(where: { id:"0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667"}) {
      price
    }
  }
`

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

const initializerQuery = (poolAddress) => `
{
  poolInitializers(where: { pool: "${poolAddress}" }) {
    id
    totalCreditedWETH
    pool {
      id
    }
    tokens {
      id
    }
  }
}
`

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

const pairQuery = (pairAddress) => `
{
	swaps(where:{ pair: "${pairAddress}"}) {
    transaction {
      id
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

export async function getIndexPool(address) {
  let { data: { indexPools } } = await execRequest(poolQuery(address));
  return indexPools;
}

export async function getUnitializedPool(address) {
  const { data: { poolInitializers } } = await execRequest(initializerQuery(address));
  return poolInitializers;
}

export async function getStakingPools() {
  const { data: { ndxStakingPools } } = await execRequest(stakingQuery());
  return ndxStakingPools;
}

export async function getStakingPool(poolAddress, isWethPair) {
  const { data: { ndxStakingPools } } = await execRequest(stakeQuery(poolAddress, isWethPair));
  return ndxStakingPools[0];
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
    uniswap_url
  );
  return pairs[0];
}

export async function getMarketTrades(pairAddress) {
  const { data: { swaps } } = await execRequest(
    pairQuery(pairAddress.toLowerCase()),
    uniswap_url
  );
  return swaps;
}

export async function getProposal(id) {
  const { data: { proposals } } = await execRequest(proposalQuery(id));

  return proposals[0]
}

export async function getProposals() {
  const { data } = await execRequest(proposalAndDistributionQuery());

  return { ...data  }
}

export async function getETHPrice() {
  const { data: { exchanges } } = await execRequest(
    priceQuery(),
    uniswap_url
  );
return exchanges[0];
}
