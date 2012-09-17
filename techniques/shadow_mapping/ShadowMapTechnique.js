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
	this.shadowType = this.options.shadowType != undefined ? this.options.shadowType : GG.SHADOW_MAPPING;
	
	this.options.shadowMapWidth  = this.options.shadowMapWidth != undefined ? this.options.shadowMapWidth : 800;
	this.options.shadowMapHeight = this.options.shadowMapHeight != undefined ? this.options.shadowMapHeight : 600;
	this.options.depthOffset     = this.options.depthOffset != undefined ? this.options.depthOffset : 0.01;
	this.options.shadowFactor    = this.options.shadowFactor != undefined ? this.options.shadowFactor : 0.5;

	var shadowMap = new GG.Texture({
		width : this.options.shadowMapWidth,
		height : this.options.shadowMapHeight,
		flipY : false
	});

	this.depthPassFBO = new GG.RenderTarget({
		width : this.options.shadowMapWidth,
		height : this.options.shadowMapHeight,
		// this might not work...
		//useColor : false,
		clearColor : [1.0, 1.0, 1.0, 1.0],
		colorAttachment : shadowMap
	});
	this.depthPassFBO.initialize();
	this.depthPassFBO.getColorAttachment(0).setWrapMode(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

	this.depthPass = new GG.ShadowMapDepthPass();
	
	this.delegates = {};
	this.delegates[GG.SHADOW_MAPPING]     = new GG.ShadowMapSimple();
	this.delegates[GG.SHADOW_MAPPING_PCF] = new GG.ShadowMapPCF();
	this.delegates[GG.SHADOW_MAPPING_VSM] = new GG.ShadowMapVSM();	
};

GG.ShadowMapTechnique.prototype.getShadowMapTexture = function() {
	return this.depthPassFBO.getColorAttachment(0);
};

/**
 * Creates the shadow map by rendering the depth of the objects as seen
 * by the light. The shadow projection is parameterized through the shadow
 * camera of the active light.
 */
GG.ShadowMapTechnique.prototype.buildShadowMap = function(objects, context) {
	
	this.depthPass.setCamera(context.light.getShadowCamera());	
	this.depthPass.vsmMode = (this.shadowType == GG.SHADOW_MAPPING_VSM);
	
	try {
		var that = this;
		this.depthPassFBO.activate();		
		objects.forEach(function (renderable) {
			that.depthPass.render(renderable, context);
		});

	} finally {
		this.depthPassFBO.deactivate();
	}

	// notify the active delegate that the shadow map is constructed
	var delegate = this.switchDelegate();
	delegate.setShadowMap(this.depthPassFBO.getColorAttachment(0));
	delegate.setOptions(this.options);

	if (delegate.postShadowMapConstruct) {
		delegate.postShadowMapConstruct();
	}
};


GG.ShadowMapTechnique.prototype.render = function(renderable, context) {
	var delegate = this.switchDelegate();
	delegate.render(renderable, context);
};

GG.ShadowMapTechnique.prototype.switchDelegate = function() {
	if (this.shadowType in this.delegates) {
		return this.delegates[this.shadowType];
	} else {
		return this.delegates[GG.SHADOW_MAPPING];
	}
};