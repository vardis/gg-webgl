

function tick() {

	GG.clock.tick();	
	//GG.state.update();

	if (resourcesReady) {
		renderer.prepareNextFrame();	
		drawScene();

		//GG.sample.drawScene();


		redLight.position[0] = 30.0*Math.cos(y_rot);
		redLight.position[1] = 3.0;		
		redLight.position[2] = 30.0*Math.sin(y_rot);		

		greenLight.position[0] = 0.0;
		greenLight.position[1] = 5.0*Math.cos(0.5*y_rot);
		greenLight.position[2] = 5.0*Math.sin(0.5*y_rot);		
		
		y_rot += GG.clock.deltaTime() * 0.001;
	}	
	requestAnimFrame(tick);
}

var mesh, sphereMesh, technique, renderer, rt;
var cubeMesh;
var planeMesh;

var flatShadingTechnique;
var texturedTechnique, cubemapTechnique, phongTE;
var mouseHandler;
var resourcesReady = false;
var cubemapTexture;
var y_rot = 0.0;

var pt, ps;

var redLight, greenLight;
var scene;
var phongMat;

function drawScene() {
	/*
	rt.activate();
	technique.render(mesh);
	rt.deactivate();
*/
	if (scene == null) {
		scene = new GG.Scene('reflections');
		scene.addLight(redLight);
		scene.addLight(greenLight);
	}

	cubeMesh.setPosition([0.0, 0.0, -8.0]);
	//cubeMesh.setRotation([y_rot * 0.5, y_rot, 0.0]);
	cubeMesh.setRotation([0.5, y_rot, 0.2]);

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	
	//texturedTechnique.render(mesh);
	//cubemapTechnique.render(mesh);

	sphereMesh.setScale([0.7, 0.7, 0.7]);
	//sphereMesh.setRotation([y_rot * 0.5, y_rot, 0.0]);
	//technique.render(sphereMesh);
	phongTE.render(cubeMesh, [greenLight]);

	planeMesh.setScale([100.0, 100.0, 1.0]);
	planeMesh.setPosition([0.0, -22.0, 0.0]);
	planeMesh.setRotation([-1.0, 0.0, 0.0]);
	phongTE.render(planeMesh, [redLight]);

	//pt.render(ps);

	//flatShadingTechnique.render(cubeMesh);
}
		
var gl;
			
function webGLStart(sampleName)  {
	try {
		canvas = document.getElementById("c");		
		
		gl = canvas.getContext("experimental-webgl");
		GG.context = gl;
		GG.canvas = canvas;
		GG.clock = new GG.Clock();
		
		/**
		 * Provides requestAnimationFrame in a cross browser way.
		 */
		window.requestAnimFrame = (function() {
		  return window.requestAnimationFrame ||
				 window.webkitRequestAnimationFrame ||
				 window.mozRequestAnimationFrame ||
				 window.oRequestAnimationFrame ||
				 window.msRequestAnimationFrame ||
				 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
				   window.setTimeout(callback, 1000/60);
				 };
		})();

		var mouseHandler = new GG.MouseHandler();
		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);				

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		
		camera = new GG.PerspectiveCamera();
		camera.setPosition([0.0, 0.0, 2.8]);
		mouseHandler.setCamera(camera);

		GG.renderer = new GG.Renderer();

		renderer = new GG.Renderer();
		renderer.setCamera(camera);

		cubeMesh = new GG.TriangleMesh(new GG.CubeGeometry());
		sphereMesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 32, 32));
		planeMesh = new GG.TriangleMesh(new GG.PlaneGeometry(16));

		geom = new GG.SphereGeometry(1.0, 32, 32);		
		ps = new GG.StaticParticleSystem(geom);
		ps.setPointSize(9.0);
		pt = new GG.ParticlesTechnique({ renderer : renderer });
		pt.initialize();

		phongTE = new GG.PhongShadingTechnique({ renderer : renderer });
		phongTE.initialize();

		phongMat = new GG.BaseMaterial();
		phongMat.ambient = [0.0, 0.0, 0.0, 1.0];
		phongMat.shininess = 20.0;

		cubeMesh.material = phongMat;
		planeMesh.material = phongMat;

		redLight = new GG.Light({ 
			name : 'red', 
			type : GG.LT_SPOT, 
			position : [0.0, 2.0, 4.0], 
			direction : [-0.2, -0.3, -0.6],
			diffuse : [1.0, 0.0, 0.0],
			cosCutOff : 0.9
		});

		greenLight = new GG.Light({ 
			name : 'green', 
			type : GG.LT_POINT, 
			position : [10.0, 0.0, -2.0], 
			diffuse : [0.0, 1.0, 0.0]
		});

		GG.Loader.loadImages([
			'assets/textures/skybox_01_east.png',
			'assets/textures/skybox_01_west.png',
			'assets/textures/skybox_01_top.png',
			'assets/textures/skybox_01_bottom.png',
			'assets/textures/skybox_01_north.png',
			'assets/textures/skybox_01_south.png'
			], 
			function(images) {
				cubemapTexture = new GG.TextureCubemap({ 'images' : images });
				cubemapTechnique = new GG.CubemapTechnique({ renderer : renderer, 'cubemap' : cubemapTexture, 'size' : 1024 });
				cubemapTechnique.initialize();

				technique = new GG.ReflectiveTechnique({
					renderer : renderer, 
					cubemap : cubemapTexture
				});

				technique.initialize();
				resourcesReady = true;
			}
		);

/*
		cubemapTexture = new GG.TextureCubemap({ 'images' : [
			'assets/textures/skybox_01_east.png',
			'assets/textures/skybox_01_west.png',
			'assets/textures/skybox_01_top.png',
			'assets/textures/skybox_01_bottom.png',
			'assets/textures/skybox_01_north.png',
			'assets/textures/skybox_01_south.png'
			]});
*/		

/*
		cubemapTexture = new GG.TextureCubemap({ 'images' : [
			'assets/textures/hdr/grace_cross_irrad_mmp-posx.bin',
			'assets/textures/hdr/grace_cross_irrad_mmp-negx.bin',
			'assets/textures/hdr/grace_cross_irrad_mmp-posy.bin',
			'assets/textures/hdr/grace_cross_irrad_mmp-negy.bin',
			'assets/textures/hdr/grace_cross_irrad_mmp-posz.bin',
			'assets/textures/hdr/grace_cross_irrad_mmp-negz.bin'
			], 'floatTextures' : true});
*/
		//cubemapTechnique = new GG.CubemapTechnique({ renderer : renderer, 'cubemap' : cubemapTexture, 'size' : 1024 });
		//cubemapTechnique.initialize();

		mesh = new GG.TriangleMesh(new GG.SphereGeometry(1.0, 8, 8));
		//mesh.setScale([10.5, 10.5, 10.5]);
		
		
		flatShadingTechnique = new GG.ConstantLightingTechnique({ renderer : renderer, color : [ 0.0, 0.0, 1.0, 1.0 ]});	
		flatShadingTechnique.initialize();	
		/*
		rt = new GG.RenderTarget();

		technique = new GG.ConstantLightingTechnique({ renderer : renderer, color : [ 0.0, 0.0, 1.0, 1.0 ]});
		technique.initialize();

		texturedTechnique = new GG.TexturedShadelessTechnique(rt.getColorAttachment(0), { renderer : renderer });
		texturedTechnique.initialize();
		
		technique = new GG.ReflectiveTechnique({
			renderer : renderer, 
			cubemap : cubemapTexture
		});

		technique.initialize();
*/
		//var sample = eval('new ' + sampleName + '()');
		tick();
		
	} catch (e) {
		alert("error " + e);
	}
}