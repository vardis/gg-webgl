GG.Texture = function (spec) {
	spec             = spec || {};
	this.texture     = spec.texture || null;
	this.textureType = gl.TEXTURE_2D;
	this.format      = spec.format || gl.RGBA;
	this.width       = spec.width || 512;
	this.height      = spec.height || 512;
	this.magFilter   = spec.magFilter || gl.NEAREST;
	this.minFilter   = spec.minFilter || gl.NEAREST;
	this.wrapS       = spec.wrapS || gl.CLAMP_TO_EDGE;
	this.wrapT       = spec.wrapT || gl.CLAMP_TO_EDGE;
	this.flipY       = spec.flipY || true;
};

GG.Texture.prototype.constructor = GG.Texture;

GG.Texture.prototype.bindAtUnit = function(unitIndex) {
	gl.activeTexture(GG.Texture.getGlUnitFromIndex(unitIndex));
	gl.bindTexture(this.textureType, this.texture);
};

GG.Texture.prototype.setMinFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterType);
};

GG.Texture.prototype.setMagFilter = function(filterType) {
	gl.bindTexture(this.textureType, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterType);
};

GG.Texture.prototype.handle = function() {
	return this.tex;
};

GG.Texture.getGlUnitFromIndex = function (unitIndex) {	
	return eval("gl.TEXTURE" + unitIndex);
}

GG.Texture.createTexture = function (spec) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, spec.flipY || true);

	// maps a format to the triple [internalFormat, format, type] as accepted by gl.TexImage2D
	var formatDetails = {};
	formatDetails[gl.RGB] = [gl.RGB, gl.RGB, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE];
	formatDetails[gl.RGBA4] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4];
	formatDetails[gl.RGB5_A1] = [gl.RGBA, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1];
	formatDetails[gl.RGB565] = [gl.RGB, gl.RGB, gl.UNSIGNED_SHORT_5_6_5];

	var colorFormat = spec.colorFormat || gl.RGBA;
	
	var width = spec.width || 512;
	var height = spec.height || 512;

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, spec.magFilter || gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, spec.minFilter || gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, spec.wrapS || gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, spec.wrapT || gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, formatDetails[colorFormat][0], width, height, 0, formatDetails[colorFormat][1], formatDetails[colorFormat][2], null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	copySpec = GG.cloneDictionary(spec);
	copySpec.texture = tex;
	return new GG.Texture(copySpec);
};