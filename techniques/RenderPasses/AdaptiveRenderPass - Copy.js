GG.AdaptiveRenderPass = function (spec) {
	this.programCache = {};
	this.activeRenderAttributes = 0;	

	GG.RenderPass.call(this, spec);
};

GG.AdaptiveRenderPass.prototype             = new GG.RenderPass();
GG.AdaptiveRenderPass.prototype.constructor = GG.AdaptiveRenderPass;

GG.AdaptiveRenderPass.prototype.prepareForRendering = function (renderable, renderContext) {
	if (renderable.getMaterial() != null) {
		this.adaptShadersToMaterial(renderable.getMaterial());
	}	
	GG.RenderPass.prototype.prepareForRendering.call(this, renderable, renderContext);
};

GG.AdaptiveRenderPass.prototype.adaptShadersToMaterial = function (material) {
	var renderAttributes = this.getRenderAttributesForMaterial(material);
	if (this.shouldInvalidateProgram(renderAttributes)) {
		this.program = null;
		var cachedProgram = this.lookupCachedProgramInstance(renderAttributes);
		if (cachedProgram != null) {
			this.useProgramInstance(cachedProgram, renderAttributes);
		} else {
			this.createNewProgramInstance(material, renderAttributes);		
			this.storeProgramInstanceInCache(this.program, renderAttributes);	
		}		
	}
};

GG.AdaptiveRenderPass.prototype.useProgramInstance = function (program, renderAttributes) {
	this.program = program;
	this.activeRenderAttributes = renderAttributes;
};

GG.AdaptiveRenderPass.prototype.createNewProgramInstance = function (material, renderAttributes) {
	this.createShadersForMaterial(material);
	this.createGpuProgram();	
	this.useProgramInstance(this.program, renderAttributes);
};

GG.AdaptiveRenderPass.prototype.getRenderAttributesForMaterial = function (material) {
	return material.getRenderAttributesMask() & this.supportedRenderAttributesMask();
};

GG.AdaptiveRenderPass.prototype.shouldInvalidateProgram = function (renderAttributes) {	
	return this.program == null || this.activeRenderAttributes != renderAttributes;
};

GG.AdaptiveRenderPass.prototype.lookupCachedProgramInstance = function (renderAttributes) {
	return this.programCache[renderAttributes];
};

GG.AdaptiveRenderPass.prototype.storeProgramInstanceInCache = function (program, renderAttributes) {
	return this.programCache[renderAttributes] = program;
};

GG.AdaptiveRenderPass.prototype.createShadersForMaterial = function (material, renderAttributes) {
	throw "AdaptiveRenderPass.createShadersForMaterial is abstract";
};

GG.AdaptiveRenderPass.prototype.supportedRenderAttributesMask = function () {
	throw "AdaptiveRenderPass.supportedRenderAttributesMask is abstract";
};