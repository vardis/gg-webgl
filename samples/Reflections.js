ReflectionsSample = function() {
	this.cubemapTexture = null;
	this.y_rot          = 0.0;
	this.initialized    = false;
	this.resourcesReady = false;
};

ReflectionsSample.prototype.drawScene = function() {
	this.cubeMesh.setPosition([0.0, 1.0, -4.0]);
	this.cubeMesh.setRotation([y_rot * 0.5, y_rot, 0.0]);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	
	this.cubemapTechnique.render(this.skyMesh);
	this.reflectiveTechnique.render(cubeMesh);
};

ReflectionsSample.prototype.update = function() {
	if (!this.initialized) {
		this.initialize();
	} else if (GG.resourcesReady) {
		this.loadingState();
	} else {
		this.startedState();
	}
};

ReflectionsSample.prototype.initialize = function() {
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.clearColor(0.0, 0.0, 0.0, 1.0);				

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 2.8]);
	
	this.mouseHandler = new GG.MouseHandler();
	this.mouseHandler.setCamera(camera);

	this.cubeMesh = new GG.TriangleMesh(new GG.CubeGeometry());
	this.skyMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 32, 32));

	GG.Loader.loadImages([
		'assets/textures/skybox_01_east.png',
		'assets/textures/skybox_01_west.png',
		'assets/textures/skybox_01_top.png',
		'assets/textures/skybox_01_bottom.png',
		'assets/textures/skybox_01_north.png',
		'assets/textures/skybox_01_south.png'
		], 
		function(images) {
			this.cubemapTexture = new GG.TextureCubemap({ 'images' : images });
			this.cubemapTechnique = new GG.CubemapTechnique({ 
				renderer : GG.renderer, 
				'cubemap' : this.cubemapTexture, 
				'size' : 1024 });
			this.cubemapTechnique.initialize();

			this.reflectiveTechnique = new GG.ReflectiveTechnique({
				renderer : GG.renderer, 
				cubemap : this.cubemapTexture
			});
			this.reflectiveTechnique.initialize();

			this.resourcesReady = true;
		}
	);
	this.initialized = true;
};

ReflectionsSample.prototype.startedState = function() {
	GG.renderer.prepareNextFrame();	
	this.drawScene();

	y_rot += the_clock.deltaTime() * 0.0001;
};