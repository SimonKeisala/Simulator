import Brain from "../utilities/brain"
import { tanh, max, min, atan2, sign, sqrt, random, abs, sin, cos, pi } from "mathjs"

import Quadtree from "../utilities/quadtree"
var InstanceCounter = 0;
var lines = []

var Objects = {}
var DataGroups = {}
var Quadtrees = {}
function ResetStates() {
    lines = []
    for (let tree in Quadtrees) {
        if (Quadtrees[tree][0]) {
            for (let obj of Objects[tree]) {
                let pos = obj.GetPosition();
                Quadtrees[tree][1].insert(obj, [pos[0], pos[1], pos[0], pos[1]])
            }
        }
    }
}

class GameInstance {
    constructor(group, position = [0, 0], rotation = 0) {
        this.__id = InstanceCounter++;

        if (!(group in DataGroups)) {
            DataGroups[group] =
            {
                positions: [],
                rotations: [],
                scales: [],
                colors: []
            };
            Objects[group] = []
            Quadtrees[group] = [true, new Quadtree([-500, -500, 500, 500])]
        }

        // Add oneself to the group
        this.__group = DataGroups[group];
        this.__instanceGroup = Objects[group];
        this.__groupIndex = this.__instanceGroup.length;
        this.__instanceGroup.push(this);
        this.__qtree = Quadtrees[group];
        this.selected = false;


        // Add the instance's position, rotation scale and color
        this.__group.positions.push(position[0]);
        this.__group.positions.push(position[1]);
        this.__group.rotations.push(rotation);
        this.__group.scales.push(1);
        this.__group.colors.push(0);
        this.__group.colors.push(0);
        this.__group.colors.push(0);
    }

    Remove() {
        if (this.__group) {
            for (var i = this.__groupIndex + 1; i < this.__instanceGroup.length; ++i) {
                this.__instanceGroup[i].__groupIndex = i - 1;
            }
            this.__instanceGroup.splice(this.__groupIndex, 1);
            this.__group.positions.splice(this.__groupIndex * 2, 2);
            this.__group.rotations.splice(this.__groupIndex, 1);
            this.__group.scales.splice(this.__groupIndex, 1);
            this.__group.colors.splice(this.__groupIndex * 3, 3);
            this.__qtree[0] = true;
        }
    }

    Turn(angle) {
        let rotation = this.__group.rotations[this.__groupIndex] + angle;
        if (abs(rotation) > pi) {
            rotation -= pi * 2 * sign(rotation);
        }
        this.__group.rotations[this.__groupIndex] = rotation;
    }

    Move(distance, strife = 0, max_speed) {
        this.__group.positions[this.__groupIndex * 2] += max_speed * distance * sin(this.__group.rotations[this.__groupIndex]);
        this.__group.positions[this.__groupIndex * 2] += max_speed / 2 * strife * sin(this.__group.rotations[this.__groupIndex] + pi / 2);
        this.__group.positions[this.__groupIndex * 2 + 1] += max_speed * distance * cos(this.__group.rotations[this.__groupIndex]);
        this.__group.positions[this.__groupIndex * 2 + 1] += max_speed / 2 * strife * cos(this.__group.rotations[this.__groupIndex] + pi / 2);
        this.__qtree[0] = true;
    }


    GetColor() {
        return this.__group.colors.slice(this.__groupIndex * 3, this.__groupIndex * 3 + 3);
    }
    SetColor(color) {
        for (var i = 0; i < 3; ++i) {
            this.__group.colors[this.__groupIndex * 3 + i] = color[i];
        }
    }
    GetPosition() {
        return [
            this.__group.positions[this.__groupIndex * 2],
            this.__group.positions[this.__groupIndex * 2 + 1]
        ];
    }
    SetPosition(x, y) {
        this.__group.positions[this.__groupIndex * 2] = x;
        this.__group.positions[this.__groupIndex * 2 + 1] = y;
        this.__qtree[0] = true;
    }
    GetRotation() {
        return this.__group.rotations[this.__groupIndex];
    }
    GetScale() {
        return this.__group.scales[this.__groupIndex];
    }

    SetScale(val) {
        this.__group.scales[this.__groupIndex] = val;
    }

    GetID() {
        return this.__id;
    }
}


class Food extends GameInstance {
    constructor(position, rotation) {
        super("food", position, rotation);
        this.SetColor([0, 1, 0]);
        this.__energy = random(100, 200);
    }

    Update(dtime, renderLines) {
        this.__energy += .5 * dtime;
        if (this.__energy <= 0) {
            this.SetScale(0);
        }
        else {
            this.SetScale(sqrt(this.__energy) / 10);
        }
    }
}

class Component {
    constructor(host, offset, outputs, position) {
        this.__host = host;
        this.__outputs = outputs;
        this.__offset = offset;
        this.__pos = [0, 0];
        this.__oldAngle = 0;
        this.__dpos = position;

        this.__dist = sqrt(position[0] * position[0] + position[1] * position[1]);
        this.__angle = 0;
        if (this.__dist > 0) {
            this.__angle = atan2(position[0], position[1]);
        }
    }

    ClearInput() {
        for (var i = 0; i < this.__outputs; ++i) {
            this.__host.inputs[i + this.__offset] = 0;
        }
    }

    Use(instance) { }
    Finalize() { }

    nrOutputs() {
        return this.__outputs;
    }

    GetPosition() {

        var da = this.__oldAngle - this.__host.GetRotation();
        // Position has sensitivity of 1 degrees to reduce the lookup and sin/cos calculations
        //if (da > 0.0175 || da < -0.0175) {
        if (da > 0.035 || da < -0.035) {
            this.__oldAngle -= da;
            this.__dpos[0] = this.__dist * sin(this.__oldAngle + this.__angle);
            this.__dpos[1] = this.__dist * cos(this.__oldAngle + this.__angle);
        }
        this.__pos[0] = this.__host.GetPosition()[0] + this.__dpos[0];
        this.__pos[1] = this.__host.GetPosition()[1] + this.__dpos[1];
        return this.__pos;
    }

    GetRotation() {
        return this.__host.GetRotation();
    }

    Set(index, value) {
        this.__host.inputs[index + this.__offset] = value;
    }
    Add(index, value) {
        this.__host.inputs[index + this.__offset] += value;
    }

    Get(index) {
        return this.__host.inputs[index + this.__offset];
    }

    SetRange(index, value) {
        for (var i = 0; i < value.length; ++i) {
            this.__host.inputs[index + i + this.__offset] = value[i];
        }
    }
}

class Eye extends Component {
    /**
     * The eye component acts as a light sensor for RGB.
     * It will return an intensity for each color. The intensity
     * is calculated by checking the percentage of the sensor that catches a color.
     * 
     * @param {*} host        The host organism / gameinstance having a brain
     * @param {*} viewAngle   The viewing arc of the sensor.
     * @param {*} angle       The viewing angle of the sensor
     * @param {*} position    Positional offset of the sensor relative to the host
     * @param {*} offset      Neuron input offset position to fill in the result
     */
    constructor(host, viewAngle, angle, position, offset) {
        super(host, offset, 3, position);
        this.viewAngle = viewAngle * (2 * pi) / 360;
        this.angle = angle * (2 * pi) / 360;
        this.areas = [];
    }

    ClearInput() {
        super.ClearInput();
        this.nrAreas = 0;
        this.areas = [];
    }

    Use(instance) {
        if (instance.__energy < 0) return;
        var pos = this.GetPosition();

        var otherPos = instance.GetPosition();
        var dX = otherPos[0] - pos[0];
        var dY = otherPos[1] - pos[1];

        var dist = sqrt(dX * dX + dY * dY);
        var dA = atan2(dX, dY) - this.GetRotation();
        if (abs(dA) > pi) dA -= 2 * pi * sign(dA);
        var arc = instance.GetScale() / dist;

        if (abs(dA - this.angle) - arc > this.viewAngle) {
            return;
        }

        var inputMinAngle = max(dA - arc, -this.viewAngle + this.angle);
        var inputMaxAngle = min(dA + arc, +this.viewAngle + this.angle);

        this.areas.push([inputMinAngle, dist, this.nrAreas, true, instance.GetColor()]);
        this.areas.push([inputMaxAngle, dist, this.nrAreas, false, instance.GetColor()]);
        this.nrAreas += 1;
    }

    Finalize(renderLines) {
        this.areas.sort(function (a, b) {
            if (a[0] != b[0])
                return a[0] - b[0];
            if (a[1] != b[1])
                return a[1] - b[1];
            return (a[3] ? -1 : 1);
        });
        var tColor = [0, 0, 0];
        var stack = [];
        var pos = this.GetPosition();

        for (var i = 0; i < this.areas.length - 1; ++i) {
            if (this.areas[i][3]) {
                stack.push([
                    this.areas[i][2], // ID
                    this.areas[i][1], // dist
                    this.areas[i][4]  // Color
                ]);
            }
            else {
                for (var j = 0; j < stack.length; ++j) {
                    if (stack[j][0] == this.areas[i][2]) {
                        stack.splice(j, 1);
                    }
                }
            }
            var arc = this.areas[i + 1][0] - this.areas[i][0];
            if (stack.length > 0 && arc != 0) {
                stack.sort(function (a, b) {
                    return a[1] - b[1];
                })
                var percentage = arc / (this.viewAngle * 2);
                tColor[0] += percentage * stack[0][2][0];
                tColor[1] += percentage * stack[0][2][1];
                tColor[2] += percentage * stack[0][2][2];

                if ((renderLines || this.__host.selected)) {
                    lines.push(pos[0]);
                    lines.push(pos[1]);
                    lines.push(pos[0] + stack[0][1] * sin(this.GetRotation() + this.areas[i][0]));
                    lines.push(pos[1] + stack[0][1] * cos(this.GetRotation() + this.areas[i][0]));

                    lines.push(pos[0] + stack[0][1] * sin(this.GetRotation() + this.areas[i][0]));
                    lines.push(pos[1] + stack[0][1] * cos(this.GetRotation() + this.areas[i][0]));
                    lines.push(pos[0] + stack[0][1] * sin(this.GetRotation() + this.areas[i + 1][0]));
                    lines.push(pos[1] + stack[0][1] * cos(this.GetRotation() + this.areas[i + 1][0]));


                    lines.push(pos[0]);
                    lines.push(pos[1]);
                    lines.push(pos[0] + stack[0][1] * sin(this.GetRotation() + this.areas[i + 1][0]));
                    lines.push(pos[1] + stack[0][1] * cos(this.GetRotation() + this.areas[i + 1][0]));

                }
            }
        }
        this.SetRange(0, tColor);
    }
}

class Mouth extends Component {
    constructor(host, range, position, offset) {
        super(host, offset, 1, position);
        this.range2 = range * range;
        this.sensitivity = [0, 0];
        this.targets = [];
        this.nTargets = 0;
        this.foodType = Food;
    }
    ClearInput() {
        super.ClearInput();
        this.nTargets = 0;
    }

    Use(instance) {
        if (instance.__energy < 0 || !(instance instanceof this.foodType)) return;
        var pos = this.GetPosition();

        var otherPos = instance.GetPosition();
        var dX = otherPos[0] - pos[0];
        var dY = otherPos[1] - pos[1];

        var dist2 = dX * dX + dY * dY;
        var radius2 = instance.GetScale() * instance.GetScale();
        if (dist2 < this.range2 + radius2) {
            if (this.targets.length > this.nTargets) {
                this.targets[this.nTargets] = instance;
            }
            else {
                this.targets.push(instance);
            }
            this.Set(0, 1);
            this.nTargets += 1;
        }
    }
}
var herbivores = [0]
var carnivores = [0]

class Organism extends GameInstance {
    constructor(position, rotation, parent = null, type = 0) {
        super("organism", position, rotation);
        // CNN Output constant enums
        this.ROTATION = 0;
        this.X_DIRECTION = 1;
        this.Y_DIRECTION = 2;
        this.RED = 3;
        this.GREEN = 4;
        this.BLUE = 5;
        this.TOTAL = 6;

        // Detection radius
        this.radius = 50
        this.sqrRadius = this.radius * this.radius
        if (type == 0) {
            this.SetScale(1);
            this.max_speed = 3;
            this.counter = herbivores;
            this.SetColor([0, 0, 1])
        }
        if (type == 1) {
            this.SetScale(2);
            this.max_speed = 5;
            this.counter = carnivores;
            this.SetColor([1, 0, 0])
        }

        this.__energy = 75;
        this.parent = parent;
        this.type = type;

        this.SetScale(1.75);
        this.duration = 0;
        this.energyGained = 0;
        this.generation = 1;
        this.family = this.id;

        var inputs = 1;
        // Make all components
        this.components = [];
        this.components.push(new Eye(this, 15, 0, [0, this.GetScale()], inputs));
        inputs = inputs + this.components[this.components.length - 1].nrOutputs();
        for (var i = 1; i <= 3; ++i) {
            this.components.push(
                new Eye(
                    this,
                    15,
                    i * 20,
                    [
                        this.GetScale() * sin((+i * 10) / 180 * 3.1415),
                        this.GetScale() * cos((+i * 10) / 180 * 3.1415)],
                    inputs)
            );
            inputs += this.components[this.components.length - 1].nrOutputs();
            this.components.push(
                new Eye(
                    this,
                    15,
                    -i * 20,
                    [
                        this.GetScale() * sin((-i * 10) / 180 * 3.1415),
                        this.GetScale() * cos((-i * 10) / 180 * 3.1415)],
                    inputs)
            );
            inputs += this.components[this.components.length - 1].nrOutputs();
        }

        this.mouth = new Mouth(this, type == 0 ? 0.5 : 2, [0, this.GetScale()], inputs);
        this.components.push(this.mouth);
        inputs += this.components[this.components.length - 1].nrOutputs();

        this.inputs = Array(inputs).fill(0);
        if (type == 0) {
            this.mouth.foodType = Food;
        }
        if (type == 1) {
            this.mouth.foodType = Organism;
        }
        this.counter[0] += 1;

        // Create the brain
        if (parent != null) {
            this.brain = parent.brain.clone();
            this.brain.mutate(0.1);
            this.generation = parent.generation + 1;
            this.family = parent.family;
            this.familyMembers = parent.familyMembers;
            this.familyMembers[0] += 1;
        }
        else {
            this.familyMembers = [1];
            this.brain = new Brain(inputs, [30, 20], this.TOTAL);
        }
    }

    Remove() {
        this.familyMembers[0] -= 1;
        this.counter[0] -= 1;
        super.Remove();
        for (var i = this.components.length - 1; i >= 0; --i) {
            delete this.components[i];
        }
        delete this;
    }

    *Query() {
        var pos = this.GetPosition();
        var bbox = [
            pos[0] - this.radius, pos[1] - this.radius,
            pos[0] + this.radius, pos[1] + this.radius
        ]

        for (let tree in Quadtrees) {
            for (let instance of Quadtrees[tree][1].intersect(bbox)) {
                let dx = pos[0] - instance[1][0];
                let dy = pos[1] - instance[1][1];
                if (instance[0] != this && dx * dx + dy * dy <= this.sqrRadius) {
                    yield instance[0];
                }
            }
        }
    }

    Update(dtime, renderLines) {
        this.duration += dtime;

        for (var i = 0; i < this.components.length; ++i) {
            this.components[i].ClearInput();
        }

        for (let instance of this.Query()) {
            for (var i = 0; i < this.components.length; ++i) {
                this.components[i].Use(instance);
            }
        }
        this.inputs[0] = tanh(this.__energy / 100 - 1);

        for (var i = 0; i < this.components.length; ++i) {
            this.components[i].Finalize(renderLines);
        }

        let output = this.brain.feedForward(this.inputs);
        let usage =
            abs(output[this.ROTATION]) * 0.1 +
            abs(output[this.X_DIRECTION]) +
            abs(output[this.Y_DIRECTION])
        this.__energy -= dtime * (0.25 + usage)
        this.Turn(dtime * output[this.ROTATION] * pi / 2);

        this.Move(
            dtime * output[this.X_DIRECTION],
            dtime * output[this.Y_DIRECTION],
            this.max_speed)

        if (this.mouth) {
            for (var i = 0; i < this.mouth.nTargets; ++i) {
                this.Feed(this.mouth.targets[i], dtime, max(0, 1 - usage * 5));
            }
        }

        if (this.__energy > 350.0) {
            this.__energy -= 75;
            if (this.__energy > 0)
                new Organism(this.GetPosition(), this.GetRotation(), this, this.type);
        }

        if (this.__energy < 0) {
            this.Remove();
        }
        //this.SetColor([(1 + output[this.RED]) / 2, (1 + output[this.GREEN]) / 2, (1 + output[this.BLUE]) / 2])
    }
    Feed(food, dtime, mul = 1) {
        let feed_power = this.type == 1 ? 150 : 30
        var amount = feed_power * dtime * mul;
        amount = min(amount, food.__energy);
        this.__energy += amount;
        this.energyGained += amount;
        food.__energy -= amount;
    }
}

export { ResetStates, Objects, Food, Organism, DataGroups, lines };