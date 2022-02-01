// Calculates the average baseFeePerGas of the previous N blocks and adds `increaseFactor` percentage;
// The percentile rewards define the slow/avg/fast and are defined by the last seen block 
function suggestFees (feeHistoryBlock, increaseFactor) {
    let avgFee = 0;
    let rewards = [0, 0, 0];

    let n_blocks = feeHistoryBlock.baseFeePerGas.length;

    // baseFee avg
    feeHistoryBlock.baseFeePerGas.map((fee, i) => {
        avgFee += parseInt(fee, 16) /n_blocks;
    });

    let baseFee = avgFee + (increaseFactor * avgFee /100);

    let fast = parseInt(feeHistoryBlock.reward[0][2], 16);
    let avg = parseInt(feeHistoryBlock.reward[0][1], 16);
    let slow = parseInt(feeHistoryBlock.reward[0][0], 16);

    return {
        fast: baseFee + fast,
        avg: baseFee + avg,
        slow: baseFee + slow,
      }
}

export { suggestFees };