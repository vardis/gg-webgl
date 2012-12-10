GG.ShadowMapVSM = function (spec) {
	spec           = spec || {};
	this.shadowMap = null;
	this.options   = null;	
	this.rt        = null;
	this.blurPass  = null;

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
		.uniform('float', 'u_depthOffset')		
		.uniform('float', 'u_lightSpaceDepthRange')	
		.varying('vec4', 'v_posLightPerspective')
		.varying('vec4', 'v_lightViewPos')
		.addDecl('libUnpackVec2ToFloat', GG.ShaderLib.blocks['libUnpackVec2ToFloat'])
		.addDecl('ChebychevInequality', [
			/**
			 * Calculates a sharp bound of Chebychev's inequality, the
			 * Cantelli's inequality.
			 * The moments of the distribution are the expected value and 
			 * the squared expected value.
			 * The expected value is calculated previousy by blurring the
			 * depth map.
			 * The squared expected value is used to calculate the variance.
			 */
			"float ChebychevInequality(float M1, float E_x2, float depth) {",			
    		"	// Calculate variance, which is actually the amount of",
    		"	// error due to precision loss from fp32 to RG/BA (moment1 / moment2)",
    		"	float Ex_2 = M1*M1;",
    		"	float variance = E_x2 - Ex_2;",
    		"	variance = min(1.0, max(variance, 0.0002));",
    		"	// Calculate the upper bound",
    		"	float d = depth - M1;",
    		"	float p = variance / (variance + d * d);",
    		"	return max(smoothstep(u_shadowFactor, 1.0, p), depth <= M1 ? 1.0 : 0.0); ",
    		"}"
			].join('\n'))
		.addMainBlock([
			"vec2 lightUV = v_posLightPerspective.xy / v_posLightPerspective.w;",
			"if (!(lightUV.s < 0.0 || lightUV.t < 0.0 || lightUV.s > 1.0 || lightUV.t > 1.0)) {", 
			"	float lightDistance = length(v_lightViewPos.xyz);",
			// normalize the distance
			"	lightDistance *= 1.0 / u_lightSpaceDepthRange;",
			"	lightDistance -= u_depthOffset;",
			"	vec4 moments = texture2D(u_shadowMap, lightUV);",
			// 1st moment of distribution is the expected value (the average of depth values around the fragment)
			"	float M1 = libUnpackVec2ToFloat(moments.xy);",
			// the 2nd moment of distribution is the squared expected value
			"	float M2 = libUnpackVec2ToFloat(moments.zw);",
			"	float sf = ChebychevInequality(M1, M2, lightDistance);",
			"	gl_FragColor = sf;",			
			"}"
		].join('\n'));
	spec['fragmentShader'] = pg.toString();

	GG.RenderPass.call(this, spec);
};

GG.ShadowMapVSM.prototype             = new GG.RenderPass();
GG.ShadowMapVSM.prototype.constructor = GG.ShadowMapVSM;

GG.ShadowMapVSM.prototype.__setCustomUniforms = function(renderable, ctx, program) {	
	var cam = ctx.light.getShadowCamera();
	gl.uniform1f(program.u_lightSpaceDepthRange, cam.far - cam.near);
	gl.uniformMatrix4fv(program.u_matLightView, false, cam.getViewMatrix());
	gl.uniformMatrix4fv(program.u_matLightProjection, false, cam.getProjectionMatrix());
	gl.uniform1f(program.u_depthOffset, this.options.depthOffset);

	this.shadowMap.bindAtUnit(GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1i(program['u_shadowMap'], GG.TEX_UNIT_SHADOW_MAP);
	gl.uniform1f(program.u_shadowFactor, this.options.shadowFactor);
};

/**
 * Called right after the shadow map is built with the purpose of applying a blur step.
 */
GG.ShadowMapVSM.prototype.postShadowMapConstruct = function() {
	this.shadowMap.setMinFilter(gl.LINEAR);
	this.shadowMap.setMagFilter(gl.LINEAR);

	if (this.rt == null || this.rt.sourceTexture().width != this.options.shadowMapWidth) {
		console.log('Creating a new ping pong buffer');
		if (this.rt != null) {
			this.rt.destroy();
		}
		spec = {
			width : this.options.shadowMapWidth,
			height : this.options.shadowMapHeight,
			colorAttachments : this.shadowMap
		};
		this.rt = new GG.PingPongBuffer(spec);
		this.rt.initialize();	
	}
	
	if (this.blurPass == null) {
		this.blurPass = new GG.VSMGaussianBlurPass({
			filterSize : this.options.vsmBlurringSize != undefined ? this.options.vsmBlurringSize : 4			
		});
		this.blurPass.initialize();
	}	

	// render at 1st color attachment reading from this.shadowMap
	try {
		this.rt.activate();
		this.blurPass.setHorizontal();
		this.blurPass.setSourceTexture(this.rt.sourceTexture());
		this.blurPass.render();

		// render to this.shadowMap	
		this.rt.swap();
		this.blurPass.setVertical();
		this.blurPass.setSourceTexture(this.rt.sourceTexture());
		this.blurPass.render();	
	} finally {
		this.rt.deactivate();	
	}
};

GG.ShadowMapVSM.prototype.setShadowMap = function(sm) {
	this.shadowMap = sm;
};

GG.ShadowMapVSM.prototype.setOptions = function(opts) {
	this.options = opts;
};