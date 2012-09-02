GG.ConstantLightingTechnique = function(spec) {		
	spec = spec || {};
	spec.passes = [ new GG.FlatShadePass() ];
	
	GG.BaseTechnique.call(this, spec);
}

GG.ConstantLightingTechnique.prototype = new GG.BaseTechnique();
GG.ConstantLightingTechnique.prototype.constructor = GG.ConstantLightingTechnique;

GG.FlatShadePass = function(spec) {
	spec = spec || {};
	spec.adaptsToScene = false;

	spec.vertexShader = [
		"attribute vec4 a_position;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",
		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"}"
	].join("\n");
	
	spec.fragmentShader = [
		"precision mediump float;",
		
		"uniform vec3 u_color;",
		"void main() {",
		"	gl_FragColor = vec4(u_color, 1.0);",
		"}"
	].join("\n");

	GG.RenderPass.call(this, spec);
};

GG.FlatShadePass.prototype = new GG.RenderPass();
GG.FlatShadePass.prototype.constructor = GG.FlatShadePass;

GG.FlatShadePass.prototype.destroy = function() {
	GG.BaseTechnique.prototype.destroy();
	gl.deleteProgram(this.program);
};

GG.FlatShadePass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var viewMat = ctx.camera.getViewMatrix();

	var MV = mat4.create();
	mat4.multiply(viewMat, renderable.getModelMatrix(), MV);
	gl.uniformMatrix4fv(program.u_matModelView, false, MV);

	gl.uniform3fv(program.u_color, renderable.getMaterial().diffuse);		
};
