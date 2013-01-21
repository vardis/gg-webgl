/**
 * precision
 * extensions
 * defines
 * attributes
 * uniforms
 * varyings
 * declarations
 * main {
 *	main init
 *  texturing affecting the diffuse, specular or N variables
 *	main lighting
 *		per point light
 *		per directional light
 *		per spot light
 *	main blocks
 *  final color assignment
 *  fog
 *	post process
 *	write output
 * } 
 *
 * Fragment shader variable names by convention:
 * 	N - the normalized normal
 *	L - the light vector
 *	V - the view vector
 *	diffuse - the final diffuse color
 *	specular - the final specular color
 *  color - the final shaded color
 *
 * Varying names by convention
 *	v_viewPos - the view position of the vertex
 *	v_viewVector - the view vector
 *	v_normal - the interpolated normal
 */
GG.ProgramSource = function (spec) {
	this.shaderType             = 'vertex';
	this.fpPrecision            = 'highp';
    this.extensions             = {};
    this.preprocessorDefs       = [];
	this.typeDeclarations       = {};
	this.declarations           = {};
	this.uniforms               = {};
	this.attributes             = {};
	this.varyings               = {};
	this.mainInit               = [];	
	this.mainBlocks             = [];
	this.texturingBlocks        = [];
	this.pointLightBlocks       = [];
	this.directionalLightBlocks = [];
	this.spotLightBlocks        = [];
	this.fogBlocks              = [];
	this.postProcessBlocks      = [];
	this.finalColorAssignment   = [];
	this.finalOutput            = "";
};

GG.ProgramSource.prototype.asVertexShader = function() {
	this.shaderType = 'vertex';
	return this;
};

GG.ProgramSource.prototype.asFragmentShader = function() {
	this.shaderType = 'fragment';
	return this;
};

GG.ProgramSource.prototype.floatPrecision = function(value) {
	this.fpPrecision = value;
	return this;
};

GG.ProgramSource.prototype.enableExtension = function(name) {
    this.extensions[name] = true;
    return this;
};

GG.ProgramSource.prototype.disableExtension = function(name) {
    this.extensions[name] = false;
    return this;
};

GG.ProgramSource.prototype.attribute = function(type, name) {
	this.attributes[name] = type;
	return this;
};

GG.ProgramSource.prototype.uniform = function(type, name) {
	this.uniforms[name] = type;
	return this;
};

GG.ProgramSource.prototype.varying = function(type, name) {
	this.varyings[name] = type;
	return this;
};

GG.ProgramSource.prototype.hasUniform = function(name) {
	return name in this.uniforms;
};

GG.ProgramSource.prototype.uniformLight = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_light");
	return this;
};

GG.ProgramSource.prototype.uniformPointLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_pointLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformSpotLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_spotLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformDirectionalLights = function() {
	this.addTypeDecl(GG.ShaderLib.blocks['lightInfoStructure'], 'LightInfo');	
	this.uniform('LightInfo', "u_directionalLights[2]");
	return this;
};

GG.ProgramSource.prototype.uniformMaterial = function(uniformName) {
	this.addTypeDecl(GG.ShaderLib.blocks['materialInfoStructure'], 'MaterialStruct');	
	var name = uniformName != undefined ? uniformName : 'u_material';
	this.uniform('Material_t', name);
	return this;
};

GG.ProgramSource.prototype.uniformTexUnit = function(uniformName) {
	this.addTypeDecl(GG.ShaderLib.blocks.textureUnitParams, 'textureUnitParams');
	this.uniform('TexUnitParams_t', uniformName);
    this.uniform('sampler2D', GG.Naming.textureUnitUniformMap(uniformName))
	return this;
};

GG.ProgramSource.prototype.preprocessorDefinition = function(name) {
    this.preprocessorDefs.push(name);
    return this;
};

GG.ProgramSource.prototype.addDecl = function(name, block) {
	this.declarations[name] = block;
	return this;
};

GG.ProgramSource.prototype.addTypeDecl = function(block, name) {
	this.typeDeclarations[name] = block;
	return this;
};

GG.ProgramSource.prototype.addMainInitBlock = function(block, name) {
	this.mainInit.push({
		'name' : name != undefined ? name : 'block_' + this.mainInit.length,
		'code' : block,
		'order' : this.mainInit.length
	});
	return this;
};

GG.ProgramSource.prototype.addMainBlock = function(block, name) {
	this.mainBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.mainBlocks.length,
		'code' : block,
		'order' : this.mainBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.addTexturingBlock = function(block, name) {
	this.texturingBlocks.push({
		'name' : name != undefined ? name : 'tex_block_' + this.texturingBlocks.length,
		'code' : block,
		'order' : this.texturingBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.addPostProcessBlock = function(block, name) {
	this.postProcessBlocks.push({
		'name' : name != undefined ? name : 'postprocess_block_' + this.postProcessBlocks.length,
		'code' : block,
		'order' : this.postProcessBlocks.length
	});
	return this;
};


GG.ProgramSource.prototype.perPointLightBlock = function (block, name) {
	this.pointLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.pointLightBlocks.length,
		'code' : block,
		'order' : this.pointLightBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.perDirectionalLightBlock = function (block, name) {
	this.directionalLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.directionalLightBlocks.length,
		'code' : block,
		'order' : this.directionalLightBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.perSpotLightBlock = function (block, name) {
	this.spotLightBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.spotLightBlocks.length,
		'code' : block,
		'order' : this.spotLightBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.addFinalColorAssignment = function (block, name) {
	this.finalColorAssignment.push({
		'name' : name != undefined ? name : 'block_' + this.finalColorAssignment.length,
		'code' : block,
		'order' : this.finalColorAssignment.length
	});
	return this;
};

GG.ProgramSource.prototype.addFogBlock = function (block, name) {
	this.fogBlocks.push({
		'name' : name != undefined ? name : 'block_' + this.fogBlocks.length,
		'code' : block,
		'order' : this.fogBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.position = function() {
	this.attribute('vec4', GG.GLSLProgram.BuiltInAttributes.attribPosition);
	return this;
};

GG.ProgramSource.prototype.normal = function() {
	this.attribute('vec3', GG.Naming.AttributeNormal);
	return this;
};

GG.ProgramSource.prototype.texCoord0 = function() {
	this.attribute('vec2', GG.GLSLProgram.BuiltInAttributes.attribTexCoords);
	return this;
};

GG.ProgramSource.prototype.tangent = function() {
    this.attribute('vec3', GG.GLSLProgram.BuiltInAttributes.attribTangent);
    return this;
};

GG.ProgramSource.prototype.color = function() {
	this.attribute('vec3', GG.GLSLProgram.BuiltInAttributes.attribColor);
	return this;
};

GG.ProgramSource.prototype.uniformModelMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformModelMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformViewMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformModelViewMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformModelViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformProjectionMatrix = function() {
	this.uniform('mat4', GG.Naming.UniformProjectionMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformNormalsMatrix = function() {
	this.uniform('mat3', GG.Naming.UniformNormalMatrix);
	return this;
};

GG.ProgramSource.prototype.declareFinalColorOutput = function() {
    this.addMainInitBlock('vec3 ' + GG.Naming.VarColorOutput + " = vec3(0.0);");
    return this;
};

GG.ProgramSource.prototype.declareAlphaOutput = function() {
    this.addMainInitBlock('float ' + GG.Naming.VarAlphaOutput + " = 1.0;");
    return this;
};

GG.ProgramSource.prototype.writeOutput = function(s) {
	this.finalOutput = s;
	return this;
};

GG.ProgramSource.textureSampling = function (textureUnitName, texCoordsAttributeName) {
	return "sampleTexUnit(" + GG.Naming.textureUnitUniformMap(textureUnitName) + ", " + textureUnitName + ", " + texCoordsAttributeName + ")";
};

GG.ProgramSource.prototype.toString = function() {
	var glsl = '';

	if (this.shaderType == 'fragment') {
		glsl += 'precision ' + this.fpPrecision + ' float;\n';
	} 

    for ( k in this.extensions) {
        glsl += '#extension ' + k + " : " + (this.extensions[k] ? 'enable' : 'disable') + '\n';
    }

    for (var i = 0; i < this.preprocessorDefs.length; i++) {
        glsl += '#define ' + this.preprocessorDefs[i] + ' 1\n';
    }
	glsl += '// Begin - Attributes\n';
	for (var attr in this.attributes) {
		glsl += 'attribute ' + this.attributes[attr] + ' ' + attr + ';\n';
	}
	glsl += '// End - Attributes\n\n';

	glsl += '// Begin - Type Declarations\n';
	for (var i = 0; i < this.typeDeclarations.length; i++) {
		glsl += this.typeDeclarations[i].code + '\n';
	}
	for (var t in this.typeDeclarations) {
		glsl += '// ' + t + '\n';
		glsl += this.typeDeclarations[t] + '\n';
	}
	glsl += '// End - Type Declarations\n\n';

	glsl += '// Begin - Uniforms\n';
	for (var u in this.uniforms) {
		glsl += 'uniform ' + this.uniforms[u] + ' ' + u + ';\n';
	}
	glsl += '// End - Uniforms\n\n';

	glsl += '// Begin - Varyings\n';
	for (var v in this.varyings) {
		glsl += 'varying ' + this.varyings[v] + ' ' + v + ';\n';
	}
	glsl += '// End - Varyings\n\n';

	glsl += '// Begin - Declarations\n';
	for (var decl in this.declarations) {
		glsl += this.declarations[decl] + '\n';
    }
    glsl += '// End - Declarations\n\n';

	glsl += 'void main() { // begin main\n';

	glsl += '// Begin - Main Init\n';
	for (var i = 0; i < this.mainInit.length; i++) {
		glsl += this.mainInit[i].code + '\n';
    }
    glsl += '// End - Main Init\n\n';

	glsl += '// Begin - Texturing\n';
	for (var i = 0; i < this.texturingBlocks.length; i++) {
		glsl += this.texturingBlocks[i].code + '\n';
    }
    glsl += '// End - Texturing\n\n';

	// Shading
	for (var i = 0; i < this.pointLightBlocks.length; i++) {
		glsl += this.pointLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}
	for (var i = 0; i < this.directionalLightBlocks.length; i++) {
		glsl += this.directionalLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}
	for (var i = 0; i < this.spotLightBlocks.length; i++) {
		glsl += this.spotLightBlocks[i].code.replace(/INDEX/g, i) + '\n';
	}

	for (var i = 0; i < this.mainBlocks.length; i++) {
		glsl += this.mainBlocks[i].code + '\n';
    }

	glsl += this.emitBlocks(this.finalColorAssignment);	
    glsl += this.emitBlocks(this.fogBlocks);	

    for (var i = 0; i < this.postProcessBlocks.length; i++) {
		glsl += this.postProcessBlocks[i].code + '\n';
    }
    glsl += this.finalOutput;

	glsl += '\n} // end main \n';

	return glsl;
};

GG.ProgramSource.prototype.emitBlocks = function (blocks) {
	var codeBlock = "";
	for (var i = 0; i < blocks.length; i++) {
		codeBlock += blocks[i].code + '\n';
    }
    return codeBlock;
}
