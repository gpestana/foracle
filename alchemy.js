// Estimator based on https://docs.alchemy.com/alchemy/guides/eip-1559/gas-estimator
// baseFeeGas is fetched from "pending" block. Average of past rewards are used as slow/avg/fast indicators
function suggestFees (feeHistoryBlock, n_blocks) {

    const blocks = formatFeeHistory(feeHistoryBlock, false, n_blocks);

    const slow    = avg(blocks.map(b => b.priorityFeePerGas[0]));
    const average = avg(blocks.map(b => b.priorityFeePerGas[1]));
    const fast    = avg(blocks.map(b => b.priorityFeePerGas[2]));

    // base fee gas of the pending block (already defined)
    const baseFeePerGas = Number(blocks[0].baseFeePerGas);

    return {
        fast: fast + baseFeePerGas, 
        avg: average + baseFeePerGas,
        slow: slow + baseFeePerGas
    }
}

function formatFeeHistory(result, includePending, n_blocks) {
    // let blockNum = result.oldestBlock;
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
    if (includePending) {
      blocks.push({
        number: "pending",
        baseFeePerGas: Number(result.baseFeePerGas[n_blocks]),
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

export { suggestFees };