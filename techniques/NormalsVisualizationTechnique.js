/**
 * Draws the normals of a renderable object for debugging purposes.
 * The normals are drawing using lines with a different color for the 2 endpoints. 
 * A LineMesh is constructed for every input renderable and having the same number
 * of vertices as the renderable.
 */
GG.NormalsVisualizationTechnique = function (spec) {
	spec        = spec || {};	
	spec.passes = [ new GG.NormalsVisualizationTechnique.Pass() ];
	GG.BaseTechnique.call(this, spec);
	this.startColor   = [0, 1, 0];
	this.endColor     = [1, 0, 0];
	this.normalsScale = spec.normalsScale != undefined ? spec.normalsScale : 1.0;
};


GG.NormalsVisualizationTechnique.prototype = new GG.BaseTechnique();
GG.NormalsVisualizationTechnique.prototype.constructor = GG.NormalsVisualizationTechnique;

GG.NormalsVisualizationTechnique.create = function(spec) {
	var t = new GG.NormalsVisualizationTechnique(spec);
	t.passes[0].parent = t;
	return t;
};

GG.NormalsVisualizationTechnique.Pass = function (spec) {
	spec = spec || {};
	spec.usesLighting = false;
	spec.customRendering = true;
	GG.RenderPass.call(this, spec);

	// stores a reference to the technique
	this.parent = null;
};

GG.NormalsVisualizationTechnique.Pass.prototype = new GG.RenderPass();
GG.NormalsVisualizationTechnique.Pass.prototype.constructor = GG.NormalsVisualizationTechnique.Pass;

GG.NormalsVisualizationTechnique.Pass.prototype.__createShaders = function() {
	var vs = new GG.ProgramSource();
	vs.position()
		.color()
		.varying('vec3', GG.Naming.VaryingColor)
		.uniformModelViewMatrix()
		.uniformProjectionMatrix()
		.addMainBlock([
			GG.Naming.VaryingColor + " = " + GG.Naming.AttributeColor + ";",
			"gl_Position = u_matProjection * u_matModelView * " + GG.Naming.AttributePosition + ';'
			].join('\n'));
	this.vertexShader = vs.toString();

	var fs = new GG.ProgramSource();
	fs.asFragmentShader()
		.varying('vec3', GG.Naming.VaryingColor)
		.finalColor('gl_FragColor = vec4(' + GG.Naming.VaryingColor + ', 1.0);');
	this.fragmentShader = fs.toString();
};

GG.NormalsVisualizationTechnique.Pass.prototype.__renderGeometry = function(renderable, ctx, program) {
	if (renderable.constructor == GG.TriangleMesh) {
		if (renderable.__normalsDebug == null) {
			var lineMesh = this.createLineMeshForRenderable(renderable);
			renderable.__normalsDebug = lineMesh;
		}
		GG.renderer.render(renderable.__normalsDebug, this.program);

	} else throw "NormalsVisualizationTechnique can only render a TriangleMesh";
};

GG.NormalsVisualizationTechnique.Pass.prototype.createLineMeshForRenderable = function(renderable) {
	var numVerts      = renderable.getVertexCount();	
	var linesVertices = [];
	var linesColors   = [];
	var vertexBuffer  = renderable.getGeometry().getVertices();
	var normalsBuffer = renderable.getGeometry().getNormals();
	if (normalsBuffer == null || normalsBuffer.length == 0) {
		return;
	}
	for (var i = 0; i < numVerts; i++) {			
		var v = vertexBuffer.subarray(i*3, i*3+3);
		var n = normalsBuffer.subarray(i*3, i*3+3);

		var normal = this.getNormalEndpoint(v, n);
		linesVertices.push(v[0], v[1], v[2]);		
		linesVertices.push(normal[0], normal[1], normal[2]);

		linesColors.push(this.parent.startColor[0], this.parent.startColor[1], this.parent.startColor[2]);
		linesColors.push(this.parent.endColor[0], this.parent.endColor[1], this.parent.endColor[2]);
	}
	var linesGeom = new GG.Geometry({ vertices : linesVertices, colors : linesColors });
	return new GG.LineMesh(linesGeom, new GG.BaseMaterial());
};

GG.NormalsVisualizationTechnique.Pass.prototype.getNormalEndpoint = function(v, n) {
	var endpoint = vec3.create(v);
	var ns = vec3.create(n);
	vec3.scale(ns, this.parent.normalsScale);
	vec3.add(endpoint, ns);
	//vec3.normalize(endpoint);
	
	return endpoint;
};
