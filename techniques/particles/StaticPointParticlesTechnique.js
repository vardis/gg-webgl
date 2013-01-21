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

GG.StaticPointParticlesRenderPass.prototype.createShadersForMaterial = function (material, renderContext) {	
	var vs = this.createVertexShader(material);
	var fs = this.createFragmentShader(material);

	this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material);

	this.vertexShader   = vs.toString();
	this.fragmentShader = fs.toString();
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

	if (material.useVertexColors) {
		vs
			.color()
			.varying('vec3', 'v_color')
			.addMainBlock("	v_color = a_color;");		
	}
	return vs;
};

GG.StaticPointParticlesRenderPass.prototype.createFragmentShader = function (material) {
	var fs = new GG.ProgramSource().asFragmentShader();
	
	if (material.useVertexColors) {
		fs.varying('vec3', GG.Naming.VaryingColor);
		fs.addMainInitBlock('vec3 '  + GG.Naming.VarDiffuseBaseColor + ' = ' + GG.Naming.VaryingColor + ';');
	} else {
		fs.uniform('vec3', 'u_materialDiffuse')
			.addMainInitBlock('vec3 '  + GG.Naming.VarDiffuseBaseColor + ' = u_materialDiffuse;');
	} 
	fs.addMainInitBlock('vec2 ' + GG.Naming.VaryingTexCoords + ' = gl_PointCoord;');
	fs.writeOutput('gl_FragColor = vec4(' + GG.Naming.VarDiffuseBaseColor + ', 1.0);');
	return fs;
};

GG.StaticPointParticlesRenderPass.prototype.hashMaterial = function (material, renderContext) {
	return material.useVertexColors + this.diffuseTexturingPass.hashMaterial(material, renderContext);
};

GG.StaticPointParticlesRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	if (!renderable.material.useVertexColors) {
		gl.uniform3fv(program.u_materialDiffuse, renderable.material.diffuse);
	}
	gl.uniform1f(program.u_pointSize, renderable.pointSize);
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
};

GG.StaticPointParticlesRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);	
};
