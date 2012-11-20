GG.TextureStackTechnique = function (spec) {
	spec = spec || {};
	spec.passes = [new GG.TextureStackPass()];
	GG.BaseTechnique.call(this, spec);
};

GG.TextureStackTechnique.prototype = new GG.BaseTechnique();
GG.TextureStackTechnique.prototype.constructor = GG.TextureStackTechnique;

GG.TextureStackPass = function (spec) {
	GG.AdaptiveRenderPass.call(this, spec);
};

GG.TextureStackPass.prototype             = new GG.AdaptiveRenderPass();
GG.TextureStackPass.prototype.constructor = GG.TextureStackPass;

GG.TextureStackPass.prototype.supportedRenderAttributesMask = function () {
	return GG.BaseMaterial.BIT_DIFFUSE_MAP;
};

GG.TextureStackPass.prototype.hashMaterial = function(material) {
	var size = material.diffuseTextureStack.size();
	hash = size.toString();
	for (var i = 0; i < size; i++) {
		var entry = material.diffuseTextureStack.getAt(i);
		hash += entry.texture != null;
		hash += entry.blendMode;
	}
	return hash;
};

GG.TextureStackPass.prototype.createShadersForMaterial = function (material) {
	var pg = new GG.ProgramSource();
	pg.position()
		.texCoord0()
  		.uniformModelViewMatrix()  		
		.uniformProjectionMatrix()
		.varying('vec2', 'v_texCoords')
		.addMainBlock([
			"	gl_Position = u_matProjection*u_matModelView*a_position;",
			"	v_texCoords = a_texCoords;"
			].join('\n'));
	this.vertexShader = pg.toString();

	pg = new GG.ProgramSource();
	pg.asFragmentShader()	
		.varying('vec2', 'v_texCoords')
		.uniformMaterial()
		.addMainBlock([
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);"
		].join('\n'));

	if (material.diffuseTextureStack != null) {
		this.evaluateTextureStack(pg, material.diffuseTextureStack)
		//pg.uniform("sampler2D", "u_diffuseMap");
		//pg.addMainBlock("diffuse = texture2D(u_diffuseMap, v_texCoords).rgb;");
	}

	pg.addMainBlock("	gl_FragColor = vec4(/*u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular*/diffuse, 1.0);");	
	this.fragmentShader = pg.toString();	
};

GG.TextureStackPass.prototype.evaluateTextureStack = function(programSource, textureStack) {
	if (!textureStack.isEmpty()) {
		var codeListing = [];
		for (var i = 0; i < textureStack.size(); i++) {			
			this.defineUniformForDiffuseMapAtIndex(index);
			this.sampleDiffuseMapAtIndex(index, codeListing);
			this.blendDiffuseMapAtIndex(index, textureStack, codeListing);
		}
		codeListing.push("diffuse = " + this.getDiffuseVarNameForIndex(textureStack.size() - 1) + ".rgb");		
		programSource.addMainBlock(codeListing.join('\n'));
	}
};

GG.TextureStackPass.prototype.defineUniformForDiffuseMapAtIndex = function (index, programSource) {
	var uniformName = this.getUniformDiffuseMapNameForIndex(i);
	programSource.uniform("sampler2D", uniformName);			
};

GG.TextureStackPass.prototype.sampleDiffuseMapAtIndex = function (index, codeListing) {
	var colorVar = this.getDiffuseVarNameForIndex(i);		
	var uniformName = this.getUniformDiffuseMapNameForIndex(i);	
	codeListing.push("float3 " + colorVar + " = texture2D(" + uniformName + ", v_texCoords).rgb;");								
};

GG.TextureStackPass.prototype.blendDiffuseMapAtIndex = function (index, textureStack, codeListing) {
	if (index > 0) {
		codeListing.push(
			this.emitBlendTextureCode(this.getDiffuseVarNameForIndex(index - 1), colorVar, textureStack.get(index).blendMode)
		);
	}
};

GG.TextureStackPass.prototype.getUniformDiffuseMapNameForIndex = function (index) {
	return "u_diffuseMap_" + index;
};

GG.TextureStackPass.prototype.getDiffuseVarNameForIndex = function (index) {
	return "diffuseMap_" + index;
};

GG.TextureStackPass.prototype.emitBlendTextureCode = function (baseMap, sourceMap, blendMode) {
	switch (blendMode) {
		case GG.BLEND_MODE_MULTIPLY:
			return GG.ShaderLib.blendModeMultiply;
		case GG.BLEND_ADD:
			return GG.ShaderLib.blendModeAdd;
		case GG.BLEND_SUBTRACT:
			return GG.ShaderLib.blendModeSubtract;
		default:
			return "// Unknown blend mode: " + blendMode;
	}
};

GG.TextureStackPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var diffuseMap = renderable.getMaterial().diffuseMap;
	if (diffuseMap) {
		gl.uniform1i(program.u_diffuseMap, diffuseMap);
	}	
};

GG.TextureStackPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	var diffuseMap = renderable.getMaterial().diffuseMap;
	if (diffuseMap) {
		diffuseMap.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAP);	
	}
};
