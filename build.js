import fs from 'node:fs';
import { deflateSync } from 'node:zlib';
import { compileFile } from 'pug';
// import { loopWhile } from 'deasync'
// import { handleFilters } from 'pug-filters-async'
import syncFetch from 'sync-fetch';

function plantumlFetchFilter(content, options) {
	const compressedContent = deflateSync(content, { level: 9, memLevel: 9 }).subarray(2, -4).toString('base64').split('').map(char => translation[char] || char).join('');
	return syncFetch(`https://plantuml.com/plantuml/svg/${compressedContent}`).text();
}
function fetchFilter(content, options) {
	return syncFetch(content).text();
}

const standard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const plantuml = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

const translation = {};
for (let i = 0; i < standard.length; i++) translation[standard[i]] = plantuml[i];

function plantumlFilter(content, options) {
	const compressedContent = deflateSync(content, { level: 9, memLevel: 9 }).subarray(2, -4).toString('base64').split('').map(char => translation[char] || char).join('');
	return `<img src="https://plantuml.com/plantuml/svg/${compressedContent}"/>`;
}

const result = compileFile('resulting.pug', { filters: { 'plantuml': plantumlFetchFilter, 'fetch': fetchFilter } });
fs.writeFileSync('resulting.html', result());