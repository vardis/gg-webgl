/**
 *	mesh = new GG.CubeGeometry(
 *		{
 *			pos : true,
 *			indices : "16" (or null for no index, "32" for 32bit indices),
 *			normals : true, false, null
 *			texCoords : true, false, null,
 *			tangents : true, false, null,
 *			bitangents : true, false, null
 *		}
 *	);
 *
 *	mesh.attributes("normals").foreach(...)
 */
GG.CubeGeometry = function(dimensions) {
	dimensions = dimensions || [1.0, 1.0, 1.0]
	var x = dimensions[0], y = dimensions[1], z = dimensions[2];
	
	this.vertices = new Float32Array(36*3);
	this.normals = new Float32Array(36*3);
	this.texCoords = new Float32Array(36*2);
	var vv = 0;
	var nn = 0;
	var st = 0;
	
	// +Z
	this.vertices.set([
		-x, -y, z,
		 x,  y, z,
		-x,  y, z,
		-x, -y, z,
		 x, -y, z,
		 x,  y, z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0
	], nn);
	nn += 18;
	
	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;

	// -Z
	this.vertices.set([
		 x, -y, -z,
		-x,  y, -z,
		 x,  y, -z,
		 x, -y, -z,
		-x, -y, -z,
		-x,  y, -z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// +X
	this.vertices.set([
		x, -y,  z,
		x,  y, -z,
		x,  y,  z,
		x, -y,  z,
		x, -y, -z,
		x,  y, -z
	], vv);
	vv += 18;

	this.normals.set([
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	


	// -X
	this.vertices.set([
		-x, -y, -z,
		-x,  y,  z,
		-x,  y, -z,
		-x, -y, -z,
		-x, -y,  z,
		-x,  y,  z
	], vv);
	vv += 18;
	
	this.normals.set([
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// +Y
	this.vertices.set([
		-x, y,  z,
		 x, y, -z,
		-x, y, -z,
		-x, y,  z,
		 x, y,  z,
		 x, y, -z
	], vv);
	vv += 18;
	
	this.normals.set([
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	

	// -Y
	this.vertices.set([
		-x, -y, -z,
		 x, -y,  z,
		-x, -y,  z,
		-x, -y, -z,
		 x, -y, -z,
		 x, -y,  z
	], vv);
	vv += 18;

	this.normals.set([
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0
	], nn);
	nn += 18;

	this.texCoords.set([
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0
	], st);
	st += 12;	
		
	this.faces = new Uint16Array(this.vertices.length / 3);
	for (var f = 0; f < this.vertices.length / 3*3; f++) {
		this.faces[f] = [ 3*f, 3*f + 1, 3*f + 2 ];
	}
	
};

GG.CubeGeometry.prototype = new GG.Geometry();
GG.CubeGeometry.prototype.constructor = GG.CubeGeometry;

GG.CubeGeometry.prototype.getFaces = function() {
	return this.faces;
};

/**
 * Converts every face of this mesh to a triangle.
 */
GG.CubeGeometry.prototype.triangulate = function() {
};