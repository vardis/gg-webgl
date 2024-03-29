GG.BaseMaterial = function(spec) {
	spec             = spec || {};
	
	this.technique   = spec.technique;
	
	this.ambient     = spec.ambient != undefined ? spec.ambient : [0.1, 0.1, 0.1];
	this.diffuse     = spec.diffuse != undefined ? spec.diffuse : [1.0, 1.0, 1.0];
	this.specular    = spec.specular != undefined ? spec.specular : [1.0, 1.0, 1.0];
	this.shininess   = spec.shininess != undefined ? spec.shininess : 10.0;
	
	this.specularMap = new GG.TextureUnit({ 'texture' : spec.specularMap, 'unit' : GG.TEX_UNIT_SPECULAR_MAP });
	this.alphaMap    = new GG.TextureUnit({ 'texture' : spec.alphaMap, 'unit' : GG.TEX_UNIT_ALPHA_MAP });

	this.normalMap   = new GG.TextureUnit({ 'texture' : spec.normalMap, 'unit' : GG.TEX_UNIT_NORMAL_MAP });
	this.parallaxMap = new GG.TextureUnit({ 'texture' : spec.parallaxMap, 'unit' : GG.TEX_UNIT_PARALLAX_MAP });
    this.normalMapScale = 0.0005;

	this.diffuseTextureStack = new GG.TextureStack();
	
	this.castsShadows    = spec.castsShadows === undefined ? false : spec.castsShadows;
	this.receivesShadows = spec.receivesShadows === undefined ? false : spec.receivesShadows;

	this.flatShade       = spec.flatShade != undefined ? spec.flatShade : false;
	this.phongShade      = spec.phongShade != undefined ? spec.phongShade : true;	
	this.shadeless       = spec.shadeless != undefined ? spec.shadeless : false;
	this.useVertexColors = spec.useVertexColors != undefined ? spec.useVertexColors : false;

	this.wireframe   = spec.wireframe != undefined ? spec.wireframe : false;
	this.wireOffset  = spec.wireOffset != undefined ? spec.wireOffset : 0.001;
	this.wireWidth   = spec.wireOffset != undefined ? spec.wireOffset : 1.0;

	// environment map to be sampled for reflections
	this.envMap          = spec.envMap != undefined ? spec.envMap : null;

	// amount of reflectance
	this.reflectance     = spec.reflectance != undefined ? spec.reflectance : 0.80;

	// controls the reflectance using a texture
	this.glowMap     = spec.glowMap;

	// index of refraction 
	this.IOR             = spec.IOR != undefined ? spec.IOR : [ 1.0, 1.0, 1.0 ];

	// index of refraction of the environment surounding the object 
	this.externalIOR     = spec.externalIOR != undefined ? spec.externalIOR : [ 1.330, 1.31, 1.230 ];

	this.fresnelBias     = spec.fresnelBias != undefined ? spec.fresnelBias : 1.0;
	this.fresnelExponent = spec.fresnelExponent != undefined ? spec.fresnelExponent : 2.0;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;

GG.BaseMaterial.BIT_DIFFUSE_MAP     = 1;
GG.BaseMaterial.BIT_SPECULAR_MAP    = 2;
GG.BaseMaterial.BIT_ALPHA_MAP       = 4;
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

GG.BaseMaterial.prototype.getDiffuseMap = function(index) {
	return this.diffuseTextureStack.getAt(index);
};

GG.BaseMaterial.prototype.setSpecularMap = function (texture) {
	this.specularMap = new GG.TextureUnit({ 'texture' : texture, 'unit' : GG.TEX_UNIT_SPECULAR_MAP });
    return this;
};

GG.BaseMaterial.prototype.setAlphaMap = function (texture) {
    this.alphaMap = new GG.TextureUnit({ 'texture' : texture, 'unit' : GG.TEX_UNIT_ALPHA_MAP});
    return this;
};

GG.BaseMaterial.prototype.setNormalMap = function (texture) {
    this.normalMap = new GG.TextureUnit({ 'texture' : texture, 'unit' : GG.TEX_UNIT_NORMAL_MAP});
    return this;
};

GG.BaseMaterial.prototype.setParallaxMap = function (texture) {
    this.parallaxMap = new GG.TextureUnit({ 'texture' : texture, 'unit' : GG.TEX_UNIT_PARALLAX_MAP});
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

