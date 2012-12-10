/**
 * A render pass that adapts its shaders according to the material being used for rendering.
 * This class serves as a base class for render passes that need to act in an adaptive manner
 * because of a large number of possible material inputs that would otherwise need to be
 * handled manually or by a super-shader approach.
 * As compiling on-the-fly a gpu program is expensive in terms of time, this base class also
 * provides a memory for recently created instances of the render pass. Therefore in most cases
 * there's no compilation taking place, a pre-existing instance is rather fetched from the
 * cache and used in render the current object.
 *
 * Base classes need to override the following methods:
 *  a) createShadersForMaterial
 *     This is where the logic should be placed for creating the gpu program which will render
 *     the current material.
 *  b) hashMaterial
 *     This method should generate a unique key per class of materials. The returned value is
 *     used to determine whether the current program can handle a material.
 */
GG.AdaptiveRenderPass = function (spec) {
	this.programCache = {};
	this.activeHash = null;

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
	// if the program cannot handle the current material, either lookup
	// an appropriate instance from the cache or create a new on on the fly
	var hash = this.hashMaterial(material);
	if (this.shouldInvalidateProgram(hash)) {
		this.program = null;
		var cachedProgram = this.lookupCachedProgramInstance(hash);
		if (cachedProgram != null) {
			this.useProgramInstance(cachedProgram, hash);
		} else {
			this.createNewProgramInstance(material, hash);		
			this.storeProgramInstanceInCache(this.program, hash);	
		}		
	}
};

GG.AdaptiveRenderPass.prototype.useProgramInstance = function (program, hash) {
	this.program = program;
	this.activeHash = hash;
};

GG.AdaptiveRenderPass.prototype.createNewProgramInstance = function (material, hash) {
	this.createShadersForMaterial(material);
	this.createGpuProgram();	
	this.useProgramInstance(this.program, hash);
};

GG.AdaptiveRenderPass.prototype.shouldInvalidateProgram = function (hash) {	
	return this.program == null || this.activeHash != hash;
};

GG.AdaptiveRenderPass.prototype.lookupCachedProgramInstance = function (hash) {
	return this.programCache[hash];
};

GG.AdaptiveRenderPass.prototype.storeProgramInstanceInCache = function (program, hash) {
	return this.programCache[hash] = program;
};

GG.AdaptiveRenderPass.prototype.createShadersForMaterial = function (material) {
	throw "AdaptiveRenderPass.createShadersForMaterial is abstract";
};

GG.AdaptiveRenderPass.prototype.hashMaterial = function (material) {
	throw "AdaptiveRenderPass.hashMaterial is abstract";
};