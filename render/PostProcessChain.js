/**
 * Manages a chain of post processing, screen filters. 
 *
 * A Texture or RenderTarget is required to provide the input, while the output
 * can be either a RenderTarget or null which corresponds to the WebGL BACK buffer.
 *
 * PostProcessChain will generate a GLSL program according to the contents
 * of the filter chain. The benefit is that all processing happens in a single
 * pass rather than doing one pass per filter.
 *
 * E.g.:
 * var postProcess = new GG.PostProcessChain();
 * postProcess.input(highResRT).output(null)
 * 	.filter(myScreenFilter).vignette({ radius : 0.1 }).gamma(2.2);
 */ 	               
GG.PostProcessChain = function (spec) {
	this.filterChain = [];
	this.screenPass  = new GG.ScreenPass();
	this.program     = null;
	this.src         = null;
	this.dest        = null;
	this.needsUpdate = true;

	this.availableFilters = {
		'gamma'    : GG.GammaScreenFilter,
		'vignette' : GG.VignetteScreenFilter,
		'tvLines'  : GG.TVLinesScreenFilter
	};

	for (filterName in this.availableFilters) {
		var that = this;
		this[filterName] = function (fname) {
			return function (spec) {
				that.filterChain.push(new that.availableFilters[fname](spec));
				that.needsUpdate = true;
				return that;
			}
		}(filterName);
	}
		
};

GG.PostProcessChain.prototype.constructor = GG.PostProcessChain;

GG.PostProcessChain.prototype.source = function (src) {
	this.src = src;
	return this;
};

GG.PostProcessChain.prototype.destination = function (dest) {
	this.dest = dest;
	return this;
};

GG.PostProcessChain.prototype.process = function () {
	if (this.needsUpdate) {
		this.screenPass.destroy();

		var programSource = new GG.ProgramSource();
		programSource.asFragmentShader().floatPrecision('highp')
			.uniform('sampler2D', 'u_sourceTexture')
			.varying('vec2', 'v_texCoords')
			.addMainInitBlock('vec4 color = texture2D(u_sourceTexture, v_texCoords);');

		for (var i = 0; i < this.filterChain.length; i++) {
			this.filterChain[i].inject(programSource);
		};

		programSource.addMainBlock("gl_FragColor = vec4(color.rgb, 1.0);");
		
		this.screenPass = new GG.ScreenPass({
			vertexShader   : GG.ShaderLib.screen_filter_vertex,
			fragmentShader : programSource.toString()			
		});

		this.needsUpdate = false;
	}

	var sourceTexture = this.src;
	if (this.src instanceof GG.RenderTarget) {
		sourceTexture = this.src.getColorAttachment(0);
	}
	this.screenPass.setSourceTexture(sourceTexture);

	try {
		if (this.dest instanceof GG.RenderTarget) {
			this.dest.activate();
		} else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		}

		// call initialize now in order to get the gpu program
		this.screenPass.initialize();
		gl.useProgram(this.screenPass.program);
		
		for (var i = 0; i < this.filterChain.length; i++) {
			this.filterChain[i].setUniforms(this.screenPass.program);
		};
		this.screenPass.render();
	} finally {
		if (this.dest instanceof GG.RenderTarget) {
			this.dest.deactivate();
		}
	}
};

GG.PostProcessChain.prototype.filter = function (screenFilter) {
	// body...
	return this;
};

