GG.DiffuseTextureStackEmbeddableTechnique = function (spec) {
	// body...
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.DiffuseTextureStackEmbeddableTechnique.prototype.constructor = GG.DiffuseTextureStackEmbeddableTechnique;

GG.DiffuseTextureStackEmbeddableTechnique.prototype.adaptShadersToMaterial = function (
	vertexShader, fragmentShader, material) {

	if (material.diffuseTextureStack == null) return;

	vertexShader
		.texCoord0()  		
		.varying('vec2', 'v_texCoords')
		.addMainBlock("	v_texCoords = a_texCoords;");
	
	fragmentShader.varying('vec2', 'v_texCoords')
		.uniformMaterial()
		.uniform('vec4', 'u_uvScaleOffset');		

	this.evaluateTextureStack(fragmentShader, material.diffuseTextureStack);
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.hashMaterial = function (material) {	
	return material.diffuseTextureStack.hashCode();
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.evaluateTextureStack = function(programSource, textureStack) {
	if (!textureStack.isEmpty()) {
		console.log("texture stack is not empty");
		var codeListing = [];
		for (var i = 0; i < textureStack.size(); i++) {			
			this.defineUniformsForDiffuseMapAtIndex(i, programSource);
			this.sampleDiffuseMapAtIndex(i, codeListing);
			this.blendDiffuseMapAtIndex(i, textureStack.getAt(i).blendMode, programSource, codeListing);
		}
		codeListing.push("diffuse = " + this.getVariableNameForDiffuseMapAtIndex(textureStack.size() - 1) + ".rgb;");		
		programSource.addTexturingBlock(codeListing.join('\n'));
	} else console.log("texture stack is  empty");
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.defineUniformsForDiffuseMapAtIndex = function (index, programSource) {
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);
	programSource.uniform("sampler2D", uniformName);

	var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(index);
	programSource.uniform("vec4", scaleOffsetUniformName);
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.sampleDiffuseMapAtIndex = function (index, codeListing) {
	var colorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
	var uniformName = this.getUniformNameForDiffuseMapAtIndex(index);	
	var scaleOffset = this.getUniformNameForUvScaleOffset(index);
	codeListing.push("vec3 " + colorVar + " = texture2D(" + uniformName + ", " + scaleOffset + ".zw + (" + scaleOffset + ".xy * v_texCoords)).rgb;");								
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.blendDiffuseMapAtIndex = function (index, blendMode, programSource, codeListing) {
	if (index > 0) {
		var sourceColorVar = this.getVariableNameForDiffuseMapAtIndex(index);		
		var destColorVar = this.getVariableNameForDiffuseMapAtIndex(index - 1);
		this.emitBlendTextureCode(destColorVar, sourceColorVar, blendMode, programSource, codeListing);		
	}
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.getUniformNameForUvScaleOffset = function (index) {
	return "u_uvScaleOffset_" + index;
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.getUniformNameForDiffuseMapAtIndex = function (index) {
	return "u_diffuseMap_" + index;
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.getVariableNameForDiffuseMapAtIndex = function (index) {
	return "diffuseMap_" + index;
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.declareBlendingFunction = function (blendMode, programSource) {
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

GG.DiffuseTextureStackEmbeddableTechnique.prototype.emitBlendTextureCode = function (destColor, sourceColor, blendMode, programSource, codeListing) {
	var func = this.declareBlendingFunction(blendMode, programSource);	
	if (fun != null) {
		codeListing.push(sourceColor + " = " + fun + "(" + destColor + ", " + sourceColor + ");");
	}
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.setCustomUniforms = function(renderable, ctx, program) {
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		var uniform = this.getUniformNameForDiffuseMapAtIndex(i);		
		gl.uniform1i(program[uniform], GG.TEX_UNIT_DIFFUSE_MAPS[i]);

		var entry = textureStack.getAt(i);
		var scaleOffsetUniformName = this.getUniformNameForUvScaleOffset(i);
		gl.uniform4fv(program[scaleOffsetUniformName], [entry.scaleU, entry.scaleV, entry.offsetU, entry.offsetV]);
	}
};

GG.DiffuseTextureStackEmbeddableTechnique.prototype.setCustomRenderState = function(renderable, ctx, program) {		
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		textureStack.getAt(i).texture.bindAtUnit(GG.TEX_UNIT_DIFFUSE_MAPS[i]);
	}
};