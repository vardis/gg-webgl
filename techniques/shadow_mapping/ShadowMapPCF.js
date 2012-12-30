GG.ShadowMapPCF = function (spec) {
	spec           = spec || {};
	this.shadowMap = null;
	this.options   = null;	

	var pg = new GG.ProgramSource()
		.floatPrecision('highp')
		.position()
		.normal()
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.varying('vec3', 'v_normal')
		.uniform('mat4', 'u_matModel')
		.uniform('mat3', 'u_matNormals')
		.uniform('mat4', 'u_matView')
		.uniform('mat4', 'u_matProjection')
		.uniform('mat4', 'u_matLightView')
		.uniform('mat4', 'u_matLightProjection')
		.addMainBlock([
			"v_lightViewPos = u_matLightView * u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_matLightProjection * v_lightViewPos;",
			"v_normal = u_matNormals * a_normal;",
        "vec4 test = a_position;",
        "test.z += 0.03;",
			"gl_Position = u_matProjection * u_matView * u_matModel * test;"
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
		.uniform('mat4', 'u_matView')
		.uniform('vec3', 'u_lightDir')
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.varying('vec3', 'v_normal')
		.addDecl('libUnpackRrgbaToFloat', GG.ShaderLib.blocks['libUnpackRrgbaToFloat'])
		.addMainBlock([
			"float average = 0.0;",
			"float df = dot(v_normal, normalize(u_matView * vec4(-u_lightDir, 0.0)).xyz);",					
			"vec3 lightUV = v_posLightPerspective.xyz / v_posLightPerspective.w;",
			"if (df > 0.0 && lightUV.z <= 1.0 && v_posLightPerspective.w > 0.0 && !(lightUV.s < 0.0 || lightUV.t < 0.0 || lightUV.s > 1.0 || lightUV.t > 1.0)) {", 
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

			"			vec2 sampleUV = lightUV.st + vec2(x*u_texStep.x, y*u_texStep.y);",
			"			if (!(sampleUV.s < 0.0 || sampleUV.t < 0.0 || sampleUV.s > 1.0 || sampleUV.t > 1.0)) {", 
			"				float depth = libUnpackRrgbaToFloat(texture2D(u_shadowMap, sampleUV));",
			"				passed += (depth > lightDistance) ? 1.0 : 0.0;",
			"				samples++;",
			"			}",
			
			"		}",
			"	}",
			"	average = passed / samples;",
			"} else { average = 1.0; }",
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

	gl.uniform3fv(program.u_lightDir, ctx.light.direction);

	var cam = ctx.light.getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.viewMatrix);
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
