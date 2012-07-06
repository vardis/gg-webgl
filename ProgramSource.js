/**
 * precision
 * pragmas
 * attributes
 * uniforms
 * varyings
 * declarations
 * main {
 *	main init
 *	main lighting
 *		per point light
 *		per directional light
 *		per spot light
 *	main blocks
 *	post process
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
	this.shaderType = 'vertex';
	this.fpPrecision = 'highp';
	this.typeDeclarations = {};
	this.declarations = [];
	this.uniforms = {};
	this.attributes = {};
	this.varyings = {};
	this.mainInit = [];	
	this.mainBlocks = [];
	this.pointLightBlocks = [];
	this.directionalLightBlocks = [];
	this.spotLightBlocks = [];
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
	var name = uniformName || 'u_material';
	this.uniform('Material_t', name);
	return this;
};

GG.ProgramSource.prototype.addDecl = function(block, name) {
	this.declarations.push({
		'name' : name || 'decl_' + this.declarations.length,
		'code' : block,
		'order' : this.declarations.length
	});
	return this;
};

GG.ProgramSource.prototype.addTypeDecl = function(block, name) {
	this.typeDeclarations[name] = block;
	return this;
};

GG.ProgramSource.prototype.addMainInitBlock = function(block, name) {
	this.mainInit.push({
		'name' : name || 'block_' + this.mainInit.length,
		'code' : block,
		'order' : this.mainInit.length
	});
	return this;
};

GG.ProgramSource.prototype.addMainBlock = function(block, name) {
	this.mainBlocks.push({
		'name' : name || 'block_' + this.mainBlocks.length,
		'code' : block,
		'order' : this.mainBlocks.length
	});
	return this;
};

GG.ProgramSource.prototype.perPointLightBlock = function (block) {
	this.pointLightBlocks.push({
		'name' : name || 'block_' + this.pointLightBlocks.length,
		'code' : block,
		'order' : this.pointLightBlocks.length
	});
};

GG.ProgramSource.prototype.perDirectionalLightBlock = function (block) {
	this.directionalLightBlocks.push({
		'name' : name || 'block_' + this.directionalLightBlocks.length,
		'code' : block,
		'order' : this.directionalLightBlocks.length
	});
};

GG.ProgramSource.prototype.perSpotLightBlock = function (block) {
	this.spotLightBlocks.push({
		'name' : name || 'block_' + this.spotLightBlocks.length,
		'code' : block,
		'order' : this.spotLightBlocks.length
	});
};

GG.ProgramSource.prototype.position = function() {
	this.attribute('vec4', GG.GLSLProgram.BuiltInAttributes.attribPosition);
	return this;
};

GG.ProgramSource.prototype.normal = function() {
	this.attribute('vec3', GG.GLSLProgram.BuiltInAttributes.attribNormal);
	return this;
};

GG.ProgramSource.prototype.texCoord0 = function() {
	this.attribute('vec2', GG.GLSLProgram.BuiltInAttributes.attribTexCoords);
	return this;
};

GG.ProgramSource.prototype.color = function() {
	this.attribute('vec3', GG.GLSLProgram.BuiltInAttributes.attribColor);
	return this;
};

GG.ProgramSource.prototype.uniformModelMatrix = function() {
	this.uniform('mat4', GG.GLSLProgram.UniformModelMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformViewMatrix = function() {
	this.uniform('mat4', GG.GLSLProgram.UniformViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformModelViewMatrix = function() {
	this.uniform('mat4', GG.GLSLProgram.UniformModelViewMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformProjectionMatrix = function() {
	this.uniform('mat4', GG.GLSLProgram.UniformProjectionMatrix);
	return this;
};

GG.ProgramSource.prototype.uniformNormalsMatrix = function() {
	this.uniform('mat3', GG.GLSLProgram.UniformNormalMatrix);
	return this;
};



GG.ProgramSource.prototype.toString = function() {
	var glsl = '';

	if (this.shaderType == 'fragment') {
		glsl += 'precision ' + this.fpPrecision + ' float;\n';
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
	for (var i = 0; i < this.declarations.length; i++) {
		glsl += this.declarations[i].code + '\n';
	};
	glsl += '// End - Declarations\n\n';

	glsl += 'void main() { // begin main\n';

	glsl += '// Begin - Main Init\n';
	for (var i = 0; i < this.mainInit.length; i++) {
		glsl += this.mainInit[i].code + '\n';
	};
	glsl += '// End - Main Init\n\n';

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
	};

	glsl += '} // end main \n';

	return glsl;
};

/*
pg.attribute(GG.ATTRIB_POS).attribute(GG.ATTRIB_NOR)
  .uniform(GG.UNIFORM_VIEW_MATRIX)
  .uniform(GG.UNIFORM_MODEL_MATRIX)
  .uniform(GG.UNIFORM_PROJECTION_MATRIX)
  .varying('v_normal')
  .varying('v_viewPos')
  .main.addBlock([
  	'v_viewPos = u_matView * u_matModel * a_position',
  	'v_normal = u_matNormal * a_normal;'
  	].join('\n'));

var vertexShader = pg.toString();

var pointLights = [...];
pg.precision('mediump')
  .uniformPointLights(pointLights.length)
  .uniform(GG.UNIFORM_VIEW_MATRIX)
  .uniformMaterial('u_phongMaterial')
  .varying('v_normal')
  .varying('v_viewPos')
  .addDecl(GG.ShaderLib.blocks['directionalLightIrradiance'])
  .addMainInitBlock([
		"	vec3 N = normalize(v_normal);",
		"	vec3 V = normalize(v_viewVector);",		
		"	vec3 diffuse = vec3(0.0);",
		"	vec3 specular = vec3(0.0);",
		"	vec3 L;"
  	].join('\n'));

for (var i = 0; i < pointLights.length; i++) {
	pg.addMainBlock([
		"	L = normalize(u_matView*vec4(u_spotLights[INDEX].position, 1.0) - v_viewPos).xyz;",
		"	spotLightIrradiance(N, V, L, u_spotLights[INDEX], diffuse, specular);"
		].join('\n').replace(/INDEX/g, i),
		'phong_light_' + i
	);
}  
pg.addMainBlock(GG.ShaderLib.parameterizedBlocks('gammaColor', 'gl_FragColor'))
  .addMainBlock(
  	"gl_FragColor = u_matAmbient + u_matDiffuse*vec4(diffuse, 1.0) + u_matSpecular*vec4(specular, 1.0);",
	);

fragmentShader = pg.toString();


i.Getting attributes and uniform locations

Using the ProgramSource and iterating the respective fields

ProgramUtils.getAttributeLocations(pg.listAttributesNames())
ProgramUtils.getUniformLocations(pg.listUniformsNames())

ii. Point light uniforms 

Use a utility method like ProgramUtils.pointLightsUniforms(numLights).
It can detect them automatically as the uniform name is standardized.

iii Material uniforms

iv. Setting uniforms

The list of uniform names can be retrieved from the ProgramSource:
pg.listUniformsNames()

or through introspection:

gl.getActiveUniform(program, location),

where location ranges between 0 and the total number of uniforms used in the program.
The returned value contains the name of the uniform.

To set a material: ProgramUtils.setMaterialUniforms('u_material', a_material_instance);

To set the lights: ProgramUtils.setPointLights('u_pointLights', array_of_lights)



*/