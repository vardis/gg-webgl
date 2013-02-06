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

			predefined[GG.Naming.UniformViewportSize] = function(p, uname) { 
				var vp = renderContext.camera.getViewport();
				gl.uniform2fv(p[uname], [vp.width, vp.height]); 
			};

			predefined[GG.Naming.UniformInverseViewProjectionMatrix] = function(p, uname) {
				var vp = mat4.create();
				mat4.multiply(renderContext.camera.getProjectionMatrix(), renderContext.camera.getViewMatrix(), vp);				
				var inv = mat4.create();
				mat4.inverse(vp, inv);
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

			predefined[GG.Naming.UniformCameraWorldPos] = function(p, uname) { 
				gl.uniform3fv(p[uname], renderContext.camera.getPosition());
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
		},

		getTexUnitUniformLocations : function (program, uniformName) {
			['map', 'offset', 'scale'].forEach(function (u) {
				var field = uniformName + '.' + u;
				program[field] = gl.getUniformLocation(program, field);	
			});
            var field = uniformName + '.' + 'offset';
            program[field] = gl.getUniformLocation(program, field);

            field = uniformName + '.' + 'scale';
            program[field] = gl.getUniformLocation(program, field);

            field = GG.Naming.textureUnitUniformMap(uniformName);
            program[field] = gl.getUniformLocation(program, field);
		},

		setTexUnitUniforms : function (program, uniformName, texUnit) {			
			gl.uniform2fv(program[uniformName + '.offset'], [texUnit.offsetU, texUnit.offsetV]);
			gl.uniform2fv(program[uniformName + '.scale'], [texUnit.scaleU, texUnit.scaleV]);
			gl.uniform1i(program[GG.Naming.textureUnitUniformMap(uniformName)], texUnit.glTexUnit);
		}
	}
}();