GG.RenderState = function (spec) {
	spec = spec || {};
	/*false
	this.enableDepthTest = spec.enableFog != null ? spec.enableFog : false;
	this.depthClearValue = ...;
	this.depthFunc = ...;
	this.cullFace = ...;
	this.enableCulling = ...;
	this.setFrontFace = ...;
	this.enableBlend = spec.enableFog != null ? spec.enableFog : false;
	this.blendMode;
	this.blendFactors;
	*/

	this.enableFog  = spec.enableFog  != null ? spec.enableFog : false;
	this.fogStart   = spec.fogStart   != null ? spec.fogStart  : 10;
	this.fogEnd     = spec.fogEnd     != null ? spec.fogEnd    : 100;
	this.fogColor   = spec.fogColor   != null ? spec.fogColor  : [0.5, 0.5, 0.5];
	this.fogMode    = spec.fogMode    != null ? spec.fogMode   : GG.Constants.FOG_LINEAR;
	this.fogDensity = spec.fogDensity != null ? spec.fogDensity  : 2;
};

GG.RenderState.prototype.constructor = GG.RenderState;