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

	if (geometry.indices != undefined) {
		this.indexBuffer          = gl.createBuffer(1);
		this.indexBuffer.numItems = this.geometry.getIndices().length;
		this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
	}
}

GG.TriangleMesh.prototype = new GG.Object3D();
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

GG.TriangleMesh.prototype.getIndexBuffer = function() {
	return this.indexBuffer;
};