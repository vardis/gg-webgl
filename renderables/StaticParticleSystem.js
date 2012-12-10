/**
 * Create a static particle system, i.e. the particles remain stationery
 * at their original positions.
 * To determine the initial placement of the particles, a geometry object
 * must be given as input. Whereby each vertex will specify the position and/or
 * color of each particle.
 * Note: The input geometry is expected to be flatten.
 */
GG.StaticParticleSystem = function (geometry, material, spec) {
    spec = spec || {};
    this.material = material;
    this.pointSize = spec.pointSize != undefined ? spec.pointSize : 1.0;

    this.vertexBuffer = gl.createBuffer(1);
    this.vertexBuffer.size = geometry.getVertices().length / 3;
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.itemType = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

    if (geometry.getColors()) {
        this.colorsBuffer = gl.createBuffer(1);
        this.colorsBuffer.size = geometry.getColors().length / 3;
        this.colorsBuffer.itemType = gl.FLOAT;
        this.colorsBuffer.itemSize = 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.getColors(), gl.STATIC_DRAW);
    } else {
        this.colorsBuffer = null;
    }
};

GG.StaticParticleSystem.prototype = new GG.Object3D();
GG.StaticParticleSystem.prototype.constructor = GG.StaticParticleSystem;

GG.StaticParticleSystem.prototype.getVertexBuffer = function() {
	return this.vertexBuffer;
};

GG.StaticParticleSystem.prototype.getColorsBuffer = function() {
	return this.colorsBuffer;
};

GG.StaticParticleSystem.prototype.getPointSize = function() {
	return this.pointSize;
};

GG.StaticParticleSystem.prototype.setPointSize = function(sz) {
	this.pointSize = sz;
};