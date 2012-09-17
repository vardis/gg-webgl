PostProcessSample = function (spec) {
	this.camera        = null;
	this.jsonMesh      = null;
	this.planeMesh     = null;
	this.y_rot         = 0.0;
	this.mouseHandler  = null;
	this.light         = null;
	this.phongMat      = null;
	this.sceneRenderer = null;	
	this.loaded        = false;

	GG.SampleBase.call(this, spec);
};

PostProcessSample.prototype = new GG.SampleBase();
PostProcessSample.prototype.constructor = PostProcessSample;

PostProcessSample.prototype.initialize = function () {
	this.mouseHandler = new GG.MouseHandler();
	this.camera       = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 9.8]);	
	this.camera.getViewport().setWidth(gl.viewportWidth);
	this.camera.getViewport().setHeight(gl.viewportWidth);

	this.mouseHandler.setCamera(this.camera);
	
	var phongMat       = new GG.PhongMaterial();
	phongMat.ambient   = [0.05, 0.05, 0.05];
	phongMat.shininess = 20.0;

	var teapotMat       = new GG.PhongMaterial();
	teapotMat.diffuse      = [1.0, 0.5, 0.1];
	teapotMat.ambient   = [0.05, 0.05, 0.05];
	teapotMat.shininess = 20.0;
	//teapotMat.wireframe = true;
	teapotMat.flatShade = true;
	teapotMat.wireOffset = 0.01;
	teapotMat.wireWidth = 20.0;
	
	this.planeMesh          = new GG.TriangleMesh(new GG.PlaneGeometry(16));
	this.planeMesh.material = phongMat;

	var testScene = new GG.Scene();
	var that      = this;
	GG.Loader.loadJSON('teapot', '../assets/models/teapot.js', function(jsonObj) {
		that.jsonMesh          = new GG.TriangleMesh(GG.Geometry.fromJSON(jsonObj));
		that.jsonMesh.material = teapotMat;
		that.loaded            = true;
		testScene.addObject(that.jsonMesh)
	});

	this.light = new GG.Light({ 
		name : 'red', 
		type : GG.LT_POINT, 
		position : [0.0, 1.0, 5.0], 
		direction : [0.0, 0.0, 0.90],
		diffuse : [0.30, 0.20, 0.70],
		cosCutOff : 0.9
	});			
	
	
	testScene
		.addLight(this.light)
		.addObject(this.planeMesh)
		.shadows(false);
	
	this.sceneRenderer = new GG.DefaultSceneRenderer({ scene : testScene, camera : this.camera });		

	this.highResRT = new GG.RenderTarget({ width : 640, height : 480});
	this.highResRT.initialize();

	this.postProcess = new GG.PostProcessChain();
	this.postProcess.source(this.highResRT).destination(null)//.filter(myScreenFilter).vignette({ radius : 0.1 })
		.gamma(2.2).tvLines().vignette();

	this.blitPass = new GG.BlitPass(this.highResRT.getColorAttachment(0));
};

PostProcessSample.prototype.update = function () {	 
	
	this.light.position[0] = 15.0*Math.cos(0.5*this.y_rot);
	this.light.position[1] = 5.0
	this.light.position[2] = 15.0*Math.sin(0.5*this.y_rot);		
	
	if (this.loaded) {
		this.jsonMesh.setScale([0.3, 0.3, 0.3]);
		this.jsonMesh.setPosition([0.0, 5.0, -6.0]);
		this.jsonMesh.setRotation([this.y_rot, this.y_rot, 0.0]);
	}

	this.planeMesh.setScale([100.0, 100.0, 1.0]);
	this.planeMesh.setPosition([0.0, -14.0, 0.0]);
	this.planeMesh.setRotation([-1.0, 0.0, 0.0]);

	this.y_rot += GG.clock.deltaTime() * 0.001;
};

PostProcessSample.prototype.draw = function () {	 
	
	this.sceneRenderer.render(this.highResRT);

	// input RT -> output BACK_BUFFER or RT_2
	this.postProcess.process();

	//this.blitPass.sourceTexture = this.highResRT.getColorAttachment(0);
	//this.blitPass.render();
};
