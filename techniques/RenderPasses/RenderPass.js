/**
 * Represents a single render pass of a renderable object.
 * It provides a quick way to render an object and a building block
 * with which you can construct multi-pass rendering techniques.
 *
 * Creation parameters:
 * spec.sourceTexture : a texture object to bind as source before rendering
 * spec.vertexShader : the vertex shader code
 * spec.fragmentShader : the fragment shader code
 * spec.attributeNames : a list containing the attribute names.
 * spec.renderableType : a constant that defines the type of renderable that
 * this pass expects. If it is set to undefined or null, then the __renderGeometry
 * method will be called to do the actual rendering. Otherwise, RenderPass will
 * take care of calling the appropriate render method for this renderable type.
 * 
 * The class is extensible by providing implementations for the following member
 * methods:
 *
 * RenderPass.__setCustomUniforms : overridde this method to set values for your
 * uniforms
 *
 * RenderPass.__setCustomAttributes : overridde this method to set custom program 
 * attributes
 *
 * RenderPass.__renderGeometry : overridde this method to render the renderable
 * object. The default implementation performs no rendering. Not necessary if you
 * provide a renderableType in the input specifications.
 */
GG.RenderPass = function (spec) {
	spec = spec || {}	
	this.vertexShader = spec.vertexShader || null;
	this.fragmentShader = spec.fragmentShader || null;
	this.renderableType = spec.renderableType || GG.RenderPass.MESH;
	this.callback = spec.callback || this;
	this.attributeNames = spec.attributeNames || [];
	this.program = null;
	this.adaptsToScene = spec.adaptsToScene || false;
	this.usesLighting = spec.usesLighting || true;
};

GG.RenderPass.MESH = 1;

GG.RenderPass.prototype.initialize = function() {
	// create the gpu program if it is not linked already
	if (!this.program) {
		this.program = GG.ProgramUtils.createProgram(this.vertexShader, this.fragmentShader);
	}
	this.initializeAttributes();
	this.initializeUniforms();
};

GG.RenderPass.prototype.initializeAttributes = function() {
	GG.ProgramUtils.getAttributeLocations(this.program);
};

GG.RenderPass.prototype.initializeUniforms = function() {
	GG.ProgramUtils.getUniformsLocations(this.program);	
	//this.__locateCustomUniforms(this.program);	
};

GG.RenderPass.prototype.render = function(renderable, renderContext) {
	if (this.program == null) {
		this.initialize();
	}

	gl.useProgram(this.program);

	// this should be overridden in each subclass
	this.__setCustomAttributes(renderable, renderContext, this.program);	

	// scans the passed uniforms and sets a value if any of those belong to the built-in list
	GG.ProgramUtils.injectBuiltInUniforms(this.program, renderContext, renderable);

	// this should be overridden in each subclass	
	this.__setCustomUniforms(renderable, renderContext, this.program);	

	if (renderable && this.renderableType == GG.RenderPass.MESH) {
		renderContext.renderer.renderMesh(renderable, this.program);
	} else {
		this.callback.__renderGeometry(renderable);
	}
	
	gl.useProgram(null);
};

GG.RenderPass.prototype.isAdaptableToScene = function() {
	return this.adaptsToScene;
};

GG.RenderPass.prototype.usesSceneLighting = function() {
	return this.usesLighting;
};

GG.RenderPass.prototype.getVertexShaderSource = function() {
	return this.vertexShader;
};

GG.RenderPass.prototype.getFragmentShaderSource = function() {
	return this.fragmentShader;
};

GG.RenderPass.prototype.setProgram = function(program) {
	this.program = program;
	return this;
};

// no-op default implementations
GG.RenderPass.prototype.__locateCustomUniforms = function(program) {};
GG.RenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomAttributes = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__renderGeometry = function(renderable, ctx, program) {};

/*
pass = new RenderPass({
	vertexShader : GG.ShaderLib.blurX.vertex.strong(4),
	fragmentShader : GG.ShaderLib.blurX.fragment.strong(4),
	screenPass : true
})

technique {

	phongPass.render(sceneFBO)
	blitPass.setSourceTexture(sceneFBO.texture0);
	blitPass.render(sceneCopyFBO)
	downscalePass.setSourceTexture(sceneCopyFBO);
	downscalePass.render(ppBuffer.targetFBO);
	ppBuffer.swap()
	blurXPass.render(ppBuffer.targetFBO)
	ppBuffer.swap()
	blurYPass.render(ppBuffer.targetFBO)
	upscalePass.setSourceTexture(ppBuffer.targetFBO);
	upscalePass.render(upscaledFBO);
	combineAndGlowPass.setOriginalTexture(sceneCopyFBO.texture0)
	combineAndGlowPass.setScaledTexture(upscaledFBO.texture0)
	combineAndGlowPass.render(finalFBO)

	postProcessPass.setSourceTexture(finalFBO)
	postProcessPass.render()
}
*/
