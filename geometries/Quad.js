/**
 * A quad aligned on the XY plane and facing along the +Z axis.
 */
GG.Quad = function () {
    this.vertices = new Float32Array(6 * 3);
    this.normals = new Float32Array(6 * 3);
    this.texCoords = new Float32Array(6 * 2);

    /*

     2 +---+ 1
     |  /|
     | / |
     0 +---+ 3

     triangles 0,1,2 and 0,3,1
     */
    this.vertices.set([
        -1.0, -1.0, 0.0,
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0, 1.0, 0.0
    ]);

    this.normals.set([
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ]);

    this.texCoords.set([
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0
    ]);


};

GG.Quad.prototype = new GG.Geometry();
GG.Quad.prototype.constructor = GG.Quad;