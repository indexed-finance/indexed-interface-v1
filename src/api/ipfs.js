import multihashes from 'multihashes';
import CID from 'cids';
import { digest } from 'multihashing';
import { soliditySha3 } from 'web3-utils';

const detJSON = require('./deterministicJSON');

const gatewayUrl = 'https://gateway.temporal.cloud/ipfs/';

function sha3(value) {
  return soliditySha3(value);
}

// function sha3Bytes(value) {
  // return soliditySha3({ t: 'bytes', v: value });
// }

// function jsonSha3(obj) {
//   const json = detJSON(obj);
//   const buf = Buffer.from(json)
//   return '0x' + digest(buf, 'sha3-256').toString('hex')
// }

export function toMh(shaHash) {
  const buf = Buffer.from(shaHash, 'hex');
  return multihashes.encode(buf, 'sha3-256');
}

export function toCid(mh) {
  const cid = new CID(1, 'raw', Buffer.from(mh, 'hex'), 'base32');
  return cid.toBaseEncodedString();
}

export function shaToCid(hash) {
  return toCid(Buffer.from(toMh(hash.slice(2))).toString('hex'))
}

export function hash(encodedCall) {
  const eth = sha3(encodedCall);
  const ipfs = shaToCid(eth);
  return {eth, ipfs};
}

export function hashJSON(obj) {
  const json = detJSON(obj);
  const buf = Buffer.from(json);
  const sha3Hash = '0x' + digest(buf, 'sha3-256').toString('hex');
  const ipfsHash = shaToCid(sha3Hash);
  return { json, sha3Hash, ipfsHash };
}

export function getIPFSFile(sha3Hash) {
  const ipfsHash = shaToCid(sha3Hash);
  const url = `${gatewayUrl}${ipfsHash}`;
  return fetch(url).then(r => r.json())
}
