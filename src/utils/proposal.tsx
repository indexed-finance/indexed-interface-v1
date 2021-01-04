import React from 'react'
import { JsonFragment } from "@ethersproject/abi";

import { Interface } from 'ethers/lib/utils';

import { DAO, CONTROLLER, STAKING_FACTORY } from '../assets/constants/addresses'

const GovernorAlpha = require('../assets/constants/abi/GovernorAlpha.json').abi;
const MarketCapSqrtController = require('../assets/constants/abi/MarketCapSqrtController.json').abi;
const StakingRewardsFactory = require('../assets/constants/abi/StakingRewardsFactory.json');

const ContractNames = {
  [CONTROLLER.toLowerCase()]: 'Index Pool Controller',
  [STAKING_FACTORY.toLowerCase()]: 'Staking Factory',
  '0x17ac188e09a7890a1844e5e65471fe8b0ccfadf3': 'CC10',
  '0xfa6de2697d59e88ed7fc4dfe5a33dac43565ea41': 'DEFI5',
  '0x8dcba0b75c1038c4babbdc0ff3bd9a8f6979dd13': 'ETH-DEFI5',
  '0x2701ea55b8b4f0fe46c15a0f560e9cf0c430f833': 'ETH-CC10',
  [DAO.toLowerCase()]: 'Indexed Governor'
};

const ContractABIs = {
  [CONTROLLER.toLowerCase()]: MarketCapSqrtController,
  [STAKING_FACTORY.toLowerCase()]: StakingRewardsFactory,
  [DAO.toLowerCase()]: GovernorAlpha
};

interface ProposalCallData {
  signatures: string[];
  calldatas: string[];
  targets: string[];
  values: number[];
}

interface ContractCall {
  target: string;
  targetName: string;
  signature: string;
  value: number;
  paramsDisplay: string;
}

export function parseProposalCalls(proposal: ProposalCallData): ContractCall[] {
  const calls: ContractCall[] = [];
  for (let i = 0; i < proposal.signatures.length; i++) {
    let signature = proposal.signatures[i];
    const target = proposal.targets[i];
    const calldata = proposal.calldatas[i];
    const value = proposal.values[i];
    const abi = ContractABIs[target];
    let targetName = ContractNames[target.toLowerCase()] || target;
    let paramsDisplay = '';
    if (abi) {
      const iface = new Interface(abi);
      try {
        let sigHash: string;
        if (signature) {
          sigHash = iface.getSighash(signature);
        } else {
          sigHash = calldata.slice(0, 10);
        }
        const fn = iface.getFunction(sigHash);
        const params = [...iface.decodeFunctionData(fn, sigHash.concat(calldata.slice(2)))];
        for (let i = 0; i < params.length; i++) {
          if (fn.inputs[i].type === 'address') {
            const name = ContractNames[params[i].toLowerCase()];
            if (name) params[i] = `${params[i]} (${name})`;
          }
        }
        paramsDisplay = params.join(', ');
      } catch (err) {
        paramsDisplay = calldata;
      }
    }
    calls.push({
      target,
      targetName,
      signature,
      value,
      paramsDisplay
    });
  }
  return calls;
}

export type ProposalState = 'active' | 'expired' | 'canceled' | 'queued' | 'executed';

const proposalStates = {
  0: 'active',
  1: 'canceled',
  2: 'queued',
  3: 'executed'
};

export function getProposalState(proposal: any, latestBlock: number): ProposalState {
  console.log(`getProposalState::: ${proposal.expiry} :: ${latestBlock}`)
  const state = proposalStates[proposal.state];
  if (state === 'active' && proposal.expiry <= latestBlock) {
    return 'expired';
  }
  return state;
}

