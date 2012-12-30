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

GG.Renderer.prototype.render = function (renderable, program, options) {		

	var attribPosition = program[GG.GLSLProgram.BuiltInAttributes.attribPosition];
	if (attribPosition != undefined) {
        renderable.getPositionsBuffer().streamAttribute(attribPosition);
	}

	var attribNormal = program[GG.GLSLProgram.BuiltInAttributes.attribNormal];
	if (attribNormal != undefined) {
		var normalsBuffer = renderable.getMaterial().flatShade ? renderable.getFlatNormalsBuffer() : renderable.getNormalsBuffer();
        normalsBuffer.streamAttribute(attribNormal);
	}

	var attribTexCoords = program[GG.GLSLProgram.BuiltInAttributes.attribTexCoords];
	if (attribTexCoords != undefined) {
        renderable.getTexCoordsBuffer().streamAttribute(attribTexCoords)
	}

	var attribColor = program[GG.GLSLProgram.BuiltInAttributes.attribColor];
	if (attribColor != undefined) {
		renderable.getColorsBuffer().streamAttribute(attribColor);
	}

    var attribTangent = program[GG.GLSLProgram.BuiltInAttributes.attribTangent];
    if (attribTangent != undefined) {
        renderable.getTangentsBuffer().streamAttribute(attribTangent);
    }

    options = options || {};
	var mode = renderable.getMode();
	if ('mode' in options ) {
		mode = options.mode != null ? options.mode : mode;
	}

	var glMode = this.translateRenderMode(mode);
	if (renderable.getIndexBuffer() != undefined) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderable.getIndexBuffer());
		gl.drawElements(glMode, renderable.getIndexBuffer().numItems, renderable.getIndexBuffer().itemType, 0);
	} else {
		gl.drawArrays(glMode, 0, renderable.getPositionsBuffer().itemCount);
	}	
};

GG.Renderer.prototype.translateRenderMode = function (mode) {
	switch (mode) {
		case GG.RENDER_POINTS: return gl.POINTS;
		case GG.RENDER_LINES: return gl.LINES;
		case GG.RENDER_LINE_LOOP: return gl.LINE_LOOP;
		case GG.RENDER_LINE_STRIP: return gl.LINE_STRIP;
		case GG.RENDER_TRIANGLES: 
		default:
			return gl.TRIANGLES;
	}
}

