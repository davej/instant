(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var parseUrl = require('./url')

/**
 * Find the first element with the given tag-name whoes property `prop`
 * matches the specified url.
 */
exports.byURL = function(name, prop, url) {
  var el = document.getElementsByTagName(name)
  for (var i=0; i < el.length; i++)
    if (parseUrl(el[i][prop]).pathname == url.pathname) return el[i]
}

exports.bySelector = function(sel) {
  return document.querySelector && document.querySelector(sel)
}

exports.byClass = function(cls) {
  return exports.bySelector('.' + cls)
}

},{"./url":4}],2:[function(require,module,exports){
var on = require('sendevent')
  , parse = require('./url')
  , find = require('./find')
  , replace = require('./replace')

var token

on('/instant/events', function(ev) {
  if (ev.token) {
    if (!token) token = ev.token
    if (token != ev.token) return location.reload()
  }

  // reload page if it contains an element with the given class name
  if (ev.className) {
    if (find.byClass(ev.className)) location.reload()
    return
  }

  // reload page if it contains an element that matches the given selector
  if (ev.selector) {
    if (find.bySelector(ev.selector)) location.reload()
    return
  }

  // resolve the URL
  var url = parse(ev.url)
  
  // Remove query and hash strings
  var normalizedLocationHref = location.href.split('#')[0].split('?')[0]

  // reload the page
  if (url.href == normalizedLocationHref) {
    location.reload()
    return
  }

  // look for a stylesheet
  var el = find.byURL('link', 'href', url)
  if (el) return replace(el, url.pathname + '?v=' + new Date().getTime())

  // look for a script
  el = find.byURL('script', 'src', url)
  if (el) location.reload()
})

},{"./find":1,"./replace":3,"./url":4,"sendevent":5}],3:[function(require,module,exports){
/**
 * Replace `el` with a new <link rel="stylesheet"> tag using the given URL.
 * We have to create a new element instead of simply updating the `href`
 * attribute of the existing link, since some browsers otherwise  would not
 * immediately repaint the page.
 */
 module.exports = function(el, href) {
  var p = el.parentNode
  var ref = el.nextSibling
  var s = document.createElement('link')
  s.rel = 'stylesheet'
  s.type = 'text/css'
  s.href = href
  s.onload = function() {
    p.removeChild(el)
  }
  p.insertBefore(s, ref)
}

},{}],4:[function(require,module,exports){
module.exports = function(s) {
  var o = new Option()
  o.innerHTML = '<a>'
  o.firstChild.href = s
  o.innerHTML += ''
  return o.firstChild
}
},{}],5:[function(require,module,exports){
module.exports = function(url, handle) {

  if (typeof url == 'function') {
    handle = url
    url = '/eventstream'
  }

  /**
   * Iframe-fallback for browsers that don't support EventSource.
   */
  function createIframe() {
    var doc = document

    // On IE use an ActiveXObject to prevent the "throbber of doom"
    // see: http://stackoverflow.com/a/1066729
    if (window.ActiveXObject) {
      doc = new ActiveXObject("htmlfile")
      doc.write('<html><body></body></html>')

      // set a global variable to prevent the document from being garbage
      // collected which would close the connection:
      window.eventStreamDocument = doc

      // Expose a global function that can be invoked from within the iframe:
      doc.parentWindow.handleSentEvent = handle

      appendIframe(doc, url)
    }
    else {
      // Most likely an old Android device. The trick here is not to send
      // the 4KB padding, but to immediately reload the iframe afer a message
      // was received.
      window.handleSentEvent = handle
      setTimeout(function() { appendIframe(document, url+'?close') }, 1000)
    }
  }

  function appendIframe(doc, url) {
    var i = doc.createElement('iframe')
    i.style.display = 'none'
    i.src = url
    doc.body.appendChild(i)
  }

  var init = function() {
    var source = new EventSource(url)
    source.onmessage = function(ev) {
      handle(JSON.parse(ev.data))
    }
  }

  if (!window.EventSource) init = createIframe
  if (window.attachEvent) attachEvent('onload', init)
  else addEventListener('load', init)
}

},{}]},{},[2]);
