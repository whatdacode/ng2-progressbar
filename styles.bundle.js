webpackJsonp([1,2],{

/***/ 309:
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ },

/***/ 313:
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ },

/***/ 316:
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(571);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(313)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../css-loader/index.js!./../postcss-loader/index.js!./gh-fork-ribbon.css", function() {
			var newContent = require("!!./../css-loader/index.js!./../postcss-loader/index.js!./gh-fork-ribbon.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },

/***/ 317:
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(572);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(313)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./styles.scss", function() {
			var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },

/***/ 571:
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(309)();
// imports


// module
exports.push([module.i, "/*!\n * \"Fork me on GitHub\" CSS ribbon v0.2.0 | MIT License\n * https://github.com/simonwhitaker/github-fork-ribbon-css\n*/\n\n.github-fork-ribbon {\n  width: 12.1em;\n  height: 12.1em;\n  position: absolute;\n  overflow: hidden;\n  top: 0;\n  right: 0;\n  z-index: 9999;\n  pointer-events: none;\n  font-size: 13px;\n  text-decoration: none;\n  text-indent: -999999px;\n}\n\n.github-fork-ribbon.fixed {\n  position: fixed;\n}\n\n.github-fork-ribbon:before, .github-fork-ribbon:after {\n  /* The right and left classes determine the side we attach our banner to */\n  position: absolute;\n  display: block;\n  width: 15.38em;\n  height: 1.54em;\n  \n  top: 3.23em;\n  right: -3.23em;\n  \n  -webkit-transform: rotate(45deg);\n  -moz-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  -o-transform: rotate(45deg);\n  transform: rotate(45deg);\n}\n\n.github-fork-ribbon:before {\n  content: \"\";\n\n  /* Add a bit of padding to give some substance outside the \"stitching\" */\n  padding: .38em 0;\n\n  /* Set the base colour */\n  background-color: #a00;\n\n  /* Set a gradient: transparent black at the top to almost-transparent black at the bottom */\n  background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0.15)));\n  background-image: -webkit-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));\n  background-image: -moz-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));\n  background-image: -ms-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));\n  background-image: -o-linear-gradient(top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));\n  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));\n\n  /* Add a drop shadow */\n  -webkit-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);\n  -moz-box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);\n  box-shadow: 0 .15em .23em 0 rgba(0, 0, 0, 0.5);\n\n  pointer-events: auto;\n}\n\n.github-fork-ribbon:after {\n  /* Set the text from the title attribute */\n  content: attr(title);\n\n  /* Set the text properties */\n  color: #fff;\n  font: 700 1em \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  line-height: 1.54em;\n  text-decoration: none;\n  text-shadow: 0 -.08em rgba(0, 0, 0, 0.5);\n  text-align: center;\n  text-indent: 0;\n\n  /* Set the layout properties */\n  padding: .15em 0;\n  margin: .15em 0;\n\n  /* Add \"stitching\" effect */\n  border-width: .08em 0;\n  border-style: dotted;\n  border-color: #fff;\n  border-color: rgba(255, 255, 255, 0.7);\n}\n\n.github-fork-ribbon.left-top, .github-fork-ribbon.left-bottom {\n  right: auto;\n  left: 0;\n}\n\n.github-fork-ribbon.left-bottom, .github-fork-ribbon.right-bottom {\n  top: auto;\n  bottom: 0;\n}\n\n.github-fork-ribbon.left-top:before, .github-fork-ribbon.left-top:after, .github-fork-ribbon.left-bottom:before, .github-fork-ribbon.left-bottom:after {\n  right: auto;\n  left: -3.23em;\n}\n\n.github-fork-ribbon.left-bottom:before, .github-fork-ribbon.left-bottom:after, .github-fork-ribbon.right-bottom:before, .github-fork-ribbon.right-bottom:after {\n  top: auto;\n  bottom: 3.23em;\n}\n\n.github-fork-ribbon.left-top:before, .github-fork-ribbon.left-top:after, .github-fork-ribbon.right-bottom:before, .github-fork-ribbon.right-bottom:after {\n  -webkit-transform: rotate(-45deg);\n  -moz-transform: rotate(-45deg);\n  -ms-transform: rotate(-45deg);\n  -o-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n}", ""]);

// exports


/***/ },

/***/ 572:
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(309)();
// imports
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700);", ""]);

// module
exports.push([module.i, "body, html {\n  min-height: 100%; }\n\nbody {\n  font-family: 'Source Sans Pro', sans-serif;\n  color: #3d3c3c;\n  margin: 0;\n  padding: 10px;\n  background: -moz-linear-gradient(-45deg, rgba(136, 212, 152, 0) 73%, rgba(136, 212, 152, 0.3) 81%, #88d498 100%);\n  background: -webkit-linear-gradient(-45deg, rgba(136, 212, 152, 0) 73%, rgba(136, 212, 152, 0.3) 81%, #88d498 100%);\n  background: linear-gradient(135deg, rgba(136, 212, 152, 0) 73%, rgba(136, 212, 152, 0.3) 81%, #88d498 100%);\n  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0088d498', endColorstr='#88d498',GradientType=1 ); }\n\napp-root {\n  display: flex;\n  flex-direction: column;\n  justify-content: center; }\n\nbutton {\n  color: white;\n  margin: 2px 0;\n  background-color: #1EB77F;\n  border: 0;\n  padding: 4px 15px;\n  border-radius: 4px;\n  transition: all .15s ease;\n  outline: 0; }\n  button:hover {\n    opacity: 0.8;\n    cursor: pointer; }\n  button:active {\n    margin-left: 2px; }\n\nheader {\n  flex: 0 0 300px;\n  display: flex;\n  flex-direction: column;\n  margin: 10px 0; }\n\n.brand {\n  display: flex; }\n\n.social {\n  flex: 0 0 80px; }\n\n.title {\n  padding-top: 30px; }\n  .title .angular {\n    color: #1EB77F;\n    text-shadow: 1px 2px 2px #3d3c3c; }\n\n.logo {\n  position: relative;\n  display: flex;\n  flex: 0 0 230px;\n  justify-content: center;\n  align-items: center; }\n\n.ng-logo {\n  width: 160px; }\n\n.links, .badges {\n  text-align: right; }\n\n.component-outer {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-size: 14px; }\n\n.component {\n  margin-bottom: 10px;\n  display: flex;\n  flex-wrap: wrap;\n  background-color: #303030;\n  color: #EAFDA1;\n  padding: 10px;\n  border-radius: 4px;\n  font-family: monospace; }\n  .component .tag-name, .component .input-name, .component .input-wrapper, .component .input, .component input {\n    padding: 0; }\n  .component .tag-name {\n    color: #2C7CD1;\n    line-height: 30px;\n    font-weight: bold; }\n  .component .input-name {\n    color: #EAFDA1; }\n    .component .input-name:before {\n      content: \"[\";\n      color: #EAFDA1; }\n    .component .input-name:after {\n      content: \"]\";\n      color: #EAFDA1; }\n  .component .input-wrapper {\n    margin: 3px; }\n  .component .input {\n    color: #92c34e; }\n    .component .input:before {\n      content: '\"'; }\n    .component .input:after {\n      content: '\"'; }\n    .component .input span {\n      color: #92c34e;\n      font-style: normal; }\n    .component .input input, .component .input select {\n      color: #92c34e;\n      border: 0;\n      font-family: monospace;\n      outline: 0;\n      background-color: #3d3c3c; }\n\n.container {\n  max-width: 700px;\n  margin: 0 auto; }\n\ntable {\n  font-size: 0.8em;\n  margin-bottom: 10px; }\n  table strong {\n    font-weight: bold;\n    color: #2C7CD1; }\n\n.try-this {\n  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#dd3bd3+0,2c8ddd+20,e54124+40,eaea25+60,1cb575+81,37e22b+100 */\n  background: #dd3bd3;\n  /* Old browsers */\n  background: -moz-linear-gradient(-45deg, #dd3bd3 0%, #2c8ddd 20%, #e54124 40%, #eaea25 60%, #1cb575 81%, #37e22b 100%);\n  /* FF3.6-15 */\n  background: -webkit-linear-gradient(-45deg, #dd3bd3 0%, #2c8ddd 20%, #e54124 40%, #eaea25 60%, #1cb575 81%, #37e22b 100%);\n  /* Chrome10-25,Safari5.1-6 */\n  background: linear-gradient(135deg, #dd3bd3 0%, #2c8ddd 20%, #e54124 40%, #eaea25 60%, #1cb575 81%, #37e22b 100%);\n  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#dd3bd3', endColorstr='#37e22b',GradientType=1 );\n  /* IE6-9 fallback on horizontal gradient */ }\n", ""]);

// exports


/***/ },

/***/ 597:
/***/ function(module, exports, __webpack_require__) {

__webpack_require__(317);
module.exports = __webpack_require__(316);


/***/ }

},[597]);
//# sourceMappingURL=styles.map