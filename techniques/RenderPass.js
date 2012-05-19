/**
 * Represents a single render pass of a renderable object.
 * It provides a quick way to render an object and a building block
 * with which you can construct multi-pass rendering techniques.
 *
 * Creation parameters:
 * spec.sourceTexture : a texture object to bind as source before rendering
 * spec.vertexShader : the vertex shader code
 * spec.fragmentShader : the fragment shader code
 * spec.uniforms : a map containing the uniform names as keys and the uniform
 * values as the corresponding values.
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
 * object. The default implementation performs no rendering.
 */
GG.RenderPass = function (spec) {
	spec = spec || {}	
	this.vertexShader = spec.vertexShader || null;
	this.fragmentShader = spec.fragmentShader || null;

	this.uniforms = spec.uniforms || [];
	this.program = null;
}

GG.RenderPass.prototype.initialize = function() {
	// create the gpu program if it is not linked already
	this.program = GG.ProgramUtils.createProgram(this.vertexShader, this.fragmentShader);
	GG.ProgramUtils.getUniformsLocations(this.program, this.uniforms);
};

GG.RenderPass.prototype.render = function(renderable, targetFBO) {
	if (this.program == null) {
		this.initialize();
	}

	gl.useProgram(this.program);
	if (targetFBO) {
		targetFBO.activate();
	}

	GG.ProgramUtils.injectBuiltInAttributes(this.program);

	// this should be overridden in each subclass
	this.__setCustomAttributes();	

	// scans the passed uniforms and sets a value if any of those belong to the built-in list
	GG.ProgramUtils.injectBuiltInUniforms(this.program, this.uniforms);

	// this should be overridden in each subclass
	this.__setCustomUniforms();	

	this.__renderGeometry(renderable);
	
	if (targetFBO) {
		targetFBO.deactivate();
	}
	gl.useProgram(null);
};

// no-op default implementations
GG.RenderPass.prototype.__setCustomUniforms = function() {};
GG.RenderPass.prototype.__setCustomAttributes = function() {};
GG.RenderPass.prototype.__renderGeometry = function(renderable) {};

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
