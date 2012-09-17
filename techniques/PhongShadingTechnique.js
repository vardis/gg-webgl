GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [new GG.PhongPass()];
	GG.BaseTechnique.call(this, spec);
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongPass = function(spec) {	
	GG.RenderPass.call(this, spec);
	this.createProgram();
};

GG.PhongPass.prototype = new GG.RenderPass();
GG.PhongPass.prototype.constructor = GG.PhongPass;

GG.PhongPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);
	GG.ProgramUtils.setLightsUniform(program, GG.Naming.UniformLight, ctx.light);
};

GG.PhongPass.prototype.createProgram = function() {
	var pg = new GG.ProgramSource();
	pg.position()
		.normal()
  		.uniformModelViewMatrix()
  		.uniformNormalsMatrix()
		.uniformProjectionMatrix()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.addMainBlock([
			"	vec4 viewPos = u_matModelView*a_position;",
			"	gl_Position = u_matProjection*viewPos;",
			"	gl_Position.z -= 0.0001;",
			"	v_normal = u_matNormals * a_normal;",
			"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
			"	v_viewPos = viewPos;"
			].join('\n'));
	this.vertexShader = pg.toString();

	pg = new GG.ProgramSource();
	pg.asFragmentShader()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.uniformViewMatrix()
		.uniformLight()
		.uniformMaterial()
		.addDecl(GG.ShaderLib.phong.lightIrradiance)
		.addMainBlock([
			"	vec3 N = normalize(v_normal);",
			"	vec3 V = normalize(v_viewVector);",		
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);",
			"	vec3 L = normalize(u_matView*vec4(u_light.position, 1.0) - v_viewPos).xyz;",
			"	lightIrradiance(N, V, L, u_light, u_material, diffuse, specular);",
			"	gl_FragColor = vec4(u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular, 1.0);"			
		].join('\n'));
		
	this.fragmentShader = pg.toString();	
};

GG.PhongPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	/*
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CW);
	gl.enable(gl.CULL_FACE);
	*/
};