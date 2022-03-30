//const tf = require("@tensorflow/tfjs")
//import * as tf from "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"
import * as tf from "@tensorflow/tfjs"
tf.setBackend("cpu");

class Brain {
    constructor(inputs, hiddens, outputs) {
        this.inputs = inputs;
        this.hiddens = hiddens;
        this.outputs = outputs;

        // input
        this.network = tf.sequential()
        this.network.add(tf.layers.inputLayer({
            inputShape: inputs
        }))

        // hidden
        for (let i of hiddens) {
            this.network.add(tf.layers.dense({
                units: i, activation: 'relu',
                biasInitializer: tf.initializers.randomUniform({})
            }))
        }
        // output
        this.network.add(tf.layers.dense({
            units: outputs, activation: 'tanh',
            biasInitializer: tf.initializers.randomUniform({})
        }))
    }

    clone() {
        let brain = new Brain(this.inputs, this.hiddens, this.outputs);
        brain.network.setWeights(this.network.getWeights())
        return brain;
    }

    mutate(rate) {
        let weights = this.network.getWeights()
        for (let i in weights) {
            weights[i] = weights[i].add(tf.randomUniform(weights[i].shape, -rate, rate))
        }
        this.network.setWeights(weights)
    }

    feedForward(arr) {
        return this.network.predict(tf.tensor(arr).expandDims()).dataSync()
    }
}

export default Brain;