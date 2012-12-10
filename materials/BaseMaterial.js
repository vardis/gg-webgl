GG.BaseMaterial = function(spec) {
	spec             = spec || {};
	
	this.technique   = spec.technique;
	
	this.ambient     = spec.ambient != undefined ? spec.ambient : [0.1, 0.1, 0.1];
	this.diffuse     = spec.diffuse != undefined ? spec.diffuse : [1.0, 1.0, 1.0];
	this.specular    = spec.specular != undefined ? spec.specular : [1.0, 1.0, 1.0];
	this.shininess   = spec.shininess != undefined ? spec.shininess : 10.0;
	
	this.specularMap = new GG.TextureUnit({ 'texture' : spec.specularMap, 'unit' : GG.TEX_UNIT_SPECULAR_MAP });
	this.opacityMap  = new GG.TextureUnit({ 'texture' : spec.opacityMap, 'unit' : GG.TEX_UNIT_ALPHA_MAP });
	this.lightMap    = spec.lightMap;
	this.glowMap     = spec.glowMap;

	this.diffuseTextureStack = new GG.TextureStack();
	
	this.flatShade   = spec.flatShade != undefined ? spec.flatShade : false;
	this.phongShade  = spec.phongShade != undefined ? spec.phongShade : true;	
	this.shadeless   = spec.shadeless != undefined ? spec.shadeless : false;
	this.wireframe   = spec.wireframe != undefined ? spec.wireframe : false;
	this.wireOffset  = spec.wireOffset != undefined ? spec.wireOffset : 0.001;
	this.wireWidth   = spec.wireOffset != undefined ? spec.wireOffset : 1.0;

	// environment map to be sampled for reflections
	this.envMap          = spec.envMap != undefined ? spec.envMap : null;
	// amount of reflectance
	this.reflectance     = spec.reflectance != undefined ? spec.reflectance : 0.80;

	// index of refraction 
	this.IOR             = spec.IOR != undefined ? spec.IOR : [ 1.0, 1.0, 1.0 ];

	// index of refraction of the environment surounding the object 
	this.externalIOR     = spec.externalIOR != undefined ? spec.externalIOR : [ 1.330, 1.31, 1.230 ];

	this.fresnelBias     = spec.fresnelBias != undefined ? spec.fresnelBias : 0.44;
	this.fresnelExponent = spec.fresnelExponent != undefined ? spec.fresnelExponent : 2.0;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;

GG.BaseMaterial.BIT_DIFFUSE_MAP     = 1;
GG.BaseMaterial.BIT_SPECULAR_MAP    = 2;
GG.BaseMaterial.BIT_OPACITY_MAP     = 4;
GG.BaseMaterial.BIT_LIGHT_MAP       = 16;
GG.BaseMaterial.BIT_GLOW_MAP        = 32;
GG.BaseMaterial.BIT_ENVIRONMENT_MAP = 64;

GG.BaseMaterial.prototype.getTechnique = function() {	
	return this.pickTechnique();
};

GG.BaseMaterial.prototype.setTechnique = function(technique) {
	this.technique = technique;
	return this;
};

GG.BaseMaterial.prototype.addDiffuseTexture = function(texture, blendMode) {
	this.diffuseTextureStack.add(texture, blendMode);
};

GG.BaseMaterial.prototype.setSpecularMap = function (texture) {
	this.specularMap = new GG.TextureUnit({ 'texture' : texture, 'unit' : GG.TEX_UNIT_SPECULAR_MAP });
    return this;
};

GG.BaseMaterial.prototype.pickTechnique = function() {
	if (this.wireframe) {
		if (this.wireframeTechnique == null) {
			this.wireframeTechnique = new GG.WireframeTechnique();
		}
		return this.wireframeTechnique;
	}
	if (this.shadeless) {
		if (this.shadelessTechnique == null) {
			this.shadelessTechnique = new GG.ConstantColorTechnique();
		}
		return this.shadelessTechnique;
	}
	
	if (this.phongShadeTechnique == null) {
		this.phongShadeTechnique = new GG.PhongShadingTechnique();
	}
	return this.phongShadeTechnique;
	
};

