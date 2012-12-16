/**
 * Each TriangleMesh is associated with a Geomtry that stores the actual vertices,
 * normals, and the rest vertex attributes. 
 * Only geometries of triangle lists are supported. 
 */
GG.TriangleMesh = function(geometry, material, spec) {
	
	this.geometry                     = geometry;
	this.material                     = material;	

    if (this.geometry.getVertices() != null) {
        this.positionsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getVertices(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
    } else {
        this.positionsBuffer = null;
    }

    if (this.geometry.getNormals() != null) {
        this.normalsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getNormals(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
    } else {
        this.normalsBuffer = null;
    }

    if (this.geometry.getTexCoords() != null) {
        this.texCoordsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getTexCoords(), 'itemSize' : 2, 'itemType' : gl.FLOAT });
    } else {
        this.texCoordsBuffer = null;
    }

	if (this.geometry.getColors() != null) {
		this.colorsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getColors(), 'itemSize' : 3, 'itemType' : gl.UNSIGNED_BYTE });
	} else {
		this.colorsBuffer = GG.AttributeDataBuffer.newEmptyDataBuffer();
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

GG.TriangleMesh.prototype.getVertexCount = function() {
    return this.positionsBuffer != null ? this.positionsBuffer.getItemCount() : 0;
};

GG.TriangleMesh.prototype.setColorData = function(typedArray) {
    if (this.colorsBuffer != null) this.colorsBuffer.destroy();
    this.colorsBuffer = new GG.AttributeDataBuffer({normalize : true, arrayData : typedArray, itemSize : 3, itemType : gl.UNSIGNED_BYTE, itemCount : this.getVertexCount() });
};

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