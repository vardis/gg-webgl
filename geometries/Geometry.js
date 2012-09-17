GG.Geometry = function (spec) {
	spec             = spec || {};
	this.vertices    = spec.vertices;
	this.normals     = spec.normals;
	this.flatNormals = spec.flatNormals;
	this.texCoords   = spec.texCoords;
	this.colors      = spec.colors;
	this.tangents    = spec.tangents;
	this.indices     = spec.indices;
};

GG.Geometry.prototype.constructor = GG.Geometry;

GG.Geometry.fromJSON = function (jsonObj) {	
	if ('vertices' in jsonObj) {
		spec = {};
		spec.vertices  = new Float32Array(jsonObj.vertices);

		if ('normals' in jsonObj) {
			spec.normals   = new Float32Array(jsonObj.normals);		
		}

		if ('uvs' in jsonObj) {
			spec.texCoords = new Float32Array(jsonObj.uvs);
		}
	
		if ('faces' in jsonObj) {			
			spec.indices = new Uint16Array(jsonObj.faces);
		}
		return new GG.Geometry(spec);
	}
};

GG.Geometry.fromThreeJsJSON = function (jsonObj) {	
	if ('vertices' in jsonObj) {
		spec = {};
		spec.vertices  = new Float32Array(jsonObj.vertices);

		if ('normals' in jsonObj) {
			spec.normals   = new Float32Array(jsonObj.normals);		
		}

		if ('uvs' in jsonObj) {
			spec.texCoords = new Float32Array(jsonObj.uvs);
		}
	
		if ('faces' in jsonObj) {
			var indices = [];
			var count = jsonObj.faces.length;
			var i = 0;
			while (i < count) {
				var type                = jsonObj.faces[i++];
				var isQuad              = type & 1;
				var hasMaterial         = type & 2;
				var hasFaceUv           = type & 4;
				var hasFaceVertexUv     = type & 8;
				var hasFaceNormal       = type & 16;
				var hasFaceVertexNormal = type & 32;
				var hasFaceColor        = type & 64;
				var hasFaceVertexColor  = type & 128;

				indices.push(jsonObj.faces[i+2]);
				indices.push(jsonObj.faces[i+1]);
				indices.push(jsonObj.faces[i]);
				i+=3;
				var nVertices = 3;
				if (isQuad) {
					indices.push(jsonObj.faces[i++]);
					nVertices = 4;
				}

				if (hasMaterial) i++;
				if (hasFaceNormal) i++;
				if (hasFaceColor) i++;
				if (hasFaceVertexColor) i += nVertices;
				if (hasFaceVertexNormal) i += nVertices;
				if (hasFaceUv) i += jsonObj.uvs.length;
				if (hasFaceVertexUv) i += jsonObj.uvs.length * nVertices;
			}
			spec.indices = new Uint16Array(indices);
		}
		return new GG.Geometry(spec);
	}
};

GG.Geometry.prototype.calculateFlatNormals = function() {
	if (this.indices) {
		// case of triangle lists only
		this.flatNormals = new Float32Array(this.normals.length);

		for (var i = 0; i < this.indices.length - 1; i += 3) {
			var v1 = this.indices[i];
			var v2 = this.indices[i+1];
			var v3 = this.indices[i+2];

			var n1 = this.normals.subarray(v1*3, v1*3+3);
			var n2 = this.normals.subarray(v2*3, v2*3+3);
			var n3 = this.normals.subarray(v3*3, v3*3+3);

			var avg = [n1[0] + n2[0] + n3[0], n1[1] + n2[1] + n3[1], n1[2] + n2[2] + n3[2]];
			avg[0] = avg[0] / 3.0;
			avg[1] = avg[1] / 3.0;
			avg[2] = avg[2] / 3.0;

			this.flatNormals.set(avg, v1*3);
			this.flatNormals.set(avg, v2*3);
			this.flatNormals.set(avg, v3*3);
		}
		return this.flatNormals;	
	} else {
		return null;
	}
	
};

GG.Geometry.prototype.getVertices = function() {
	return this.vertices;
};

GG.Geometry.prototype.getNormals = function() {
	return this.normals;
};

GG.Geometry.prototype.getFlatNormals = function() {
	return this.flatNormals;
};

GG.Geometry.prototype.getTexCoords = function() {
	return this.texCoords;
};

GG.Geometry.prototype.getTangents = function() {
	return this.tangents;
};

GG.Geometry.prototype.getColors = function() {
	return this.colors;
};

GG.Geometry.prototype.getIndices = function() {
	return this.indices;
};