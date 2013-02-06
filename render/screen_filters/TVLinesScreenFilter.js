GG.TVLinesScreenFilter = function () {		
};

GG.PostProcessChain.registerScreenFilter('tvLines', GG.TVLinesScreenFilter);

GG.TVLinesScreenFilter.prototype.constructor = GG.TVLinesScreenFilter;

GG.TVLinesScreenFilter.prototype.inject = function (programSource) {
	programSource.uniform('float', 'u_fTime0_1')
		.addMainBlock("color = color*0.9 + 0.041*cos(-10.0*u_fTime0_1+v_texCoords.y*1000.0);");
};

GG.TVLinesScreenFilter.prototype.setUniforms = function (program) {

};