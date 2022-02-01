import Web3 from 'web3';
import { plot } from 'nodeplotlib';
import sleep from 'sleep';


import { suggestFees as zsolt_suggestFees } from './zsolt.js';
//import { suggestFees as autoincrease_suggestFees } from './auto_increase.js'
import { suggestFees as alchemy_suggestFees } from './alchemy.js'
import {suggestFees as bpredictor_suggesteFees } from './brave_predictor.js'

const NUM_BLOCKS = 40;
const REWARD_PERCENTILES = [20, 50, 80];

if (!process.env.NET_ENDPOINT) {
    console.log("NET_ENDPOINT env variable should be defined. E.g 'https://mainnet.infura.io/v3/...'")
    process.exit(0)
}

var web3Provider = new Web3.providers.HttpProvider(process.env.NET_ENDPOINT);
var provider = new Web3(web3Provider);

let predicted = await generate_data("latest");
plot(predicted.data, { title: "Block " + predicted.title });

// generates data to plot from multiple prediction algorithms
async function generate_data(head_block) {
    var infura_pendingBlock = await provider.eth.getFeeHistory(NUM_BLOCKS, "pending", REWARD_PERCENTILES);
    var infura_feeHistory = await provider.eth.getFeeHistory(NUM_BLOCKS, head_block, REWARD_PERCENTILES);

    // zsolt oracle
    let zsolt_result = zsolt_suggestFees(infura_feeHistory);
    console.log("zsolt_result", zsolt_result)

    // // autoincrease oracle
    // let startF = 5;
    // let increase = 5;
    // let autoincrease_result = autoincrease_suggestFees(infura_feeHistory, startF, increase);
    // console.log("autoincrease_result", autoincrease_result)

    // alchemy oracle
    let alchemy_result = alchemy_suggestFees(infura_pendingBlock, NUM_BLOCKS);
    console.log("alchemy_result", alchemy_result)
    
    // brave_predictor oracle
    let bpredictor_result = bpredictor_suggesteFees(infura_pendingBlock, NUM_BLOCKS);
    console.log("bpredictor_result", bpredictor_result)

    let realValue = []
    while (realValue.length == 0) {
        try {
            realValue = await getRealValue(infura_feeHistory.oldestBlock);
        } catch (e) {
            console.log(">> New block "+ infura_feeHistory.oldestBlock +" not minted yet, trying again in 15s.. ");
            console.log("  ("+e.message+")")
            sleep.sleep(15)
        }
    }

    let finalRealValue = {
        fast: parseInt(realValue.baseFeePerGas[0], 16) + parseInt(realValue.reward[0][2], 16),
        avg:  parseInt(realValue.baseFeePerGas[0], 16) + parseInt(realValue.reward[0][1], 16),
        slow:  parseInt(realValue.baseFeePerGas[0], 16) + parseInt(realValue.reward[0][0], 16)
    }

    let data = [
        // real result
        {
            x: [1, 2, 3],
            y: [
                finalRealValue.fast,
                finalRealValue.avg,
                finalRealValue.slow,
            ],
            type: 'scatter',
            name: "real value",
        },

        // zsolt_result
        {
        x: [1, 2, 3],
        y: [
            zsolt_result.fast,
            zsolt_result.avg,
            zsolt_result.slow,
        ],
        type: 'scatter',
        name: "zsolt prediction",
        },
        // bpredictor_result
        {
        x: [1, 2, 3],
        y: [
            bpredictor_result.fast,
            bpredictor_result.avg,
            bpredictor_result.slow,
        ],
        type: 'scatter',
        name: "brave wallet prediction",
        },
        // alchemy_result
        {
            x: [1, 2, 3],
            y: [
                alchemy_result.fast,
                alchemy_result.avg,
                alchemy_result.slow,
            ],
            type: 'scatter',
            name: "alchemy prediction",
        },
    ];

    return {
        data: data,
        title: infura_feeHistory.oldestBlock,
    }
}

async function getRealValue(block_head) {
    return await provider.eth.getFeeHistory(
        1, 
        parseInt(block_head, 16) + NUM_BLOCKS + 1, 
        REWARD_PERCENTILES
    )
}
