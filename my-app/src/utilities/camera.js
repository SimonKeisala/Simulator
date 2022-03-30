import { flatten, rotationMatrix, multiply, add, identity, pi } from "mathjs"
let deg2rad = pi / 180
class Camera {
    constructor(position, euler) {
        this.position = position
        this.euler = euler
        this.sensitivity = 0.2;
    }

    move(dir) {
        dir = multiply(this.rotation(), dir)
        this.position = add(this.position, dir)._data
    }

    rotate(deltaX, deltaY) {
        this.euler[2] -= deltaX * this.sensitivity;
        this.euler[0] -= deltaY * this.sensitivity;
    }

    rotation() {
        let rotation = identity(3)
        for (let i of [2, 1, 0]) {
            let v = [0, 0, 0];
            v[i] = 1;
            rotation = multiply(
                rotation,
                rotationMatrix(this.euler[i] * deg2rad, v)
            );
        }
        return rotation;
    }
    mat4() {
        let rotation = this.rotation();

        let matrix = identity(4);
        for (let x = 0; x < 3; ++x) {
            for (let y = 0; y < 3; ++y) {
                matrix.set([x, y], rotation.get([x, y]));
            }
        }
        for (let i = 0; i < 3; ++i) {
            matrix.set([3, i], this.position[i])
        }
        return flatten(matrix)._data;
    }
}

export default Camera;