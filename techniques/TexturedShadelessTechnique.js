/**
 * Renders an object without shading, colors are fecthed from a single 2D texture.
 * Note that objects rendered using this technique must have texture coordinates 
 * defined in their geometry.
 *
 * tech = new GG.TexturedShadelessTechnique({ textures : t });
 */
GG.TexturedShadelessTechnique = function(texture, spec) {
	spec = spec || {};
	spec.passes = [new GG.TexturedShadelessPass( { 'texture' : texture })];
	GG.BaseTechnique.call(this, spec);	

	this.useScreenCoords = false;
};

GG.TexturedShadelessTechnique.prototype = new GG.BaseTechnique();
GG.TexturedShadelessTechnique.prototype.constructor = GG.TexturedShadelessTechnique;

GG.TexturedShadelessPass = function (spec) {	
	GG.RenderPass.call(this, spec);
	this.diffuseTexturingPass = new GG.DiffuseTextureStackEmbeddableRenderPass();
};

GG.TexturedShadelessPass.prototype = new GG.AdaptiveRenderPass();
GG.TexturedShadelessPass.prototype.constructor = GG.TexturedShadelessPass;

GG.TexturedShadelessPass.prototype.createProgram = function(material) {
	var vs = new GG.ProgramSource();
	vs.position()
		.texCoord0()
		.uniformModelViewMatrix()
		.uniformProjectionMatrix()
		.varying('vec2', GG.Naming.VaryingTexCoords)
		.addMainBlock([
			"	v_texCoords = a_texCoords;",
			"	gl_Position = u_matProjection*u_matModelView*a_position;"
    ].join('\n'));
	
	var fs = new GG.ProgramSource();
	fs.asFragmentShader()
		.varying('vec2', GG.Naming.VaryingTexCoords)
		//.uniform('sampler2D', 'u_texture')
		.uniformMaterial()
		.addMainInitBlock("   vec4 " + GG.Naming.VarDiffuseBaseColor + " = vec4(u_material.diffuse, 1.0);")
		//.addMainBlock("gl_FragColor = texture2D(u_texture, " + GG.Naming.VaryingTexCoords + ");");	
		.addMainBlock("gl_FragColor = vec4(" + GG.Naming.VarDiffuseBaseColor + ");");

	if (material != null) {
		this.diffuseTexturingPass.adaptShadersToMaterial(vs, fs, material);
	}
	this.vertexShader   = vs.toString();
	this.fragmentShader = fs.toString();
};

GG.TexturedShadelessPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	GG.ProgramUtils.setMaterialUniforms(program, GG.Naming.UniformMaterial, renderable.material);	
	this.diffuseTexturingPass.__setCustomUniforms(renderable, ctx, program);
	if (this.useScreenCoords) {
		gl.uniformMatrix4fv(program.u_matModelView, false, mat4.identity());
		gl.uniformMatrix4fv(program.u_matProjection, false, mat4.identity());
	}
};

GG.TexturedShadelessPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {
	this.diffuseTexturingPass.__setCustomRenderState(renderable, ctx, program);
	gl.disable(gl.CULL_FACE);
};

GG.TexturedShadelessPass.prototype.createShadersForMaterial = function (material, renderContext) {
	this.createProgram(material);
};

GG.TexturedShadelessPass.prototype.hashMaterial = function (material, renderContext) {
	return this.diffuseTexturingPass.hashMaterial(material, renderContext);
};