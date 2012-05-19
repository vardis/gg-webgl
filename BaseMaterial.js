GG.BaseMaterial = function(spec) {
	spec = spec || {};
	this.ambient = spec.ambient || [0.1, 0.1, 0.1, 1.0];
	this.diffuse = spec.diffuse || [1.0, 1.0, 1.0, 1.0];
	this.specular = spec.specular || [1.0, 1.0, 1.0, 1.0];
	this.shininess = spec.shininess || 10.0;

	this.diffuseMap = null;
	this.specularMap = null;
	this.opacityMap = null;
	this.lightMap = null;
	this.glowMap = null;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;