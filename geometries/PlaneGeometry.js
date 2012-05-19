/**
 * Provides the geometry for a unit square plane, centered at the
 * origin of its local coordinate system.
 * It is parameterizable about the uniform division along
 * the x and y axis.
 */
GG.PlaneGeometry = function(divisions) {
	divs = divisions - 1 || 1;

	verticesPerDim = divs+1;
	this.vertices = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.normals = new Float32Array(verticesPerDim*verticesPerDim*3);
	this.texCoords = new Float32Array(verticesPerDim*verticesPerDim*2);
	this.indices = new Uint16Array(divs*divs*6);

	i = 0;
	for (y = 0; y <= 1.0; y += 1.0/divs) {
		for (x = 0; x <= 1.0; x += 1.0/divs) {
			this.vertices[3*i] = x - 0.5;
			this.vertices[3*i + 1] = y - 0.5;
			this.vertices[3*i + 2] = 0.0;
			this.normals[3*i] = 0.0;
			this.normals[3*i + 1] =0.0;
			this.normals[3*i + 2] = 1.0;
			this.texCoords[2*i] = x;
			this.texCoords[2*i + 1] = y;

			++i;
		}	
	}

	i = 0;
	for (ny = 0; ny < verticesPerDim - 1; ny++) {
		for (nx = 0; nx < verticesPerDim - 1; nx++) {
			vi = ny*verticesPerDim + nx;
			this.indices[i] = vi;
			this.indices[i+1] = vi + 1;
			this.indices[i+2] = vi + verticesPerDim + 1;
			this.indices[i+3] = vi;
			this.indices[i+4] = vi + verticesPerDim + 1;
			this.indices[i+5] = vi + verticesPerDim;
			i += 6;
		}
	}
};

GG.PlaneGeometry.prototype = new GG.Geometry();
GG.PlaneGeometry.prototype.constructor = GG.PlaneGeometry;