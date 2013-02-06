FogSample = function (spec) {
	this.material = null;
	this.light = null;
	this.renderContext = null;
	this.mouseHandler  = null;
	GG.SampleBase.call(this, spec);
};

FogSample.prototype = new GG.SampleBase();
FogSample.prototype.constructor = FogSample;

FogSample.prototype.initializeAssets = function () {
	this.assetsLoaded = true;
};

FogSample.prototype.initializeWithAssetsLoaded = function () {
	this.cubeMaterial = new GG.BaseMaterial();
	this.cubeMaterial.diffuse = [1,0,0];

	this.cubes = [];
	for (var i =0; i < 10; i++) {
		var cube = new GG.TriangleMesh(new GG.CubeGeometry());
		var x = (i & 1) ? -3 : 3;
		cube.setPosition([x, 1.0, i * 3]);
		cube.setMaterial(this.cubeMaterial);
		this.cubes.push(cube);
	}
	this.technique = new GG.PhongShadingTechnique();

	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 9.8]);	
	this.camera.getViewport().setWidth(gl.viewportWidth);
	this.camera.getViewport().setHeight(gl.viewportHeight);

	this.light = new GG.Light({ 
		name : 'sun', 
		type : GG.LT_DIRECTIONAL, 
		position : [3.0, 0.10, 4.0], 
		direction : [-0.5, 0.0, -0.50],
		diffuse : [1.0, 0.8, 0.7],
		cosCutOff : 0.9
	});

	this.mouseHandler = new GG.MouseHandler();
	this.mouseHandler.setCamera(this.camera);

	this.scene = new GG.Scene();
	this.scene.showFog = true;

	
	this.renderState = new GG.RenderState();
	this.renderState.enableFog = true;
	this.renderState.fogStart = 2;
	this.renderState.fogEnd = 100;
	this.renderState.fogColor = [0.7,0.7,0.7];
	this.renderState.fogMode = GG.Constants.FOG_EXP2;
	this.renderState.fogDensity = 0.076;	
 
	// to be driven by the gui
	this.fogMode = this.renderState.fogMode;

	this.renderContext = new GG.RenderContext({ camera : this.camera, light : this.light, 'renderState' : this.renderState });
	this.initialized = true;
};

FogSample.prototype.update = function () {
	GG.SampleBase.prototype.update.call(this);
};

FogSample.prototype.draw = function () {
    var vp = this.camera.getViewport();
    gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
    gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor()[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);

    var self = this;
    this.cubes.forEach(function (cube) {
    	self.technique.render(cube, self.renderContext);
    });
};
