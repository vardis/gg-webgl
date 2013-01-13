/**
 * Each TriangleMesh is associated with a Geometry that stores the actual vertices,
 * normals, and the rest vertex attributes. 
 * Only geometries of triangle lists are supported. 
 */
GG.TriangleMesh = function(geometry, material, spec) {
	spec               = spec || {};
	spec.usesNormals   = true;
	spec.usesTexCoords = true;
	spec.usesColors    = true;
	spec.usesTangents  = true;

	GG.Object3D.call(this, geometry, material, spec);	
};

GG.TriangleMesh.prototype = new GG.Object3D();
GG.TriangleMesh.prototype.constructor = GG.TriangleMesh;

GG.TriangleMesh.prototype.getFlatNormalsBuffer = function() {
	if (this.flatNormalsBuffer === undefined) {
		var flatNormals = this.geometry.getFlatNormals();
		if (flatNormals === undefined) {
			flatNormals = this.geometry.calculateFlatNormals();
		}
		if (flatNormals) {
            this.flatNormalsBuffer = new GG.AttributeDataBuffer({ 'arrayData' : this.geometry.getFlatNormals(), 'itemSize' : 3, 'itemType' : gl.FLOAT });
		} else {
			return null;
		}
	}
	return this.flatNormalsBuffer;
};

GG.TriangleMesh.prototype.asWireframeMesh = function() {
	// they can re-use the vertex attributes buffers, only the index buffers and the primitive
	// type will be different
	var spec             = {};
	spec.positionsBuffer = this.positionsBuffer;
	spec.colorsBuffer    = this.colorsBuffer;
	spec.normalsBuffer   = this.normalsBuffer;
	spec.texCoordsBuffer = this.texCoordsBuffer;

	/*
	Verify the primitive type is triangles
	If there's already an index buffer 
		Loop through the index buffer, one triangle at a time
		For triangle indices a,b,c emit the line indices (a,b), (b,c) and (c,a)
	Else
		Loop through the index buffer, one triangle at a time
		For vertices a,b,c emit the line indices (index(a),index(b)), (index(b),index(c)) and (index(c),index(a))
	*/
	if (this.renderMode == GG.RENDER_TRIANGLES)	{
		var linesIndexBuffer = new Uint16Array(2 * this.indexBuffer.numItems);
		var j = 0;
		if (this.geometry.indices != null) {
			for (var i = 0; i < this.geometry.indices.length; i += 3) {
				var i1 = this.geometry.indices[i];
				var i2 = this.geometry.indices[i+1];
				var i3 = this.geometry.indices[i+2];
				linesIndexBuffer[j++] = i1;
				linesIndexBuffer[j++] = i2;
				linesIndexBuffer[j++] = i2;
				linesIndexBuffer[j++] = i3;
				linesIndexBuffer[j++] = i3;
				linesIndexBuffer[j++] = i1;
			}
		} else {
			for (var i = 0; i < this.geometry.getVertices().length; i += 3) {
				linesIndexBuffer[j++] = i;
				linesIndexBuffer[j++] = i+1;
				linesIndexBuffer[j++] = i+1;
				linesIndexBuffer[j++] = i+2;
				linesIndexBuffer[j++] = i+2;
				linesIndexBuffer[j++] = i;	
			}
		}
		spec.indexBuffer          = gl.createBuffer(1);
        spec.indexBuffer.numItems = linesIndexBuffer.length;
        spec.indexBuffer.itemType = gl.UNSIGNED_SHORT;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spec.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, linesIndexBuffer, gl.STATIC_DRAW);

	} else {
		throw "can only get wireframe mesh for triangles";
	}
	return new GG.LineMesh(this.geometry, this.material, spec);
};