ReflectionsSample = function (spec) {
	this.renderer            = null;
	this.cubeMesh            = null;
	this.cubemapTechnique    = null;
	this.skyMesh             = null;
	this.y_rot               = 0.0;
	this.camera              = null;
	this.mouseHandler        = null;
	this.resourcesReady      = false;
	this.reflectiveTechnique = null;

	GG.SampleBase.call(this, spec);
};

ReflectionsSample.prototype = new GG.SampleBase();
ReflectionsSample.prototype.constructor = ReflectionsSample;

ReflectionsSample.prototype.initialize = function () {
	this.camera = new GG.PerspectiveCamera();
	this.camera.setPosition([0.0, 0.0, 2.8]);

	this.renderer = new GG.Renderer();
	this.renderer.setCamera(this.camera);
	GG.renderer = this.renderer;
	
	this.mouseHandler = new GG.MouseHandler();
	this.mouseHandler.setCamera(this.camera);

	this.cubeMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 64, 64));//new GG.CubeGeometry());
	this.skyMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 32, 32));

	this.reflectiveTechnique = new GG.ReflectiveTechnique();
	var material = new GG.BaseMaterial();
	material.diffuse = [ 0.30, 0.30, 0.30 ];
	this.cubeMesh.setMaterial(material);

	var that = this;
	GG.Loader.loadImages([
		'../assets/textures/skybox_01_east.png',
		'../assets/textures/skybox_01_west.png',
		'../assets/textures/skybox_01_top.png',
		'../assets/textures/skybox_01_bottom.png',
		'../assets/textures/skybox_01_north.png',
		'../assets/textures/skybox_01_south.png'
		], 
		function(images) {
			var cubemapTexture = new GG.TextureCubemap({ 'images' : images });
			that.cubemapTechnique = new GG.CubemapTechnique({ 				
				'cubemap' : cubemapTexture, 
				'size' : 1024 });

			material.envMap = cubemapTexture;
			
			that.resourcesReady = true;
		}		
	);
};

ReflectionsSample.prototype.update = function () {	 	
	this.y_rot += GG.clock.deltaTime() * 0.001;		
};

ReflectionsSample.prototype.draw = function () {	
	
	if (!this.resourcesReady) return;
	
	var ctx            = new GG.RenderContext();
	ctx.camera         = this.camera;

	this.cubeMesh.setPosition([0.0, 1.0, -4.0]);
	this.cubeMesh.setRotation([this.y_rot * 0.5, this.y_rot, 0.0]);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);				

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	
	this.cubemapTechnique.render(this.skyMesh, ctx);
	this.reflectiveTechnique.render(this.cubeMesh, ctx);
};


