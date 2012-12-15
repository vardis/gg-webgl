/**
 * Each TriangleMesh is associated with a Geomtry that stores the actual vertices,
 * normals, and the rest vertex attributes. 
 * Only geometries of triangle lists are supported. 
 */
GG.TriangleMesh = function(geometry, material, spec) {
	
	this.geometry                     = geometry;
	this.material                     = material;	
	
	this.positionsBuffer              = gl.createBuffer(1);
	this.positionsBuffer.size         = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.numTriangles = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.itemSize     = 3;
	this.positionsBuffer.itemType     = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getVertices(), gl.STATIC_DRAW);
	
	this.normalsBuffer                = gl.createBuffer(1);
	this.normalsBuffer.size           = this.geometry.getNormals().length / 3;
	this.normalsBuffer.itemSize       = 3;
	this.normalsBuffer.itemType       = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getNormals(), gl.STATIC_DRAW);
	
	this.texCoordsBuffer              = gl.createBuffer(1);
	this.texCoordsBuffer.size         = this.geometry.getTexCoords().length / 2;
	this.texCoordsBuffer.itemSize     = 2;
	this.texCoordsBuffer.itemType     = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getTexCoords(), gl.STATIC_DRAW);	

	if (this.geometry.getColors != null) {
		this.colorsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getColors(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
	} else {
		this.colorsBuffer = null;
	}

    if (this.geometry.getTangents() != null) {
        this.tangentsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getTangents(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
    } else {
        this.tangentsBuffer = null;
    }
	
	if (geometry.indices != undefined) {
		this.indexBuffer          = gl.createBuffer(1);
		this.indexBuffer.numItems = this.geometry.getIndices().length;
		this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
	}

};

GG.TriangleMesh.prototype             = new GG.Object3D();
GG.TriangleMesh.prototype.constructor = GG.TriangleMesh;

GG.TriangleMesh.prototype.getGeometry = function() {
	return this.geometry;
};

GG.TriangleMesh.prototype.getPositionsBuffer = function() {
	return this.positionsBuffer;
};

GG.TriangleMesh.prototype.getNormalsBuffer = function() {
	return this.normalsBuffer;
};

GG.TriangleMesh.prototype.getTexCoordsBuffer = function() {
	return this.texCoordsBuffer;
};

GG.TriangleMesh.prototype.getColorsBuffer = function () {
	return this.colorsBuffer;
};

GG.TriangleMesh.prototype.getTangentsBuffer = function () {
    return this.tangentsBuffer;
};

GG.TriangleMesh.prototype.getIndexBuffer = function() {
	return this.indexBuffer;
};

GG.TriangleMesh.prototype.getFlatNormalsBuffer = function() {
	if (this.flatNormalsBuffer === undefined) {
		var flatNormals = this.geometry.getFlatNormals();
		if (flatNormals === undefined) {
			flatNormals = this.geometry.calculateFlatNormals();
		}
		if (flatNormals) {
			this.flatNormalsBuffer                = gl.createBuffer(1);
			this.flatNormalsBuffer.size           = this.geometry.getFlatNormals().length / 3;
			this.flatNormalsBuffer.itemSize       = 3;
			this.flatNormalsBuffer.itemType       = gl.FLOAT;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.flatNormalsBuffer);			
			gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getFlatNormals(), gl.STATIC_DRAW);
		} else {
			return null;
		}
	}
	return this.flatNormalsBuffer;
};