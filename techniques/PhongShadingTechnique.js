GG.PhongShadingTechnique = function(spec) {
	spec        = spec || {};
	spec.passes = [new GG.PhongPass()];

	GG.BaseTechnique.call(this, spec);
};

GG.PhongShadingTechnique.prototype             = new GG.BaseTechnique();
GG.PhongShadingTechnique.prototype.constructor = GG.PhongShadingTechnique;

GG.PhongPass = function(spec) {	
	GG.RenderPass.call(this, spec);
	this.diffuseTexturingPass = new GG.DiffuseTextureStackEmbeddableRenderPass();
	this.specularMapPass      = new GG.SpecularMappingEmbeddableTechnique();
	this.alphaMapPass         = new GG.AlphaMappingEmbeddableRenderPass();
	this.normalMapPass        = new GG.NormalMappingEmbeddableRenderPass();
	this.fogPass			  = new GG.FogEmbeddableRenderPass();
	this.createProgram(null);	
};

GG.PhongPass.prototype             = new GG.AdaptiveRenderPass();
GG.PhongPass.prototype.constructor = GG.PhongPass;

GG.PhongPass.prototype.createProgram = function(material, renderContext) {
	var vs = new GG.ProgramSource();
	vs.position()
		.normal()
  		.uniformModelViewMatrix()
  		.uniformNormalsMatrix()
  		.uniformViewMatrix()
		.uniformProjectionMatrix()
		.uniformLight()
		.texCoord0()
		.varying('vec3', 'v_normal')
		.varying('vec3', 'v_lightVec')
		.varying('vec3', 'v_viewVec')
		.varying('vec2', 'v_texCoords')		
		.varying('float', GG.Naming.VaryingSpotlightCos)
		.addDecl('blocks.getWorldLightVector', GG.ShaderLib.blocks.getWorldLightVector)
		.addMainBlock([
			"	vec4 viewPos = u_matModelView*a_position;",
			"	gl_Position = u_matProjection*viewPos;",
			"	gl_Position.z -= 0.0001;",

			// If the preprocessor directive is not defined then varyings are calculate in view space
			// otherwise varyings will be calculated in tangent space by the normal mapping technique            
            "#ifndef " + GG.Naming.DefUseTangentSpace,                        
			"	v_normal = u_matNormals * a_normal;",
			"   vec3 wlightVec = getWorldLightVector(a_position.xyz);",
			"	v_lightVec = (u_matView*vec4(wlightVec, 0.0)).xyz;",
			"	v_lightVec = normalize(v_lightVec);",			
			"	v_viewVec = -normalize(viewPos.xyz);",			
            "#endif",
			"	v_texCoords = a_texCoords;"
			].join('\n'));	

	var fs = new GG.ProgramSource();
	fs.asFragmentShader()
		.uniformViewMatrix()
		.uniformLight()
		.uniformMaterial()
		.varying('vec3', 'v_normal')
		.varying('vec3', 'v_lightVec')
		.varying('vec3', 'v_viewVec')
		.varying('vec2', 'v_texCoords')
		.varying('float', GG.Naming.VaryingSpotlightCos)		
		.addDecl('phong.lightIrradiance', GG.ShaderLib.phong.lightIrradiance)
		.declareAlphaOutput()
		.declareFinalColorOutput()
		.addMainInitBlock([
            "#ifdef " + GG.Naming.DefUseTangentSpace,
            "   vec3 N = sampleNormalMap();",
            "#else",
			"	vec3 N = normalize(v_normal);",
            "#endif",
			"	vec3 V = normalize(v_viewVec);",
			"	vec3 L = normalize(v_lightVec);",
			"	vec3 diffuse = vec3(0.0);",
			"   vec3 " + GG.Naming.VarDiffuseBaseColor + " = u_material.diffuse;",
			"	vec3 specular = vec3(0.0);"
			].join('\n'))
		.addMainBlock([						
			"	lightIrradiance(N, V, L, u_light, u_material, diffuse, specular);"			
		].join('\n'))
		.addFinalColorAssignment(
			"finalColor = vec3(u_material.ambient + baseColor*diffuse + u_material.specular*specular);"
			)
		.writeOutput(
            "	gl_FragColor = vec4(finalColor, " + GG.Naming.VarAlphaOutput + ");"                  
			);
    
	if (material != null) {
		this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material, renderContext);
		this.specularMapPass.adaptShadersToMaterial(vs, fs, material, renderContext);
        this.alphaMapPass.adaptShadersToMaterial(vs, fs, material, renderContext);
        this.normalMapPass.adaptShadersToMaterial(vs, fs, material, renderContext);
        this.fogPass.adaptShadersToMaterial(vs, fs, material, renderContext);
	}

	vs.addMainBlock([
		"	if (u_light.type == 3.0) {",
		"		v_spotlightCos =  dot(-v_lightVec, normalize(u_light.direction));",
		"	}",
		].join('\n'))

	this.vertexShader   = vs.toString();
	this.fragmentShader = fs.toString();	
};

GG.PhongPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);
	GG.ProgramUtils.setLightsUniform(program, GG.Naming.UniformLight, ctx.light);
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
	this.specularMapPass.__setCustomUniforms(renderable, ctx, program);
    this.alphaMapPass.__setCustomUniforms(renderable, ctx, program);
    this.normalMapPass.__setCustomUniforms(renderable, ctx, program);
    this.fogPass.__setCustomUniforms(renderable, ctx, program);
};

GG.PhongPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);
	this.specularMapPass.__setCustomRenderState(renderable, ctx, program);
    this.alphaMapPass.__setCustomRenderState(renderable, ctx, program);
    this.normalMapPass.__setCustomRenderState(renderable, ctx, program);
    this.fogPass.__setCustomRenderState(renderable, ctx, program);
};

GG.PhongPass.prototype.createShadersForMaterial = function (material, renderContext) {
	this.createProgram(material, renderContext);
};

GG.PhongPass.prototype.hashMaterial = function (material, renderContext) {
	return this.diffuseTexturingPass.hashMaterial(material, renderContext)
        + this.specularMapPass.hashMaterial(material, renderContext)
        + this.alphaMapPass.hashMaterial(material, renderContext)
        + this.normalMapPass.hashMaterial(material, renderContext)
        + this.fogPass.hashMaterial(material, renderContext);
};