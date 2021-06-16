export const renderScripts = ({scripts, location, type}) => {

	let output = '';
	const {sortByOrderKey, isUrl} = Utilities;
	const scriptLocations = ['header', 'footer'];
	
	location = (typeof location === 'undefined') ? scriptLocations[1] : location;
	location = (scriptLocations.includes(location)) ? location : scriptLocations[1];
	
	Object.keys(scripts)
	.map(key => {
		const order = scripts[key].order || 100;
		let data = scripts[key];
		if(!data.hasOwnProperty('location'))
		{
			data.location = 'footer';
		}
		return {key, order, data};
	})
	.filter(i => i.data.location === location && (i.data.type === type || i.data.file.includes(`.${type}`)))
	.sort(sortByOrderKey)
	.map(row => {
		let output = {}
		const data = row.data;
		let scriptName = '';
		const file = data.file;
		const remote = (isUrl(file)) ? true : false;
		const {async, concat: isConcat, defer} = data || false;
		const inline = data.inline || [];
		const concat = (remote) ? false : isConcat;
		
		switch(type)
		{
			case 'js':
				scriptName = `scripts_${location}`;
				break;
			case 'css':
				scriptName = 'styles';
				break;
		}
		
		if(async)
		{
			scriptName += '_async';
		}
		if(defer)
		{
			scriptName += `_defer`;
		}
		if(concat)
		{
			scriptName += '_concat';
		}
		if(remote)
		{
			scriptName += '_remote';
		}
		
		let fileArgs = {
			files: [{
				file, 
				inline
			}],
			async,
			defer,
			concat,
			remote,
			type
		};
		
		if(!output.hasOwnProperty(scriptName))
		{
			output[scriptName] = fileArgs;
		}
		else
		{
			output[scriptName].files.push(file);
		}
		return {key: scriptName, data: output};
	})
	.forEach(row => {
		const {files, async, defer, concat, remote} = row.data[row.key];
		let pathName = (concat) ? 'concat/?files=' : '';
		let fileList = [...files.map(row => ({
			file: row.file, 
			inline: row.inline
		}))];
		
		const fileArgs = {
			pathName,
			file: fileList,
			async,
			defer,
			remote,
			concat
		};
		
		if(type === 'js')
		{
			if(concat)
			{	
				output += Script(fileArgs);
			}
			else
			{
				fileList.forEach(row => {
					output += Script({...fileArgs, file: row});
				});
			}
		}
		else if(type === 'css')
		{
			if(concat)
			{
				output += Link(fileArgs);				
			}
			else
			{
				fileList.forEach(row => {
					output += Link({...fileArgs, file: row});	
				});
			}
		}
	});
	
	return output;
};

const Link = ({pathName, file, remote, concat}) => {
	
	let fileName = [];
	let output = [];
	let inline = [];
	
	if(concat)
	{
		file.forEach(r => {
			fileName.push(r.file);
			r.inline.forEach(i => inline.push({
				script: `<style>${i.content}</style>`, 
				location: i.location
			}));			
		});
	}
	else
	{
		file.inline.forEach(i => inline.push({
			script: `<style>${i.content}</style>`, 
			location: i.location
		}));
	}
	
	fileName.join(',');
	
	const url = (remote) ? fileName : `/static/${pathName}${fileName}`;
	output.push(`<link rel="stylesheet" href="${url}">`);
	
	inline.forEach(row => {		
		switch(row.location)
		{
			case 'before':
				output.unshift(row.script);
				break;
			case 'after':
				output.push(row.script);
				break;
			default:
				output.unshift(row.script);
		}
	});

	return output.join('\n\t\t');
};

const Script = ({pathName, file, async, defer, remote, concat}) => {
	
	let fileName = [];
	let output = [];
	let inline = [];
	
	if(concat)
	{
		file.forEach(r => {
			fileName.push(r.file);
			r.inline.forEach(i => inline.push({
				script: `<script>${i.content}</script>`, 
				location: i.location
			}));			
		});
	}
	else
	{
		fileName.push(file.file);
		file.inline.forEach(i => inline.push({
			script: `<script>${i.content}</script>`, 
			location: i.location
		}));		
	}
	
	fileName.join(',');
	
	const url = (remote) ? fileName : `/static/${pathName}${fileName}`;
	
	output.push(`<script src="${url}" ${async ? 'async' : ''} ${defer ? 'defer' : ''}></script>`);
	
	inline.forEach(row => {
		switch(row.location)
		{
			case 'before':
				output.unshift(row.script);
				break;
			case 'after':
				output.push(row.script);
				break;
			default:
				output.unshift(row.script);
		}
	});
		
	return output.join('\n\t\t');
};