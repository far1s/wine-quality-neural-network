const { NeuralNetwork } = require("brain.js");
const _ = require('lodash');
const fs = require('fs');

console.time("time to finish");

// 1. PREPARE DATA
const raw = fs.readFileSync('./winequality-white.csv', 'utf8').split('\n');
const headers = raw[0].split(';').map(header => header.replace(/"/g, ''));

const data = raw
    .slice(1)
    .map(line =>
        line.split(';')
        // Ensure that numeric values are between 0 and 1
        .reduce((accumulator, currentValue, index) => {
            if (
                headers[index].includes('sulfur') ||
                headers[index].includes('sugar')
            ) {
                accumulator[headers[index]] = parseFloat(currentValue) / 1000;
            } else if (headers[index].includes('alcohol')) {
                accumulator[headers[index]] = parseFloat(currentValue) / 100;
            } else {
                // Quality will be 0.1-1 rather than 1-10
                accumulator[headers[index]] = parseFloat(currentValue) / 10;
            }
            return accumulator;
        }, {})
    );

// 2. TRAIN THE NETWORK
const net = new NeuralNetwork();
const nrTrainingData = 1000;

const trainingData = data
    .slice(1, nrTrainingData)
    .map(object => ({
        input: _.omit(object, ['quality']),
        output: _.pick(object, ['quality'])
    }));

console.log('trainingData: ', trainingData[0]);

net.train(trainingData);


// 3. TEST THE NETWORK
let error = 0;
/**
 * running neural network for 50 items
 * taking every column as input except for quality
 * then comparing real quality with output from neural network
*/
for (let i = 0; i < 50; ++i) {
    const currentItem = data[nrTrainingData + i];
    const { quality } = net.run(
        _.omit(currentItem, ['quality'])
    );
    error += Math.abs(quality - currentItem.quality);
    console.log(i, quality, currentItem.quality);
}

console.log('Average error', error / 50);

console.log('done');

console.timeEnd("time to finish");
