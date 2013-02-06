GG.Billboard = function (material) {	
	spec               = {};	
	spec.usesTexCoords = true;
	this.billboardType = spec.billboardType !== undefined ? spec.billboardType : GG.Billboard.CYLINDRICAL_BILLBOARD;
	this.width = spec.width !== undefined ? spec.width : 1.0;
	this.height = spec.height !== undefined ? spec.height : 1.0;

	GG.Object3D.call(this, new GG.Quad(), material, spec);	
};

GG.Billboard.prototype = new GG.Object3D();
GG.Billboard.prototype.constructor = GG.Billboard;

GG.Billboard.CYLINDRICAL_BILLBOARD = 1;
GG.Billboard.SPHERICAL_BILLBOARD = 2;
