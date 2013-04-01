var RequestQueue = require(__dirname+'/../lib/RequestQueue'),
	nPages = 5,
	q;

q = new RequestQueue();
q.setMinTime(3000);

q.addScripts('http://code.jquery.com/jquery-1.9.1.min.js');
q.pushRequest('page',getPageQuery(q));

q.setVar('posts',{});
q.setVar('page',1)

q.on('page', processPage);
q.on('stop', onstop);

q.execute();

function getPageQuery (q) {
	var page = q.getVar('page');
	return {
		method	: 'GET',
		url		: 'https://github.com/blog',
		form	: {
			page : page
		}
	};
}

function processPage(jinn,errors,window) {
	var	$			= window.jQuery,
		postDivs	= $(".blog-post"),
		q			= jinn.getQueue(),
		posts		= q.getVar('posts'),
		currentPage	= q.getVar('page');
	
	console.log('Retrieve page '+currentPage);
	
	postDivs.each( function () {
		var post = $(this),
			meta = post.find('ul.blog-post-meta li'),
			data = {};
		
		data.title = post.find('h2.blog-post-title').text();
		data.date = $( meta.get(0) ).text();
		data.author = $( meta.get(1) ).text();
		data.category = $( meta.get(2) ).text();
				
		['title','date','author','category'].forEach( function (key) {
			data[key] = data[key].replace(/^\s+|\s+$/g,'');
		});
		
		if ( typeof posts[ data.category ] === 'undefined' ) {
			posts[ data.category ] = [];
		}
		
		posts[ data.category ].push( data );
		
	});
	
	q.setVar('posts',posts);
	
	if ( currentPage < nPages ) {
		q.setVar('page',1+currentPage);
		q.pushRequest('page',getPageQuery(q));
	}
	
	jinn.done();
	
}

function onstop (jinn) {
	console.log( JSON.stringify(jinn.getQueue().getVar('posts'),null,3) );
}
