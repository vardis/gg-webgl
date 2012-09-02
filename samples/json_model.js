var the_sample = function (spec) {

	var camera;
	var renderer;
	var jsonMesh;
	var planeMesh;

	var y_rot = 0.0;

	var mouseHandler;

	var light;
	var phongMat;

	var sceneRenderer;

	var loaded = false;

	return {
		initialize : function (argument) {
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0.0, 0.0, 0.0, 1.0);				

			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);

			mouseHandler = new GG.MouseHandler();
			camera       = new GG.PerspectiveCamera();
			camera.setPosition([0.0, 0.0, 9.8]);
			mouseHandler.setCamera(camera);
			
			renderer    = new GG.Renderer();
			GG.renderer = renderer;
			renderer.setCamera(camera);
			
			phongMat            = new GG.PhongMaterial();
			phongMat.ambient    = [0.05, 0.05, 0.05];
			phongMat.shininess  = 20.0;

			var flatMat = new GG.BaseMaterial({ flatShade : true, diffuse : [0.0,0.0,1.0] });
			
			planeMesh = new GG.TriangleMesh(new GG.PlaneGeometry(16));
			planeMesh.material  = phongMat;

			GG.Loader.loadJSON('teapot', 'assets/models/monkey.js', function(jsonObj) {
				jsonMesh          = new GG.TriangleMesh(GG.Geometry.fromJSON(jsonObj));
				var mat = new GG.BaseMaterial();
				mat.shadeless = true;
				mat.diffuse = [0.6, 0.6,0.9];
				phongMat.specular = [0.0, 0.0, 0.0];
				jsonMesh.material = phongMat;
				testScene.addObject(jsonMesh)
				loaded = true;
			});

			light = new GG.Light({ 
				name : 'red', 
				type : GG.LT_DIRECTIONAL, 
				position : [0.0, 1.0, 5.0], 
				direction : [0.0, 0.0, 0.90],
				diffuse : [0.80, 0.70, 0.70],
				cosCutOff : 0.9
			});
			var shadowCamera = new GG.OrthographicCamera();
			shadowCamera.setup(light.position, [0.0, -0.3, -4.0], [0.0, 1.0, 0.0], -7.0, 7.0, -7.0, 7.0, 1.0, 50.0);
			light.shadowCamera = shadowCamera;
			
			testScene = new GG.Scene();
			testScene.addObject(planeMesh)
				.addLight(light)
				.shadows(false);
			
			sceneRenderer = new GG.DefaultSceneRenderer({ scene : testScene, camera : camera });			
		},

		update : function() {
			renderer.prepareNextFrame();	

			light.position[0] = 15.0*Math.cos(0.5*y_rot);
			light.position[1] = 5.0
			light.position[2] = 15.0*Math.sin(0.5*y_rot);		
			
			if (loaded) {
				//jsonMesh.setScale([1.4, 1.4, 1.4]);
				jsonMesh.setPosition([0.0, 1.0, -6.0]);
				jsonMesh.setRotation([y_rot, y_rot, 0.0]);
			}

			planeMesh.setScale([100.0, 100.0, 1.0]);
			planeMesh.setPosition([0.0, -14.0, 0.0]);
			planeMesh.setRotation([-1.0, 0.0, 0.0]);

			y_rot += GG.clock.deltaTime() * 0.001;
		},

		draw : function() {
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			sceneRenderer.render();
		}
	}	

}();

function tick() {
	GG.clock.tick();	
	
	the_sample.update();
	the_sample.draw();
	requestAnimFrame(tick);
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

		the_sample.initialize();

		tick();

	} catch (e) {
		alert("error " + e);
	}
}
