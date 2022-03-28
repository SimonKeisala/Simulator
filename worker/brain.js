var ROTATION    = 0;
var X_DIRECTION = 1;
var Y_DIRECTION = 2;
var EAT         = 3;
var SPLIT       = 4;
var TOTAL       = 5;

var mutationRate = 0.05;
var randomValueRange = 0.5;

function RandomInt(low = 0, high = 1) {
    return Math.floor(Math.random()*(high-low+1)+low);
}

function activationFunctionLeakyReLU(array) {
    for (var i = 0; i < array.length; ++i) {
        array[i][0] = Math.max(array[i][0]*0.01, array[i][0]);
    }
}
function activationFunctionTanh(array) {
    for (var i = 0; i < array.length; ++i) {
        array[i][0] = Math.tanh(array[i][0]);
    }
}
class Brain {

    constructor(inputs, outputs) {
        this.intermediate = null;
        if (inputs instanceof Brain) {
            this.cloneWithMutation(inputs);
        }
        else {
            this.instantiateNewBrain(inputs, outputs);
        }
    }

    instantiateNewBrain(inputs, outputs) {

        // Create input layer having 'input'+1 values (+1 for bias)
        this.inputs = math.ones([inputs+1,1]);

        // Create the weights
        this.weights = [];

        // Create one weight matrix with 5-50 outputs (dummy weights)
        var outputs = RandomInt(5,50);
        this.weights.push(math.random([outputs, inputs+1],-randomValueRange,randomValueRange));
        inputs = outputs;
        outputs = TOTAL;
        this.weights.push(math.random([TOTAL, inputs+1],-randomValueRange,randomValueRange));

        this.output = math.zeros(this.weights[this.weights.length-1].length,1);
    }

    cloneWithMutation(brain) {
        this.inputs = math.ones([brain.inputs.length, 1]);
        this.weights = brain.weights;
        this.output = math.zeros(brain.weights[brain.weights.length-1].length,1);
        for (var i = 0; i < this.weights.length; ++i) {
            var first  = this.weights[i].length;
            var second = this.weights[i][0].length;
            var rand = math.random([first, second], -mutationRate*randomValueRange, mutationRate*randomValueRange);
            this.weights[i] = math.add(this.weights[i], rand);
        }
    }

    feedForward() {
        this.output = this.inputs;
        for (var i = 0; i < this.weights.length; ++i) {
            this.output = math.multiply(this.weights[i], this.output);
            if (i < this.weights.length-1)
            {
                //activationFunctionLeakyReLU(this.output);
                activationFunctionTanh(this.output);
                this.output.push([1]);
            }
            else {
                activationFunctionTanh(this.output);
            }
        }
    }

    calculateIntermediates() {
        var intermediates = [];
        var inter = math.multiply(this.weights[0], this.inputs);
        activationFunction(inter);
        inter.push([1]);
        intermediates.push(inter);

        for (var i = 1; i < this.weights.length; ++i) {
            inter = math.multiply(this.weights[i], inter);
            if (i < this.weights.length-1)
            {
                activationFunctionLeakyReLU(inter);
                this.output.push([1]);
            }
            else {
                activationFunctionTanh(inter);
            }
            intermediates.push(inter)
        }


        return intermediates;
    }
    get(index) {
        if (this.output != undefined && index >= 0 && index < this.output.length) {
            return this.output[index][0];
        }
        return 0;
    }
}
