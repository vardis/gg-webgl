BillboardingSample = function (spec) {
	this.billboard        = null;
	this.technique     = null;	
	this.material      = null;
	this.light         = null;
	this.renderContext = null;
	
	GG.SampleBase.call(this, spec);
};

BillboardingSample.prototype = new GG.SampleBase();
BillboardingSample.prototype.constructor = BillboardingSample;

BillboardingSample.prototype.initializeAssets = function () {
	this.material = new GG.BaseMaterial();

	var self = this;	
	GG.Loader.loadImage('earth', '../assets/textures/tree.png', function (reqId, image) {		
		var treeTexture = GG.Texture.createTexture({ 
			'image' : image, width : 1024, height : 512,
			minFilter : gl.LINEAR, magFilter : gl.LINEAR, 			
			flipY : true 
		});		
		self.material.addDiffuseTexture(treeTexture);
		self.assetsLoaded = true;
	});
};


BillboardingSample.prototype.initializeWithAssetsLoaded = function () {
	this.billboard               = new GG.Billboard(this.material);
	this.billboard.billboardType = GG.Billboard.SPHERICAL_BILLBOARD;
	this.technique               = new GG.BillboardingTechnique();
	
	this.mouseHandler.updateCamera();
	
	this.renderContext           = new GG.RenderContext({ camera : this.camera });
	this.initialized             = true;
};

BillboardingSample.prototype.update = function () {
	GG.SampleBase.prototype.update.call(this);
};

BillboardingSample.prototype.draw = function () {
    var vp = this.camera.getViewport();
    gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
    gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor()[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.technique.render(this.billboard, this.renderContext);
};
