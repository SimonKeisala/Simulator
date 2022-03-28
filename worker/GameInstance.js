var InstanceCounter = 0;
var debugLines = false;

var DataGroupInstances = {}
var DataGroups = {}

class GameInstance {
    constructor(group, position = [0, 0], rotation = 0) {
        this.__id = InstanceCounter++;

        if (!(group in DataGroups)) {
            DataGroups[group] =
                {
                positions:[],
                rotations:[],
                scales:[],
                colors:[]};
            DataGroupInstances[group] = []
        }

        // Add oneself to the group
        this.__group = DataGroups[group];
        this.__instanceGroup = DataGroupInstances[group];
        this.__groupIndex = this.__instanceGroup.length;
        this.__instanceGroup.push(this);

        // Add the instance's position, rotation and scale
        this.__position = [position[0], position[1]];
        this.__rotation = rotation;
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
            for (var i = this.__groupIndex+1; i < this.__instanceGroup.length; ++i){
                this.__instanceGroup[i].__groupIndex = i-1;
            }
            this.__instanceGroup.splice(this.__groupIndex, 1);
            this.__group.positions.splice(this.__groupIndex*2, 2);
            this.__group.rotations.splice(this.__groupIndex, 1);
            this.__group.scales.splice(this.__groupIndex, 1);
            this.__group.colors.splice(this.__groupIndex*3, 3);
        }
    }

    Turn(angle) {
        this.__rotation += angle;
        if (Math.abs(this.__rotation) > Math.PI) {
            this.__rotation -= Math.PI*2*Math.sign(this.__rotation);
        }
        this.__group.rotations[this.__groupIndex] = this.__rotation;
    }

    Move(distance, strife = 0) {
        this.__group.positions[this.__groupIndex*2]   += 5*distance*Math.sin(this.__group.rotations[this.__groupIndex]);
        this.__group.positions[this.__groupIndex*2]   += 2.5*strife*Math.sin(this.__group.rotations[this.__groupIndex]+Math.PI/2);
        this.__group.positions[this.__groupIndex*2+1] += 5*distance*Math.cos(this.__group.rotations[this.__groupIndex]);
        this.__group.positions[this.__groupIndex*2+1] += 2.5*strife*Math.cos(this.__group.rotations[this.__groupIndex]+Math.PI/2);

        this.__position[0] = this.__group.positions[this.__groupIndex*2];
        this.__position[1] = this.__group.positions[this.__groupIndex*2+1];
    }


    GetColor() {
        return this.__group.colors.slice(this.__groupIndex*3, this.__groupIndex*3+3);
    }
    SetColor(color) {
        for (var i = 0; i < 3; ++i) {
            this.__group.colors[this.__groupIndex*3+i] = color[i];
        }
    }
    GetPosition() {
        return this.__position;
    }
    SetPosition(x, y) {
        this.__group.positions[this.__groupIndex*2] = x;
        this.__group.positions[this.__groupIndex*2+1] = y;
        this.__position[0] = x;
        this.__position[1] = y;
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

    Feed(food, dtime) {}
}


class Food extends GameInstance {
    constructor(position, rotation) {
        super("circle", position, rotation);
        var color = this.GetColor();
        this.SetColor([0,1,0]);
        //this.SetScale(0.25);
        this.__energy = randomValue(60, 170);
        this.smell = [0,1];

    }

    Update(dtime) {
        //this.energy += (500-this.energy)/500 * dtime/5000;
        this.__energy -= 0.5*dtime/1000;
        //this.SetScale(Math.sqrt(Math.max(0,this.energy/50)))
        if (this.__energy < 0) {
            this.SetPosition(randomValue(-spawnRange, spawnRange), randomValue(-spawnRange, spawnRange));
            this.__energy = randomValue(100, 200);
            foodQuadTreeDirty = true;
        }
    }
}

class Component {
    constructor(host, offset, outputs, position) {
        this.__host = host;
        this.__outputs = outputs;
        this.__offset = offset;
        this.__pos = [0,0];
        this.__oldAngle = 0;
        this.__dpos = position;

        this.__dist = Math.sqrt(position[0]*position[0]+position[1]*position[1]);
        this.__angle = 0;
        if (this.__dist > 0) {
            this.__angle = Math.atan2(position[0], position[1]);
        }
    }

    ClearInput() {
        for (var i = 0; i < this.__outputs; ++i) {
            this.__host.brain.inputs[i+this.__offset][0] = 0;
        }
    }

    Use(instance) {}
    Finalize() {}

    nrOutputs() {
        return this.__outputs;
    }

    GetPosition() {

        var da = this.__oldAngle - this.__host.GetRotation();
        // Position has sensitivity of 1 degrees to reduce the lookup and sin/cos calculations
        //if (da > 0.0175 || da < -0.0175) {
        if (da > 0.035 || da < -0.035) {
            this.__oldAngle = -da +this.__oldAngle;
            this.__dpos[0] = this.__dist*Math.sin(this.__oldAngle+this.__angle);
            this.__dpos[1] = this.__dist*Math.cos(this.__oldAngle+this.__angle);
        }
        this.__pos[0] = this.__host.GetPosition()[0]+this.__dpos[0];
        this.__pos[1] = this.__host.GetPosition()[1]+this.__dpos[1];
        return this.__pos;
    }

    GetRotation() {
        return this.__host.GetRotation();
    }

    Set(index, value) {
        this.__host.brain.inputs[index+this.__offset][0] = value;
    }
    Add(index, value) {
        this.__host.brain.inputs[index+this.__offset][0] += value;
    }

    Get(index) {
        return this.__host.brain.inputs[index+this.__offset][0];

    }

    SetRange(index, value) {
        for (var i = 0; i < value.length; ++i) {
            this.__host.brain.inputs[index+i+this.__offset][0] = value[i];
        }
    }
}

class Eye extends Component {
    constructor(host, viewAngle, angle, position, offset) {
        super(host, offset, 4, position);
        this.viewAngle = viewAngle*(2*Math.PI)/360;
        this.angle = angle*(2*Math.PI)/360;
        this.areas = [];
    }

    ClearInput() {
        super.ClearInput();
        this.nrAreas = 0;
        this.areas = [];
    }

    Use(instance) {
        var pos = this.GetPosition();

        var otherPos = instance.GetPosition();
        var dX = otherPos[0] - pos[0];
        var dY = otherPos[1] - pos[1];

        var dist = Math.sqrt(dX*dX+dY*dY);
        var dA = Math.atan2(dX, dY) - this.GetRotation();
        if (Math.abs(dA) > Math.PI) dA -= 2*Math.PI*Math.sign(dA);
        var arc = instance.GetScale() / dist;

        if (Math.abs(dA-this.angle) - arc > this.viewAngle) {
            return;
        }

        var inputMinAngle = Math.max(dA-arc, -this.viewAngle + this.angle);
        var inputMaxAngle = Math.min(dA+arc, +this.viewAngle + this.angle);

        this.areas.push([inputMinAngle, dist, this.nrAreas, true, instance.GetColor()]);
        this.areas.push([inputMaxAngle, dist, this.nrAreas, false, instance.GetColor()]);
        this.nrAreas += 1;


    }
    Finalize() {
        this.areas.sort(function(a,b) {
            if (a[0] != b[0])
                return a[0] - b[0];
            if (a[1] != b[1])
                return a[1] - b[1];
            return (a[3] ? -1 : 1);
        });
        var tColor = [0,0,0,1];
        var stack = [];
        var pos = this.GetPosition();

        for (var i = 0; i < this.areas.length-1; ++i) {
            if (this.areas[i][3])
            {
                stack.push([
                    this.areas[i][2], // ID
                    this.areas[i][1], // dist
                    this.areas[i][4]  // Color
                ]);
            }
            else {
                for (var j = 0; j < stack.length; ++j) {
                    if (stack[j][0] == this.areas[i][2]) {
                        stack.splice(j,1);
                    }
                }
            }
            var arc = this.areas[i+1][0]-this.areas[i][0];
            if (stack.length > 0 && arc != 0) {
                stack.sort(function(a,b) {
                    return a[1] - b[1];
                })
                var percentage = arc/(this.viewAngle*2);
                tColor[0] += percentage*stack[0][2][0];
                tColor[1] += percentage*stack[0][2][1];
                tColor[2] += percentage*stack[0][2][2];
                tColor[3] -= percentage;

                if ((debugLines || this.__host == selectedObject)) {
                    lines.push(pos[0]);
                    lines.push(pos[1]);
                    lines.push(pos[0]+stack[0][1]*Math.sin(this.GetRotation()+this.areas[i][0]));
                    lines.push(pos[1]+stack[0][1]*Math.cos(this.GetRotation()+this.areas[i][0]));

                    lines.push(pos[0]+stack[0][1]*Math.sin(this.GetRotation()+this.areas[i][0]));
                    lines.push(pos[1]+stack[0][1]*Math.cos(this.GetRotation()+this.areas[i][0]));
                    lines.push(pos[0]+stack[0][1]*Math.sin(this.GetRotation()+this.areas[i+1][0]));
                    lines.push(pos[1]+stack[0][1]*Math.cos(this.GetRotation()+this.areas[i+1][0]));


                    lines.push(pos[0]);
                    lines.push(pos[1]);
                    lines.push(pos[0]+stack[0][1]*Math.sin(this.GetRotation()+this.areas[i+1][0]));
                    lines.push(pos[1]+stack[0][1]*Math.cos(this.GetRotation()+this.areas[i+1][0]));

                }
            }
        }
        this.SetRange(0, tColor);
    }
}

class Nose extends Component {
    constructor(host, range, position, offset) {
        super(host, offset, 2, position);
        this.range2 = range*range;
        this.sensitivity = [0,0];
    }

    Use(instance) {
        var pos = this.GetPosition();

        var otherPos = instance.GetPosition();
        var dX = otherPos[0] - pos[0];
        var dY = otherPos[1] - pos[1];

        var dist2 = dX*dX+dY*dY;
        for (var i = 0; i < 2; ++i)
        {
            var value = instance.GetScale()
            * instance.smell[i]
            * Math.max(0,this.range2-dist2)/this.range2;
            this.Add(i, value);
        }
    }

    Finalize() {
        var factor = 0.001*speedMult;
        for (var i = 0; i < 2; ++i) {
            this.sensitivity[i] = this.sensitivity[i]*(1-factor)
                + this.Get(i)*factor;
            this.Set(i, this.Get(i)/Math.max(1,this.sensitivity[i]));
        }
    }

}

class Mouth extends Component {
    constructor(host, range, position, offset) {
        super(host, offset, 1, position);
        this.range2 = range*range;
        this.sensitivity = [0,0];
        this.targets = [];
        this.nTargets = 0;
    }
    ClearInput() {
        super.ClearInput();
        this.nTargets = 0;
    }

    Use(instance) {
        if (instance.__energy < 0 || !(instance instanceof Food)) return;
        var pos = this.GetPosition();

        var otherPos = instance.GetPosition();
        var dX = otherPos[0] - pos[0];
        var dY = otherPos[1] - pos[1];

        var dist2 = dX*dX+dY*dY;
        var radius2 = instance.GetScale()*instance.GetScale();
        if (dist2 < this.range2+radius2) {
            if (this.targets.length > this.nTargets)
            {
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

class Organism extends GameInstance {
    constructor(position, rotation, parent = null) {
        super("organism", position, rotation);
        this.smell = [1,0]
        this.__energy = 75;

        this.parent = parent;

        this.SetScale(0.75);
        this.duration = 0;
        this.children = [];
        this.energyGained = 0;
        this.generation = 1;
        this.family = this.id;

        var inputs = 2;
        // Make all components
        this.components = [];
        this.components.push(new Eye(this, 15, 0, [0,this.GetScale()], inputs));
        inputs = inputs + this.components[this.components.length-1].nrOutputs();
        for (var i = 1; i <= 3; ++i) {
            this.components.push(new Eye(this, 15, +i*20, [this.GetScale()*math.sin((+i*10)/180*3.1415),math.cos((+i*10)/180*3.1415)*this.GetScale()], inputs));
            inputs = inputs + this.components[this.components.length-1].nrOutputs();
            this.components.push(new Eye(this, 15, -i*20, [this.GetScale()*math.sin((-i*10)/180*3.1415),math.cos((-i*10)/180*3.1415)*this.GetScale()], inputs));
            inputs = inputs + this.components[this.components.length-1].nrOutputs();

        }
        //this.components.push(new Eye(this, 40, -30, [0,1*this.GetScale()], inputs));
        //inputs = inputs + this.components[this.components.length-1].nrOutputs();
        //this.components.push(new Eye(this, 40, 30, [0,1*this.GetScale()], inputs));
        //inputs = inputs + this.components[this.components.length-1].nrOutputs();

        //this.components.push(new Nose(this, 100, [-0.75*this.GetScale(),0.5*this.GetScale()], inputs));
        //inputs += this.components[this.components.length-1].nrOutputs();
        //this.components.push(new Nose(this, 100, [0.75*this.GetScale(),0.5*this.GetScale()], inputs));
        //inputs += this.components[this.components.length-1].nrOutputs();

        this.mouth = new Mouth(this, 0.5, [0, 0.5*this.GetScale()], inputs);
        this.components.push(this.mouth);
        inputs += this.components[this.components.length-1].nrOutputs();

        // Create the brain
        if (parent != null) {
            this.brain = new Brain(parent.brain);
            this.generation = parent.generation+1;
            this.family = parent.family;
            this.familyMembers = parent.familyMembers;
            this.familyMembers[0] += 1;
            this.SetColor(parent.GetColor());
            parent.children.push(this);
        }
        else {
            this.SetColor([randomValue(0.2,1), randomValue(0.2,1), randomValue(0.2,1)]);
            this.familyMembers = [1];
            this.brain = new Brain(inputs, TOTAL);
        }

    }

    getFactor(dtime) {
        return dtime/(1000+this.duration);
    }

    Remove() {
        super.Remove();
        for(var i = this.components.length-1; i >= 0; --i) {
            delete this.components[i];
        }
        delete this;
    }

    Update(dtime) {
        this.duration += dtime/1000;

        for (var i = 0; i < this.components.length; ++i) {
            this.components[i].ClearInput();
        }

        var pos = this.GetPosition();
        var range = new Sphere(pos[0], pos[1], 100);
        var query = new Query(foodQuadTree, range);
        var instance = query.next();
        while (instance !== null) {
            if (instance != this) {
                for (var i = 0; i < this.components.length; ++i) {
                    this.components[i].Use(instance);
                }
            }
            instance = query.next();
        }
        query = new Query(organismQuadTree, range);
        instance = query.next();
        while (instance !== null) {
            if (instance != this) {
                for (var i = 0; i < this.components.length; ++i) {
                    this.components[i].Use(instance);
                }
            }
            instance = query.next();
        }
        this.brain.inputs[0][0] = Math.tanh(this.__energy/100-1);
        this.brain.inputs[1][0] = this.duration/1000;

        for (var i = 0; i < this.components.length; ++i) {
            this.components[i].Finalize();
        }

        this.brain.feedForward();
        this.__energy -= dtime/1000*(0.25 + 0.1*Math.abs(this.brain.get(ROTATION)) + Math.abs(this.brain.get(X_DIRECTION)) + Math.abs(this.brain.get(Y_DIRECTION)) + Math.max(0, this.brain.get(EAT)))
        var factor = this.getFactor(dtime);//*(1-Math.max(0, this.brain.get(EAT)));
        this.Turn(factor*this.brain.get(ROTATION)*Math.PI/2);

        this.Move(factor*this.brain.get(X_DIRECTION),
                  factor*this.brain.get(Y_DIRECTION));

        if (this.mouth)
            for (var i = 0; i < this.mouth.nTargets; ++i) {
                this.Feed(this.mouth.targets[i], dtime);
            }

        //if (this.brain.get(SPLIT) > 0.0) {
        if (this.__energy > 150.0) {
            console.log("splitting");
            this.__energy -= 75;
            if (this.__energy > 0)
                this.children.push(new Organism(this.GetPosition(), 0, this));
        }

        if (this.__energy < 0) {
            this.familyMembers[0] = this.familyMembers[0]-1;
            this.Remove();
        }
    }
    Feed(food, dtime) {
        var factor = this.getFactor(dtime);
        var amount = 30*factor; //*Math.max(0,this.brain.get(EAT));
        this.__energy += amount;
        this.energyGained += amount;
        food.__energy -= amount;

    }
}
Food.count = function() {
    if ("food" in DataGroups) {
        return DataGroupInstances["food"].length;
    }
    return 0;
}

Organism.count = function() {
    if ("organism" in DataGroups) {
        return DataGroupInstances["organism"].length;
    }
    return 0;
}
