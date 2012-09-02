GG.PhongShadingTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [new GG.PhongPass()];
	GG.BaseTechnique.call(this, spec);
};

GG.PhongShadingTechnique.prototype = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongPass = function(spec) {
	spec = spec || {};
	spec.adaptsToScene = true;

	GG.RenderPass.call(this, spec);

	this.createProgram();
};

GG.PhongPass.prototype = new GG.RenderPass();
GG.PhongPass.prototype.constructor = GG.PhongPass;

GG.PhongPass.prototype.__locateCustomUniforms = function(program) {
	GG.ProgramUtils.getMaterialUniformLocations(program, 'u_material');	
};

GG.PhongPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var viewMat = ctx.camera.getViewMatrix();

	var MV = mat4.create();
	mat4.multiply(viewMat, renderable.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.u_matModelView, false, MV);

	var NM = mat4.create();
	mat4.inverse(MV, NM);
	mat4.transpose(NM);
	gl.uniformMatrix3fv(program.u_matNormals, false, mat4.toMat3(NM));

	GG.ProgramUtils.setMaterialUniforms(program, 'u_material', renderable.material);
	GG.ProgramUtils.setLightsUniform(program, viewMat, 'u_pointLights', ctx.scene.listPointLights());
	GG.ProgramUtils.setLightsUniform(program, viewMat, 'u_directionalLights', ctx.scene.listDirectionalLights());
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
			"	v_normal = u_matNormals * a_normal;",
			"	v_viewVector = -viewPos.xyz; //(u_matInverseView * vec4(0.0, 0.0, 0.0, 1.0) - viewPos).xyz;",		
			"	v_viewPos = viewPos;"
			].join('\n'));
	this.vertexShader = pg;

	var pg = new GG.ProgramSource();
	pg.asFragmentShader()
		.varying('vec3', 'v_normal')
		.varying('vec4', 'v_viewPos')
		.varying('vec3', 'v_viewVector')
		.uniformViewMatrix()
		.uniformMaterial()
		.addDecl(GG.ShaderLib.phong.pointLightIrradiance)
		.addDecl(GG.ShaderLib.phong.directionalLightIrradiance)
		.addDecl(GG.ShaderLib.phong.spotLightIrradiance)
		.addMainInitBlock([
			"	vec3 N = normalize(v_normal);",
			"	vec3 V = normalize(v_viewVector);",		
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);",
			"	vec3 L;"
		].join('\n'));
		
	pg.perPointLightBlock([		
		"	L = normalize(u_matView*vec4(u_pointLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	pointLightIrradiance(N, V, L, u_pointLights[INDEX], u_material, diffuse, specular);"
		].join("\n")
	);
	
	pg.perDirectionalLightBlock([		
		"	L = normalize(u_matView*vec4(u_directionalLights[INDEX].direction, 0.0)).xyz;",
		"	directionalLightIrradiance(N, V, L, u_directionalLights[INDEX], u_material, diffuse, specular);",
		].join("\n")
	);

	pg.perSpotLightBlock([		
		"	L = normalize(u_matView*vec4(u_spotLights[INDEX].direction, 0.0)).xyz;",
		"	spotLightIrradiance(N, V, L, u_spotLights[INDEX], u_material, diffuse, specular);",
		].join("\n")
	);

	pg.addMainBlock([
		"	gl_FragColor = vec4(u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular, 1.0);",
		"	gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(0.5));"
		].join('\n'));
	this.fragmentShader = pg;	
};

GG.PhongPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	/*
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CW);
	gl.enable(gl.CULL_FACE);
	*/
};