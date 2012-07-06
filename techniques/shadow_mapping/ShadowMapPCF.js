GG.ShadowMapPCF = function (spec) {
	// options: light projection near & far planes
	// pcf filter size, shadow map size
	// a light to cast the shadows (only one for starters)
};

GG.ShadowMapPCF.prototype.adaptProgram = function(vertexProgram, fragmentProgram) {
	vertexProgram.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_worldPos')
		.uniform('mat4', 'u_lightView')
		.uniform('mat4', 'u_lightProjection')
		.addMainBlock([
			"v_worldPos = u_matModel * a_position;",
			"mat4 scaleBias = mat4(0.5, 0.0, 0.0, 0.0,0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 1.0);",
			"v_posLightPerspective = scaleBias * u_lightProjection * u_lightView * v_worldPos;"
			].join('\n'));

	fragmentProgram
		.floatPrecision('highp')
		.uniform('sampler2D', 'u_depthMap')
		.uniform('float', 'u_texStep')
		.uniform('int', 'u_filterSize')
		.uniform('float', 'u_shadowFactor')
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_worldPos')
		.addDecl("const float kLightSpaceDepthRange = 100.0;")
		.addDecl(GG.ShaderLib.blocks['libUnpackRrgbaToFloat'])
		.perPointLightBlock([
			"vec2 lightUV = v_posLightPerspective.xy / v_posLightPerspective.w;",
			"float lightDistance = v_worldPos - u_pointLights[0].position;",
			// normalize the distance
			"lightDistance *= 1.0 / kLightSpaceDepthRange;",
			"float depth = libUnpackRrgbaToFloat(texture2D(u_depthMap, lightUV));",
			"color *= (depth > lightDistance) ? 1.0 : u_shadowFactor;"
		].join('\n'));

};

GG.ShadowMapPCF.prototype = new GG.RenderPass();

GG.ShadowMapPCF.prototype.constructor = GG.ShadowMapPCF;
