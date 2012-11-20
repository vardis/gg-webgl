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
	return material.diffuseTextureStack.hashCode();
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
		.uniform('vec4', 'u_uvScaleOffset')
		.addMainBlock([
			"	vec3 diffuse = vec3(0.0);",
			"	vec3 specular = vec3(0.0);"
		].join('\n'));

	if (material.diffuseTextureStack != null) {
		this.evaluateTextureStack(pg, material.diffuseTextureStack)
	}

	pg.addMainBlock("	gl_FragColor = vec4(/*u_material.ambient + u_material.diffuse*diffuse + u_material.specular*specular*/diffuse, 1.0);");	
	this.fragmentShader = pg.toString();	
};

GG.TextureStackPass.prototype.evaluateTextureStack = function(programSource, textureStack) {
	if (!textureStack.isEmpty()) {
		var codeListing = [];
		for (var i = 0; i < textureStack.size(); i++) {			
			this.defineUniformsForDiffuseMapAtIndex(i, programSource);
			this.sampleDiffuseMapAtIndex(i, codeListing);
			this.blendDiffuseMapAtIndex(i, textureStack.getAt(i).blendMode, programSource, codeListing);
		}
		codeListing.push("diffuse = " + this.getVariableNameForDiffuseMapAtIndex(textureStack.size() - 1) + ".rgb;");		
		programSource.addMainBlock(codeListing.join('\n'));
	}
};

GG.TextureStackPass.prototype.defineUniformsForDiffuseMapAtIndex = function (index, programSource) {
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);
	programSource.uniform("sampler2D", uniformName);

	var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(index);
	programSource.uniform("vec4", scaleOffsetUniformName);
};

GG.TextureStackPass.prototype.sampleDiffuseMapAtIndex = function (index, codeListing) {
	var colorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);	
	var scaleOffset = this.getUniformNameForUvScaleOffset(index);
	codeListing.push("vec3 " + colorVar + " = texture2D(" + uniformName + ", " + scaleOffset + ".zw + (" + scaleOffset + ".xy * v_texCoords)).rgb;");								
};

GG.TextureStackPass.prototype.blendDiffuseMapAtIndex = function (index, blendMode, programSource, codeListing) {
	if (index > 0) {
		var sourceColorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
		var destColorVar = this.getVariableNameForDiffuseMapAtIndex(index - 1);
		this.emitBlendTextureCode(destColorVar, sourceColorVar, blendMode, programSource, codeListing);		
	}
};

GG.TextureStackPass.prototype.getUniformNameForUvScaleOffset = function (index) {
	return "u_uvScaleOffset_" + index;
};

GG.TextureStackPass.prototype.getUniformNameForDiffuseMapAtIndex = function (index) {
	return "u_diffuseMap_" + index;
};

GG.TextureStackPass.prototype.getVariableNameForDiffuseMapAtIndex = function (index) {
	return "diffuseMap_" + index;
};

GG.TextureStackPass.prototype.declareBlendingFunction = function (blendMode, programSource) {
	var fun = null;
	switch (blendMode) {
		case GG.BLEND_MULTIPLY:
			programSource.addDecl(GG.ShaderLib.blendModeMultiply);
			fun = 'blendModeMultiply';
			break;
		case GG.BLEND_ADD:
			programSource.addDecl(GG.ShaderLib.blendModeAdd);			
			fun = 'blendModeAdd';
			break;
		case GG.BLEND_SUBTRACT:
			programSource.addDecl(GG.ShaderLib.blendModeSubtract);
			fun = 'blendModeSubtract';
			break;
		case GG.BLEND_LIGHTEN:
			programSource.addDecl(GG.ShaderLib.blendModeLighten);
			fun = 'blendModeLighten';
			break;
		case GG.BLEND_COLOR_BURN:
			programSource.addDecl(GG.ShaderLib.blendModeColorBurn);
			fun = 'blendModeColorBurn';
			break;
		case GG.BLEND_LINEAR_BURN:
			programSource.addDecl(GG.ShaderLib.blendModeLinearBurn);
			fun = 'blendModeLinearBurn';
			break;
		case GG.BLEND_DARKEN:
			programSource.addDecl(GG.ShaderLib.blendModeDarken);
			fun = 'blendModeDarken';
			break;
		case GG.BLEND_SCREEN:
			programSource.addDecl(GG.ShaderLib.blendModeScreen);
			fun = 'blendModeScreen';
			break;
		case GG.BLEND_COLOR_DODGE:
			programSource.addDecl(GG.ShaderLib.blendModeColorDodge);
			fun = 'blendModeColorDodge';
			break;
		default:
			return "// Unknown blend mode: " + blendMode;
	}
	return fun;
};

GG.TextureStackPass.prototype.emitBlendTextureCode = function (destColor, sourceColor, blendMode, programSource, codeListing) {
	var func = this.declareBlendingFunction(blendMode, programSource);	
	if (fun != null) {
		codeListing.push(sourceColor + " = " + fun + "(" + destColor + ", " + sourceColor + ");");
	}
};

GG.TextureStackPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		var uniform = this.getUniformNameForDiffuseMapAtIndex(i);		
		gl.uniform1i(program[uniform], GG.TEX_UNIT_DIFFUSE_MAPS[i]);

		var entry = textureStack.getAt(i);
		var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(i);
		gl.uniform4fv(program[scaleOffsetUniformName], [entry.scaleU, entry.scaleV, entry.offsetU, entry.offsetV]);
	}
};

GG.TextureStackPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		textureStack.getAt(i).texture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAPS[i]);
	}
};
