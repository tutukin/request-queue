var RequestQueue = require(__dirname+'/../lib/RequestQueue'),
	nPages = 5,
	q, i;

// construct a requests queue
q = new RequestQueue();

// request github no more than once per 3s.
q.setMinTime(3000);

// array to keep blog titles
q.setVar('titles',[]);

// jQuery to help page parsing
q.addScripts('http://code.jquery.com/jquery-1.9.1.min.js');

// push requests for the first 5 pages to the queue
for ( i = 1; i < 6; i++ ) {
	q.pushRequest('page', {
		method	: 'GET',
		url		: 'https://github.com/blog',
		form	: {
			page : i
		}
	});
}

// bind the event listeners to events
q.on('page', onpage);
q.on('stop', onstop);

// start execution
q.execute();

function onpage(jinn,errors,window) {
	var	$		= window.jQuery,
		queue	= jinn.getQueue(),
		titles	= queue.getVar('titles'),
		page	= jinn.getData().requestOptions.form.page;
	
	console.log('Processing page ' + page);
	
	$('h2.blog-post-title').each( function () {
		titles.push( $(this).text().replace(/^\s+|\s+$/g,'') );
	});
	
	console.log('Now there are ' + titles.length + ' titles');
	
	jinn.done();
}

function onstop (jinn) {
	var queue = jinn.getQueue(),
		titles= queue.getVar('titles');
	console.log('Done.');
	console.log('Retrieved ' + titles.length + ' titles.');
	console.log(titles.join("\n"));
}
