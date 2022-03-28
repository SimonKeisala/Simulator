class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    left() {
        return this.x;
    }
    right() {
        return this.x+this.w;
    }
    top() {
        return this.y;
    }
    bottom() {
        return this.y+this.h;
    }
    isInside(point) {
        return point[0] < this.x+this.w
            && point[0] > this.x
            && point[1] < this.y+this.h
            && point[1] > this.y;
    }
    isSphereInside(point, radius) {
        return point[0]-radius < this.x+this.w
            && point[0]+radius > this.x
            && point[1]-radius < this.y+this.h
            && point[1]+radius > this.y;
    }

    intersectsAABB(rect) {
        return this.x < rect.right()
            && this.x + this.w > rect.left()
            && this.y < rect.bottom()
            && this.y + this.h > rect.top();
    }

    split() {
        var w2 = this.w/2;
        var h2 = this.h/2;
        var bs = []
        bs.push(new Rectangle(this.x   , this.y   , w2, h2));
        bs.push(new Rectangle(this.x+w2, this.y   , w2, h2));
        bs.push(new Rectangle(this.x   , this.y+h2, w2, h2));
        bs.push(new Rectangle(this.x+w2, this.y+h2, w2, h2));
        return bs;
    }
    distance(point) {
        var dx = Math.max(0, point[0] - this.right) + Math.max(0, this.left-point[0]);
        var dy = Math.max(0, point[1] - this.up) + Math.max(0, this.down-point[1]);
        return [dx, dy];
    }
}

class Sphere {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = Math.abs(r);
        this.r2 = r*r;
    }
    isInside(point) {
        var dx = point[0]-this.x;
        var dy = point[1]-this.y;
        return dx*dx+dy*dy < this.r2;
    }
    isSphereInside(point, radius) {
        var dx = point[0]-this.x;
        var dy = point[1]-this.y;
        return dx*dx+dy*dy < radius*radius+this.r2;
    }

    left() {
        return this.x-this.r;
    }
    right() {
        return this.x+this.r;
    }
    top() {
        return this.y-this.r;
    }
    bottom() {
        return this.y+this.r;
    }

    intersectsAABB(rect) {
        // Allow false positives
        return this.x - this.r < rect.right()
            && this.x + this.r > rect.left()
            && this.y - this.r < rect.top()
            && this.y + this.r > rect.bottom();
    }

    split() {
        var w2 = this.w/2;
        var h2 = this.h/2;
        var bs = []
        bs.push(new Rectangle(this.x   , this.y   , w2, h2));
        bs.push(new Rectangle(this.x+w2, this.y   , w2, h2));
        bs.push(new Rectangle(this.x   , this.y+h2, w2, h2));
        bs.push(new Rectangle(this.x+w2, this.y+h2, w2, h2));
        return bs;
    }
    distance(point) {
        var dx = Math.max(0, point[0] - this.right) + Math.max(0, this.left-point[0]);
        var dy = Math.max(0, point[1] - this.up) + Math.max(0, this.down-point[1]);
        return [dx, dy];
    }
}
class Quad {
    constructor(rectangle, capacity) {
        this.border = rectangle;
        this.capacity = capacity;
        this.divided = false;
        this.points = [];
        this.pointData = [];
        this.items = 0;
    }

    subdivide() {
        var borders = this.border.split();
        this.children = [];
        for(var i = 0; i < borders.length; ++i) {
            this.children.push(new Quad(borders[i], this.capacity));
            for(var j = 0; j < this.capacity; ++j) {
                this.children[i].insert(this.points[j], this.pointData[j]);
            }
        }
        this.divided = true;
    }

    insert(point, data) {
        if (!this.border.isInside(point)) return;

        this.items += 1;
        if (this.items <= this.capacity) {
            if(this.points.length < this.items) {
                this.points.push(point);
                this.pointData.push(data);
            }
            else {
                this.points[this.items-1] = point;
                this.pointData[this.items-1] = data;
            }
            return;
        }
        else if (!this.divided) {
            this.subdivide();
        }
        for (var i = 0; i < this.children.length; ++i) {
            this.children[i].insert(point, data);
        }
    }

    distance(point) {
        return this.border.distance(point);
    }

    clear() {
        for (var child in this.children) {
            this.children[child].clear();
        }
        this.items = 0;
        this.divided = false;
    }
}

class Query {
    constructor(qtree, range) {
        this.qtree = [qtree];
        this.range = range;
        this.index = 0;
        if (!qtree.border.intersectsAABB(range)) this.qtree.pop();
    }

    validInstance(instance) {
        return true;
    }

    next() {
        if (this.qtree.length == 0) return null;

        while (this.qtree[this.qtree.length-1].divided) {
            this.index = 0;
            var children = this.qtree.pop().children;
            for (var i in children) {
                if (children[i].border.intersectsAABB(this.range) && children[i].items > 0)
                {
                    this.qtree.push(children[i]);
                }
            }
            if (this.qtree.length == 0) return null;
        }

        var tree = this.qtree[this.qtree.length-1];
        while (this.index < tree.items && this.index < tree.capacity) {
            this.index += 1;
            if (this.validInstance(tree.pointData[this.index-1])
                && this.range.isSphereInside(tree.points[this.index-1], tree.pointData[this.index-1].GetScale()) )
            {
                return tree.pointData[this.index-1];
            }
        }
        this.index = 0;
        this.qtree.pop();
        return this.next();
    }
    end() {
        return this.qtree.length > 0;
    }
    all() {
        var result = [];
        var next = this.next();
        while (next != null) {
            result.push(next);
            next = this.next();
        }
        return result;
    }
}

class QueryOrganisms extends Query {
    constructor(qtree, range) {
        super(qtree, range)
    }
    validInstance(instance) {
        return (instance instanceof Organism)
    }
}