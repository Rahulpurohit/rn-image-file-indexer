const fs = require('fs');

function getFiles(dir = '.', files_, images = {}) {
	files_ = files_ || [];
	var files = fs.readdirSync(dir);
	const folderName = getUniqueName(dir);
	if (!images.hasOwnProperty(folderName)) {
		if (folderName != '.') {
			images[folderName] = {};
		}
	}
	for (var i in files) {
		var name = dir + '/' + files[i];
		if (fs.statSync(name).isDirectory()) {
			getFiles(name, files_, images);
		} else {
			const arr = [];
			if (!(name.includes('2x') || name.includes('3x'))) {
				const fileName = getUniqueName(files[i]);
				if (name.includes('.png') || name.includes('.jpg') || name.includes('.jpeg')) {
					if (folderName == '.') {
						images[fileName] = { source: `require(${name})` };
						if (!!appendObjectKey) images[fileName][appendObjectKey] = appendObjectValue;
					} else {
						images[folderName][fileName] = { source: `require(${name})` };
						if (!!appendObjectKey) images[folderName][fileName][appendObjectKey] = appendObjectValue;
					}
				}
			}
		}
	}
	return images;
}

getUniqueName = (fileName = '') => {
	fileName = fileName.replace(/\.[^/.]+$/, '');
	var result = fileName
		.trim() //might need polyfill if you need to support older browsers
		.toLowerCase() //lower case everything
		.replace(
			/([^A-Z0-9]+)(.)/gi, //match multiple non-letter/numbers followed by any character
			function(match) {
				return arguments[2].toUpperCase(); //3rd index is the character we need to transform uppercase
			}
		);

	return camelize(result);
};

function camelize(str) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : '_' + letter.toUpperCase();
		})
		.replace(/\s+/g, '');
}

function stringify(obj_from_json) {
	if (typeof obj_from_json !== 'object' || Array.isArray(obj_from_json)) {
		return JSON.stringify(obj_from_json, null, 2);
	}
	var props = Object.keys(obj_from_json)
		.map(key => `${key}:${stringify(obj_from_json[key])}`)
		.join(',\n');
	return `{${props}}`;
}
var constName = 'AppImages';
var appendObjectKey = undefined;
var appendObjectValue = undefined;
if (fs.existsSync('./Config.json')) {
	var jsonObj = require('./Config.json');
	constName = !!jsonObj.constName ? jsonObj.constName : 'AppImages';
	appendObjectKey = !!jsonObj.constObjectKey ? jsonObj.constObjectKey : undefined;
	appendObjectValue = !!jsonObj.constObjectValue ? jsonObj.constObjectValue : undefined;
}

console.log(`const ${constName} =${stringify(getFiles())}  \n\n module.exports = {${constName}};`);
