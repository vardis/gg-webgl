GG.ConstantLightingTechnique = function(spec) {	
	
	spec = spec || {};
	GG.BaseTechnique.call(this, spec);
	this.color = spec.color != undefined ? spec.color : [1.0, 1.0, 1.0];
	
	this.vertexShader = [
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	this.fragmentShader = [
		"precision mediump float;",
		
		"uniform vec4 u_color;",
		"void main() {",
		"	gl_FragColor = u_color;",
		"}"
	].join("\n");
	
	this.program = null;
}

GG.ConstantLightingTechnique.prototype = new GG.BaseTechnique();
GG.ConstantLightingTechnique.prototype.constructor = GG.ConstantLightingTechnique;
GG.ConstantLightingTechnique.prototype.getColor = function() {
	return this.color;
};

GG.ConstantLightingTechnique.prototype.setColor = function(c) {
	this.color = c;
};

GG.ConstantLightingTechnique.prototype.initialize = function() {
	GG.BaseTechnique.prototype.initialize();
	this.program = this.createProgram(this.vertexShader, this.fragmentShader);
	gl.useProgram(this.program);
	this.program.attribPosition = gl.getAttribLocation(this.program, "a_position");
	this.program.uniformColor = gl.getUniformLocation(this.program, "u_color");
	this.program.uniformMV = gl.getUniformLocation(this.program, "u_matModelView");
	this.program.uniformProjection = gl.getUniformLocation(this.program, "u_matProjection");
};

GG.ConstantLightingTechnique.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.ConstantLightingTechnique.prototype.render = function(mesh) {
	// this could go to the renderer
	gl.useProgram(this.program);			
	gl.uniform4fv(this.program.uniformColor, this.color);		
	
	MV = mat4.create();
	mat4.multiply(this.renderer.getViewMatrix(), mesh.getModelMatrix(), MV);
	gl.uniformMatrix4fv(this.program.uniformMV, false, MV);
	gl.uniformMatrix4fv(this.program.uniformProjection, false, this.renderer.getProjectionMatrix());
	this.renderer.renderMesh(mesh, this.program);
};