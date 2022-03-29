import { clone, random, multiply, add } from "mathjs";

var mutationRate = 0.05;
var randomValueRange = 0.5;

function LeakyReLU(array) {
    for (var i = 0; i < array.length; ++i) {
        array[i][0] = Math.max(array[i][0] * 0.01, array[i][0]);
    }
}

function Tanh(array) {
    for (var i = 0; i < array.length; ++i) {
        array[i][0] = Math.tanh(array[i][0]);
    }
}

class Brain {
    constructor(inputs, hidden, outputs) {
        if (inputs instanceof Brain) {
            this.cloneWithMutation(inputs);
        }
        else {
            this.instantiateNewBrain(inputs, hidden, outputs);
        }
    }

    instantiateNewBrain(inputs, hidden, outputs) {
        this.weights = [];
        this.biases = [];

        var last_size = inputs
        for (var h of hidden) {
            this.weights.push(random([h, last_size], -randomValueRange, randomValueRange));
            this.biases.push(random([h, 1], -randomValueRange, randomValueRange));
            last_size = h
        }
        console.log(outputs)
        this.weights.push(random([outputs, last_size], -randomValueRange, randomValueRange));
        this.biases.push(random([outputs, 1], -randomValueRange, randomValueRange));
    }

    cloneWithMutation(brain) {
        this.weights = [];
        this.biases = [];
        for (var i = 0; i < brain.weights.length; ++i) {
            this.weights.push(clone(brain.weights[i]))
            this.biases.push(clone(brain.biases[i]))
            var first = this.weights[i].length;
            var second = this.weights[i][0].length;
            var rand_w = random([first, second], -mutationRate * randomValueRange, mutationRate * randomValueRange);
            var rand_b = random([first, 1], -mutationRate * randomValueRange, mutationRate * randomValueRange);
            this.weights[i] = add(this.weights[i], rand_w);
            this.biases[i] = add(this.biases[i], rand_b);
        }
    }

    feedForward(inputs) {
        var output = inputs;
        for (var i = 0; i < this.weights.length; ++i) {
            output = multiply(this.weights[i], output);
            output = add(output, this.biases[i]);
            if (i < this.weights.length) {
                LeakyReLU(output);
                //Tanh(output);
            }
            else {
                Tanh(output);
            }
        }
        return output
    }
}

export default Brain;
