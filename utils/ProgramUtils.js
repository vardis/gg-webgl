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

			['u_matView', 'u_matProjection', 'fTime0_X'].forEach(function(u) {
				loc = gl.getUniformLocation(program, u);
				if (loc != undefined) {
					program[u] = loc;
				}
			});
		},

		/**
		 * Scans the input program for uniforms with names that correspond
		 * to predefined semantics. For example the uniform program.fTime0_X will
		 * be set to a float value equal to the total time elapsed since the 
		 * application started running.
		 */
		injectBuiltInUniforms : function(program, renderContext) {
			predefined = {
				'fTime0_X' : function(p, uname) { gl.uniform1f(p[uname], renderContext.clock.totalRunningTime()); },
				'u_matView' : function(p, uname) { gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getViewMatrix()); },
				'u_matProjection' : function(p, uname) { gl.uniformMatrix4fv(p[uname], false, renderContext.camera.getProjectionMatrix()); },

			}
			for ( u in predefined) {
				if (program[u]) {
					predefined[u](program, u);
				}				
			}
		},

		getAttributeLocations : function(program, attributeNames) {
			predefined = [
				'a_position',
				'a_normal',
				'a_texCoords'
			];
			predefined.concat(attributeNames);
			for (attr in GG.GLSLProgram.BuiltInAttributes) {
				loc = gl.getAttribLocation(program, GG.GLSLProgram.BuiltInAttributes[attr]);
				if (loc >= 0) {
					program[attr] = loc;
				}
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
				lightIndex = lights.length > 1 ? "[" + i + "]" : "";
				for (k in uniforms) {
					field = uniformName + lightIndex + "." + uniforms[k][0] ;			
					var val = lights[i][k];
					eval("gl.uniform" + (uniforms[k][1] > 1 ? "3fv" : "1f") + "(program[field], val)");
				}
			}
		},

		createLightUniforms : function (program, uniformName, lights) {
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
	}
}();