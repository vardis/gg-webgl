GG.StaticPointParticlesTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [new GG.StaticPointParticlesRenderPass()];

	GG.BaseTechnique.call(this, spec);
};

GG.StaticPointParticlesTechnique.prototype = new GG.BaseTechnique();
GG.StaticPointParticlesTechnique.prototype.constructor = GG.StaticPointParticlesTechnique;

GG.StaticPointParticlesRenderPass = function (spec) {
	this.diffuseTexturingPass = new GG.DiffuseTextureStackEmbeddableRenderPass();
};

GG.StaticPointParticlesRenderPass.prototype = new GG.AdaptiveRenderPass();
GG.StaticPointParticlesRenderPass.prototype.constructor = GG.StaticPointParticlesRenderPass;

GG.StaticPointParticlesRenderPass.prototype.createShadersForMaterial = function (material) {	
	this.vertexShader   = this.createVertexShader(material);
	this.fragmentShader = this.createFragmentShader(material);
};

GG.StaticPointParticlesRenderPass.prototype.createVertexShader = function (material) {
	var vs = new GG.ProgramSource();
	vs.position()		
  		.uniformModelViewMatrix()
		.uniformProjectionMatrix()
		.uniform('float', 'u_pointSize')		
		.addMainBlock([			
			"	vec4 viewPos = u_matModelView * a_position;",
			"	gl_Position = u_matProjection * viewPos;",
			"	gl_PointSize = u_pointSize / (1.0 + length(viewPos.xyz));"
    ].join('\n'));

	if (material.useVertexColors()) {
		vs.color().varying('vec3', 'v_color').addMainBlock("	v_color = a_color;");		
	}
	return vs.toString();
};

GG.StaticPointParticlesRenderPass.prototype.createFragmentShader = function (material) {
	var fs = new GG.ProgramSource();
	fs.uniform('sampler2D', 'u_texture');

	fs.addMainInitBlock('vec3 diffuse = vec3(0.0);');
	if (material.useVertexColors()) {
		fs.varying('vec3', 'v_color');
		fs.addMainBlock('diffuse = v_color;');		
	} else {
		fs.uniform('vec3', 'u_materialDiffuse').addMainBlock('diffuse = u_materialDiffuse;');		
	} 

	this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material);

	fs.finalColor('gl_FragColor = vec4(diffuse, 1.0);');
	return fs.toString();
};

GG.StaticPointParticlesRenderPass.prototype.hashMaterial = function (material) {
	return material.useVertexColors() + this.diffuseTexturingPass.hashMaterial(material);
};

GG.StaticPointParticlesRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	if (!material.useVertexColors()) {
		gl.unifor3fv(program.u_materialDiffuse, renderable.material.diffuse);
	}
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
};

GG.StaticPointParticlesRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);	
};
