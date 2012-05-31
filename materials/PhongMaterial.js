GG.PhongMaterial = function (spec) {
	spec = spec || {};
	spec.technique = new GG.PhongShadingTechnique();
	spec.technique.initialize();

	GG.BaseMaterial.call(this, spec);
};

GG.PhongMaterial.prototype = new GG.BaseMaterial();
GG.PhongMaterial.prototype.constructor = GG.PhongMaterial;