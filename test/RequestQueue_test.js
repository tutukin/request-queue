'use strict';

var	expect			= require('expect.js'),
	sinon			= require('sinon'),
	mock			= require('mock'),
	TasksQueue		= require('tasks-queue'),
	mocks			= {
		request	: sinon.spy(),
		jsdom	: { env : sinon.spy() }
	},
	RequestQueue	= mock(__dirname + '/../lib/RequestQueue', mocks);

describe('RequestQueue', function() {
	var q;
	
	beforeEach(function(done) {
		mocks.request.reset();
		mocks.jsdom.env.reset();
		
		RequestQueue.prototype.on = sinon.spy();
		RequestQueue.prototype.emit = sinon.spy();
		
		q = new RequestQueue();
		q._debug(true);
		
		done();
	});
	
	
	describe('constructor', function() {
		it('should be a function', function(done) {
			expect(RequestQueue).to.be.a('function');
			done();
		});
		
		it('should bind self.onrequest to ::request event', function(done) {
			expect( q.on.calledWithExactly('::request',q.onrequest) ).to.equal(true);
			done();
		});
		
		it('should bind self.onresponse th ::response event', function(done) {
			expect( q.on.calledWithExactly('::response',q.onresponse) ).to.equal( true );
			done();
		});
		
		it('should bind self.ondocumentready to ::documentready event', function(done) {
			expect( q.on.calledWithExactly('::documentready',q.ondocumentready) ).to.equal(true);
			done();
		});
		
		it('should bind only the abovementioned events', function(done) {
			expect(q.on.callCount).to.equal(3);
			done();
		});
	});
	
	describe('instance', function() {
		it('should be an instance of RequestQueue', function(done) {
			expect(q).to.be.a(RequestQueue);
			done();
		});
		
		it('should  be an instance of TasksQueue', function(done) {
			expect(q).to.be.a(TasksQueue);
			done();
		});
		
		it('should hide TasksQueue#pushTask() method', function(done) {
			expect( q.pushTask ).to.be(undefined);
			expect( q._pushTask ).to.equal(TasksQueue.prototype.pushTask);
			done();
		});
		
		it('should hide TasksQueue#unshiftTask() method', function(done) {
			expect(q.unshiftTask).to.be(undefined);
			expect(q._unshiftTask).to.equal(TasksQueue.prototype.unshiftTask);
			done();
		});
	});
	

	
	describe('#pushRequest(requestName,options)', function() {
		it('should be an instance method', function(done) {
			expect(q.pushRequest).to.be.a('function');
			done();
		});
		
		it('should call #addRequest("tail",requestName,options)', function(done) {
			var	requestName	= 'my request',
				options		= {};
			
			q.addRequest = sinon.spy();
			
			q.pushRequest(requestName, options);
			
			expect( q.addRequest.calledOnce ).to.equal(true);
			expect( q.addRequest.firstCall.args[0] ).to.equal("tail");
			expect( q.addRequest.firstCall.args[1] ).to.equal(requestName);
			expect( q.addRequest.firstCall.args[2] ).to.equal(options);
			
			done();
		});
	});
	
	
	
	describe('#unshiftRequest(requestName,options)', function() {
		it('should be an instance method', function(done) {
			expect(q.unshiftRequest).to.be.a('function');
			done();
		});
		
		it('should call #addRequest("head",requestName,options)', function(done) {
			var	requestName	= 'my request',
				options		= {};
			
			q.addRequest = sinon.spy();
			
			q.unshiftRequest(requestName, options);
			
			expect( q.addRequest.calledOnce ).to.equal(true);
			expect( q.addRequest.firstCall.args[0] ).to.equal("head");
			expect( q.addRequest.firstCall.args[1] ).to.equal(requestName);
			expect( q.addRequest.firstCall.args[2] ).to.equal(options);
			
			done();
		});
	});
	
	
	
	describe('#addRequest(where,requestName,options)', function() {
		var requestName, requestTaskName, options;
		
		beforeEach(function(done) {
			requestName = 'my request';
			requestTaskName	= '::request';
			options		= {};
			
			q._pushTask		= sinon.spy();
			q._unshiftTask	= sinon.spy();
			
			done();
		});
		
		it('should be an instance method', function(done) {
			expect(q.addRequest).to.be.a('function');
			done();
		});
		
		it('should call TasksQueue#pushTask(taskName,options) method if <where> === "tail"', function(done) {
			q.addRequest('tail',requestName,options);
			expect( q._pushTask.calledOnce ).to.equal(true);
			expect( q._unshiftTask.called ).to.equal(false);
			done();
		});
		
		it('should call TasksQueue#unshiftTask() method if <where> === "head"', function(done) {
			q.addRequest('head',requestName,options);
			expect( q._unshiftTask.calledOnce ).to.equal(true);
			expect( q._pushTask.called ).to.equal(false);
			done();
		});
		
		it('should call TasksQueue#pushTask() method if <where> is neither "head" nor "tail"', function(done) {
			q.addRequest('qqq');
			expect( q._pushTask.calledOnce ).to.equal(true);
			expect( q._unshiftTask.called ).to.equal(false);
			done();
		});
		
		it('should add tasks named "::request" to the queue', function(done) {
			q.addRequest('tail',requestName);
			q.addRequest('head',requestName);
			expect( q._pushTask.firstCall.args[0] ).to.equal( requestTaskName );
			expect( q._unshiftTask.firstCall.args[0] ).to.equal( requestTaskName );
			done();
		});
		
		describe('<data> for ::request task', function() {
			var data;
			
			beforeEach(function(done) {
				q.addRequest('head',requestName,options);
				data = q._unshiftTask.firstCall.args[1];
				done();
			});
			
			it('should keep requestName in data.requestType', function(done) {
				expect(data.requestType).to.equal(requestName);
				done();
			});
			
			it('should keep options in the data.requestOptions', function(done) {
				expect(data.requestOptions).to.equal(options);
				done();
			});
		});
		
	});

	
	describe('#onrequest(jinn,data)', function() {
		var jinn,data;
		
		beforeEach(function(done) {
			jinn = {};
			data = {
					requestOptions : {}
			};
			done();
		});
		
		it('should be an instance method', function(done) {
			expect(q.onrequest).to.be.a('function');
			done();
		});
		
		it('should call #_request(data.requestOptions,callback)', function(done) {
			q._request = sinon.spy();
			
			q.onrequest(jinn,data);
			
			expect(q._request.calledOnce).to.equal(true);
			expect(q._request.firstCall.args[0]).to.equal(data.requestOptions);
			expect(q._request.firstCall.args[1]).to.be.a('function');
			
			done();
		});
		
		describe('<callback>', function() {
			var callback,error,response,body;
			
			beforeEach(function(done) {
				q._request = sinon.spy();
				q.onrequest(jinn,data);
				callback = q._request.firstCall.args[1];
				
				error = {};
				response = {};
				body = {};
				
				done();
			});
			
			it('should emit ::response event, passing jinn, error, response and body to the listeners', function(done) {
				var call;
				
				callback(error,response,body);
				
				expect(q.emit.calledOnce).to.equal(true);
				
				call = q.emit.firstCall;
				
				expect( call.args[0] ).to.equal('::response');
				expect( call.args[1] ).to.equal(jinn);
				expect( call.args[2] ).to.equal(error);
				expect( call.args[3] ).to.equal(response);
				expect( call.args[4] ).to.equal(body);
				
				done();
			});
			
		});
	});
	
	
	describe('#onresponse(jinn,error,response,body)', function() {
		var jinn,error,response,body;
		
		beforeEach(function(done) {
			jinn = {};
			error = null;
			response = {};
			body = '';
			done();
		});
		
		it('should be an instance method', function(done) {
			expect(q.onresponse).to.be.a('function');
			done();
		});
		
		it('should throw Error if <error> == true', function(done) {
			error = "an error";
			expect( function () {
				q.onresponse(jinn,error,response,body);
			}).to.throwError(error);
			done();
		});
		
		it('should call jsdom.env()', function(done) {
			q.onresponse();
			expect( mocks.jsdom.env.calledOnce ).to.equal(true);
			done();
		});
		
		it('should pass a body that was returned by request()', function(done) {
			var body = 'some body';
			
			q.onresponse(jinn,null,response,body);
			
			expect( mocks.jsdom.env.calledOnce ).to.equal(true);
			expect( mocks.jsdom.env.firstCall.args[0].html).to.equal(body);
			
			done();
		});
		
		it('should pass a default body if none was returned by request()', function(done) {
			q.onresponse(jinn,null,response,undefined);
			expect( mocks.jsdom.env.firstCall.args[0].html).to.be.a('string');
			done();
		});
		
		it('should pass a callback to jsdom.env', function(done) {
			q.onresponse(jinn,null,response,body);
			expect( mocks.jsdom.env.firstCall.args[0].done ).to.be.a('function');
			done();
		});
		
		it('should pass <scripts> array to jsdom.env()', function(done) {
			var	n		= 5,
				paths	= _get_paths(n);
			
			q.addScripts(paths);
			q.onresponse();
			
			expect( mocks.jsdom.env.firstCall.args[0].scripts ).to.eql(paths);
			
			done();
		});
		
		describe('jsdom.env\'s done callback', function() {
			var callback;
			
			beforeEach(function(done) {
				q.onresponse(jinn,null,response,body);
				callback = mocks.jsdom.env.firstCall.args[0].done;
				done();
			});
			
			it('should emit ::documentready event passing jinn, errors and window to listeners', function(done) {
				var call, errors, window;
				
				errors = null;
				window = {};
				
				callback(errors,window);
				
				expect(q.emit.calledOnce).to.equal(true);
				
				call = q.emit.firstCall;
				
				expect( call.args[0] ).to.equal("::documentready");
				expect( call.args[1] ).to.equal(jinn);
				expect( call.args[2] ).to.equal(errors);
				expect( call.args[3] ).to.equal(window);
				
				done();
			});
		});
	});
	
	
	describe('#ondocumentready(jinn,errors,window)', function() {
		var jinn,errors,window,requestType;
		
		beforeEach(function(done) {
			requestType = 'a type of a request';
			jinn = {
				getData : sinon.stub().returns({requestType : requestType}),
				on		: sinon.spy()
			};
			errors = null;
			window = {
					close : sinon.spy()
			};
			done();
		});
		
		it('should be an instance method', function(done) {
			expect(q.ondocumentready).to.be.a('function');
			done();
		});
		
		it('should emit <requestType> event', function(done) {
			var call;
			
			q.ondocumentready(jinn,errors,window);
			
			expect(q.emit.calledOnce).to.equal(true);
			
			call = q.emit.firstCall;
			
			expect( call.args[0] ).to.equal(requestType);
			expect( call.args[1] ).to.equal(jinn);
			expect( call.args[2] ).to.equal(errors);
			expect( call.args[3] ).to.equal(window);
			
			done();
		});
		
		it('should bind a listener to jinn\' done event that closes the window', function(done) {
			var call;
			
			q.ondocumentready(jinn,errors,window);
			
			expect(jinn.on.calledOnce).to.equal(true);
			
			call = jinn.on.firstCall;
			
			expect( call.args[0] ).to.equal('done');
			expect( call.args[1] ).to.be.a('function');
			
			expect( window.close.called ).to.equal(false);
			
			call.args[1]();
			
			expect( window.close.called ).to.equal(true);
			
			done();
		});
	});
	
	
	describe('#setRequestDefaults(options)', function() {
		it('should be an instance method', function(done) {
			expect( q.setRequestDefaults ).to.be.a('function');
			done();
		});
		it('should call request.defaults, passing the options to it', function(done) {
			var wrapper = {},
				options = {};
			
			mocks.request.defaults = sinon.stub().returns(wrapper);
			q.setRequestDefaults(options);
			
			expect( mocks.request.defaults.calledOnce ).to.equal(true);
			expect( q._request ).to.equal(wrapper);
			done();
		});
	});
	
	describe('#addScripts(paths)', function() {
		it('should be an instance method', function(done) {
			expect( q.addScripts ).to.be.a('function');
			done();
		});
		
		it('should add path to the <scripts> array', function(done) {
			var path = '/somewhere/there/is/a/script.js';
			q.addScripts(path);
			expect( q.getScripts()[0] ).to.equal(path);
			done();
		});
		
		it('should append an array of paths to <scripts> array', function(done) {
			var	n = 5,
				paths = _get_paths(n),
				i, scripts;
			
			q.addScripts(paths);
			scripts = q.getScripts();
			
			for (i = 0; i < n; i++) {
				expect( scripts[i] ).to.equal(paths[i]);
			}
			
			done();
		});
	});
	
	describe('#getScripts()', function() {
		it('should be an instance method', function(done) {
			expect( q.getScripts ).to.be.a('function');
			done();
		});
		
		it('should return an empty array by default', function(done) {
			expect( q.getScripts() ).to.eql([]);
			done();
		});
	});
});


function _get_paths (n) {
	var i, paths = [];
	for ( i = 0; i<n; i++ ) {
		paths.push('/path/to/place/'+i+'/script-'+i+'.js');
	}
	return paths;
}