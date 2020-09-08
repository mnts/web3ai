import text from './types/text.js';
import folder from './types/folder.js';
import gallery from './types/gallery.js';
import catalog from './types/catalog.js';
import file from './types/file.js';
import story from './types/story.js';
import map from './types/map.js';
import source from './types/source.js';
import graph from './types/graph.js';
import htm_page from './types/htm_page.js';
import neuron from './Neuron.js';
import polymer from './Neuron_polymer.js';

var types = {text, page: text, map, neuron, gallery, catalog, folder, fldr: folder, site: folder, source, graph, htm_page, polymer, story};

types.page = types.text;

export default types;
