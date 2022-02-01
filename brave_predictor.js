function suggestFees (feeHistoryBlock, n_blocks) {

    const data = formatFeeHistory(feeHistoryBlock, true, n_blocks);

    // base fee is 12.5% higher than the gas fee defined in the pending block
    const baseFeePerGas = Number(data.pending[0].baseFeePerGas) * 1.125;

    const priorityFees = {
        fast: [],
        avg: [],
        slow: [],
    }

    // get all priority fees
    feeHistoryBlock.reward.map(fees => {
        priorityFees.fast.push(Number(fees[2]))
        priorityFees.avg.push(Number(fees[1]))
        priorityFees.slow.push(Number(fees[0]))    
    })

    // sort priority fees
    priorityFees.fast.sort()
    priorityFees.avg.sort()
    priorityFees.slow.sort()

    // calculate the avg priorty fee first to be the 40th percentile of the avg percentiles
    let avg_priority_fee = 0;
    const avg_percentile_index = priorityFees.avg.length * 0.4;
    avg_priority_fee = priorityFees.avg[avg_percentile_index]

    // re-adjust the percentiles for low down to the next non-equal value if possible    
    let slow_percentile_index = priorityFees.slow.length * 0.4;
    let slow_priority_fee = priorityFees.slow[slow_percentile_index];

    while (slow_percentile_index >= 1 && slow_priority_fee == avg_priority_fee) {
        slow_percentile_index--;
        slow_priority_fee = priorityFees.slow[slow_percentile_index];
    }

    // re-adjust the percentiles for high up to the next non-equal value if possible    
    let fast_percentile_index = priorityFees.fast.length * 0.4;
    let fast_priority_fee = priorityFees.fast[fast_percentile_index];
    
    while (fast_percentile_index < priorityFees.fast.length - 1 && fast_priority_fee == avg_priority_fee) {
        fast_percentile_index--;
        fast_priority_fee = priorityFees.fast[fast_percentile_index];
    }

    return {
        fast: baseFeePerGas + fast_priority_fee, 
        avg: baseFeePerGas + avg_priority_fee,
        slow: baseFeePerGas + slow_priority_fee
    }
}

function formatFeeHistory(result, includePending, n_blocks) {
    let blockNum = parseInt(result.oldestBlock, 16)
    let index = 0;
    const blocks = [];
    while (blockNum < parseInt(result.oldestBlock, 16) + n_blocks) {
        blocks.push({
        number: blockNum,
        baseFeePerGas: Number(result.baseFeePerGas[index]),
        gasUsedRatio: Number(result.gasUsedRatio[index]),
        priorityFeePerGas: result.reward[index].map(x => Number(x)),
      });
      blockNum += 1;
      index += 1;
    }
    let pending = [];
    if (includePending) {
      pending.push({
        number: "pending",
        baseFeePerGas: Number(result.baseFeePerGas[n_blocks]),
        gasUsedRatio: NaN,
        priorityFeePerGas: [],
      });
    }
    return {
        blocks: blocks,
        pending: pending
    };
  }


export { suggestFees };