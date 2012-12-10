GG.BLEND_MULTIPLY    = 1;
GG.BLEND_ADD          = 2;
GG.BLEND_SUBTRACT     = 3;
GG.BLEND_DARKEN       = 4;
GG.BLEND_COLOR_BURN   = 5;
GG.BLEND_LINEAR_BURN  = 6;
GG.BLEND_LIGHTEN      = 7;
GG.BLEND_SCREEN       = 8;
GG.BLEND_COLOR_DODGE  = 9;
GG.BLEND_OVERLAY      = 10;
GG.BLEND_SOFT_LIGHT   = 11;
GG.BLEND_HARD_LIGHT   = 12;
GG.BLEND_VIVID_LIGHT  = 13;
GG.BLEND_LINEAR_LIGHT = 14;
GG.BLEND_PIN_LIGHT    = 15;


GG.TextureUnit = function (spec) {
	spec = spec || {};
	this.texture    = spec.texture != undefined ? spec.texture : null;
	this.glTexUnit = spec.unit  != undefined ? spec.unit : GG.TEX_UNIT_DIFFUSE_MAP_0;
	this.blendMode  = spec.blendMode != null ? spec.blendMode : GG.BLEND_MULTIPLY;
	this.uvSetIndex = 0;
	this.offsetU    = 0;
	this.offsetV    = 0;
	this.scaleU     = 1;
	this.scaleV     = 1;
};

GG.TextureUnit.prototype.bind = function () {
	if (this.texture) {
		this.texture.bindAtUnit(this.glTexUnit);
	}
};

GG.TextureStack = function (spec) {	
	this.stackEntries = [];
};

GG.TextureStack.prototype.constructor = GG.TextureStack;

GG.TextureStack.prototype.isEmpty = function () {
	return this.stackEntries.length == 0;
};

GG.TextureStack.prototype.size = function () {
	return this.stackEntries.length;
};

GG.TextureStack.prototype.getAt = function (index) {
	return this.stackEntries[index];
};

GG.TextureStack.prototype.setAt = function (index, texture, blendMode) {
	var entry = this._createEntryForIndex(index, texture, blendMode);
	this.stackEntries[index] = entry;
	return this;
};

GG.TextureStack.prototype.add = function (texture, blendMode) {
	var entry = this._createEntryForIndex(this.stackEntries.length, texture, blendMode);
	this.stackEntries.push(entry);
	return this;
};

GG.TextureStack.prototype._createEntryForIndex = function (index, texture, blendMode) {
	var texUnit = GG.TEX_UNIT_DIFFUSE_MAPS[index];
	var entry = new GG.TextureUnit({ 'texture' : texture, 'blendMode' : blendMode, 'unit' : texUnit });
	return entry;
};

GG.TextureStack.prototype.hashCode = function () {
	var size = this.size();
	var hash = size.toString();
	for (var i = 0; i < size; i++) {
		var entry = this.stackEntries[i];
		hash += entry.texture != null;
		hash += entry.blendMode;
	}
	return hash;
};