GG.DefaultSceneRenderer = function (spec) {
	this.scene = spec.scene || null;
	this.camera = spec.camera || null;
	this.programCache = {};
	this.shadowTechnique = new GG.ShadowMapTechnique();
};

GG.DefaultSceneRenderer.prototype.setScene = function(sc) {
	this.scene = sc;
	return this;
};

GG.DefaultSceneRenderer.prototype.getScene = function() {
	return this.scene;
};

GG.DefaultSceneRenderer.prototype.setCamera = function(camera) {
	this.camera = camera;
	return this;
};

GG.DefaultSceneRenderer.prototype.getCamera = function() {
	return this.camera;
};

GG.DefaultSceneRenderer.prototype.render = function(renderTarget) {
	var sceneLights = this.scene.listLights();
	var ctx = new GG.RenderContext();
	ctx.camera = this.camera;
	ctx.scene = this.scene;
	ctx.lights = sceneLights;
	ctx.renderTarget = renderTarget;

	var depthPass = this.depthPass;
	var that = this;

	this.shadowTechnique.scenePrePass(this.scene, ctx);

	try {
		if (renderTarget) renderTarget.activate();
	
		var enableShadows = this.scene.hasShadows() && this.shadowTechnique;
		this.scene.perObject(function (renderable) {
			
			var technique = renderable.getMaterial().getTechnique();
			technique.renderPasses().forEach(function(pass) {
				if (pass.isAdaptableToScene()) {
					var hash = that.computeHashForPass(pass);
					var gpuProgram = that.programCache[hash];
					if (!gpuProgram) {
						var vsSource = pass.getVertexShaderSource();
						var fsSource = pass.getFragmentShaderSource();
						if (pass.usesSceneLighting()) {
							that.adaptProgramToSceneLighting(vsSource, fsSource);
						}
						if (enableShadows) {
							that.shadowTechnique.adaptProgram(vsSource, fsSource);
						}
						gpuProgram = GG.ProgramUtils.createProgram(vsSource.toString(), fsSource.toString());		
						that.programCache[hash]	= gpuProgram;

						that.locateSceneUniforms(pass, gpuProgram);

						pass.setProgram(gpuProgram);
						pass.initialize();
					} else {
						pass.setProgram(gpuProgram);
					}
					// set scene uniforms here...
					gl.useProgram(gpuProgram);
					if (enableShadows) {
						that.shadowTechnique.setUniforms(gpuProgram, ctx);
					}
				}
			});
			if (technique) {
				technique.render(renderable, ctx);
			}
			
			
		});
	} finally {
		if (renderTarget) renderTarget.deactivate();
	}
};


GG.DefaultSceneRenderer.prototype.locateSceneUniforms = function(pass, program) {
	if (pass.usesSceneLighting()) {
		GG.ProgramUtils.getLightUniformsLocations(program, 'u_pointLights', 4);
		GG.ProgramUtils.getLightUniformsLocations(program, 'u_directionalLights', 4);
		GG.ProgramUtils.getLightUniformsLocations(program, 'u_spotLights', 4);
	}
};

GG.DefaultSceneRenderer.prototype.adaptProgramToSceneLighting = function(vertexSource, fragmentSource) {	
	if (!fragmentSource.hasUniform('u_pointLights')) {
		fragmentSource.uniformPointLights();
	}
	if (!fragmentSource.hasUniform('u_directionalLights')) {
		fragmentSource.uniformDirectionalLights();
	}
	if (!fragmentSource.hasUniform('u_spotLights')) {
		fragmentSource.uniformSpotLights();
	}	
};

GG.DefaultSceneRenderer.prototype.computeHashForPass = function(pass) {
	var h = pass.Prototype;
	if (pass.usesSceneLighting()) {
		h += this.scene.numPointLights() 
		+ '_' + this.scene.numSpotLights() 
		+ '_' + this.scene.numDirectionalLights() 
		+ '_' + this.scene.shadowsEnabled 
	}
	h += '_' + this.scene.fogEnabled;
	return h;
};

/*
adapt program to scene := 
	adapt lights 
	adapt shadows 
	adapt fog 
	if program supports lighting, then create scene lights uniforms
	if scene uses fog, then extend program with fog uniforms and code block
	if scene uses shadows, then add shadow uniforms and blocks

adapt lights :=
	if program has source:
		check for predetermined names in the uniforms
		if not present then:
			add uniforms
	else abort

adapth shadows :=
*/