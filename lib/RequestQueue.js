/*
 * request-queue
 * 
 *
 * Copyright (c) 2013 Andrei V. Toutoukine
 * Licensed under the MIT license.
 */

'use strict';

var	util		= require('util'),
	TasksQueue	= require('tasks-queue'),
	request		= require('request'),
	jsdom		= require('jsdom'),
	Iconv		= require('iconv').Iconv,
	requestTaskName	= '::request';

module.exports	= RequestQueue;

util.inherits(RequestQueue,TasksQueue);

function RequestQueue () {
	TasksQueue.call(this);
	
	this._pushTask		= this.pushTask;
	this._unshiftTask	= this.unshiftTask;
	
	this.pushTask		= undefined;
	this.unshiftTask	= undefined;
	
	this._request		= request;
	this._scripts		= [];
	
	this._dbg = false;
	
	this.on('::request',this.onrequest);
	this.on('::response',this.onresponse);
	this.on('::documentready',this.ondocumentready);
	
}

( function (p) {
	p.addRequest		= addRequest;
	p.pushRequest		= pushRequest;
	p.unshiftRequest	= unshiftRequest;
	
	p.setRequestDefaults= setRequestDefaults;
	
	p.addScripts		= addScripts;
	p.getScripts		= getScripts;
	
	p._debug			= _debug;
	
	p.onrequest			= onrequest;
	p.onresponse		= onresponse;
	p.ondocumentready	= ondocumentready;
	
} )(RequestQueue.prototype);


function pushRequest (requestName,options) {
	/*jshint validthis: true */
	this.addRequest("tail",requestName,options);
}

function unshiftRequest (requestName,options) {
	/*jshint validthis: true */
	this.addRequest("head",requestName,options);
}

function addRequest (where,requestType,options) {
	/*jshint validthis: true */
	var	that = this,
		data = {
			requestType : requestType,
			requestOptions: options
		};
	
	switch (where) {
		case "tail":
			this._pushTask(requestTaskName,data);
			break;
		case "head":
			this._unshiftTask(requestTaskName,data);
			break;
		default:
			this._pushTask(requestTaskName,data);
			break;
	}
}



function setRequestDefaults (options) {
	/*jshint validthis: true */
	this._request = request.defaults(options);
}



function addScripts (path) {
	/*jshint validthis: true */
	this._scripts = this._scripts.concat(path);
}


function getScripts () {
	/*jshint validthis: true */
	return this._scripts;
}



function onrequest (jinn,data) {
	/*jshint validthis: true */
	var that = this,
		encoding = data.requestOptions.encoding,
		options	= __clone(data.requestOptions);
	
	options.encoding = "binary";
	
	this._request(options, function (error, response, body) {
		var conv, ct;
		
		if (error) {
			throw error;
		}
		
		if ( ! encoding ) {
			ct = response.headers['content-type'] || "";
			ct = ct.match(/charset=(.+)$/);
			if ( ct ) {
				encoding = ct[1];
			}
			else {
				encoding = 'utf8';
			}
		}
		
		// for redirect (302) there may be no body
		if (body) {
			body = new Buffer(body, "binary");
			conv = new Iconv(encoding,"utf8");
			body = conv.convert(body).toString();
		}
		
		that.emit('::response',jinn,error,response,body);
	});
}


function onresponse(jinn,error,response,body) {
	/*jshint validthis: true */
	var that = this;
	if ( error ) {
		throw new Error(error);
	}
	
	body = body || '';
	
	jsdom.env({
		html	: body,
		scripts	: this.getScripts(),
		done	: function (errors,window) {
			that.emit('::documentready',jinn,errors,window);
		}
	});
}


function ondocumentready(jinn,errors,window) {
	/*jshint validthis: true */
	var data = jinn.getData();
	jinn.on('done', function () {
		if (window && typeof window.cloas === 'function') window.close();
	});
	this.emit(data.requestType,jinn,errors,window);
}

function _debug (sw) {
	/*jshint validthis: true */
	if ( typeof sw === 'undefined' ) {
		return this._dbg;
	}
	else {
		this._dbg = sw ? true: false;
	}
}

function __clone(object) {
	var clone = {};
	Object.getOwnPropertyNames(object).forEach( function (k) {
		clone[k] = object[k];
	});
	return clone;
}