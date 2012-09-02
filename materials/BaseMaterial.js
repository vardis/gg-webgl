GG.BaseMaterial = function(spec) {
	spec             = spec || {};
	
	this.technique   = spec.technique;
	
	this.ambient     = spec.ambient || [0.1, 0.1, 0.1];
	this.diffuse     = spec.diffuse || [1.0, 1.0, 1.0];
	this.specular    = spec.specular || [1.0, 1.0, 1.0];
	this.shininess   = spec.shininess || 10.0;
	
	this.diffuseMap  = spec.diffuseMap || null;
	this.specularMap = spec.specularMap || null;
	this.opacityMap  = spec.opacityMap || null;
	this.lightMap    = spec.lightMap || null;
	this.glowMap     = spec.glowMap || null;
	
	this.flatShade   = spec.flatShade || false;
	this.phongShade  = spec.phongShade || true;	
	this.shadeless   = spec.shadeless || false;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;

GG.BaseMaterial.prototype.getTechnique = function() {
	if (this.technique == null) {
		return this.pickTechnique();
	} else {
		return this.technique;
	}	
};

GG.BaseMaterial.prototype.setTechnique = function(technique) {
	this.technique = technique;
	return this;
};

GG.BaseMaterial.prototype.pickTechnique = function() {
	if (this.shadeless) {
		if (this.shadelessTechnique == null) {
			this.shadelessTechnique = new GG.ConstantLightingTechnique();
		}
		return this.shadelessTechnique;
	}
	if (this.flatShade) {
		if (this.flatShadeTechniqe == null) {
			this.flatShadeTechniqe = new GG.ConstantLightingTechnique();
		}
		return this.flatShadeTechniqe;
	} else {
		if (this.phongShadeTechnique == null) {
			this.phongShadeTechnique = new GG.PhongShadeTechnique();
		}
		return this.phongShadeTechnique;
	}
};
