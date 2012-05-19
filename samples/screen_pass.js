var renderer;
var cubeMesh;
var planeMesh;

var phongTE;
var mouseHandler;
var y_rot = 0.0;

var redLight, greenLight;
var phongMat;

var highResFBO;
var blitPass;

function tick() {

	GG.clock.tick();	

	renderer.prepareNextFrame();	
	drawScene();

	redLight.position[0] = 30.0*Math.cos(y_rot);
	redLight.position[1] = 3.0;		
	redLight.position[2] = 30.0*Math.sin(y_rot);		

	greenLight.position[0] = 0.0;
	greenLight.position[1] = 5.0*Math.cos(0.5*y_rot);
	greenLight.position[2] = 5.0*Math.sin(0.5*y_rot);		
	
	cubeMesh.setPosition([0.0, 0.0, -8.0]);
	cubeMesh.setRotation([0.5, y_rot, 0.2]);

	planeMesh.setScale([100.0, 100.0, 1.0]);
	planeMesh.setPosition([0.0, -22.0, 0.0]);
	planeMesh.setRotation([-1.0, 0.0, 0.0]);

	y_rot += GG.clock.deltaTime() * 0.001;
	
	requestAnimFrame(tick);
}

function drawScene() {
	highResFBO.activate();
	
	phongTE.render(cubeMesh, [greenLight]);
	phongTE.render(planeMesh, [redLight]);

	highResFBO.deactivate();

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	blitPass.sourceTexture = highResFBO.getColorAttachment(0);
	blitPass.render();
}
			
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
		planeMesh = new GG.TriangleMesh(new GG.PlaneGeometry(16));
		
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

		highResFBO = new GG.RenderTarget({
			width : 1024,
			height : 1024,
			minFilter : gl.LINEAR,
			magFilter : gl.LINEAR
		});

		blitPass = new GG.BlitPass(highResFBO.getColorAttachment(0));

		tick();
		
	} catch (e) {
		alert("error " + e);
	}
}