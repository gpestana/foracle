function suggestFees (feeHistoryBlock, historicalBlocks) {

    const blocks = formatFeeHistory(feeHistoryBlock, false, historicalBlocks);

    const slow    = avg(blocks.map(b => b.priorityFeePerGas[0]));
    const average = avg(blocks.map(b => b.priorityFeePerGas[1]));
    const fast    = avg(blocks.map(b => b.priorityFeePerGas[2]));

    const baseFeePerGas = Number(blocks[0].baseFeePerGas);

    return [fast + baseFeePerGas, average + baseFeePerGas, slow + baseFeePerGas,]
}

function suggestPriorityFee (feeHistoryBlock) {
    return "no_impl";
}

function formatFeeHistory(result, includePending, historicalBlocks) {
    // let blockNum = result.oldestBlock;
    let blockNum = parseInt(result.oldestBlock, 16)
    let index = 0;
    const blocks = [];
    while (blockNum < parseInt(result.oldestBlock, 16) + historicalBlocks) {
        blocks.push({
        number: blockNum,
        baseFeePerGas: Number(result.baseFeePerGas[index]),
        gasUsedRatio: Number(result.gasUsedRatio[index]),
        priorityFeePerGas: result.reward[index].map(x => Number(x)),
      });
      blockNum += 1;
      index += 1;
    }
    if (includePending) {
      blocks.push({
        number: "pending",
        baseFeePerGas: Number(result.baseFeePerGas[historicalBlocks]),
        gasUsedRatio: NaN,
        priorityFeePerGas: [],
      });
    }
    return blocks;
  }

function avg(arr) {
    const sum = arr.reduce((a, v) => a + v);
    return Math.round(sum/arr.length);
}

export { suggestFees, suggestPriorityFee };