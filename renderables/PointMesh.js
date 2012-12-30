GG.PointMesh = function (geometry, material, spec) {
	spec = spec || {};
	GG.Object3D.call(this, geometry, material, { useColors : true, useTexCoords : true });	
	this.mode = GG.RENDER_POINTS;
	this.pointSize = spec.pointSize != undefined ? spec.pointSize : 1.0;  
};

GG.PointMesh.prototype = new GG.Object3D();
GG.PointMesh.prototype.constructor = GG.PointMesh;

GG.PointMesh.prototype.setPoints = function (pointsArray) {
	// body...
};

GG.PointMesh.prototype.getPointSize = function() {
	return this.pointSize;
};

GG.PointMesh.prototype.setPointSize = function(sz) {
	this.pointSize = sz;
};
