GG.Geometry = function (spec) {
	this.vertices = null;
	this.normals = null;
	this.texCoords = null;
	this.colors = null;
	this.tangents = null;
	this.indices = null;
};

GG.Geometry.prototype.constructor = GG.Geometry;

GG.Geometry.prototype.getVertices = function() {
	return this.vertices;
};

GG.Geometry.prototype.getNormals = function() {
	return this.normals;
};

GG.Geometry.prototype.getTexCoords = function() {
	return this.texCoords;
};

GG.Geometry.prototype.getTangents = function() {
	return this.tangents;
};

GG.Geometry.prototype.getColors = function() {
	return this.colors;
};

GG.Geometry.prototype.getIndices = function() {
	return this.indices;
};