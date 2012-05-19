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