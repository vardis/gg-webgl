GG.AmbientLightingTechnique = function (argument) {
	spec          = spec || {};     
	spec.passes = [ new GG.AmbientLightingPass() ];
	GG.BaseTechnique.call(this, spec);
};

GG.AmbientLightingTechnique.prototype = new GG.BaseTechnique();
GG.AmbientLightingTechnique.prototype.constructor = GG.AmbientLightingTechnique;

GG.AmbientLightingPass = function(spec) {
    spec = spec || {};
    spec.vertexShader = [
            "attribute vec4 a_position;",
            "uniform mat4 u_matModelView;",
            "uniform mat4 u_matProjection;",
            "void main() {",
            "       gl_Position = u_matProjection*u_matModelView*a_position;",
            "}"
    ].join("\n");
    
    spec.fragmentShader = [
            "precision mediump float;",
            
            "uniform vec3 u_ambientLight;",
            "uniform vec3 u_materialAmbient;",
            "void main() {",
            "       gl_FragColor = vec4(u_materialAmbient * u_ambientLight, 1.0);",
            "}"
    ].join("\n");

    GG.RenderPass.call(this, spec);
};

GG.AmbientLightingPass.prototype = new GG.RenderPass();
GG.AmbientLightingPass.prototype.constructor = GG.AmbientLightingPass;

GG.AmbientLightingPass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	gl.uniform3fv(program.u_materialAmbient, renderable.getMaterial().ambient);               
	gl.uniform3fv(program.u_ambientLight, ctx.light.ambient);               
};
