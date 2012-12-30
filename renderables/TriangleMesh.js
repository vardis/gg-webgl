/**
 * Each TriangleMesh is associated with a Geometry that stores the actual vertices,
 * normals, and the rest vertex attributes. 
 * Only geometries of triangle lists are supported. 
 */
GG.TriangleMesh = function(geometry, material, spec) {
	spec               = spec || {};
	spec.usesNormals   = true;
	spec.usesTexCoords = true;
	spec.usesColors    = true;
	spec.usesTangents  = true;

	GG.Object3D.call(this, geometry, material, spec);

	if (this.geometry != null && this.geometry.indices != undefined) {
        this.indexBuffer          = gl.createBuffer(1);
        this.indexBuffer.numItems = this.geometry.getIndices().length;
        this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
    } else {
        this.indexBuffer = null;
    }
};

GG.TriangleMesh.prototype = new GG.Object3D();
GG.TriangleMesh.prototype.constructor = GG.TriangleMesh;

GG.TriangleMesh.prototype.getFlatNormalsBuffer = function() {
	if (this.flatNormalsBuffer === undefined) {
		var flatNormals = this.geometry.getFlatNormals();
		if (flatNormals === undefined) {
			flatNormals = this.geometry.calculateFlatNormals();
		}
		if (flatNormals) {
            this.flatNormalsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getFlatNormals(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
		} else {
			return null;
		}
	}
	return this.flatNormalsBuffer;
};