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
    spec = {};
    if ('vertices' in jsonObj) {
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
	}
    return new GG.Geometry(spec);
};

GG.Geometry.fromThreeJsJSON = function (jsonObj) {
    spec = {};
    if ('vertices' in jsonObj) {
		spec.vertices  = new Float32Array(jsonObj.vertices);

		if ('normals' in jsonObj && jsonObj.normals.length > 0) {
			spec.normals   = new Float32Array(jsonObj.normals);		
		}

		if ('uvs' in jsonObj && jsonObj.uvs.length > 1) {
			spec.texCoords = new Float32Array(jsonObj.uvs);
		}
	
		if ('faces' in jsonObj && jsonObj.faces.length > 0) {
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

				indices.push(jsonObj.faces[i]);
				indices.push(jsonObj.faces[i+1]);
				indices.push(jsonObj.faces[i+2]);
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
	}
    return new GG.Geometry(spec);
};

//TODO: add a buildIndexBuffer method

GG.Geometry.prototype.calculateTangents = function() {
    if (this.indices) {
        // case of triangle lists only
        this.tangents = new Float32Array(this.normals.length);

        for (var i = 0; i < this.indices.length - 1; i += 3) {
            var i1 = this.indices[i];
            var i2 = this.indices[i+1];
            var i3 = this.indices[i+2];

            var v1 = this.vertices.subarray(i1*3, i1*3+3);
            var v2 = this.vertices.subarray(i2*3, i2*3+3);
            var v3 = this.vertices.subarray(i3*3, i3*3+3);

            var vertexUV1 = this.texCoords.subarray(i1*2, i1*2+2);
            var vertexUV2 = this.texCoords.subarray(i2*2, i2*2+2);
            var vertexUV3 = this.texCoords.subarray(i3*2, i3*2+2);

            var e1 = vec3.create();
            vec3.subtract(v2, v1, e1);

            var st1 = [0, 0];
            st1[0] = vertexUV2[0] - vertexUV1[0];
            st1[1] = vertexUV2[1] - vertexUV1[1];

            var e2 = vec3.create();
            vec3.subtract(v3, v1, e2);

            var st2 = [0, 0];
            st2[0] = vertexUV3[0] - vertexUV1[0];
            st2[1] = vertexUV3[1] - vertexUV1[1];

            var coef = 1 / (st1[0] * st2[1] - st2[0] * st1[1]);
            var tangent = vec3.create();

            tangent[0] = coef * ((e1[0] * st2[1]) + (e2[0] * -st1[1]));
            tangent[1] = coef * ((e1[1] * st2[1]) + (e2[1] * -st1[1]));
            tangent[2] = coef * ((e1[2] * st2[1]) + (e2[2] * -st1[1]));

            var tang1 = this.tangents.subarray(i1*3, i1*3+3);
            var tang2 = this.tangents.subarray(i2*3, i2*3+3);
            var tang3 = this.tangents.subarray(i3*3, i3*3+3);
            vec3.add(tang1, tangent);
            vec3.add(tang2, tangent);
            vec3.add(tang3, tangent);
        }
        for (var i = 0; i < this.indices.length - 1; i++) {
            var tangent = this.tangents.subarray(i*3, i*3+3);
            vec3.normalize(tangent);
        }
        return this.tangents;
    } else {
        return null;
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