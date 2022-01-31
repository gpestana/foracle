import Web3 from 'web3';
import { plot } from 'nodeplotlib';
import sleep from 'sleep';


import { suggestFees as zsolt_suggestFees } from './zsolt.js';
import { suggestFees as autoincrease_suggestFees } from './auto_increase.js'
import { suggestFees as alchemy_suggestFees } from './alchemy.js'

const infuraMainnet = "https://mainnet.infura.io/v3/d0840f1397c44189a8e44f08571de227"
const NUM_BLOCKS = 10;
const REWARD_PERCENTILES = [10, 50, 90];

var web3Provider = new Web3.providers.HttpProvider(infuraMainnet);
var provider = new Web3(web3Provider);

let block_heads = ["0xd75df0", "0xd75df2", "0xd75df4", "0xd75df6", "0xd75df8"];

let d1 = await generate_data(parseInt(block_heads[0], 16));
let d2 = await generate_data(parseInt(block_heads[1], 16));
let d3 = await generate_data(parseInt(block_heads[2], 16));

plot(d1);
plot(d2); 
plot(d3); 

// generates data to plot
async function generate_data(head_block) {
    // Result from `provider.eth.getFeeHistory(NUM_BLOCKS, HEAD_BLOCK, REWARD_PERCENTILES);`:
    // {
    //     "jsonrpc": "2.0",
    //     "id": 1,
    //     "result": {
    //       "baseFeePerGas": [
    //         "0x23d7c019f4",
    //         ...
    //       ],
    //       "gasUsedRatio": [
    //         0.03835086742259035,
    //         ...
    //       ],
    //       "oldestBlock": "0xd75db9",
    //       "reward": [
    //         [
    //           "0x59682f00",
    //           "0x77359400",
    //           "0x3f5476a00"
    //         ],
    //         ...
    //     }
    //   }
    var infura_feeHistory = await provider.eth.getFeeHistory(NUM_BLOCKS, head_block, REWARD_PERCENTILES);

    // zsolt oracle
    let zsolt_result = zsolt_suggestFees(infura_feeHistory);

    // autoincrease oracle
    let startF = 5;
    let increase = 5;
    let autoincrease_result = autoincrease_suggestFees(infura_feeHistory, startF, increase);

    // alchemy oracle
    let historicalBlocks = NUM_BLOCKS;
    let alchemy_result = alchemy_suggestFees(infura_feeHistory, historicalBlocks);

    // get real value of the gas base price we predicted above
    if (head_block == "latest") {
        console.log("Estimates for the latest block, wait to make sure new block is available...")
        sleep.sleep(30)
    }
    var realValue = await provider.eth.getFeeHistory(
        1, 
        parseInt(infura_feeHistory.oldestBlock, 16) + NUM_BLOCKS + 1, 
        REWARD_PERCENTILES
    );

    // plot results
    return [
        // real result
        {
            x: [1, 2, 3, 4],
            y: [
                realValue.baseFeePerGas[0],
                realValue.baseFeePerGas[0],
                realValue.baseFeePerGas[0],
                realValue.baseFeePerGas[0]
            ],
            type: 'scatter',
            name: "real value",
        },

        // zsolt_result
        {
        x: [1, 2, 3, 4],
        y: [
            zsolt_result[0].maxFeePerGas,
            zsolt_result[1].maxFeePerGas,
            zsolt_result[2].maxFeePerGas,
            zsolt_result[3].maxFeePerGas
        ],
        type: 'scatter',
        name: "zsolt prediction",
        },
        // autoincrease_result
        {
        x: [1, 2, 3, 4],
        y: [
            autoincrease_result[0].maxFeePerGas,
            autoincrease_result[1].maxFeePerGas,
            autoincrease_result[2].maxFeePerGas,
            autoincrease_result[3].maxFeePerGas
        ],
        type: 'scatter',
        name: "autoincrease prediction",
        },
        // alchemy_result
        {
            x: [1, 2, 3, 4],
            y: [
                alchemy_result[0],
                alchemy_result[1],
                alchemy_result[2],
            ],
            type: 'scatter',
            name: "alchemy prediction",
        },
    ];
}


