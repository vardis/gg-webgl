GG.Renderer = function() {
	this.camera      = null;
	this.persp       = mat4.create();
	this.view        = mat4.create();
	this.inverseView = mat4.create();
	this.MVP         = mat4.create();
};

GG.Renderer.prototype.constructor = GG.Renderer;
GG.Renderer.prototype.getCamera = function () {
	return this.camera;
};

GG.Renderer.prototype.setCamera = function (c) {
	this.camera = c;
};

GG.Renderer.prototype.getProjectionMatrix = function () {
	return this.persp;
};

GG.Renderer.prototype.getViewMatrix = function () {
	return this.view;
};

GG.Renderer.prototype.getInverseViewMatrix = function () {
	return this.inverseView;
};

GG.Renderer.prototype.getViewProjectionMatrix = function () {
	mat4.identity(this.MVP);
	mat4.multiply(this.view, this.persp, this.MVP);
	return this.MVP;
};

GG.Renderer.prototype.prepareNextFrame = function () {	
	this.persp = this.camera.getProjectionMatrix();
	this.view = this.camera.getViewMatrix();
	mat4.inverse(this.view, this.inverseView);
	return this;
};

GG.Renderer.prototype.renderMesh = function (mesh, program, options) {		

	var attribPosition = program[GG.GLSLProgram.BuiltInAttributes.attribPosition];
	if (attribPosition != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getPositionsBuffer());
		gl.enableVertexAttribArray(attribPosition);
		gl.vertexAttribPointer(attribPosition, mesh.getPositionsBuffer().itemSize, mesh.getPositionsBuffer().itemType, false, 0, 0);
	}

	var attribNormal = program[GG.GLSLProgram.BuiltInAttributes.attribNormal];
	if (attribNormal != undefined) {
		var normalsBuffer = mesh.getMaterial().flatShade ? mesh.getFlatNormalsBuffer() : mesh.getNormalsBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.enableVertexAttribArray(attribNormal);
		gl.vertexAttribPointer(attribNormal, normalsBuffer.itemSize, normalsBuffer.itemType, false, 0, 0);
	}

	var attribTexCoords = program[GG.GLSLProgram.BuiltInAttributes.attribTexCoords];
	if (attribTexCoords != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getTexCoordsBuffer());
		gl.enableVertexAttribArray(attribTexCoords);
		gl.vertexAttribPointer(attribTexCoords, mesh.getTexCoordsBuffer().itemSize, mesh.getTexCoordsBuffer().itemType, false, 0, 0);
	}

	var attribColor = program[GG.GLSLProgram.BuiltInAttributes.attribColor];
	if (attribColor != undefined) {
		mesh.getColorsBufer().streamAttribute(attribColor);
	}

    var attribTangent = program[GG.GLSLProgram.BuiltInAttributes.attribTangent];
    if (attribTangent != undefined) {
        mesh.getTangentsBuffer().streamAttribute(attribTangent);
    }

    options = options || {};
	var mode = gl.TRIANGLES;
	if ('mode' in options ) {
		mode = options.mode;
	}
	if (mesh.getIndexBuffer() != undefined) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.getIndexBuffer());
		gl.drawElements(mode, mesh.getIndexBuffer().numItems, mesh.getIndexBuffer().itemType, 0);
	} else {
		gl.drawArrays(mode, 0, mesh.getPositionsBuffer().size);
	}	
};

GG.Renderer.prototype.renderPoints = function (program, vertexBuffer, colorBuffer) {
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.enableVertexAttribArray(program.attribPosition);
	gl.vertexAttribPointer(program.attribPosition, vertexBuffer.itemSize, vertexBuffer.itemType, false, 0, 0);

	if (colorBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.enableVertexAttribArray(program.attribColors);
		gl.vertexAttribPointer(program.attribColors, colorBuffer.itemSize, colorBuffer.itemType, false, 0, 0);
	}

	gl.drawArrays(gl.POINTS, 0, vertexBuffer.size);
};
