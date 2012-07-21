GG.ShadowMapPCF = function (spec) {
	// options: light projection near & far planes
	// pcf filter size, shadow map size
	// a light to cast the shadows (only one for starters)
};
GG.ShadowMapPCF = {};

GG.ShadowMapPCF.adaptProgram = function(vertexProgram, fragmentProgram) {
	vertexProgram.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.uniform('mat4', 'u_matModel')
		.uniform('mat4', 'u_matLightView')
		.uniform('mat4', 'u_matLightProjection')
		.addMainBlock([
			"v_lightViewPos = u_matLightView * u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_matLightProjection * v_lightViewPos;"
			].join('\n'));

	fragmentProgram
		.floatPrecision('highp')		
		.uniform('vec2', 'u_texStep')
		.uniform('float', 'u_depthOffset')
		.uniform('float', 'u_filterSize')	
		.uniform('float', 'u_lightSpaceDepthRange')	
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.addDecl(GG.ShaderLib.blocks['libUnpackRrgbaToFloat'])
		.perDirectionalLightBlock([
			"vec2 lightUV = v_posLightPerspective.xy / v_posLightPerspective.w;",
			"if (!(lightUV.s < 0.0 || lightUV.t < 0.0 || lightUV.s > 1.0 || lightUV.t > 1.0)) {", 
			"float lightDistance = length(v_lightViewPos.xyz);",
			// normalize the distance
			"lightDistance *= 1.0 / u_lightSpaceDepthRange;",
			"lightDistance -= u_depthOffset;",
			
			"float passed = 0.0;",
			"float samples = 0.0;",
			"for (float y = -2.0; y <= 2.0; y++) {",
			"		if (abs(y) > u_filterSize) continue;",
			"	for (float x = -2.0; x <= 2.0; x++) {",
			"		if (abs(x) > u_filterSize) continue;",

			"		vec2 sampleUV = lightUV + vec2(x*u_texStep.x, y*u_texStep.y);",
			"		if (!(sampleUV.s < 0.0 || sampleUV.t < 0.0 || sampleUV.s > 1.0 || sampleUV.t > 1.0)) {", 
			"			float depth = libUnpackRrgbaToFloat(texture2D(u_depthMap, sampleUV));",
			"			passed += (depth > lightDistance) ? 1.0 : 0.0;",
			"			samples++;",
			"		}",
			
			"	}",
			"}",
			"diffuse *= vec3(passed / (samples));",
			"}"
			
		].join('\n'));

};

GG.ShadowMapPCF.setUniforms = function(program, ctx, options) {
	var pcfSize = options.pcfSize || 4;	
	gl.uniform1f(program.u_filterSize, pcfSize);

	texStep = [ 1.0 / options.shadowMapWidth, 1.0 / options.shadowMapHeight ];
	gl.uniform2fv(program.u_texStep, texStep);

	var cam = ctx.scene.listDirectionalLights()[0].getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.getViewMatrix());
	gl.uniformMatrix4fv(program.u_matLightProjection, false, cam.getProjectionMatrix());
	gl.uniform1f(program.u_depthOffset, options.depthOffset);
};