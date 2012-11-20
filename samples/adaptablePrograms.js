AdaptableProgramSample = function (spec) {
	this.sphere    = null;
	this.technique = null;
	this.camera        = null;
	this.material = null;
	this.context = null;
	this.mouseHandler  = null;
	this.y_rot         = 0.0;
	this.blendMode = "ADD";
	GG.SampleBase.call(this, spec);
};

AdaptableProgramSample.prototype = new GG.SampleBase();
AdaptableProgramSample.prototype.constructor = AdaptableProgramSample;

AdaptableProgramSample.prototype.initialize = function () {
	this.material = new GG.BaseMaterial();

	var that = this;	
	GG.Loader.loadImage('earth', '../assets/textures/earth.png', function (reqId, image) {		
		var earthTexture = GG.Texture.createTexture({ 
			'image' : image, width : 1024, 
			minFilter : gl.LINEAR, magFilter : gl.LINEAR, 
			'wrapS' : gl.REPEAT, wrapT : gl.REPEAT,
			flipY : false 
		});		
		that.material.addDiffuseTexture(earthTexture);
	});
	
	/*
	GG.Loader.loadImage('orange', '../assets/textures/orange.png', function (reqId, image) {		
		var orangeTexture = GG.Texture.createTexture({ 
			'image' : image, width : 1024, minFilter : gl.LINEAR, magFilter : gl.LINEAR, flipY : false 
		});		
		that.material.addDiffuseTexture(orangeTexture);
	});

	GG.Loader.loadImage('blue', '../assets/textures/blue.png', function (reqId, image) {		
		var blueTexture = GG.Texture.createTexture({ 
			'image' : image, width : 1024, minFilter : gl.LINEAR, magFilter : gl.LINEAR, flipY : false 
		});		
		that.material.addDiffuseTexture(blueTexture, that.getBlendMode());
	});
*/
	this.sphere = new GG.TriangleMesh(new GG.SphereGeometry());
	this.sphere.setMaterial(this.material);
	this.technique = new GG.TextureStackTechnique();

	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 9.8]);	
	this.camera.getViewport().setWidth(gl.viewportWidth);
	this.camera.getViewport().setHeight(gl.viewportHeight);

	this.mouseHandler = new GG.MouseHandler();
	this.mouseHandler.setCamera(this.camera);

	this.context = new GG.RenderContext({ camera : this.camera });
};

AdaptableProgramSample.prototype.getBlendMode = function () {
	var nameToMode = {
		'BLEND_MULTIPLY' : GG.BLEND_MULTIPLY, 
		'BLEND_ADD' : GG.BLEND_ADD, 
		'BLEND_SUBTRACT' : GG.BLEND_SUBTRACT, 
		'BLEND_DARKEN' : GG.BLEND_DARKEN, 
		'BLEND_COLOR_BURN' : GG.BLEND_COLOR_BURN, 
		'BLEND_LINEAR_BURN' : GG.BLEND_LINEAR_BURN, 
		'BLEND_LIGHTEN' : GG.BLEND_LIGHTEN, 
		'BLEND_SCREEN' : GG.BLEND_SCREEN, 
		'BLEND_COLOR_DODGE' : GG.BLEND_COLOR_DODGE, 
		'BLEND_OVERLAY' : GG.BLEND_OVERLAY, 
		'BLEND_SOFT_LIGHT' : GG.BLEND_SOFT_LIGHT, 
		'BLEND_HARD_LIGHT' : GG.BLEND_HARD_LIGHT, 
		'BLEND_VIVID_LIGHT' : GG.BLEND_VIVID_LIGHT, 
		'BLEND_LINEAR_LIGHT' : GG.BLEND_LINEAR_LIGHT, 
		'BLEND_PIN_LIGHT' : GG.BLEND_PIN_LIGHT
	};
	return nameToMode[this.blendMode];
};

AdaptableProgramSample.prototype.updateBlendMode = function () {
	console.log('updating blend mode to ' + this.blendMode);
	this.material.diffuseTextureStack.getAt(1).blendMode = this.getBlendMode();
};

AdaptableProgramSample.prototype.update = function () {	 
	this.y_rot += GG.clock.deltaTime() * 0.001;
	//this.sphere.setRotation([0.0, this.y_rot, 0.0]);
	if (this.material.diffuseTextureStack.size() > 0) {
		var e = this.material.diffuseTextureStack.getAt(0);
		e.offsetU = (e.offsetU + GG.clock.deltaTime()*0.0001) % 1.0;					
	}
};

AdaptableProgramSample.prototype.draw = function () {

	var vp = this.camera.getViewport();
	gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
	gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor[2], 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);
	gl.enable(gl.CULL_FACE);

	this.technique.render(this.sphere, this.context);
};
