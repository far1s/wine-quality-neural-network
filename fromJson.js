const { NeuralNetwork } = require("brain.js");
const _ = require('lodash');
const fs = require('fs');

console.time("time to finish");

// 1. PREPARE DATA
const raw = fs.readFileSync('./winequality-white.csv', 'utf8').split('\n');
const headers = raw[0].split(';').map(header => header.replace(/"/g, ''));

// since brain.js only accepts values between 0-1 we have to adjust our data
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

// 2. TRAIN THE NETWORK FROM JSON
const net = new NeuralNetwork();
net.fromJSON(
    JSON.parse(fs.readFileSync('./net.json', 'utf8'))
);
const nrTrainingData = 1000;

// 3. TEST THE NETWORK
let error = 0;
for (let i = 0; i < 50; ++i) {
    const currentItem = data[nrTrainingData + i];
    const { quality } = net.run(
        _.omit(currentItem, ['quality'])
    );
    error += Math.abs(quality - currentItem.quality);
    console.log(i, quality, currentItem.quality);
}

console.log('Average error', error / 50);

console.timeEnd("time to finish");
