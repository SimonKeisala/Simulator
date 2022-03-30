function rect_overlap(bbox1, bbox2) {
    return (
        bbox1[0] <= bbox2[2] &&
        bbox1[1] <= bbox2[3] &&
        bbox1[2] >= bbox2[0] &&
        bbox1[3] >= bbox2[1]
    );
}
function rect_contains(bbox1, bbox2) {
    return (
        bbox1[0] <= bbox2[0] &&
        bbox1[1] <= bbox2[1] &&
        bbox1[2] >= bbox2[2] &&
        bbox1[3] >= bbox2[3]
    );
}

class Quadtree {
    constructor(bbox, capacity = 10, max_depth = 20) {
        this.bbox = bbox;
        this.center = [(bbox[2] + bbox[0]) / 2, (bbox[3] + bbox[1]) / 2];
        this.capacity = capacity;
        this.max_depth = max_depth;
        this.depth = 0;
        this.points = [];
        this.data = [];
        this.children = null;
        this.empty = true;
    }

    insert(item, bbox) {
        if (!rect_overlap(this.bbox, bbox)) return;
        this._insert(item, bbox);
    }
    remove(item, bbox) {
        if (!rect_overlap(this.bbox, bbox)) return;
        this._remove(item, bbox);

    }
    *intersect(bbox) {
        if (rect_overlap(this.bbox, bbox))
            yield* this._intersect(bbox, new Set());
    }
    *all() {
        yield* this._iter(new Set());
    }

    *_iter(uniq) {
        if (this.children != null) {
            for (let c of this.children) {
                yield* c._iter(uniq);
            }
        }
        for (var i in this.points) {
            if (!uniq.has(this.data[i])) {
                uniq.add(this.data[i]);
                yield [this.data[i], this.points[i]];
            }
        }
    }
    *_intersect(bbox, uniq) {
        if (rect_contains(bbox, this.bbox)) {
            yield* this._iter(uniq);
        }
        else {
            if (this.children != null) {
                if (bbox[0] <= this.center[0]) {
                    if (bbox[1] <= this.center[1])
                        yield* this.children[0]._intersect(bbox, uniq);
                    if (bbox[3] >= this.center[1])
                        yield* this.children[1]._intersect(bbox, uniq);
                }
                if (bbox[2] >= this.center[0]) {
                    if (bbox[1] <= this.center[1])
                        yield* this.children[2]._intersect(bbox, uniq);
                    if (bbox[3] >= this.center[1])
                        yield* this.children[3]._intersect(bbox, uniq);
                }
            }
            for (var i in this.points) {
                if (!uniq.has(this.data[i]) && rect_overlap(bbox, this.points[i])) {
                    uniq.add(this.data[i]);
                    yield [this.data[i], this.points[i]];
                }
            }
        }
    }
    _insert(item, bbox) {
        this.empty = false;
        if (this.children != null) {
            this._insert_to_children(item, bbox);
        }
        else {
            if (this.depth !== this.max_depth && this.points.length >= this.capacity) {
                this._create_children();
                let points = this.points;
                let data = this.data;
                this.points = [];
                this.data = [];
                for (var i in points) {
                    this._insert_to_children(data[i], points[i]);
                }
                this._insert_to_children(item, bbox);
            }
            else {
                this.points.push(bbox);
                this.data.push(item);
            }
        }
    }
    _insert_to_children(item, bbox) {
        if (bbox[0] <= this.center[0] && this.center[0] <= bbox[2] &&
            bbox[1] <= this.center[1] && this.center[1] <= bbox[3]) {
            this.points.push(bbox);
            this.data.push(item);
        }
        else {
            if (bbox[0] <= this.center[0]) {
                if (bbox[1] <= this.center[1])
                    this.children[0]._insert(item, bbox);
                if (bbox[3] >= this.center[1])
                    this.children[1]._insert(item, bbox);
            }
            if (bbox[2] >= this.center[0]) {
                if (bbox[1] <= this.center[1])
                    this.children[2]._insert(item, bbox);
                if (bbox[3] >= this.center[1])
                    this.children[3]._insert(item, bbox);
            }
        }
    }
    _remove(item, bbox) {
        if (this.children != null) {
            this._remove_from_children(item, bbox);
        }
        else {
            var data_index = this.data.indexOf(item);
            if (data_index != -1) {
                this.data.splice(data_index, 1);
                this.points.splice(data_index, 1);
                this.empty = (this.points.length === 0);
            }
        }
    }
    _remove_from_children(item, bbox) {
        if (bbox[0] <= this.center[0] && this.center[0] <= bbox[2] &&
            bbox[1] <= this.center[1] && this.center[1] <= bbox[3]) {
            var data_index = this.data.indexOf(item);
            if (data_index != -1) {
                this.data.splice(data_index, 1);
                this.points.splice(data_index, 1);
            }
        }
        else {
            if (bbox[0] <= this.center[0]) {
                if (bbox[1] <= this.center[1])
                    this.children[0]._remove(item, bbox);
                if (bbox[3] >= this.center[1])
                    this.children[1]._remove(item, bbox);
            }
            if (bbox[2] >= this.center[0]) {
                if (bbox[1] <= this.center[1])
                    this.children[2]._remove(item, bbox);
                if (bbox[3] >= this.center[1])
                    this.children[3]._remove(item, bbox);
            }
            for (let child of this.children) {
                if (!child.empty) {
                    return;
                }
            }
            this.children = null;
            this.empty = (this.points.length === 0);
        }
    }
    _create_children() {
        this.children = [
            new Quadtree([this.bbox[0], this.bbox[1], this.center[0], this.center[1]], this.capacity, this.max_depth),
            new Quadtree([this.bbox[0], this.center[1], this.center[0], this.bbox[3]], this.capacity, this.max_depth),
            new Quadtree([this.center[0], this.bbox[1], this.bbox[2], this.center[1]], this.capacity, this.max_depth),
            new Quadtree([this.center[0], this.center[1], this.bbox[2], this.bbox[3]], this.capacity, this.max_depth)
        ]
        for (var child of this.children) {
            child.depth = this.depth + 1;
        }
    }
}

export default Quadtree;