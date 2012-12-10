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
	spec = spec || {};
	this.vertexShader   = spec.vertexShader;
	this.fragmentShader = spec.fragmentShader;
	this.renderableType = spec.renderableType != undefined ? spec.renderableType : GG.RenderPass.MESH;
	this.callback       = spec.callback != undefined ? spec.callback : this;
	this.attributeNames = spec.attributeNames || [];
	this.program        = null;
	this.usesLighting   = spec.usesLighting != undefined ? spec.usesLighting : true;
};

GG.RenderPass.prototype.constructor = GG.RenderPass;

GG.RenderPass.MESH = 1;

GG.RenderPass.prototype.createGpuProgram = function() {
	// create the gpu program if it is not linked already
	if (!this.program) {
		this.program = GG.ProgramUtils.createProgram(this.vertexShader, this.fragmentShader);
	}

	if (this.program) {
		GG.ProgramUtils.getAttributeLocations(this.program);	
		GG.ProgramUtils.getUniformsLocations(this.program);	
		this.__locateCustomUniforms(this.program);
	}
};


GG.RenderPass.prototype.destroy = function() {
	if (this.program) gl.deleteProgram(this.program);
};

GG.RenderPass.prototype.prepareForRendering = function(renderable, renderContext) {
	if (this.program == null) {
		this.createGpuProgram();
	}
};

GG.RenderPass.prototype.setShaderParametersForRendering = function(renderable, renderContext) {
	gl.useProgram(this.program);

	// this should be overridden in each subclass
	this.__setCustomAttributes(renderable, renderContext, this.program);	

	// scans the passed uniforms and sets a value if any of those belong to the built-in list
	GG.ProgramUtils.injectBuiltInUniforms(this.program, renderContext, renderable);

	// this should be overridden in each subclass	
	this.__setCustomUniforms(renderable, renderContext, this.program);		
};

GG.RenderPass.prototype.setRenderState = function(renderable, renderContext) {
	this.__setCustomRenderState(renderable, renderContext, this.program);
};

GG.RenderPass.prototype.submitGeometryForRendering = function(renderable, renderContext) {
	if (renderable && this.renderableType == GG.RenderPass.MESH) {
		var options = {
			mode : this.getRenderPrimitive(renderable)
		};
		renderContext.renderer.renderMesh(renderable, this.program, options);
	} else {
		this.callback.__renderGeometry(renderable);
	}
};

GG.RenderPass.prototype.finishRendering = function(renderable, renderContext) {
	gl.useProgram(null);
};

GG.RenderPass.prototype.render = function(renderable, renderContext) {
	
	this.prepareForRendering(renderable, renderContext);

	if (this.program) {
		this.setRenderState(renderable, renderContext);

		this.setShaderParametersForRendering(renderable, renderContext);
		
		this.submitGeometryForRendering(renderable, renderContext);
		
		this.finishRendering();	
	}
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
GG.RenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomAttributes = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__renderGeometry = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__locateCustomUniforms = function(program) {};

/**
 * Subclasses can override this method in order to render lines or points, fans, strips, etc.
 */
GG.RenderPass.prototype.getRenderPrimitive = function(renderable) {
	return gl.TRIANGLES;
};
