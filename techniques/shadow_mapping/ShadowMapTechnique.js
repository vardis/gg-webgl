GG.SHADOW_MAPPING = 1;
GG.SHADOW_MAPPING_PCF = 2;

// variance shadow mapping
GG.SHADOW_MAPPING_VSM = 3;

// exponential shadow mapping
GG.SHADOW_MAPPING_ESM = 4;

/**
 * Represents a technique for rendering shadows using shadow mapping.
 * It acts as a facade, encapsulating the shadow map details from the
 * client code. It is customizable through a specifications object, which
 * can provide the following options:
 * 1) shadowMapWidth
 * 2) shadowMapHeight
 * 3) shadowFactor
 * 4) shadowType
 *
 * Internally it will delegating the calls to a shadow map specific technique
 * like a technique for PCF, another for variance shadow mapping, etc.
 */
GG.ShadowMapTechnique = function (spec) {
	this.options = GG.cloneDictionary(spec || {});
	this.shadowType = this.options.shadowType || GG.SHADOW_MAPPING;
	
	this.options.shadowMapWidth = this.options.shadowMapWidth || 800;
	this.options.shadowMapHeight = this.options.shadowMapHeight || 600;
	this.options.depthOffset = this.options.depthOffset || 0.04;
	this.options.shadowFactor = this.options.shadowFactor || 0.5;

	this.depthPassFBO = new GG.RenderTarget({
		width : this.options.shadowMapWidth,
		height : this.options.shadowMapHeight,
		clearColor : [1.0, 1.0, 1.0, 1.0]
	});
	this.depthPass = new GG.ShadowMapDepthPass();
	
};

/**
 * Called right before the main scene rendering pass.
 * In this case, it serves as an opportunity to build the shadow map.
 */
GG.ShadowMapTechnique.prototype.scenePrePass = function(scene, context) {
	var that = this;
	this.depthPass.setCamera(context.scene.listDirectionalLights()[0].getShadowCamera());

	try {
		this.depthPassFBO.activate();		
		scene.perObject(function (renderable) {
			that.depthPass.render(renderable, context);
		});

	} finally {
		this.depthPassFBO.deactivate();
	}
};

/**
 * Adds shadow map support to the input vertex and fragment programs.
 * Common factors are adapted in this method, while specific techniques
 * set their own additional code in their adaptProgram methods.
 */
GG.ShadowMapTechnique.prototype.adaptProgram = function(vertexProgram, fragmentProgram) {
	// common uniforms
	fragmentProgram
		.uniform('sampler2D', 'u_depthMap')
		.uniform('float', 'u_shadowFactor');

	var delegate = this.switchDelegate();
	delegate.adaptProgram(vertexProgram, fragmentProgram);	
};

/**
 * Called right before rendering using the current technique with the purpose
 * of preparing the uniform objects of the program.
 */
GG.ShadowMapTechnique.prototype.setUniforms = function(program, context) {
	gl.activeTexture(GG.TEX_UNIT_SHADOW_MAP.texUnit);
	gl.bindTexture(gl.TEXTURE_2D, this.depthPassFBO.getColorAttachment(0));
	gl.uniform1i(program['u_depthMap'], GG.TEX_UNIT_SHADOW_MAP.uniform);

	gl.uniform1f(program.u_shadowFactor, this.options.shadowFactor);
	
	var delegate = this.switchDelegate();
	delegate.setUniforms(program, context, this.options);
};

GG.ShadowMapTechnique.prototype.switchDelegate = function() {
	switch (this.shadowType) {
		case GG.SHADOW_MAPPING_PCF:
			return GG.ShadowMapPCF;			
		case GG.SHADOW_MAPPING:
		default:
			return GG.ShadowMapSimple;
			break;
	}
};