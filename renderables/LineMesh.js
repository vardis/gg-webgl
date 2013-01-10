GG.LineMesh = function (geometry, material, spec) {
	spec = spec || {};
	GG.Object3D.call(this, geometry, material, { usesColors : true });	
	this.mode = GG.RENDER_LINES;
};

GG.LineMesh.prototype = new GG.Object3D();
GG.LineMesh.prototype.constructor = GG.LineMesh;

