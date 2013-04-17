# request-queue

put HTTP requests in a tasks-queue to execute them sequentially but not too often

# Getting Started
Install the module with:

    npm install request-queue

# Documentation

## RequestQueue

The class for the HTTP request queue. Inherits from [TasksQueue](https://github.com/tutukin/tasks-queue).
It hides the methods
`TasksQueue.prototype.pushTask` and `TasksQueue.prototype.unshiftTask`. Use
`RequestQueue.prototype.pushRequest()` and `RequestQueue.prototype.unshiftRequest()`
methods instead.

`RequestQueue` depends on the following modules:

* [request](https://npmjs.org/package/request)
* [jsdom](https://npmjs.org/package/jsdom)
* [iconv](https://npmjs.org/package/iconv)
* [tasks-queue](https://npmjs.org/package/tasks-queue)

### setRequestDefaults(requestOptions)

Set default options for the request.
See [`request.defaults()`](https://npmjs.org/package/request). See also **Encoding issue** below.

### addScripts(paths)

Add scripts paths or URLs that are passed to jsdom.env as
`scripts` option.

### getScripts()

Return an array of paths added with `addScripts(paths)`.

### pushRequest(requestType, requestOptions)
### unshiftRequest(requestType, requestOptions)
### addRequest(where, requestType, requestOptions)

Insert a request to the queue.

`pushRequest(t, o)` is equivalent to `addRequesr('tail', t, o)`.
`unshiftRequest(t, o)` is equivalent to `addRequesr('head', t, o)`.

If `where` equals to 'head', `addRequest()` prepends the request
to the head of the queue, otherwise it appends it to the
tail.

`requestType` is a string, used to distinguish the different
types of requests. Don't use strings that start with double colon
("::type").

`requestOptions` are passed to
[request(requestOptions, callback)](https://npmjs.org/package/request) that
does the actual http request.

### requestType event

The `requestType` event is emitted when the response is retrieved
and the DOM construction is done. Listeners are called with three arguments:

* Jinn instance (See [tasks-queue](https://github.com/tutukin/tasks-queue))
* errors (See [jsdom.env](https://npmjs.org/package/jsdom) callback arguments)
* window (See [jsdom.env](https://npmjs.org/package/jsdom) callback arguments)

# Encoding issue

`request` fails to work with encodings that are not supported by
[ReadebleStream](http://nodejs.org/api/stream.html#stream_readable_setencoding_encoding).
**request-queue** uses [iconv](https://npmjs.org/package/iconv) to solve that. It uses
the response header "content-type" to detect the encoding name. If no charset is
specified in "content-type" header, 'utf8' is used. Optionally you may
override the encoding, using `queue.setRequestDefaults({encoding:<your encoding>});`.
Note, that `<your encoding>` is used by iconv, while `{encoding:"binary"}` option
is passed to `request`.

# Examples

See examples directory

# Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using Grunt.

# Release History

* April 17, 2013. V. 0.0.2
Fixed encoding issue

* April 1, 2013. V. 0.0.1.
Basic functionality


# License
Copyright (c) 2013 Andrei V. Toutoukine
Licensed under the MIT license.
