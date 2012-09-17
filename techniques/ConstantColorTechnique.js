GG.ConstantColorTechnique = function(spec) {		
	spec        = spec || {};
	spec.passes = [ new GG.ConstantColorPass() ];
	
	GG.BaseTechnique.call(this, spec);
}

GG.ConstantColorTechnique.prototype = new GG.BaseTechnique();
GG.ConstantColorTechnique.prototype.constructor = GG.ConstantColorTechnique;


GG.ConstantColorTechnique.prototype.getTexture = function() {
    return this.passes[0].texture;
};

GG.ConstantColorTechnique.prototype.setTexture = function(texture) {
    this.passes[0].texture = texture;
    return this;
};

GG.ConstantColorPass = function(spec) {
	spec = spec || {};

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

GG.ConstantColorPass.prototype = new GG.RenderPass();
GG.ConstantColorPass.prototype.constructor = GG.ConstantColorPass;

GG.ConstantColorPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform3fv(program.u_color, renderable.getMaterial().diffuse);		
};
