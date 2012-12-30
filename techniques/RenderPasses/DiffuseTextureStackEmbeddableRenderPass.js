/**
 * Prerequisites:
 *	a) v_texCoords[0..N]: a varying passing each of the uv coordinates per fragment.
 *  b) a 'diffuse' variable already declared and used for calculating the diffuse component.
 *  c) __setCustomUniforms must be called
 *  d) __setCustomRenderState must be called
 */
GG.DiffuseTextureStackEmbeddableRenderPass = function (spec) {	
	GG.EmbeddableAdaptiveRenderPass.call(this, spec);
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.DiffuseTextureStackEmbeddableRenderPass.prototype.constructor = GG.DiffuseTextureStackEmbeddableRenderPass;

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material) {
	if (!material.diffuseTextureStack.isEmpty()) {
		fragmentShader.addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit);
		this.evaluateTextureStack(fragmentShader, material.diffuseTextureStack);
	}
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.hashMaterial = function (material) {	
	return material.diffuseTextureStack.hashCode();
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.evaluateTextureStack = function(programSource, textureStack) {	
	var codeListing = [];
	var stackLen = textureStack.size();
	for (var i = 0; i < stackLen; i++) {			
		var uniformName = this.getUniformNameForTexUnit(i);
		programSource.uniformTexUnit(uniformName);

		codeListing.push(this.sampleDiffuseMapAtIndex(i, uniformName));
		codeListing.push(this.blendDiffuseMapAtIndex(i, textureStack.getAt(i).blendMode, programSource));		
	}
	codeListing.push(GG.Naming.VarDiffuseBaseColor + "	= " + this.getSampleVariableNameForMap(stackLen - 1) + ".rgb;");		
	programSource.addTexturingBlock(codeListing.join('\n'));
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.sampleDiffuseMapAtIndex = function (index, uniformName) {
	var colorVar = this.getSampleVariableNameForMap(index);		
	return "	vec3 " + colorVar + " = sampleTexUnit("
        + GG.Naming.textureUnitUniformMap(uniformName) + ", " + uniformName + ", v_texCoords).rgb;";
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.blendDiffuseMapAtIndex = function (index, blendMode, programSource) {
	var sourceColorVar = this.getSampleVariableNameForMap(index);		
	var destColorVar = index > 0 ? this.getSampleVariableNameForMap(index - 1) : GG.Naming.VarDiffuseBaseColor;
	var func = this.declareBlendingFunction(blendMode, programSource);	
	if (func != null) {
		return sourceColorVar + " = " + func + "(" + destColorVar + ", " + sourceColorVar + ");";
	} else {
		return "";
	}	
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.getUniformNameForTexUnit = function (index) {
	return "u_diffuseMap_" + index;
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.getSampleVariableNameForMap = function (index) {
	return "diffuseMap_" + index;
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.declareBlendingFunction = function (blendMode, programSource) {
	var fun = null;
	switch (blendMode) {
		case GG.BLEND_MULTIPLY:
			programSource.addDecl('blendModeMultiply', GG.ShaderLib.blendModeMultiply);
			fun = 'blendModeMultiply';
			break;
		case GG.BLEND_ADD:
			programSource.addDecl('blendModeAdd', GG.ShaderLib.blendModeAdd);
			fun = 'blendModeAdd';
			break;
		case GG.BLEND_SUBTRACT:
			programSource.addDecl('blendModeSubtract', GG.ShaderLib.blendModeSubtract);
			fun = 'blendModeSubtract';
			break;
		case GG.BLEND_LIGHTEN:
			programSource.addDecl('blendModeLighten', GG.ShaderLib.blendModeLighten);
			fun = 'blendModeLighten';
			break;
		case GG.BLEND_COLOR_BURN:
			programSource.addDecl('blendModeColorBurn', GG.ShaderLib.blendModeColorBurn);
			fun = 'blendModeColorBurn';
			break;
		case GG.BLEND_LINEAR_BURN:
			programSource.addDecl('blendModeLinearBurn', GG.ShaderLib.blendModeLinearBurn);
			fun = 'blendModeLinearBurn';
			break;
		case GG.BLEND_DARKEN:
			programSource.addDecl('blendModeDarken', GG.ShaderLib.blendModeDarken);
			fun = 'blendModeDarken';
			break;
		case GG.BLEND_SCREEN:
			programSource.addDecl('blendModeScreen', GG.ShaderLib.blendModeScreen);
			fun = 'blendModeScreen';
			break;
		case GG.BLEND_COLOR_DODGE:
			programSource.addDecl('blendModeColorDodge', GG.ShaderLib.blendModeColorDodge);
			fun = 'blendModeColorDodge';
			break;
		default:
			return "// Unknown blend mode: " + blendMode;
	}
	return fun;
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		var uniformName = this.getUniformNameForTexUnit(i);
		var unit = textureStack.getAt(i);
		GG.ProgramUtils.setTexUnitUniforms(program, uniformName, unit);
	}
};

GG.DiffuseTextureStackEmbeddableRenderPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	var textureStack = renderable.material.diffuseTextureStack;
	for (var i = 0; i < textureStack.size(); i++) {
		textureStack.getAt(i).bind();
	}
};