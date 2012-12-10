GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [new GG.PhongPass()];

	GG.BaseTechnique.call(this, spec);
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongPass = function(spec) {	
	GG.RenderPass.call(this, spec);
	this.diffuseTexturingPass = new GG.DiffuseTextureStackEmbeddableRenderPass();
	this.specularMapPass = new GG.SpecularMappingEmbeddableTechnique();
	this.createProgram(null);	
};

GG.PhongPass.prototype = new GG.AdaptiveRenderPass();
GG.PhongPass.prototype.constructor = GG.PhongPass;

GG.PhongPass.prototype.createProgram = function(material) {
	var vs = new GG.ProgramSource();
	vs.position()
		.normal()
  		.uniformModelViewMatrix()
  		.uniformNormalsMatrix()
		.uniformProjectionMatrix()
		.texCoord0()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.varying('vec2', 'v_texCoords')
		.addMainBlock([
			"	vec4 viewPos = u_matModelView*a_position;",
			"	gl_Position = u_matProjection*viewPos;",
			"	gl_Position.z -= 0.0001;",
			"	v_normal = u_matNormals * a_normal;",
			"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
			"	v_viewPos = viewPos;",
			"	v_texCoords = a_texCoords;"
			].join('\n'));	

	fs = new GG.ProgramSource();
	fs.asFragmentShader()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec2', 'v_texCoords')
		.varying('vec3', 'v_viewVector')
		.uniformViewMatrix()
		.uniformLight()
		.uniformMaterial()
		.addDecl('phong.lightIrradiance', GG.ShaderLib.phong.lightIrradiance)
		.addMainInitBlock([
			"	vec3 N = normalize(v_normal);",
			"	vec3 V = normalize(v_viewVector);",		
			"	vec3 diffuse = u_material.diffuse;",
			"	vec3 specular = vec3(0.0);"
			].join('\n'))
		.addMainBlock([			
			"	vec3 L;",
			"	if (u_light.type == 1.0) {",
			"		L = normalize((u_matView*vec4(-u_light.direction, 0.0)).xyz);",
			"	} else {",
			"	   L = normalize(u_matView*vec4(u_light.position, 1.0) - v_viewPos).xyz;",			
			"	}",
			"	lightIrradiance(N, V, L, u_light, u_material, diffuse, specular);"			
		].join('\n'))
		.finalColor(
			"	gl_FragColor = vec4(u_material.ambient + vec3(0.9)*u_material.diffuse*diffuse + u_material.specular*specular, 1.0);"
			//"gl_FragColor = vec4(specular, 1.0);"
			);

	if (material != null) {
		this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material);
		this.specularMapPass.adaptShadersToMaterial(vs, fs, material);
	}
	this.vertexShader = vs.toString();
	this.fragmentShader = fs.toString();	
};

GG.PhongPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);
	GG.ProgramUtils.setLightsUniform(program, GG.Naming.UniformLight, ctx.light);
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
	this.specularMapPass.__setCustomUniforms(renderable, ctx, program);
};

GG.PhongPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	/*
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CW);
	gl.enable(gl.CULL_FACE);
	*/
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);
	this.specularMapPass.__setCustomRenderState(renderable, ctx, program);
};

GG.PhongPass.prototype.createShadersForMaterial = function (material) {
	this.createProgram(material);
};

GG.PhongPass.prototype.hashMaterial = function (material) {
	return this.diffuseTexturingPass.hashMaterial(material) + this.specularMapPass.hashMaterial(material);
};