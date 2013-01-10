/**
 * Blinn/Newell Latitude Mapping
 */
GG.LatitudeReflectionMappingTechnique = function (spec) {
	spec        = spec || {};
	spec.passes = [ new GG.LatitudeReflectionMappingTechnique.Pass(spec)];
	GG.BaseTechnique.call(this, spec);
};

GG.LatitudeReflectionMappingTechnique.prototype = new GG.BaseTechnique();
GG.LatitudeReflectionMappingTechnique.prototype.constructor = GG.LatitudeReflectionMappingTechnique;


GG.LatitudeReflectionMappingTechnique.Pass = function (spec) {
	
	spec.vertexShader = [
		"attribute vec4 a_position;",
		"attribute vec3 a_normal;",

		"uniform mat4 u_matModel;",
		"uniform vec3 u_wCameraPos;",
		"uniform mat4 u_matModelView;",
		"uniform mat4 u_matProjection;",

		"varying vec3 v_reflection;",		

		"void main() {",
		"	gl_Position = u_matProjection*u_matModelView*a_position;",
		"	vec4 wPos = u_matModel * a_position;",
		"	vec3 wNormal = (u_matModel * vec4(a_normal, 0.0)).xyz;",
		"	vec3 view = u_wCameraPos - wPos.xyz;",
		"	v_reflection = normalize(reflect(view, wNormal));",
		"}"
	].join("\n");
	
	spec.fragmentShader = [
		"precision mediump float;",
		"uniform sampler2D u_texture;",
		"varying vec3 v_reflection;",		

		"void main() {",
		"	float PI = 3.14159265358979323846264;",
		//"	float yaw = .5 + atan( v_reflection.z, v_reflection.x ) / ( 2.0 * PI );",
		//"	float pitch = .5 + atan( v_reflection.y, length( v_reflection.xz ) ) / ( PI );",
		"	float yaw = .5 + atan( v_reflection.x, v_reflection.z ) / ( 2.0 * PI );",
		"	float pitch = .5 + asin( v_reflection.y ) / ( PI );",
		"	if (yaw > 0.9999) yaw = 0.0;",
		"	vec3 color = texture2D( u_texture, vec2( yaw, pitch ) ).rgb;",
		"	gl_FragColor = vec4( color, 1.0 );",
		"}"
	].join("\n");
	
	GG.RenderPass.call(this, spec);
};

GG.LatitudeReflectionMappingTechnique.Pass.prototype = new GG.RenderPass();
GG.LatitudeReflectionMappingTechnique.Pass.prototype.constructor = GG.LatitudeReflectionMappingTechnique.Pass;

GG.LatitudeReflectionMappingTechnique.Pass.prototype.__setCustomUniforms = function(renderable, ctx, program) {
	var mat = renderable.getMaterial();
	gl.uniform1i(this.program.u_texture, GG.TEX_UNIT_DIFFUSE_MAP_0);
};

GG.LatitudeReflectionMappingTechnique.Pass.prototype.__setCustomRenderState = function(renderable, ctx, program) {	
	renderable.getMaterial().diffuseTextureStack.getAt(0).bind();	
};