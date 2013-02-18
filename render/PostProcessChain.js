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
 *      .filter(myScreenFilter).vignette({ radius : 0.1 }).gamma(2.2);
 */                    
GG.PostProcessChain = function (spec) {
    this.filterChain = [];
    this.screenPasses  = [];
    this.program     = null;
    this.src         = null;
    this.dest        = null;
    this.needsUpdate = true;
    this.pingpongBuffer = null;

    // Creates an instance method for each registered screen filter.
    // The method has the same name as the registration name of the filter.
    // When the method is called, it will then add the screen filter 
    // to the filter chain of the bound PostProcessChain instance.
    for (filterName in GG.PostProcessChain.availableFilters) {
        var self = this;
        this[filterName] = function (fname) {
            return function (spec) {
                self.filterChain.push(new GG.PostProcessChain.availableFilters[fname](spec));
                self.needsUpdate = true;
                return self;
            }
        }(filterName);
    }
};

GG.PostProcessChain.prototype.constructor = GG.PostProcessChain;

// a map of (filter name -> filter class constructor)
GG.PostProcessChain.availableFilters = {};

GG.PostProcessChain.registerScreenFilter = function (name, ctor) {
    GG.PostProcessChain.availableFilters[name] = ctor;
};

GG.PostProcessChain.prototype.source = function (src) {
    this.src = src;
    return this;
};

GG.PostProcessChain.prototype.destination = function (dest) {
    this.dest = dest;
    return this;
};

GG.PostProcessChain.prototype.createPassesFromInputFilters = function () {
    var passes = [];
    var combinedFilters = [];
    for (var i = 0; i < this.filterChain.length; i++) {
        var filter = this.filterChain[i];
        if (filter.standalone) {
            if (combinedFilters.length > 0) {
                var pass = createPassFromCombinedFilters(combinedFilters);
                pass['filters'] = combinedFilters;
                passes.push(pass);
                combinedFilters = [];
            }
            passes = passes.concat(filter.getScreenPasses());
        } else {
            combinedFilters.push(filter);
        }
    }

    if (combinedFilters.length > 0) {
        var pass = this.createPassFromCombinedFilters(combinedFilters);
        pass['filters'] = combinedFilters;
        passes.push(pass);                         
    }
    return passes;
};

GG.PostProcessChain.prototype.createPassFromCombinedFilters = function (filtersList) {
    var programSource = new GG.ProgramSource();
    programSource.asFragmentShader().floatPrecision('highp')
        .uniform('sampler2D', 'u_sourceTexture')
        .varying('vec2', 'v_texCoords')
        .addMainInitBlock('vec4 color = texture2D(u_sourceTexture, v_texCoords);');

    for (var i = 0; i < filtersList.length; i++) {
        filtersList[i].inject(programSource);
    }
    programSource.addMainBlock("gl_FragColor = vec4(color.rgb, 1.0);");
    
    var screenPass = new GG.ScreenPass({
        vertexShader   : GG.ShaderLib.screen_filter_vertex,
        fragmentShader : programSource.toString()                       
    });
    screenPass.createGpuProgram();
    return screenPass;
};

GG.PostProcessChain.prototype.process = function () {
    if (this.needsUpdate) {
        this.screenPasses = this.createPassesFromInputFilters();
        this.needsUpdate = false;
    }

    var sourceTexture = this.src;
    if (this.src instanceof GG.RenderTarget) {
        sourceTexture = this.src.getColorAttachment(0);
    }        

    this.camera = new GG.OrthographicCamera();
    var targetViewportDimensions = this.getDestinationViewport();
    this.camera.getViewport().setWidth(targetViewportDimensions[0]);
    this.camera.getViewport().setHeight(targetViewportDimensions[1]);
    this.renderContext = new GG.RenderContext({ camera : this.camera });

    try {        
        if (this.screenPasses.length > 1 && this.pingpongBuffer == null) {
        	// TODO: set the dimensions according to the source or dest render target
            this.pingpongBuffer = new GG.PingPongBuffer({ width : targetViewportDimensions[0], height : targetViewportDimensions[1] });
            this.pingpongBuffer.initialize();
        }
        for (var i = 0; i < this.screenPasses.length; i++) {
        	var pass = this.screenPasses[i];
            // input from?
            if (i == 0) {
                pass.setSourceTexture(sourceTexture);        
            } else {
                pass.setSourceTexture(this.pingpongBuffer.sourceTexture());
            }
            // destination to?
            if (i == this.screenPasses.length - 1) {
                this.bindFinalRenderTarget(this.dest);
            } else if (i == 0) {
                this.pingpongBuffer.activateOnlyTarget();
            } else {
                this.pingpongBuffer.activate();
            }                                
            if (pass.hasOwnProperty('filters')) {
            	var filters = pass.filters;
            	gl.useProgram(pass.program);
            	for (var f = 0; f < filters.length; f++) {
            		filters[f].setUniforms(pass.program);
            	}
            }
            pass.render(null, this.renderContext);
            if (this.pingpongBuffer != null) {
                this.pingpongBuffer.swap();
            }
        }

            
    } finally {
        this.unbindFinalRenderTarget(this.dest);
    }
};

GG.PostProcessChain.prototype.getDestinationViewport = function (argument) {
	if (this.dest == null) {
		return [gl.viewportWidth, gl.viewportHeight];
	} else {
		return [ this.dest.width, this.dest.height ];
	}
};

GG.PostProcessChain.prototype.bindFinalRenderTarget = function (dest) {
    if (this.dest instanceof GG.RenderTarget) {
        this.dest.activate();
        viewport = [this.dest.width, this.dest.height ];
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        viewport = [gl.viewportWidth, gl.viewportHeight];
    }
};

GG.PostProcessChain.prototype.unbindFinalRenderTarget = function (dest) {
    if (this.dest instanceof GG.RenderTarget) {
        this.dest.deactivate();
    }
};