/**
 * Defines an element of the post process filter chain. Each element is considered
 * to perform a screen space effect.
 * A screen filter can operate in two modes: as standalone or combined with other screen
 * filters of the same post process chain.
 * When in standalone mode, the filter must provide one or more ScreenPass instances 
 * from its getScreenPasses instance method.
 * Otherwise, the filter is supposed to inject its code in the same gpu program as the rest
 * filters of the chain. The filters inject their code in the same order as they are defined
 * in the post process chain.
 */
GG.ScreenFilter = function(spec) {
	spec = spec || {};
	this.standalone = spec.standalone !== undefined ? spec.standalone : false;
	this.screenPasses = spec.screenPasses !== undefined ? spec.screenPasses : null;
};

GG.ScreenFilter.prototype.constructor = GG.ScreenFilter;

/** Called for screen filter that have this.standalone = false */
GG.ScreenFilter.prototype.inject = function (programSource) {
};

/** Called for screen filter that have this.standalone = true */
GG.ScreenFilter.prototype.getScreenPasses = function (programSource) {
	return this.standalone ? this.screenPasses : null;
};

