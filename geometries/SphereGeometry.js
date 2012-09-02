GG.SphereGeometry = function(radius, rings, segments) {
	this.radius            = radius || 1.0;
	this.rings             = rings || 16;
	this.segments          = segments || 16;
	
	this.vertices          = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.normals           = new Float32Array(3 * (this.rings + 1) * (this.segments + 1));
	this.texCoords         = new Float32Array(2 *  (this.rings + 1) * (this.segments + 1));
	this.indices           = new Uint16Array((this.segments + 1) * this.rings * 6);
	var vv                 = 0;
	var ii                 = 0;
	
	var vertexPositionData = [];
	var normalData         = [];
	var textureCoordData   = [];
	var latitudeBands      = this.rings;
	var longitudeBands     = this.segments;
	
	var fDeltaRingAngle    = (GG.PI / this.rings);
	var fDeltaSegAngle     = (2.0 * GG.PI / this.segments);
	var offset             = 0;

	// Generate the group of rings for the sphere
	for (var ring = 0; ring <= this.rings; ring++) {
		var r0 = this.radius * Math.sin(ring * fDeltaRingAngle);
		var y0 = this.radius * Math.cos(ring * fDeltaRingAngle);

		// Generate the group of segments for the current ring
		for (var seg = 0; seg <= this.segments; seg++) {
			var x0 = r0 * Math.sin(seg * fDeltaSegAngle);
			var z0 = r0 * Math.cos(seg * fDeltaSegAngle);

			// Add one vertex to the strip which makes up the sphere
			var invLen = 1.0 / Math.sqrt(x0*x0 + y0*y0 + z0*z0);

			this.vertices[vv*3]      = x0;
			this.vertices[vv*3 + 1]  = y0;
			this.vertices[vv*3 + 2]  = z0;
			
			this.normals[vv*3]       = invLen*x0;
			this.normals[vv*3 + 1]   = invLen*y0;
			this.normals[vv*3 + 2]   = invLen*z0;
			
			this.texCoords[vv*2]     = seg / this.segments;
			this.texCoords[vv*2 + 1] = seg / this.rings;

			vv++;		
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

