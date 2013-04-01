#request-queue

put HTTP requests in a tasks-queue to execute them sequentially and not too often

#Getting Started
Install the module with:

    npm install request-queue


#Documentation

##RequestQueue

The class for the HTTP request queue. Inherits from [TasksQueue](https://github.com/tutukin/tasks-queue).
It hides the methods
`TasksQueue.prototype.pushTask` and `TasksQueue.prototype.unshiftTask`. Use
`RequestQueue.prototype.pushRequest()` and `RequestQueue.prototype.unshiftRequest()`
methods instead.

`RequestQueue` depends on the following modules:

* [request](https://npmjs.org/package/request)
* [jsdom](https://npmjs.org/package/jsdom)

###setRequestDefaults(requestOptions)

Set default options for the request.
See [`request.defaults()`](https://npmjs.org/package/request).

###addScripts(paths)

Add scripts paths or URLs that are passed to jsdom.env as
`scripts` option.

###getScripts()

Return an array of paths added with `addScripts(paths)`.

###pushRequest(requestType,requestOptions)
###unshiftRequest(requestType,requestOptions)
###addRequest(where,requestType,requestOptions)

Insert a request to the queue.

`pushRequest(t,o)` is equivalent to `addRequesr('tail',t,o)`.
`unshiftRequest(t,o)` is equivalent to `addRequesr('head',t,o)`.

If `where` equals to 'head', `addRequest` prepends the request
to the head of the queue, otherwise it appends it to the
tail.

`requestType` is a string, used to distinguish the different
types of requests. Don't use strings that start with double colon
("::type").

`requestOptions` are passed to
[request(options,callback)](https://npmjs.org/package/request) that
does the actual http request.

###requestType event

The `requestType` event is emitted when the response is retrieved
and the DOM is built. Listeners are called with three arguments:

* Jinn instance (See [tasks-queue](https://github.com/tutukin/tasks-queue))
* errors (See [jsdom.env](https://npmjs.org/package/jsdom) callback arguments)
* window (See [jsdom.env](https://npmjs.org/package/jsdom) callback arguments)

#Examples

See examples directory

#Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using Grunt.

#Release History

* April 1, 2013. V. 0.0.1.
Basic functionality


License
Copyright (c) 2013 Andrei V. Toutoukine
Licensed under the MIT license.
