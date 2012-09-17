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
