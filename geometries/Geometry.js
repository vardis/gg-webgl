GG.Geometry = function (spec) {
	spec           = spec           || {};
	this.vertices  = spec.vertices  || null;
	this.normals   = spec.normals   || null;
	this.texCoords = spec.texCoords || null;
	this.colors    = spec.colors    || null;
	this.tangents  = spec.tangents  || null;
	this.indices   = spec.indices   || null;
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

GG.Geometry.prototype.getVertices = function() {
	return this.vertices;
};

GG.Geometry.prototype.getNormals = function() {
	return this.normals;
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