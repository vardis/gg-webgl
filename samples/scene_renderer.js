var renderer;
var cubeMesh;
var planeMesh;
var sphereMesh;

var y_rot = 0.0;

var mouseHandler;

var redLight, greenLight;
var phongMat;

var lightModel;

var highResFBO;

var sceneRenderer;

function tick() {

	GG.clock.tick();	

	renderer.prepareNextFrame();	
	drawScene();

	redLight.position[0]   = 20.0*Math.cos(y_rot);
	redLight.position[1]   = 4.2;		
	redLight.position[2]   = 20.0*Math.sin(y_rot);
	
	lightModel.setPosition(redLight.position);
	
	redLight.direction[0]  = -Math.cos(y_rot);
	redLight.direction[1]  = -0.2;		
	redLight.direction[2]  = -Math.sin(y_rot);		

	//redLight.position = [2.0, 5.0, 4.0];

	var lightDir = [-Math.cos(0.5*y_rot), 0.0, -Math.sin(0.5*y_rot)];
	redLight.shadowCamera.setup(redLight.position, [0.0,0.0,0.0], [0.0, 1.0, 0.0], -17.0, 17.0, -17.0, 17.0, 1.0, 70.0);

/*
	greenLight.position[0] = 15.0*Math.cos(0.5*y_rot);
	greenLight.position[1] = 10.0
	greenLight.position[2] = 15.0*Math.sin(0.5*y_rot);		
	*/
	//cubeMesh.setScale([0.8, 0.8, 0.8]);
	cubeMesh.setPosition([0.0, 1.0, -6.0]);
	cubeMesh.setRotation([0.5, y_rot, 0.2]);

	planeMesh.setScale([100.0, 100.0, 1.0]);
	planeMesh.setPosition([0.0, -1.0, 0.0]);
	planeMesh.setRotation([-1.0, 0.0, 0.0]);

	//sphereMesh.setScale([0.8, 0.8, 0.8]);
	//sphereMesh.setPosition([-1.0, -1.0, -12.0]);

sphereMesh.setPosition([0.0, 0.0, 0.0]);

	y_rot += GG.clock.deltaTime() * 0.001;
	
	requestAnimFrame(tick);
}

var blitPass;

function drawScene() {
	
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);				
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	sceneRenderer.render();	
}
			
function webGLStart(sampleName)  {
	try {
		canvas = document.getElementById("c");		
		
		gl = canvas.getContext("experimental-webgl");
		GG.context = gl;
		GG.canvas = canvas;
		GG.init();
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
		
		renderer = new GG.Renderer();
		renderer.setCamera(camera);
		GG.renderer = renderer;

		cubeMesh            = new GG.TriangleMesh(new GG.CubeGeometry());
		planeMesh           = new GG.TriangleMesh(new GG.PlaneGeometry(16));
		sphereMesh          = new GG.TriangleMesh(new GG.SphereGeometry());
		lightModel          = new GG.TriangleMesh(new GG.SphereGeometry());
		
		phongMat            = new GG.PhongMaterial();
		phongMat.ambient    = [0.0, 0.0, 0.0];
		phongMat.shininess  = 20.0;
		
		sphereMesh.material = phongMat;
		cubeMesh.material   = phongMat;
		planeMesh.material  = phongMat;

		lightModel.material = new GG.BaseMaterial({shadeless : true});

		redLight = new GG.Light({ 
			name : 'red', 
			type : GG.LT_DIRECTIONAL, 
			position : [0.0, 2.0, 4.0], 
			direction : [-0.0, -0.2, -1.0],
			diffuse : [1.0, 0.0, 0.0],
			cosCutOff : 0.9
		});
		var shadowCamera = new GG.OrthographicCamera();
		shadowCamera.setup(redLight.position, [0.0, -0.3, -4.0], [0.0, 1.0, 0.0], -7.0, 7.0, -7.0, 7.0, 1.0, 50.0);
		redLight.shadowCamera = shadowCamera;

		greenLight = new GG.Light({ 
			name : 'green', 
			type : GG.LT_POINT, 
			position : [10.0, 0.0, -2.0], 
			diffuse : [0.0, 1.0, 0.0]
		});

		testScene = new GG.Scene();
		testScene.addObject(planeMesh)
			.addObject(cubeMesh)
			.addObject(sphereMesh)
			.addObject(lightModel)
			.addLight(redLight)
			.addLight(greenLight)
			.shadows(true);

		
		sceneRenderer = new GG.DefaultSceneRenderer({ scene : testScene, camera : camera });


		tick();
		
	} catch (e) {
		alert("error " + e);
	}
}
