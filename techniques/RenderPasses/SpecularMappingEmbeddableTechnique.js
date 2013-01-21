/**
 * Prerequisites:
 *	a) v_texCoords[0..N]: a varying passing each of the uv coordinates per fragment.
 */
GG.SpecularMappingEmbeddableTechnique = function (spec) {	
	GG.EmbeddableAdaptiveRenderPass.call(this, spec);
	this.BASE_UNIFORM_NAME = 'u_specularTexUnit';
};

GG.SpecularMappingEmbeddableTechnique.prototype = new GG.EmbeddableAdaptiveRenderPass();
GG.SpecularMappingEmbeddableTechnique.prototype.constructor = GG.SpecularMappingEmbeddableTechnique;

GG.SpecularMappingEmbeddableTechnique.prototype.adaptShadersToMaterial = function (vertexShader, fragmentShader, material, renderContext) {	
	if (material.specularMap.texture != null) {
		fragmentShader.addDecl('sampleTexUnit', GG.ShaderLib.blocks.sampleTexUnit)
			.uniformTexUnit(this.BASE_UNIFORM_NAME)
			.addPostProcessBlock([
			"	vec3 specularMapIntensity = sampleTexUnit("
                + GG.Naming.textureUnitUniformMap(this.BASE_UNIFORM_NAME) + ", " + this.BASE_UNIFORM_NAME + ", v_texCoords).rgb;",
			"	specular *= specularMapIntensity;"
			].join('\n'));
	}
};

GG.SpecularMappingEmbeddableTechnique.prototype.hashMaterial = function (material, renderContext) {	
	return material.specularMap.texture != null;
};		

GG.SpecularMappingEmbeddableTechnique.prototype.__locateCustomUniforms = function(renderable, ctx, program) {		
	GG.ProgramUtils.getTexUnitUniformLocations(program, this.BASE_UNIFORM_NAME);	
};

GG.SpecularMappingEmbeddableTechnique.prototype.__setCustomUniforms = function(renderable, ctx, program) {	
	if (renderable.material.specularMap.texture != null) {
		GG.ProgramUtils.setTexUnitUniforms(program, this.BASE_UNIFORM_NAME, renderable.material.specularMap);		
	}
};

GG.SpecularMappingEmbeddableTechnique.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	renderable.material.specularMap.bind();
};