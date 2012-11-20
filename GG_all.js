
var GG = {
	version : "1.0",
	context : null,
	PI : 3.14159265358979323846,
	PI_OVER_2 : 3.14159265358979323846 / 2.0,

	joinArrays : function(arrays) {
		var joined = [];
		for (var i = 0; i < arrays.length; i++) {
			joined = joined.concat(arrays[i]);
		}
		return joined;
	},

	cloneDictionary : function(dict) {
		var clone = {};
		for (var k in dict) {
			clone[k] = dict[k];
		}
		return clone;
	},

	init : function () {
		GG.renderer = new GG.Renderer();
	}
	
};

GG.MAX_DIFFUSE_TEX_UNITS = 8;
GG.TEX_UNIT_DIFFUSE_MAP_0  = 0;
GG.TEX_UNIT_DIFFUSE_MAP_1  = 1;
GG.TEX_UNIT_DIFFUSE_MAP_2  = 2;
GG.TEX_UNIT_DIFFUSE_MAP_3  = 3;
GG.TEX_UNIT_DIFFUSE_MAP_4  = 4;
GG.TEX_UNIT_DIFFUSE_MAP_5  = 5;
GG.TEX_UNIT_DIFFUSE_MAP_6  = 6;
GG.TEX_UNIT_DIFFUSE_MAP_7  = 7;
GG.TEX_UNIT_DIFFUSE_MAPS  = [
	GG.TEX_UNIT_DIFFUSE_MAP_0,
	GG.TEX_UNIT_DIFFUSE_MAP_1,
	GG.TEX_UNIT_DIFFUSE_MAP_2,
	GG.TEX_UNIT_DIFFUSE_MAP_3,
	GG.TEX_UNIT_DIFFUSE_MAP_4,
	GG.TEX_UNIT_DIFFUSE_MAP_5,
	GG.TEX_UNIT_DIFFUSE_MAP_6,
	GG.TEX_UNIT_DIFFUSE_MAP_7
];

GG.TEX_UNIT_NORMAL_MAP   = GG.TEX_UNIT_DIFFUSE_MAP_7 + 1;
GG.TEX_UNIT_SPECULAR_MAP = GG.TEX_UNIT_NORMAL_MAP    + 1;
GG.TEX_UNIT_ALPHA_MAP    = GG.TEX_UNIT_SPECULAR_MAP  + 1;
GG.TEX_UNIT_GLOW_MAP     = GG.TEX_UNIT_ALPHA_MAP     + 1;
GG.TEX_UNIT_SHADOW_MAP   = GG.TEX_UNIT_GLOW_MAP      + 1;
GG.TEX_UNIT_ENV_MAP      = GG.TEX_UNIT_SHADOW_MAP    + 1;
			
var gl, canvas;
			
String.prototype.times = function(n) {
    return Array.prototype.join.call({length:n+1}, this);
};



		
/**
 * Contains the naming conventions used throughout the framework.
 */
GG.Naming = {
	UniformMaterial          : 'u_material',
	UniformLight             : 'u_light',	
	UniformModelMatrix       : 'u_matModel',
	UniformNormalMatrix      : 'u_matNormals',
	UniformModelViewMatrix   : 'u_matModelView',
	UniformViewMatrix        : 'u_matView',
	UniformInverseViewMatrix : 'u_matViewInverse',
	UniformProjectionMatrix  : 'u_matProjection',
	UniformTime0_X           : 'u_fTime0_X',
	UniformTime0_1           : 'u_fTime0_1',
	
	AttributePosition        : 'a_position',
	AttributeNormal          : 'a_normal',
	AttributeColor           : 'a_color',
	AttributeTexCoords       : 'a_texCoords',

};
GG.Clock = function() {
	this.startTime   = new Date();
	this.pauseTime   = null;
	this.lastTick    = new Date();
	this.lastDelta   = 0.0;
	this.running     = true;
	this.scaleFactor = 1.0;
	this.normalized  = 0.0;
};

GG.Clock.prototype.constructor = GG.Clock;

GG.Clock.prototype.tick = function() {
	if (this.running) {
		var now = new Date();
		this.lastDelta = this.scaleFactor * (now.getTime() - this.lastTick.getTime());
		this.normalized = (this.normalized + this.lastDelta) % 1.0;
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

GG.Clock.prototype.normalizedTime = function () {
	return this.normalized;
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
		asyncRequest : function (request, successCallback, errorCallback) {
			request.onload = function() {				
				var response = null;
				if (request.readyState == 4) {     
					// HTTP reports success with a 200 status. 
					// The file protocol reports success with zero.
					var success = request.status == 200 || request.status == 0;      
					if (success && successCallback) {
						if (request.hasOwnProperty('expectedType')) {
							if (request.getResponseHeader("Content-Type").indexOf(request.expectedType) < 0) {
								if (errorCallback) {
									errorCallback("Expected content type of " + expectedType 
										+ " but received " + request.getResponseHeader());
								}
								success = false;
							}
						} 

						if (success) {
							successCallback(request.response); 
						}
						
					} else if (!success && errorCallback) {
						errorCallback(request.status);
					}
			    }
				
			};

			try {
				request.send();	
			} catch (e) {
				errorCallback();
			}
			
		},

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
  			GG.AjaxUtils.asyncRequest(request, function(arraybuffer, url) {								
				callback(arraybuffer, url);
			});
		},

		getRequest : function (url, type, callback, errorCallback) {
			var request = new XMLHttpRequest();
  			request.open("GET", url, true);
  			request.expectedType = type;
  			GG.AjaxUtils.asyncRequest(request, function(response) {								
				callback(response, url);
			}, errorCallback);
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
		for (var i = 0; i < urls.length; i++) {
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

	/**
	 * Loads a JSON document from the given url and invokes the callback
	 * upon success.
	 * The callback will receive the parsed JSON object.
	 */
	loadJSON : function (requestId, url, callback) {
		GG.AjaxUtils.getRequest(url, "application/javascript", function (jsonData) {
			if (callback) {
				callback(JSON.parse(jsonData));
			}
		});
	}
}
GG.ShaderLib = new function (argument) {
	
	return {
		blendModeMultiply : [
			"vec3 blendModeMultiply(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor * sourceColor;",
			"}"
		].join('\n'),

		blendModeAdd : [
			"vec3 blendModeAdd(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor + sourceColor;",
			"}"
		].join('\n'),

		blendModeSubtract : [
			"vec3 blendModeSubtract(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor - sourceColor;",
			"}"
		].join('\n'),

		blendModeDarken : [
			"vec3 blendModeDarken(in vec3 baseColor, in vec3 sourceColor) {",
			"	return min(baseColor, sourceColor);",
			"}"
		].join('\n'),

		blendModeColorBurn : [
			"vec3 blendModeColorBurn(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.r) / sourceColor.r),",
			"		sourceColor.g == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.g) / sourceColor.g),",
			"		sourceColor.b == 0.0 ? 0.0 : 1.0 - ((1.0 - baseColor.b) / sourceColor.b));",
			"}"
		].join('\n'),

		blendModeLinearBurn : [
			"vec3 blendModeLinearBurn(in vec3 baseColor, in vec3 sourceColor) {",
			"	return baseColor + sourceColor - vec3(1.0);",
			"}"
		].join('\n'),

		blendModeLighten : [
			"vec3 blendModeLighten(in vec3 baseColor, in vec3 sourceColor) {",
			"	return max(baseColor, sourceColor);",
			"}"
		].join('\n'),

		blendModeScreen : [
			"vec3 blendModeScreen(in vec3 baseColor, in vec3 sourceColor) {",
			"	return (baseColor + sourceColor) - (baseColor * sourceColor);",
			"}"
		].join('\n'),

		blendModeColorDodge : [
			"vec3 blendModeColorDodge(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r == 1.0 ? 1.0 : min(1.0, baseColor.r/(1.0 - sourceColor.r)),",
			"		sourceColor.g == 1.0 ? 1.0 : min(1.0, baseColor.g/(1.0 - sourceColor.g)),",
			"		sourceColor.b == 1.0 ? 1.0 : min(1.0, baseColor.b/(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeOverlay : [
			"vec3 blendModeOverlay(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(baseColor.r <= 0.5 ? 2.0*sourceColor.r*baseColor.r : 1.0 - 2.0*(1.0 - baseColor.r)*(1.0 - sourceColor.r),",
			"		baseColor.g <= 0.5 ? 2.0*sourceColor.g*baseColor.g : 1.0 - 2.0*(1.0 - baseColor.g)*(1.0 - sourceColor.g),",
			"		baseColor.b <= 0.5 ? 2.0*sourceColor.b*baseColor.b : 1.0 - 2.0*(1.0 - baseColor.b)*(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeSoftLight : [
			"vec3 blendModeSoftLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModeHardLight : [
			"vec3 blendModeHardLight(in vec3 baseColor, in vec3 sourceColor) {",
			"	return vec3(sourceColor.r <= 0.5 ? 2.0*sourceColor.r*baseColor.r : 1.0 - 2.0*(1.0 - baseColor.r)*(1.0 - sourceColor.r),",
			"		sourceColor.g <= 0.5 ? 2.0*sourceColor.g*baseColor.g : 1.0 - 2.0*(1.0 - baseColor.g)*(1.0 - sourceColor.g),",
			"		sourceColor.b <= 0.5 ? 2.0*sourceColor.b*baseColor.b : 1.0 - 2.0*(1.0 - baseColor.b)*(1.0 - sourceColor.b));",
			"}"
		].join('\n'),

		blendModeVividLight : [
			"vec3 blendModeVividLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModeLinearLight : [
			"vec3 blendModeLinearLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		blendModePinLight : [
			"vec3 blendModePinLight(in vec3 baseColor, in vec3 sourceColor) {",
			"}"
		].join('\n'),

		screen_filter_vertex : [
			"attribute vec4 a_position;",
			"varying vec2 v_texCoords;",

			"void main() {",
			"	v_texCoords = 0.5*(a_position.xy + vec2(1.0));",
			"	gl_Position = a_position;",
			"}"].join('\n'),
			
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

			uniforms : ['u_sourceTexture']
		},

		phong : {
			'lightIrradiance' : [
			"void lightIrradiance(in vec3 normal, in vec3 view, in vec3 light, in LightInfo lightInfo, in Material_t mat, inout vec3 diffuse, inout vec3 specular) {",		
			"	float df = clamp(dot(normal, light), 0.0, 1.0);",
			"	if (lightInfo.type == 3.0) {",
			"		float cosSpot = clamp(dot(normalize(u_matView*vec4(lightInfo.direction, 0.0)).xyz, -light), 0.0, 1.0);",
			"		df *= pow(cosSpot, -lightInfo.attenuation) * smoothstep(lightInfo.cosCutOff, 1.0, cosSpot);",
			"	}",
			"	float sp = pow(max(0.0, dot(reflect(-light, normal), view)), mat.shininess);",
			"	diffuse += df*lightInfo.diffuse;",
			"	specular += step(0.00001, df)*sp*lightInfo.specular;",
			"}"
			].join('\n')			
		},

		blocks : {
			// Packs a normalized half to a vec2.
			'libPackHalfToVec2' : [
			" ",
			"vec2 libPackHalfToVec2(float value) {",
			"	float r = value;",
			"	float g = fract(r*256.0);",
			"	return vec2(r, g);",
			"}"
			].join('\n'),

			// Packs a normalized float to a vec4.
			'libPackFloatToRGBA' : [
			" ",
			"vec4 libPackFloatToRGBA(float value) {",
			"	float r = value;",
			"	float g = fract(r*255.0);",
			"	float b = fract(g*255.0);",
			"	float a = fract(b*255.0);",
			"	return vec4(r, g, b, a);",
			"}"
			].join('\n'),

			'libUnpackRrgbaToFloat' : [
				"float libUnpackRrgbaToFloat(vec4 enc) {",
				"	const vec4 bitShifts = vec4(1.0, 1.0 / 255.0, 1.0 / (255.0 * 255.0), 1.0 / (255.0 * 255.0 * 255.0));",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),

			'libUnpackVec2ToFloat' : [
				"float libUnpackVec2ToFloat(vec2 enc) {",
				"	const vec2 bitShifts = vec2(1.0, 1.0 / 256.0);",
				"	return dot(enc, bitShifts);",
				"}"
			].join('\n'),
 
			'lightInfoStructure' : [
			"struct LightInfo {",
			"	float type;",
			"	vec3 position;",
			"	vec3 direction;",
			"	vec3 diffuse;",
			"	vec3 specular;",
			"	float attenuation;",
			"	float cosCutOff;",
			"};"
			].join('\n'),

			'materialInfoStructure' : [
			"struct Material_t {",
			"	vec3 diffuse;",
			"	vec3 specular;",
			"	vec3 ambient;",
			"	float shininess;",
			"};"
			].join('\n')
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
		},

		clamp : function (val, min, max) {
			if (val < min) return min;
			else if (val > max) return max;
			else return val;
		},

		mat4ToEuler : function (mat) {
			var sp = -mat[6];
			if ( sp <= -1.0 ) {
				var p = -GG.PI_OVER_2;

			} else if ( sp >= 1.0 ) {
				p = GG.PI_OVER_2;

			} else {
				p = Math.asin( sp ) ;
			}	

			// Check for the Gimbal lock case , giving a slight tolerance
			// for numerical imprecision
			if ( Math.abs( sp ) > 0.9999) {
				// We are looking straight up or down.
				// Slam bank to zero and just set heading
				b = 0.0;
				h = Math.atan2(-mat[8], mat[0]) ;
			} else {
				// Compute heading from m13 and m33
				h = Math.atan2(mat[2], mat[10]) ;
				// Compute bank from m21 and m22
				b = Math.atan2(mat[4], mat[5]) ;
			}
			return [h, p, b];
		}

	}
}();


GG.ProgramUtils = function() {
	return {
		compileShader : function(shaderType, source) {
			if (source == undefined || source == null) {
				return null;
			}
			var shader = gl.createShader(shaderType);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				alert(gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		},

		createProgram : function(vertexShaderSource, fragmentShaderSource) {
			var vertexShader = GG.ProgramUtils.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
			var fragmentShader = GG.ProgramUtils.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
			if (vertexShader == null || fragmentShader == null) {
				return null;
			}
			var shaderProgram = gl.createProgram();
			gl.attachShader(shaderProgram, vertexShader);
			gl.attachShader(shaderProgram, fragmentShader);
			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				console.log(gl.getProgramInfoLog(shaderProgram));
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
		getUniformsLocations : function(program) {
			var idx = 0;			
			var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
			
			for (var idx = 0; idx < numUniforms; idx++) {
				var u = gl.getActiveUniform(program, idx);				
				program[u.name] = gl.getUniformLocation(program, u.name);				
			}

			GG.ProgramUtils.getLightUniformsLocations(program, "u_light", 1);
			GG.ProgramUtils.getMaterialUniformLocations(program, GG.Naming.UniformMaterial);
		},

		/**
		 * Scans the input program for uniforms with names that correspond
		 * to predefined semantics. For example the uniform program.fTime0_X will
		 * be set to a float value equal to the total time elapsed since the 
		 * application started running.
		 */
		injectBuiltInUniforms : function(program, renderContext, renderable) {
			var predefined = {};
			predefined[GG.Naming.UniformTime0_X] = function(p, uname) { 
				gl.uniform1f(p[uname], GG.clock.totalRunningTime()); 
			};
			predefined[GG.Naming.UniformTime0_1] = function(p, uname) { 
				gl.uniform1f(p[uname], GG.clock.normalizedTime()); 
			};
			predefined[GG.Naming.UniformViewMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getViewMatrix()); 
			};
			predefined[GG.Naming.UniformInverseViewMatrix] = function(p, uname) { 
				var inv = mat4.create();
				mat4.inverse(renderContext.camera.getViewMatrix(), inv);
				gl.uniformMatrix4fv(p[uname], false, inv); 
			};
			predefined[GG.Naming.UniformProjectionMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getProjectionMatrix()); 
			};
			predefined[GG.Naming.UniformModelMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderable.getModelMatrix()); 
			};
			predefined[GG.Naming.UniformModelViewMatrix] = function(p, uname) { 
				var mv = mat4.create();
				mat4.multiply(renderContext.camera.getViewMatrix(), renderable.getModelMatrix(), mv);
				gl.uniformMatrix4fv(p[uname], false, mv); 
			};
			predefined[GG.Naming.UniformNormalMatrix] = function(p, uname) { 
				var mv = mat4.create();
				mat4.multiply(renderContext.camera.getViewMatrix(), renderable.getModelMatrix(), mv);

				var normal = mat4.create();
				mat4.inverse(mv, normal);
				mat4.transpose(normal);
				gl.uniformMatrix3fv(p[uname], false, mat4.toMat3(normal));
			};

			for ( u in predefined) {
				if (program[u]) {
					predefined[u](program, u);
				}				
			}

			//GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.getMaterial());
		},

		getAttributeLocations : function(program) {
			var idx = 0;
			var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
			
			for (var idx = 0; idx < numAttributes; idx++) {
				var att = gl.getActiveAttrib(program, idx);				
				program[att.name] = gl.getAttribLocation(program, att.name);				
			}
			
		},

		setLightsUniform : function (program, uniformName, light) {
			uniforms = {
				lightType : ["type", 1],
				position : ["position", 3],
				direction : ["direction", 3],
				diffuse : ["diffuse", 3],
				specular : ["specular", 3],
				attenuation : ["attenuation", 1],
				cosCutOff : ["cosCutOff", 1]
			};
			
			for (var k in uniforms) {
				var field = uniformName + "." + uniforms[k][0];			
				var val = light[k];
				if (uniforms[k][1] > 1) {
					gl.uniform3fv(program[field], val);
				} else {
					gl.uniform1f(program[field], val);
				}
				//eval("gl.uniform" + (uniforms[k][1] > 1 ? "3fv" : "1f") + "(program[field], val)");
			}			
		},

// Maybe this is not necessary anymore...
		getLightUniformsLocations : function (program, uniformName, numLights) {
			var uniforms = {
				type : ["type", 1],
				position : ["position", 3],
				direction : ["direction", 3],
				diffuse : ["diffuse", 3],
				specular : ["specular", 3],
				attenuation : ["attenuation", 1],
				cosCutOff : ["cosCutOff", 1]
			};
			
			for (var i = 0; i < numLights; i++) {				
				var lightIndex = numLights > 1 ? "[" + i + "]" : "";

				for (var k in uniforms) {
					var field = uniformName + lightIndex + "." + uniforms[k][0];					
					var loc = gl.getUniformLocation(program, field);
					if (loc) program[field] = loc;
				}
			}
		},

		setMaterialUniforms : function (program, uniformName, material) {
			var attributes = ['ambient', 'diffuse', 'specular'];
			for (var i = attributes.length - 1; i >= 0; i--) {
				var name = uniformName + '.' + attributes[i];
				if (program[name]) {
					gl.uniform3fv(program[name], material[attributes[i]]);	
				}
			}
			var shininess = uniformName + '.shininess';
			if (program[shininess]) {
				gl.uniform1f(program[shininess], material.shininess);
			}
		},

		getMaterialUniformLocations : function(program, uniformName) {
			['ambient', 'diffuse', 'specular', 'shininess', 'diffuseMap'].forEach(function (u) {
				var field = uniformName + '.' + u;
				program[field] = gl.getUniformLocation(program, field);	
			});
		}		
	}
}();
GG.Geometry = function (spec) {
	spec             = spec || {};
	this.vertices    = spec.vertices;
	this.normals     = spec.normals;
	this.flatNormals = spec.flatNormals;
	this.texCoords   = spec.texCoords;
	this.colors      = spec.colors;
	this.tangents    = spec.tangents;
	this.indices     = spec.indices;
};

GG.Geometry.prototype.constructor = GG.Geometry;

GG.Geometry.fromJSON = function (jsonObj) {	
	if ('vertices' in jsonObj) {
		spec = {};
		spec.vertices  = new Float32Array(jsonObj.vertices);

		if ('normals' in jsonObj) {
			spec.normals   = new Float32Array(jsonObj.normals);		
		}

		if ('uvs' in jsonObj) {
			spec.texCoords = new Float32Array(jsonObj.uvs);
		}
	
		if ('faces' in jsonObj) {			
			spec.indices = new Uint16Array(jsonObj.faces);
		}
		return new GG.Geometry(spec);
	}
};

GG.Geometry.fromThreeJsJSON = function (jsonObj) {	
	if ('vertices' in jsonObj) {
		spec = {};
		spec.vertices  = new Float32Array(jsonObj.vertices);

		if ('normals' in jsonObj) {
			spec.normals   = new Float32Array(jsonObj.normals);		
		}

		if ('uvs' in jsonObj) {
			spec.texCoords = new Float32Array(jsonObj.uvs);
		}
	
		if ('faces' in jsonObj) {
			var indices = [];
			var count = jsonObj.faces.length;
			var i = 0;
			while (i < count) {
				var type                = jsonObj.faces[i++];
				var isQuad              = type & 1;
				var hasMaterial         = type & 2;
				var hasFaceUv           = type & 4;
				var hasFaceVertexUv     = type & 8;
				var hasFaceNormal       = type & 16;
				var hasFaceVertexNormal = type & 32;
				var hasFaceColor        = type & 64;
				var hasFaceVertexColor  = type & 128;

				indices.push(jsonObj.faces[i+2]);
				indices.push(jsonObj.faces[i+1]);
				indices.push(jsonObj.faces[i]);
				i+=3;
				var nVertices = 3;
				if (isQuad) {
					indices.push(jsonObj.faces[i++]);
					nVertices = 4;
				}

				if (hasMaterial) i++;
				if (hasFaceNormal) i++;
				if (hasFaceColor) i++;
				if (hasFaceVertexColor) i += nVertices;
				if (hasFaceVertexNormal) i += nVertices;
				if (hasFaceUv) i += jsonObj.uvs.length;
				if (hasFaceVertexUv) i += jsonObj.uvs.length * nVertices;
			}
			spec.indices = new Uint16Array(indices);
		}
		return new GG.Geometry(spec);
	}
};

GG.Geometry.prototype.calculateFlatNormals = function() {
	if (this.indices) {
		// case of triangle lists only
		this.flatNormals = new Float32Array(this.normals.length);

		for (var i = 0; i < this.indices.length - 1; i += 3) {
			var v1 = this.indices[i];
			var v2 = this.indices[i+1];
			var v3 = this.indices[i+2];

			var n1 = this.normals.subarray(v1*3, v1*3+3);
			var n2 = this.normals.subarray(v2*3, v2*3+3);
			var n3 = this.normals.subarray(v3*3, v3*3+3);

			var avg = [n1[0] + n2[0] + n3[0], n1[1] + n2[1] + n3[1], n1[2] + n2[2] + n3[2]];
			avg[0] = avg[0] / 3.0;
			avg[1] = avg[1] / 3.0;
			avg[2] = avg[2] / 3.0;

			this.flatNormals.set(avg, v1*3);
			this.flatNormals.set(avg, v2*3);
			this.flatNormals.set(avg, v3*3);
		}
		return this.flatNormals;	
	} else {
		return null;
	}
	
};

GG.Geometry.prototype.getVertices = function() {
	return this.vertices;
};

GG.Geometry.prototype.getNormals = function() {
	return this.normals;
};

GG.Geometry.prototype.getFlatNormals = function() {
	return this.flatNormals;
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
	var divs           = divisions - 1 || 1;
	
	var verticesPerDim = divs+1;
	this.vertices      = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.normals       = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.texCoords     = new Float32Array(verticesPerDim*verticesPerDim*2);
	this.indices       = new Uint16Array(divs*divs*6);

	var i = 0;
	for (var y = 0; y <= 1.0; y += 1.0/divs) {
		for (var x = 0; x <= 1.0; x += 1.0/divs) {
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
	for (var ny = 0; ny < verticesPerDim - 1; ny++) {
		for (var nx = 0; nx < verticesPerDim - 1; nx++) {
			var vi = ny*verticesPerDim + nx;
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
	this.radius            = radius != undefined ? radius : 1.0;
	this.rings             = rings != undefined ? rings : 16;
	this.segments          = segments != undefined ? segments : 16;
	
	this.vertices          = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.normals           = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.texCoords         = new Float32Array(2 *  (this.rings + 1) * (this.segments + 1));
	this.indices           = new Uint16Array((this.segments + 1) * this.rings * 6);
	var vv                 = 0;
	var ii                 = 0;
	
	var vertexPositionData = [];
	var normalData         = [];
	var textureCoordData   = [];
	var latitudeBands      = this.rings;
	var longitudeBands     = this.segments;
	
	var fDeltaRingAngle    = (GG.PI / this.rings);
	var fDeltaSegAngle     = (2.0 * GG.PI / this.segments);
	var offset             = 0;

	// Generate the group of rings for the sphere
	for (var ring = 0; ring <= this.rings; ring++) {
		var r0 = this.radius * Math.sin(ring * fDeltaRingAngle);
		var y0 = this.radius * Math.cos(ring * fDeltaRingAngle);

		// Generate the group of segments for the current ring
		for (var seg = 0; seg <= this.segments; seg++) {
			var x0 = r0 * Math.sin(seg * fDeltaSegAngle);
			var z0 = r0 * Math.cos(seg * fDeltaSegAngle);

			// Add one vertex to the strip which makes up the sphere
			var invLen = 1.0 / Math.sqrt(x0*x0 + y0*y0 + z0*z0);

			this.vertices[vv*3]      = x0;
			this.vertices[vv*3 + 1]  = y0;
			this.vertices[vv*3 + 2]  = z0;
			
			this.normals[vv*3]       = invLen*x0;
			this.normals[vv*3 + 1]   = invLen*y0;
			this.normals[vv*3 + 2]   = invLen*z0;
			
			this.texCoords[vv*2]     = seg / this.segments;
			this.texCoords[vv*2 + 1] = ring / this.rings;

			vv++;		
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
	dimensions = dimensions != undefined ? dimensions : [1.0, 1.0, 1.0]
	var x      = dimensions[0], y = dimensions[1], z = dimensions[2];
	
	this.vertices  = new Float32Array(36*3);
	this.normals   = new Float32Array(36*3);
	this.texCoords = new Float32Array(36*2);
	var vv         = 0;
	var nn         = 0;
	var st         = 0;
	
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
	for (var f = 0; f < this.vertices.length / 3*3; f++) {
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
	spec          = spec || {};	
	this.pos      = [0.0, 0.0, 0.0];
	this.rotation = [0.0, 0.0, 0.0];
	this.scale    = [1.0, 1.0, 1.0];	
	this.material = spec.material;
}


GG.Object3D.prototype.getPosition = function() { return this.pos; },
GG.Object3D.prototype.setPosition = function(p) { this.pos = p; },
GG.Object3D.prototype.getRotation = function() { return this.rotation; },
GG.Object3D.prototype.setRotation = function(o) { this.rotation = o; },
GG.Object3D.prototype.setScale    = function(s) { this.scale = s; }
GG.Object3D.prototype.getScale    = function() { return this.scale; }

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

GG.Object3D.prototype.getMaterial = function () {
	return this.material;
};

GG.Object3D.prototype.setMaterial = function (m) {
	this.material = m;
	return this;
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
	this.images     = {};
	
	this.imagesSize = spec.size != undefined ? spec.size : 1024;
	this.hdrTexures = spec.floatTextures != undefined ? spec.floatTextures : false;
	
	this.gltex      = gl.createTexture();

	if (this.hdrTexures) {
		this.loadHDRTextures(spec);
	} else {
		this._initFromLDRImages(spec);
		//this.loadTextures(spec);
	}	
};

GG.TextureCubemap.prototype.constructor = GG.TextureCubemap;

GG.TextureCubemap.prototype.loadTextures = function(spec) {
	for (var i = 0; i < this.faces.length; i++) {
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
	for (var i = 0; i < this.faces.length; i++) {
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
	gl.activeTexture(GG.Texture.getGlUnitFromIndex(GG.TEX_UNIT_ENV_MAP));
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.gltex);
};


GG.TextureCubemap.prototype.unbind = function() {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
};
GG.Texture = function (spec) {
	spec             = spec || {};
	this.texture     = spec.texture;
	this.textureType = gl.TEXTURE_2D;
	this.format      = spec.format != undefined ? spec.format : gl.RGBA;
	this.width       = spec.width != undefined ? spec.width : 512;
	this.height      = spec.height != undefined ? spec.height : 512;
	this.magFilter   = spec.magFilter != undefined ? spec.magFilter : gl.NEAREST;
	this.minFilter   = spec.minFilter != undefined ? spec.minFilter : gl.NEAREST;
	this.wrapS       = spec.wrapS != undefined ? spec.wrapS : gl.CLAMP_TO_EDGE;
	this.wrapT       = spec.wrapT != undefined ? spec.wrapT : gl.CLAMP_TO_EDGE;
	this.flipY       = spec.flipY != undefined ? spec.flipY : true;
};

GG.Texture.prototype.constructor = GG.Texture;

GG.Texture.prototype.copyImageData = function (image) {
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
};

GG.Texture.prototype.bindAtUnit = function(unitIndex) {
	gl.activeTexture(GG.Texture.getGlUnitFromIndex(unitIndex));
	gl.bindTexture(this.textureType, this.texture);
};

GG.Texture.prototype.setMinFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterType);
};

GG.Texture.prototype.setMagFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterType);
};

GG.Texture.prototype.setWrapMode = function(wrapModeS, wrapModeT) {
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapModeS);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapModeT);
};

GG.Texture.prototype.handle = function() {
	return this.tex;
};

GG.Texture.getGlUnitFromIndex = function (unitIndex) {	
	return eval("gl.TEXTURE" + unitIndex);
}

GG.Texture.createTexture = function (spec) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, spec.flipY != undefined ? spec.flipY : true);

	// maps a format to the triple [internalFormat, format, type] as accepted by gl.TexImage2D
	var formatDetails = {};
	formatDetails[gl.RGB] = [gl.RGB, gl.RGB, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA4] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4];
	formatDetails[gl.RGB5_A1] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1];
	formatDetails[gl.RGB565] = [gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5];

	var colorFormat = spec.colorFormat != undefined ? spec.colorFormat : gl.RGBA;
	
	var width = spec.width != undefined ? spec.width : 512;
	var height = spec.height != undefined ? spec.height : 512;

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.magFilter != undefined ? spec.magFilter : gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.minFilter != undefined ? spec.minFilter : gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS != undefined ? spec.wrapS : gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT != undefined ? spec.wrapT : gl.CLAMP_TO_EDGE);
	
	if (spec.image != undefined) {
		gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[colorFormat][0],  formatDetails[colorFormat][1], formatDetails[colorFormat][2], spec.image);	
	} else {
		gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[colorFormat][0], width, height, 0, formatDetails[colorFormat][1], formatDetails[colorFormat][2], null);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);

	copySpec = GG.cloneDictionary(spec);
	copySpec.texture = tex;
	return new GG.Texture(copySpec);
};
/**
 * Each TriangleMesh is associated with a Geomtry that stores the actual vertices,
 * normals, and the rest vertex attributes. 
 * Only geometries of triangle lists are supported. 
 */
GG.TriangleMesh = function(geometry, material, spec) {
	
	this.geometry                     = geometry;
	this.material                     = material;	
	
	this.positionsBuffer              = gl.createBuffer(1);
	this.positionsBuffer.size         = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.numTriangles = this.geometry.getVertices().length / 3;	
	this.positionsBuffer.itemSize     = 3;
	this.positionsBuffer.itemType     = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getVertices(), gl.STATIC_DRAW);
	
	this.normalsBuffer                = gl.createBuffer(1);
	this.normalsBuffer.size           = this.geometry.getNormals().length / 3;
	this.normalsBuffer.itemSize       = 3;
	this.normalsBuffer.itemType       = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getNormals(), gl.STATIC_DRAW);
	
	this.texCoordsBuffer              = gl.createBuffer(1);
	this.texCoordsBuffer.size         = this.geometry.getTexCoords().length / 2;
	this.texCoordsBuffer.itemSize     = 2;
	this.texCoordsBuffer.itemType     = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);			
	gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getTexCoords(), gl.STATIC_DRAW);	

	if (geometry.indices != undefined) {
		this.indexBuffer          = gl.createBuffer(1);
		this.indexBuffer.numItems = this.geometry.getIndices().length;
		this.indexBuffer.itemType = gl.UNSIGNED_SHORT;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.getIndices(), gl.STATIC_DRAW);
	}

};

GG.TriangleMesh.prototype             = new GG.Object3D();
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

GG.TriangleMesh.prototype.getFlatNormalsBuffer = function() {
	if (this.flatNormalsBuffer === undefined) {
		var flatNormals = this.geometry.getFlatNormals();
		if (flatNormals === undefined) {
			flatNormals = this.geometry.calculateFlatNormals();
		}
		if (flatNormals) {
			this.flatNormalsBuffer                = gl.createBuffer(1);
			this.flatNormalsBuffer.size           = this.geometry.getFlatNormals().length / 3;
			this.flatNormalsBuffer.itemSize       = 3;
			this.flatNormalsBuffer.itemType       = gl.FLOAT;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.flatNormalsBuffer);			
			gl.bufferData(gl.ARRAY_BUFFER, this.geometry.getFlatNormals(), gl.STATIC_DRAW);
		} else {
			return null;
		}
	}
	return this.flatNormalsBuffer;
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
	spec                        = spec || {};
	this.pointSize              = spec.pointSize != undefined ? spec.pointSize : 1.0;
	
	this.vertexBuffer           = gl.createBuffer(1);
	this.vertexBuffer.size      = geometry.getVertices().length / 3;	
	this.vertexBuffer.numPoints = geometry.getVertices().length / 3;	
	this.vertexBuffer.itemSize  = 3;
	this.vertexBuffer.itemType  = gl.FLOAT;
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, geometry.getVertices(), gl.STATIC_DRAW);

	if (geometry.getColors()) {
		this.colorsBuffer          = gl.createBuffer(1);		
		this.colorsBuffer.size     = geometry.getColors().length / 3;
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
/**
 * A viewport is linked with a camera and defines the portion of the render surface that
 * will be covered by the camera's display.
 */
GG.Viewport = function (spec) {
	spec = spec || {};
	this.x = spec.x != undefined ? spec.x : 0;
	this.y = spec.y != undefined ? spec.y : 0;
	this.width = spec.width != undefined ? spec.width : 320;
	this.height = spec.height != undefined ? spec.height : 200;
	this.clearColor = spec.clearColor != undefined ? spec.clearColor : [0, 0, 0];
	this.zOrder = spec.zOrder != undefined ? spec.zOrder : 0;
};


GG.Viewport.prototype.getWidth = function() {
    return this.width;
};

GG.Viewport.prototype.setWidth = function(width) {
    this.width = width;
    return this;
};


GG.Viewport.prototype.getHeight = function() {
    return this.height;
};

GG.Viewport.prototype.setHeight = function(height) {
    this.height = height;
    return this;
};


GG.Viewport.prototype.getClearColor = function() {
    return this.clearColor;
};

GG.Viewport.prototype.setClearColor = function(clearColor) {
    this.clearColor = clearColor;
    return this;
};

GG.BaseCamera = function (spec) {
	spec             = spec || {};
	this.position    = spec.position != undefined ? spec.position : [ 0.0, 0.0, 0.0];
	this.offset      = [0.0, 0.0, 0.0];
	this.lookAt      = spec.lookAt != undefined ? spec.lookAt : [ 0.0, 0.0, -1.0];
	this.up          = spec.up != undefined ? spec.up : [ 0.0, 1.0, 0.0 ];
	this.rotation    = spec.rotation != undefined ? spec.rotation : [ 0.0, 0.0, 0.0];
	this.near        = spec.near != undefined ? spec.near : 0.1;
	this.far         = spec.far != undefined ? spec.far : 100.0;
	this.aspectRatio = spec.aspectRatio != undefined ? spec.aspectRatio : 1.33;	
	this.viewMatrix  = mat4.create();	
	this.viewport    = new GG.Viewport();
};

GG.BaseCamera.FORWARD_VECTOR = [0.0, 0.0, 1.0, 0.0];
GG.BaseCamera.UP_VECTOR      = [0.0, 1.0, 0.0, 0.0];

GG.BaseCamera.prototype.getViewMatrix = function() {
	mat4.identity(this.viewMatrix); 	 
	
	mat4.rotateX(this.viewMatrix, GG.MathUtils.degToRads(this.rotation[0]));
	mat4.rotateY(this.viewMatrix, GG.MathUtils.degToRads(this.rotation[1])); 	
	mat4.rotateZ(this.viewMatrix, GG.MathUtils.degToRads(this.rotation[2])); 	
	/*
	var base = vec3.create([this.viewMatrix[0], this.viewMatrix[4], this.viewMatrix[8]]);
	vec3.scale(base, this.offset[0], base);
	vec3.add(this.position, base, this.position);

	var base = vec3.create([this.viewMatrix[1], this.viewMatrix[5], this.viewMatrix[9]]);
	vec3.scale(base, this.offset[1], base);
	vec3.add(this.position, base, this.position);	

 	var base = vec3.create([this.viewMatrix[2], this.viewMatrix[6], this.viewMatrix[10]]);
	vec3.scale(base, this.offset[2], base);
	vec3.add(this.position, base, this.position);	
*/
mat4.translate(this.viewMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
	
/*
	console.log('looking dir ' + this.lookAt[0] + ', ' + this.lookAt[1] + ', ' + this.lookAt[2]);
	console.log('position ' + this.position[0] + ', ' + this.position[1] + ', ' + this.position[2]);
	console.log('lt ' + lt[0] + ', ' + lt[1] + ', ' + lt[2]);
	*/
	
	//mat4.lookAt(this.position, lt, this.up, this.viewMatrix);
	this.offset = [0.0, 0.0, 0.0];
	return this.viewMatrix;
	//return mat4.inverse(this.viewMatrix);
};

GG.BaseCamera.prototype.getPosition = function() {
	return this.position;
};

GG.BaseCamera.prototype.setPosition = function(p) {
	this.position = p;
};

GG.BaseCamera.prototype.getRotation = function() {
	return this.rotation;
};
GG.BaseCamera.prototype.setRotation = function(r) {
	this.rotation = r;
	
	return this;
};


GG.BaseCamera.prototype.getViewport = function() {
    return this.viewport;
};

GG.BaseCamera.prototype.setViewport = function(viewport) {
    this.viewport = viewport;
    return this;
};


GG.BaseCamera.prototype.elevate = function (units) {
	this.position[1] += units;
};

GG.BaseCamera.prototype.forward = function (units) {
	//this.offset[2] += units;
	this.position[2] += units;
	/*
	var dir = vec3.normalize(this.lookAt);
	var offset = vec3.create();
	vec3.scale(dir, units, offset);
	vec3.add(this.position, offset, this.position);
	*/
	//vec3.add(this.position, dir, this.lookAt);
};

GG.BaseCamera.prototype.right = function (units) {
	//this.offset[0] += units;
	this.position[0] += units;
	/*
	var up       = vec3.create();
	var rightVec = vec3.create();
	mat4.multiplyVec4(this.viewMatrix, GG.BaseCamera.UP_VECTOR, up);
	vec3.normalize(up);
	vec3.normalize(this.lookAt);
	vec3.cross(this.lookAt, up, rightVec);

	vec3.scale(rightVec, units);
	vec3.add(this.position, rightVec, this.position);
	*/
	//vec3.add(this.position, this.lookAt, this.lookAt);
	//vec3.normalize(this.lookAt);
};

GG.BaseCamera.prototype.zoom = function (amount) {
	// overridde in subclasses
};

GG.BaseCamera.constructor = GG.BaseCamera;
GG.PerspectiveCamera = function(spec) {
	spec                 = spec || {};
	GG.BaseCamera.call(this, spec);
	this.fov             = 45.0;	
	this.projectionMatix = mat4.create();	
}

GG.PerspectiveCamera.prototype = new GG.BaseCamera();
GG.PerspectiveCamera.prototype.constructor = GG.PerspectiveCamera;

GG.PerspectiveCamera.prototype.getProjectionMatrix = function() {
	mat4.perspective(this.fov, this.aspectRatio, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};


GG.PerspectiveCamera.prototype.setup = function(pos, lookAt, up, fov, aspectRatio, near, far) {
	this.position    = pos;
	this.lookAt      = lookAt;
	this.up          = up;
	this.fov         = fov;
	this.near        = near;
	this.far         = far;
	this.aspectRatio = aspectRatio;
	mat4.lookAt(pos, lookAt, up, this.viewMatrix);
	return this;
};

GG.PerspectiveCamera.prototype.zoom = function (amount) {
	this.fov = GG.MathUtils.clamp(this.fov + amount, 0.0, 180.0);
};
GG.OrthographicCamera = function (spec) {
	spec                 = spec || {};
	GG.BaseCamera.call(this, spec);
	this.left            = spec.left != undefined ? spec.left : -1.0;
	this.right           = spec.right != undefined ? spec.right : 1.0;
	this.bottom          = spec.bottom != undefined ? spec.bottom : -1.0;
	this.top             = spec.top != undefined ? spec.top : 1.0;
	this.projectionMatix = mat4.create();	
};

GG.OrthographicCamera.prototype = new GG.BaseCamera();
GG.OrthographicCamera.prototype.constructor = GG.OrthographicCamera;

GG.OrthographicCamera.prototype.getProjectionMatrix = function() {
	mat4.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far, this.projectionMatix);
	return this.projectionMatix;
};


GG.OrthographicCamera.prototype.setup = function(pos, lookAt, up, left, right, bottom, top, near, far) {	
	this.position = pos;
	this.lookAt   = lookAt;
	this.up       = up;
	this.near     = near != undefined ? near : this.near;
	this.far      = far != undefined ? far : this.far;
	this.left     = left != undefined ? left : this.left;
	this.right    = right != undefined ? right : this.right;
	this.bottom   = bottom != undefined ? bottom : this.bottom;
	this.top      = top != undefined ? top : this.top;
	mat4.lookAt(pos, lookAt, up, this.viewMatrix);
	mat4.ortho(left, right, bottom, top, near, far, this.projectionMatix);

	var headPitchBank = GG.MathUtils.mat4ToEuler(this.viewMatrix);
	this.rotation[0] = GG.MathUtils.radsToDeg(headPitchBank[1]);
	this.rotation[1] = GG.MathUtils.radsToDeg(headPitchBank[0]);
	this.rotation[2] = GG.MathUtils.radsToDeg(headPitchBank[2]);
	return this;
};

GG.LT_DIRECTIONAL = 1;
GG.LT_POINT = 2;
GG.LT_SPOT = 3;

GG.Light = function(spec) {
	spec              = spec || {};
	this.lightName    = spec.name != undefined ? spec.name : 'light';
	this.lightType    = spec.type != undefined ? spec.type : GG.LT_POINT;
	this.position     = spec.position != undefined ? spec.position : [0.0, 0.0, 0.0];
	this.direction    = spec.direction != undefined ? spec.direction : [0.0, 0.0, -1.0];
	this.diffuse      = spec.diffuse != undefined ? spec.diffuse : [1.0, 1.0, 1.0];
	this.specular     = spec.specular != undefined ? spec.specular : [1.0, 1.0, 1.0];
	this.attenuation  = spec.attenuation != undefined ? spec.attenuation : 5.0;
	this.cosCutOff    = spec.cosCutOff != undefined ? spec.cosCutOff : 0.5;
	this.shadowCamera = new GG.PerspectiveCamera();
};

GG.Light.prototype = new GG.Light();
GG.Light.prototype.constructor = GG.Light;

GG.Light.prototype.getShadowCamera = function () {	
/*
	if (this.lightType == GG.LT_POINT) {
		var cam = new GG.PerspectiveCamera();
		cam.setup(this.position, this.direction, [0.0, 1.0, 0.0], 90.0, 1.33, 1.0, 100.0);
	} else {
		var cam = new GG.OrthographicCamera();
		cam.setup(this.position, vec3.add(this.position, this.direction, vec3.create()), [0.0, 1.0, 0.0], -7.0, 7.0, -7.0, 7.0, 1.0, 50.0);
	}
	return cam;
	*/
	return this.shadowCamera;
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
	spec                  = spec || {};	
	this.width            = spec.width != undefined ? spec.width : 320;
	this.height           = spec.height != undefined ? spec.height : 200;
	this.colorFormat      = spec.colorFormat;
	this.depthFormat      = spec.depthFormat;
	this.stencilFormat    = spec.stencilFormat;
	this.useColor         = spec.useColor != undefined ? spec.useColor : true;
	this.useDepth         = spec.useDepth != undefined ? spec.useDepth : true;
	this.useStencil       = spec.useStencil != undefined ? spec.useStencil : false;
	
	this.clearColor       = spec.clearColor != undefined ? spec.clearColor : [0.0, 0.0, 0.0, 1.0];
	this.clearDepth       = spec.clearDepth != undefined ? spec.clearDepth : 1.0;
	
	this.colorAttachments = [];
	if (this.useColor && spec.colorAttachment0 != undefined) {
		this.colorAttachments.push(spec.colorAttachment0);
	} 

	this.depthAttachment = null;
	if (this.useDepth && spec.depthAttachment != undefined) {
		this.depthAttachment = spec.depthAttachment;
	}

	this.stencilAttachment = null;
	if (this.useStencil && spec.stencilAttachment != undefined) {
		this.stencilAttachment = spec.stencilAttachment;
	}		

	this.renderBuffers = [];
};

GG.RenderTarget.prototype.constructor = GG.RenderTarget;

GG.RenderTarget.prototype.destroy = function () {
	gl.deleteFramebuffer(this.fbo);
	this.renderBuffers.forEach(function(rb) {
		gl.deleteRenderbuffer(rb);
	});	
};

GG.RenderTarget.prototype.initialize = function () {
	this.colorFormat = this.colorFormat != undefined ? this.colorFormat : gl.RGBA;
	this.depthFormat = this.depthFormat != undefined ? this.depthFormat : gl.DEPTH_COMPONENT16;
	this.stencilFormat = this.stencilFormat != undefined ? this.stencilFormat : gl.STENCIL_INDEX8;

	this.spec = {
		width : this.width,
		height : this.height,
		colorFormat : this.colorFormat,
		depthFormat : this.depthFormat,
		stencilFormat : this.stencilFormat,
		useColor : this.useColor,
		useDepth : this.useDepth,
		useStencil : this.useStencil,
		clearColor : this.clearColor,
		clearDepth : this.clearDepth,
		colorAttachments : this.colorAttachments,
		depthAttachment : this.depthAttachment,
		stencilAttachment : this.stencilAttachment
	};

	this.fbo = gl.createFramebuffer();
	try {
	    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	    
		if (this.colorAttachments.length == 0 && this.useColor) {
			var tex = GG.Texture.createTexture(this.spec);
			this.colorAttachments.push(tex);
		}

		if (this.colorAttachments.length > 0) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorAttachments[0].texture, 0);
			if (this.colorAttachments.length == 2) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.colorAttachments[1].texture, 0);
			}
		}

		
		if (this.useDepth && this.depthAttachment != undefined) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthAttachment.texture, 0);

		} else if (this.useDepth) {
			var buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.depthFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.depthAttachment = buff;	
			this.renderBuffers.push(buff);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthAttachment);
		}

		if (this.useStencil && this.stencilAttachment != undefined) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, this.stencilAttachment.texture, 0);

		} else if (this.useStencil) {
			var buff = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, buff);
			gl.renderbufferStorage(gl.RENDERBUFFER, this.stencilFormat, this.width, this.height);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);	

			this.stencilAttachment = buff;	
			this.renderBuffers.push(buff);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.stencilAttachment);
		}
		
		this.valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
		if (!this.valid) {
			throw "Could not create FBO";
		}

	} finally {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);	
	}
};

GG.RenderTarget.prototype.isValid = function() {
	return this.valid;
};

GG.RenderTarget.prototype.activate = function() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

	if (!this.useColor) {		
		gl.drawBuffer(gl.NONE);
    	gl.colorMask(false, false, false, false);
	} else {
		gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	if (this.useDepth) {
		gl.clearDepth(this.clearDepth);
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

GG.RenderTarget.prototype.getDepthAttachment = function() {
	return this.depthAttachment;
};

GG.RenderTarget.prototype.getStencilAttachment = function() {
	return this.stencilAttachment;
};

/**
 * Provides information regarding the current render context. This type
 * of information includes the active scene, the camera, the render target, etc.
 */
GG.RenderContext = function(spec) {
	spec              = spec || {};	
	this.renderer     = spec.renderer != undefined ? spec.renderer : GG.renderer;
	this.clock        = spec.clock != undefined ? spec.clock : GG.clock;
	this.camera       = spec.camera;
	this.renderTarget = spec.renderTarget;
	this.scene        = spec.scene;
	this.light        = spec.light;
};
GG.PingPongBuffer = function (spec) {
	spec = spec || {};

	if (!spec.colorAttachments) {
		var textures = [ GG.Texture.createTexture(spec), GG.Texture.createTexture(spec) ];	
		spec.colorAttachments = textures;
	}		
	this.textureUnit = spec.textureUnit != undefined ? spec.textureUnit : GG.TEX_UNIT_DIFFUSE_MAP_0;
	this.spec        = GG.cloneDictionary(spec);		
};

GG.PingPongBuffer.prototype.constructor = GG.PingPongBuffer;

GG.PingPongBuffer.prototype.destroy = function() {
	this.fbos[this.writeFBO].destroy();	
	this.fbos[this.readFBO].destroy();	
};

GG.PingPongBuffer.prototype.initialize = function() {
	this.fbos = [];
	rtSpec = GG.cloneDictionary(this.spec);	
	for (var i = 0; i < 2; i++) {
		if (this.spec.colorAttachments[i]) {
			rtSpec.colorAttachments = [this.spec.colorAttachments[i]];
		} else {
			rtSpec.colorAttachments = null;
		}
		var rt = new GG.RenderTarget(rtSpec);
		rt.initialize();
		this.fbos.push(rt);
	}
	this.readFBO = 0;
	this.writeFBO = 1;
};

GG.PingPongBuffer.prototype.activate = function() {
	this.fbos[this.readFBO].getColorAttachment(0).bindAtUnit(this.textureUnit);
	this.fbos[this.writeFBO].activate();	
};

GG.PingPongBuffer.prototype.deactivate = function() {
	this.fbos[this.writeFBO].deactivate();	
};

/** Swaps the input & output textures */
GG.PingPongBuffer.prototype.swap = function() {
	this.readFBO = (this.readFBO + 1) % 2;
	this.writeFBO = (this.writeFBO + 1) % 2;
};

GG.PingPongBuffer.prototype.sourceTexture = function() {
	return this.fbos[this.readFBO].getColorAttachment(0);	
};

GG.PingPongBuffer.prototype.targetTexture = function() {
	return this.fbos[this.writeFBO].getColorAttachment(0);	
};
/**
 * Manages a chain of post processing, screen filters. 
 *
 * A Texture or RenderTarget is required to provide the input, while the output
 * can be either a RenderTarget or null which corresponds to the WebGL BACK buffer.
 *
 * PostProcessChain will generate a GLSL program according to the contents
 * of the filter chain. The benefit is that all processing happens in a single
 * pass rather than doing one pass per filter.
 *
 * E.g.:
 * var postProcess = new GG.PostProcessChain();
 * postProcess.input(highResRT).output(null)
 * 	.filter(myScreenFilter).vignette({ radius : 0.1 }).gamma(2.2);
 */ 	               
GG.PostProcessChain = function (spec) {
	this.filterChain = [];
	this.screenPass  = new GG.ScreenPass();
	this.program     = null;
	this.src         = null;
	this.dest        = null;
	this.needsUpdate = true;

	this.availableFilters = {
		'gamma'    : GG.GammaScreenFilter,
		'vignette' : GG.VignetteScreenFilter,
		'tvLines'  : GG.TVLinesScreenFilter
	};

	for (filterName in this.availableFilters) {
		var that = this;
		this[filterName] = function (fname) {
			return function (spec) {
				that.filterChain.push(new that.availableFilters[fname](spec));
				that.needsUpdate = true;
				return that;
			}
		}(filterName);
	}
		
};

GG.PostProcessChain.prototype.constructor = GG.PostProcessChain;

GG.PostProcessChain.prototype.source = function (src) {
	this.src = src;
	return this;
};

GG.PostProcessChain.prototype.destination = function (dest) {
	this.dest = dest;
	return this;
};

GG.PostProcessChain.prototype.process = function () {
	if (this.needsUpdate) {
		this.screenPass.destroy();

		var programSource = new GG.ProgramSource();
		programSource.asFragmentShader().floatPrecision('highp')
			.uniform('sampler2D', 'u_sourceTexture')
			.varying('vec2', 'v_texCoords')
			.addMainInitBlock('vec4 color = texture2D(u_sourceTexture, v_texCoords);');

		for (var i = 0; i < this.filterChain.length; i++) {
			this.filterChain[i].inject(programSource);
		};

		programSource.addMainBlock("gl_FragColor = vec4(color.rgb, 1.0);");
		
		this.screenPass = new GG.ScreenPass({
			vertexShader   : GG.ShaderLib.screen_filter_vertex,
			fragmentShader : programSource.toString()			
		});

		this.needsUpdate = false;
	}

	var sourceTexture = this.src;
	if (this.src instanceof GG.RenderTarget) {
		sourceTexture = this.src.getColorAttachment(0);
	}
	this.screenPass.setSourceTexture(sourceTexture);

	try {
		if (this.dest instanceof GG.RenderTarget) {
			this.dest.activate();
		} else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		}

		// call createGpuProgram now in order to get the gpu program
		this.screenPass.createGpuProgram();
		gl.useProgram(this.screenPass.program);
		
		for (var i = 0; i < this.filterChain.length; i++) {
			this.filterChain[i].setUniforms(this.screenPass.program);
		};
		this.screenPass.render();
	} finally {
		if (this.dest instanceof GG.RenderTarget) {
			this.dest.deactivate();
		}
	}
};

GG.PostProcessChain.prototype.filter = function (screenFilter) {
	// body...
	return this;
};


GG.GammaScreenFilter = function (spec) {
	spec = spec || {};
	if (typeof spec == "number") {
		this.gamma = spec;
	} else {
		this.gamma = spec.gamma != undefined ? spec.gamma : 2.2;
	}	
	console.log(this.gamma);
};

GG.GammaScreenFilter.prototype.constructor = GG.GammaScreenFilter;

GG.GammaScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_gamma')
		.addMainBlock("color.rgb = pow(color.rgb, vec3(u_gamma));");
};

GG.GammaScreenFilter.prototype.setUniforms = function (program) {
	gl.uniform1f(program.u_gamma, 1.0 / this.gamma);
};
GG.VignetteScreenFilter = function (spec) {
	spec                     = spec || {};
	this.u_vignetteContrast  = spec.u_vignetteContrast != undefined ? spec.u_vignetteContrast : 2.5;
	this.u_vignetteSpread    = spec.u_vignetteSpread != undefined ? spec.u_vignetteSpread : 5.0;
	
	// controls the ratio of the elliptical surface that will be black when the
	// gradient is formed
	this.u_vignetteDarkRatio = spec.u_vignetteDarkRatio != undefined ? spec.u_vignetteDarkRatio : 1.0;
	
	this.u_vignetteColor     = spec.u_vignetteColor != undefined ? spec.u_vignetteColor : [0.02, 0.02, 0.02];
};

GG.VignetteScreenFilter.prototype.constructor = GG.VignetteScreenFilter;

GG.VignetteScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_vignetteContrast')
		.uniform('float', 'u_vignetteSpread')
		.uniform('float', 'u_vignetteDarkRatio')
		.uniform('vec3', 'u_vignetteColor')
		.addMainBlock([	
		// creates a gradient white-to-black starting from the center
   		"float f = clamp(1.0 - u_vignetteDarkRatio*sqrt(dot(v_texCoords-vec2(0.5), v_texCoords-vec2(0.5))), 0.0, 1.0);",
   
	   // reverses the gradient
	   "float invF = 1.0 - f;",
	   
	   // u_vignetteSpreads the black regions towards the corners
	   // because invF is smaller than 1.0 and by raising it to a power
	   // we get even smaller values. Points near the borders of the image
	   // are decreasing slower as their are closer to 1.0 (being white).
	   "float p1 = pow(invF, u_vignetteContrast);",
   
	   // reverses the colors
	   "float p2 = pow(1.0 - p1, u_vignetteSpread);",
   
	   // p2 varies between 0.0 and 1.0 and it can be used to
	   // interpolate between the original image color and the
	   // shadow color
	   "vec3 vignetterFactor = mix(u_vignetteColor, vec3(1.0), p2);",
	   "color = vec4(vignetterFactor, 1.0) * color;"
	].join('\n'));
};

GG.VignetteScreenFilter.prototype.setUniforms = function (program) {
	gl.uniform1f(program.u_vignetteContrast, this.u_vignetteContrast);
	gl.uniform1f(program.u_vignetteSpread, this.u_vignetteSpread);
	gl.uniform1f(program.u_vignetteDarkRatio, this.u_vignetteDarkRatio);
	gl.uniform3fv(program.u_vignetteColor, this.u_vignetteColor);
};
GG.TVLinesScreenFilter = function () {
	// body...
};

GG.TVLinesScreenFilter.prototype.constructor = GG.TVLinesScreenFilter;

GG.TVLinesScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_fTime0_1')
		.addMainBlock("color = color*0.9 + 0.041*cos(-10.0*u_fTime0_1+v_texCoords.y*1000.0);");
};

GG.TVLinesScreenFilter.prototype.setUniforms = function (program) {

};
GG.GLSLProgram = function (spec) {
	spec                = spec || {};
	this.vertexShader   = spec.vertexShader != undefined ? spec.vertexShader : '';
	this.fragmentShader = spec.fragmentShader != undefined ? spec.fragmentShader : '';
	this.compiled       = false;
	this.gpuProgram     = null;
	this.hashKey        = 0;
};

GG.GLSLProgram.prototype.destroy = function() {
	if (this.gpuProgram) {
		gl.deleteProgram(this.gpuProgram);
	}
};

GG.GLSLProgram.prototype.isCompiled = function() {
	return this.compiled;
};

GG.GLSLProgram.prototype.compile = function() {
	this.gpuProgram = GG.ProgramUtils.createProgram(this.vertexShader.toString(), this.fragmentShader.toString());
	return this;
};

GG.GLSLProgram.prototype.bind = function() {
	gl.useProgram(this.gpuProgram);
	return this;
};

GG.GLSLProgram.prototype.unbind = function() {
	gl.useProgram(null);
	return this;
};

GG.GLSLProgram.BuiltInAttributes = {
	attribPosition  : GG.Naming.AttributePosition,
	attribNormal    : GG.Naming.AttributeNormal,
	attribTexCoords : GG.Naming.AttributeTexCoords,
	attribColor     : GG.Naming.AttributeColor
};

GG.GLSLProgram.BuiltInUniforms = [
	GG.Naming.UniformModelMatrix,
	GG.Naming.UniformNormalMatrix,
	GG.Naming.UniformViewMatrix,
	GG.Naming.UniformModelViewMatrix,
	GG.Naming.UniformProjectionMatrix,
	GG.Naming.UniformTime0_X
];


/**
 * precision
 * pragmas
 * attributes
 * uniforms
 * varyings
 * declarations
 * main {
 *	main init
 *	main lighting
 *		per point light
 *		per directional light
 *		per spot light
 *	main blocks
 *	post process
 * } 
 *
 * Fragment shader variable names by convention:
 * 	N - the normalized normal
 *	L - the light vector
 *	V - the view vector
 *	diffuse - the final diffuse color
 *	specular - the final specular color
 *  color - the final shaded color
 *
 * Varying names by convention
 *	v_viewPos - the view position of the vertex
 *	v_viewVector - the view vector
 *	v_normal - the interpolated normal
 */
GG.ProgramSource = function (spec) {
	this.shaderType             = 'vertex';
	this.fpPrecision            = 'highp';
	this.typeDeclarations       = {};
	this.declarations           = [];
	this.uniforms               = {};
	this.attributes             = {};
	this.varyings               = {};
	this.mainInit               = [];	
	this.mainBlocks             = [];
	this.pointLightBlocks       = [];
	this.directionalLightBlocks = [];
	this.spotLightBlocks        = [];
};

GG.ProgramSource.prototype.asVertexShader = function() {
	this.shaderType = 'vertex';
	return this;
};

GG.ProgramSource.prototype.asFragmentShader = function() {
	this.shaderType = 'fragment';
	return this;
};

GG.ProgramSource.prototype.floatPrecision = function(value) {
	this.fpPrecision = value;
	return this;
};

GG.ProgramSource.prototype.attribute = function(type, name) {
	this.attributes[name] = type;
	return this;
};

GG.ProgramSource.prototype.uniform = function(type, name) {
	this.uniforms[name] = type;
	return this;
};

GG.ProgramSource.prototype.varying = function(type, name) {
	this.varyings[name] = type;
	return this;
};

GG.ProgramSource.prototype.hasUniform = function(name) {
	return name in this.uniforms;
};

GG.ProgramSource.prototype.uniformLight = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_light");
	return this;
};

GG.ProgramSource.prototype.uniformPointLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_pointLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformSpotLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_spotLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformDirectionalLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_directionalLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformMaterial = function(uniformName) {
	this.addTypeDecl(GG.ShaderLib.blocks['materialInfoStructure'], 'MaterialStruct');	
	var name = uniformName != undefined ? uniformName : 'u_material';
	this.uniform('Material_t', name);
	return this;
};

GG.ProgramSource.prototype.addDecl = function(block, name) {
	this.declarations.push({
		'name' : name != undefined ? name : 'decl_' + this.declarations.length,
		'code' : block,
		'order' : this.declarations.length
	});
	return this;
};

GG.ProgramSource.prototype.addTypeDecl = function(block, name) {
	this.typeDeclarations[name] = block;
	return this;
};

GG.ProgramSource.prototype.addMainInitBlock = function(block, name) {
	this.mainInit.push({
		'name' : name != undefined ? name : 'block_' + this.mainInit.length,
		'code' : block,
		'order' : this.mainInit.length
	});
	return this;
};

GG.ProgramSource.prototype.addMainBlock = function(block, name) {
	this.mainBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.mainBlocks.length,
		'code' : block,
		'order' : this.mainBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.perPointLightBlock = function (block) {
	this.pointLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.pointLightBlocks.length,
		'code' : block,
		'order' : this.pointLightBlocks.length
	});
};

GG.ProgramSource.prototype.perDirectionalLightBlock = function (block) {
	this.directionalLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.directionalLightBlocks.length,
		'code' : block,
		'order' : this.directionalLightBlocks.length
	});
};

GG.ProgramSource.prototype.perSpotLightBlock = function (block) {
	this.spotLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.spotLightBlocks.length,
		'code' : block,
		'order' : this.spotLightBlocks.length
	});
};

GG.ProgramSource.prototype.position = function() {
	this.attribute('vec4', GG.GLSLProgram.BuiltInAttributes.attribPosition);
	return this;
};

GG.ProgramSource.prototype.normal = function() {
	this.attribute('vec3', GG.Naming.AttributeNormal);
	return this;
};

GG.ProgramSource.prototype.texCoord0 = function() {
	this.attribute('vec2', GG.GLSLProgram.BuiltInAttributes.attribTexCoords);
	return this;
};

GG.ProgramSource.prototype.color = function() {
	this.attribute('vec3', GG.GLSLProgram.BuiltInAttributes.attribColor);
	return this;
};

GG.ProgramSource.prototype.uniformModelMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformModelMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformViewMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformModelViewMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformModelViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformProjectionMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformProjectionMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformNormalsMatrix = function() {
	this.uniform('mat3', GG.Naming.UniformNormalMatrix);
	return this;
};



GG.ProgramSource.prototype.toString = function() {
	var glsl = '';

	if (this.shaderType == 'fragment') {
		glsl += 'precision ' + this.fpPrecision + ' float;\n';
	} 

	glsl += '// Begin - Attributes\n';
	for (var attr in this.attributes) {
		glsl += 'attribute ' + this.attributes[attr] + ' ' + attr + ';\n';
	}
	glsl += '// End - Attributes\n\n';

	glsl += '// Begin - Type Declarations\n';
	for (var i = 0; i < this.typeDeclarations.length; i++) {
		glsl += this.typeDeclarations[i].code + '\n';
	}
	for (var t in this.typeDeclarations) {
		glsl += '// ' + t + '\n';
		glsl += this.typeDeclarations[t] + '\n';
	}
	glsl += '// End - Type Declarations\n\n';

	glsl += '// Begin - Uniforms\n';
	for (var u in this.uniforms) {
		glsl += 'uniform ' + this.uniforms[u] + ' ' + u + ';\n';
	}
	glsl += '// End - Uniforms\n\n';

	glsl += '// Begin - Varyings\n';
	for (var v in this.varyings) {
		glsl += 'varying ' + this.varyings[v] + ' ' + v + ';\n';
	}
	glsl += '// End - Varyings\n\n';

	glsl += '// Begin - Declarations\n';
	for (var i = 0; i < this.declarations.length; i++) {
		glsl += this.declarations[i].code + '\n';
	};
	glsl += '// End - Declarations\n\n';

	glsl += 'void main() { // begin main\n';

	glsl += '// Begin - Main Init\n';
	for (var i = 0; i < this.mainInit.length; i++) {
		glsl += this.mainInit[i].code + '\n';
	};
	glsl += '// End - Main Init\n\n';

	// Shading
	for (var i = 0; i < this.pointLightBlocks.length; i++) {
		glsl += this.pointLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}
	for (var i = 0; i < this.directionalLightBlocks.length; i++) {
		glsl += this.directionalLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}
	for (var i = 0; i < this.spotLightBlocks.length; i++) {
		glsl += this.spotLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}

	for (var i = 0; i < this.mainBlocks.length; i++) {
		glsl += this.mainBlocks[i].code + '\n';
	};

	glsl += '} // end main \n';

	return glsl;
};

/*
pg.attribute(GG.ATTRIB_POS).attribute(GG.ATTRIB_NOR)
  .uniform(GG.UNIFORM_VIEW_MATRIX)
  .uniform(GG.UNIFORM_MODEL_MATRIX)
  .uniform(GG.UNIFORM_PROJECTION_MATRIX)
  .varying('v_normal')
  .varying('v_viewPos')
  .main.addBlock([
  	'v_viewPos = u_matView * u_matModel * a_position',
  	'v_normal = u_matNormal * a_normal;'
  	].join('\n'));

var vertexShader = pg.toString();

var pointLights = [...];
pg.precision('mediump')
  .uniformPointLights(pointLights.length)
  .uniform(GG.UNIFORM_VIEW_MATRIX)
  .uniformMaterial('u_phongMaterial')
  .varying('v_normal')
  .varying('v_viewPos')
  .addDecl(GG.ShaderLib.blocks['directionalLightIrradiance'])
  .addMainInitBlock([
		"	vec3 N = normalize(v_normal);",
		"	vec3 V = normalize(v_viewVector);",		
		"	vec3 diffuse = vec3(0.0);",
		"	vec3 specular = vec3(0.0);",
		"	vec3 L;"
  	].join('\n'));

for (var i = 0; i < pointLights.length; i++) {
	pg.addMainBlock([
		"	L = normalize(u_matView*vec4(u_spotLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	spotLightIrradiance(N, V, L, u_spotLights[INDEX], diffuse, specular);"
		].join('\n').replace(/INDEX/g, i),
		'phong_light_' + i
	);
}  
pg.addMainBlock(GG.ShaderLib.parameterizedBlocks('gammaColor', 'gl_FragColor'))
  .addMainBlock(
  	"gl_FragColor = u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
	);

fragmentShader = pg.toString();


i.Getting attributes and uniform locations

Using the ProgramSource and iterating the respective fields

ProgramUtils.getAttributeLocations(pg.listAttributesNames())
ProgramUtils.getUniformLocations(pg.listUniformsNames())

ii. Point light uniforms 

Use a utility method like ProgramUtils.pointLightsUniforms(numLights).
It can detect them automatically as the uniform name is standardized.

iii Material uniforms

iv. Setting uniforms

The list of uniform names can be retrieved from the ProgramSource:
pg.listUniformsNames()

or through introspection:

gl.getActiveUniform(program, location),

where location ranges between 0 and the total number of uniforms used in the program.
The returned value contains the name of the uniform.

To set a material: ProgramUtils.setMaterialUniforms('u_material', a_material_instance);

To set the lights: ProgramUtils.setPointLights('u_pointLights', array_of_lights)



*/
GG.BLEND_MULTIPLY    = 1;
GG.BLEND_ADD          = 2;
GG.BLEND_SUBTRACT     = 3;
GG.BLEND_DARKEN       = 4;
GG.BLEND_COLOR_BURN   = 5;
GG.BLEND_LINEAR_BURN  = 6;
GG.BLEND_LIGHTEN      = 7;
GG.BLEND_SCREEN       = 8;
GG.BLEND_COLOR_DODGE  = 9;
GG.BLEND_OVERLAY      = 10;
GG.BLEND_SOFT_LIGHT   = 11;
GG.BLEND_HARD_LIGHT   = 12;
GG.BLEND_VIVID_LIGHT  = 13;
GG.BLEND_LINEAR_LIGHT = 14;
GG.BLEND_PIN_LIGHT    = 15;


GG.TextureStackEntry = function (spec) {
	spec = spec || {};
	this.texture    = spec.texture;
	this.blendMode  = spec.blendMode != null ? spec.blendMode : GG.BLEND_MULTIPLY;
	this.uvSetIndex = 0;
	this.offsetU    = 0;
	this.offsetV    = 0;
	this.scaleU     = 1;
	this.scaleV     = 1;
};

GG.TextureStack = function (spec) {	
	this.stackEntries = [];
};

GG.TextureStack.prototype.constructor = GG.TextureStack;

GG.TextureStack.prototype.isEmpty = function () {
	return this.stackEntries.length == 0;
};

GG.TextureStack.prototype.size = function () {
	return this.stackEntries.length;
};

GG.TextureStack.prototype.getAt = function (index) {
	return this.stackEntries[index];
};

GG.TextureStack.prototype.setEntryAt = function (index, entry) {
	this.stackEntries[index] = entry;
	return this;
};

GG.TextureStack.prototype.setAt = function (index, texture, blendMode) {
	var entry = new GG.TextureStackEntry({ 'texture' : texture, 'blendMode' : blendMode});
	this.stackEntries[index] = entry;
	return this;
};

GG.TextureStack.prototype.pushTexture = function (entry) {
	this.stackEntries.push(entry);
	return this;
};

GG.TextureStack.prototype.hashCode = function () {
	var size = this.size();
	var hash = size.toString();
	for (var i = 0; i < size; i++) {
		var entry = this.stackEntries[i];
		hash += entry.texture != null;
		hash += entry.blendMode;
	}
	return hash;
};
GG.BaseMaterial = function(spec) {
	spec             = spec || {};
	
	this.technique   = spec.technique;
	
	this.ambient     = spec.ambient != undefined ? spec.ambient : [0.1, 0.1, 0.1];
	this.diffuse     = spec.diffuse != undefined ? spec.diffuse : [1.0, 1.0, 1.0];
	this.specular    = spec.specular != undefined ? spec.specular : [1.0, 1.0, 1.0];
	this.shininess   = spec.shininess != undefined ? spec.shininess : 10.0;
	
	this.diffuseMap  = spec.diffuseMap;
	this.specularMap = spec.specularMap;
	this.opacityMap  = spec.opacityMap;
	this.lightMap    = spec.lightMap;
	this.glowMap     = spec.glowMap;

	this.diffuseTextureStack = new GG.TextureStack();
	
	this.flatShade   = spec.flatShade != undefined ? spec.flatShade : false;
	this.phongShade  = spec.phongShade != undefined ? spec.phongShade : true;	
	this.shadeless   = spec.shadeless != undefined ? spec.shadeless : false;
	this.wireframe   = spec.wireframe != undefined ? spec.wireframe : false;
	this.wireOffset  = spec.wireOffset != undefined ? spec.wireOffset : 0.001;
	this.wireWidth   = spec.wireOffset != undefined ? spec.wireOffset : 1.0;

	// environment map to be sampled for reflections
	this.envMap          = spec.envMap != undefined ? spec.envMap : null;
	// amount of reflectance
	this.reflectance     = spec.reflectance != undefined ? spec.reflectance : 0.80;

	// index of refraction 
	this.IOR             = spec.IOR != undefined ? spec.IOR : [ 1.0, 1.0, 1.0 ];

	// index of refraction of the environment surounding the object 
	this.externalIOR     = spec.externalIOR != undefined ? spec.externalIOR : [ 1.330, 1.31, 1.230 ];

	this.fresnelBias     = spec.fresnelBias != undefined ? spec.fresnelBias : 0.44;
	this.fresnelExponent = spec.fresnelExponent != undefined ? spec.fresnelExponent : 2.0;
};

GG.BaseMaterial.prototype = new GG.BaseMaterial();
GG.BaseMaterial.prototype.constructor = GG.BaseMaterial;

GG.BaseMaterial.BIT_DIFFUSE_MAP     = 1;
GG.BaseMaterial.BIT_SPECULAR_MAP    = 2;
GG.BaseMaterial.BIT_OPACITY_MAP     = 4;
GG.BaseMaterial.BIT_LIGHT_MAP       = 16;
GG.BaseMaterial.BIT_GLOW_MAP        = 32;
GG.BaseMaterial.BIT_ENVIRONMENT_MAP = 64;

GG.BaseMaterial.prototype.getTechnique = function() {	
	return this.pickTechnique();
};

GG.BaseMaterial.prototype.setTechnique = function(technique) {
	this.technique = technique;
	return this;
};

GG.BaseMaterial.prototype.addDiffuseTexture = function(texture, blendMode) {
	var entry = new GG.TextureStackEntry({ 'texture' : texture, 'blendMode' : blendMode});
	this.diffuseTextureStack.pushTexture(entry);
};

GG.BaseMaterial.prototype.pickTechnique = function() {
	if (this.wireframe) {
		if (this.wireframeTechnique == null) {
			this.wireframeTechnique = new GG.WireframeTechnique();
		}
		return this.wireframeTechnique;
	}
	if (this.shadeless) {
		if (this.shadelessTechnique == null) {
			this.shadelessTechnique = new GG.ConstantColorTechnique();
		}
		return this.shadelessTechnique;
	}
	
	if (this.phongShadeTechnique == null) {
		this.phongShadeTechnique = new GG.PhongShadingTechnique();
	}
	return this.phongShadeTechnique;
	
};

GG.BaseMaterial.prototype.getRenderAttributesMask = function () {
	var bitMask = 0;
	if (this.diffuseMap) {
		bitMask |= GG.BaseMaterial.BIT_DIFFUSE_MAP;
	}
	return bitMask;
};

GG.PhongMaterial = function (spec) {
	spec = spec || {};
	spec.technique = new GG.PhongShadingTechnique();
	spec.technique.initialize();

	GG.BaseMaterial.call(this, spec);
};

GG.PhongMaterial.prototype = new GG.BaseMaterial();
GG.PhongMaterial.prototype.constructor = GG.PhongMaterial;
/**
 * Represents a single render pass of a renderable object.
 * It provides a quick way to render an object and a building block
 * with which you can construct multi-pass rendering techniques.
 *
 * Creation parameters:
 * spec.sourceTexture : a texture object to bind as source before rendering
 * spec.vertexShader : the vertex shader code
 * spec.fragmentShader : the fragment shader code
 * spec.attributeNames : a list containing the attribute names.
 * spec.renderableType : a constant that defines the type of renderable that
 * this pass expects. If it is set to undefined or null, then the __renderGeometry
 * method will be called to do the actual rendering. Otherwise, RenderPass will
 * take care of calling the appropriate render method for this renderable type.
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
 * object. The default implementation performs no rendering. Not necessary if you
 * provide a renderableType in the input specifications.
 */
GG.RenderPass = function (spec) {
	spec                = spec || {}	
	this.vertexShader   = spec.vertexShader;
	this.fragmentShader = spec.fragmentShader;
	this.renderableType = spec.renderableType != undefined ? spec.renderableType : GG.RenderPass.MESH;
	this.callback       = spec.callback != undefined ? spec.callback : this;
	this.attributeNames = spec.attributeNames || [];
	this.program        = null;
	this.usesLighting   = spec.usesLighting != undefined ? spec.usesLighting : true;
};

GG.RenderPass.prototype.constructor = GG.RenderPass;

GG.RenderPass.MESH = 1;

GG.RenderPass.prototype.createGpuProgram = function() {
	// create the gpu program if it is not linked already
	if (!this.program) {
		this.program = GG.ProgramUtils.createProgram(this.vertexShader, this.fragmentShader);
	}

	if (this.program) {
		GG.ProgramUtils.getAttributeLocations(this.program);	
		GG.ProgramUtils.getUniformsLocations(this.program);	
	}
};


GG.RenderPass.prototype.destroy = function() {
	if (this.program) gl.deleteProgram(this.program);
};

GG.RenderPass.prototype.prepareForRendering = function(renderable, renderContext) {
	if (this.program == null) {
		this.createGpuProgram();
	}
};

GG.RenderPass.prototype.setShaderParametersForRendering = function(renderable, renderContext) {
	gl.useProgram(this.program);

	// this should be overridden in each subclass
	this.__setCustomAttributes(renderable, renderContext, this.program);	

	// scans the passed uniforms and sets a value if any of those belong to the built-in list
	GG.ProgramUtils.injectBuiltInUniforms(this.program, renderContext, renderable);

	// this should be overridden in each subclass	
	this.__setCustomUniforms(renderable, renderContext, this.program);		
};

GG.RenderPass.prototype.setRenderState = function(renderable, renderContext) {
	this.__setCustomRenderState(renderable, renderContext, this.program);
};

GG.RenderPass.prototype.submitGeometryForRendering = function(renderable, renderContext) {
	if (renderable && this.renderableType == GG.RenderPass.MESH) {
		var options = {
			mode : this.getRenderPrimitive(renderable)
		};
		renderContext.renderer.renderMesh(renderable, this.program, options);
	} else {
		this.callback.__renderGeometry(renderable);
	}
};

GG.RenderPass.prototype.finishRendering = function(renderable, renderContext) {
	gl.useProgram(null);
};

GG.RenderPass.prototype.render = function(renderable, renderContext) {
	
	this.prepareForRendering(renderable, renderContext);

	if (this.program) {
		this.setRenderState(renderable, renderContext);

		this.setShaderParametersForRendering(renderable, renderContext);
		
		this.submitGeometryForRendering(renderable, renderContext);
		
		this.finishRendering();	
	}
};

GG.RenderPass.prototype.usesSceneLighting = function() {
	return this.usesLighting;
};

GG.RenderPass.prototype.getVertexShaderSource = function() {
	return this.vertexShader;
};

GG.RenderPass.prototype.getFragmentShaderSource = function() {
	return this.fragmentShader;
};

GG.RenderPass.prototype.setProgram = function(program) {
	this.program = program;
	return this;
};

// no-op default implementations
GG.RenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomAttributes = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__renderGeometry = function(renderable, ctx, program) {};
GG.RenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {};

/**
 * Subclasses can override this method in order to render lines or points, fans, strips, etc.
 */
GG.RenderPass.prototype.getRenderPrimitive = function(renderable) {
	return gl.TRIANGLES;
};

/**
 * Simplifies the creation of render passes that perform a screen space
 * effect, for e.g. tone mapping, bloom, blur, etc.
 */
GG.ScreenPass = function(spec) {
	spec = spec || {};

	GG.RenderPass.call(this, spec);

	this.sourceTexture = spec.sourceTexture;
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

GG.ScreenPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	// the default sourceTexture always goes to texture unit GG.TEX_UNIT_DIFFUSE_MAP_0
	if (this.sourceTexture != null) {
		this.sourceTexture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP_0);		
		gl.uniform1i(this.program.u_sourceTexture, GG.TEX_UNIT_DIFFUSE_MAP_0);
	}
};

GG.ScreenPass.prototype.setSourceTexture = function(texture) {
	this.sourceTexture = texture;
};

GG.ScreenPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	gl.disable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
};




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
GG.GaussianBlurPass = function (spec) {
	spec              = spec || {};
	this.filterSize   = spec.filterSize != undefined ? spec.filterSize : 2;
	this.isHorizontal = spec.horizontal != undefined ? spec.horizontal : true;	

	var fs = [
		"precision highp float;",
		"uniform sampler2D u_sourceTexture;",
		"uniform int u_filterSize;",
		"uniform float u_isHorizontal;",
		"uniform vec2 u_texStepSize;",
		"varying vec2 v_texCoords;",

		"const int MAX_FILTER_SIZE = 24;",

		"void main() {",
		"	int halfFilterSize = u_filterSize / 2;",
		"	vec4 color;",
		"	vec2 basis = vec2(u_isHorizontal, 1.0 - u_isHorizontal);",			
		"	for (int i = 0; i < MAX_FILTER_SIZE; i++) {",
		"		if (i > halfFilterSize) break;",
		"		vec2 offset = u_texStepSize * float(i);",
		"		color += texture2D(u_sourceTexture, v_texCoords + offset * basis);",
		"		color += texture2D(u_sourceTexture, v_texCoords - offset * basis);",
		"	}",
		
		"	color /= float(u_filterSize);",
		"	gl_FragColor = vec4(color.rgb, 1.0);",
		"}"].join('\n');

	GG.ScreenPass.call(this, { 
		sourceTexture : spec.sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : fs
	});
};


GG.GaussianBlurPass.prototype = new GG.ScreenPass();

GG.GaussianBlurPass.prototype.constructor = GG.GaussianBlurPass;

GG.GaussianBlurPass.prototype.setHorizontal = function() {
	this.isHorizontal = true;
};

GG.GaussianBlurPass.prototype.setVertical = function() {
	this.isHorizontal = false;
};

GG.GaussianBlurPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this);
	gl.uniform1i(this.program.u_filterSize, this.filterSize);
	gl.uniform1f(this.program.u_isHorizontal, this.isHorizontal ? 1.0 : 0.0);
	texStep = [ 1.0 / this.sourceTexture.width, 1.0 / this.sourceTexture.height ];
	gl.uniform2fv(program.u_texStepSize, texStep);
};

GG.AdaptiveRenderPass = function (spec) {
	this.programCache = {};
	this.activeRenderAttributes = 0;	
	this.activeHash = null;

	GG.RenderPass.call(this, spec);
};

GG.AdaptiveRenderPass.prototype             = new GG.RenderPass();
GG.AdaptiveRenderPass.prototype.constructor = GG.AdaptiveRenderPass;

GG.AdaptiveRenderPass.prototype.prepareForRendering = function (renderable, renderContext) {
	if (renderable.getMaterial() != null) {
		this.adaptShadersToMaterial(renderable.getMaterial());
	}	
	GG.RenderPass.prototype.prepareForRendering.call(this, renderable, renderContext);
};

GG.AdaptiveRenderPass.prototype.adaptShadersToMaterial = function (material) {	
	var hash = this.hashMaterial(material);
	if (this.shouldInvalidateProgram(hash)) {
		this.program = null;
		var cachedProgram = this.lookupCachedProgramInstance(hash);
		if (cachedProgram != null) {
			this.useProgramInstance(cachedProgram, hash);
		} else {
			this.createNewProgramInstance(material, hash);		
			this.storeProgramInstanceInCache(this.program, hash);	
		}		
	}
};

GG.AdaptiveRenderPass.prototype.useProgramInstance = function (program, hash) {
	this.program = program;
	this.activeHash = hash;
};

GG.AdaptiveRenderPass.prototype.createNewProgramInstance = function (material, hash) {
	this.createShadersForMaterial(material);
	this.createGpuProgram();	
	this.useProgramInstance(this.program, hash);
};

GG.AdaptiveRenderPass.prototype.shouldInvalidateProgram = function (hash) {	
	return this.program == null || this.activeHash != hash;
};

GG.AdaptiveRenderPass.prototype.lookupCachedProgramInstance = function (hash) {
	return this.programCache[hash];
};

GG.AdaptiveRenderPass.prototype.storeProgramInstanceInCache = function (program, hash) {
	return this.programCache[hash] = program;
};

GG.AdaptiveRenderPass.prototype.createShadersForMaterial = function (material) {
	throw "AdaptiveRenderPass.createShadersForMaterial is abstract";
};

GG.AdaptiveRenderPass.prototype.hashMaterial = function () {
	throw "AdaptiveRenderPass.supportedRenderAttributesMask is abstract";
};
GG.BaseTechnique = function(spec) {	
	spec          = spec || {};	
	this.textures = spec.textures != undefined ? spec.textures : [];	
	this.passes   = spec.passes || [];
	this.program  = null;
};

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
	if (this.passes) {
		for (var i = this.passes.length - 1; i >= 0; i--) {
			this.passes[i].destroy();
		};
	}	
};

GG.BaseTechnique.prototype.renderPasses = function() {
	return [].concat(this.passes);
};

GG.BaseTechnique.prototype.render = function(renderable, ctx) {	
	this.passes.forEach(function(pass) {
		pass.render(renderable, ctx);
	});
};


GG.ConstantColorTechnique = function(spec) {		
	spec        = spec || {};
	spec.passes = [ new GG.ConstantColorPass() ];
	
	GG.BaseTechnique.call(this, spec);
}

GG.ConstantColorTechnique.prototype = new GG.BaseTechnique();
GG.ConstantColorTechnique.prototype.constructor = GG.ConstantColorTechnique;


GG.ConstantColorTechnique.prototype.getTexture = function() {
    return this.passes[0].texture;
};

GG.ConstantColorTechnique.prototype.setTexture = function(texture) {
    this.passes[0].texture = texture;
    return this;
};

GG.ConstantColorPass = function(spec) {
	spec = spec || {};

	spec.vertexShader = [
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	spec.fragmentShader = [
		"precision mediump float;",
		
		"uniform vec3 u_color;",
		"void main() {",
		"	gl_FragColor = vec4(u_color, 1.0);",
		"}"
	].join("\n");

	GG.RenderPass.call(this, spec);
};

GG.ConstantColorPass.prototype = new GG.RenderPass();
GG.ConstantColorPass.prototype.constructor = GG.ConstantColorPass;

GG.ConstantColorPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform3fv(program.u_color, renderable.getMaterial().diffuse);		
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
	spec.passes = [new GG.PhongPass( { 'texture' : texture })];
	GG.BaseTechnique.call(this, spec);	
};

GG.TexturedShadelessTechnique.prototype = new GG.BaseTechnique();
GG.TexturedShadelessTechnique.prototype.constructor = GG.TexturedShadelessTechnique;

GG.TexturedShadelessPass = function (spec) {	
	spec = spec || {};
	GG.RenderPass.call(this, spec);

	this.texture = spec.texture;

	var pg = new GG.ProgramSource();
	pg.position()
		.texCoords()
		.uniformModelViewMatrix()
		.uniformProjectionMatrix()
		.varying('vec2', 'v_texCoords')
		.addMainBlock([
			"	v_texCoords = a_texCoords;",
			"	gl_Position = u_matProjection*u_matModelView*a_position;",
			].join('\n')
		);

	this.vertexShader = pg.toString();
	
	pg = new GG.ProgramSource();
	pg.asFragmentShader()
		.varying('vec2', 'v_texCoords')
		.uniform('sampler2D', 'u_texture')
		.addMainBlock("gl_FragColor = texture2D(u_texture, v_texCoords);");

	this.fragmentShader = pg.toString();	
};


GG.TexturedShadelessPass.prototype = new GG.RenderPass();
GG.TexturedShadelessPass.prototype.constructor = GG.TexturedShadelessPass;

GG.TexturedShadelessPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	this.texture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP_0);
    gl.uniform1i(this.program.samplerUniform.handle(), 0);
};
GG.CubemapTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [ new GG.CubemapSkyPass(spec) ];
	GG.BaseTechnique.call(this, spec);
};

GG.CubemapTechnique.prototype = new GG.BaseTechnique();
GG.CubemapTechnique.prototype.constructor = GG.CubemapTechnique;

GG.CubemapTechnique.prototype.getCubemap = function() {
	return this.passes[0].cubemapTexture;
};

GG.CubemapTechnique.prototype.setCubemap = function(cubemap) {
	this.passes[0].cubemapTexture = cubemap;
};

GG.CubemapSkyPass = function (spec) {
	spec                = spec || {};	
	this.cubemapTexture = spec.cubemap;
	spec.vertexShader   = [
		"attribute vec4 a_position;",
		"varying vec3 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matViewInverse;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		// to be applied on the result of matModelView*vec4(skyPos, 1.0)
		"	const float SkyScale = 100.0;",

		// use the vector from the center of the cube to the vertex as the texture coordinates
		"	v_texCoords = a_position.xyz;",

		// since the view transform contains an inverse wCameraPos translation
	    // we cancel the camera translation by adding the same translation
	    // prior to multiplying with the modelviewprojection matrix
		"	vec4 wCameraPos = u_matViewInverse * vec4(0.0, 0.0, 0.0, 1.0);",
		"	vec3 skyPos = a_position.xyz + wCameraPos.xyz;",
		"	vec3 ecSkyPos = SkyScale * vec3(u_matModelView * vec4(skyPos, 1.0));",
		"	gl_Position = u_matProjection * vec4(ecSkyPos, 1.0);",
		"}"
	].join("\n");
	
	spec.fragmentShader = [
		"precision highp float;",	
		"varying vec3 v_texCoords;",	
		"uniform samplerCube u_cubemap;",
		"void main() {",
		"	gl_FragColor = textureCube(u_cubemap, v_texCoords);",
		"}"
	].join("\n");
	
	GG.RenderPass.call(this, spec);
};

GG.CubemapSkyPass.prototype = new GG.RenderPass();
GG.CubemapSkyPass.prototype.constructor = GG.CubemapSkyPass;

GG.CubemapSkyPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform1i(this.program.u_cubemap, GG.TEX_UNIT_ENV_MAP);				
};

GG.CubemapSkyPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	this.cubemapTexture.bind();	
	gl.disable(gl.CULL_FACE);
};
GG.ReflectiveTechnique = function(spec) {	
	spec        = spec || {};
	spec.passes = [ new GG.ReflectiveTechnique.ReflectivePass(spec)];
	GG.BaseTechnique.call(this, spec);

};

GG.ReflectiveTechnique.prototype = new GG.BaseTechnique();
GG.ReflectiveTechnique.prototype.constructor = GG.ReflectiveTechnique;

GG.ReflectiveTechnique.ReflectivePass = function (spec) {
	
	spec.vertexShader = [
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
	
	spec.fragmentShader = [
		"precision mediump float;",

		"varying vec3 v_viewVector;",
		"varying vec3 v_normal;",

		"uniform vec3 u_baseColor;",
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
		"	gl_FragColor = vec4(mix(u_baseColor, envColor, u_reflectance), 1.0);",
		"}"
	].join("\n");
	
	GG.RenderPass.call(this, spec);
};

GG.ReflectiveTechnique.ReflectivePass.prototype = new GG.RenderPass();
GG.ReflectiveTechnique.ReflectivePass.prototype.constructor = GG.ReflectiveTechnique.ReflectivePass;

GG.ReflectiveTechnique.ReflectivePass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var mat = renderable.getMaterial();
	gl.uniform1i(this.program.u_cubemap, GG.TEX_UNIT_ENV_MAP);

	gl.uniform3fv(this.program.u_eta, [ 
		mat.IOR[0] / mat.externalIOR[0],
		mat.IOR[1] / mat.externalIOR[1],
		mat.IOR[2] / mat.externalIOR[2] ]);
	gl.uniform3fv(this.program.u_baseColor, mat.diffuse);
	gl.uniform2fv(this.program.u_fresnelParams, [ mat.fresnelBias, mat.fresnelExponent ]);
	gl.uniform1f(this.program.u_reflectance, mat.reflectance);
};

GG.ReflectiveTechnique.ReflectivePass.prototype.__setCustomRenderState = function(renderable, ctx, program) {	
	renderable.getMaterial().envMap.bind();	
 	gl.enable(gl.CULL_FACE);
};

GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [new GG.PhongPass()];
	GG.BaseTechnique.call(this, spec);
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongPass = function(spec) {	
	GG.RenderPass.call(this, spec);
	this.createProgram();
};

GG.PhongPass.prototype = new GG.RenderPass();
GG.PhongPass.prototype.constructor = GG.PhongPass;

GG.PhongPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);
	GG.ProgramUtils.setLightsUniform(program, GG.Naming.UniformLight, ctx.light);
};

GG.PhongPass.prototype.createProgram = function() {
	var pg = new GG.ProgramSource();
	pg.position()
		.normal()
  		.uniformModelViewMatrix()
  		.uniformNormalsMatrix()
		.uniformProjectionMatrix()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.addMainBlock([
			"	vec4 viewPos = u_matModelView*a_position;",
			"	gl_Position = u_matProjection*viewPos;",
			"	gl_Position.z -= 0.0001;",
			"	v_normal = u_matNormals * a_normal;",
			"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
			"	v_viewPos = viewPos;"
			].join('\n'));
	this.vertexShader = pg.toString();

	pg = new GG.ProgramSource();
	pg.asFragmentShader()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.uniformViewMatrix()
		.uniformLight()
		.uniformMaterial()
		.addDecl(GG.ShaderLib.phong.lightIrradiance)
		.addMainBlock([
			"	vec3 N = normalize(v_normal);",
			"	vec3 V = normalize(v_viewVector);",		
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);",
			"	vec3 L = normalize(u_matView*vec4(u_light.position, 1.0) - v_viewPos).xyz;",
			"	lightIrradiance(N, V, L, u_light, u_material, diffuse, specular);",
			"	gl_FragColor = vec4(u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular, 1.0);"			
		].join('\n'));
		
	this.fragmentShader = pg.toString();	
};

GG.PhongPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	/*
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CW);
	gl.enable(gl.CULL_FACE);
	*/
};
GG.WireframeTechnique = function (spec) {
	spec              = spec || {};
	spec.passes = [ new GG.WireframeTechnique.WireframePass(spec) ];
	GG.BaseTechnique.call(this, spec);	
};

GG.WireframeTechnique.prototype             = new GG.BaseTechnique();
GG.WireframeTechnique.prototype.constructor = GG.WireframeTechnique;

GG.WireframeTechnique.WireframePass = function (spec) {
	spec             = spec || {};
	spec.vertexShader = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"uniform float u_depthOffest;",
		"void main() {",
		"	vec4 viewPos = u_matModelView * a_position;",
		"	viewPos.z += u_depthOffest;",
		"	gl_Position = u_matProjection * viewPos;",
		"}"
	].join('\n');

	spec.fragmentShader = [		
		"precision highp float;",
		"uniform vec3 u_wireColor;",
		"void main() {",
		"	gl_FragColor = vec4(u_wireColor, 1.0);",
		"}"
	].join('\n');

	GG.RenderPass.call(this, spec);
};

GG.WireframeTechnique.WireframePass.prototype             = new GG.RenderPass();
GG.WireframeTechnique.WireframePass.prototype.constructor = GG.WireframeTechnique.WireframePass;

GG.WireframeTechnique.WireframePass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform3fv(program.u_wireColor, renderable.material.diffuse);
	gl.uniform1f(program.u_depthOffest, renderable.material.wireOffset);
};

GG.WireframeTechnique.WireframePass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	gl.lineWidth(renderable.material.wireWidth);
};


GG.WireframeTechnique.WireframePass.prototype.getRenderPrimitive = function(renderable) {
	return gl.LINES;
};
GG.DepthPrePassTechnique = function (spec) {
	spec        = spec || {};
	spec.passes = [ new GG.DepthPrePassTechnique.Pass(spec) ];
	GG.BaseTechnique.call(this, spec);
};

GG.DepthPrePassTechnique.prototype             = new GG.BaseTechnique();
GG.DepthPrePassTechnique.prototype.constructor = GG.DepthPrePassTechnique;

GG.DepthPrePassTechnique.Pass = function (spec) {
	spec             = spec || {};
	spec.vertexShader = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",		
		"void main() {",	
		"	gl_Position = u_matProjection * u_matModelView * a_position;",
		"}"
	].join('\n');

	spec.fragmentShader = [		
		"precision mediump float;",
		"void main() {",
		"	gl_FragColor = vec4(1.0);",
		"}"
	].join('\n');

	GG.RenderPass.call(this, spec);
};

GG.DepthPrePassTechnique.Pass.prototype             = new GG.RenderPass();
GG.DepthPrePassTechnique.Pass.prototype.constructor = GG.DepthPrePassTechnique.Pass;

GG.DepthPrePassTechnique.Pass.prototype.getRenderPrimitive = function(renderable) {
	if (renderable.material == null) {
		console.log('error');
	}
	var t = renderable.material.getTechnique();

	//TODO: Handle renderables with multiple render passes
	return t.passes[0].getRenderPrimitive(renderable);
};
GG.TextureStackTechnique = function (spec) {
	spec = spec || {};
	spec.passes = [new GG.TextureStackPass()];
	GG.BaseTechnique.call(this, spec);
};

GG.TextureStackTechnique.prototype = new GG.BaseTechnique();
GG.TextureStackTechnique.prototype.constructor = GG.TextureStackTechnique;

GG.TextureStackPass = function (spec) {
	GG.AdaptiveRenderPass.call(this, spec);
};

GG.TextureStackPass.prototype             = new GG.AdaptiveRenderPass();
GG.TextureStackPass.prototype.constructor = GG.TextureStackPass;

GG.TextureStackPass.prototype.supportedRenderAttributesMask = function () {
	return GG.BaseMaterial.BIT_DIFFUSE_MAP;
};

GG.TextureStackPass.prototype.hashMaterial = function(material) {
	return material.diffuseTextureStack.hashCode();
};

GG.TextureStackPass.prototype.createShadersForMaterial = function (material) {
	var pg = new GG.ProgramSource();
	pg.position()
		.texCoord0()
  		.uniformModelViewMatrix()  		
		.uniformProjectionMatrix()
		.varying('vec2', 'v_texCoords')
		.addMainBlock([
			"	gl_Position = u_matProjection*u_matModelView*a_position;",
			"	v_texCoords = a_texCoords;"
			].join('\n'));
	this.vertexShader = pg.toString();

	pg = new GG.ProgramSource();
	pg.asFragmentShader()	
		.varying('vec2', 'v_texCoords')
		.uniformMaterial()
		.uniform('vec4', 'u_uvScaleOffset')
		.addMainBlock([
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);"
		].join('\n'));

	if (material.diffuseTextureStack != null) {
		this.evaluateTextureStack(pg, material.diffuseTextureStack)
	}

	pg.addMainBlock("	gl_FragColor = vec4(/*u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular*/diffuse, 1.0);");	
	this.fragmentShader = pg.toString();	
};

GG.TextureStackPass.prototype.evaluateTextureStack = function(programSource, textureStack) {
	if (!textureStack.isEmpty()) {
		var codeListing = [];
		for (var i = 0; i < textureStack.size(); i++) {			
			this.defineUniformsForDiffuseMapAtIndex(i, programSource);
			this.sampleDiffuseMapAtIndex(i, codeListing);
			this.blendDiffuseMapAtIndex(i, textureStack.getAt(i).blendMode, programSource, codeListing);
		}
		codeListing.push("diffuse = " + this.getVariableNameForDiffuseMapAtIndex(textureStack.size() - 1) + ".rgb;");		
		programSource.addMainBlock(codeListing.join('\n'));
	}
};

GG.TextureStackPass.prototype.defineUniformsForDiffuseMapAtIndex = function (index, programSource) {
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);
	programSource.uniform("sampler2D", uniformName);

	var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(index);
	programSource.uniform("vec4", scaleOffsetUniformName);
};

GG.TextureStackPass.prototype.sampleDiffuseMapAtIndex = function (index, codeListing) {
	var colorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);	
	var scaleOffset = this.getUniformNameForUvScaleOffset(index);
	codeListing.push("vec3 " + colorVar + " = texture2D(" + uniformName + ", " + scaleOffset + ".zw + (" + scaleOffset + ".xy * v_texCoords)).rgb;");								
};

GG.TextureStackPass.prototype.blendDiffuseMapAtIndex = function (index, blendMode, programSource, codeListing) {
	if (index > 0) {
		var sourceColorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
		var destColorVar = this.getVariableNameForDiffuseMapAtIndex(index - 1);
		this.emitBlendTextureCode(destColorVar, sourceColorVar, blendMode, programSource, codeListing);		
	}
};

GG.TextureStackPass.prototype.getUniformNameForUvScaleOffset = function (index) {
	return "u_uvScaleOffset_" + index;
};

GG.TextureStackPass.prototype.getUniformNameForDiffuseMapAtIndex = function (index) {
	return "u_diffuseMap_" + index;
};

GG.TextureStackPass.prototype.getVariableNameForDiffuseMapAtIndex = function (index) {
	return "diffuseMap_" + index;
};

GG.TextureStackPass.prototype.declareBlendingFunction = function (blendMode, programSource) {
	var fun = null;
	switch (blendMode) {
		case GG.BLEND_MULTIPLY:
			programSource.addDecl(GG.ShaderLib.blendModeMultiply);
			fun = 'blendModeMultiply';
			break;
		case GG.BLEND_ADD:
			programSource.addDecl(GG.ShaderLib.blendModeAdd);			
			fun = 'blendModeAdd';
			break;
		case GG.BLEND_SUBTRACT:
			programSource.addDecl(GG.ShaderLib.blendModeSubtract);
			fun = 'blendModeSubtract';
			break;
		case GG.BLEND_LIGHTEN:
			programSource.addDecl(GG.ShaderLib.blendModeLighten);
			fun = 'blendModeLighten';
			break;
		case GG.BLEND_COLOR_BURN:
			programSource.addDecl(GG.ShaderLib.blendModeColorBurn);
			fun = 'blendModeColorBurn';
			break;
		case GG.BLEND_LINEAR_BURN:
			programSource.addDecl(GG.ShaderLib.blendModeLinearBurn);
			fun = 'blendModeLinearBurn';
			break;
		case GG.BLEND_DARKEN:
			programSource.addDecl(GG.ShaderLib.blendModeDarken);
			fun = 'blendModeDarken';
			break;
		case GG.BLEND_SCREEN:
			programSource.addDecl(GG.ShaderLib.blendModeScreen);
			fun = 'blendModeScreen';
			break;
		case GG.BLEND_COLOR_DODGE:
			programSource.addDecl(GG.ShaderLib.blendModeColorDodge);
			fun = 'blendModeColorDodge';
			break;
		default:
			return "// Unknown blend mode: " + blendMode;
	}
	return fun;
};

GG.TextureStackPass.prototype.emitBlendTextureCode = function (destColor, sourceColor, blendMode, programSource, codeListing) {
	var func = this.declareBlendingFunction(blendMode, programSource);	
	if (fun != null) {
		codeListing.push(sourceColor + " = " + fun + "(" + destColor + ", " + sourceColor + ");");
	}
};

GG.TextureStackPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		var uniform = this.getUniformNameForDiffuseMapAtIndex(i);		
		gl.uniform1i(program[uniform], GG.TEX_UNIT_DIFFUSE_MAPS[i]);

		var entry = textureStack.getAt(i);
		var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(i);
		gl.uniform4fv(program[scaleOffsetUniformName], [entry.scaleU, entry.scaleV, entry.offsetU, entry.offsetV]);
	}
};

GG.TextureStackPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		textureStack.getAt(i).texture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAPS[i]);
	}
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

	this.texture = spec.texture;
	this.distanceAttenuation = spec.attenuation != undefined ? spec.attenuation : 1.0;

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
	var MV = mat4.create();
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

	var vs = this.vertexShader;
	var fs = this.fragmentShader;
	var progKey = 1;
	var instr = "";

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

	var prog = this.programCache[progKey];
	if (prog == null) {
		prog = this.programCache[progKey] = this.createProgram(vs, fs);
	}
	
	gl.useProgram(prog);
	
	prog.attribPosition = gl.getAttribLocation(prog, "a_position");
	
	eval(instr);

	return prog;
};

GG.ShadowMapDepthPass = function (spec) {
	spec               = spec || {};
	this.vsmMode       = spec.vsmMode != undefined ? spec.vsmMode : false;
	this.camera        = spec.camera;
	this.nearPlaneDist = spec.nearPlaneDist != undefined ? spec.nearPlaneDist : 1.0;
	this.farPlaneDist  = spec.farPlaneDist != undefined ? spec.farPlaneDist : 100.0;

	spec.vertexShader = [
			"precision highp float;",
			"attribute vec4 a_position;",
			"varying vec4 v_viewPosition;",
			"uniform mat4 u_matModel;",
			"uniform mat4 u_matLightView;",
			"uniform mat4 u_matLightProjection;",

			"void main() {",
			"	v_viewPosition = u_matLightView * u_matModel * a_position;",
			"	gl_Position = u_matLightProjection * v_viewPosition;",
			"}"
		].join('\n');

	spec.fragmentShader = [
			"precision highp float;",
			"varying vec4 v_viewPosition;",

			// this is 1.0 / (far_plane_dist - near_plane_dist)
			"uniform float u_invertedDepthRange;",

			GG.ShaderLib.blocks['libPackHalfToVec2'],

			GG.ShaderLib.blocks['libPackFloatToRGBA'],

			// if true then we will encode the depth and the depth squared
			// values as 2 half floats packed into a vec4
			"uniform int u_useVSM;",

			"void main() {",
			// calculates the linear depth, it is more accurate than the projected depth
			"	float linearDepth = length(v_viewPosition) * u_invertedDepthRange;",
			"	if (u_useVSM > 0) {",
			"		gl_FragColor = vec4(libPackHalfToVec2(linearDepth), libPackHalfToVec2(linearDepth*linearDepth));",
			"	} else {",			
			"		gl_FragColor = libPackFloatToRGBA(linearDepth);",
			"	}",
			"}"

		].join('\n');
	
	GG.RenderPass.call(this, spec);
};

GG.ShadowMapDepthPass.prototype = new GG.RenderPass();

GG.ShadowMapDepthPass.prototype.constructor = GG.ShadowMapDepthPass;

GG.ShadowMapDepthPass.prototype.setCamera = function(camera) {
	this.camera = camera;
};

GG.ShadowMapDepthPass.prototype.__setCustomRenderState = function (renderable, ctx, program) {
	gl.disable(gl.BLEND);

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	gl.frontFace(gl.CCW);
};

GG.ShadowMapDepthPass.prototype.__setCustomUniforms = function (renderable) {
	gl.uniform1i(this.program.u_useVSM, this.vsmMode);

	if (this.camera) {
		var invertedRange = 1.0 / (this.camera.far - this.camera.near);
		gl.uniform1f(this.program.u_invertedDepthRange, invertedRange);
	
		gl.uniformMatrix4fv(this.program.u_matLightView, false, this.camera.viewMatrix); //getViewMatrix());
		gl.uniformMatrix4fv(this.program.u_matLightProjection, false, this.camera.getProjectionMatrix());
	}
};
GG.DepthMapDebugOutput = function (spec) {
	spec = spec || {};
	this.minDepth = spec.minDepth != undefined ? spec.minDepth : 1.0;
	this.maxDepth = spec.maxDepth != undefined ? spec.maxDepth : 100.0;

	var vs = [
		"precision highp float;",
		"attribute vec4 a_position;",
		"varying vec2 v_texCoords;",
		"void main() { ",
		"	v_texCoords = 0.5*a_position.xy + vec2(0.5);",
		"	//v_texCoords.y = 1.0 - v_texCoords.y;",
		" 	gl_Position = a_position;",
		" }"
	].join('\n');

	var fs = [
		"precision highp float;",
		"uniform sampler2D u_sourceTexture;",
		"uniform float u_minDepth;",
		"uniform float u_maxDepth;",
		"varying vec2 v_texCoords;",

		GG.ShaderLib.blocks['libUnpackRrgbaToFloat'],

		"void main() {",
		"	vec4 enc = texture2D(u_sourceTexture, v_texCoords);",
		"	float c = libUnpackRrgbaToFloat(enc);",
		"	gl_FragColor = vec4(c, c, c, 1.0);",
		"}"

	].join('\n');
	
	spec['vertexShader'] = vs;
	spec['fragmentShader'] = fs;
	GG.ScreenPass.call(this, spec);
};

GG.DepthMapDebugOutput.prototype = new GG.ScreenPass();

GG.DepthMapDebugOutput.prototype.constructor = GG.DepthMapDebugOutput;

GG.DepthMapDebugOutput.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this, renderable, renderContext, program);
	gl.uniform1f(program.u_maxDepth, this.maxDepth);
	gl.uniform1f(program.u_minDepth, this.minDepth);
};

GG.ShadowMapSimple = function (spec) {
	spec           = spec || {};
	this.shadowMap = null;
	this.options   = null;

	var pg = new GG.ProgramSource()
		.floatPrecision('highp')
		.position()
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_posLightSpace')
		.uniform('mat4', 'u_matModel')
		.uniform('mat4', 'u_matView')
		.uniform('mat4', 'u_matProjection')
		.uniform('mat4', 'u_matLightView')
		.uniform('mat4', 'u_matLightProjection')
		.addMainBlock([
			"v_posLightSpace = u_matLightView * u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_matLightProjection * v_posLightSpace;",
			"vec4 test = a_position;",
			"test.z += 0.051;",
			"gl_Position = u_matProjection * u_matView * u_matModel * test;",

			].join('\n'));
	spec['vertexShader'] = pg.toString();

	pg = new GG.ProgramSource()
		.asFragmentShader()
		.floatPrecision('highp')				
		.uniform('float', 'u_depthOffset')		
		.uniform('float', 'u_lightSpaceDepthRange')	
		.uniform('sampler2D', 'u_shadowMap')
		.uniform('float', 'u_shadowFactor')
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_posLightSpace')
		.addDecl(GG.ShaderLib.blocks['libUnpackRrgbaToFloat'])
		.addMainBlock([
			"	vec3 shadowMapUV = v_posLightPerspective.xyz / v_posLightPerspective.w;",
			"	if (shadowMapUV.z <= 1.0 && v_posLightPerspective.w > 0.0 && !(shadowMapUV.s < 0.0 || shadowMapUV.t < 0.0 || shadowMapUV.s > 1.0 || shadowMapUV.t > 1.0)) {", 
			"		float lightDistance = length(v_posLightSpace.xyz);",
			// normalize the distance
			"		lightDistance *= 1.0 / u_lightSpaceDepthRange;",
			"		lightDistance -= u_depthOffset;",

			"		float depth = libUnpackRrgbaToFloat(texture2D(u_shadowMap, shadowMapUV.st));",
			"		gl_FragColor = (depth > lightDistance) ? vec4(1.0) : vec4(vec3(u_shadowFactor), 1.0);",
			"	} else { gl_FragColor = vec4(1.0); }"
		].join('\n'));
	spec['fragmentShader'] = pg.toString();

	GG.RenderPass.call(this, spec);
};

GG.ShadowMapSimple.prototype             = new GG.RenderPass();
GG.ShadowMapSimple.prototype.constructor = GG.ShadowMapSimple;

GG.ShadowMapSimple.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var cam = ctx.light.getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);

	//TODO: Fix camera.getViewMatrix to be aligned with camera.setup
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.viewMatrix); //getViewMatrix());
	gl.uniformMatrix4fv(program.u_matLightProjection, false, cam.getProjectionMatrix());
	gl.uniform1f(program.u_depthOffset, this.options.depthOffset);

	this.shadowMap.bindAtUnit(GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1i(program['u_shadowMap'], GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1f(program.u_shadowFactor, this.options.shadowFactor);
};

GG.ShadowMapSimple.prototype.setShadowMap = function(sm) {
	this.shadowMap = sm;
};

GG.ShadowMapSimple.prototype.setOptions = function(opts) {
	this.options = opts;
};
GG.ShadowMapPCF = function (spec) {
	spec           = spec || {};
	this.shadowMap = null;
	this.options   = null;	

	var pg = new GG.ProgramSource()
		.floatPrecision('highp')
		.position()
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.uniform('mat4', 'u_matModel')
		.uniform('mat4', 'u_matView')
		.uniform('mat4', 'u_matProjection')
		.uniform('mat4', 'u_matLightView')
		.uniform('mat4', 'u_matLightProjection')
		.addMainBlock([
			"v_lightViewPos = u_matLightView * u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_matLightProjection * v_lightViewPos;",
			"gl_Position = u_matProjection * u_matView * u_matModel * a_position;"
			].join('\n'));
	spec['vertexShader'] = pg.toString();

	pg = new GG.ProgramSource()
		.asFragmentShader()
		.floatPrecision('highp')	
		.uniform('sampler2D', 'u_shadowMap')
		.uniform('float', 'u_shadowFactor')	
		.uniform('vec2', 'u_texStep')
		.uniform('float', 'u_depthOffset')
		.uniform('float', 'u_filterSize')	
		.uniform('float', 'u_lightSpaceDepthRange')	
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.addDecl(GG.ShaderLib.blocks['libUnpackRrgbaToFloat'])
		.addMainBlock([
			"float average = 0.0;",
			"vec2 lightUV = v_posLightPerspective.xy / v_posLightPerspective.w;",
			"if (!(lightUV.s < 0.0 || lightUV.t < 0.0 || lightUV.s > 1.0 || lightUV.t > 1.0)) {", 
			"	float lightDistance = length(v_lightViewPos.xyz);",
			// normalize the distance
			"	lightDistance *= 1.0 / u_lightSpaceDepthRange;",
			"	lightDistance -= u_depthOffset;",
			
			"	float passed = 0.0;",
			"	float samples = 0.0;",
			"	for (float y = -2.0; y <= 2.0; y++) {",
			"		if (abs(y) > u_filterSize) continue;",
			"		for (float x = -2.0; x <= 2.0; x++) {",
			"			if (abs(x) > u_filterSize) continue;",

			"			vec2 sampleUV = lightUV + vec2(x*u_texStep.x, y*u_texStep.y);",
			"			if (!(sampleUV.s < 0.0 || sampleUV.t < 0.0 || sampleUV.s > 1.0 || sampleUV.t > 1.0)) {", 
			"				float depth = libUnpackRrgbaToFloat(texture2D(u_shadowMap, sampleUV));",
			"				passed += (depth > lightDistance) ? 1.0 : 0.0;",
			"				samples++;",
			"			}",
			
			"		}",
			"	}",
			"	average = passed / samples;",
			"}",
			"gl_FragColor = vec4(vec3(average), 1.0);"
			
		].join('\n'));
	spec['fragmentShader'] = pg.toString();

	GG.RenderPass.call(this, spec);
};

GG.ShadowMapPCF.prototype             = new GG.RenderPass();
GG.ShadowMapPCF.prototype.constructor = GG.ShadowMapPCF;


GG.ShadowMapPCF.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var pcfSize = this.options.pcfSize != undefined ? this.options.pcfSize : 4;	
	gl.uniform1f(program.u_filterSize, pcfSize);

	texStep = [ 1.0 / this.options.shadowMapWidth, 1.0 / this.options.shadowMapHeight ];
	gl.uniform2fv(program.u_texStep, texStep);

	var cam = ctx.scene.listDirectionalLights()[0].getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.getViewMatrix());
	gl.uniformMatrix4fv(program.u_matLightProjection, false, cam.getProjectionMatrix());
	gl.uniform1f(program.u_depthOffset, this.options.depthOffset);

	this.shadowMap.bindAtUnit(GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1i(program['u_shadowMap'], GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1f(program.u_shadowFactor, this.options.shadowFactor);
};

GG.ShadowMapPCF.prototype.setShadowMap = function(sm) {
	this.shadowMap = sm;
};

GG.ShadowMapPCF.prototype.setOptions = function(opts) {
	this.options = opts;
};

GG.VSMGaussianBlurPass = function (spec) {
	spec              = spec || {};
	this.filterSize   = spec.filterSize != undefined ? spec.filterSize : 2;
	this.isHorizontal = spec.horizontal != undefined ? spec.horizontal : true;	

	var fs = [
		"precision highp float;",
		"uniform sampler2D u_sourceTexture;",
		"uniform int u_filterSize;",
		"uniform float u_isHorizontal;",
		"uniform vec2 u_texStepSize;",
		"varying vec2 v_texCoords;",

		"const int MAX_FILTER_SIZE = 24;",

		GG.ShaderLib.blocks['libUnpackVec2ToFloat'],

		GG.ShaderLib.blocks['libPackHalfToVec2'],

		"void main() {",
		"	int halfFilterSize = u_filterSize / 2;",
		"	vec4 color;",
		"	vec2 basis = vec2(u_isHorizontal, 1.0 - u_isHorizontal);",		
		"	float mean = 0.0;",
		"	float mean_2 = 0.0;",
		"	for (int i = 0; i < MAX_FILTER_SIZE; i++) {",
		"		if (i > halfFilterSize) break;",
		"		vec2 offset = u_texStepSize * float(i);",		
		"		vec4 val1 = texture2D(u_sourceTexture, v_texCoords + offset * basis);",
		"		mean += libUnpackVec2ToFloat(val1.xy);",
		"		mean_2 += libUnpackVec2ToFloat(val1.zw);",
		"		vec4 val2 = texture2D(u_sourceTexture, v_texCoords - offset * basis);",
		"		mean += libUnpackVec2ToFloat(val2.xy);",
		"		mean_2 += libUnpackVec2ToFloat(val2.zw);",
		"	}",
		
		"	mean /= float(u_filterSize);",
		"	mean_2 /= float(u_filterSize);",
		"	gl_FragColor = vec4(libPackHalfToVec2(mean), libPackHalfToVec2(mean_2));",
		"}"].join('\n');

	GG.ScreenPass.call(this, { 
		sourceTexture : spec.sourceTexture,
		vertexShader : GG.ShaderLib.blit.vertex,
		fragmentShader : fs
	});
};


GG.VSMGaussianBlurPass.prototype = new GG.ScreenPass();

GG.VSMGaussianBlurPass.prototype.constructor = GG.VSMGaussianBlurPass;

GG.VSMGaussianBlurPass.prototype.setHorizontal = function() {
	this.isHorizontal = true;
};

GG.VSMGaussianBlurPass.prototype.setVertical = function() {
	this.isHorizontal = false;
};

GG.VSMGaussianBlurPass.prototype.__setCustomUniforms = function(renderable, renderContext, program) {
	GG.ScreenPass.prototype.__setCustomUniforms.call(this);
	gl.uniform1i(this.program.u_filterSize, this.filterSize);
	gl.uniform1f(this.program.u_isHorizontal, this.isHorizontal ? 1.0 : 0.0);
	texStep = [ 1.0 / this.sourceTexture.width, 1.0 / this.sourceTexture.height ];
	gl.uniform2fv(program.u_texStepSize, texStep);
};

GG.ShadowMapVSM = function (spec) {
	spec           = spec || {};
	this.shadowMap = null;
	this.options   = null;	
	this.rt        = null;
	this.blurPass  = null;

	var pg = new GG.ProgramSource()
		.floatPrecision('highp')
		.position()
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.uniform('mat4', 'u_matModel')
		.uniform('mat4', 'u_matView')
		.uniform('mat4', 'u_matProjection')
		.uniform('mat4', 'u_matLightView')
		.uniform('mat4', 'u_matLightProjection')
		.addMainBlock([
			"v_lightViewPos = u_matLightView * u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_matLightProjection * v_lightViewPos;",
			"gl_Position = u_matProjection * u_matView * u_matModel * a_position;"
			].join('\n'));
	spec['vertexShader'] = pg.toString();

	pg = new GG.ProgramSource()
		.asFragmentShader()
		.floatPrecision('highp')
		.uniform('sampler2D', 'u_shadowMap')
		.uniform('float', 'u_shadowFactor')				
		.uniform('float', 'u_depthOffset')		
		.uniform('float', 'u_lightSpaceDepthRange')	
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.addDecl(GG.ShaderLib.blocks['libUnpackVec2ToFloat'])
		.addDecl([
			/**
			 * Calculates a sharp bound of Chebychev's inequality, the
			 * Cantelli's inequality.
			 * The moments of the distribution are the expected value and 
			 * the squared expected value.
			 * The expected value is calculated previousy by blurring the
			 * depth map.
			 * The squared expected value is used to calculate the variance.
			 */
			"float ChebychevInequality(float M1, float E_x2, float depth) {",			
    		"	// Calculate variance, which is actually the amount of",
    		"	// error due to precision loss from fp32 to RG/BA (moment1 / moment2)",
    		"	float Ex_2 = M1*M1;",
    		"	float variance = E_x2 - Ex_2;",
    		"	variance = min(1.0, max(variance, 0.0002));",
    		"	// Calculate the upper bound",
    		"	float d = depth - M1;",
    		"	float p = variance / (variance + d * d);",
    		"	return max(smoothstep(u_shadowFactor, 1.0, p), depth <= M1 ? 1.0 : 0.0); ",
    		"}"
			].join('\n'))
		.addMainBlock([
			"vec2 lightUV = v_posLightPerspective.xy / v_posLightPerspective.w;",
			"if (!(lightUV.s < 0.0 || lightUV.t < 0.0 || lightUV.s > 1.0 || lightUV.t > 1.0)) {", 
			"	float lightDistance = length(v_lightViewPos.xyz);",
			// normalize the distance
			"	lightDistance *= 1.0 / u_lightSpaceDepthRange;",
			"	lightDistance -= u_depthOffset;",
			"	vec4 moments = texture2D(u_shadowMap, lightUV);",
			// 1st moment of distribution is the expected value (the average of depth values around the fragment)
			"	float M1 = libUnpackVec2ToFloat(moments.xy);",
			// the 2nd moment of distribution is the squared expected value
			"	float M2 = libUnpackVec2ToFloat(moments.zw);",
			"	float sf = ChebychevInequality(M1, M2, lightDistance);",
			"	gl_FragColor = sf;",			
			"}"
		].join('\n'));
	spec['fragmentShader'] = pg.toString();

	GG.RenderPass.call(this, spec);
};

GG.ShadowMapVSM.prototype             = new GG.RenderPass();
GG.ShadowMapVSM.prototype.constructor = GG.ShadowMapVSM;

GG.ShadowMapVSM.prototype.__setCustomUniforms = function(renderable, ctx, program) {	
	var cam = ctx.light.getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.getViewMatrix());
	gl.uniformMatrix4fv(program.u_matLightProjection, false, cam.getProjectionMatrix());
	gl.uniform1f(program.u_depthOffset, this.options.depthOffset);

	this.shadowMap.bindAtUnit(GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1i(program['u_shadowMap'], GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1f(program.u_shadowFactor, this.options.shadowFactor);
};

/**
 * Called right after the shadow map is built with the purpose of applying a blur step.
 */
GG.ShadowMapVSM.prototype.postShadowMapConstruct = function() {
	this.shadowMap.setMinFilter(gl.LINEAR);
	this.shadowMap.setMagFilter(gl.LINEAR);

	if (this.rt == null || this.rt.sourceTexture().width != this.options.shadowMapWidth) {
		console.log('Creating a new ping pong buffer');
		if (this.rt != null) {
			this.rt.destroy();
		}
		spec = {
			width : this.options.shadowMapWidth,
			height : this.options.shadowMapHeight,
			colorAttachments : this.shadowMap
		};
		this.rt = new GG.PingPongBuffer(spec);
		this.rt.initialize();	
	}
	
	if (this.blurPass == null) {
		this.blurPass = new GG.VSMGaussianBlurPass({
			filterSize : this.options.vsmBlurringSize != undefined ? this.options.vsmBlurringSize : 4			
		});
		this.blurPass.initialize();
	}	

	// render at 1st color attachment reading from this.shadowMap
	try {
		this.rt.activate();
		this.blurPass.setHorizontal();
		this.blurPass.setSourceTexture(this.rt.sourceTexture());
		this.blurPass.render();

		// render to this.shadowMap	
		this.rt.swap();
		this.blurPass.setVertical();
		this.blurPass.setSourceTexture(this.rt.sourceTexture());
		this.blurPass.render();	
	} finally {
		this.rt.deactivate();	
	}
};

GG.ShadowMapVSM.prototype.setShadowMap = function(sm) {
	this.shadowMap = sm;
};

GG.ShadowMapVSM.prototype.setOptions = function(opts) {
	this.options = opts;
};
GG.SHADOW_MAPPING = 1;
GG.SHADOW_MAPPING_PCF = 2;

// variance shadow mapping
GG.SHADOW_MAPPING_VSM = 3;

// exponential shadow mapping
GG.SHADOW_MAPPING_ESM = 4;

/**
 * Represents a technique for rendering shadows using shadow mapping.
 * It acts as a facade, encapsulating the shadow map details from the
 * client code. It is customizable through a specifications object, which
 * can provide the following options:
 * 1) shadowMapWidth
 * 2) shadowMapHeight
 * 3) shadowFactor
 * 4) shadowType
 *
 * Internally it will delegating the calls to a shadow map specific technique
 * like a technique for PCF, another for variance shadow mapping, etc.
 */
GG.ShadowMapTechnique = function (spec) {
	this.options = GG.cloneDictionary(spec || {});
	this.shadowType = this.options.shadowType != undefined ? this.options.shadowType : GG.SHADOW_MAPPING;
	
	this.options.shadowMapWidth  = this.options.shadowMapWidth != undefined ? this.options.shadowMapWidth : 800;
	this.options.shadowMapHeight = this.options.shadowMapHeight != undefined ? this.options.shadowMapHeight : 600;
	this.options.depthOffset     = this.options.depthOffset != undefined ? this.options.depthOffset : 0.01;
	this.options.shadowFactor    = this.options.shadowFactor != undefined ? this.options.shadowFactor : 0.5;

	var shadowMap = new GG.Texture({
		width : this.options.shadowMapWidth,
		height : this.options.shadowMapHeight,
		flipY : false
	});

	this.depthPassFBO = new GG.RenderTarget({
		width : this.options.shadowMapWidth,
		height : this.options.shadowMapHeight,
		// this might not work...
		//useColor : false,
		clearColor : [1.0, 1.0, 1.0, 1.0],
		colorAttachment : shadowMap
	});
	this.depthPassFBO.initialize();
	this.depthPassFBO.getColorAttachment(0).setWrapMode(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

	this.depthPass = new GG.ShadowMapDepthPass();
	
	this.delegates = {};
	this.delegates[GG.SHADOW_MAPPING]     = new GG.ShadowMapSimple();
	this.delegates[GG.SHADOW_MAPPING_PCF] = new GG.ShadowMapPCF();
	this.delegates[GG.SHADOW_MAPPING_VSM] = new GG.ShadowMapVSM();	
};

GG.ShadowMapTechnique.prototype.getShadowMapTexture = function() {
	return this.depthPassFBO.getColorAttachment(0);
};

/**
 * Creates the shadow map by rendering the depth of the objects as seen
 * by the light. The shadow projection is parameterized through the shadow
 * camera of the active light.
 */
GG.ShadowMapTechnique.prototype.buildShadowMap = function(objects, context) {
	
	this.depthPass.setCamera(context.light.getShadowCamera());	
	this.depthPass.vsmMode = (this.shadowType == GG.SHADOW_MAPPING_VSM);
	
	try {
		var that = this;
		this.depthPassFBO.activate();		
		objects.forEach(function (renderable) {
			that.depthPass.render(renderable, context);
		});

	} finally {
		this.depthPassFBO.deactivate();
	}

	// notify the active delegate that the shadow map is constructed
	var delegate = this.switchDelegate();
	delegate.setShadowMap(this.depthPassFBO.getColorAttachment(0));
	delegate.setOptions(this.options);

	if (delegate.postShadowMapConstruct) {
		delegate.postShadowMapConstruct();
	}
};


GG.ShadowMapTechnique.prototype.render = function(renderable, context) {
	var delegate = this.switchDelegate();
	delegate.render(renderable, context);
};

GG.ShadowMapTechnique.prototype.switchDelegate = function() {
	if (this.shadowType in this.delegates) {
		return this.delegates[this.shadowType];
	} else {
		return this.delegates[GG.SHADOW_MAPPING];
	}
};
GG.Renderer = function() {
	this.camera      = null;
	this.persp       = mat4.create();
	this.view        = mat4.create();
	this.inverseView = mat4.create();
	this.MVP         = mat4.create();
};

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
	this.persp = this.camera.getProjectionMatrix();
	this.view = this.camera.getViewMatrix();
	mat4.inverse(this.view, this.inverseView);
	return this;
};

GG.Renderer.prototype.renderMesh = function (mesh, program, options) {		

	var attribPosition = program[GG.GLSLProgram.BuiltInAttributes.attribPosition];
	if (attribPosition != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getPositionsBuffer());
		gl.enableVertexAttribArray(attribPosition);
		gl.vertexAttribPointer(attribPosition, mesh.getPositionsBuffer().itemSize, mesh.getPositionsBuffer().itemType, false, 0, 0);
	}

	var attribNormal = program[GG.GLSLProgram.BuiltInAttributes.attribNormal];
	if (attribNormal != undefined) {
		var normalsBuffer = mesh.getMaterial().flatShade ? mesh.getFlatNormalsBuffer() : mesh.getNormalsBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.enableVertexAttribArray(attribNormal);
		gl.vertexAttribPointer(attribNormal, normalsBuffer.itemSize, normalsBuffer.itemType, false, 0, 0);
	}

	var attribTexCoords = program[GG.GLSLProgram.BuiltInAttributes.attribTexCoords];
	if (attribTexCoords != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getTexCoordsBuffer());
		gl.enableVertexAttribArray(attribTexCoords);
		gl.vertexAttribPointer(attribTexCoords, mesh.getTexCoordsBuffer().itemSize, mesh.getTexCoordsBuffer().itemType, false, 0, 0);
	}

	options = options || {};
	var mode = gl.TRIANGLES;
	if ('mode' in options ) {
		mode = options.mode;
	}
	if (mesh.getIndexBuffer() != undefined) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.getIndexBuffer());
		gl.drawElements(mode, mesh.getIndexBuffer().numItems, mesh.getIndexBuffer().itemType, 0);
	} else {
		gl.drawArrays(mode, 0, mesh.getPositionsBuffer().size);
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

GG.MouseHandler = function() {
	this.mouseDown  = false;
	this.lastMouseX = null;
	this.lastMouseY = null;
	this.camera     = null;
	this.rotX       = 0.0;
	this.rotY       = 0.0;
	
	var that        = this;
	this.handleMouseDown = function (event) {
		that.mouseDown  = true;
		that.lastMouseX = event.clientX;
		that.lastMouseY = event.clientY;
	};

	this.handleMouseUp = function (event) {
		that.mouseDown = false;
	};

	this.handleKeyDown = function (event) {
		switch (event.keyCode) {
			case 37: 	// left
			that.camera.right(-0.2);
			console.log("left");
			break;

			case 39: 	// right
			that.camera.right(0.2);
			console.log("right");
			break;

			case 38: 	// up
			that.camera.forward(-0.2);
			console.log("forward");
			break;

			case 40: 	// down
			that.camera.forward(0.2);
			console.log("backwards");
			break;		

			case 33: 	// page up
			that.camera.elevate(0.2);
			break;

			case 34: 	// page down
			that.camera.elevate(-0.2);
			break;

			default: console.log('key is: ' + event.keyCode); break;
		}
	};

	this.handleMouseMove = function (event) {
		if (!that.mouseDown) {
		  return;
		}
		var newX   = event.clientX;
		var newY   = event.clientY;
		
		var deltaX = newX - that.lastMouseX;
		that.rotY  += deltaX;
		
		var deltaY = newY - that.lastMouseY;
		that.rotX  += deltaY;

		that.camera.setRotation([that.rotX, that.rotY, 0.0]);
		
		that.lastMouseX = newX
		that.lastMouseY = newY;
	};

	this.handleMouseWheel = function (event) {
		var delta = event.wheelDeltaY * 0.01;
		that.camera.zoom(delta);
	};
	
	GG.canvas.onmousedown = this.handleMouseDown;
	GG.canvas.onmousewheel = this.handleMouseWheel;
    document.onmouseup = this.handleMouseUp;
    document.onmousemove = this.handleMouseMove;
    document.onkeydown = this.handleKeyDown;
    document.onkeyup = this.handleKeyUp;

    // http://www.sitepoint.com/html5-javascript-mouse-wheel/
    if (GG.canvas.addEventListener) {
		// IE9, Chrome, Safari, Opera
		GG.canvas.addEventListener("mousewheel", this.handleMouseWheel, false);
		// Firefox
		GG.canvas.addEventListener("DOMMouseScroll", this.handleMouseWheel, false);
	} else {
		// IE 6/7/8
		GG.canvas.attachEvent("onmousewheel", this.handleMouseWheel);
	}
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
	this.pointLights = [];
	this.directionaLights = [];
	this.spotLights = [];
	this.shadowsEnabled = false;
	this.fogEnabled = false;
};

GG.Scene.prototype.addObject = function(object) {
	this.objects.push(object);
	return this;
};

GG.Scene.prototype.listObjects = function () {
	return this.objects;
};

GG.Scene.prototype.perObject = function(fn) {
	this.objects.forEach(fn);
	return this;
};

GG.Scene.prototype.addLight = function(light) {
	switch (light.lightType) {
	case GG.LT_DIRECTIONAL:
		this.directionaLights.push(light);
		break;
	case GG.LT_POINT:
		this.pointLights.push(light);
		break;
	case GG.LT_SPOT:
		this.spotLights.push(light);
		break;
	default:
		break;
	}
	return this;
};

GG.Scene.prototype.listPointLights = function() {
	return [].concat(this.pointLights);
};

GG.Scene.prototype.listDirectionalLights = function() {
	return [].concat(this.directionaLights);
};

GG.Scene.prototype.listSpotLights = function() {
	return [].concat(this.spotLights);
};

GG.Scene.prototype.numPointLights = function() {
	return this.pointLights.length;
};

GG.Scene.prototype.numDirectionalLights = function() {
	return this.directionaLights.length;
};

GG.Scene.prototype.numSpotLights = function() {
	return this.spotLights.length;
};

GG.Scene.prototype.hasPointLights = function() {
	return this.pointLights.length > 0;
};

GG.Scene.prototype.hasDirectionalLights = function() {
	return this.directionaLights.length > 0;
};

GG.Scene.prototype.hasSpotLights = function() {
	return this.spotLights.length > 0;
};

GG.Scene.prototype.listLights = function() {
	return []
		.concat(this.pointLights)
		.concat(this.directionaLights)
		.concat(this.spotLights);
}

GG.Scene.prototype.hasShadows = function() {
	return this.shadowsEnabled;
};

GG.Scene.prototype.shadows = function(flag) {
	this.shadowsEnabled = flag;
};

GG.Scene.prototype = new GG.Scene();
GG.Scene.prototype.constructor = GG.Scene;


GG.DefaultSceneRenderer = function (spec) {
	spec                 = spec || {};
	this.scene           = spec.scene;
	this.camera          = spec.camera;
	this.programCache    = {};
	this.shadowTechnique = new GG.ShadowMapTechnique({ shadowType : GG.SHADOW_MAPPING });
	this.dbg             = new GG.DepthMapDebugOutput();	
	/*
	this.backgroundQueue = new GG.RenderQueue({ name : 'background', priority : 0 });
	this.defaultQueue    = new GG.RenderQueue({ name : 'default', priority : 1 });
	this.overlayQueue    = new GG.RenderQueue({ name : 'overlay', priority : 2 });
*/
	this.depthPrePassTechnique = new GG.DepthPrePassTechnique();
};

GG.DefaultSceneRenderer.prototype.setScene = function(sc) {
	this.scene = sc;
	return this;
};

GG.DefaultSceneRenderer.prototype.getScene = function() {
	return this.scene;
};

GG.DefaultSceneRenderer.prototype.setCamera = function(camera) {
	this.camera = camera;
	return this;
};

GG.DefaultSceneRenderer.prototype.getCamera = function() {
	return this.camera;
};

GG.DefaultSceneRenderer.prototype.findVisibleObjects = function(scene, camera) {
	return scene.listObjects();
};

GG.DefaultSceneRenderer.prototype.findShadowCasters = function(scene, camera) {
	return scene.listObjects();
};

GG.DefaultSceneRenderer.prototype.findEffectiveLights = function(scene, camera) {
	return scene.listLights();
};

GG.DefaultSceneRenderer.prototype.findShadowCastingLights = function(lights) {
	return lights.filter(function (light) {
		return light.lightType != GG.LT_POINT;
	});
};

/**
 * Bind render target, if any
 * Clear the color and depth buffers
 * Render a pre-pass depth pass
 * Find the objects visible for the current camera
 * Find the lights close enough to affect the scene
 * For each light
 *   Find the objects that are affected by it
 *   Render shadow map for light, if shadows are enabled
 *   Render the list of objects 
 * Unbind render target, if any
 */
GG.DefaultSceneRenderer.prototype.render = function(renderTarget) {
	
	var ctx            = new GG.RenderContext();
	ctx.camera         = this.camera;
	ctx.scene          = this.scene;
	ctx.renderTarget   = renderTarget;
	
	var visibleObjects = this.findVisibleObjects(this.scene, this.camera);
	var shadowCasters  = this.findShadowCasters(this.scene);

	// TODO: Create an ambient light set to the ambient light of the scene
	var effectiveLights = this.findEffectiveLights(this.scene, this.camera);
	
	var vp = this.camera.getViewport();

var sl;
	try {
		if (renderTarget) {
			renderTarget.activate();	
		} else {
			//this.renderer.setViewport(this.camera.getViewport());			
			gl.viewport(0, 0, vp.getWidth(), vp.getHeight());
			gl.clearColor(vp.getClearColor()[0], vp.getClearColor()[1], vp.getClearColor[2], 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		// fills the depth buffer only in order to skip processing for invisible fragments
		this.renderDepthPrePass(visibleObjects, ctx);

		// additively blend the individual light passes
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE, gl.ONE);


		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);

		for (var i = effectiveLights.length - 1; i >= 0; i--) {		
			var light = effectiveLights[i];
			ctx.light = light;
			for (var j = visibleObjects.length - 1; j >= 0; j--) {
				var renderable = visibleObjects[j];						
				var technique = renderable.getMaterial().getTechnique();
				technique.render(renderable, ctx);				
			}
		}

		var shadowLights = this.findShadowCastingLights(effectiveLights);
		var enableShadows = this.scene.hasShadows() && this.shadowTechnique && shadowLights.length > 0;
		if (enableShadows) {
			
			// applies the shadows on top of the scene
			for (var i = shadowLights.length - 1; i >= 0; i--) {	
				var light = shadowLights[i];
				ctx.light = light;	
				this.shadowTechnique.buildShadowMap(shadowCasters, ctx);

				sl = light;
				
				//TODO: re-set the render state here, it is compromised by the shadow technique
				gl.viewport(0, 0, vp.getWidth(), vp.getHeight());

				// emulates a multiplicative blending mode
				gl.enable(gl.BLEND);
				//gl.disable(gl.BLEND);
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.DST_COLOR, gl.ZERO);	
				//gl.blendFunc(gl.ONE, gl.ONE);

				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.BACK);
				gl.frontFace(gl.CCW);

				for (var j = visibleObjects.length - 1; j >= 0; j--) {		
					this.shadowTechnique.render(visibleObjects[j], ctx);		
				}				
			}
			
			
		}
	} finally {
		gl.disable(gl.BLEND);
		if (renderTarget) renderTarget.deactivate();
	}

	if (enableShadows) {
		gl.viewport(0, 0, 320, 200);
		var cam = sl.getShadowCamera();
		
		this.dbg.sourceTexture = this.shadowTechnique.getShadowMapTexture();
		this.dbg.minDepth = cam.near;
		this.dbg.maxDepth = cam.far;
		this.dbg.render();
	}
	
};

GG.DefaultSceneRenderer.prototype.renderDepthPrePass = function (visibleObjects, ctx) {
	try {		
    	gl.colorMask(false, false, false, false);
    	for (var i = visibleObjects.length - 1; i >= 0; i--) {		
			this.depthPrePassTechnique.render(visibleObjects[i], ctx);		
		}
	} finally {		
    	gl.colorMask(true, true, true, true);
	}
	
};

GG.SampleBase = function (spec) {
	spec = spec || {};
	this.context = spec.context != undefined ? spec.context : "experimental-webgl";
	this.canvas = null;
};

GG.SampleBase.prototype.constructor = GG.SampleBase;

GG.SampleBase.prototype.start = function()  {
	try {
		this.canvas = document.getElementById("c");		
		
		gl = this.canvas.getContext(this.context);
		GG.context = gl;
		GG.canvas = this.canvas;
		GG.init();
		GG.clock = new GG.Clock();		
		
		gl.viewportWidth  = this.canvas.width;
		gl.viewportHeight = this.canvas.height;

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

		window.sample = this;

		this.initialize();

		this.tick();

	} catch (e) {
		alert("error " + e);
	}
};

GG.SampleBase.prototype.initialize = function () {
	// define in subclass
};

GG.SampleBase.prototype.update = function () {
	// define in subclass
};

GG.SampleBase.prototype.tick = function () {
	GG.clock.tick();	
	
	window.sample.update();
	window.sample.draw();
	requestAnimFrame(window.sample.tick);
};
			

