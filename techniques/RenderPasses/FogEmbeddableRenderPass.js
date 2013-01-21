/**
 * Can be used by calling the function getFogFactor(...) and then mixing the current
 * color with u_fogColor:
 *	float fogFactor = getFogFactor();
 *	gl_FragColor = mix(color, u_fogColor, fogFactor);
 *
 * It adds the following uniforms:
 *	u_fogColor: the fog's color
 *	u_fogStart: the minimum camera distance at which the fog starts to appear
 *  u_fogEnd: the maximum camera distance at which the fog appears
 */

GG.FogEmbeddableRenderPass = function (spec) {
    GG.EmbeddableAdaptiveRenderPass.call(this, spec);
    this.BASE_UNIFORM_NAME = 'u_alphaTexUnit';
};

GG.FogEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.FogEmbeddableRenderPass.prototype.constructor = GG.FogEmbeddableRenderPass;

GG.FogEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material, renderContext) {
	// if no render state is specified or fog is disabled, then do nothing
	if (renderContext.renderState == null || !renderContext.renderState.enableFog) {
		return;
	}
	vertexShader.varying('vec3', 'v_viewPos').addMainBlock('v_viewPos = (u_matModelView * a_position).xyz;');
	fragmentShader
		.uniform('vec3', GG.Naming.UniformFogColor)
		.uniform('float', GG.Naming.UniformFogStart)
		.uniform('float', GG.Naming.UniformFogEnd)
		.uniform('float', GG.Naming.UniformFogDensity)
		.varying('vec3', 'v_viewPos');

	switch (renderContext.renderState.fogMode) {		
		case GG.Constants.FOG_EXP:
			fragmentShader.addDecl('getFogFactor', [
				"float getFogFactor(float distance) {",				
				"	float fogFactor = exp(-u_fogDensity * distance);",
				"	return clamp(0.0, 1.0, fogFactor);",
				"}"
			].join('\n'));
			break;
		case GG.Constants.FOG_EXP2:
			fragmentShader.addDecl('getFogFactor', [
				"float getFogFactor(float distance) {",				
				"	float fogFactor = exp(-u_fogDensity*u_fogDensity * distance*distance);",
				"	return clamp(0.0, 1.0, fogFactor);",
				"}"
			].join('\n'));
			break;
		case GG.Constants.FOG_LINER:
		default:
			fragmentShader.addDecl('getFogFactor', [
				"float getFogFactor(float distance) {",
				"	float fogCoords = (u_fogEnd - distance) / (u_fogEnd - u_fogStart);",
				"	float fogFactor = fogCoords;",
				"	return clamp(0.0, 1.0, fogFactor);",
				"}"
			].join('\n'));
			break;
	}
		
	fragmentShader.addFogBlock([
		"float fogFactor = getFogFactor(length(v_viewPos));",
		"finalColor = mix(u_fogColor, finalColor, fogFactor);"
		].join('\n')
	);
		
};

GG.FogEmbeddableRenderPass.prototype.hashMaterial = function (material, renderContext) {
	var rs = renderContext.renderState;
	if (rs != null) {
		return rs.enableFog + "_" + rs.fogMode;
	} else {
		return "";
	}
};

GG.FogEmbeddableRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	if (ctx.renderState != null && ctx.renderState.enableFog) {
		gl.uniform1f(program[GG.Naming.UniformFogStart], ctx.renderState.fogStart);
		gl.uniform1f(program[GG.Naming.UniformFogEnd], ctx.renderState.fogEnd);
		gl.uniform1f(program[GG.Naming.UniformFogDensity], ctx.renderState.fogDensity);
		gl.uniform3fv(program[GG.Naming.UniformFogColor], ctx.renderState.fogColor);
	}
};

/*
// TODO: 
// add the context to the parameters of EmbeddableRenderPass.adaptShadersToMaterial
// rename EmbeddableRenderPass.adaptShadersToMaterial to EmbeddableRenderPass.adaptShaders
// rename AdaptiveRenderPass.adaptShadersToMaterial to AdaptiveRenderPass.adaptToMaterial
fogCoords = viewDist - fogStart / (fogEnd - fogStart);

// linear
fogFactor = fogCoords;

// exp
fogFactor = exp(-u_fogDensity * fogCoords);

// exp2
fogFactor = pow(exp(-u_fogDensity * fogCoords), 2);
*/