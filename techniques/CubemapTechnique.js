GG.CubemapTechnique = function(spec) {
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);

	this.cubemapTexture = spec.cubemap;

	this.vertexShader = [
		"attribute vec4 a_position;",
		"varying vec3 v_texCoords;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_inverseView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		// to be applied on the result of matModelView*vec4(skyPos, 1.0)
		"	const float SkyScale = 100.0;",

		// use the vector from the center of the cube to the vertex as the texture coordinates
		"	v_texCoords = a_position.xyz;",

		// since the view transform contains an inverse wCameraPos translation
	    // we cancel the camera translation by adding the same translation
	    // prior to multiplying with the modelviewprojection matrix
		"	vec4 wCameraPos = u_inverseView * vec4(0.0, 0.0, 0.0, 1.0);",
		"	vec3 skyPos = a_position.xyz + wCameraPos.xyz;",
		"	vec3 ecSkyPos = SkyScale * vec3(u_matModelView * vec4(skyPos, 1.0));",
		"	gl_Position = u_matProjection * vec4(ecSkyPos, 1.0);",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",	
		"varying vec3 v_texCoords;",	
		"uniform samplerCube u_cubemap;",
		"void main() {",
		"	gl_FragColor = textureCube(u_cubemap, v_texCoords);",
		"}"
	].join("\n");
	
	this.program = null;
};

GG.CubemapTechnique.prototype = new GG.BaseTechnique();
GG.CubemapTechnique.prototype.constructor = GG.CubemapTechnique;

GG.CubemapTechnique.prototype.getCubemap = function() {
	return this.cubemapTexture;
};

GG.CubemapTechnique.prototype.setCubemap = function(cubemap) {
	this.cubemapTexture = cubemap;
};

GG.CubemapTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.uniformCubemap = gl.getUniformLocation(this.program, "u_cubemap");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformInverseView = gl.getUniformLocation(this.program, "u_inverseView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
};

GG.CubemapTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.CubemapTechnique.prototype.render = function(mesh) {
	// this could go to the renderer
	gl.useProgram(this.program);			

	gl.activeTexture(gl.TEXTURE0);
	this.cubemapTexture.bind();
	gl.uniform1i(this.program.uniformCubemap, 0);		
	
	gl.uniformMatrix4fv(this.program.uniformInverseView, false, this.renderer.getInverseViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformMV, false, this.renderer.getViewMatrix());
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());

	gl.disable(gl.CULL_FACE);

	this.renderer.renderMesh(mesh, this.program);

	this.cubemapTexture.unbind();
	gl.useProgram(null);
};