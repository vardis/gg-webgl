
var GG = {
	version : "1.0",
	context : null,
	PI : 3.14159265358979323846,

	joinArrays : function(arrays) {
		var joined = [];
		for (var i = 0; i < arrays.length; i++) {
			joined = joined.concat(arrays[i]);
		}
		return joined;
	}
};
			
var gl, canvas;
			
String.prototype.times = function(n) {
    return Array.prototype.join.call({length:n+1}, this);
};
			


		
GG.Clock = function() {
	this.startTime = new Date();
	this.pauseTime = null;
	this.lastTick = new Date();
	this.lastDelta = 0.0;
	this.running = true;
	this.scaleFactor = 1.0;
};

GG.Clock.prototype.constructor = GG.Clock;

GG.Clock.prototype.tick = function() {
	if (this.running) {
		var now = new Date();
		this.lastDelta = this.scaleFactor * (now.getTime() - this.lastTick.getTime());
		this.lastTick = now;
	} else {
		this.lastDelta = 0.0;
	}
};

GG.Clock.prototype.start = function() {
	this.running = true;
};

GG.Clock.prototype.pause = function() {
	this.running = false;
	this.pauseTime = new Date();
};

GG.Clock.prototype.reset = function() {
	this.running = true;
	this.startTime = new Date();
	this.lastTick = new Date();
	this.lastDelta = 0.0;
};

GG.Clock.prototype.getScaleFactor = function() {
	return this.scaleFactor;
};

GG.Clock.prototype.setScaleFactor = function(s) {
	this.scaleFactor = s;
	return this;
};

GG.Clock.prototype.deltaTime = function() {
	return this.lastDelta;
};

GG.Clock.prototype.totalRunningTime = function() {
	if (this.running) {
		return this.lastTick.getTime() - this.startTime.getTime();
	} else {
		return this.pauseTime.getTime() - this.startTime.getTime();
	}
};
GG.AjaxUtils = function() {
	return {
		/**
		 * Creates an asynchronous request that reads binary data in the form of an ArrayBuffer object.
		 * https://developer.mozilla.org/en/javascript_typed_arrays
		 *
		 * E.g. 
		 * GG.AjaxUtils.arrayBufferRequest('http://localhost/data/array.bin', on_my_load);
		 */
		arrayBufferRequest : function(url, callback) {
			var request = new XMLHttpRequest();
  			request.open("GET", url, true);
  			request.responseType = "arraybuffer";
			request.onload = function() {				
				var arraybuffer = null;
				if (request.readyState == 4) {
      
			      // HTTP reports success with a 200 status. 
			      // The file protocol reports success with zero.
			      var success = request.status == 200 || request.status == 0;      
			      if (success) arraybuffer = request.response;
			    }
				callback(arraybuffer, url);
			};
			request.send();
		}
	};
}();
GG.Loader = {
	/** 
	 * Loads an image asynchronously 
	 * The callback must accept two parameters: the request id and the resulting Image object.
	 * The returned Image will be null in case of error.
	 */
	loadImage : function(requestId, url, callback) {
		var img = new Image();
		img.onload = function(ev, exception) {
			if (callback) {
				callback(requestId, ev.target);
			}
		};
		img.src = url;
	},

	loadImages : function(urls, callback) {
		var loaded = 0;
		var images = [];
		for ( i = 0; i < urls.length; i++) {
			GG.Loader.loadImage("dummy", urls[i], new function(index) {
				return function(req, img) {
					loaded++;
					images[index] = img;
					if (loaded == urls.length) {
						callback(images);	
					}				
				}
			}(i));
		}
	},

	loadHDRImage : function(requestId, url, callback) {
		GG.AjaxUtils.arrayBufferRequest(url, function(image, exception) {
			if (callback) {
				callback(requestId, exception ? null : image);
			}						
		});
	},
}
GG.ShaderLib = new function (argument) {
	
	return lib = {
		blit : {
			vertex : [
			"attribute vec4 a_position;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	v_texCoords = 0.5*(a_position.xy + vec2(1.0));",
			"	gl_Position = a_position;",
			"}"].join('\n'),

			fragment : [
			"precision mediump float;",
			"uniform sampler2D u_sourceTexture;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	gl_FragColor = texture2D(u_sourceTexture, v_texCoords);",
			"}"].join('\n'),

			uniforms : []
		}
	}
};


GG.MathUtils = function() {
	return {
		PI : 3.14159265358979323846,

		degToRads : function(degrees) {
			return this.PI * degrees / 360.0;
		},

		radsToDeg : function(rads) {
			return 180.0 * rads / this.PI;
		}
	}
}();


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
GG.ProgramUtils = function() {
	return {
		compileShader : function(shaderType, source) {
			shader = gl.createShader(shaderType);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		},

		createProgram : function(vertexShaderSource, fragmentShaderSource) {
			vertexShader = GG.ProgramUtils.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
			fragmentShader = GG.ProgramUtils.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
			if (vertexShader == null || fragmentShader == null) {
				return null;
			}
			shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			  shaderProgram = null;
			}
			return shaderProgram;
		},

		/**
		 * Given a map object, that defines the names of the uniforms, 
		 * this method retrieves the location for each uniform and sets 
		 * it as a new property of the program object. So, for e.g., the 
		 * location of the uniform named u_viewMatrix will be stored at program[u_viewMatrix].		 
		 */
		getUniformsLocations : function(program, uniformNames) {
			uniformNames.forEach(function(u) {
				program[u] = gl.getUniformLocation(program, u);
			});
		},

		/**
		 * Scans the input program for uniforms with names that correspond
		 * to predefined semantics. For example the uniform program.fTime0_X will
		 * be set to a float value equal to the total time elapsed since the 
		 * application started running.
		 */
		injectBuiltInUniforms : function(program) {
			predefined = {
				'fTime0_X' : function(p, uname) { gl.uniform1f(p[uname], GG.clock.totalRunningTime()); },
				'u_matView' : function(p, uname) { gl.uniformMatrix4fv(p[uname], false, GG.renderer.getViewMatrix()); },
				'u_matProjection' : function(p, uname) { gl.uniformMatrix4fv(p[uname], false, GG.renderer.getProjectionMatrix()); },

			}
			for ( u in predefined) {
				predefined[u](program, u);
			}
		},

		injectBuiltInAttributes : function(program) {
			predefined = [
				'a_position',
				'a_normal',
				'a_texCoords'
			];
			for (attr in GG.GLSLProgram.BuiltInAttributes) {
				loc = gl.getAttribLocation(program, GG.GLSLProgram.BuiltInAttributes[attr]);
				if (loc >= 0) {
					program[attr] = loc;
				}
			}
		}
	}
}();
GG.LT_DIRECTIONAL = 1;
GG.LT_POINT = 2;
GG.LT_SPOT = 3;

GG.Light = function(spec) {
	spec = spec || {};
	this.lightName = spec.name || 'light';
	this.lightType = spec.type || GG.LT_POINT;
	this.position = spec.position || [0.0, 0.0, 0.0];
	this.direction = spec.direction || [0.0, 0.0, -1.0];
	this.diffuse = spec.diffuse || [1.0, 1.0, 1.0];
	this.specular = spec.specular || [1.0, 1.0, 1.0];
	this.attenuation = spec.attenuation || 5.0;
	this.cosCutOff = spec.cosCutOff || 0.5;
};

GG.Light.prototype = new GG.Light();
GG.Light.prototype.constructor = GG.Light;
GG.Geometry = function (spec) {
	this.vertices = null;
	this.normals = null;
	this.texCoords = null;
	this.colors = null;
	this.tangents = null;
	this.indices = null;
};

GG.Geometry.prototype.constructor = GG.Geometry;

GG.Geometry.prototype.getVertices = function() {
	return this.vertices;
};

GG.Geometry.prototype.getNormals = function() {
	return this.normals;
};

GG.Geometry.prototype.getTexCoords = function() {
	return this.texCoords;
};

GG.Geometry.prototype.getTangents = function() {
	return this.tangents;
};

GG.Geometry.prototype.getColors = function() {
	return this.colors;
};

GG.Geometry.prototype.getIndices = function() {
	return this.indices;
};
/**
 * Provides the geometry for a unit square plane, centered at the
 * origin of its local coordinate system.
 * It is parameterizable about the uniform division along
 * the x and y axis.
 */
GG.PlaneGeometry = function(divisions) {
	divs = divisions - 1 || 1;

	verticesPerDim = divs+1;
	this.vertices = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.normals = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.texCoords = new Float32Array(verticesPerDim*verticesPerDim*2);
	this.indices = new Uint16Array(divs*divs*6);

	i = 0;
	for (y = 0; y <= 1.0; y += 1.0/divs) {
		for (x = 0; x <= 1.0; x += 1.0/divs) {
			this.vertices[3*i] = x - 0.5;
			this.vertices[3*i + 1] = y - 0.5;
			this.vertices[3*i + 2] = 0.0;
			this.normals[3*i] = 0.0;
			this.normals[3*i + 1] =0.0;
			this.normals[3*i + 2] = 1.0;
			this.texCoords[2*i] = x;
			this.texCoords[2*i + 1] = y;

			++i;
		}	
	}

	i = 0;
	for (ny = 0; ny < verticesPerDim - 1; ny++) {
		for (nx = 0; nx < verticesPerDim - 1; nx++) {
			vi = ny*verticesPerDim + nx;
			this.indices[i] = vi;
			this.indices[i+1] = vi + 1;
			this.indices[i+2] = vi + verticesPerDim + 1;
			this.indices[i+3] = vi;
			this.indices[i+4] = vi + verticesPerDim + 1;
			this.indices[i+5] = vi + verticesPerDim;
			i += 6;
		}
	}
};

GG.PlaneGeometry.prototype = new GG.Geometry();
GG.PlaneGeometry.prototype.constructor = GG.PlaneGeometry;
GG.SphereGeometry = function(radius, rings, segments) {
	this.radius = radius || 1.0;
	this.rings = rings || 16;
	this.segments = segments || 16;
	/*
	this.vertices = [];
	this.normals = [];
	this.texCoords = [];
	*/
	this.indices2 = [];	

	this.vertices = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.normals = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.texCoords = new Float32Array(2 *  (this.rings + 1) * (this.segments + 1));
	this.indices = new Uint16Array((this.segments + 1) * this.rings * 6);
	vv = 0;
	ii = 0;

	var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    latitudeBands = this.rings;
    longitudeBands = this.segments;
/*
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        normalData.push(x);
        normalData.push(y);
        normalData.push(z);
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);
      }
    }

	var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }

    this.vertices = new Float32Array(vertexPositionData);
	this.normals = new Float32Array(normalData);
	this.texCoords = new Float32Array(textureCoordData);
	this.indices = new Uint16Array(indexData);
*/
 	fDeltaRingAngle = (GG.PI / this.rings);
	fDeltaSegAngle = (2.0 * GG.PI / this.segments);
	offset = 0;

	// Generate the group of rings for the sphere
	for (ring = 0; ring <= this.rings; ring++) {
		r0 = this.radius * Math.sin(ring * fDeltaRingAngle);
		y0 = this.radius * Math.cos(ring * fDeltaRingAngle);

		// Generate the group of segments for the current ring
		for (seg = 0; seg <= this.segments; seg++) {
			x0 = r0 * Math.sin(seg * fDeltaSegAngle);
			z0 = r0 * Math.cos(seg * fDeltaSegAngle);

			// Add one vertex to the strip which makes up the sphere
			invLen = 1.0 / Math.sqrt(x0*x0 + y0*y0 + z0*z0);

			this.vertices[vv*3] = x0;
			this.vertices[vv*3 + 1] = y0;
			this.vertices[vv*3 + 2] = z0;

			this.normals[vv*3] = invLen*x0;
			this.normals[vv*3 + 1] = invLen*y0;
			this.normals[vv*3 + 2] = invLen*z0;
			
			this.texCoords[vv*2] = seg / this.segments;
			this.texCoords[vv*2 + 1] = seg / this.rings;

			vv++;

			
/*
			if (ring != this.rings) {
				// each vertex (except the last) has six indices pointing to it
				this.indices[ii*6] = offset + this.segments + 1;
				this.indices[ii*6 + 1] = offset;
				this.indices[ii*6 + 2] = offset + this.segments;
				this.indices[ii*6 + 3] = offset + this.segments + 1;
				this.indices[ii*6 + 4] = offset + 1;
				this.indices[ii*6 + 5] = offset;
				ii += 1;

				this.indices2.push(offset + this.segments + 1);
				this.indices2.push(offset);
				this.indices2.push(offset + this.segments);
				this.indices2.push(offset + this.segments + 1);
				this.indices2.push(offset + 1);
				this.indices2.push(offset);

				offset++;
			}
			*/
		}; // end for seg
	} // end for ring

	var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
	this.indices = new Uint16Array(indexData);
	
};

GG.SphereGeometry.prototype = new GG.Geometry();
GG.SphereGeometry.prototype.constructor = GG.SphereGeometry;

GG.SphereGeometry.prototype.getFaces = function() {
	return this.faces;
};


/**
 *	mesh = new GG.CubeGeometry(
 *		{
 *			pos : true,
 *			indices : "16" (or null for no index, "32" for 32bit indices),
 *			normals : true, false, null
 *			texCoords : true, false, null,
 *			tangents : true, false, null,
 *			bitangents : true, false, null
 *		}
 *	);
 *
 *	mesh.attributes("normals").foreach(...)
 */
GG.CubeGeometry = function(dimensions) {
	dimensions = dimensions || [1.0, 1.0, 1.0]
	x = dimensions[0], y = dimensions[1], z = dimensions[2];
	
	this.vertices = new Float32Array(36*3);
	this.normals = new Float32Array(36*3);
	this.texCoords = new Float32Array(36*2);
	vv = 0;
	nn = 0;
	st = 0;
	
	// +Z
	this.vertices.set([
		-x, -y, z,
		 x,  y, z,
		-x,  y, z,
		-x, -y, z,
		 x, -y, z,
		 x,  y, z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0
	], nn);
	nn += 18;
	
	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;

	// -Z
	this.vertices.set([
		 x, -y, -z,
		-x,  y, -z,
		 x,  y, -z,
		 x, -y, -z,
		-x, -y, -z,
		-x,  y, -z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// +X
	this.vertices.set([
		x, -y,  z,
		x,  y, -z,
		x,  y,  z,
		x, -y,  z,
		x, -y, -z,
		x,  y, -z
	], vv);
	vv += 18;

	this.normals.set([
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	


	// -X
	this.vertices.set([
		-x, -y, -z,
		-x,  y,  z,
		-x,  y, -z,
		-x, -y, -z,
		-x, -y,  z,
		-x,  y,  z
	], vv);
	vv += 18;
	
	this.normals.set([
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// +Y
	this.vertices.set([
		-x, y,  z,
		 x, y, -z,
		-x, y, -z,
		-x, y,  z,
		 x, y,  z,
		 x, y, -z
	], vv);
	vv += 18;
	
	this.normals.set([
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// -Y
	this.vertices.set([
		-x, -y, -z,
		 x, -y,  z,
		-x, -y,  z,
		-x, -y, -z,
		 x, -y, -z,
		 x, -y,  z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	
		
	this.faces = new Uint16Array(this.vertices.length / 3);
	for (f = 0; f < this.vertices.length / 3*3; f++) {
		this.faces[f] = [ 3*f, 3*f + 1, 3*f + 2 ];
	}
	
};

GG.CubeGeometry.prototype = new GG.Geometry();
GG.CubeGeometry.prototype.constructor = GG.CubeGeometry;

GG.CubeGeometry.prototype.getFaces = function() {
	return this.faces;
};

/**
 * Converts every face of this mesh to a triangle.
 */
GG.CubeGeometry.prototype.triangulate = function() {
};
GG.ScreenAlignedQuad = function() {
	this.vertices = new Float32Array(6*3);
	this.normals = new Float32Array(6*3);
	this.texCoords = new Float32Array(6*2);

	/*
	
	2 +---+ 1
	  |  /|
	  | / |
	0 +---+ 3

	triangles 0,1,2 and 0,3,1
	*/
	this.vertices.set([
		-1.0, -1.0, 0.0,
		1.0, 1.0, 0.0,
		-1.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0,
		1.0, 1.0, 0.0
		]);	

	this.normals.set([
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0
		]);	

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
		]);


}

GG.ScreenAlignedQuad.prototype = new GG.Geometry();
GG.ScreenAlignedQuad.prototype.constructor = GG.ScreenAlignedQuad;
GG.Object3D = function(spec) {	
	this.pos = [0.0, 0.0, 0.0];
	this.rotation = [0.0, 0.0, 0.0];
	this.scale = [1.0, 1.0, 1.0];	
}


GG.Object3D.prototype.getPosition = function() { return this.pos; },
GG.Object3D.prototype.setPosition = function(p) { this.pos = p; },
GG.Object3D.prototype.getRotation = function() { return this.rotation; },
GG.Object3D.prototype.setRotation = function(o) { this.rotation = o; },
GG.Object3D.prototype.setScale = function(s) { this.scale = s; }
GG.Object3D.prototype.getScale = function() { return this.scale; }

GG.Object3D.prototype.getModelMatrix=function() {
	var model = mat4.create();
	mat4.identity(model);

	mat4.translate(model, this.pos);	
	mat4.rotate(model, this.rotation[1], [0, 1, 0]);
	mat4.rotate(model, this.rotation[0], [1, 0, 0]);
	mat4.rotate(model, this.rotation[2], [0, 0, 1]);
	mat4.scale(model, this.scale);
	return model;
};
/**
 * Encapsulates a cubemap texture. 
 * Basic texture attributes are inherited from the Texture2D class.
 *
 * Example construction:
 * cubemap = GG.TextureCubemap({ 
 		'images' : [ posx, negx, posy, negy, posz, negz],
 		'size' : 1024
 * });
 */
GG.TextureCubemap = function(spec) {

	this.faces = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
	];
	this.images = {};

	this.imagesSize = spec.size || 1024;
	this.hdrTexures = spec.floatTextures || false;
	
	this.gltex = gl.createTexture();

	if (this.hdrTexures) {
		this.loadHDRTextures(spec);
	} else {
		this._initFromLDRImages(spec);
		//this.loadTextures(spec);
	}	
};

GG.TextureCubemap.prototype.constructor = GG.TextureCubemap;

GG.TextureCubemap.prototype.loadTextures = function(spec) {
	for (i = 0; i < this.faces.length; i++) {
		var that = this;
		var f = this.faces[i];
		var img = new Image();
		img.onload = new function(face) {
			return function(ev, exception) {
				if (ev) {
					that.handleImageOnLoad(face, ev.target);
				}			
			};
		}(f);
		img.src = spec.images[i];
	}	
};

GG.TextureCubemap.prototype.loadHDRTextures = function(spec) {
	for (i = 0; i < this.faces.length; i++) {
		var that = this;
		var f = this.faces[i];
		this.images[f] = null;
		GG.AjaxUtils.arrayBufferRequest(spec.images[i], new function(face) {
			return function(image, exception) {
				if (image) {
					that.handleImageOnLoad(face, image);
				}			
			};
		}(f));
	}	
	
};

GG.TextureCubemap.prototype._initFromLDRImages = function(spec) {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
	
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	this.images = spec.images;
	for (var ii = 0; ii < this.faces.length; ++ii) {
		gl.texImage2D(this.faces[ii], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[ii]);
	}
	
	
   	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};

GG.TextureCubemap.prototype.handleImageOnLoad = function(target, image) {
	this.images[target] = image;
	var numLoaded = 0;
	for (var ii = 0; ii < this.faces.length; ++ii) {
	    if (this.images[this.faces[ii]]) {
	      ++numLoaded;
	    }
  	}

  	if (numLoaded == 6) {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
		if (this.hdrTexures) {
			this.imagesSize = Math.sqrt(this.images[this.faces[0]].byteLength / Float32Array.BYTES_PER_ELEMENT / 3);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

			for (var ii = 0; ii < this.faces.length; ++ii) {
			    gl.texImage2D(this.faces[ii], 0, gl.RGB, this.imagesSize, this.imagesSize, 0, gl.RGB, gl.FLOAT, new Float32Array(this.images[this.faces[ii]]));
		  	}
			
		} else {
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			for (var ii = 0; ii < this.faces.length; ++ii) {
				gl.texImage2D(this.faces[ii], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.images[this.faces[ii]]);
			}
			
		}
	   
	   	gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

  	}
	
};

GG.TextureCubemap.prototype.bind = function() {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
};

GG.TextureCubemap.prototype.unbind = function() {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};
GG.TriangleMesh = function(geometry, material, spec) {
	
	this.geometry = geometry;
	this.material = material;	
	
	this.positionsBuffer = gl.createBuffer(1);
	this.positionsBuffer.size = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.numTriangles = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.itemSize = 3;
	this.positionsBuffer.itemType = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getVertices(), gl.STATIC_DRAW);
	
	this.normalsBuffer = gl.createBuffer(1);
	this.normalsBuffer.size = this.geometry.getNormals().length / 3;
	this.normalsBuffer.itemSize = 3;
	this.normalsBuffer.itemType = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getNormals(), gl.STATIC_DRAW);
	
	this.texCoordsBuffer = gl.createBuffer(1);
	this.texCoordsBuffer.size = this.geometry.getTexCoords().length / 2;
	this.texCoordsBuffer.itemSize = 2;
	this.texCoordsBuffer.itemType = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getTexCoords(), gl.STATIC_DRAW);	

	if (geometry.indices != undefined) {
		this.indexBuffer = gl.createBuffer(1);
		this.indexBuffer.numItems = this.geometry.getIndices().length;
		this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
	}
}

GG.TriangleMesh.prototype = new GG.Object3D();
GG.TriangleMesh.prototype.constructor = GG.TriangleMesh;

GG.TriangleMesh.prototype.getGeometry = function() {
	return this.geometry;
};

GG.TriangleMesh.prototype.getPositionsBuffer = function() {
	return this.positionsBuffer;
};

GG.TriangleMesh.prototype.getNormalsBuffer = function() {
	return this.normalsBuffer;
};

GG.TriangleMesh.prototype.getTexCoordsBuffer = function() {
	return this.texCoordsBuffer;
};

GG.TriangleMesh.prototype.getIndexBuffer = function() {
	return this.indexBuffer;
};
/**
 * Create a static particle system, i.e. the particles remain stationery
 * at their original positions.
 * To determine the initial placement of the particles, a geometry object
 * must be given as input. Whereby each vertex will specify the position and/or
 * color of each particle.
 * Note: The input geometry is expected to be flatten.
 */
GG.StaticParticleSystem = function(geometry, material, spec) {
	spec = spec || {};
	this.pointSize = spec.pointSize || 1.0;

	this.vertexBuffer = gl.createBuffer(1);
	this.vertexBuffer.size = geometry.getVertices().length / 3;	
	this.vertexBuffer.numPoints = geometry.getVertices().length / 3;	
	this.vertexBuffer.itemSize = 3;
	this.vertexBuffer.itemType = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

	if (geometry.getColors()) {
		this.colorsBuffer = gl.createBuffer(1);
		
		this.colorsBuffer.size = geometry.getColors().length / 3;
		this.colorsBuffer.itemType = gl.FLOAT;
		this.colorsBuffer.itemSize = 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, geometry.getColors(), gl.STATIC_DRAW); 
	} else {
		this.colorsBuffer = null;
	}
}

GG.StaticParticleSystem.prototype = new GG.Object3D();
GG.StaticParticleSystem.prototype.constructor = GG.StaticParticleSystem;

GG.StaticParticleSystem.prototype.getVertexBuffer = function() {
	return this.vertexBuffer;
};

GG.StaticParticleSystem.prototype.getColorsBuffer = function() {
	return this.colorsBuffer;
};

GG.StaticParticleSystem.prototype.getPointSize = function() {
	return this.pointSize;
};

GG.StaticParticleSystem.prototype.setPointSize = function(sz) {
	this.pointSize = sz;
};
GG.PerspectiveCamera = function() {

	this.position = [ 0.0, 0.0, 0.0];
	this.lookAt = [ 0.0, 0.0, -1.0];
	this.up = [ 0.0, 1.0, 0.0 ];
	this.rotation = [ 0.0, 0.0, 0.0];
	this.fov = 45.0;
	this.near = 0.1;
	this.far = 100.0;
	this.aspectRatio = 1.33;

	this.viewingMatrix = mat4.create();
	this.projectionMatix = mat4.create();	
}

GG.PerspectiveCamera.prototype.constructor = GG.PerspectiveCamera;

GG.PerspectiveCamera.prototype.getPerspectiveMatrix = function() {
	mat4.perspective(this.fov, this.aspectRatio, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};

GG.PerspectiveCamera.prototype.getViewingMatrix = function() {
	mat4.identity(this.viewingMatrix); 	 
	mat4.rotate(this.viewingMatrix, GG.MathUtils.degToRads(this.rotation[0]), [1, 0, 0]);
	mat4.rotate(this.viewingMatrix, GG.MathUtils.degToRads(this.rotation[1]), [0, 1, 0]); 	
	mat4.translate(this.viewingMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
	
	//mat4.lookAt(this.position, this.lookAt, this.up, this.viewingMatrix);
	return this.viewingMatrix;
};

GG.PerspectiveCamera.prototype.getPosition = function() {
	return this.position;
};

GG.PerspectiveCamera.prototype.setPosition = function(p) {
	this.position = p;
};

GG.PerspectiveCamera.prototype.getRotation = function() {
	return this.rotation;
};

GG.PerspectiveCamera.prototype.setRotation = function(r) {
	this.rotation = r;
	return this;
};

GG.PerspectiveCamera.prototype.setup = function(pos, lookAt, up, fov, aspectRatio, near, far) {
	this.position = pos;
	this.lookAt = lookAt;
	this.up = up;
	this.fov = fov;
	this.near = near;
	this.far = far;
	this.aspectRatio = aspectRatio;
	return this;
};

/**
 * Creates a render target for off-screen rendering.
 * The target can be customized through a specifications map, with the following keys:
 *	widht : the width in pixels
 *	height : the height in pixels
 *	colorFormat : one of RGB, RGBA, RGBA4, RGB5_A1, RGB565
 *	depthFormat :  DEPTH_COMPONENT16
 *	stencilFormat : STENCIL_INDEX8
 *	useColor : indicates if a color attachment will be used, true or false
 *	useDepth : indicates whether a depth attachment will be used, true or false
 *	useStencil : indicates whether a stencil attachment will be used, true or false
 *	colorAttachment0 : a texture object to use as the first color attachment
 *	depthAttachment : a texture object to use as the depth attachment
 *	stencilAttachment : a texture object to use as the stencil attachment
 *	flipY : indicates whether it should be flip the direction of the y axis in image space 
 *  minFilter : the minification filter: 
 *		NEAREST, LINEAR, NEAREST_MIPMAP_NEAREST, LINEAR_MIPMAP_NEAREST,NEAREST_MIPMAP_LINEAR,LINEAR_MIPMAP_LINEAR                            
 * 	magFilter : the magnification filter: NEAREST, LINEAR
 *	wrapS : wrap mode for the s coordinates: CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT
 *	wrapT : wrap mode for the t coordinates: CLAMP_TO_EDGE, REPEAT, MIRRORED_REPEAT
 */
GG.RenderTarget = function(spec) {
	spec = spec || {};
	this.width = spec.width || 320;
	this.height = spec.height || 200;
	this.colorFormat = spec.colorFormat || gl.RGBA;
	this.depthFormat = spec.depthFormat || gl.DEPTH_COMPONENT16;
	this.stencilFormat = spec.stencilFormat || gl.STENCIL_INDEX8;
	this.useColor = spec.useColor || true;
	this.useDepth = spec.useDepth || true;
	this.useStencil = spec.useStencil || false;

	this.fbo = gl.createFramebuffer();
	try {
	    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	    
		this.colorAttachments = [];
		if (this.useColor && spec.colorAttachment0 != undefined) {
			this.colorAttachments.push(spec.colorAttachment0);
		} else if (this.useColor) {
			tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, spec.flipY || true);

			// maps a format to the triple [internalFormat, format, type] as accepted by gl.TexImage2D
			formatDetails = {};
			formatDetails[gl.RGB] = [gl.RGB, gl.RGB, gl.UNSIGNED_BYTE];
			formatDetails[gl.RGBA] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE];
			formatDetails[gl.RGBA4] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4];
			formatDetails[gl.RGB5_A1] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1];
			formatDetails[gl.RGB565] = [gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5];
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.magFilter || gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.minFilter || gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS || gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT || gl.CLAMP_TO_EDGE);

			gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[this.colorFormat][0], this.width, this.height, 0, formatDetails[this.colorFormat][1], formatDetails[this.colorFormat][2], null);
			gl.bindTexture(gl.TEXTURE_2D, null);

			this.colorAttachments.push(tex);
		}

		if (this.colorAttachments.length > 0) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorAttachments[0], 0);
		}

		this.depthAttachment = null;
		if (this.useDepth && spec.depthAttachment != undefined) {
			this.depthAttachment = spec.depthAttachment;
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthAttachment, 0);

		} else if (this.useDepth) {
			buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.depthFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.depthAttachment = buff;	
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthAttachment);
		}

		this.stencilAttachment = null;
		if (this.useStencil && spec.stencilAttachment != undefined) {
			this.stencilAttachment = spec.stencilAttachment;
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.stencilAttachment, 0);

		} else if (this.useStencil) {
			buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.stencilFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.stencilAttachment = buff;	
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilAttachment);
		}
		
		this.valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
	} finally {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	}
};

GG.RenderTarget.prototype.constructor = GG.RenderTarget;

GG.RenderTarget.prototype.isValid = function() {
	return this.valid;
};

GG.RenderTarget.prototype.activate = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

	if (!this.useColor) {		
		gl.drawBuffer(gl.NONE);
    	gl.colorMask(false, false, false, false);
	} else {
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	if (this.useDepth) {
		gl.clear(gl.DEPTH_BUFFER_BIT);
	}	

	gl.viewport(0, 0, this.width, this.height);
};

GG.RenderTarget.prototype.deactivate = function() {
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	if (!this.useColor) {
		gl.drawBuffer(gl.BACK);
    	gl.colorMask(true, true, true, true);
	}
};

GG.RenderTarget.prototype.getColorAttachment = function(i) {
	return this.colorAttachments[i];
};

GG.RenderTarget.prototype.getDeptAttachment = function() {
	return this.depthAttachment;
};

GG.RenderTarget.prototype.getStencilAttachment = function() {
	return this.stencilAttachment;
};

GG.GLSLProgram = function (spec) {
	
};

GG.GLSLProgram.BuiltInAttributes = {
	attribPosition : 'a_position',
	attribNormal : 'a_normal',
	attribTexCoords : 'a_texCoords'
};


GG.BaseMaterial = function(spec) {
	spec = spec || {};
	this.ambient = spec.ambient || [0.1, 0.1, 0.1, 1.0];
	this.diffuse = spec.diffuse || [1.0, 1.0, 1.0, 1.0];
	this.specular = spec.specular || [1.0, 1.0, 1.0, 1.0];
	this.shininess = spec.shininess || 10.0;

	this.diffuseMap = null;
	this.specularMap = null;
	this.opacityMap = null;
	this.lightMap = null;
	this.glowMap = null;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;
GG.BaseTechnique = function(spec) {	
	spec = spec || {};
	
	this.textures = spec.textures != undefined ? spec.textures : [];
	this.renderer = spec.renderer;	
}

GG.BaseTechnique.prototype.constructor = GG.BaseTechnique;
GG.BaseTechnique.prototype.getTextures = function() {
	return this.textures;
};

GG.BaseTechnique.prototype.setTextures = function(t) {
	this.textures = t;
};

GG.BaseTechnique.prototype.initialize = function() {

};

GG.BaseTechnique.prototype.destroy = function() {

};

GG.BaseTechnique.prototype.createProgram = function(vs, fs) {
	shaderProgram = gl.createProgram();
	vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vs);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(vertexShader));
		return null;
	}
	
	fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fs);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fragmentShader));
		return null;
	}
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(shaderProgram));
	  shaderProgram = null;
	}
	return shaderProgram;
};
GG.ConstantLightingTechnique = function(spec) {	
	
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);
	this.color = spec.color != undefined ? spec.color : [1.0, 1.0, 1.0];
	
	this.vertexShader = [
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",
		
		"uniform vec4 u_color;",
		"void main() {",
		"	gl_FragColor = u_color;",
		"}"
	].join("\n");
	
	this.program = null;
}

GG.ConstantLightingTechnique.prototype = new GG.BaseTechnique();
GG.ConstantLightingTechnique.prototype.constructor = GG.ConstantLightingTechnique;
GG.ConstantLightingTechnique.prototype.getColor = function() {
	return this.color;
};

GG.ConstantLightingTechnique.prototype.setColor = function(c) {
	this.color = c;
};

GG.ConstantLightingTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.uniformColor = gl.getUniformLocation(this.program, "u_color");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
};

GG.ConstantLightingTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.ConstantLightingTechnique.prototype.render = function(mesh) {
	// this could go to the renderer
	gl.useProgram(this.program);			
	gl.uniform4fv(this.program.uniformColor, this.color);		
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());
	this.renderer.renderMesh(mesh, this.program);
};
/**
 * Renders an object without shading, colors are fecthed from a single 2D texture.
 * Note that objects rendered using this technique must have texture coordinates 
 * defined in their geometry.
 *
 * tech = new GG.TexturedShadelessTechnique({ textures : t });
 */
GG.TexturedShadelessTechnique = function(texture, spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);	

	this.texture = texture;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec2 a_texCoords;",
		"varying vec2 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	v_texCoords = a_texCoords;",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",
		"varying vec2 v_texCoords;",
		"uniform sampler2D u_texture;",
		"void main() {",
		"	gl_FragColor = texture2D(u_texture, v_texCoords);",
		"}"
	].join("\n");
	
	this.program = null;
}

GG.TexturedShadelessTechnique.prototype = new GG.BaseTechnique();
GG.TexturedShadelessTechnique.prototype.constructor = GG.TexturedShadelessTechnique;

GG.TexturedShadelessTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.attribTexCoords = gl.getAttribLocation(this.program, "a_texCoords");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
	this.program.samplerUniform = gl.getUniformLocation(this.program, "u_texture");
};

GG.TexturedShadelessTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.TexturedShadelessTechnique.prototype.render = function(mesh, material) {
	// this could go to the renderer
	gl.useProgram(this.program);			
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.program.samplerUniform, 0);

	this.renderer.renderMesh(mesh, this.program);
};
GG.CubemapTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.cubemapTexture = spec.cubemap;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"varying vec3 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_inverseView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		// to be applied on the result of matModelView*vec4(skyPos, 1.0)
		"	const float SkyScale = 100.0;",

		// use the vector from the center of the cube to the vertex as the texture coordinates
		"	v_texCoords = a_position.xyz;",

		// since the view transform contains an inverse wCameraPos translation
	    // we cancel the camera translation by adding the same translation
	    // prior to multiplying with the modelviewprojection matrix
		"	vec4 wCameraPos = u_inverseView * vec4(0.0, 0.0, 0.0, 1.0);",
		"	vec3 skyPos = a_position.xyz + wCameraPos.xyz;",
		"	vec3 ecSkyPos = SkyScale * vec3(u_matModelView * vec4(skyPos, 1.0));",
		"	gl_Position = u_matProjection * vec4(ecSkyPos, 1.0);",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",	
		"varying vec3 v_texCoords;",	
		"uniform samplerCube u_cubemap;",
		"void main() {",
		"	gl_FragColor = textureCube(u_cubemap, v_texCoords);",
		"}"
	].join("\n");
	
	this.program = null;
};

GG.CubemapTechnique.prototype = new GG.BaseTechnique();
GG.CubemapTechnique.prototype.constructor = GG.CubemapTechnique;

GG.CubemapTechnique.prototype.getCubemap = function() {
	return this.cubemapTexture;
};

GG.CubemapTechnique.prototype.setCubemap = function(cubemap) {
	this.cubemapTexture = cubemap;
};

GG.CubemapTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.uniformCubemap = gl.getUniformLocation(this.program, "u_cubemap");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformInverseView = gl.getUniformLocation(this.program, "u_inverseView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
};

GG.CubemapTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.CubemapTechnique.prototype.render = function(mesh) {
	// this could go to the renderer
	gl.useProgram(this.program);			

	gl.activeTexture(gl.TEXTURE0);
	this.cubemapTexture.bind();
	gl.uniform1i(this.program.uniformCubemap, 0);		
	
	gl.uniformMatrix4fv(this.program.uniformInverseView, false, this.renderer.getInverseViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformMV, false, this.renderer.getViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.disable(gl.CULL_FACE);

	this.renderer.renderMesh(mesh, this.program);

	this.cubemapTexture.unbind();
	gl.useProgram(null);
};
GG.ReflectiveTechnique = function(spec) {

	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	// amount of reflectance
	this.reflectance = 0.80;

	this.baseColor = spec.baseColor || [ 0.30, 0.30, 0.30, 1.0 ];

	// index of refraction of the object being rendered
	this.IOR = spec.IOR || [ 1.0, 1.0, 1.0 ];

	// index of refraction of the environment surounding the object 
	this.externalIOR = spec.externalIOR || [ 1.330, 1.31, 1.230 ];

	this.cubemap = spec.cubemap || null;
	
	this.fresnelBias = spec.fresnelBias || 0.44;

	this.fresnelExponent = spec.fresnelExponent || 2.0;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",

		"uniform mat4 u_matModel;",
		"uniform mat4 u_matViewInverse;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"	vec4 wPos = u_matModel * a_position;",
		"	v_normal = (u_matModel * vec4(a_normal, 0.0)).xyz;",
		"	vec4 wCameraPos = u_matViewInverse * vec4(0.0, 0.0, 0.0, 1.0);",
		"	v_viewVector = (wPos - wCameraPos).xyz;",		
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"uniform vec4 u_baseColor;",
		"uniform float u_reflectance;",
		"uniform vec3 u_eta;",

		// (bias, exponent)
		"uniform vec2 u_fresnelParams;",

		"uniform samplerCube u_cubemap;",

		"float schlick_fresnel(vec3 I, vec3 N, float bias, float exponent)",
		"{",		
		"   return bias - (1.0 - bias)*pow(1.0 - dot(N, I), exponent); ",
		"}",

		"void main() {",
		"	vec3 I = normalize(v_viewVector);",
		"	vec3 N = normalize(v_normal);",
		"	vec3 r = reflect(I, N);",
		"	vec3 reflColor = textureCube(u_cubemap, r).rgb;",

		"	vec3 transmColor;",
		"	vec3 t = refract(I, N, u_eta.x);",
		"	transmColor.r = textureCube(u_cubemap, t).r;",

		"	t = refract(I, N, u_eta.y);",
		"	transmColor.g = textureCube(u_cubemap, t).g;",

		"	t = refract(I, N, u_eta.z);",
		"	transmColor.b = textureCube(u_cubemap, t).b;",

		"	float freshnelTerm = schlick_fresnel(-I, N, u_fresnelParams.x, u_fresnelParams.y);",
		"	vec3 envColor = mix(transmColor, reflColor, freshnelTerm);",		
		//"	envColor = mix(transmColor, reflColor, u_reflectance);",
		"	gl_FragColor = vec4(mix(u_baseColor.rgb, envColor, u_reflectance), 1.0);",
		"}"
	].join("\n");
	
	this.program = null;
};

GG.ReflectiveTechnique.prototype = new GG.BaseTechnique();
GG.ReflectiveTechnique.prototype.constructor = GG.ReflectiveTechnique;

GG.ReflectiveTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.attribNormal = gl.getAttribLocation(this.program, "a_normal");
	this.program.uniformBaseColor = gl.getUniformLocation(this.program, "u_baseColor");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformModel = gl.getUniformLocation(this.program, "u_matModel");
	this.program.uniformViewInverse = gl.getUniformLocation(this.program, "u_matViewInverse");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
	this.program.uniformCubemap = gl.getUniformLocation(this.program, "u_cubemap");
	this.program.uniformReflectance = gl.getUniformLocation(this.program, "u_reflectance");
	this.program.uniformEta = gl.getUniformLocation(this.program, "u_eta");
	this.program.uniformFresnelParams = gl.getUniformLocation(this.program, "u_fresnelParams");
};

GG.ReflectiveTechnique.prototype.render = function(mesh, material) {
	// this could go to the renderer
	gl.useProgram(this.program);				
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());
	gl.uniformMatrix4fv(this.program.uniformViewInverse, false, this.renderer.getInverseViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformModel, false, mesh.getModelMatrix());

	gl.activeTexture(gl.TEXTURE0);
	this.cubemap.bind();
	gl.uniform1i(this.program.uniformCubemap, 0);

	gl.uniform3fv(this.program.uniformEta, [ 
		this.IOR[0] / this.externalIOR[0],
		this.IOR[1] / this.externalIOR[1],
		this.IOR[2] / this.externalIOR[2] ]);
	gl.uniform4fv(this.program.uniformBaseColor, this.baseColor);
	gl.uniform2fv(this.program.uniformFresnelParams, [ this.fresnelBias, this.fresnelExponent ]);
	gl.uniform1f(this.program.uniformReflectance, this.reflectance);
 
 	gl.enable(gl.CULL_FACE);

	this.renderer.renderMesh(mesh, this.program);
};

GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",				
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform mat3 u_matNormals;",		
		"varying vec3 v_normal;",
		"varying vec3 v_viewVector;",
		"varying highp vec4 v_viewPos;",

		"void main() {",
		"	vec4 viewPos = u_matModelView*a_position;",
		"	gl_Position = u_matProjection*viewPos;",
		"	v_normal = u_matNormals * a_normal;",
		"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
		"	v_viewPos = viewPos;",
		"}"
	].join("\n");
	
	this.fragmentPointLight = [		
		"	L = normalize(u_matView*vec4(u_pointLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	pointLightIrradiance(N, V, L, u_pointLights[INDEX], diffuse, specular);"
		].join("\n");

		this.fragmentDirectionalLight = [
		"	L = normalize(u_matView*vec4(u_directionalLights[INDEX].direction, 0.0)).xyz;",
		"	directionalLightIrradiance(N, V, L, u_directionalLights[INDEX], diffuse, specular);",
		].join("\n");

		this.fragmentSpotLight = [
		"	L = normalize(u_matView*vec4(u_spotLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	spotLightIrradiance(N, V, L, u_spotLights[INDEX], diffuse, specular);"
		].join("\n");

	this.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_normal;",
		"varying vec3 v_viewVector;",		
		"varying vec4 v_viewPos;",
		"uniform vec4 u_matAmbient;",
		"uniform vec4 u_matDiffuse;",
		"uniform vec4 u_matSpecular;",
		"uniform float u_matShininess;",

		"uniform mat4 u_matView;",

		"struct LightInfo {",
		"	vec3 position;",
		"	vec3 direction;",
		"	vec3 diffuse;",
		"	vec3 specular;",
		"	float attenuation;",
		"	float cosCutOff;",
		"};",

		"#ifdef NUM_POINT_LIGHTS",
		"uniform LightInfo u_pointLights[NUM_POINT_LIGHTS];",

		"void pointLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.0, df)*sp*lightInfo.specular;",
		"}",

		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"uniform LightInfo u_directionalLights[NUM_DIRECTIONAL_LIGHTS];",

		"void directionalLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.0, df)*sp*lightInfo.specular;",
		"}",

		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"uniform LightInfo u_spotLights[NUM_SPOT_LIGHTS];",

		"void spotLightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, inout vec3 diffuse, inout vec3 specular) {",		
		"	float df = clamp(dot(normal, light), 0.0, 1.0);",
		"	float cosSpot = clamp(dot(normalize(u_matView*vec4(lightInfo.direction, 0.0)).xyz, -light), 0.0, 1.0);",
		"	df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
		"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), u_matShininess);",
		"	diffuse += df*lightInfo.diffuse;",
		"	specular += step(0.00001, df)*sp*lightInfo.specular;",
		"}",		
		"#endif",

		"void main() {",
		"	vec3 N = normalize(v_normal);",
		"	vec3 V = normalize(v_viewVector);",		
		"	vec3 diffuse = vec3(0.0);",
		"	vec3 specular = vec3(0.0);",
		"	vec3 L;",

		"#ifdef NUM_POINT_LIGHTS",
		"	<<POINT_LIGHTS_FRAGMENT>>",
		"#endif",

		"#ifdef NUM_DIRECTIONAL_LIGHTS",
		"	<<DIRECTIONAL_LIGHTS_FRAGMENT>>",
		"#endif",

		"#ifdef NUM_SPOT_LIGHTS",
		"	<<SPOT_LIGHTS_FRAGMENT>> ",
		"#endif",

		"	gl_FragColor = /*vec4(abs(diffuse), 1.0); */u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
		"	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5));",
		"}"
	].join("\n");
	
	this.programsCache = {};
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongShadingTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();	
};

GG.PhongShadingTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	for (k in this.programsCache)
		gl.deleteProgram(this.programsCache[k]);
};


GG.PhongShadingTechnique.prototype.__setLightsUniform = function (program, viewMat, uniformName, lights) {
	uniforms = {
		position : ["position", 3],
		direction : ["direction", 3],
		diffuse : ["diffuse", 3],
		specular : ["specular", 3],
		attenuation : ["attenuation", 1],
		cosCutOff : ["cosCutOff", 1]
	}
	for (var i = 0; i < lights.length; i++) {
		lightIndex = lights.length > 1 ? "[" + i + "]" : "";
		for (k in uniforms) {
			field = uniformName + lightIndex + "." + uniforms[k][0] ;			
			var val = lights[i][k];
			eval("gl.uniform" + (uniforms[k][1] > 1 ? "3fv" : "1f") + "(program[field], val)");
		}
	}
};

GG.PhongShadingTechnique.prototype.__createLightUniforms = function(program, uniformName, lights) {
	uniforms = {
		position : ["position", 3],
		direction : ["direction", 3],
		diffuse : ["diffuse", 3],
		specular : ["specular", 3],
		attenuation : ["attenuation", 1],
		cosCutOff : ["cosCutOff", 1]
	}
	
	for (var i = 0; i < lights.length; i++) {
		lightIndex = lights.length > 1 ? "[" + i + "]" : "";
		for (k in uniforms) {
			field = uniformName + lightIndex + "." + uniforms[k][0];
			try {
				eval("program[field] = gl.getUniformLocation(program, field);");	
			}catch (ex) {
				console.log(ex)
			}
			
		}
	}
}

GG.PhongShadingTechnique.prototype.__createProgramFromParams = function(pointLights, directionalLights, spotLights) {
	
	key = pointLights.length + "_" + directionalLights.length + "_" + spotLights.length;
	var program = this.programsCache[key];

	if (program == undefined) {		
		fs = this.fragmentShader;

		if (pointLights.length > 0) {
			fs = "#define NUM_POINT_LIGHTS " + pointLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < pointLights.length; i++) {
				lc += this.fragmentPointLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<POINT_LIGHTS_FRAGMENT>>", lc);
		}
	
	
		if (directionalLights.length > 0) {
			fs = "#define NUM_DIRECTIONAL_LIGHTS " + directionalLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < directionalLights.length; i++) {
				lc += this.fragmentDirectionalLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<DIRECTIONAL_LIGHTS_FRAGMENT>>", lc);
		}

		if (spotLights.length > 0) {
			fs = "#define NUM_SPOT_LIGHTS " + spotLights.length + "\n" + fs;
			lc = "";
			for (i = 0; i < spotLights.length; i++) {
				lc += this.fragmentSpotLight.replace(/INDEX/g, i) + "\n";
			}
			fs = fs.replace("<<SPOT_LIGHTS_FRAGMENT>>", lc);
		}

		var program = this.createProgram(this.vertexShader, fs);	
		this.programsCache[key] = program;

		if (pointLights.length > 0)
			this.__createLightUniforms(program, "u_pointLights", pointLights);
		
		if (directionalLights.length > 0)
			this.__createLightUniforms(program, "u_directionalLights", directionalLights);
		
		if (spotLights.length > 0)
			this.__createLightUniforms(program, "u_spotLights", spotLights);

		program.attribPosition = gl.getAttribLocation(program, "a_position");
		program.attribNormal = gl.getAttribLocation(program, "a_normal");

		program.uniformMV = gl.getUniformLocation(program, "u_matModelView");
		program.uniformProjection = gl.getUniformLocation(program, "u_matProjection");
		program.uniformViewMatrix = gl.getUniformLocation(program, "u_matView");
		program.uniformNormalsMatrix = gl.getUniformLocation(program, "u_matNormals");

		program.uniformMatAmbient = gl.getUniformLocation(program, "u_matAmbient");
		program.uniformMatDiffuse = gl.getUniformLocation(program, "u_matDiffuse");
		program.uniformMatSpecular = gl.getUniformLocation(program, "u_matSpecular");
		program.uniformMatShininess = gl.getUniformLocation(program, "u_matShininess");
		}
		
	gl.useProgram(program);
	return program;
};

GG.PhongShadingTechnique.prototype.render = function(mesh, lights) {

	pointLights = [];
	spotLights = [];
	directionalLights = [];
	for (var i = 0; i < lights.length; i++) {
		if (lights[i].lightType == GG.LT_POINT) pointLights.push(lights[i]);
		else if (lights[i].lightType == GG.LT_DIRECTIONAL) directionalLights.push(lights[i]);
		else if (lights[i].lightType == GG.LT_SPOT) spotLights.push(lights[i]);
	}

	var program = this.__createProgramFromParams(pointLights, directionalLights, spotLights);
	gl.useProgram(program);			
	
	var viewMat = this.renderer.getViewMatrix();

	if (pointLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_pointLights", pointLights);

	if (directionalLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_directionalLights", directionalLights);
	
	if (spotLights.length > 0)	
	this.__setLightsUniform(program, viewMat, "u_spotLights", spotLights);

	MV = mat4.create();
	mat4.multiply(viewMat, mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.uniformMV, false, MV);
	gl.uniformMatrix4fv(program.uniformViewMatrix, false, viewMat);

	NM = mat4.create();
	mat4.inverse(MV, NM);
	mat4.transpose(NM);
	gl.uniformMatrix3fv(program.uniformNormalsMatrix, false, mat4.toMat3(NM));
	gl.uniformMatrix4fv(program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.uniform4fv(program.uniformMatAmbient, mesh.material.ambient);
	gl.uniform4fv(program.uniformMatDiffuse, mesh.material.diffuse);
	gl.uniform4fv(program.uniformMatSpecular, mesh.material.specular);
	gl.uniform1f(program.uniformMatShininess, mesh.material.shininess);

	this.renderer.renderMesh(mesh, program);
};
/**
 * Simple particles rendering using points for each particle.
 * You can also specify a single texture and the attenuation factor.
 * 
 * psTechnique = new GG.ParticlesTechnique(texMap, 1.0);
 * psTechnique.initialize();
 * psTechnique.render(aParticleSystem);
 */
GG.ParticlesTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.texture = spec.texture || null;
	this.distanceAttenuation = spec.attenuation || 1.0;

	// stores compiled programs for different configurations of the techniques
	// and the particle system that is to be rendered
	this.programCache = [];

	this.vertexShader = [
		"attribute vec4 a_position;",
		
		"#ifdef USE_COLORS",
		"attribute vec3 a_color;",
		"varying vec3 v_color;",
		"#endif",

		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform float u_pointSize;",

		"void main() {",
		"	vec4 viewPos = u_matModelView * a_position;",
		"	gl_Position = u_matProjection * viewPos;",
		"	gl_PointSize = u_pointSize / (1.0 + length(viewPos.xyz));",

		"#ifdef USE_COLORS",
		"	v_colr = a_color;",
		"#endif",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",	

		"#ifdef USE_COLORS",		
		"varying vec3 v_color;",
		"#endif",		

		"#ifdef USE_MAP",
		"uniform sampler2D u_texture;",
		"#endif",

		"void main() {",
			"#ifdef USE_COLORS",
			"gl_FragColor = vec4(v_color, 1.0);",
			"#endif",

			"#ifdef USE_MAP",
			"gl_FragColor = gl_FragColor * texture2D(u_texture, gl_PointCoord);",
			"#endif",

			"#ifdef NO_COLORS_OR_MAP",
			"gl_FragColor = vec4(1.0);",
			"#endif",
		"}"
	].join("\n");
	
};

GG.ParticlesTechnique.prototype = new GG.BaseTechnique();
GG.ParticlesTechnique.prototype.constructor = GG.ParticlesTechnique;

GG.ParticlesTechnique.prototype.initialize = function() {

};

GG.ParticlesTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	
	this.programs.forEach(function(prog) {
		gl.deleteProgram(prog);
	});
};

GG.ParticlesTechnique.prototype.render = function(ps) {
	program = this.getSuitableProgram(ps);	

	if (program.uniformTexture != null) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(this.texture);
		gl.uniform1i(program.uniformTexture, 0);
	}
	if (!program.uniformSize) {		
		program.uniformSize = gl.getUniformLocation(program, "u_pointSize");
	}
	gl.uniform1f(program.uniformSize, ps.getPointSize());

	if (!program.uniformMV) {	
		program.uniformMV = gl.getUniformLocation(program, "u_matModelView");		
	}
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), ps.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.uniformMV, false, MV);

	if (!program.uniformProjection) {	
		program.uniformProjection = gl.getUniformLocation(program, "u_matProjection");		
	}
	gl.uniformMatrix4fv(program.uniformProjection, false, this.renderer.getProjectionMatrix());

	this.renderer.renderPoints(program, ps.getVertexBuffer(), ps.getColorsBuffer());

	gl.useProgram(null);
};

GG.ParticlesTechnique.prototype.getSuitableProgram = function(ps) {

	vs = this.vertexShader;
	fs = this.fragmentShader;
	progKey = 1;
	instr = "";

	if (this.texture != null) {
		progKey += 2;
		vs = "#define USE_MAP\n" + vs;
		fs = "#define USE_MAP\n" + fs;

		instr += 'prog.uniformTexture = gl.getUniformLocation(prog, "u_texture");';
	}

	if (ps.getColorsBuffer() != null) {
		progKey += 4;
		vs = "#define USE_COLORS\n" + vs;
		fs = "#define USE_COLORS\n" + fs;
		instr += 'prog.attribColor = gl.getAttribLocation(prog, "a_color");';
	}

	if (this.texture == null && ps.getColorsBuffer() == null) {
		progKey += 8;
		vs = "#define NO_COLORS_OR_MAP\n" + vs;
		fs = "#define NO_COLORS_OR_MAP\n" + fs;
	}

	prog = this.programCache[progKey];
	if (prog == null) {
		prog = this.programCache[progKey] = this.createProgram(vs, fs);
	}
	
	gl.useProgram(prog);
	
	prog.attribPosition = gl.getAttribLocation(prog, "a_position");
	
	eval(instr);

	return prog;
};

GG.Renderer = function() {
	this.camera = null;
	this.persp = mat4.create();
	this.view = mat4.create();
	this.inverseView = mat4.create();
	this.MVP = mat4.create();
}

GG.Renderer.prototype.constructor = GG.Renderer;
GG.Renderer.prototype.getCamera = function () {
	return this.camera;
};

GG.Renderer.prototype.setCamera = function (c) {
	this.camera = c;
};

GG.Renderer.prototype.getProjectionMatrix = function () {
	return this.persp;
};

GG.Renderer.prototype.getViewMatrix = function () {
	return this.view;
};

GG.Renderer.prototype.getInverseViewMatrix = function () {
	return this.inverseView;
};

GG.Renderer.prototype.getViewProjectionMatrix = function () {
	mat4.identity(this.MVP);
	mat4.multiply(this.view, this.persp, this.MVP);
	return this.MVP;
};

GG.Renderer.prototype.prepareNextFrame = function () {	
	this.persp = this.camera.getPerspectiveMatrix();
	this.view = this.camera.getViewingMatrix();
	mat4.inverse(this.view, this.inverseView);
	return this;
};

GG.Renderer.prototype.renderMesh = function (mesh, program) {		
	if (program.attribPosition != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getPositionsBuffer());
		gl.enableVertexAttribArray(program.attribPosition);
		gl.vertexAttribPointer(program.attribPosition, mesh.getPositionsBuffer().itemSize, mesh.getPositionsBuffer().itemType, false, 0, 0);
	}

	if (program.attribNormal != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getNormalsBuffer());
		gl.enableVertexAttribArray(program.attribNormal);
		gl.vertexAttribPointer(program.attribNormal, mesh.getNormalsBuffer().itemSize, mesh.getNormalsBuffer().itemType, false, 0, 0);
	}

	if (program.attribTexCoords != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getTexCoordsBuffer());
		gl.enableVertexAttribArray(program.attribTexCoords);
		gl.vertexAttribPointer(program.attribTexCoords, mesh.getTexCoordsBuffer().itemSize, mesh.getTexCoordsBuffer().itemType, false, 0, 0);
	}

	if (mesh.getIndexBuffer() != undefined) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.getIndexBuffer());
		gl.drawElements(gl.TRIANGLES, mesh.getIndexBuffer().numItems, mesh.getIndexBuffer().itemType, 0);
	} else {
		gl.drawArrays(gl.TRIANGLES, 0, mesh.getPositionsBuffer().size);
	}	
};

GG.Renderer.prototype.renderPoints = function (program, vertexBuffer, colorBuffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.enableVertexAttribArray(program.attribPosition);
	gl.vertexAttribPointer(program.attribPosition, vertexBuffer.itemSize, vertexBuffer.itemType, false, 0, 0);

	if (colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.enableVertexAttribArray(program.attribColors);
		gl.vertexAttribPointer(program.attribColors, colorBuffer.itemSize, colorBuffer.itemType, false, 0, 0);
	}

	gl.drawArrays(gl.POINTS, 0, vertexBuffer.size);
};

/**
 * Represents a single render pass of a renderable object.
 * It provides a quick way to render an object and a building block
 * with which you can construct multi-pass rendering techniques.
 *
 * Creation parameters:
 * spec.sourceTexture : a texture object to bind as source before rendering
 * spec.vertexShader : the vertex shader code
 * spec.fragmentShader : the fragment shader code
 * spec.uniforms : a map containing the uniform names as keys and the uniform
 * values as the corresponding values.
 * 
 * The class is extensible by providing implementations for the following member
 * methods:
 *
 * RenderPass.__setCustomUniforms : overridde this method to set values for your
 * uniforms
 *
 * RenderPass.__setCustomAttributes : overridde this method to set custom program 
 * attributes
 *
 * RenderPass.__renderGeometry : overridde this method to render the renderable
 * object. The default implementation performs no rendering.
 */
GG.RenderPass = function (spec) {
	spec = spec || {}	
	this.vertexShader = spec.vertexShader || null;
	this.fragmentShader = spec.fragmentShader || null;

	this.uniforms = spec.uniforms || [];
	this.program = null;
}

GG.RenderPass.prototype.initialize = function() {
	// create the gpu program if it is not linked already
	this.program = GG.ProgramUtils.createProgram(this.vertexShader, this.fragmentShader);
	GG.ProgramUtils.getUniformsLocations(this.program, this.uniforms);
};

GG.RenderPass.prototype.render = function(renderable, targetFBO) {
	if (this.program == null) {
		this.initialize();
	}

	gl.useProgram(this.program);
	if (targetFBO) {
		targetFBO.activate();
	}

	GG.ProgramUtils.injectBuiltInAttributes(this.program);

	// this should be overridden in each subclass
	this.__setCustomAttributes();	

	// scans the passed uniforms and sets a value if any of those belong to the built-in list
	GG.ProgramUtils.injectBuiltInUniforms(this.program, this.uniforms);

	// this should be overridden in each subclass
	this.__setCustomUniforms();	

	this.__renderGeometry(renderable);
	
	if (targetFBO) {
		targetFBO.deactivate();
	}
	gl.useProgram(null);
};

// no-op default implementations
GG.RenderPass.prototype.__setCustomUniforms = function() {};
GG.RenderPass.prototype.__setCustomAttributes = function() {};
GG.RenderPass.prototype.__renderGeometry = function(renderable) {};

/*
pass = new RenderPass({
	vertexShader : GG.ShaderLib.blurX.vertex.strong(4),
	fragmentShader : GG.ShaderLib.blurX.fragment.strong(4),
	screenPass : true
})

technique {

	phongPass.render(sceneFBO)
	blitPass.setSourceTexture(sceneFBO.texture0);
	blitPass.render(sceneCopyFBO)
	downscalePass.setSourceTexture(sceneCopyFBO);
	downscalePass.render(ppBuffer.targetFBO);
	ppBuffer.swap()
	blurXPass.render(ppBuffer.targetFBO)
	ppBuffer.swap()
	blurYPass.render(ppBuffer.targetFBO)
	upscalePass.setSourceTexture(ppBuffer.targetFBO);
	upscalePass.render(upscaledFBO);
	combineAndGlowPass.setOriginalTexture(sceneCopyFBO.texture0)
	combineAndGlowPass.setScaledTexture(upscaledFBO.texture0)
	combineAndGlowPass.render(finalFBO)

	postProcessPass.setSourceTexture(finalFBO)
	postProcessPass.render()
}
*/

/**
 * Simplifies the creation of render passes that perform a screen space
 * effect, for e.g. tone mapping, bloom, blur, etc.
 */
GG.ScreenPass = function(spec) {
	spec = spec || {};
	uniforms = spec.uniforms || [];
	uniforms = uniforms.concat(['u_sourceTexture']);
	spec.uniforms = uniforms;

	GG.RenderPass.call(this, spec);

	this.sourceTexture = spec.sourceTexture || null;
	this.screenQuad = null;
};

GG.ScreenPass.SourceTextureUniform = 'u_sourceTexture';

GG.ScreenPass.prototype = new GG.RenderPass();

GG.ScreenPass.prototype.constructor = GG.ScreenPass;

GG.ScreenPass.prototype.__renderGeometry = function(renderable) {
	// render a full screen quad
	if (this.screenQuad == null) {
		this.screenQuad = new GG.TriangleMesh(new GG.ScreenAlignedQuad());
	}	
	GG.renderer.renderMesh(this.screenQuad, this.program);
};

GG.ScreenPass.prototype.__setCustomUniforms = function() {
	// the default sourceTexture always goes to texture unit 0
	if (this.sourceTexture != null) {
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture);
		gl.uniform1i(this.program.u_sourceTexture, 0);
	}
}



GG.BlitPass = function (sourceTexture) {
	GG.ScreenPass.call(this, { 
		sourceTexture : sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : GG.ShaderLib.blit.fragment,
		uniforms : GG.ShaderLib.blit.uniforms
	});
};

GG.BlitPass.prototype = new GG.ScreenPass();

GG.BlitPass.prototype.constructor = GG.BlitPass;
GG.MouseHandler = function() {
	this.mouseDown = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.camera = null;
	this.rotX = 0.0;
	this.rotY = 0.0;

	var that = this;
	this.handleMouseDown = function (event) {
	    that.mouseDown = true;
	    that.lastMouseX = event.clientX;
		that.lastMouseY = event.clientY;
	}

	this.handleMouseUp = function (event) {
		that.mouseDown = false;
	}

	this.handleMouseMove = function (event) {
		if (!that.mouseDown) {
		  return;
		}
		var newX = event.clientX;
		var newY = event.clientY;

		var deltaX = newX - that.lastMouseX;
		that.rotY += deltaX;
		
		/*
		var newRotationMatrix = mat4.create();
		mat4.identity(newRotationMatrix);
		mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
*/
		var deltaY = newY - that.lastMouseY;
		that.rotX += deltaY;

		that.camera.setRotation([that.rotX, that.rotY, 0.0]);
		/*
		mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
		mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);
*/
		that.lastMouseX = newX
		that.lastMouseY = newY;
	}
	
	GG.canvas.onmousedown = this.handleMouseDown;
    document.onmouseup = this.handleMouseUp;
    document.onmousemove = this.handleMouseMove;
};


GG.MouseHandler.prototype.constructor = GG.MouseHandler;

GG.MouseHandler.prototype.getCamera = function() {
	return this.camera;
}

GG.MouseHandler.prototype.setCamera = function(c) {
	this.camera = c;
	return this;
}



GG.Scene = function(name) {
	this.name = name;

	this.objects = [];
	this.lights = [];
};

GG.Scene.prototype.addObject = function(object) {
	this.objects.push(object);
	return this;
};

GG.Scene.prototype.perObject = function(fn) {
	for (var i = this.objects.length - 1; i >= 0; i--) {
		fn.apply(null, [this.objects[i]]);
	};
	this.objects.forEach(fn);
	return this;
};

GG.Scene.prototype.addLight = function(light) {
	this.lights.push(light);
	return this;
};

GG.Scene.prototype.removeLight = function(light) {
	this.lights = this.lights.filter(function(i) { return i != light;});
	return this;
};

GG.Scene.prototype.listLights = function() {
	return new Array(this.lights);
}
GG.Scene.prototype = new GG.Scene();
GG.Scene.prototype.constructor = GG.Scene;