GG.Renderer = function() {
	this.camera = null;
	this.persp = mat4.create();
	this.view = mat4.create();
	this.inverseView = mat4.create();
	this.MVP = mat4.create();
}

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

GG.Renderer.prototype.renderMesh = function (mesh, program) {		
	if (program.attribPosition != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getPositionsBuffer());
		gl.enableVertexAttribArray(program.attribPosition);
		gl.vertexAttribPointer(program.attribPosition, mesh.getPositionsBuffer().itemSize, mesh.getPositionsBuffer().itemType, false, 0, 0);
	}

	if (program.attribNormal != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getNormalsBuffer());
		gl.enableVertexAttribArray(program.attribNormal);
		gl.vertexAttribPointer(program.attribNormal, mesh.getNormalsBuffer().itemSize, mesh.getNormalsBuffer().itemType, false, 0, 0);
	}

	if (program.attribTexCoords != undefined) {
		gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getTexCoordsBuffer());
		gl.enableVertexAttribArray(program.attribTexCoords);
		gl.vertexAttribPointer(program.attribTexCoords, mesh.getTexCoordsBuffer().itemSize, mesh.getTexCoordsBuffer().itemType, false, 0, 0);
	}

	if (mesh.getIndexBuffer() != undefined) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.getIndexBuffer());
		gl.drawElements(gl.TRIANGLES, mesh.getIndexBuffer().numItems, mesh.getIndexBuffer().itemType, 0);
	} else {
		gl.drawArrays(gl.TRIANGLES, 0, mesh.getPositionsBuffer().size);
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
