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
 * spec.customRendering : a flag that indicates whether the default rendering method is to be skipped
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
	spec                 = spec || {};
	this.vertexShader    = spec.vertexShader;
	this.fragmentShader  = spec.fragmentShader;
	this.customRendering = spec.customRendering != undefined ? spec.customRendering : false;
	this.callback        = spec.callback != undefined ? spec.callback : this;
	this.attributeNames  = spec.attributeNames || [];
	this.program         = null;
	this.usesLighting    = spec.usesLighting != undefined ? spec.usesLighting : true;
};

GG.RenderPass.prototype.constructor = GG.RenderPass;

GG.RenderPass.prototype.createGpuProgram = function() {
	// create the gpu program if it is not linked already
	if (!this.program) {
        if (this.vertexShader == null || this.fragmentShader == null) {
            this.__createShaders();
        }
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
	if (renderable && !this.customRendering) {
		var options = {
			mode : this.overrideRenderPrimitive(renderable)
		};
		renderContext.renderer.render(renderable, this.program, options);
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
/**
 * Called when the gpu program is about to be initialized and if the vertexShader and/or fragmentShader
 * fields are not set yet.
 */
GG.RenderPass.prototype.__createShaders = function() {};
GG.RenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomAttributes = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__renderGeometry = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__locateCustomUniforms = function(program) {};

/**
 * Subclasses can override this method in order to render lines or points, fans, strips, etc.
 */
GG.RenderPass.prototype.overrideRenderPrimitive = function(renderable) {
	return null;
};
