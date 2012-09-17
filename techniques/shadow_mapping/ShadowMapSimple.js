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