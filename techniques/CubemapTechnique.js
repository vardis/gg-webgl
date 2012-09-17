GG.CubemapTechnique = function(spec) {
	spec = spec || {};
	spec.passes = [ new GG.CubemapSkyPass(spec) ];
	GG.BaseTechnique.call(this, spec);
};

GG.CubemapTechnique.prototype = new GG.BaseTechnique();
GG.CubemapTechnique.prototype.constructor = GG.CubemapTechnique;

GG.CubemapTechnique.prototype.getCubemap = function() {
	return this.passes[0].cubemapTexture;
};

GG.CubemapTechnique.prototype.setCubemap = function(cubemap) {
	this.passes[0].cubemapTexture = cubemap;
};

GG.CubemapSkyPass = function (spec) {
	spec                = spec || {};	
	this.cubemapTexture = spec.cubemap;
	spec.vertexShader   = [
		"attribute vec4 a_position;",
		"varying vec3 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matViewInverse;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		// to be applied on the result of matModelView*vec4(skyPos, 1.0)
		"	const float SkyScale = 100.0;",

		// use the vector from the center of the cube to the vertex as the texture coordinates
		"	v_texCoords = a_position.xyz;",

		// since the view transform contains an inverse wCameraPos translation
	    // we cancel the camera translation by adding the same translation
	    // prior to multiplying with the modelviewprojection matrix
		"	vec4 wCameraPos = u_matViewInverse * vec4(0.0, 0.0, 0.0, 1.0);",
		"	vec3 skyPos = a_position.xyz + wCameraPos.xyz;",
		"	vec3 ecSkyPos = SkyScale * vec3(u_matModelView * vec4(skyPos, 1.0));",
		"	gl_Position = u_matProjection * vec4(ecSkyPos, 1.0);",
		"}"
	].join("\n");
	
	spec.fragmentShader = [
		"precision highp float;",	
		"varying vec3 v_texCoords;",	
		"uniform samplerCube u_cubemap;",
		"void main() {",
		"	gl_FragColor = textureCube(u_cubemap, v_texCoords);",
		"}"
	].join("\n");
	
	GG.RenderPass.call(this, spec);
};

GG.CubemapSkyPass.prototype = new GG.RenderPass();
GG.CubemapSkyPass.prototype.constructor = GG.CubemapSkyPass;

GG.CubemapSkyPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform1i(this.program.u_cubemap, GG.TEX_UNIT_ENV_MAP);				
};

GG.CubemapSkyPass.prototype.__setCustomRenderState = function(renderable, ctx, program) {		
	this.cubemapTexture.bind();	
	gl.disable(gl.CULL_FACE);
};