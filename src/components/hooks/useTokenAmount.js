import React, { useEffect, useState, useContext } from 'react'
import { formatBalance, toTokenAmount, toWei, BigNumber, toHex } from '@indexed-finance/indexed.js/dist/utils/bignumber';
import { store } from '../../state'
import { getERC20 } from '../../lib/erc20';

const BN_ZERO = new BigNumber(0);

/**
 * Hook to use token data, react to changes and compute display values
 */
export function useTokenAmount({
  address,
  symbol,
  decimals,
  selected: initialSelected,
  amount: initialAmount,
  balance: initialBalance,
  allowance: initialAllowance
}) {
  const [balance, setBalance] = useState(initialBalance || BN_ZERO);
  const [amount, setAmount] = useState(initialAmount || BN_ZERO);
  const [allowance, setAllowance] = useState(initialAllowance || BN_ZERO);
  const [selected, setSelected] = useState(initialSelected || false);

  const setExact = (exactAmount) => {
    setAmount(new BigNumber(exactAmount));
  }

  const setInput = (inputAmount) => {
    const exactAmount = toTokenAmount(inputAmount, decimals);
    setAmount(exactAmount);
  };

  const updateTokensSpent = (spentValue) => {
    const spentAmount = new BigNumber(spentValue);
    const newBalance = balance.minus(spentAmount);
    const newAllowance = allowance.minus(spentAmount);
    setBalance(newBalance);
    setAllowance(newAllowance);
  }

  let displayAmount = formatBalance(amount, decimals, 4);
  let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
  let approvalNeeded = approvalRemainder.gt(BN_ZERO);

  return {
    address,
    symbol,
    displayAmount,
    approvalRemainder,
    approvalNeeded,
    selected,

    balance: toHex(balance),
    amount: toHex(amount),
    allowance: toHex(allowance),

    updateTokensSpent,
    setSelected,
    setExact,
    setInput,

    bind: {
      value: displayAmount,
      onChange: (event) => {
        event.preventDefault();
        setInput(event.target.value);
      }
    }
  }
}

export function useTokenAmounts(tokens, targetAddress) {
  const [balances, setBalances] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [selected, setSelected] = useState([]);
  const [ output, setOutput ] = useState([])

  let { state: { web3, account } } = useContext(store)

  const setExact = (i, exactAmount) => {
    let newAmounts = [...amounts ];
    newAmounts[i] = new BigNumber(exactAmount);
    setAmounts(newAmounts);
  };

  const setInput = (i, decimals, inputAmount) => {
    let newAmounts = [...amounts ];
    newAmounts[i] = toTokenAmount(inputAmount, decimals);
    setAmounts(newAmounts);
  };

  const updateTokensSpent = (i, spentTokens) => {
    let newBalances = [...balances ];
    let newAllowances = [...allowances ];
    const spentAmount = new BigNumber(spentTokens);
    newBalances[i] = newBalances[i].minus(spentAmount);
    newAllowances[i] = newAllowances[i].minus(spentAmount);
    setBalances(newBalances);
    setAllowances(newAllowances);
  };

  const toggleToken = (i) => {
    let tokenWasSelected = selected[i];
    let newSelected = new Array(tokens.length).fill(false);
    newSelected[i] = !tokenWasSelected;
    // if token is already selected, disable it
    // if token is not selected, disable all others
    setSelected(newSelected);
  }

  useEffect(() => {
    let newBalances = [];
    let newAmounts = [];
    let newAllowances = [];
    let newSelected = [];
    // initialSelected || false
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      const {
        amount: initialAmount,
        balance: initialBalance,
        allowance: initialAllowance
      } = token;


      newBalances.push(new BigNumber(initialBalance || BN_ZERO ));
      newAmounts.push(new BigNumber(initialAmount || BN_ZERO ));
      newAllowances.push(new BigNumber(initialAllowance || BN_ZERO ));
      newSelected.push(true);

      setAllowances(newAllowances);
      setSelected(newSelected);
      setBalances(newBalances);
      setAmounts(newAmounts);
    }
  }, [ tokens ]);

  useEffect(() => {
    let outTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const { decimals, address, symbol } = tokens[i];
      let amount = amounts[i];
      let balance = balances[i];
      let allowance = allowances[i];

      let displayAmount = formatBalance(amount, decimals, 4);

      let approvalRemainder = allowance.gte(amount) ? BN_ZERO : amount.minus(allowance);
      let approvalNeeded = approvalRemainder.gt(BN_ZERO);

      const approveRemainder = async (target) => {
        const erc20 = getERC20(web3.rinkeby, address);
        if (approvalRemainder.gte(0)) {
          await erc20.methods.approve(target, approvalRemainder).send({ from: account });
        }
      }

      balance = toHex(balance);
      amount = toHex(amount);
      allowance = toHex(allowance);

      outTokens.push({
        decimals,
        address,
        symbol,
        displayAmount,
        selected,
        balance,
        amount,
        allowance,
        approvalNeeded,
        approvalRemainder,

        updateTokensSpent: (spentTokens) => updateTokensSpent(i, spentTokens),
        toggleSelect: () => toggleToken(i),
        setExact: (amount) => setExact(i, amount),
        setInput: (amount) => setInput(i, decimals, amount),

        bind: {
          value: displayAmount,
          onChange: (event) => {
            event.preventDefault();
            setInput(event.target.value);
          }
        }
      });
    }
    setOutput(outTokens)
  }, [ amounts, balances, allowances, selected ]);

  let selectedTokens = [];
  for (let i = 0; i < selected.length; i++) {
    if (selected[i]) {
      selectedTokens.push(output[i]);
    }
  }

  return {
    tokens: output,
    selectedTokens,
    amounts,
    setAmounts,
  };
}
