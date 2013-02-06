GG.BillboardingTechnique = function (spec) {
	spec        = spec || {};
	spec.passes = [ new GG.BillboardingTechnique.Pass() ];
	GG.BaseTechnique.call(this, spec);
};

GG.BillboardingTechnique.prototype             = new GG.BaseTechnique();
GG.BillboardingTechnique.prototype.constructor = GG.BillboardingTechnique;

GG.BillboardingTechnique.Pass = function (spec) {
	GG.AdaptiveRenderPass.call(this, spec);
	this.diffuseTexturingPass = new GG.DiffuseTextureStackEmbeddableRenderPass();
};

GG.BillboardingTechnique.Pass.prototype             = new GG.AdaptiveRenderPass();
GG.BillboardingTechnique.Pass.prototype.constructor = GG.BillboardingTechnique.Pass;

GG.BillboardingTechnique.Pass.prototype.createShadersForMaterial = function (material, renderContext) {
	var vs = new GG.ProgramSource();
	vs.position()
		.texCoord0()
		.uniformModelMatrix()
		.uniformViewMatrix()
		.uniformProjectionMatrix()		
		.uniform('float', 'u_width')
		.uniform('float', 'u_height')	
		.uniform('float', 'u_isSpherical')	
		.uniform('vec3', GG.Naming.UniformCameraWorldPos)		
		.varying('vec2', 'v_texCoords')		
		.addDecl('rotateAroundAxis', GG.ShaderLib.rotateAroundAxis)
		.addDecl('matRotateX', GG.ShaderLib.matRotateX)
		.addDecl('cylindricalBillboard', [		
			"mat4 cylindricalBillboard(vec3 pos, vec3 cameraPos) {"	,
			"	vec3 forward = vec3(0, 0, 1);",			
			"	vec3 lookAt = cameraPos - pos;",			
			"	lookAt = normalize(vec3(lookAt.x, 0.0, lookAt.z));",
			"	float angle = acos(dot(forward, lookAt));",
			"	vec3 up = normalize(cross(forward, lookAt));",
			"	mat3 rot = rotateAroundAxis(angle, up);",
			"	return mat4(",
			"		vec4(rot[0], 0.0), ",
			"		vec4(rot[1], 0.0), ",
			"		vec4(rot[2], 0.0), ",
			"		vec4(pos, 1.0)",
			"	);",			
			"}"
		].join('\n'))
		.addDecl('sphericalBillboard', [		
			"mat4 sphericalBillboard(vec3 pos) {"	,
			"	mat3 totalRotation = mat3(u_matView[0][0], u_matView[1][0], u_matView[2][0], ",
			"		u_matView[0][1], u_matView[1][1], u_matView[2][1], ",
			"		u_matView[0][2], u_matView[1][2], u_matView[2][2]);",
			/*
			"	vec3 forward = vec3(0, 0, 1);",			
			"	vec3 right = vec3(-1.0, 0.0, 0.0);",
			"	vec3 lookAt = cameraPos - pos;",			
			"	vec3 lookAtXZ = normalize(vec3(lookAt.x, 0.0, lookAt.z));",

			"	float angleY = acos(dot(forward, lookAtXZ));",
			"	vec3 up = normalize(cross(forward, lookAtXZ));",
			"	mat3 rotY = rotateAroundAxis(angleY, up);",
			
			"	float angleX = sign(lookAt[1]) * acos(dot(normalize(lookAt), lookAtXZ));",		
			"	mat3 rotX = matRotateX(angleX);",
			"	mat3 totalRotation = rotY * rotX;",			
			*/
			"	return mat4(",
			"		vec4(totalRotation[0], 0.0), ",
			"		vec4(totalRotation[1], 0.0), ",
			"		vec4(totalRotation[2], 0.0), ",
			"		vec4(pos, 1.0)",
			"	);",
			"}"
		].join('\n'))
		.addMainBlock([						
			"mat4 matBillboard = (u_isSpherical > 0.0) ? sphericalBillboard(u_matModel[3].xyz) : cylindricalBillboard(u_matModel[3].xyz, u_wCameraPos);",
			"v_texCoords = a_texCoords;",
			"gl_Position = u_matProjection * u_matView * matBillboard * vec4(u_width*a_position.x, u_height*a_position.y, a_position.z, 1.0);"	
		].join('\n'));

	var fs = new GG.ProgramSource();
	fs.asFragmentShader()
		.uniformMaterial()
		.varying('vec2', 'v_texCoords')
		.declareFinalColorOutput()
		.addMainInitBlock("   vec4 " + GG.Naming.VarDiffuseBaseColor + " = vec4(u_material.diffuse, 1.0);")		
		.writeOutput(
            "	gl_FragColor = vec4(baseColor);"                  
			);

	if (material != null) {
		this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material, renderContext);
	}

	this.vertexShader   = vs.toString();
	this.fragmentShader = fs.toString();
};

GG.BillboardingTechnique.Pass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform1f(program.u_width, renderable.width);
	gl.uniform1f(program.u_height, renderable.height);
	gl.uniform1f(program.u_isSpherical, renderable.billboardType == GG.Billboard.SPHERICAL_BILLBOARD ? 1.0 : 0.0);
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
};

GG.BillboardingTechnique.Pass.prototype.hashMaterial = function (material, renderContext) {
	return this.diffuseTexturingPass.hashMaterial(material, renderContext);
};


GG.BillboardingTechnique.Pass.prototype.__setCustomRenderState = function(renderable, ctx, program) {	
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);
};