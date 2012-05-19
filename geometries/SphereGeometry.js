GG.SphereGeometry = function(radius, rings, segments) {
	this.radius = radius || 1.0;
	this.rings = rings || 16;
	this.segments = segments || 16;
	/*
	this.vertices = [];
	this.normals = [];
	this.texCoords = [];
	*/
	this.indices2 = [];	

	this.vertices = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.normals = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.texCoords = new Float32Array(2 *  (this.rings + 1) * (this.segments + 1));
	this.indices = new Uint16Array((this.segments + 1) * this.rings * 6);
	vv = 0;
	ii = 0;

	var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    latitudeBands = this.rings;
    longitudeBands = this.segments;
/*
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var theta = latNumber * Math.PI / latitudeBands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / longitudeBands);
        var v = 1 - (latNumber / latitudeBands);

        normalData.push(x);
        normalData.push(y);
        normalData.push(z);
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(radius * x);
        vertexPositionData.push(radius * y);
        vertexPositionData.push(radius * z);
      }
    }

	var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }

    this.vertices = new Float32Array(vertexPositionData);
	this.normals = new Float32Array(normalData);
	this.texCoords = new Float32Array(textureCoordData);
	this.indices = new Uint16Array(indexData);
*/
 	fDeltaRingAngle = (GG.PI / this.rings);
	fDeltaSegAngle = (2.0 * GG.PI / this.segments);
	offset = 0;

	// Generate the group of rings for the sphere
	for (ring = 0; ring <= this.rings; ring++) {
		r0 = this.radius * Math.sin(ring * fDeltaRingAngle);
		y0 = this.radius * Math.cos(ring * fDeltaRingAngle);

		// Generate the group of segments for the current ring
		for (seg = 0; seg <= this.segments; seg++) {
			x0 = r0 * Math.sin(seg * fDeltaSegAngle);
			z0 = r0 * Math.cos(seg * fDeltaSegAngle);

			// Add one vertex to the strip which makes up the sphere
			invLen = 1.0 / Math.sqrt(x0*x0 + y0*y0 + z0*z0);

			this.vertices[vv*3] = x0;
			this.vertices[vv*3 + 1] = y0;
			this.vertices[vv*3 + 2] = z0;

			this.normals[vv*3] = invLen*x0;
			this.normals[vv*3 + 1] = invLen*y0;
			this.normals[vv*3 + 2] = invLen*z0;
			
			this.texCoords[vv*2] = seg / this.segments;
			this.texCoords[vv*2 + 1] = seg / this.rings;

			vv++;

			
/*
			if (ring != this.rings) {
				// each vertex (except the last) has six indices pointing to it
				this.indices[ii*6] = offset + this.segments + 1;
				this.indices[ii*6 + 1] = offset;
				this.indices[ii*6 + 2] = offset + this.segments;
				this.indices[ii*6 + 3] = offset + this.segments + 1;
				this.indices[ii*6 + 4] = offset + 1;
				this.indices[ii*6 + 5] = offset;
				ii += 1;

				this.indices2.push(offset + this.segments + 1);
				this.indices2.push(offset);
				this.indices2.push(offset + this.segments);
				this.indices2.push(offset + this.segments + 1);
				this.indices2.push(offset + 1);
				this.indices2.push(offset);

				offset++;
			}
			*/
		}; // end for seg
	} // end for ring

	var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
	this.indices = new Uint16Array(indexData);
	
};

GG.SphereGeometry.prototype = new GG.Geometry();
GG.SphereGeometry.prototype.constructor = GG.SphereGeometry;

GG.SphereGeometry.prototype.getFaces = function() {
	return this.faces;
};

