function suggestFees (feeHistoryBlock, startF, increaseF) {
    
    let avg = 0;
    let n_blocks = feeHistoryBlock.baseFeePerGas.length;
    feeHistoryBlock.baseFeePerGas.map((fee, i) => {
        avg += parseInt(fee, 16) /n_blocks ;
    });

    return [{
        "maxFeePerGasBase": avg,
        "maxFeePerGasIncrease": (avg * startF * 4)/100,
        "maxFeePerGas": (avg + (avg * startF * 4)/100),
        "increaseFactor": startF * 4,
    },
    {
        "maxFeePerGasBase": avg,
        "maxFeePerGasIncrease": (avg * startF * 3)/100,
        "maxFeePerGas": (avg + (avg * startF * 3)/100),
        "increaseFactor": startF * 3,
    },
    {
        "maxFeePerGasBase": avg,
        "maxFeePerGasIncrease": (avg * startF * 2)/100,
        "maxFeePerGas": (avg + (avg * startF * 2)/100),
        "increaseFactor": startF * 2,
    },
    {
        "maxFeePerGasBase": avg,
        "maxFeePerGasIncrease": (avg * startF)/100,
        "maxFeePerGas": (avg + (avg * startF)/100),
        "increaseFactor": startF,
    }
    ];
}

function suggestPriorityFee (feeHistoryBlock,) {
    return "no_impl";
}

  export { suggestFees, suggestPriorityFee };