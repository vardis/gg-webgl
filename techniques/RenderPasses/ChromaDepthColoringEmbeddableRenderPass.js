/**
 * Can be used by simply calling the chromaDepthColoring function which will
 * return the chromadepth color:
 * vec3 color = chromaDepthColoring();
 *
 * It adds the following uniforms:
 *	u_chromaBlue: z-depth corresponding to blue
 *	u_chromaRed: z-depth corresponding to red
 */
ChromaDepthColoringEmbeddableRenderPass