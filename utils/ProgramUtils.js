GG.ProgramUtils = function() {
	return {
		compileShader : function(shaderType, source) {
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
		},

		/**
		 * Scans the input program for uniforms with names that correspond
		 * to predefined semantics. For example the uniform program.fTime0_X will
		 * be set to a float value equal to the total time elapsed since the 
		 * application started running.
		 */
		injectBuiltInUniforms : function(program, renderContext, renderable) {
			var predefined = {};
			predefined[GG.GLSLProgram.UniformTime0_X] = function(p, uname) { 
				gl.uniform1f(p[uname], renderContext.clock.totalRunningTime()); 
			};
			predefined[GG.GLSLProgram.UniformViewMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getViewMatrix()); 
			};
			predefined[GG.GLSLProgram.UniformProjectionMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getProjectionMatrix()); 
			};
			predefined[GG.GLSLProgram.UniformModelMatrix] = function(p, uname) { 
				gl.uniformMatrix4fv(p[uname], false, renderable.getModelMatrix()); 
			};

			for ( u in predefined) {
				if (program[u]) {
					predefined[u](program, u);
				}				
			}
		},

		getAttributeLocations : function(program) {
			var idx = 0;
			var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
			
			for (var idx = 0; idx < numAttributes; idx++) {
				var att = gl.getActiveAttrib(program, idx);				
				program[att.name] = gl.getAttribLocation(program, att.name);				
			}
			
		},

		setLightsUniform : function (program, viewMat, uniformName, lights) {
			uniforms = {
				position : ["position", 3],
				direction : ["direction", 3],
				diffuse : ["diffuse", 3],
				specular : ["specular", 3],
				attenuation : ["attenuation", 1],
				cosCutOff : ["cosCutOff", 1]
			}
			for (var i = 0; i < lights.length; i++) {
				var lightIndex =  "[" + i + "]";//lights.length > 1 ? "[" + i + "]" : "";
				for (var k in uniforms) {
					var field = uniformName + lightIndex + "." + uniforms[k][0] + lightIndex;			
					var val = lights[i][k];
					eval("gl.uniform" + (uniforms[k][1] > 1 ? "3fv" : "1f") + "(program[field], val)");
				}
			}
		},

		getLightUniformsLocations : function (program, uniformName, numLights) {
			var uniforms = {
				position : ["position", 3],
				direction : ["direction", 3],
				diffuse : ["diffuse", 3],
				specular : ["specular", 3],
				attenuation : ["attenuation", 1],
				cosCutOff : ["cosCutOff", 1]
			}
			
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
			gl.uniform3fv(program[uniformName + '.ambient'], material.ambient);
			gl.uniform3fv(program[uniformName + '.diffuse'], material.diffuse);
			gl.uniform3fv(program[uniformName + '.specular'], material.specular);
			gl.uniform1f(program[uniformName + '.shininess'], material.shininess);
		},

		getMaterialUniformLocations : function(program, uniformName) {
			['ambient', 'diffuse', 'specular', 'shininess'].forEach(function (u) {
				var field = uniformName + '.' + u;
				program[field] = gl.getUniformLocation(program, field);	
			});
		}		
	}
}();