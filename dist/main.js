/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/colcade/colcade.js":
/*!*****************************************!*\
  !*** ./node_modules/colcade/colcade.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Colcade v0.2.0
 * Lightweight masonry layout
 * by David DeSandro
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */
  /*global define: false, module: false */
  if ( true ) {
    // AMD
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}

}( window, function factory() {

// -------------------------- Colcade -------------------------- //

function Colcade( element, options ) {
  element = getQueryElement( element );

  // do not initialize twice on same element
  if ( element && element.colcadeGUID ) {
    var instance = instances[ element.colcadeGUID ];
    instance.option( options );
    return instance;
  }

  this.element = element;
  // options
  this.options = {};
  this.option( options );
  // kick things off
  this.create();
}

var proto = Colcade.prototype;

proto.option = function( options ) {
  this.options = extend( this.options, options );
};

// globally unique identifiers
var GUID = 0;
// internal store of all Colcade intances
var instances = {};

proto.create = function() {
  this.errorCheck();
  // add guid for Colcade.data
  var guid = this.guid = ++GUID;
  this.element.colcadeGUID = guid;
  instances[ guid ] = this; // associate via id
  // update initial properties & layout
  this.reload();
  // events
  this._windowResizeHandler = this.onWindowResize.bind( this );
  this._loadHandler = this.onLoad.bind( this );
  window.addEventListener( 'resize', this._windowResizeHandler );
  this.element.addEventListener( 'load', this._loadHandler, true );
};

proto.errorCheck = function() {
  var errors = [];
  if ( !this.element ) {
    errors.push( 'Bad element: ' + this.element );
  }
  if ( !this.options.columns ) {
    errors.push( 'columns option required: ' + this.options.columns );
  }
  if ( !this.options.items ) {
    errors.push( 'items option required: ' + this.options.items );
  }

  if ( errors.length ) {
    throw new Error( '[Colcade error] ' + errors.join('. ') );
  }
};

// update properties and do layout
proto.reload = function() {
  this.updateColumns();
  this.updateItems();
  this.layout();
};

proto.updateColumns = function() {
  this.columns = querySelect( this.options.columns, this.element );
};

proto.updateItems = function() {
  this.items = querySelect( this.options.items, this.element );
};

proto.getActiveColumns = function() {
  return this.columns.filter( function( column ) {
    var style = getComputedStyle( column );
    return style.display != 'none';
  });
};

// ----- layout ----- //

// public, updates activeColumns
proto.layout = function() {
  this.activeColumns = this.getActiveColumns();
  this._layout();
};

// private, does not update activeColumns
proto._layout = function() {
  // reset column heights
  this.columnHeights = this.activeColumns.map( function() {
    return 0;
  });
  // layout all items
  this.layoutItems( this.items );
};

proto.layoutItems = function( items ) {
  items.forEach( this.layoutItem, this );
};

proto.layoutItem = function( item ) {
  // layout item by appending to column
  var minHeight = Math.min.apply( Math, this.columnHeights );
  var index = this.columnHeights.indexOf( minHeight );
  this.activeColumns[ index ].appendChild( item );
  // at least 1px, if item hasn't loaded
  // Not exactly accurate, but it's cool
  this.columnHeights[ index ] += item.offsetHeight || 1;
};

// ----- adding items ----- //

proto.append = function( elems ) {
  var items = this.getQueryItems( elems );
  // add items to collection
  this.items = this.items.concat( items );
  // lay them out
  this.layoutItems( items );
};

proto.prepend = function( elems ) {
  var items = this.getQueryItems( elems );
  // add items to collection
  this.items = items.concat( this.items );
  // lay out everything
  this._layout();
};

proto.getQueryItems = function( elems ) {
  elems = makeArray( elems );
  var fragment = document.createDocumentFragment();
  elems.forEach( function( elem ) {
    fragment.appendChild( elem );
  });
  return querySelect( this.options.items, fragment );
};

// ----- measure column height ----- //

proto.measureColumnHeight = function( elem ) {
  var boundingRect = this.element.getBoundingClientRect();
  this.activeColumns.forEach( function( column, i ) {
    // if elem, measure only that column
    // if no elem, measure all columns
    if ( !elem || column.contains( elem ) ) {
      var lastChildRect = column.lastElementChild.getBoundingClientRect();
      // not an exact calculation as it includes top border, and excludes item bottom margin
      this.columnHeights[ i ] = lastChildRect.bottom - boundingRect.top;
    }
  }, this );
};

// ----- events ----- //

proto.onWindowResize = function() {
  clearTimeout( this.resizeTimeout );
  this.resizeTimeout = setTimeout( function() {
    this.onDebouncedResize();
  }.bind( this ), 100 );
};

proto.onDebouncedResize = function() {
  var activeColumns = this.getActiveColumns();
  // check if columns changed
  var isSameLength = activeColumns.length == this.activeColumns.length;
  var isSameColumns = true;
  this.activeColumns.forEach( function( column, i ) {
    isSameColumns = isSameColumns && column == activeColumns[i];
  });
  if ( isSameLength && isSameColumns ) {
    return;
  }
  // activeColumns changed
  this.activeColumns = activeColumns;
  this._layout();
};

proto.onLoad = function( event ) {
  this.measureColumnHeight( event.target );
};

// ----- destroy ----- //

proto.destroy = function() {
  // move items back to container
  this.items.forEach( function( item ) {
    this.element.appendChild( item );
  }, this );
  // remove events
  window.removeEventListener( 'resize', this._windowResizeHandler );
  this.element.removeEventListener( 'load', this._loadHandler, true );
  // remove data
  delete this.element.colcadeGUID;
  delete instances[ this.guid ];
};

// -------------------------- HTML init -------------------------- //

docReady( function() {
  var dataElems = querySelect('[data-colcade]');
  dataElems.forEach( htmlInit );
});

function htmlInit( elem ) {
  // convert attribute "foo: bar, qux: baz" into object
  var attr = elem.getAttribute('data-colcade');
  var attrParts = attr.split(',');
  var options = {};
  attrParts.forEach( function( part ) {
    var pair = part.split(':');
    var key = pair[0].trim();
    var value = pair[1].trim();
    options[ key ] = value;
  });

  new Colcade( elem, options );
}

Colcade.data = function( elem ) {
  elem = getQueryElement( elem );
  var id = elem && elem.colcadeGUID;
  return id && instances[ id ];
};

// -------------------------- jQuery -------------------------- //

Colcade.makeJQueryPlugin = function( $ ) {
  $ = $ || window.jQuery;
  if ( !$ ) {
    return;
  }

  $.fn.colcade = function( arg0 /*, arg1 */) {
    // method call $().colcade( 'method', { options } )
    if ( typeof arg0 == 'string' ) {
      // shift arguments by 1
      var args = Array.prototype.slice.call( arguments, 1 );
      return methodCall( this, arg0, args );
    }
    // just $().colcade({ options })
    plainCall( this, arg0 );
    return this;
  };

  function methodCall( $elems, methodName, args ) {
    var returnValue;
    $elems.each( function( i, elem ) {
      // get instance
      var colcade = $.data( elem, 'colcade' );
      if ( !colcade ) {
        return;
      }
      // apply method, get return value
      var value = colcade[ methodName ].apply( colcade, args );
      // set return value if value is returned, use only first value
      returnValue = returnValue === undefined ? value : returnValue;
    });
    return returnValue !== undefined ? returnValue : $elems;
  }

  function plainCall( $elems, options ) {
    $elems.each( function( i, elem ) {
      var colcade = $.data( elem, 'colcade' );
      if ( colcade ) {
        // set options & init
        colcade.option( options );
        colcade.layout();
      } else {
        // initialize new instance
        colcade = new Colcade( elem, options );
        $.data( elem, 'colcade', colcade );
      }
    });
  }
};

// try making plugin
Colcade.makeJQueryPlugin();

// -------------------------- utils -------------------------- //

function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0; i < obj.length; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

// get array of elements
function querySelect( selector, elem ) {
  elem = elem || document;
  var elems = elem.querySelectorAll( selector );
  return makeArray( elems );
}

function getQueryElement( elem ) {
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }
  return elem;
}

function docReady( onReady ) {
  if ( document.readyState == 'complete' ) {
    onReady();
    return;
  }
  document.addEventListener( 'DOMContentLoaded', onReady );
}

// -------------------------- end -------------------------- //

return Colcade;

}));


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! images/check.png */ "./src/images/check.png"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Montserrat&display=swap);"]);
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n    --color-black: #264653;\n    --color-green: #2a9d8f;\n    --color-yellow: #e9c46a;\n    --color-orange: #f4a261;\n    --color-red: #e76f51;\n    --background-color-light: #f7f7f7;\n    --background-color-dark: #eee;\n}\n\n*,\n*::before,\n*::after {\n    margin: 0;\n    padding: 0;\n    box-sizing: inherit;\n}\n\nhtml {\n    box-sizing: border-box;\n    overflow-x: hidden;\n    font-size: 62.5%;\n    font-size: 12px;\n}\n\n@media (max-width: 1200px) {\n    html {\n        font-size: 62.5%;\n    }\n}\n\n@media (max-width: 1000px) {\n    html {\n        font-size: 56.75%;\n    }\n}\n\n@media (max-width: 800px) {\n    html {\n        font-size: 50%;\n    }\n}\n\n@media (max-width: 700px) {\n    html {\n        font-size: 43.75%;\n    }\n}\n\nbody {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background-size: cover;\n    font-family: 'Montserrat', sans-serif;\n    font-size: 1.6rem;\n    color: var(--color-black);\n    word-wrap: break-word;\n}\n\nli {\n    list-style: none;\n}\n\n/* Content */\n\n.content {\n    width: 110rem;\n    height: 60rem;\n    display: grid;\n    grid-template-rows: 6rem 54rem 3rem;\n    grid-template-columns: 20rem 1fr;\n    border-radius: 3px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    overflow: hidden;\n}\n\n@media (max-width: 1500px) {\n    .content {\n        width: 100vw;\n        height: 100vh;\n        grid-template-rows: 6rem 1fr 3rem;\n    }\n}\n  \n@media (max-width: 1000px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 900px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 700px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 550px) {\n    .content {\n        grid-template-columns: 1fr 20rem;\n    }\n}\n\n/* Header */\n\n.header {\n    grid-row: 1 / 2;\n    grid-column: 1 / 3;\n    display: flex;\n    justify-content: flex-start;\n    gap:1rem;\n    align-items: center;\n    padding-left: 2rem;\n    border-bottom: 1px solid #b9b9b9;\n    background-color: var(--color-orange);\n    color: var(--color-black);\n}\n\n.logo {\n    height: 55px;\n    width: 55px;\n}\n\n/* Side Bar */\n\n.side-bar {\n    grid-row: 2 / 3;\n    grid-column: 1 / 2;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-right: 1px solid #b9b9b9;\n    background-color: var(--background-color-dark);\n    z-index: 1;\n}\n  \n@media (max-width: 1000px) {\n    .side-bar {\n        padding: 2rem;\n    }\n}\n  \n@media (max-width: 550px) {\n    .side-bar {\n        grid-column: 2 / 3;\n        border-left: 1px solid #b9b9b9;\n        border-right: none;\n        position: relative;\n        left: 140px;\n        transition: all .2s;\n    }\n}\n\n.nav {\n    font-size: 1.5rem;\n    font-weight: 300;\n}\n  \n.nav__item {\n    width: auto;\n    margin-bottom: 1rem;\n    padding: .5rem 1.5rem;\n}\n\n.nav__item:last-child {\n    cursor: pointer;\n}\n\n.nav__item:hover {\n    color: var(--color-green);\n}\n  \n.nav__item--projects {\n    margin-bottom: 1rem;\n}\n  \n.nav__item--projects-title {\n    padding: .5rem 1.5rem;\n    display: block;\n}\n  \n.nav__selected {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.nav__selected::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n\n.projects {\n    margin-left: 2rem;\n    margin-right: -4rem;\n    margin-top: 1rem;\n    max-height: 15rem;\n    overflow: hidden;\n    overflow-y: overlay;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n    font-size: 1.7rem;\n}\n  \n.projects__item {\n    padding: .4rem .8rem;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n}\n  \n.projects__item:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n\n.projects__item:not(:last-child) {\n    margin-bottom: 1rem;\n}\n    \n.new-todo {\n    height: 5rem;\n    width: 5rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding-bottom: 4px;\n    border-radius: 50%;\n    background-color: var(--color-yellow);\n    font-size: 5rem;\n    line-height: 5rem;\n    color: var(--color-black);\n    box-shadow: 0.2rem 0.5rem 1rem rgba(0, 0, 0, 0.4);\n    cursor: pointer;\n}\n  \n.new-todo:active {\n    transform: translateY(2px);\n    box-shadow: 0.1rem 0.3rem 0.5rem rgba(0, 0, 0, 0.4);\n}\n  \n@media (max-width: 550px) {\n    .new-todo {\n        margin-left: auto;\n    }\n}\n  \n.home-count,\n.today-count,\n.week-count,\n.project-count {\n    width: 2rem;\n    height: 2rem;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background-color: var(--color-yellow);\n    border-radius: 50%;\n    font-size: 1.3rem;\n    font-weight: 700;\n    color: var(--color-black);\n    pointer-events: none;\n  }\n  \n.project-count {\n    margin-right: 4.6rem;\n}\n  \n.project-name {\n    cursor: pointer;\n    max-width: 60%;\n    margin-right: auto;\n}\n  \n.project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n  \n.custom-project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n#notes-nav {\n    margin-top: -8px;\n}\n  \n#week-nav {\n    margin-left: 1px;\n}\n\n/* Note styling */\n\n.grid {\n    display: flex;\n}\n  \n.grid-col {\n    width: 33.33%;\n    padding: 0 10px;\n}\n  \n.grid-col--1 {\n    padding-left: 0;\n}\n  \n.grid-col--1 .note:first-child {\n    margin-top: 0;\n}\n  \n.grid-col--2 .note:first-child {\n    margin-top: 0;\n}\n  \n.grid-col--3 {\n    padding-right: 0;\n}\n  \n.grid-col--3 .note:first-child {\n    margin-top: 0;\n}\n  \n@media (max-width: 1180px) {\n    .grid-col--2 {\n        display: none;\n    }\n    .grid-col {\n        width: 50%;\n    }\n}\n  \n@media (max-width: 450px) {\n    .grid-col--2 {\n        display: none;\n    }\n    .grid-col--3 {\n        display: none;\n    }\n    .grid-col {\n        width: 100%;\n    }\n}\n  \n.note {\n    position: relative;\n    display: inline-block;\n    width: 100%;\n    height: fit-content;\n    padding: 2rem;\n    margin-top: 20px;\n    background-color: #eee;\n    border-radius: 4px;\n    font-weight: 300;\n    word-wrap: break-word;\n    overflow-wrap: break-word;\n}\n  \n.note__title, .note__text {\n    height: auto;\n    display: inline-block;\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    white-space: pre-wrap;\n}\n  \n.note__title:focus, .note__text:focus {\n    outline: none;\n}\n  \n.note__title {\n    margin-bottom: 2rem;\n    font-size: 1.8rem;\n}\n  \n.note:hover {\n            transform: scale(1.003);\n            transform-origin: 50% 50%;\n            box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.note__close {\n    position: absolute;\n    top: 7px;\n    right: 8px;\n    font-weight: 700;\n    line-height: 1;\n    font-size: 20px;\n    color: #501f3a;\n    cursor: pointer;\n}\n\n/* Main Container */\n\n.main__container {\n    padding: 4rem;\n    padding-top: 0;\n    padding-bottom: 0;\n    grid-row: 2 / 3;\n    grid-column: 2 / 3;\n    overflow-y: auto;\n    background-color: var(--background-color-light);\n    border-bottom: 4rem solid var(--background-color-light);\n    border-top: 4rem solid var(--background-color-light);\n}\n  \n@media (max-width: 1000px) {\n    .main__container {\n        padding: 3rem;\n        padding-top: 0;\n        padding-bottom: 0;\n        border-bottom: 3rem solid var(--background-color-light);\n        border-top: 3rem solid var(--background-color-light);\n    }\n}\n  \n@media (max-width: 550px) {\n    .main__container {\n        grid-column: 1 / 3;\n    }\n}\n\n.main {\n    background-color: var(--background-color-light);\n}\n\n/* Overlay New */\n\n.overlay-new {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n  \n.overlay-new-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.create-new {\n    position: relative;\n    visibility: hidden;\n    height: 40rem;\n    width: 80rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n}\n  \n.create-new-open {\n    transform: scale(1);\n    visibility: visible;\n}\n  \n.create-new__close {\n    position: absolute;\n    top: 2rem;\n    right: 1.1rem;\n    color: var(--background-color-light);\n    line-height: 1rem;\n    font-size: 5rem;\n    cursor: pointer;\n}\n  \n.create-new__header {\n    display: flex;\n    align-items: center;\n    height: 5rem;\n    border-bottom: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n  \n.create-new__heading {\n    color: var(--background-color-light);\n    margin-left: 1.5rem;\n}\n  \n.create-new__sidebar {\n    width: 12rem;\n    padding: 1rem;\n    background-color: var(--background-color-dark);\n}\n  \n@media (max-width: 450px) {\n    .create-new__sidebar {\n        padding: .5rem;\n        width: 10rem;\n    }\n}\n  \n.create-new__content {\n    display: flex;\n    height: calc(100% - 4rem);\n}\n  \n.create-new__options {\n    display: flex;\n    flex-direction: column;\n    align-self: flex-start;\n    padding-left: .5rem;\n    font-size: 1.8rem;\n    font-weight: 300;\n}\n  \n.create-new__options-items {\n    padding: .5rem 1rem;\n    margin-top: .5rem;\n    border-left: 3px solid transparent;\n    cursor: pointer;\n}\n  \n.create-new__options-items:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items:hover::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__options-items-active {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items-active::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n}\n\n#new-todo-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n\n.create-new__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: var(--color-black);\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;    \n    resize: none;\n}\n  \n.create-new__input:focus {\n    outline: none;\n}\n  \n.create-new__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n}\n  \n.create-new__date-title {\n    margin-right: 1rem;\n}\n  \n.create-new__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid var(--color-black);\n    border-radius: 5px;\n    color: var(--color-black);\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: 'Montserrat', sans-serif;\n}\n  \n.create-new__date-input:focus {\n    outline: none;\n}\n  \n.create-new__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n}\n  \n@media (max-width: 400px) {\n    .create-new__wrapper-priority-submit {\n        flex-direction: column;\n    }\n}\n  \n.create-new__priority {\n    display: flex;\n    align-items: center;\n}\n  \n.create-new__priority-title {\n    margin-right: 2.6rem;\n}\n  \n.create-new__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n}\n  \n.create-new__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__priority-btn:hover {\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.create-new__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.create-new__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--medium {\n    border: 1px solid var(--color-yellow);\n    color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium:hover {\n    background-color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium-active {\n    background-color: var(--color-yellow);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--high {\n    border: 1px solid var(--color-red);\n    color: var(--color-red);\n}\n  \n.create-new__priority-btn--high:hover {\n    background-color: var(--color-red);\n}\n  \n.create-new__priority-btn--high-active {\n    background-color: var(--color-red);\n    color: var(--background-color-light);\n}\n  \n.create-new__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: var(--color-green);\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__todo-submit:active {\n    outline: none;\n}\n  \n@media (max-width: 400px) {\n    .create-new__todo-submit {\n        margin-top: 8px;\n    }\n}\n  \n.create-new__project {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__project-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n  \n.create-new__project-input:focus {\n    outline: none;\n}\n  \n.create-new__project-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__project-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__project-submit:active {\n    outline: none;\n}\n  \n.create-new__note {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__note-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n\n#new-note-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n  \n.create-new__note-input:focus {\n    outline: none;\n}\n  \n.create-new__note-input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__note-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__note-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__note-submit:active {\n    outline: none;\n}\n\n/* Todo Main */\n\n.todo {\n    display: flex;\n    align-items: center;\n    height: 4rem;\n    padding: 1rem;\n    margin-bottom: 1rem;\n    background-color: #eee;\n}\n.todo-checked {\n    opacity:0.4;\n}\n  \n.todo__title {\n    margin-right: 2rem;\n    margin-right: auto;\n    font-weight: 300;\n}\n  \n.todo__title-checked {\n    color: #8d8d8d;\n    text-decoration: line-through;\n}\n  \n.todo__detail {\n    position: relative;\n    margin-right: 2.5rem;\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 3px;\n    font-size: 1rem;\n    color: #3ba395;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.todo__detail:hover {\n    position: relative;\n    background-color: #3ba395;\n    color: white;\n}\n  \n.todo__detail-checked {\n    border: 1px solid rgba(59, 163, 149, 0.5);\n    color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__detail-checked:hover {\n    border: 1px solid rgba(59, 163, 149, 0);\n    background-color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__date {\n    margin-right: 2rem;\n    width: 4.5rem;\n    font-size: 1rem;\n    color: #501f3a;\n}\n  \n.todo__date-checked {\n    color: rgba(80, 31, 58, 0.5);\n}\n  \n.todo__complete {\n    margin-right: 1.5rem;\n    height: 1.5rem;\n    width: 1.5rem;\n    border-radius: 3px;\n    border: 2px solid #3ba395;\n}\n  \n.todo__complete-checked {\n    height: 1.5rem;\n    width: 1.5rem;\n    display: block;\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + "), #3ba395;\n    background-repeat: no-repeat;\n    background-size: contain;\n}\n  \n.todo__icon {\n    width: 1.5rem;\n    height: 1.5rem;\n    fill: #501f3a;\n    cursor: pointer;\n    transition: all .2s;\n}\n  \n.todo__icon-edit {\n    margin-right: 2rem;\n}\n  \n.todo__icon:hover {\n    fill: #3ba395;\n}\n  \n.todo__icon-checked {\n    fill: rgba(80, 31, 58, 0.4);\n    opacity: 0.5;\n}\n  \n.todo__icon-checked:hover {\n    fill: rgba(59, 163, 149, 0.5);\n}\n  \n.todo:hover {\n    transform: scale(1.003);\n    transform-origin: 50% 50%;\n    box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.priority-low {\n    border-left: 3px solid green;\n}\n  \n.priority-medium {\n    border-left: 3px solid orange;\n}\n  \n.priority-high {\n    border-left: 3px solid red;\n}\n  \n.add-or-remove {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    color: #141414;\n    font-size: 2rem;\n}\n  \n.add-or-remove__heading {\n    margin-bottom: 2.5rem;\n    font-size: 2.8rem;\n}\n  \n.add-or-remove__content {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n  \n.add-or-remove__content-text {\n    margin-bottom: 2rem;\n}\n  \n.add-or-remove__content-btn {\n    position: relative;\n    display: inline-block;\n    padding: .5rem 1rem;\n    border: 1px solid #501f3a;\n    border-radius: 3px;\n    font-size: 1.3rem;\n    color: #501f3a;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.add-or-remove__content-btn:hover {\n    position: relative;\n    background-color: #501f3a;\n    color: white;\n}\n\n/* Overlay Detail */\n\n.overlay-details {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n} \n   \n.overlay-details-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.details-popup {\n    position: relative;\n    width: 60rem;\n    padding: 3rem;\n    border-radius: 4px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    color: #501f3a;\n    background-color: rgba(255, 255, 255);\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .details-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .details-popup > *:not(:last-child) {\n    margin-bottom: .8rem;\n  }\n  \n  .details-popup__catagory {\n    color: #501f3a;\n    font-weight: 700;\n  }\n  \n  .details-popup__title {\n    font-size: 3.4rem;\n    font-weight: normal;\n    margin-bottom: 1.3rem !important;\n    color: #501f3a;\n    line-height: 1;\n  }\n  \n  .details-popup__details {\n    display: flex;\n  }\n  \n  .details-popup__details-title {\n    margin-right: 2.7rem;\n    font-weight: 700;\n  }\n  \n  .details-popup__details-text {\n    font-weight: normal !important;\n  }\n  \n  .details-popup__project .details-popup__catagory {\n    margin-right: 2.4rem;\n  }\n  \n  .details-popup__due .details-popup__catagory {\n    margin-right: .9rem;\n  }\n  \n  .details-popup__priority .details-popup__catagory {\n    margin-right: 2.1rem;\n  }\n  \n  .details-popup__close {\n    position: absolute;\n    top: .4rem;\n    right: 1rem;\n    font-size: 3rem;\n    line-height: 1;\n    cursor: pointer;\n  }\n\n\n/* Overlay Edit */\n\n.overlay-edit {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n    \n.overlay-edit-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.edit-popup {\n    position: relative;\n    visibility: hidden;\n    height: 26rem;\n    width: 55rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .edit-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .edit-popup__close {\n    position: absolute;\n    top: 1.4rem;\n    right: 1.1rem;\n    color: #3ba395;\n    line-height: 1rem;\n    font-size: 3rem;\n    cursor: pointer;\n  }\n  \n  .edit-popup__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n  }\n  \n  .edit-popup__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    resize: none;\n  }\n  \n  .edit-popup__input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n  }\n  \n  .edit-popup__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n  }\n  \n  .edit-popup__date-title {\n    margin-right: 1rem;\n  }\n  \n  .edit-popup__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 5px;\n    color: #3ba395;\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: lato, sans-serif;\n  }\n  \n  .edit-popup__date-input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n  }\n  \n  .edit-popup__priority {\n    display: flex;\n    align-items: center;\n  }\n  \n  .edit-popup__priority-title {\n    margin-right: 2.6rem;\n  }\n  \n  .edit-popup__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n  }\n  \n  .edit-popup__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n  }\n  \n  .edit-popup__priority-btn:hover {\n    color: white;\n  }\n  \n.edit-popup__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: white;\n}\n  \n.edit-popup__priority-btn--medium {\n    border: 1px solid orange;\n    color: orange;\n}\n  \n.edit-popup__priority-btn--medium:hover {\n    background-color: orange;\n}\n  \n.edit-popup__priority-btn--medium-active {\n    background-color: orange;\n    color: white;\n}\n  \n.edit-popup__priority-btn--high {\n    border: 1px solid red;\n    color: red;\n}\n  \n.edit-popup__priority-btn--high:hover {\n    background-color: red;\n}\n  \n.edit-popup__priority-btn--high-active {\n    background-color: red;\n    color: white;\n}\n  \n.edit-popup__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.edit-popup__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.edit-popup__todo-submit:active {\n    outline: none;\n}\n  \n/* Footer */\n\n.footer {\n    grid-row: -1 / -2;\n    grid-column: 1 / -1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 1rem;\n    width: 100%;\n    padding: 1rem;\n    border-top: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n\n.fa-github {\n    font-size: 2rem;\n    color: var(--color-black);\n}\n\n.fa-github:hover {\n    opacity: 0.5;\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"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","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');\n\n:root {\n    --color-black: #264653;\n    --color-green: #2a9d8f;\n    --color-yellow: #e9c46a;\n    --color-orange: #f4a261;\n    --color-red: #e76f51;\n    --background-color-light: #f7f7f7;\n    --background-color-dark: #eee;\n}\n\n*,\n*::before,\n*::after {\n    margin: 0;\n    padding: 0;\n    box-sizing: inherit;\n}\n\nhtml {\n    box-sizing: border-box;\n    overflow-x: hidden;\n    font-size: 62.5%;\n    font-size: 12px;\n}\n\n@media (max-width: 1200px) {\n    html {\n        font-size: 62.5%;\n    }\n}\n\n@media (max-width: 1000px) {\n    html {\n        font-size: 56.75%;\n    }\n}\n\n@media (max-width: 800px) {\n    html {\n        font-size: 50%;\n    }\n}\n\n@media (max-width: 700px) {\n    html {\n        font-size: 43.75%;\n    }\n}\n\nbody {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background-size: cover;\n    font-family: 'Montserrat', sans-serif;\n    font-size: 1.6rem;\n    color: var(--color-black);\n    word-wrap: break-word;\n}\n\nli {\n    list-style: none;\n}\n\n/* Content */\n\n.content {\n    width: 110rem;\n    height: 60rem;\n    display: grid;\n    grid-template-rows: 6rem 54rem 3rem;\n    grid-template-columns: 20rem 1fr;\n    border-radius: 3px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    overflow: hidden;\n}\n\n@media (max-width: 1500px) {\n    .content {\n        width: 100vw;\n        height: 100vh;\n        grid-template-rows: 6rem 1fr 3rem;\n    }\n}\n  \n@media (max-width: 1000px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 900px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 700px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 550px) {\n    .content {\n        grid-template-columns: 1fr 20rem;\n    }\n}\n\n/* Header */\n\n.header {\n    grid-row: 1 / 2;\n    grid-column: 1 / 3;\n    display: flex;\n    justify-content: flex-start;\n    gap:1rem;\n    align-items: center;\n    padding-left: 2rem;\n    border-bottom: 1px solid #b9b9b9;\n    background-color: var(--color-orange);\n    color: var(--color-black);\n}\n\n.logo {\n    height: 55px;\n    width: 55px;\n}\n\n/* Side Bar */\n\n.side-bar {\n    grid-row: 2 / 3;\n    grid-column: 1 / 2;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-right: 1px solid #b9b9b9;\n    background-color: var(--background-color-dark);\n    z-index: 1;\n}\n  \n@media (max-width: 1000px) {\n    .side-bar {\n        padding: 2rem;\n    }\n}\n  \n@media (max-width: 550px) {\n    .side-bar {\n        grid-column: 2 / 3;\n        border-left: 1px solid #b9b9b9;\n        border-right: none;\n        position: relative;\n        left: 140px;\n        transition: all .2s;\n    }\n}\n\n.nav {\n    font-size: 1.5rem;\n    font-weight: 300;\n}\n  \n.nav__item {\n    width: auto;\n    margin-bottom: 1rem;\n    padding: .5rem 1.5rem;\n}\n\n.nav__item:last-child {\n    cursor: pointer;\n}\n\n.nav__item:hover {\n    color: var(--color-green);\n}\n  \n.nav__item--projects {\n    margin-bottom: 1rem;\n}\n  \n.nav__item--projects-title {\n    padding: .5rem 1.5rem;\n    display: block;\n}\n  \n.nav__selected {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.nav__selected::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n\n.projects {\n    margin-left: 2rem;\n    margin-right: -4rem;\n    margin-top: 1rem;\n    max-height: 15rem;\n    overflow: hidden;\n    overflow-y: overlay;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n    font-size: 1.7rem;\n}\n  \n.projects__item {\n    padding: .4rem .8rem;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n}\n  \n.projects__item:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n\n.projects__item:not(:last-child) {\n    margin-bottom: 1rem;\n}\n    \n.new-todo {\n    height: 5rem;\n    width: 5rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding-bottom: 4px;\n    border-radius: 50%;\n    background-color: var(--color-yellow);\n    font-size: 5rem;\n    line-height: 5rem;\n    color: var(--color-black);\n    box-shadow: 0.2rem 0.5rem 1rem rgba(0, 0, 0, 0.4);\n    cursor: pointer;\n}\n  \n.new-todo:active {\n    transform: translateY(2px);\n    box-shadow: 0.1rem 0.3rem 0.5rem rgba(0, 0, 0, 0.4);\n}\n  \n@media (max-width: 550px) {\n    .new-todo {\n        margin-left: auto;\n    }\n}\n  \n.home-count,\n.today-count,\n.week-count,\n.project-count {\n    width: 2rem;\n    height: 2rem;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background-color: var(--color-yellow);\n    border-radius: 50%;\n    font-size: 1.3rem;\n    font-weight: 700;\n    color: var(--color-black);\n    pointer-events: none;\n  }\n  \n.project-count {\n    margin-right: 4.6rem;\n}\n  \n.project-name {\n    cursor: pointer;\n    max-width: 60%;\n    margin-right: auto;\n}\n  \n.project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n  \n.custom-project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n#notes-nav {\n    margin-top: -8px;\n}\n  \n#week-nav {\n    margin-left: 1px;\n}\n\n/* Note styling */\n\n.grid {\n    display: flex;\n}\n  \n.grid-col {\n    width: 33.33%;\n    padding: 0 10px;\n}\n  \n.grid-col--1 {\n    padding-left: 0;\n}\n  \n.grid-col--1 .note:first-child {\n    margin-top: 0;\n}\n  \n.grid-col--2 .note:first-child {\n    margin-top: 0;\n}\n  \n.grid-col--3 {\n    padding-right: 0;\n}\n  \n.grid-col--3 .note:first-child {\n    margin-top: 0;\n}\n  \n@media (max-width: 1180px) {\n    .grid-col--2 {\n        display: none;\n    }\n    .grid-col {\n        width: 50%;\n    }\n}\n  \n@media (max-width: 450px) {\n    .grid-col--2 {\n        display: none;\n    }\n    .grid-col--3 {\n        display: none;\n    }\n    .grid-col {\n        width: 100%;\n    }\n}\n  \n.note {\n    position: relative;\n    display: inline-block;\n    width: 100%;\n    height: fit-content;\n    padding: 2rem;\n    margin-top: 20px;\n    background-color: #eee;\n    border-radius: 4px;\n    font-weight: 300;\n    word-wrap: break-word;\n    overflow-wrap: break-word;\n}\n  \n.note__title, .note__text {\n    height: auto;\n    display: inline-block;\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    white-space: pre-wrap;\n}\n  \n.note__title:focus, .note__text:focus {\n    outline: none;\n}\n  \n.note__title {\n    margin-bottom: 2rem;\n    font-size: 1.8rem;\n}\n  \n.note:hover {\n            transform: scale(1.003);\n            transform-origin: 50% 50%;\n            box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.note__close {\n    position: absolute;\n    top: 7px;\n    right: 8px;\n    font-weight: 700;\n    line-height: 1;\n    font-size: 20px;\n    color: #501f3a;\n    cursor: pointer;\n}\n\n/* Main Container */\n\n.main__container {\n    padding: 4rem;\n    padding-top: 0;\n    padding-bottom: 0;\n    grid-row: 2 / 3;\n    grid-column: 2 / 3;\n    overflow-y: auto;\n    background-color: var(--background-color-light);\n    border-bottom: 4rem solid var(--background-color-light);\n    border-top: 4rem solid var(--background-color-light);\n}\n  \n@media (max-width: 1000px) {\n    .main__container {\n        padding: 3rem;\n        padding-top: 0;\n        padding-bottom: 0;\n        border-bottom: 3rem solid var(--background-color-light);\n        border-top: 3rem solid var(--background-color-light);\n    }\n}\n  \n@media (max-width: 550px) {\n    .main__container {\n        grid-column: 1 / 3;\n    }\n}\n\n.main {\n    background-color: var(--background-color-light);\n}\n\n/* Overlay New */\n\n.overlay-new {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n  \n.overlay-new-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.create-new {\n    position: relative;\n    visibility: hidden;\n    height: 40rem;\n    width: 80rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n}\n  \n.create-new-open {\n    transform: scale(1);\n    visibility: visible;\n}\n  \n.create-new__close {\n    position: absolute;\n    top: 2rem;\n    right: 1.1rem;\n    color: var(--background-color-light);\n    line-height: 1rem;\n    font-size: 5rem;\n    cursor: pointer;\n}\n  \n.create-new__header {\n    display: flex;\n    align-items: center;\n    height: 5rem;\n    border-bottom: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n  \n.create-new__heading {\n    color: var(--background-color-light);\n    margin-left: 1.5rem;\n}\n  \n.create-new__sidebar {\n    width: 12rem;\n    padding: 1rem;\n    background-color: var(--background-color-dark);\n}\n  \n@media (max-width: 450px) {\n    .create-new__sidebar {\n        padding: .5rem;\n        width: 10rem;\n    }\n}\n  \n.create-new__content {\n    display: flex;\n    height: calc(100% - 4rem);\n}\n  \n.create-new__options {\n    display: flex;\n    flex-direction: column;\n    align-self: flex-start;\n    padding-left: .5rem;\n    font-size: 1.8rem;\n    font-weight: 300;\n}\n  \n.create-new__options-items {\n    padding: .5rem 1rem;\n    margin-top: .5rem;\n    border-left: 3px solid transparent;\n    cursor: pointer;\n}\n  \n.create-new__options-items:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items:hover::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__options-items-active {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items-active::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n}\n\n#new-todo-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n\n.create-new__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: var(--color-black);\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;    \n    resize: none;\n}\n  \n.create-new__input:focus {\n    outline: none;\n}\n  \n.create-new__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n}\n  \n.create-new__date-title {\n    margin-right: 1rem;\n}\n  \n.create-new__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid var(--color-black);\n    border-radius: 5px;\n    color: var(--color-black);\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: 'Montserrat', sans-serif;\n}\n  \n.create-new__date-input:focus {\n    outline: none;\n}\n  \n.create-new__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n}\n  \n@media (max-width: 400px) {\n    .create-new__wrapper-priority-submit {\n        flex-direction: column;\n    }\n}\n  \n.create-new__priority {\n    display: flex;\n    align-items: center;\n}\n  \n.create-new__priority-title {\n    margin-right: 2.6rem;\n}\n  \n.create-new__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n}\n  \n.create-new__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__priority-btn:hover {\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.create-new__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.create-new__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--medium {\n    border: 1px solid var(--color-yellow);\n    color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium:hover {\n    background-color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium-active {\n    background-color: var(--color-yellow);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--high {\n    border: 1px solid var(--color-red);\n    color: var(--color-red);\n}\n  \n.create-new__priority-btn--high:hover {\n    background-color: var(--color-red);\n}\n  \n.create-new__priority-btn--high-active {\n    background-color: var(--color-red);\n    color: var(--background-color-light);\n}\n  \n.create-new__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: var(--color-green);\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__todo-submit:active {\n    outline: none;\n}\n  \n@media (max-width: 400px) {\n    .create-new__todo-submit {\n        margin-top: 8px;\n    }\n}\n  \n.create-new__project {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__project-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n  \n.create-new__project-input:focus {\n    outline: none;\n}\n  \n.create-new__project-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__project-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__project-submit:active {\n    outline: none;\n}\n  \n.create-new__note {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__note-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n\n#new-note-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n  \n.create-new__note-input:focus {\n    outline: none;\n}\n  \n.create-new__note-input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__note-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__note-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__note-submit:active {\n    outline: none;\n}\n\n/* Todo Main */\n\n.todo {\n    display: flex;\n    align-items: center;\n    height: 4rem;\n    padding: 1rem;\n    margin-bottom: 1rem;\n    background-color: #eee;\n}\n.todo-checked {\n    opacity:0.4;\n}\n  \n.todo__title {\n    margin-right: 2rem;\n    margin-right: auto;\n    font-weight: 300;\n}\n  \n.todo__title-checked {\n    color: #8d8d8d;\n    text-decoration: line-through;\n}\n  \n.todo__detail {\n    position: relative;\n    margin-right: 2.5rem;\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 3px;\n    font-size: 1rem;\n    color: #3ba395;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.todo__detail:hover {\n    position: relative;\n    background-color: #3ba395;\n    color: white;\n}\n  \n.todo__detail-checked {\n    border: 1px solid rgba(59, 163, 149, 0.5);\n    color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__detail-checked:hover {\n    border: 1px solid rgba(59, 163, 149, 0);\n    background-color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__date {\n    margin-right: 2rem;\n    width: 4.5rem;\n    font-size: 1rem;\n    color: #501f3a;\n}\n  \n.todo__date-checked {\n    color: rgba(80, 31, 58, 0.5);\n}\n  \n.todo__complete {\n    margin-right: 1.5rem;\n    height: 1.5rem;\n    width: 1.5rem;\n    border-radius: 3px;\n    border: 2px solid #3ba395;\n}\n  \n.todo__complete-checked {\n    height: 1.5rem;\n    width: 1.5rem;\n    display: block;\n    background: url(\"images/check.png\"), #3ba395;\n    background-repeat: no-repeat;\n    background-size: contain;\n}\n  \n.todo__icon {\n    width: 1.5rem;\n    height: 1.5rem;\n    fill: #501f3a;\n    cursor: pointer;\n    transition: all .2s;\n}\n  \n.todo__icon-edit {\n    margin-right: 2rem;\n}\n  \n.todo__icon:hover {\n    fill: #3ba395;\n}\n  \n.todo__icon-checked {\n    fill: rgba(80, 31, 58, 0.4);\n    opacity: 0.5;\n}\n  \n.todo__icon-checked:hover {\n    fill: rgba(59, 163, 149, 0.5);\n}\n  \n.todo:hover {\n    transform: scale(1.003);\n    transform-origin: 50% 50%;\n    box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.priority-low {\n    border-left: 3px solid green;\n}\n  \n.priority-medium {\n    border-left: 3px solid orange;\n}\n  \n.priority-high {\n    border-left: 3px solid red;\n}\n  \n.add-or-remove {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    color: #141414;\n    font-size: 2rem;\n}\n  \n.add-or-remove__heading {\n    margin-bottom: 2.5rem;\n    font-size: 2.8rem;\n}\n  \n.add-or-remove__content {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n  \n.add-or-remove__content-text {\n    margin-bottom: 2rem;\n}\n  \n.add-or-remove__content-btn {\n    position: relative;\n    display: inline-block;\n    padding: .5rem 1rem;\n    border: 1px solid #501f3a;\n    border-radius: 3px;\n    font-size: 1.3rem;\n    color: #501f3a;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.add-or-remove__content-btn:hover {\n    position: relative;\n    background-color: #501f3a;\n    color: white;\n}\n\n/* Overlay Detail */\n\n.overlay-details {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n} \n   \n.overlay-details-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.details-popup {\n    position: relative;\n    width: 60rem;\n    padding: 3rem;\n    border-radius: 4px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    color: #501f3a;\n    background-color: rgba(255, 255, 255);\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .details-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .details-popup > *:not(:last-child) {\n    margin-bottom: .8rem;\n  }\n  \n  .details-popup__catagory {\n    color: #501f3a;\n    font-weight: 700;\n  }\n  \n  .details-popup__title {\n    font-size: 3.4rem;\n    font-weight: normal;\n    margin-bottom: 1.3rem !important;\n    color: #501f3a;\n    line-height: 1;\n  }\n  \n  .details-popup__details {\n    display: flex;\n  }\n  \n  .details-popup__details-title {\n    margin-right: 2.7rem;\n    font-weight: 700;\n  }\n  \n  .details-popup__details-text {\n    font-weight: normal !important;\n  }\n  \n  .details-popup__project .details-popup__catagory {\n    margin-right: 2.4rem;\n  }\n  \n  .details-popup__due .details-popup__catagory {\n    margin-right: .9rem;\n  }\n  \n  .details-popup__priority .details-popup__catagory {\n    margin-right: 2.1rem;\n  }\n  \n  .details-popup__close {\n    position: absolute;\n    top: .4rem;\n    right: 1rem;\n    font-size: 3rem;\n    line-height: 1;\n    cursor: pointer;\n  }\n\n\n/* Overlay Edit */\n\n.overlay-edit {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n    \n.overlay-edit-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.edit-popup {\n    position: relative;\n    visibility: hidden;\n    height: 26rem;\n    width: 55rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .edit-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .edit-popup__close {\n    position: absolute;\n    top: 1.4rem;\n    right: 1.1rem;\n    color: #3ba395;\n    line-height: 1rem;\n    font-size: 3rem;\n    cursor: pointer;\n  }\n  \n  .edit-popup__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n  }\n  \n  .edit-popup__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    resize: none;\n  }\n  \n  .edit-popup__input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n  }\n  \n  .edit-popup__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n  }\n  \n  .edit-popup__date-title {\n    margin-right: 1rem;\n  }\n  \n  .edit-popup__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 5px;\n    color: #3ba395;\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: lato, sans-serif;\n  }\n  \n  .edit-popup__date-input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n  }\n  \n  .edit-popup__priority {\n    display: flex;\n    align-items: center;\n  }\n  \n  .edit-popup__priority-title {\n    margin-right: 2.6rem;\n  }\n  \n  .edit-popup__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n  }\n  \n  .edit-popup__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n  }\n  \n  .edit-popup__priority-btn:hover {\n    color: white;\n  }\n  \n.edit-popup__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: white;\n}\n  \n.edit-popup__priority-btn--medium {\n    border: 1px solid orange;\n    color: orange;\n}\n  \n.edit-popup__priority-btn--medium:hover {\n    background-color: orange;\n}\n  \n.edit-popup__priority-btn--medium-active {\n    background-color: orange;\n    color: white;\n}\n  \n.edit-popup__priority-btn--high {\n    border: 1px solid red;\n    color: red;\n}\n  \n.edit-popup__priority-btn--high:hover {\n    background-color: red;\n}\n  \n.edit-popup__priority-btn--high-active {\n    background-color: red;\n    color: white;\n}\n  \n.edit-popup__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.edit-popup__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.edit-popup__todo-submit:active {\n    outline: none;\n}\n  \n/* Footer */\n\n.footer {\n    grid-row: -1 / -2;\n    grid-column: 1 / -1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 1rem;\n    width: 100%;\n    padding: 1rem;\n    border-top: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n\n.fa-github {\n    font-size: 2rem;\n    color: var(--color-black);\n}\n\n.fa-github:hover {\n    opacity: 0.5;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/addLeadingZeros/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/addLeadingZeros/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ addLeadingZeros)
/* harmony export */ });
function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? '-' : '';
  var output = Math.abs(number).toString();

  while (output.length < targetLength) {
    output = '0' + output;
  }

  return sign + output;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/defaultLocale/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/defaultLocale/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _locale_en_US_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../locale/en-US/index.js */ "./node_modules/date-fns/esm/locale/en-US/index.js");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_locale_en_US_index_js__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/defaultOptions/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/defaultOptions/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getDefaultOptions": () => (/* binding */ getDefaultOptions),
/* harmony export */   "setDefaultOptions": () => (/* binding */ setDefaultOptions)
/* harmony export */ });
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
function setDefaultOptions(newOptions) {
  defaultOptions = newOptions;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/format/formatters/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/format/formatters/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_getUTCDayOfYear_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../_lib/getUTCDayOfYear/index.js */ "./node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js");
/* harmony import */ var _lib_getUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../_lib/getUTCISOWeek/index.js */ "./node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js");
/* harmony import */ var _lib_getUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../_lib/getUTCISOWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js");
/* harmony import */ var _lib_getUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../_lib/getUTCWeek/index.js */ "./node_modules/date-fns/esm/_lib/getUTCWeek/index.js");
/* harmony import */ var _lib_getUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../_lib/getUTCWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js");
/* harmony import */ var _addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../addLeadingZeros/index.js */ "./node_modules/date-fns/esm/_lib/addLeadingZeros/index.js");
/* harmony import */ var _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lightFormatters/index.js */ "./node_modules/date-fns/esm/_lib/format/lightFormatters/index.js");







var dayPeriodEnum = {
  am: 'am',
  pm: 'pm',
  midnight: 'midnight',
  noon: 'noon',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night'
};

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* | Milliseconds in day            |
 * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
 * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
 * |  d  | Day of month                   |  D  | Day of year                    |
 * |  e  | Local day of week              |  E  | Day of week                    |
 * |  f  |                                |  F* | Day of week in month           |
 * |  g* | Modified Julian day            |  G  | Era                            |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  i! | ISO day of week                |  I! | ISO week of year               |
 * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
 * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
 * |  l* | (deprecated)                   |  L  | Stand-alone month              |
 * |  m  | Minute                         |  M  | Month                          |
 * |  n  |                                |  N  |                                |
 * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
 * |  p! | Long localized time            |  P! | Long localized date            |
 * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
 * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
 * |  u  | Extended year                  |  U* | Cyclic year                    |
 * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
 * |  w  | Local week of year             |  W* | Week of month                  |
 * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
 * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
 * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 *
 * Letters marked by ! are non-standard, but implemented by date-fns:
 * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
 * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
 *   i.e. 7 for Sunday, 1 for Monday, etc.
 * - `I` is ISO week of year, as opposed to `w` which is local week of year.
 * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
 *   `R` is supposed to be used in conjunction with `I` and `i`
 *   for universal ISO week-numbering date, whereas
 *   `Y` is supposed to be used in conjunction with `w` and `e`
 *   for week-numbering date specific to the locale.
 * - `P` is long localized date format
 * - `p` is long localized time format
 */
var formatters = {
  // Era
  G: function G(date, token, localize) {
    var era = date.getUTCFullYear() > 0 ? 1 : 0;

    switch (token) {
      // AD, BC
      case 'G':
      case 'GG':
      case 'GGG':
        return localize.era(era, {
          width: 'abbreviated'
        });
      // A, B

      case 'GGGGG':
        return localize.era(era, {
          width: 'narrow'
        });
      // Anno Domini, Before Christ

      case 'GGGG':
      default:
        return localize.era(era, {
          width: 'wide'
        });
    }
  },
  // Year
  y: function y(date, token, localize) {
    // Ordinal number
    if (token === 'yo') {
      var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize.ordinalNumber(year, {
        unit: 'year'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].y(date, token);
  },
  // Local week-numbering year
  Y: function Y(date, token, localize, options) {
    var signedWeekYear = (0,_lib_getUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

    if (token === 'YY') {
      var twoDigitYear = weekYear % 100;
      return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(twoDigitYear, 2);
    } // Ordinal number


    if (token === 'Yo') {
      return localize.ordinalNumber(weekYear, {
        unit: 'year'
      });
    } // Padding


    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function R(date, token) {
    var isoWeekYear = (0,_lib_getUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])(date); // Padding

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function u(date, token) {
    var year = date.getUTCFullYear();
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(year, token.length);
  },
  // Quarter
  Q: function Q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'Q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'QQ':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'Qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'QQQ':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'QQQQQ':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'formatting'
        });
      // 1st quarter, 2nd quarter, ...

      case 'QQQQ':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone quarter
  q: function q(date, token, localize) {
    var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

    switch (token) {
      // 1, 2, 3, 4
      case 'q':
        return String(quarter);
      // 01, 02, 03, 04

      case 'qq':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(quarter, 2);
      // 1st, 2nd, 3rd, 4th

      case 'qo':
        return localize.ordinalNumber(quarter, {
          unit: 'quarter'
        });
      // Q1, Q2, Q3, Q4

      case 'qqq':
        return localize.quarter(quarter, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)

      case 'qqqqq':
        return localize.quarter(quarter, {
          width: 'narrow',
          context: 'standalone'
        });
      // 1st quarter, 2nd quarter, ...

      case 'qqqq':
      default:
        return localize.quarter(quarter, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Month
  M: function M(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      case 'M':
      case 'MM':
        return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].M(date, token);
      // 1st, 2nd, ..., 12th

      case 'Mo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'MMM':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // J, F, ..., D

      case 'MMMMM':
        return localize.month(month, {
          width: 'narrow',
          context: 'formatting'
        });
      // January, February, ..., December

      case 'MMMM':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone month
  L: function L(date, token, localize) {
    var month = date.getUTCMonth();

    switch (token) {
      // 1, 2, ..., 12
      case 'L':
        return String(month + 1);
      // 01, 02, ..., 12

      case 'LL':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(month + 1, 2);
      // 1st, 2nd, ..., 12th

      case 'Lo':
        return localize.ordinalNumber(month + 1, {
          unit: 'month'
        });
      // Jan, Feb, ..., Dec

      case 'LLL':
        return localize.month(month, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // J, F, ..., D

      case 'LLLLL':
        return localize.month(month, {
          width: 'narrow',
          context: 'standalone'
        });
      // January, February, ..., December

      case 'LLLL':
      default:
        return localize.month(month, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // Local week of year
  w: function w(date, token, localize, options) {
    var week = (0,_lib_getUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__["default"])(date, options);

    if (token === 'wo') {
      return localize.ordinalNumber(week, {
        unit: 'week'
      });
    }

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(week, token.length);
  },
  // ISO week of year
  I: function I(date, token, localize) {
    var isoWeek = (0,_lib_getUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_5__["default"])(date);

    if (token === 'Io') {
      return localize.ordinalNumber(isoWeek, {
        unit: 'week'
      });
    }

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(isoWeek, token.length);
  },
  // Day of the month
  d: function d(date, token, localize) {
    if (token === 'do') {
      return localize.ordinalNumber(date.getUTCDate(), {
        unit: 'date'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].d(date, token);
  },
  // Day of year
  D: function D(date, token, localize) {
    var dayOfYear = (0,_lib_getUTCDayOfYear_index_js__WEBPACK_IMPORTED_MODULE_6__["default"])(date);

    if (token === 'Do') {
      return localize.ordinalNumber(dayOfYear, {
        unit: 'dayOfYear'
      });
    }

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dayOfYear, token.length);
  },
  // Day of week
  E: function E(date, token, localize) {
    var dayOfWeek = date.getUTCDay();

    switch (token) {
      // Tue
      case 'E':
      case 'EE':
      case 'EEE':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'EEEEE':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'EEEEEE':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'EEEE':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Local day of week
  e: function e(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case 'e':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'ee':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th

      case 'eo':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'eee':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'eeeee':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'eeeeee':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'eeee':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Stand-alone local day of week
  c: function c(date, token, localize, options) {
    var dayOfWeek = date.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

    switch (token) {
      // Numerical value (same as in `e`)
      case 'c':
        return String(localDayOfWeek);
      // Padded numerical value

      case 'cc':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th

      case 'co':
        return localize.ordinalNumber(localDayOfWeek, {
          unit: 'day'
        });

      case 'ccc':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'standalone'
        });
      // T

      case 'ccccc':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'standalone'
        });
      // Tu

      case 'cccccc':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'standalone'
        });
      // Tuesday

      case 'cccc':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'standalone'
        });
    }
  },
  // ISO day of week
  i: function i(date, token, localize) {
    var dayOfWeek = date.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    switch (token) {
      // 2
      case 'i':
        return String(isoDayOfWeek);
      // 02

      case 'ii':
        return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(isoDayOfWeek, token.length);
      // 2nd

      case 'io':
        return localize.ordinalNumber(isoDayOfWeek, {
          unit: 'day'
        });
      // Tue

      case 'iii':
        return localize.day(dayOfWeek, {
          width: 'abbreviated',
          context: 'formatting'
        });
      // T

      case 'iiiii':
        return localize.day(dayOfWeek, {
          width: 'narrow',
          context: 'formatting'
        });
      // Tu

      case 'iiiiii':
        return localize.day(dayOfWeek, {
          width: 'short',
          context: 'formatting'
        });
      // Tuesday

      case 'iiii':
      default:
        return localize.day(dayOfWeek, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM or PM
  a: function a(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'aaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'aaaaa':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'aaaa':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // AM, PM, midnight, noon
  b: function b(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
    }

    switch (token) {
      case 'b':
      case 'bb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'bbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        }).toLowerCase();

      case 'bbbbb':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'bbbb':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function B(date, token, localize) {
    var hours = date.getUTCHours();
    var dayPeriodEnumValue;

    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }

    switch (token) {
      case 'B':
      case 'BB':
      case 'BBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'abbreviated',
          context: 'formatting'
        });

      case 'BBBBB':
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'narrow',
          context: 'formatting'
        });

      case 'BBBB':
      default:
        return localize.dayPeriod(dayPeriodEnumValue, {
          width: 'wide',
          context: 'formatting'
        });
    }
  },
  // Hour [1-12]
  h: function h(date, token, localize) {
    if (token === 'ho') {
      var hours = date.getUTCHours() % 12;
      if (hours === 0) hours = 12;
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].h(date, token);
  },
  // Hour [0-23]
  H: function H(date, token, localize) {
    if (token === 'Ho') {
      return localize.ordinalNumber(date.getUTCHours(), {
        unit: 'hour'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].H(date, token);
  },
  // Hour [0-11]
  K: function K(date, token, localize) {
    var hours = date.getUTCHours() % 12;

    if (token === 'Ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(hours, token.length);
  },
  // Hour [1-24]
  k: function k(date, token, localize) {
    var hours = date.getUTCHours();
    if (hours === 0) hours = 24;

    if (token === 'ko') {
      return localize.ordinalNumber(hours, {
        unit: 'hour'
      });
    }

    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(hours, token.length);
  },
  // Minute
  m: function m(date, token, localize) {
    if (token === 'mo') {
      return localize.ordinalNumber(date.getUTCMinutes(), {
        unit: 'minute'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].m(date, token);
  },
  // Second
  s: function s(date, token, localize) {
    if (token === 'so') {
      return localize.ordinalNumber(date.getUTCSeconds(), {
        unit: 'second'
      });
    }

    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].s(date, token);
  },
  // Fraction of second
  S: function S(date, token) {
    return _lightFormatters_index_js__WEBPACK_IMPORTED_MODULE_0__["default"].S(date, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function X(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    if (timezoneOffset === 0) {
      return 'Z';
    }

    switch (token) {
      // Hours and optional minutes
      case 'X':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`

      case 'XXXX':
      case 'XX':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`

      case 'XXXXX':
      case 'XXX': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function x(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Hours and optional minutes
      case 'x':
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`

      case 'xxxx':
      case 'xx':
        // Hours and minutes without `:` delimiter
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`

      case 'xxxxx':
      case 'xxx': // Hours and minutes with `:` delimiter

      default:
        return formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (GMT)
  O: function O(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'O':
      case 'OO':
      case 'OOO':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'OOOO':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Timezone (specific non-location)
  z: function z(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timezoneOffset = originalDate.getTimezoneOffset();

    switch (token) {
      // Short
      case 'z':
      case 'zz':
      case 'zzz':
        return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
      // Long

      case 'zzzz':
      default:
        return 'GMT' + formatTimezone(timezoneOffset, ':');
    }
  },
  // Seconds timestamp
  t: function t(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = Math.floor(originalDate.getTime() / 1000);
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(timestamp, token.length);
  },
  // Milliseconds timestamp
  T: function T(date, token, _localize, options) {
    var originalDate = options._originalDate || date;
    var timestamp = originalDate.getTime();
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(timestamp, token.length);
  }
};

function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;

  if (minutes === 0) {
    return sign + String(hours);
  }

  var delimiter = dirtyDelimiter || '';
  return sign + String(hours) + delimiter + (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(minutes, 2);
}

function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? '-' : '+';
    return sign + (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(Math.abs(offset) / 60, 2);
  }

  return formatTimezone(offset, dirtyDelimiter);
}

function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || '';
  var sign = offset > 0 ? '-' : '+';
  var absOffset = Math.abs(offset);
  var hours = (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(Math.floor(absOffset / 60), 2);
  var minutes = (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (formatters);

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/format/lightFormatters/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/format/lightFormatters/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../addLeadingZeros/index.js */ "./node_modules/date-fns/esm/_lib/addLeadingZeros/index.js");

/*
 * |     | Unit                           |     | Unit                           |
 * |-----|--------------------------------|-----|--------------------------------|
 * |  a  | AM, PM                         |  A* |                                |
 * |  d  | Day of month                   |  D  |                                |
 * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
 * |  m  | Minute                         |  M  | Month                          |
 * |  s  | Second                         |  S  | Fraction of second             |
 * |  y  | Year (abs)                     |  Y  |                                |
 *
 * Letters marked by * are not implemented but reserved by Unicode standard.
 */

var formatters = {
  // Year
  y: function y(date, token) {
    // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
    // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
    // |----------|-------|----|-------|-------|-------|
    // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
    // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
    // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
    // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
    // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
    var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(token === 'yy' ? year % 100 : year, token.length);
  },
  // Month
  M: function M(date, token) {
    var month = date.getUTCMonth();
    return token === 'M' ? String(month + 1) : (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(month + 1, 2);
  },
  // Day of the month
  d: function d(date, token) {
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(date.getUTCDate(), token.length);
  },
  // AM or PM
  a: function a(date, token) {
    var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

    switch (token) {
      case 'a':
      case 'aa':
        return dayPeriodEnumValue.toUpperCase();

      case 'aaa':
        return dayPeriodEnumValue;

      case 'aaaaa':
        return dayPeriodEnumValue[0];

      case 'aaaa':
      default:
        return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
    }
  },
  // Hour [1-12]
  h: function h(date, token) {
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(date.getUTCHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H: function H(date, token) {
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(date.getUTCHours(), token.length);
  },
  // Minute
  m: function m(date, token) {
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(date.getUTCMinutes(), token.length);
  },
  // Second
  s: function s(date, token) {
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(date.getUTCSeconds(), token.length);
  },
  // Fraction of second
  S: function S(date, token) {
    var numberOfDigits = token.length;
    var milliseconds = date.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
    return (0,_addLeadingZeros_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(fractionalSeconds, token.length);
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (formatters);

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/format/longFormatters/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/format/longFormatters/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var dateLongFormatter = function dateLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'P':
      return formatLong.date({
        width: 'short'
      });

    case 'PP':
      return formatLong.date({
        width: 'medium'
      });

    case 'PPP':
      return formatLong.date({
        width: 'long'
      });

    case 'PPPP':
    default:
      return formatLong.date({
        width: 'full'
      });
  }
};

var timeLongFormatter = function timeLongFormatter(pattern, formatLong) {
  switch (pattern) {
    case 'p':
      return formatLong.time({
        width: 'short'
      });

    case 'pp':
      return formatLong.time({
        width: 'medium'
      });

    case 'ppp':
      return formatLong.time({
        width: 'long'
      });

    case 'pppp':
    default:
      return formatLong.time({
        width: 'full'
      });
  }
};

var dateTimeLongFormatter = function dateTimeLongFormatter(pattern, formatLong) {
  var matchResult = pattern.match(/(P+)(p+)?/) || [];
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];

  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong);
  }

  var dateTimeFormat;

  switch (datePattern) {
    case 'P':
      dateTimeFormat = formatLong.dateTime({
        width: 'short'
      });
      break;

    case 'PP':
      dateTimeFormat = formatLong.dateTime({
        width: 'medium'
      });
      break;

    case 'PPP':
      dateTimeFormat = formatLong.dateTime({
        width: 'long'
      });
      break;

    case 'PPPP':
    default:
      dateTimeFormat = formatLong.dateTime({
        width: 'full'
      });
      break;
  }

  return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
};

var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (longFormatters);

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getTimezoneOffsetInMilliseconds)
/* harmony export */ });
/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getUTCDayOfYear)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");


var MILLISECONDS_IN_DAY = 86400000;
function getUTCDayOfYear(dirtyDate) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var timestamp = date.getTime();
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getUTCISOWeek)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../startOfUTCISOWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js");
/* harmony import */ var _startOfUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../startOfUTCISOWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");




var MILLISECONDS_IN_WEEK = 604800000;
function getUTCISOWeek(dirtyDate) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var diff = (0,_startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(date).getTime() - (0,_startOfUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])(date).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getUTCISOWeekYear)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../startOfUTCISOWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js");



function getUTCISOWeekYear(dirtyDate) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var year = date.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = (0,_startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = (0,_startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(fourthOfJanuaryOfThisYear);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getUTCWeek/index.js":
/*!************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getUTCWeek/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getUTCWeek)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../startOfUTCWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js");
/* harmony import */ var _startOfUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../startOfUTCWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");




var MILLISECONDS_IN_WEEK = 604800000;
function getUTCWeek(dirtyDate, options) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var diff = (0,_startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(date, options).getTime() - (0,_startOfUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])(date, options).getTime(); // Round the number of days to the nearest integer
  // because the number of milliseconds in a week is not constant
  // (e.g. it's different in the week of the daylight saving time clock shift)

  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getUTCWeekYear)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../startOfUTCWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js");
/* harmony import */ var _toInteger_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");
/* harmony import */ var _defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../defaultOptions/index.js */ "./node_modules/date-fns/esm/_lib/defaultOptions/index.js");





function getUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var year = date.getUTCFullYear();
  var defaultOptions = (0,_defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_2__.getDefaultOptions)();
  var firstWeekContainsDate = (0,_toInteger_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var firstWeekOfNextYear = new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = (0,_startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__["default"])(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = (0,_startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__["default"])(firstWeekOfThisYear, options);

  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/protectedTokens/index.js":
/*!*****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/protectedTokens/index.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isProtectedDayOfYearToken": () => (/* binding */ isProtectedDayOfYearToken),
/* harmony export */   "isProtectedWeekYearToken": () => (/* binding */ isProtectedWeekYearToken),
/* harmony export */   "throwProtectedError": () => (/* binding */ throwProtectedError)
/* harmony export */ });
var protectedDayOfYearTokens = ['D', 'DD'];
var protectedWeekYearTokens = ['YY', 'YYYY'];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token, format, input) {
  if (token === 'YYYY') {
    throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'YY') {
    throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'D') {
    throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  } else if (token === 'DD') {
    throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md"));
  }
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/requiredArgs/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ requiredArgs)
/* harmony export */ });
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
  }
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js":
/*!*******************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ startOfUTCISOWeek)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");


function startOfUTCISOWeek(dirtyDate) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var weekStartsOn = 1;
  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ startOfUTCISOWeekYear)
/* harmony export */ });
/* harmony import */ var _getUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../getUTCISOWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js");
/* harmony import */ var _startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../startOfUTCISOWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");



function startOfUTCISOWeekYear(dirtyDate) {
  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var year = (0,_getUTCISOWeekYear_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate);
  var fourthOfJanuary = new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date = (0,_startOfUTCISOWeek_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(fourthOfJanuary);
  return date;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js":
/*!****************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ startOfUTCWeek)
/* harmony export */ });
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");
/* harmony import */ var _defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../defaultOptions/index.js */ "./node_modules/date-fns/esm/_lib/defaultOptions/index.js");




function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var defaultOptions = (0,_defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__.getDefaultOptions)();
  var weekStartsOn = (0,_toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js":
/*!********************************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ startOfUTCWeekYear)
/* harmony export */ });
/* harmony import */ var _getUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../getUTCWeekYear/index.js */ "./node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js");
/* harmony import */ var _requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../startOfUTCWeek/index.js */ "./node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js");
/* harmony import */ var _toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");
/* harmony import */ var _defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../defaultOptions/index.js */ "./node_modules/date-fns/esm/_lib/defaultOptions/index.js");





function startOfUTCWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;

  (0,_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var defaultOptions = (0,_defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__.getDefaultOptions)();
  var firstWeekContainsDate = (0,_toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = (0,_getUTCWeekYear_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])(dirtyDate, options);
  var firstWeek = new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date = (0,_startOfUTCWeek_index_js__WEBPACK_IMPORTED_MODULE_4__["default"])(firstWeek, options);
  return date;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/_lib/toInteger/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/date-fns/esm/_lib/toInteger/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toInteger)
/* harmony export */ });
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }

  var number = Number(dirtyNumber);

  if (isNaN(number)) {
    return number;
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

/***/ }),

/***/ "./node_modules/date-fns/esm/addMilliseconds/index.js":
/*!************************************************************!*\
  !*** ./node_modules/date-fns/esm/addMilliseconds/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ addMilliseconds)
/* harmony export */ });
/* harmony import */ var _lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_lib/toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");



/**
 * @name addMilliseconds
 * @category Millisecond Helpers
 * @summary Add the specified number of milliseconds to the given date.
 *
 * @description
 * Add the specified number of milliseconds to the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
 * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:30.750
 */

function addMilliseconds(dirtyDate, dirtyAmount) {
  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(2, arguments);
  var timestamp = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate).getTime();
  var amount = (0,_lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dirtyAmount);
  return new Date(timestamp + amount);
}

/***/ }),

/***/ "./node_modules/date-fns/esm/format/index.js":
/*!***************************************************!*\
  !*** ./node_modules/date-fns/esm/format/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ format)
/* harmony export */ });
/* harmony import */ var _isValid_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../isValid/index.js */ "./node_modules/date-fns/esm/isValid/index.js");
/* harmony import */ var _subMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../subMilliseconds/index.js */ "./node_modules/date-fns/esm/subMilliseconds/index.js");
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _lib_format_formatters_index_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../_lib/format/formatters/index.js */ "./node_modules/date-fns/esm/_lib/format/formatters/index.js");
/* harmony import */ var _lib_format_longFormatters_index_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../_lib/format/longFormatters/index.js */ "./node_modules/date-fns/esm/_lib/format/longFormatters/index.js");
/* harmony import */ var _lib_getTimezoneOffsetInMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../_lib/getTimezoneOffsetInMilliseconds/index.js */ "./node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js");
/* harmony import */ var _lib_protectedTokens_index_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../_lib/protectedTokens/index.js */ "./node_modules/date-fns/esm/_lib/protectedTokens/index.js");
/* harmony import */ var _lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../_lib/toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _lib_defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../_lib/defaultOptions/index.js */ "./node_modules/date-fns/esm/_lib/defaultOptions/index.js");
/* harmony import */ var _lib_defaultLocale_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_lib/defaultLocale/index.js */ "./node_modules/date-fns/esm/_lib/defaultLocale/index.js");










 // This RegExp consists of three parts separated by `|`:
// - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
//   (one of the certain letters followed by `o`)
// - (\w)\1* matches any sequences of the same letter
// - '' matches two quote characters in a row
// - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
//   except a single quote symbol, which ends the sequence.
//   Two quote characters do not end the sequence.
//   If there is no matching single quote
//   then the sequence will continue until the end of the string.
// - . matches any single character unmatched by previous parts of the RegExps

var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
/**
 * @name format
 * @category Common Helpers
 * @summary Format the date.
 *
 * @description
 * Return the formatted date string in the given format. The result may vary by locale.
 *
 * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
 * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * The characters wrapped between two single quotes characters (') are escaped.
 * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
 * (see the last example)
 *
 * Format of the string is based on Unicode Technical Standard #35:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * with a few additions (see note 7 below the table).
 *
 * Accepted patterns:
 * | Unit                            | Pattern | Result examples                   | Notes |
 * |---------------------------------|---------|-----------------------------------|-------|
 * | Era                             | G..GGG  | AD, BC                            |       |
 * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
 * |                                 | GGGGG   | A, B                              |       |
 * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
 * |                                 | yy      | 44, 01, 00, 17                    | 5     |
 * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
 * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
 * |                                 | yyyyy   | ...                               | 3,5   |
 * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
 * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
 * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
 * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
 * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
 * |                                 | YYYYY   | ...                               | 3,5   |
 * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
 * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
 * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
 * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
 * |                                 | RRRRR   | ...                               | 3,5,7 |
 * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
 * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
 * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
 * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
 * |                                 | uuuuu   | ...                               | 3,5   |
 * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
 * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | QQ      | 01, 02, 03, 04                    |       |
 * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
 * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
 * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
 * |                                 | qq      | 01, 02, 03, 04                    |       |
 * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
 * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
 * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
 * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
 * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | MM      | 01, 02, ..., 12                   |       |
 * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
 * |                                 | MMMM    | January, February, ..., December  | 2     |
 * |                                 | MMMMM   | J, F, ..., D                      |       |
 * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
 * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
 * |                                 | LL      | 01, 02, ..., 12                   |       |
 * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
 * |                                 | LLLL    | January, February, ..., December  | 2     |
 * |                                 | LLLLL   | J, F, ..., D                      |       |
 * | Local week of year              | w       | 1, 2, ..., 53                     |       |
 * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | ww      | 01, 02, ..., 53                   |       |
 * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
 * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
 * |                                 | II      | 01, 02, ..., 53                   | 7     |
 * | Day of month                    | d       | 1, 2, ..., 31                     |       |
 * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
 * |                                 | dd      | 01, 02, ..., 31                   |       |
 * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
 * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
 * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
 * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
 * |                                 | DDDD    | ...                               | 3     |
 * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
 * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
 * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
 * |                                 | ii      | 01, 02, ..., 07                   | 7     |
 * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
 * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
 * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
 * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
 * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
 * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | ee      | 02, 03, ..., 01                   |       |
 * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
 * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
 * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
 * |                                 | cc      | 02, 03, ..., 01                   |       |
 * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
 * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
 * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
 * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
 * | AM, PM                          | a..aa   | AM, PM                            |       |
 * |                                 | aaa     | am, pm                            |       |
 * |                                 | aaaa    | a.m., p.m.                        | 2     |
 * |                                 | aaaaa   | a, p                              |       |
 * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
 * |                                 | bbb     | am, pm, noon, midnight            |       |
 * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
 * |                                 | bbbbb   | a, p, n, mi                       |       |
 * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
 * |                                 | BBBB    | at night, in the morning, ...     | 2     |
 * |                                 | BBBBB   | at night, in the morning, ...     |       |
 * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
 * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
 * |                                 | hh      | 01, 02, ..., 11, 12               |       |
 * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
 * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
 * |                                 | HH      | 00, 01, 02, ..., 23               |       |
 * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
 * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
 * |                                 | KK      | 01, 02, ..., 11, 00               |       |
 * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
 * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
 * |                                 | kk      | 24, 01, 02, ..., 23               |       |
 * | Minute                          | m       | 0, 1, ..., 59                     |       |
 * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | mm      | 00, 01, ..., 59                   |       |
 * | Second                          | s       | 0, 1, ..., 59                     |       |
 * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
 * |                                 | ss      | 00, 01, ..., 59                   |       |
 * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
 * |                                 | SS      | 00, 01, ..., 99                   |       |
 * |                                 | SSS     | 000, 001, ..., 999                |       |
 * |                                 | SSSS    | ...                               | 3     |
 * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
 * |                                 | XX      | -0800, +0530, Z                   |       |
 * |                                 | XXX     | -08:00, +05:30, Z                 |       |
 * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
 * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
 * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
 * |                                 | xx      | -0800, +0530, +0000               |       |
 * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
 * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
 * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
 * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
 * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
 * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
 * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
 * | Seconds timestamp               | t       | 512969520                         | 7     |
 * |                                 | tt      | ...                               | 3,7   |
 * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
 * |                                 | TT      | ...                               | 3,7   |
 * | Long localized date             | P       | 04/29/1453                        | 7     |
 * |                                 | PP      | Apr 29, 1453                      | 7     |
 * |                                 | PPP     | April 29th, 1453                  | 7     |
 * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
 * | Long localized time             | p       | 12:00 AM                          | 7     |
 * |                                 | pp      | 12:00:00 AM                       | 7     |
 * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
 * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
 * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
 * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
 * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
 * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
 * Notes:
 * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
 *    are the same as "stand-alone" units, but are different in some languages.
 *    "Formatting" units are declined according to the rules of the language
 *    in the context of a date. "Stand-alone" units are always nominative singular:
 *
 *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
 *
 *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
 *
 * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
 *    the single quote characters (see below).
 *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
 *    the output will be the same as default pattern for this unit, usually
 *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
 *    are marked with "2" in the last column of the table.
 *
 *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
 *
 *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
 *
 * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
 *    The output will be padded with zeros to match the length of the pattern.
 *
 *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
 *
 * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
 *    These tokens represent the shortest form of the quarter.
 *
 * 5. The main difference between `y` and `u` patterns are B.C. years:
 *
 *    | Year | `y` | `u` |
 *    |------|-----|-----|
 *    | AC 1 |   1 |   1 |
 *    | BC 1 |   1 |   0 |
 *    | BC 2 |   2 |  -1 |
 *
 *    Also `yy` always returns the last two digits of a year,
 *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
 *
 *    | Year | `yy` | `uu` |
 *    |------|------|------|
 *    | 1    |   01 |   01 |
 *    | 14   |   14 |   14 |
 *    | 376  |   76 |  376 |
 *    | 1453 |   53 | 1453 |
 *
 *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
 *    except local week-numbering years are dependent on `options.weekStartsOn`
 *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
 *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
 *
 * 6. Specific non-location timezones are currently unavailable in `date-fns`,
 *    so right now these tokens fall back to GMT timezones.
 *
 * 7. These patterns are not in the Unicode Technical Standard #35:
 *    - `i`: ISO day of week
 *    - `I`: ISO week of year
 *    - `R`: ISO week-numbering year
 *    - `t`: seconds timestamp
 *    - `T`: milliseconds timestamp
 *    - `o`: ordinal number modifier
 *    - `P`: long localized date
 *    - `p`: long localized time
 *
 * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
 *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
 *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 *
 * @param {Date|Number} date - the original date
 * @param {String} format - the string of tokens
 * @param {Object} [options] - an object with options.
 * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
 * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
 * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
 *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @returns {String} the formatted date string
 * @throws {TypeError} 2 arguments required
 * @throws {RangeError} `date` must not be Invalid Date
 * @throws {RangeError} `options.locale` must contain `localize` property
 * @throws {RangeError} `options.locale` must contain `formatLong` property
 * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
 * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
 * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
 * @throws {RangeError} format string contains an unescaped latin alphabet character
 *
 * @example
 * // Represent 11 February 2014 in middle-endian format:
 * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
 * //=> '02/11/2014'
 *
 * @example
 * // Represent 2 July 2014 in Esperanto:
 * import { eoLocale } from 'date-fns/locale/eo'
 * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
 *   locale: eoLocale
 * })
 * //=> '2-a de julio 2014'
 *
 * @example
 * // Escape string by single quote characters:
 * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
 * //=> "3 o'clock"
 */

function format(dirtyDate, dirtyFormatStr, options) {
  var _ref, _options$locale, _ref2, _ref3, _ref4, _options$firstWeekCon, _options$locale2, _options$locale2$opti, _defaultOptions$local, _defaultOptions$local2, _ref5, _ref6, _ref7, _options$weekStartsOn, _options$locale3, _options$locale3$opti, _defaultOptions$local3, _defaultOptions$local4;

  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var defaultOptions = (0,_lib_defaultOptions_index_js__WEBPACK_IMPORTED_MODULE_1__.getDefaultOptions)();
  var locale = (_ref = (_options$locale = options === null || options === void 0 ? void 0 : options.locale) !== null && _options$locale !== void 0 ? _options$locale : defaultOptions.locale) !== null && _ref !== void 0 ? _ref : _lib_defaultLocale_index_js__WEBPACK_IMPORTED_MODULE_2__["default"];
  var firstWeekContainsDate = (0,_lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])((_ref2 = (_ref3 = (_ref4 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale2 = options.locale) === null || _options$locale2 === void 0 ? void 0 : (_options$locale2$opti = _options$locale2.options) === null || _options$locale2$opti === void 0 ? void 0 : _options$locale2$opti.firstWeekContainsDate) !== null && _ref4 !== void 0 ? _ref4 : defaultOptions.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : 1); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
  }

  var weekStartsOn = (0,_lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_3__["default"])((_ref5 = (_ref6 = (_ref7 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale3 = options.locale) === null || _options$locale3 === void 0 ? void 0 : (_options$locale3$opti = _options$locale3.options) === null || _options$locale3$opti === void 0 ? void 0 : _options$locale3$opti.weekStartsOn) !== null && _ref7 !== void 0 ? _ref7 : defaultOptions.weekStartsOn) !== null && _ref6 !== void 0 ? _ref6 : (_defaultOptions$local3 = defaultOptions.locale) === null || _defaultOptions$local3 === void 0 ? void 0 : (_defaultOptions$local4 = _defaultOptions$local3.options) === null || _defaultOptions$local4 === void 0 ? void 0 : _defaultOptions$local4.weekStartsOn) !== null && _ref5 !== void 0 ? _ref5 : 0); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
  }

  if (!locale.localize) {
    throw new RangeError('locale must contain localize property');
  }

  if (!locale.formatLong) {
    throw new RangeError('locale must contain formatLong property');
  }

  var originalDate = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_4__["default"])(dirtyDate);

  if (!(0,_isValid_index_js__WEBPACK_IMPORTED_MODULE_5__["default"])(originalDate)) {
    throw new RangeError('Invalid time value');
  } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
  // This ensures that when UTC functions will be implemented, locales will be compatible with them.
  // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


  var timezoneOffset = (0,_lib_getTimezoneOffsetInMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_6__["default"])(originalDate);
  var utcDate = (0,_subMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_7__["default"])(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate: firstWeekContainsDate,
    weekStartsOn: weekStartsOn,
    locale: locale,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
    var firstCharacter = substring[0];

    if (firstCharacter === 'p' || firstCharacter === 'P') {
      var longFormatter = _lib_format_longFormatters_index_js__WEBPACK_IMPORTED_MODULE_8__["default"][firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }

    return substring;
  }).join('').match(formattingTokensRegExp).map(function (substring) {
    // Replace two single quote characters with one single quote character
    if (substring === "''") {
      return "'";
    }

    var firstCharacter = substring[0];

    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }

    var formatter = _lib_format_formatters_index_js__WEBPACK_IMPORTED_MODULE_9__["default"][firstCharacter];

    if (formatter) {
      if (!(options !== null && options !== void 0 && options.useAdditionalWeekYearTokens) && (0,_lib_protectedTokens_index_js__WEBPACK_IMPORTED_MODULE_10__.isProtectedWeekYearToken)(substring)) {
        (0,_lib_protectedTokens_index_js__WEBPACK_IMPORTED_MODULE_10__.throwProtectedError)(substring, dirtyFormatStr, String(dirtyDate));
      }

      if (!(options !== null && options !== void 0 && options.useAdditionalDayOfYearTokens) && (0,_lib_protectedTokens_index_js__WEBPACK_IMPORTED_MODULE_10__.isProtectedDayOfYearToken)(substring)) {
        (0,_lib_protectedTokens_index_js__WEBPACK_IMPORTED_MODULE_10__.throwProtectedError)(substring, dirtyFormatStr, String(dirtyDate));
      }

      return formatter(utcDate, substring, locale.localize, formatterOptions);
    }

    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
    }

    return substring;
  }).join('');
  return result;
}

function cleanEscapedString(input) {
  var matched = input.match(escapedStringRegExp);

  if (!matched) {
    return input;
  }

  return matched[1].replace(doubleQuoteRegExp, "'");
}

/***/ }),

/***/ "./node_modules/date-fns/esm/isDate/index.js":
/*!***************************************************!*\
  !*** ./node_modules/date-fns/esm/isDate/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isDate)
/* harmony export */ });
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


/**
 * @name isDate
 * @category Common Helpers
 * @summary Is the given value a date?
 *
 * @description
 * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
 *
 * @param {*} value - the value to check
 * @returns {boolean} true if the given value is a date
 * @throws {TypeError} 1 arguments required
 *
 * @example
 * // For a valid date:
 * const result = isDate(new Date())
 * //=> true
 *
 * @example
 * // For an invalid date:
 * const result = isDate(new Date(NaN))
 * //=> true
 *
 * @example
 * // For some value:
 * const result = isDate('2014-02-31')
 * //=> false
 *
 * @example
 * // For an object:
 * const result = isDate({})
 * //=> false
 */

function isDate(value) {
  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  return value instanceof Date || _typeof(value) === 'object' && Object.prototype.toString.call(value) === '[object Date]';
}

/***/ }),

/***/ "./node_modules/date-fns/esm/isValid/index.js":
/*!****************************************************!*\
  !*** ./node_modules/date-fns/esm/isValid/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isValid)
/* harmony export */ });
/* harmony import */ var _isDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../isDate/index.js */ "./node_modules/date-fns/esm/isDate/index.js");
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../toDate/index.js */ "./node_modules/date-fns/esm/toDate/index.js");
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");



/**
 * @name isValid
 * @category Common Helpers
 * @summary Is the given date valid?
 *
 * @description
 * Returns false if argument is Invalid Date and true otherwise.
 * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
 * Invalid Date is a Date, whose time value is NaN.
 *
 * Time value of Date: http://es5.github.io/#x15.9.1.1
 *
 * @param {*} date - the date to check
 * @returns {Boolean} the date is valid
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // For the valid date:
 * const result = isValid(new Date(2014, 1, 31))
 * //=> true
 *
 * @example
 * // For the value, convertable into a date:
 * const result = isValid(1393804800000)
 * //=> true
 *
 * @example
 * // For the invalid date:
 * const result = isValid(new Date(''))
 * //=> false
 */

function isValid(dirtyDate) {
  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);

  if (!(0,_isDate_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyDate) && typeof dirtyDate !== 'number') {
    return false;
  }

  var date = (0,_toDate_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dirtyDate);
  return !isNaN(Number(date));
}

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js":
/*!**************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ buildFormatLongFn)
/* harmony export */ });
function buildFormatLongFn(args) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // TODO: Remove String()
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ buildLocalizeFn)
/* harmony export */ });
function buildLocalizeFn(args) {
  return function (dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : 'standalone';
    var valuesArray;

    if (context === 'formatting' && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;

      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;

      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }

    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex; // @ts-ignore: For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!

    return valuesArray[index];
  };
}

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js":
/*!*********************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ buildMatchFn)
/* harmony export */ });
function buildMatchFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);

    if (!matchResult) {
      return null;
    }

    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function (pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }

  return undefined;
}

function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }

  return undefined;
}

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js":
/*!****************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ buildMatchPatternFn)
/* harmony export */ });
function buildMatchPatternFn(args) {
  return function (string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value: value,
      rest: rest
    };
  };
}

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: 'less than a second',
    other: 'less than {{count}} seconds'
  },
  xSeconds: {
    one: '1 second',
    other: '{{count}} seconds'
  },
  halfAMinute: 'half a minute',
  lessThanXMinutes: {
    one: 'less than a minute',
    other: 'less than {{count}} minutes'
  },
  xMinutes: {
    one: '1 minute',
    other: '{{count}} minutes'
  },
  aboutXHours: {
    one: 'about 1 hour',
    other: 'about {{count}} hours'
  },
  xHours: {
    one: '1 hour',
    other: '{{count}} hours'
  },
  xDays: {
    one: '1 day',
    other: '{{count}} days'
  },
  aboutXWeeks: {
    one: 'about 1 week',
    other: 'about {{count}} weeks'
  },
  xWeeks: {
    one: '1 week',
    other: '{{count}} weeks'
  },
  aboutXMonths: {
    one: 'about 1 month',
    other: 'about {{count}} months'
  },
  xMonths: {
    one: '1 month',
    other: '{{count}} months'
  },
  aboutXYears: {
    one: 'about 1 year',
    other: 'about {{count}} years'
  },
  xYears: {
    one: '1 year',
    other: '{{count}} years'
  },
  overXYears: {
    one: 'over 1 year',
    other: 'over {{count}} years'
  },
  almostXYears: {
    one: 'almost 1 year',
    other: 'almost {{count}} years'
  }
};

var formatDistance = function formatDistance(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];

  if (typeof tokenValue === 'string') {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace('{{count}}', count.toString());
  }

  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return 'in ' + result;
    } else {
      return result + ' ago';
    }
  }

  return result;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (formatDistance);

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js":
/*!*************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_buildFormatLongFn_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../_lib/buildFormatLongFn/index.js */ "./node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js");

var dateFormats = {
  full: 'EEEE, MMMM do, y',
  long: 'MMMM do, y',
  medium: 'MMM d, y',
  short: 'MM/dd/yyyy'
};
var timeFormats = {
  full: 'h:mm:ss a zzzz',
  long: 'h:mm:ss a z',
  medium: 'h:mm:ss a',
  short: 'h:mm a'
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: '{{date}}, {{time}}',
  short: '{{date}}, {{time}}'
};
var formatLong = {
  date: (0,_lib_buildFormatLongFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    formats: dateFormats,
    defaultWidth: 'full'
  }),
  time: (0,_lib_buildFormatLongFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    formats: timeFormats,
    defaultWidth: 'full'
  }),
  dateTime: (0,_lib_buildFormatLongFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    formats: dateTimeFormats,
    defaultWidth: 'full'
  })
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (formatLong);

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'P'
};

var formatRelative = function formatRelative(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (formatRelative);

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js":
/*!***********************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../_lib/buildLocalizeFn/index.js */ "./node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js");

var eraValues = {
  narrow: ['B', 'A'],
  abbreviated: ['BC', 'AD'],
  wide: ['Before Christ', 'Anno Domini']
};
var quarterValues = {
  narrow: ['1', '2', '3', '4'],
  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
  wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
}; // Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.

var monthValues = {
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
var dayValues = {
  narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};
var dayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    night: 'night'
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'in the morning',
    afternoon: 'in the afternoon',
    evening: 'in the evening',
    night: 'at night'
  }
};

var ordinalNumber = function ordinalNumber(dirtyNumber, _options) {
  var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.

  var rem100 = number % 100;

  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + 'st';

      case 2:
        return number + 'nd';

      case 3:
        return number + 'rd';
    }
  }

  return number + 'th';
};

var localize = {
  ordinalNumber: ordinalNumber,
  era: (0,_lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    values: eraValues,
    defaultWidth: 'wide'
  }),
  quarter: (0,_lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    values: quarterValues,
    defaultWidth: 'wide',
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: (0,_lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    values: monthValues,
    defaultWidth: 'wide'
  }),
  day: (0,_lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    values: dayValues,
    defaultWidth: 'wide'
  }),
  dayPeriod: (0,_lib_buildLocalizeFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    values: dayPeriodValues,
    defaultWidth: 'wide',
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: 'wide'
  })
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (localize);

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/_lib/match/index.js":
/*!********************************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/_lib/match/index.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../_lib/buildMatchFn/index.js */ "./node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js");
/* harmony import */ var _lib_buildMatchPatternFn_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../_lib/buildMatchPatternFn/index.js */ "./node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js");


var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: (0,_lib_buildMatchPatternFn_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: (0,_lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseEraPatterns,
    defaultParseWidth: 'any'
  }),
  quarter: (0,_lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: 'any',
    valueCallback: function valueCallback(index) {
      return index + 1;
    }
  }),
  month: (0,_lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: 'any'
  }),
  day: (0,_lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: 'wide',
    parsePatterns: parseDayPatterns,
    defaultParseWidth: 'any'
  }),
  dayPeriod: (0,_lib_buildMatchFn_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: 'any',
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: 'any'
  })
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (match);

/***/ }),

/***/ "./node_modules/date-fns/esm/locale/en-US/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/date-fns/esm/locale/en-US/index.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_formatDistance_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_lib/formatDistance/index.js */ "./node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js");
/* harmony import */ var _lib_formatLong_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_lib/formatLong/index.js */ "./node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js");
/* harmony import */ var _lib_formatRelative_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_lib/formatRelative/index.js */ "./node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js");
/* harmony import */ var _lib_localize_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_lib/localize/index.js */ "./node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js");
/* harmony import */ var _lib_match_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_lib/match/index.js */ "./node_modules/date-fns/esm/locale/en-US/_lib/match/index.js");






/**
 * @type {Locale}
 * @category Locales
 * @summary English locale (United States).
 * @language English
 * @iso-639-2 eng
 * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
 * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
 */
var locale = {
  code: 'en-US',
  formatDistance: _lib_formatDistance_index_js__WEBPACK_IMPORTED_MODULE_0__["default"],
  formatLong: _lib_formatLong_index_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  formatRelative: _lib_formatRelative_index_js__WEBPACK_IMPORTED_MODULE_2__["default"],
  localize: _lib_localize_index_js__WEBPACK_IMPORTED_MODULE_3__["default"],
  match: _lib_match_index_js__WEBPACK_IMPORTED_MODULE_4__["default"],
  options: {
    weekStartsOn: 0
    /* Sunday */
    ,
    firstWeekContainsDate: 1
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (locale);

/***/ }),

/***/ "./node_modules/date-fns/esm/subMilliseconds/index.js":
/*!************************************************************!*\
  !*** ./node_modules/date-fns/esm/subMilliseconds/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ subMilliseconds)
/* harmony export */ });
/* harmony import */ var _addMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../addMilliseconds/index.js */ "./node_modules/date-fns/esm/addMilliseconds/index.js");
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
/* harmony import */ var _lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../_lib/toInteger/index.js */ "./node_modules/date-fns/esm/_lib/toInteger/index.js");



/**
 * @name subMilliseconds
 * @category Millisecond Helpers
 * @summary Subtract the specified number of milliseconds from the given date.
 *
 * @description
 * Subtract the specified number of milliseconds from the given date.
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the milliseconds subtracted
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
 * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
 * //=> Thu Jul 10 2014 12:45:29.250
 */

function subMilliseconds(dirtyDate, dirtyAmount) {
  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(2, arguments);
  var amount = (0,_lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_1__["default"])(dirtyAmount);
  return (0,_addMilliseconds_index_js__WEBPACK_IMPORTED_MODULE_2__["default"])(dirtyDate, -amount);
}

/***/ }),

/***/ "./node_modules/date-fns/esm/toDate/index.js":
/*!***************************************************!*\
  !*** ./node_modules/date-fns/esm/toDate/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toDate)
/* harmony export */ });
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../_lib/requiredArgs/index.js */ "./node_modules/date-fns/esm/_lib/requiredArgs/index.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @param {Date|Number} argument - the value to convert
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */

function toDate(argument) {
  (0,_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1, arguments);
  var argStr = Object.prototype.toString.call(argument); // Clone the date

  if (argument instanceof Date || _typeof(argument) === 'object' && argStr === '[object Date]') {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else {
    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments"); // eslint-disable-next-line no-console

      console.warn(new Error().stack);
    }

    return new Date(NaN);
  }
}

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/logicModule.js":
/*!****************************!*\
  !*** ./src/logicModule.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "domManipulator": () => (/* binding */ domManipulator),
/* harmony export */   "notesManager": () => (/* binding */ notesManager),
/* harmony export */   "toDosManager": () => (/* binding */ toDosManager)
/* harmony export */ });
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! date-fns */ "./node_modules/date-fns/esm/format/index.js");
/* harmony import */ var colcade__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colcade */ "./node_modules/colcade/colcade.js");
/* harmony import */ var colcade__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(colcade__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _images_edit_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./images/edit.png */ "./src/images/edit.png");
/* harmony import */ var _images_bin_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./images/bin.png */ "./src/images/bin.png");







// DOM manipulation object 
const domManipulator = (function () {

    // displays all todos stored in array to the dom
    function renderToDos(todos, element) {

        

        // grab relevent todo items
        const toDoList = todos[toDosManager.getCurrentProject()];
        // console.log(toDoList);
        

        // clear out display before redisplaying all to-dos
        element.innerHTML = "" 
        
        // dont render an empty list
        if (toDoList.length == 0) {
            return
        }

        // create a to-do element for each todo stored in the passed array 
        // and append them to the dom element supplied to the function
        toDoList.forEach((todo, i) => {
            
            // create main body of the to-do item
            const toDoBody = document.createElement('div');
            toDoBody.classList.add('todo');
            toDoBody.classList.add(`priority-${todo.priority}`);
            // give each to-do element a unique value that corresponds to
            // it's data's position in the array
            toDoBody.setAttribute('data-index', i);
            // set data atrribute to the to-do items project name
            toDoBody.setAttribute('data-project', `${todo.project}`)
            
            // create to-do item checkbox 
            const toDoCheckBox = document.createElement('div');
            toDoCheckBox.classList.add('todo__complete');
            toDoCheckBox.addEventListener('click', e => toggleCheckBox(e, todos, element));
            
            // create to-do item title
            const toDoTitle = document.createElement('div');
            toDoTitle.classList.add('todo__title');
            toDoTitle.textContent = todo.name;
            
            // create to-do item details button
            const toDoDetails = document.createElement('div');
            toDoDetails.classList.add('todo__detail');
            toDoDetails.textContent = 'details';
            toDoDetails.addEventListener('click', (e) => {
                renderDetails(e, toDoList);
            })
    
            // create a to-do due date label.
            // displays a human readable representation of the date input string
            const toDoDate = document.createElement('div');
            toDoDate.classList.add('todo__date');
            // convert date string into a date the form of "Jan 12th"
            const dateObject = new Date(todo.date);
            const dateMonth = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(dateObject, 'MMM');
            const dateDay = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(dateObject, 'do');
            const dateFormated = `${dateMonth} ${dateDay}`;
            toDoDate.textContent = dateFormated;

            // create a edit icon for the to-do item
            const toDoEdit = new Image();
            toDoEdit.src=_images_edit_png__WEBPACK_IMPORTED_MODULE_1__
            toDoEdit.classList.add('todo__icon-edit');
            toDoEdit.classList.add('todo__icon');
            toDoEdit.addEventListener('click', e => renderEdit(e, toDoList, element));
            
            // create a delete icon for the to-do item
            const toDoDelete = new Image();
            toDoDelete.src=_images_bin_png__WEBPACK_IMPORTED_MODULE_2__;
            toDoDelete.classList.add('todo__icon');
            toDoDelete.classList.add('todo__icon-bin');
            toDoDelete.addEventListener('click', e => toDosManager.deleteToDo(e, todos, element));
            
            toDoBody.appendChild(toDoCheckBox);
            toDoBody.appendChild(toDoTitle);
            toDoBody.appendChild(toDoDetails);
            toDoBody.appendChild(toDoDate);
            toDoBody.appendChild(toDoEdit);
            toDoBody.appendChild(toDoDelete);

            //apply checked status 
            if (todo.checked) {
                applyCheckedOnReload(toDoBody)
            }
    
            element.appendChild(toDoBody);
        })

        // save todos to local storage
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    // render all to-dos from all projects 
    function renderAllToDos(toDoObject, element) {

        

        // clear out display before redisplaying all to-dos
        element.innerHTML = "" 

        for (const project in toDoObject) {

            // create a to-do element for each todo stored in the passed array 
            // and append them to the dom element supplied to the function
            toDoObject[project].forEach((todo, i) => {
                
                // create main body of the to-do item
                const toDoBody = document.createElement('div');
                toDoBody.classList.add('todo');
                toDoBody.classList.add(`priority-${todo.priority}`);
                // give each to-do element a unique value that corresponds to
                // it's data's position in the array
                toDoBody.setAttribute('data-index', i);
                // set data atrribute to the to-do items project name
                toDoBody.setAttribute('data-project', `${todo.project}`)
                
                // create to-do item checkbox 
                const toDoCheckBox = document.createElement('div');
                toDoCheckBox.classList.add('todo__complete');
                toDoCheckBox.addEventListener('click', e => toggleCheckBox(e, toDoObject, element));
                
                // create to-do item title
                const toDoTitle = document.createElement('div');
                toDoTitle.classList.add('todo__title');
                toDoTitle.textContent = todo.name;
                
                // create to-do item details button
                const toDoDetails = document.createElement('div');
                toDoDetails.classList.add('todo__detail');
                toDoDetails.textContent = 'details';
                toDoDetails.addEventListener('click', (e) => {
                    renderDetails(e, toDoObject[project]);
                })
        
                // create a to-do due date label.
                // displays a human readable representation of the date input string
                const toDoDate = document.createElement('div');
                toDoDate.classList.add('todo__date');
                // convert date string into a date the form of "Jan 12th"
                const dateObject = new Date(todo.date);
                const dateMonth = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(dateObject, 'MMM');
                const dateDay = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(dateObject, 'do');
                const dateFormated = `${dateMonth} ${dateDay}`;
                toDoDate.textContent = dateFormated;

                // create a edit icon for the to-do item
                const toDoEdit=new Image();
                toDoEdit.src=_images_edit_png__WEBPACK_IMPORTED_MODULE_1__;
                toDoEdit.classList.add('todo__icon-edit');
                toDoEdit.classList.add('todo__icon');
                toDoEdit.addEventListener('click', e => renderEdit(e, toDoObject[project], element));
                
                // create a delete icon for the to-do item
                const toDoDelete = new Image();
                toDoDelete.src=_images_bin_png__WEBPACK_IMPORTED_MODULE_2__;
                toDoDelete.classList.add('todo__icon');
                toDoDelete.classList.add('todo__icon-bin');
                toDoDelete.addEventListener('click', e => toDosManager.deleteToDo(e, toDoObject, element));
                                
                toDoBody.appendChild(toDoCheckBox);
                toDoBody.appendChild(toDoTitle);
                toDoBody.appendChild(toDoDetails);
                toDoBody.appendChild(toDoDate);
                toDoBody.appendChild(toDoEdit);
                toDoBody.appendChild(toDoDelete);

                //apply checked status 
                if (todo.checked) {
                    applyCheckedOnReload(toDoBody)
                }
        
                element.appendChild(toDoBody);
            })
        }

        // save todos to local storage
        localStorage.setItem("todos", JSON.stringify(toDoObject));
        
        
    }

    // retrieve the details for a selected to-do item and render them in a popup
    function renderDetails(e, todos) {

        const i = e.target.parentElement.dataset.index;
        const overlay = document.querySelector('.overlay-details');
        const display = document.querySelector('.details-popup__content');
        const popup = document.querySelector('.details-popup');

        // clear out the popup details information
        display.innerHTML = "";

        // create elements needed to build a details popup
        // main display of popup
        const body = document.createElement('div');
        body.classList.add('details-popup__content');

        // create title element
        const name = document.createElement('div');
        name.classList.add('details-popup__title');
        name.textContent = todos[i].name;

        // create project element
        // element made up of 2 spans. title and content
        const project = document.createElement('div');
        project.classList.add('details-popup__project');
        const projectTitle = document.createElement('span');
        projectTitle.textContent = 'Project:';
        projectTitle.classList.add('details-popup__catagory');
        const projectContent = document.createElement('span');
        projectContent.textContent = todos[i].project;
        project.appendChild(projectTitle);
        project.appendChild(projectContent);


        // create priority element
        const priority = document.createElement('div');
        priority.classList.add('details-popup__priority');
        const priorityTitle = document.createElement('span');
        priorityTitle.textContent = "Priority:";
        priorityTitle.classList.add('details-popup__catagory');
        const priorityContent = document.createElement('span');
        priorityContent.textContent = todos[i].priority[0].toUpperCase() + todos[i].priority.slice(1);
        priority.appendChild(priorityTitle);
        priority.appendChild(priorityContent);

         

        // create date element
        const date = document.createElement('div');
        date.classList.add('details-popup__due');
        const dateTitle = document.createElement('span');
        dateTitle.textContent = 'Due Date:';
        dateTitle.classList.add('details-popup__catagory');
        const dateContent = document.createElement('span');
        // display human readable date
        const day = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(new Date(todos[i].date), 'do');
        const month = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(new Date(todos[i].date), 'MMMM');
        const year = (0,date_fns__WEBPACK_IMPORTED_MODULE_3__["default"])(new Date(todos[i].date), 'yyyy');
        const formatedDate = `${month} ${day}, ${year}`;
        dateContent.textContent = formatedDate;
        date.appendChild(dateTitle);
        date.appendChild(dateContent);
        

        // create details element
        const details = document.createElement('div');
        details.classList.add('details-popup__details');
        const detailsTitle = document.createElement('span');
        detailsTitle.classList.add('details-popup__details-title');
        detailsTitle.textContent = "Details:";
        const detailsContent = document.createElement('span');
        detailsContent.textContent = todos[i].details;
        details.appendChild(detailsTitle);
        details.appendChild(detailsContent);

        body.appendChild(name);
        body.appendChild(project);
        body.appendChild(priority);
        body.appendChild(date);
        body.appendChild(details);

        display.appendChild(body);

        // show popup
        popup.classList.toggle("details-popup-open");
        overlay.classList.toggle("overlay-details-invisible");


    }

    function renderEdit(e, todos) {

        const element = e.target;
        let i= element.parentElement.dataset.index;
        let project= element.parentElement.dataset.project;

        const overlay = document.querySelector('.overlay-edit');
        const display = document.querySelector('.edit-popup__entry');
        const popup = document.querySelector('.edit-popup');

        // clear out the popup edit information
        display.innerHTML = "";

        // retreive name of todo and display it in a text area
        const title = document.createElement('textarea');
        title.classList.add('edit-popup__input');
        title.setAttribute('maxlength', '40');
        title.required = true;


        title.textContent = todos[i].name;

        // attatch index to title element so i can grab it when confirming edit
        // and change the array data for that to-do item
        title.dataset.index = i;
        // attach project name to title element so i can grab it when confirming edits
        title.dataset.project = project;

        // retreive details of todo and display it in a text area
        const details = document.createElement('textarea');
        details.classList.add('edit-popup__input', 'edit-popup__input-big');
        details.setAttribute("placeholder", "Details:")
        details.textContent = todos[i].details;

        // create the elements that make up the date section
        const dateContainer = document.createElement('div');
        dateContainer.classList.add('edit-popup__date');

        const dateContainerTitle = document.createElement('div');
        dateContainerTitle.classList.add('edit-popup__date-title');
        dateContainerTitle.textContent = 'Due Date:';

        const dateContainerInput = document.createElement('input');
        dateContainerInput.classList.add('edit-popup__date-input');
        dateContainerInput.setAttribute('type', 'date');
        dateContainerInput.required = true;
        dateContainerInput.setAttribute('value', todos[i].date);

        dateContainer.appendChild(dateContainerTitle);
        dateContainer.appendChild(dateContainerInput);

        // create the priority buttons section
        const footer = document.createElement('div');
        footer.classList.add('edit-popup__wrapper-priority-submit');

        const priorityContainer = document.createElement('div');
        priorityContainer.classList.add('edit-popup__priority');

        const priorityTitle = document.createElement('div');
        priorityTitle.classList.add('edit-popup__priority-title');
        priorityTitle.textContent = 'Priority:';
        // low priority input
        const priorityLowInput = document.createElement('input');
        priorityLowInput.setAttribute('type', 'radio');
        priorityLowInput.setAttribute('id', 'low');
        priorityLowInput.setAttribute('name', 'edit-priority');
        priorityLowInput.setAttribute('value', 'low');
        if (todos[i].priority === 'low') {
            priorityLowInput.checked = true;
        }
        priorityLowInput.required = true;
        // low priority label
        const priorityLowLabel = document.createElement('label');
        priorityLowLabel.setAttribute("for", "low");
        priorityLowLabel.classList.add('edit-popup__priority-btn', 'edit-popup__priority-btn--low');
        if (todos[i].priority === 'low') {
            priorityLowLabel.classList.add('edit-popup__priority-btn--low-active');
        }
        priorityLowLabel.textContent = "Low";
        // medium priority input
        const priorityMediumInput = document.createElement('input');
        priorityMediumInput.setAttribute('type', 'radio');
        priorityMediumInput.setAttribute('id', 'medium');
        priorityMediumInput.setAttribute('name', 'edit-priority');
        priorityMediumInput.setAttribute('value', 'medium');
        if (todos[i].priority === 'medium') {
            priorityMediumInput.checked = true;
        }
        priorityMediumInput.required = true;
        // Medium priority label
        const priorityMediumLabel = document.createElement('label');
        priorityMediumLabel.setAttribute("for", "medium");
        priorityMediumLabel.classList.add('edit-popup__priority-btn', 'edit-popup__priority-btn--medium');
        if (todos[i].priority === 'medium') {
            priorityMediumLabel.classList.add('edit-popup__priority-btn--medium-active');
        }
        priorityMediumLabel.textContent = "Medium";
        // high priority input
        const priorityHighInput = document.createElement('input');
        priorityHighInput.setAttribute('type', 'radio');
        priorityHighInput.setAttribute('id', 'high');
        priorityHighInput.setAttribute('name', 'edit-priority');
        priorityHighInput.setAttribute('value', 'high');
        if (todos[i].priority === 'high') {
            priorityHighInput.checked = true;
        }
        priorityHighInput.required = true;
        // high priority label
        const priorityHighLabel = document.createElement('label');
        priorityHighLabel.setAttribute("for", "high");
        priorityHighLabel.classList.add('edit-popup__priority-btn', 'edit-popup__priority-btn--high');
        if (todos[i].priority === 'high') {
            priorityHighLabel.classList.add('edit-popup__priority-btn--high-active');
        }
        priorityHighLabel.textContent = "High";

        

        priorityContainer.appendChild(priorityTitle);
        priorityContainer.appendChild(priorityLowInput);
        priorityContainer.appendChild(priorityLowLabel);
        priorityContainer.appendChild(priorityMediumInput);
        priorityContainer.appendChild(priorityMediumLabel);
        priorityContainer.appendChild(priorityHighInput);
        priorityContainer.appendChild(priorityHighLabel);

        // submit button (is in same footer as the piority buttons container)
        const submit = document.createElement("input");
        submit.setAttribute('type', "submit");
        submit.setAttribute('id', 'todo-edit-submit')
        submit.setAttribute('value', 'Confirm Edit')
        submit.classList.add("edit-popup__todo-submit");

        footer.appendChild(priorityContainer);
        footer.appendChild(submit);

        // append created elements to the DOM
        display.appendChild(title);
        display.appendChild(details);
        display.appendChild(dateContainer);
        display.appendChild(footer);

        //listener that changes the highlighted priority button
        const priorityBtns = document.querySelectorAll('.edit-popup__priority-btn');
        priorityBtns.forEach(btn => {
            btn.addEventListener('click', e =>{
                editPriority(e);
            });
        })


        // show popup
        popup.classList.toggle("edit-popup-open");
        overlay.classList.toggle("overlay-edit-invisible");

    }

    // applies modified styling to each element of a checked off to-do item 
    function toggleCheckBox(e, toDoObject, display) {

        // grabs all sibling elements of the clicked checkbox
        const toDo = e.target.parentElement;

        console.log(toDo.classList)

        toDo.classList.toggle('todo-checked');

        const toDoItems = toDo.children;
        
        // // todo checkbox
        toDoItems[0].classList.toggle('todo__complete-checked');
        // // todo title
        // toDoItems[1].classList.toggle('todo__title-checked');
        // // todo details button
        // toDoItems[2].classList.toggle('todo__detail-checked');
        // // todo date
        // toDoItems[3].classList.toggle('todo__date-checked');
        // // todo edit icon
        // toDoItems[4].classList.toggle('todo__icon-checked');
        // // todo delete icon
        // toDoItems[5].classList.toggle('todo__icon-checked');

        // toggle checked status on todo item data
        const project = toDo.dataset.project;
        const index = toDo.dataset.index;

        toDoObject[project][index].checked = !toDoObject[project][index].checked;
        console.log(toDoObject[project]);
    
        // save todos to local storage
        localStorage.setItem("todos", JSON.stringify(toDoObject));

        // update project count
        renderProjectNames(toDoObject, display)
        
    }

    // applies checked status to checked items on reload
    function applyCheckedOnReload(toDoItem) {

        toDoItem.classList.toggle('todo-checked');
        const toDoItems = toDoItem.children;


        
        // // todo checkbox
        toDoItems[0].classList.toggle('todo__complete-checked');
        // // todo title
        // toDoItems[1].classList.toggle('todo__title-checked');
        // // todo details button
        // toDoItems[2].classList.toggle('todo__detail-checked');
        // // todo date
        // toDoItems[3].classList.toggle('todo__date-checked');
        // // todo edit icon
        // toDoItems[4].classList.toggle('todo__icon-checked');
        // // todo delete icon
        // toDoItems[5].classList.toggle('todo__icon-checked');
    }

    function removeActivePriority() {
        // removes active status from all buttons
        const btns = document.querySelectorAll('.create-new__priority-btn');
        btns.forEach(btn => {
            btn.classList.remove(`create-new__priority-btn--${btn.textContent.toLowerCase()}-active`)
        })
    }

    // toggle active visual styling to priority buttons in create new to-do menu
    function activePriority(e) {
        // removes active status from all buttons
        removeActivePriority();
        // apply active status to the selected button
        const priority = e.target.textContent.toLowerCase();
        e.target.classList.add(`create-new__priority-btn--${priority}-active`);
    }

    // change priority button sytling in edit menu
    // i could make this into a function that accepts a class name, and use that 
    // function for this and the previous function.
    function editPriority(e) {
        // removes active status from all buttons
        const btns = document.querySelectorAll('.edit-popup__priority-btn');
        btns.forEach(btn => {
            btn.classList.remove(`edit-popup__priority-btn--${btn.textContent.toLowerCase()}-active`)
        })
        // apply active status to the selected button
        const priority = e.target.textContent.toLowerCase();
        e.target.classList.add(`edit-popup__priority-btn--${priority}-active`);
    }

    // function to handle clicks on the navigation
    function changeFolder(e, todos, display) {
        
        // sets the current folder variable to nav item that was clicked
        // because i set everything to be lowercase in my code, it woudl crash when i used uppercase
        // letters in my custom projects. this allows uppercase project names
        
        if (['Home', 'Week', 'Today'].includes(e.target.textContent)) {
            toDosManager.changeCurrentProject(e.target.textContent.toLowerCase());
        } else {
            toDosManager.changeCurrentProject(e.target.textContent);
        }

        console.log("you are in folder", toDosManager.getCurrentProject());

    



        
        // render all to-dos from all projects if on the home page. otherwise
        // only render the relevent to-do items
        if (toDosManager.getCurrentProject() === 'home') {
            renderAllToDos(todos, display);
            updateActiveNavMain(e);
        } else {
            
            renderToDos(todos, display);
            updateActiveNavMain(e);
        }

        // if changing to a new empty custom project, display placeholder screen
        if (!['home', 'week', 'today'].includes(toDosManager.getCurrentProject())) {
            if (todos[toDosManager.getCurrentProject()].length < 1) {
                renderEmptyProjectPlaceholder(todos, display);
            }
        }
        
        
        
    }

    // function to handle clicks on the wider navigation area. 
    // I could'nt get it to work otherwise.
    function changeFolder2(e, todos, display) {
        // console.log('second');
        // console.log(e.target.childNodes[0].textContent.toLowerCase());
        
        if (e.target.tagName == 'li' || e.target.tagName == 'LI') {
            // sets the current folder variable to nav item that was clicked
            // toDosManager.changeCurrentProject(e.target.childNodes[0].textContent.toLowerCase());
            // console.log("you are in folder", toDosManager.getCurrentProject());
            // console.log(e.target.childNodes[0].textContent.toLowerCase());

            // sets the current folder variable to nav item that was clicked
        
            if (['Home', 'Week', 'Today'].includes(e.target.childNodes[0].textContent)) {
                toDosManager.changeCurrentProject(e.target.childNodes[0].textContent.toLowerCase());
            } else {
                toDosManager.changeCurrentProject(e.target.childNodes[0].textContent);
            }

            console.log("you are in folder", toDosManager.getCurrentProject());



            
            // render all to-dos from all projects if on the home page. otherwise
            // only render the relevent to-do items
            if (toDosManager.getCurrentProject() === 'home') {
                renderAllToDos(todos, display);
                updateActiveNavMain(e);
            } else {
                renderToDos(todos, display);
                updateActiveNavMain(e);
            }

            // if changing to a new empty custom project, display placeholder screen
            if (!['home', 'week', 'today'].includes(toDosManager.getCurrentProject())) {
                if (todos[toDosManager.getCurrentProject()].length < 1) {
                    renderEmptyProjectPlaceholder(todos, display);
                }
            }
        }
        
        
        
    }

    // render the project names to the side bar
    function renderProjectNames(todos, display) {
        const projectContainer = document.querySelector('.projects');
        // clear list before appending all items
        projectContainer.innerHTML = ""
        
        // get an object of only the custom projects
        const projectsObject = Object.assign({}, todos);
        delete projectsObject.home;
        delete projectsObject.today;
        delete projectsObject.week;

        // console.log("custom projects", projectsObject);

        // display project names and counts to the sidebar
        for (const project in projectsObject) {

            // container around project name and count
            const projectNameCount = document.createElement('li');
            projectNameCount.classList.add('projects__item');
            // projectNameCount.classList.add('projects__item--custom');
            projectNameCount.classList.add('nav__item--link');
            projectNameCount.classList.add('custom-project-count-container');
            projectNameCount.addEventListener("click", e => domManipulator.changeFolder2(e, todos, display));
            projectNameCount.addEventListener("click", e => updateActiveNavMain(e));


            // project name
            const projectName = document.createElement('span');
            projectName.classList.add('todo-folder');
            projectName.classList.add('project-name');
            projectName.textContent = project;
            // event listner to change working folder / page display
            projectName.addEventListener("click", e => domManipulator.changeFolder(e, todos, display));

            // project count
            const projectCount = document.createElement('div');
            projectCount.classList.add('project-count');

            // count how many non checked items there are in the project
            // and assign this value to the count value
            let n = 0;
            projectsObject[project].forEach(todo => {
                if(!todo.checked) {
                    n++
                }
            })

            
            projectCount.textContent = n;

            projectNameCount.appendChild(projectName);
            // only show count if greater than 0
            if (n > 0) {
                projectNameCount.appendChild(projectCount);
            }
            
            projectContainer.appendChild(projectNameCount);

            
            // this re-applys nav link selected status to selected custom project,
            // since the entire custom project names div is re-rendered each time. 
            if(toDosManager.getCurrentProject() == project) {
                projectNameCount.classList.add('nav__selected')
            }
        }


        // update home / today / week folders. only count non checked items
        const homeCount = document.querySelector('.home-count');
        // sums number of non checked item in project array and displays count text as this sum
        // this will only count the items that are specifically saved to home folder,
        // i want to count all todos.

        // homeCount.textContent = todos.home.reduce((total, value) => {
        //     return total + !value.checked;
        // }, 0);

        let homeCountNumber = 0;
        for (const todoList in todos) {
            todos[todoList].forEach(todo => {
                if (!todo.checked) {
                    homeCountNumber++;
                }
            })
        }
        homeCount.textContent = homeCountNumber;
        // re-set count display
        homeCount.style.display = 'inline-flex';
        if (homeCount.textContent < 1) {
            // hide count display if 0
            homeCount.style.display = 'none';
        }

        const weekCount = document.querySelector('.week-count');
        // sums number of non checked item in project array and displays count text as this sum
        weekCount.textContent = todos.week.reduce((total, value) => {
            return total + !value.checked;
        }, 0);
        // re-set count display
        weekCount.style.display = 'inline-flex';
        if (weekCount.textContent < 1) {
            // hide count display if 0
            weekCount.style.display = 'none';
        }
        
        const todayCount = document.querySelector('.today-count');
        // sums number of non checked item in project array and displays count text as this sum
        todayCount.textContent = todos.today.reduce((total, value) => {
            return total + !value.checked;
        }, 0);
        // re-set count display
        todayCount.style.display = 'inline-flex';
        if (todayCount.textContent < 1) {
            // hide count display if 0
            todayCount.style.display = 'none';
        }
        
    }

    // display the amount of todo items next to the project title
    function renderProjectCount(todos, display) {
 
    }

    // scroll poject names to top
    function projectNamesScrollTop() {
        const projectsDiv = document.querySelector('.projects');
        projectsDiv.scrollTop = 0;
    }

    // scroll project names to bottom
    function projectNamesScrollBottom() {
        const projectsDiv = document.querySelector('.projects');
        projectsDiv.scrollTop = projectsDiv.scrollHeight;
    }

    function renderEmptyProjectPlaceholder(todos, display) {
        document.querySelector('.main').innerHTML = 
        `<div class="add-or-remove">
            <div class="add-or-remove__heading">Empty Project!</div>
            <div class="add-or-remove__content">
                <div class="add-or-remove__content-text">
                    Create a new to-do item or delete project.
                </div>
                <div class="add-or-remove__content-btn">
                    Delete Project
                </div>
            </div>
        </div>`

        
        // remove project button
        document.querySelector('.add-or-remove__content-btn').addEventListener("click", () => {
            
            // delete project from todos data
            delete todos[toDosManager.getCurrentProject()];
            
            document.querySelector('.main').innerHTML = "";
            // save todos to local storage
            localStorage.setItem("todos", JSON.stringify(todos));
            renderProjectNames(todos, display);
            // change folder to home
            toDosManager.changeCurrentProject('home');
            renderAllToDos(todos, display);
            // update nave link to show home active
            document.querySelector('.nav').children.item(0).classList.add('nav__selected');
            console.log(document.querySelector('.nav').children.item(0));

            

        })
    }

    // turn off selected styling for all nav items and apply to the selected item
    function updateActiveNavMain(e) {
        const navItems = document.querySelectorAll('.nav__item--link');
        navItems.forEach(item => {
            item.classList.remove("nav__selected");
        })
       
        if (e.target.textContent === 'Notes') {
            e.target.classList.add('nav__selected');
        } else {
            if (e.target.tagName == "span" || e.target.tagName == "SPAN") {
                e.target.parentElement.classList.add('nav__selected');
            } else if (e.target.tagName == "li" || e.target.tagName == "LI") {
                e.target.classList.add('nav__selected');
                // console.log(e.target);
            }
        }
        
        
    }

    // after form closes, reset the active link to the new todo menu
    function resetActiveFormLink() {
        const createNewOptions = document.querySelectorAll('.create-new__options-items');
        createNewOptions.forEach(option => {
            option.classList.remove('create-new__options-items-active');
        });
        createNewOptions[0].classList.add('create-new__options-items-active');
    }

    function changeActiveFormLink() {
        const createNewOptions = document.querySelectorAll('.create-new__options-items');
        createNewOptions.forEach(option => {
            option.addEventListener('click', e => {
                createNewOptions.forEach(option => {
                    option.classList.remove('create-new__options-items-active');
                });
                e.target.classList.add('create-new__options-items-active');
            });
        })
    }

    return {
        renderToDos,
        renderAllToDos,
        toggleCheckBox,
        applyCheckedOnReload,
        activePriority,
        removeActivePriority,
        editPriority,
        renderDetails,
        renderEdit,
        changeFolder,
        changeFolder2,
        renderProjectNames,
        renderProjectCount,
        projectNamesScrollTop,
        projectNamesScrollBottom,
        renderEmptyProjectPlaceholder,
        updateActiveNavMain,
        resetActiveFormLink,
        changeActiveFormLink
    };
})();

// To Do data manager 
const toDosManager = (function () {

    // keep track of what page the user is on, so that added items go
    // to the correct project. defaults to home page on load

    let currentProject = "home";

    // change currentProject
    function changeCurrentProject(newProject) {
        currentProject = newProject;
    }

    // get currentProject
    function getCurrentProject() {
        return currentProject;
    }

   


    // To-do factory function
    function createToDo(name, priority, date, details, project, checked=false) {
        return {
            name,
            priority,
            date,
            details,
            project,
            checked
        }
    }

    // retrieves the data entered to the new to-do form and creates a new to-do
    // and then displays it to the dom
    function addNewToDo(e, toDoList, display, overlay, form) {

        // stop page from refreshing after each submit
        e.preventDefault();
         
        const toDoTitle = (document.querySelector('#new-todo-title')).value;
        const toDoDetails = (document.querySelector('#new-todo-details')).value;
        const toDoDate = (document.querySelector('#new-todo-date')).value;
        const toDoPriority = (document.querySelector('[name="create-new-priority"]:checked')).value;
        // get the current project so can store new to-do item in the correct sub array.
        const toDoProject = getCurrentProject();
        
        const newToDo = createToDo(toDoTitle, toDoPriority, toDoDate, toDoDetails, toDoProject);
        toDoList[toDoProject].push(newToDo);


        // render all to-dos from all projects if on the home page. otherwise
        // only render the relevent to-do items
        if (getCurrentProject() === 'home') {
            domManipulator.renderAllToDos(toDoList, display);
            
        } else {
            domManipulator.renderToDos(toDoList, display);
        }
        
        // closes the form and removes the overlay after submission
        overlay.classList.toggle('overlay-new-invisible');
        form.classList.toggle('create-new-open');

        // I want the form to fade out before the inputs are reset
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
          }
        
        sleep(300).then(() => {
            // clear inputs after submission 
            form.reset();
            // removes active status from all buttons
            domManipulator.removeActivePriority();
        })

        // update project name counter 
        domManipulator.renderProjectNames(toDoList, display);
    }

    // edit selected todo data
    function editToDo(e, toDoList, display, overlay, form) {

        e.preventDefault();
        // retrieve the position of the to-do item in the data array
        const i = e.target.firstElementChild.dataset.index;
        // retrieve the project the to-do was assigned to
        
        const project = e.target.firstElementChild.dataset.project;

        // update the to-do item data
        toDoList[project][i].name = (document.querySelector('.edit-popup__input')).value;
        toDoList[project][i].details = (document.querySelector('.edit-popup__input-big')).value;
        toDoList[project][i].date = (document.querySelector('.edit-popup__date-input')).value;
        toDoList[project][i].priority = (document.querySelector('[name="edit-priority"]:checked')).value;

        // render all to-dos from all projects if on the home page. otherwise
        // only render the relevent to-do items
        if (getCurrentProject() === 'home') {
            domManipulator.renderAllToDos(toDoList, display);
            console.log(toDoList);
        } else {
            domManipulator.renderToDos(toDoList, display);
        }

        overlay.classList.toggle('overlay-edit-invisible');
        form.classList.toggle('edit-popup-open');

        // console.log(document.querySelector('.edit-popup__input').value);
        
    }

    // removes selected to-do item from the array and re renders the display
    function deleteToDo(e, toDoList, display) {
        const element = e.target;
        let i= element.parentElement.dataset.index;
        let project= element.parentElement.dataset.project;
        
        // render all to-dos from all projects if on the home page. otherwise
        // only render the relevent to-do items
        if (getCurrentProject() === 'home') {
            // if in home
            toDoList[project].splice(i, 1);
            domManipulator.renderAllToDos(toDoList, display);
            // logs the entire to-do object
            // console.log(toDoList);
        } else {
            // console.log(toDoList[toDosManager.getCurrentProject()]);
            // logs just the project array
            
            toDoList[toDosManager.getCurrentProject()].splice(i, 1);
            
            domManipulator.renderToDos(toDoList, display);
        }

        // console.log('del', toDoList)
        //check if a project is now empty, and delete the project if true
        checkEmptyProject(toDoList, display);
        // save todos to local storage
        localStorage.setItem("todos", JSON.stringify(toDoList));
        // update project name counter 
        domManipulator.renderProjectNames(toDoList, display);

    }

    // add new project to-dos object
    function addNewProject(e, todos, overlay, form, display) {
        const newProject = (document.querySelector('.create-new__project-input')).value;
        // if text was entered in the input and project doesnt already exist
        if (newProject && !(newProject.toLowerCase() in todos)) {
            todos[newProject] = [];

            // render project names in sidebar
            domManipulator.renderProjectNames(todos, display);
            
            // sets the current folder variable to nav item that was clicked
            toDosManager.changeCurrentProject(newProject);
            console.log("you are in folder", toDosManager.getCurrentProject());

            // render all to-dos from all projects if on the home page. otherwise
            // only render the relevent to-do items
            if (toDosManager.getCurrentProject() === 'home') {
                domManipulator.renderAllToDos(todos, display);
            } else {
                domManipulator.renderToDos(todos, display);
            }

            // sets nav active status to newly created project
            const navItems = document.querySelectorAll('.nav__item--link');
            navItems.forEach(item => {
                item.classList.remove("nav__selected");
            })
            document.querySelector('.projects').lastChild.classList.add('nav__selected');

            // scrolls to bottom of custom projects div
            domManipulator.projectNamesScrollBottom();

          // if the created project already exists, change folder to that project  
        } else if (newProject && (newProject.toLowerCase() in todos)) {

            // render all to-dos from all projects if on the home page. otherwise
            // only render the relevent to-do items
            if (newProject.toLowerCase() === 'home') {
                console.log(`${newProject} already exists. changing folder to ${newProject}`);
                changeCurrentProject(newProject.toLowerCase());
                domManipulator.renderAllToDos(todos, display);
            } else {
                console.log(`${newProject} already exists. changing folder to ${newProject}`);
                changeCurrentProject(newProject.toLowerCase());
                domManipulator.renderToDos(todos, display);
            }
            
        }

        // closes the form and removes the overlay after submission
        overlay.classList.toggle('overlay-new-invisible');
        form.classList.toggle('create-new-open');


        // I want the form to fade out before the input is reset
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
        }
        
        sleep(300).then(() => {
            // clear input after form closes 
            form.reset();
            // reset add new form to show add todo
            document.querySelector('#new-project-menu').style.display = "none";
        
            document.querySelector('#new-todo-menu').style.display = "flex";
        })

        // show a placeholder screen after a new empty project has been created
        domManipulator.renderEmptyProjectPlaceholder(todos, display);

        //update local storage
        localStorage.setItem("todos", JSON.stringify(todos));

    }

    function checkEmptyProject(todos, display) {
        
        
        // get an object of only the custom projects
        const projectsObject = Object.assign({}, todos);
        delete projectsObject.home;
        delete projectsObject.today;
        delete projectsObject.week;

        // only delete empty custom projects
        if (!['home', 'week', 'today'].includes(getCurrentProject())) {
            // deletes only the current empty project
            if (projectsObject[getCurrentProject()].length < 1) {
                
                delete todos[getCurrentProject()];
                domManipulator.renderProjectNames(todos, display);
                
                // change folder to home
                
                changeCurrentProject('home');
                domManipulator.renderAllToDos(todos, display);

                // update nave link to show home active
                document.querySelector('.nav').children.item(0).classList.add('nav__selected');
                console.log(document.querySelector('.nav').children.item(0));
            }
        }
        

        // deletes all empty projects
        // for (const project in projectsObject) {
        //     console.log(project);
        //     console.log(projectsObject[project]);
        //     console.log(projectsObject[project].length);
        //     if (projectsObject[project].length < 1) {
        //         delete todos[project];
        //         domManipulator.renderProjectNames(todos, display);
        //     }
        // }

        
        
    }

    return {
        changeCurrentProject,
        getCurrentProject,
        createToDo,
        addNewToDo,
        editToDo,
        deleteToDo,
        addNewProject,
        checkEmptyProject
    }
})();

// To Do data manager 
const notesManager = (function () {

    var colc;
    

    function arrangeNotes(notes) {

        document.querySelector('.main').innerHTML = `<div class="grid">
                                                        <div class="grid-col grid-col--1">

                                                        </div>
                                                        <div class="grid-col grid-col--2">

                                                        </div>
                                                        <div class="grid-col grid-col--3">

                                                     </div>`
        const grid = document.querySelector('.grid');
       
        // if there is a colc grid already built, delete it so can make a new one.
        // i tried so many ways to update the grid and this is what works.
        if (typeof colc !== 'undefined') {
            colc.destroy();
            grid.innerHTML = `<div class="grid-col grid-col--1">

                                  </div>
                                  <div class="grid-col grid-col--2">

                                  </div>
                                  <div class="grid-col grid-col--3">

                              </div>`;

        }

        // inititialise colcade masonry layout
        colc = new (colcade__WEBPACK_IMPORTED_MODULE_0___default())( '.grid', {
            columns: '.grid-col',
            items: '.note'
            });

        

        // create note elements and append to colc
        notes.forEach((note, i) => {

            const noteBody = document.createElement('div');
            noteBody.classList.add('note');
            // associate element with position in array
            noteBody.setAttribute('data-index', i);

            const noteClose = document.createElement('div');
            noteClose.classList.add('note__close');
            noteClose.innerHTML = '&times;';
            noteClose.addEventListener('click', e => deleteNote(e, notes));

            const noteTitle = document.createElement('div');
            noteTitle.classList.add('note__title');
            noteTitle.textContent = note.title;
            noteTitle.setAttribute('contenteditable', 'true');
            noteTitle.setAttribute('spellcheck', 'false');
            // edit title event listener
            noteTitle.addEventListener('input', e => editNote(e, notes));

            const noteText = document.createElement('div');
            noteText.classList.add('note__text');
            noteText.textContent = note.text;
            noteText.setAttribute('contenteditable', 'true');
            noteText.setAttribute('spellcheck', 'false');
            // edit title event listener
            noteText.addEventListener('input', e => editNote(e, notes));

            noteBody.appendChild(noteClose);
            noteBody.appendChild(noteTitle);
            noteBody.appendChild(noteText);

            colc.append(noteBody);
     
        })

    }

    function createNote(title, text) {
        return {
            title,
            text
        }
    }

    function addNewNote(e, notes, overlay, form, display) {

        const noteTitle = document.querySelector('#new-note-title').value;
        const noteText = document.querySelector('#new-note-text').value;

        const newNote = createNote(noteTitle, noteText);
        notes.unshift(newNote);

        arrangeNotes(notes);
        // sets nav active link to 'notes' 
        document.querySelector('#notes-nav').click();
        
        // closes the form and removes the overlay after submission
        overlay.classList.toggle('overlay-new-invisible');
        form.classList.toggle('create-new-open');

        // I want the form to fade out before the inputs are reset
        const sleep = (milliseconds) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds))
          }
        
        sleep(300).then(() => {
            // clear inputs after submission 
            form.reset();
            // reset add new form to show add todo
            document.querySelector('#new-note-menu').style.display = "none";
        
            document.querySelector('#new-todo-menu').style.display = "flex";
        })

        // save notes to local storage
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    // delete selected note and refresh the notes
    function deleteNote(e, notes) {
        console.log(notes);
        const i = e.target.parentElement.dataset.index;
        notes.splice(i, 1);
        arrangeNotes(notes);

        // save notes to local storage
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    // edit note
    function editNote(e, notes) {
        
        // toEdit returns "title" or "note" depending on what is changed
        const toEdit = e.target.classList[0].slice(6);
        const i = e.target.parentElement.dataset.index;
        const newText = e.target.textContent;

        if (toEdit === "title") {
            notes[i].title = newText;  
        } else if (toEdit ==="text") {
            notes[i].text = newText;
        }
        // console.log('editing note');

        // save notes to local storage
        localStorage.setItem("notes", JSON.stringify(notes));
        
    }

    

    return {
        arrangeNotes,
        createNote,
        addNewNote,
        deleteNote,
        editNote
    }
})();

/***/ }),

/***/ "./src/images/bin.png":
/*!****************************!*\
  !*** ./src/images/bin.png ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "e33aba1b45d7561b121a.png";

/***/ }),

/***/ "./src/images/check.png":
/*!******************************!*\
  !*** ./src/images/check.png ***!
  \******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "a568f6f1b577d3fd06b6.png";

/***/ }),

/***/ "./src/images/edit.png":
/*!*****************************!*\
  !*** ./src/images/edit.png ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "ca71745f44293cbc4839.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _logicModule__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logicModule */ "./src/logicModule.js");


const todos = JSON.parse(localStorage.getItem('todos')) || {
    "home": [],
    "today": [],
    "week": [],
}
const display = document.querySelector('.main');
const openForm = document.querySelector('.new-todo');
const closeForm = document.querySelector('.create-new__close');
const overlayNew = document.querySelector('.overlay-new');
const addToDoForm = document.querySelector('.create-new');
const detailsPopup = document.querySelector('.details-popup');
const detailsOverlay = document.querySelector('.overlay-details');
const editPopup = document.querySelector('.edit-popup');
const editOverlay = document.querySelector('.overlay-edit');
const editForm = document.querySelector('.edit-popup');
const toDoFolders = document.querySelectorAll('.todo-folder');
const createProject = document.querySelector('.create-new__project-submit');
const createNote = document.querySelector('.create-new__note-submit');
const newToDoLink = document.querySelector('#new-todo-link'); 
const newProjectLink = document.querySelector('#new-project-link'); 
const newNoteLink = document.querySelector('#new-note-link'); 
const newToDoMenu = document.querySelector('#new-todo-menu');
const newProjectMenu = document.querySelector('#new-project-menu');
const newNoteMenu = document.querySelector('#new-note-menu');

// initial homescreen render
_logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.renderAllToDos(todos, display);
_logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.renderProjectNames(todos, display);

// navigate to home/today/week
toDoFolders.forEach(folder => {
    folder.addEventListener("click", e => _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.changeFolder(e, todos, display));
})

// array of to-do notes 
// grab array data from local storage if it exists, or create new example array
const notes = JSON.parse(localStorage.getItem('notes')) || [];

// navigate to notes menu
document.querySelector('#notes-nav').addEventListener('click', () => _logicModule__WEBPACK_IMPORTED_MODULE_1__.notesManager.arrangeNotes(notes));
document.querySelector('#notes-nav').addEventListener('click', (e) => _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.updateActiveNavMain(e));

// toggles display on for overlay and form when the open form button is clicked
openForm.addEventListener('click', () => {
    overlayNew.classList.toggle('overlay-new-invisible');
    addToDoForm.classList.toggle('create-new-open');
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.changeActiveFormLink()
});

// control which form menu is open 
newToDoLink.addEventListener('click', () =>{
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    newToDoMenu.style.display = "flex";
});
newProjectLink.addEventListener('click', () =>{
    newToDoMenu.style.display = "none";
    newNoteMenu.style.display = "none";
    newProjectMenu.style.display = "flex";
});
newNoteLink.addEventListener('click', () =>{
    newToDoMenu.style.display = "none";
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "flex";
});

// closes the form and toggles the display back 
closeForm.addEventListener('click', () => {
    overlayNew.classList.toggle('overlay-new-invisible');
    addToDoForm.classList.toggle('create-new-open');
    addToDoForm.reset();
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.resetActiveFormLink();
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.removeActivePriority();
    newToDoMenu.style.display = "flex"; 
    newProjectMenu.style.display = "none";
    newNoteMenu.style.display = "none";
});

// when the submit new todo button is pressed, grab data from the form and create a new todo
addToDoForm.addEventListener('submit', e => {
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.toDosManager.addNewToDo(e, todos, display, overlayNew, addToDoForm);
});

// when a low / medium / high priority button is clicked
const priorityBtns = document.querySelectorAll('.create-new__priority-btn');
    priorityBtns.forEach(btn => {
    btn.addEventListener('click', e =>{
        _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.activePriority(e);
    });
})


// add new poject
createProject.addEventListener('click', e => {
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.toDosManager.addNewProject(e, todos, overlayNew, addToDoForm, display);
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.resetActiveFormLink();
})

// add new note
createNote.addEventListener('click', e => {
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.notesManager.addNewNote(e, notes, overlayNew, addToDoForm, display);
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.resetActiveFormLink();
});

// button that confirms edit on a todo
editForm.addEventListener('submit', e => {
    _logicModule__WEBPACK_IMPORTED_MODULE_1__.toDosManager.editToDo(e, todos, display, editOverlay, editForm);
})

// close details popup
const closeDetails = document.querySelector('.details-popup__close');
closeDetails.addEventListener('click', () => {
    detailsPopup.classList.toggle("details-popup-open");
    detailsOverlay.classList.toggle("overlay-details-invisible");
})

// close edit popup
const closeEdit = document.querySelector('.edit-popup__close');
closeEdit.addEventListener('click', () => {
    editPopup.classList.toggle("edit-popup-open");
    editOverlay.classList.toggle("overlay-edit-invisible");
})

// navigate to notes menu
// renders the notes and applys selected styling to the notes nav link
document.querySelector('#notes-nav').addEventListener('click', () => _logicModule__WEBPACK_IMPORTED_MODULE_1__.notesManager.arrangeNotes(notes));
document.querySelector('#notes-nav').addEventListener('click', (e) => _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.updateActiveNavMain(e));

// selecting the outer li element so i can change folders by clicking this element as well as the inner li text.
let todoLinks = document.querySelectorAll('.nav__item--link');
todoLinks = Array.from(todoLinks);
// pop off the notes link since it already works without this hack
todoLinks.pop();
// naviagtion 2, for when the surrounding li item is clicked.
// i tried for a long time to make this work in a cleaner way but couldnt make it work.
//
todoLinks.forEach(folder => {
    folder.addEventListener("click", e => _logicModule__WEBPACK_IMPORTED_MODULE_1__.domManipulator.changeFolder2(e, todos, display));
})

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQXlDO0FBQ2hEO0FBQ0EsSUFBSSxvQ0FBUSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0dBQUU7QUFDckIsSUFBSSxLQUFLLEVBTU47O0FBRUgsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEMsVUFBVTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLFNBQVM7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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VSxVQUFVLE1BQU0sV0FBVyxLQUFLLFVBQVUsWUFBWSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLE1BQU0sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxNQUFNLE1BQU0sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLFdBQVcsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxXQUFXLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLEtBQUssWUFBWSxNQUFNLE1BQU0sUUFBUSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxhQUFhLE1BQU0sVUFBVSxPQUFPLEtBQUssVUFBVSxVQUFVLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxLQUFLLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLE1BQU0sS0FBSyxVQUFVLEtBQUssTUFBTSxLQUFLLFlBQVksYUFBYSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLFdBQVcsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxXQUFXLFVBQVUsWUFBWSxXQUFXLFVBQVUsVUFBVSxVQUFVLE9BQU8sYUFBYSxNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxLQUFLLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxNQUFNLE1BQU0sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLEtBQUssWUFBWSxPQUFPLGFBQWEsTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxNQUFNLEtBQUssWUFBWSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsV0FBVyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksT0FBTyxLQUFLLEtBQUssVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLEtBQUssWUFBWSxNQUFNLE1BQU0sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLFdBQVcsS0FBSyxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxXQUFXLFVBQVUsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLFdBQVcsT0FBTyxhQUFhLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsTUFBTSxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLE9BQU8sS0FBSyxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFFBQVEsYUFBYSxNQUFNLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxXQUFXLE1BQU0sS0FBSyxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLFdBQVcsT0FBTyxLQUFLLFlBQVksV0FBVyxNQUFNLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLFdBQVcsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLE9BQU8sV0FBVyxLQUFLLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSwwR0FBMEcsV0FBVyw2QkFBNkIsNkJBQTZCLDhCQUE4Qiw4QkFBOEIsMkJBQTJCLHdDQUF3QyxvQ0FBb0MsR0FBRyw4QkFBOEIsZ0JBQWdCLGlCQUFpQiwwQkFBMEIsR0FBRyxVQUFVLDZCQUE2Qix5QkFBeUIsdUJBQXVCLHNCQUFzQixHQUFHLGdDQUFnQyxZQUFZLDJCQUEyQixPQUFPLEdBQUcsZ0NBQWdDLFlBQVksNEJBQTRCLE9BQU8sR0FBRywrQkFBK0IsWUFBWSx5QkFBeUIsT0FBTyxHQUFHLCtCQUErQixZQUFZLDRCQUE0QixPQUFPLEdBQUcsVUFBVSx3QkFBd0Isb0JBQW9CLDBCQUEwQiw4QkFBOEIsNkJBQTZCLDRDQUE0Qyx3QkFBd0IsZ0NBQWdDLDRCQUE0QixHQUFHLFFBQVEsdUJBQXVCLEdBQUcsK0JBQStCLG9CQUFvQixvQkFBb0Isb0JBQW9CLDBDQUEwQyx1Q0FBdUMseUJBQXlCLGlEQUFpRCx1QkFBdUIsR0FBRyxnQ0FBZ0MsZ0JBQWdCLHVCQUF1Qix3QkFBd0IsNENBQTRDLE9BQU8sR0FBRyxrQ0FBa0MsZ0JBQWdCLDJDQUEyQyxPQUFPLEdBQUcsaUNBQWlDLGdCQUFnQiwyQ0FBMkMsT0FBTyxHQUFHLGlDQUFpQyxnQkFBZ0IsMkNBQTJDLE9BQU8sR0FBRyxpQ0FBaUMsZ0JBQWdCLDJDQUEyQyxPQUFPLEdBQUcsNkJBQTZCLHNCQUFzQix5QkFBeUIsb0JBQW9CLGtDQUFrQyxlQUFlLDBCQUEwQix5QkFBeUIsdUNBQXVDLDRDQUE0QyxnQ0FBZ0MsR0FBRyxXQUFXLG1CQUFtQixrQkFBa0IsR0FBRyxpQ0FBaUMsc0JBQXNCLHlCQUF5QixvQkFBb0Isb0JBQW9CLDZCQUE2QixxQ0FBcUMsc0NBQXNDLHFEQUFxRCxpQkFBaUIsR0FBRyxrQ0FBa0MsaUJBQWlCLHdCQUF3QixPQUFPLEdBQUcsaUNBQWlDLGlCQUFpQiw2QkFBNkIseUNBQXlDLDZCQUE2Qiw2QkFBNkIsc0JBQXNCLDhCQUE4QixPQUFPLEdBQUcsVUFBVSx3QkFBd0IsdUJBQXVCLEdBQUcsa0JBQWtCLGtCQUFrQiwwQkFBMEIsNEJBQTRCLEdBQUcsMkJBQTJCLHNCQUFzQixHQUFHLHNCQUFzQixnQ0FBZ0MsR0FBRyw0QkFBNEIsMEJBQTBCLEdBQUcsa0NBQWtDLDRCQUE0QixxQkFBcUIsR0FBRyxzQkFBc0IsZ0NBQWdDLDBCQUEwQixHQUFHLDhCQUE4QixxQkFBcUIsMEJBQTBCLHVCQUF1QixHQUFHLGVBQWUsd0JBQXdCLDBCQUEwQix1QkFBdUIsd0JBQXdCLHVCQUF1QiwwQkFBMEIsZ0NBQWdDLDRCQUE0Qix3QkFBd0IsR0FBRyx1QkFBdUIsMkJBQTJCLGdDQUFnQyw0QkFBNEIsR0FBRyw2QkFBNkIsZ0NBQWdDLDBCQUEwQixHQUFHLHNDQUFzQywwQkFBMEIsR0FBRyxtQkFBbUIsbUJBQW1CLGtCQUFrQixvQkFBb0IsOEJBQThCLDBCQUEwQiwwQkFBMEIseUJBQXlCLDRDQUE0QyxzQkFBc0Isd0JBQXdCLGdDQUFnQyx3REFBd0Qsc0JBQXNCLEdBQUcsd0JBQXdCLGlDQUFpQywwREFBMEQsR0FBRyxpQ0FBaUMsaUJBQWlCLDRCQUE0QixPQUFPLEdBQUcsaUVBQWlFLGtCQUFrQixtQkFBbUIsMkJBQTJCLDBCQUEwQiw4QkFBOEIsNENBQTRDLHlCQUF5Qix3QkFBd0IsdUJBQXVCLGdDQUFnQywyQkFBMkIsS0FBSyxzQkFBc0IsMkJBQTJCLEdBQUcscUJBQXFCLHNCQUFzQixxQkFBcUIseUJBQXlCLEdBQUcsZ0NBQWdDLG9CQUFvQixxQ0FBcUMsMEJBQTBCLEdBQUcsdUNBQXVDLG9CQUFvQixxQ0FBcUMsMEJBQTBCLEdBQUcsZ0JBQWdCLHVCQUF1QixHQUFHLGlCQUFpQix1QkFBdUIsR0FBRyxpQ0FBaUMsb0JBQW9CLEdBQUcsaUJBQWlCLG9CQUFvQixzQkFBc0IsR0FBRyxvQkFBb0Isc0JBQXNCLEdBQUcsc0NBQXNDLG9CQUFvQixHQUFHLHNDQUFzQyxvQkFBb0IsR0FBRyxvQkFBb0IsdUJBQXVCLEdBQUcsc0NBQXNDLG9CQUFvQixHQUFHLGtDQUFrQyxvQkFBb0Isd0JBQXdCLE9BQU8saUJBQWlCLHFCQUFxQixPQUFPLEdBQUcsaUNBQWlDLG9CQUFvQix3QkFBd0IsT0FBTyxvQkFBb0Isd0JBQXdCLE9BQU8saUJBQWlCLHNCQUFzQixPQUFPLEdBQUcsYUFBYSx5QkFBeUIsNEJBQTRCLGtCQUFrQiwwQkFBMEIsb0JBQW9CLHVCQUF1Qiw2QkFBNkIseUJBQXlCLHVCQUF1Qiw0QkFBNEIsZ0NBQWdDLEdBQUcsaUNBQWlDLG1CQUFtQiw0QkFBNEIsa0JBQWtCLG1CQUFtQixvQ0FBb0MscUJBQXFCLHdCQUF3QixvQ0FBb0MsNEJBQTRCLEdBQUcsNkNBQTZDLG9CQUFvQixHQUFHLG9CQUFvQiwwQkFBMEIsd0JBQXdCLEdBQUcsbUJBQW1CLHNDQUFzQyx3Q0FBd0MsNkRBQTZELG1DQUFtQyxHQUFHLG9CQUFvQix5QkFBeUIsZUFBZSxpQkFBaUIsdUJBQXVCLHFCQUFxQixzQkFBc0IscUJBQXFCLHNCQUFzQixHQUFHLDhDQUE4QyxvQkFBb0IscUJBQXFCLHdCQUF3QixzQkFBc0IseUJBQXlCLHVCQUF1QixzREFBc0QsOERBQThELDJEQUEyRCxHQUFHLGtDQUFrQyx3QkFBd0Isd0JBQXdCLHlCQUF5Qiw0QkFBNEIsa0VBQWtFLCtEQUErRCxPQUFPLEdBQUcsaUNBQWlDLHdCQUF3Qiw2QkFBNkIsT0FBTyxHQUFHLFdBQVcsc0RBQXNELEdBQUcsdUNBQXVDLGlCQUFpQixzQkFBc0IsYUFBYSxjQUFjLG9CQUFvQixtQkFBbUIsb0JBQW9CLG9CQUFvQiwwQkFBMEIsOEJBQThCLDBCQUEwQixpQkFBaUIsMkNBQTJDLDBCQUEwQixHQUFHLDhCQUE4Qix5QkFBeUIsaUJBQWlCLEdBQUcsaUJBQWlCLHlCQUF5Qix5QkFBeUIsb0JBQW9CLG1CQUFtQix5QkFBeUIsdUJBQXVCLGlEQUFpRCxnQ0FBZ0MsNkJBQTZCLDBCQUEwQixHQUFHLHdCQUF3QiwwQkFBMEIsMEJBQTBCLEdBQUcsMEJBQTBCLHlCQUF5QixnQkFBZ0Isb0JBQW9CLDJDQUEyQyx3QkFBd0Isc0JBQXNCLHNCQUFzQixHQUFHLDJCQUEyQixvQkFBb0IsMEJBQTBCLG1CQUFtQixtREFBbUQsNENBQTRDLEdBQUcsNEJBQTRCLDJDQUEyQywwQkFBMEIsR0FBRyw0QkFBNEIsbUJBQW1CLG9CQUFvQixxREFBcUQsR0FBRyxpQ0FBaUMsNEJBQTRCLHlCQUF5Qix1QkFBdUIsT0FBTyxHQUFHLDRCQUE0QixvQkFBb0IsZ0NBQWdDLEdBQUcsNEJBQTRCLG9CQUFvQiw2QkFBNkIsNkJBQTZCLDBCQUEwQix3QkFBd0IsdUJBQXVCLEdBQUcsa0NBQWtDLDBCQUEwQix3QkFBd0IseUNBQXlDLHNCQUFzQixHQUFHLHdDQUF3QyxnQ0FBZ0MsMEJBQTBCLEdBQUcsZ0RBQWdELHFCQUFxQiwwQkFBMEIsdUJBQXVCLEdBQUcseUNBQXlDLGdDQUFnQywwQkFBMEIsR0FBRyxpREFBaUQscUJBQXFCLDBCQUEwQix1QkFBdUIsR0FBRywwQkFBMEIsY0FBYyxvQkFBb0Isb0JBQW9CLDZCQUE2QixxQ0FBcUMsR0FBRyxxQkFBcUIsdUNBQXVDLDBCQUEwQixHQUFHLHdCQUF3QixrQkFBa0IsbUJBQW1CLG9DQUFvQyxnQ0FBZ0Msd0JBQXdCLGdEQUFnRCxtQkFBbUIsR0FBRyxnQ0FBZ0Msb0JBQW9CLEdBQUcsOEJBQThCLG9CQUFvQiwwQkFBMEIsd0JBQXdCLEdBQUcseUJBQXlCLG9CQUFvQiwwQkFBMEIsMEJBQTBCLEdBQUcsK0JBQStCLHlCQUF5QixHQUFHLCtCQUErQiwwQkFBMEIsMkNBQTJDLHlCQUF5QixnQ0FBZ0Msb0NBQW9DLHNCQUFzQix1QkFBdUIsZ0NBQWdDLDRDQUE0QyxHQUFHLHFDQUFxQyxvQkFBb0IsR0FBRyw0Q0FBNEMsb0JBQW9CLHFDQUFxQyxHQUFHLGlDQUFpQyw0Q0FBNEMsaUNBQWlDLE9BQU8sR0FBRyw2QkFBNkIsb0JBQW9CLDBCQUEwQixHQUFHLG1DQUFtQywyQkFBMkIsR0FBRyxtREFBbUQseUJBQXlCLG1CQUFtQixrQkFBa0IsaUJBQWlCLGlCQUFpQixnQkFBZ0IsaUJBQWlCLEdBQUcsaUNBQWlDLDRCQUE0Qiw4QkFBOEIsMEJBQTBCLHlCQUF5QixzQkFBc0IsZ0NBQWdDLHVCQUF1QixzQkFBc0IsMEJBQTBCLEdBQUcsdUNBQXVDLDJDQUEyQyxHQUFHLHNDQUFzQywyQ0FBMkMsZ0NBQWdDLEdBQUcsNENBQTRDLDJDQUEyQyxHQUFHLDZDQUE2QywyQ0FBMkMsMkNBQTJDLEdBQUcseUNBQXlDLDRDQUE0QyxpQ0FBaUMsR0FBRywrQ0FBK0MsNENBQTRDLEdBQUcsZ0RBQWdELDRDQUE0QywyQ0FBMkMsR0FBRyx1Q0FBdUMseUNBQXlDLDhCQUE4QixHQUFHLDZDQUE2Qyx5Q0FBeUMsR0FBRyw4Q0FBOEMseUNBQXlDLDJDQUEyQyxHQUFHLGdDQUFnQyx5QkFBeUIseUJBQXlCLDBCQUEwQix5QkFBeUIsZ0NBQWdDLHdCQUF3QixnQ0FBZ0MsdUJBQXVCLGdDQUFnQyxvQ0FBb0Msc0JBQXNCLDBCQUEwQixHQUFHLHNDQUFzQyxtQkFBbUIsZ0NBQWdDLEdBQUcsdUNBQXVDLG9CQUFvQixHQUFHLGlDQUFpQyxnQ0FBZ0MsMEJBQTBCLE9BQU8sR0FBRyw0QkFBNEIsY0FBYyxvQkFBb0Isb0JBQW9CLDZCQUE2QixxQ0FBcUMscUNBQXFDLG9CQUFvQixHQUFHLGtDQUFrQyxrQkFBa0IsbUJBQW1CLG9DQUFvQyxxQkFBcUIsd0JBQXdCLDRDQUE0QyxtQkFBbUIsR0FBRyx3Q0FBd0Msb0JBQW9CLEdBQUcsbUNBQW1DLHlCQUF5QiwyQkFBMkIsMEJBQTBCLHlCQUF5QixnQ0FBZ0Msd0JBQXdCLGdDQUFnQyx1QkFBdUIscUJBQXFCLG9DQUFvQyxzQkFBc0IsMEJBQTBCLEdBQUcseUNBQXlDLG1CQUFtQixnQ0FBZ0MsR0FBRywwQ0FBMEMsb0JBQW9CLEdBQUcseUJBQXlCLGNBQWMsb0JBQW9CLG9CQUFvQiw2QkFBNkIscUNBQXFDLHFDQUFxQyxvQkFBb0IsR0FBRywrQkFBK0Isa0JBQWtCLG1CQUFtQixvQ0FBb0MscUJBQXFCLHdCQUF3Qiw0Q0FBNEMsbUJBQW1CLEdBQUcscUJBQXFCLHVDQUF1QywwQkFBMEIsR0FBRyxxQ0FBcUMsb0JBQW9CLEdBQUcsbUNBQW1DLG9CQUFvQiwwQkFBMEIsd0JBQXdCLEdBQUcsZ0NBQWdDLHlCQUF5QiwyQkFBMkIsMEJBQTBCLHlCQUF5QixnQ0FBZ0Msd0JBQXdCLGdDQUFnQyx1QkFBdUIscUJBQXFCLG9DQUFvQyxzQkFBc0IsMEJBQTBCLEdBQUcsc0NBQXNDLG1CQUFtQixnQ0FBZ0MsR0FBRyx1Q0FBdUMsb0JBQW9CLEdBQUcsOEJBQThCLG9CQUFvQiwwQkFBMEIsbUJBQW1CLG9CQUFvQiwwQkFBMEIsNkJBQTZCLEdBQUcsaUJBQWlCLGtCQUFrQixHQUFHLG9CQUFvQix5QkFBeUIseUJBQXlCLHVCQUF1QixHQUFHLDRCQUE0QixxQkFBcUIsb0NBQW9DLEdBQUcscUJBQXFCLHlCQUF5QiwyQkFBMkIsMEJBQTBCLGdDQUFnQyx5QkFBeUIsc0JBQXNCLHFCQUFxQixnQ0FBZ0MsdUJBQXVCLHNCQUFzQiwwQkFBMEIsR0FBRywyQkFBMkIseUJBQXlCLGdDQUFnQyxtQkFBbUIsR0FBRyw2QkFBNkIsZ0RBQWdELHFDQUFxQyxHQUFHLG1DQUFtQyw4Q0FBOEMsZ0RBQWdELEdBQUcsbUJBQW1CLHlCQUF5QixvQkFBb0Isc0JBQXNCLHFCQUFxQixHQUFHLDJCQUEyQixtQ0FBbUMsR0FBRyx1QkFBdUIsMkJBQTJCLHFCQUFxQixvQkFBb0IseUJBQXlCLGdDQUFnQyxHQUFHLCtCQUErQixxQkFBcUIsb0JBQW9CLHFCQUFxQixxREFBcUQsbUNBQW1DLCtCQUErQixHQUFHLG1CQUFtQixvQkFBb0IscUJBQXFCLG9CQUFvQixzQkFBc0IsMEJBQTBCLEdBQUcsd0JBQXdCLHlCQUF5QixHQUFHLHlCQUF5QixvQkFBb0IsR0FBRywyQkFBMkIsa0NBQWtDLG1CQUFtQixHQUFHLGlDQUFpQyxvQ0FBb0MsR0FBRyxtQkFBbUIsOEJBQThCLGdDQUFnQyxxREFBcUQsbUNBQW1DLEdBQUcscUJBQXFCLG1DQUFtQyxHQUFHLHdCQUF3QixvQ0FBb0MsR0FBRyxzQkFBc0IsaUNBQWlDLEdBQUcsc0JBQXNCLG9CQUFvQiw2QkFBNkIsMEJBQTBCLHFCQUFxQixzQkFBc0IsR0FBRywrQkFBK0IsNEJBQTRCLHdCQUF3QixHQUFHLCtCQUErQixvQkFBb0IsNkJBQTZCLDBCQUEwQixHQUFHLG9DQUFvQywwQkFBMEIsR0FBRyxtQ0FBbUMseUJBQXlCLDRCQUE0QiwwQkFBMEIsZ0NBQWdDLHlCQUF5Qix3QkFBd0IscUJBQXFCLGdDQUFnQyx1QkFBdUIsc0JBQXNCLDBCQUEwQixHQUFHLHlDQUF5Qyx5QkFBeUIsZ0NBQWdDLG1CQUFtQixHQUFHLDhDQUE4QyxpQkFBaUIsc0JBQXNCLGFBQWEsY0FBYyxvQkFBb0IsbUJBQW1CLG9CQUFvQixvQkFBb0IsMEJBQTBCLDhCQUE4QiwwQkFBMEIsaUJBQWlCLDJDQUEyQywwQkFBMEIsSUFBSSxtQ0FBbUMseUJBQXlCLGlCQUFpQixHQUFHLG9CQUFvQix5QkFBeUIsbUJBQW1CLG9CQUFvQix5QkFBeUIsaURBQWlELHFCQUFxQiw0Q0FBNEMsNkJBQTZCLDBCQUEwQixLQUFLLDZCQUE2QiwwQkFBMEIsMEJBQTBCLEtBQUssNkNBQTZDLDJCQUEyQixLQUFLLGtDQUFrQyxxQkFBcUIsdUJBQXVCLEtBQUssK0JBQStCLHdCQUF3QiwwQkFBMEIsdUNBQXVDLHFCQUFxQixxQkFBcUIsS0FBSyxpQ0FBaUMsb0JBQW9CLEtBQUssdUNBQXVDLDJCQUEyQix1QkFBdUIsS0FBSyxzQ0FBc0MscUNBQXFDLEtBQUssMERBQTBELDJCQUEyQixLQUFLLHNEQUFzRCwwQkFBMEIsS0FBSywyREFBMkQsMkJBQTJCLEtBQUssK0JBQStCLHlCQUF5QixpQkFBaUIsa0JBQWtCLHNCQUFzQixxQkFBcUIsc0JBQXNCLEtBQUssMkNBQTJDLGlCQUFpQixzQkFBc0IsYUFBYSxjQUFjLG9CQUFvQixtQkFBbUIsb0JBQW9CLG9CQUFvQiwwQkFBMEIsOEJBQThCLDBCQUEwQixpQkFBaUIsMkNBQTJDLDBCQUEwQixHQUFHLGlDQUFpQyx5QkFBeUIsaUJBQWlCLEdBQUcsaUJBQWlCLHlCQUF5Qix5QkFBeUIsb0JBQW9CLG1CQUFtQix5QkFBeUIsdUJBQXVCLGlEQUFpRCxnQ0FBZ0MsNkJBQTZCLDBCQUEwQixLQUFLLDBCQUEwQiwwQkFBMEIsMEJBQTBCLEtBQUssNEJBQTRCLHlCQUF5QixrQkFBa0Isb0JBQW9CLHFCQUFxQix3QkFBd0Isc0JBQXNCLHNCQUFzQixLQUFLLDRCQUE0QixjQUFjLG9CQUFvQixvQkFBb0IsNkJBQTZCLHFDQUFxQyxLQUFLLDRCQUE0QixrQkFBa0IsbUJBQW1CLG9DQUFvQyxxQkFBcUIsd0JBQXdCLG9DQUFvQyxtQkFBbUIsS0FBSyxrQ0FBa0Msb0JBQW9CLEtBQUssZ0NBQWdDLG9CQUFvQiwwQkFBMEIsd0JBQXdCLEtBQUssMkJBQTJCLG9CQUFvQiwwQkFBMEIsMEJBQTBCLEtBQUssaUNBQWlDLHlCQUF5QixLQUFLLGlDQUFpQywwQkFBMEIsZ0NBQWdDLHlCQUF5QixxQkFBcUIsb0NBQW9DLHNCQUFzQix1QkFBdUIsZ0NBQWdDLG9DQUFvQyxLQUFLLHVDQUF1QyxvQkFBb0IsS0FBSyw4Q0FBOEMsb0JBQW9CLHFDQUFxQyxLQUFLLCtCQUErQixvQkFBb0IsMEJBQTBCLEtBQUsscUNBQXFDLDJCQUEyQixLQUFLLHFEQUFxRCx5QkFBeUIsbUJBQW1CLGtCQUFrQixpQkFBaUIsaUJBQWlCLGdCQUFnQixpQkFBaUIsS0FBSyxtQ0FBbUMsNEJBQTRCLDhCQUE4QiwwQkFBMEIseUJBQXlCLHNCQUFzQixnQ0FBZ0MsdUJBQXVCLHNCQUFzQiwwQkFBMEIsS0FBSyx5Q0FBeUMsbUJBQW1CLEtBQUssc0NBQXNDLDJDQUEyQyxnQ0FBZ0MsR0FBRyw0Q0FBNEMsMkNBQTJDLEdBQUcsNkNBQTZDLDJDQUEyQyxtQkFBbUIsR0FBRyx5Q0FBeUMsK0JBQStCLG9CQUFvQixHQUFHLCtDQUErQywrQkFBK0IsR0FBRyxnREFBZ0QsK0JBQStCLG1CQUFtQixHQUFHLHVDQUF1Qyw0QkFBNEIsaUJBQWlCLEdBQUcsNkNBQTZDLDRCQUE0QixHQUFHLDhDQUE4Qyw0QkFBNEIsbUJBQW1CLEdBQUcsZ0NBQWdDLHlCQUF5Qix5QkFBeUIsMEJBQTBCLHlCQUF5QixnQ0FBZ0Msc0JBQXNCLGdDQUFnQyx1QkFBdUIscUJBQXFCLG9DQUFvQyxzQkFBc0IsMEJBQTBCLEdBQUcsc0NBQXNDLG1CQUFtQixnQ0FBZ0MsR0FBRyx1Q0FBdUMsb0JBQW9CLEdBQUcsK0JBQStCLHdCQUF3QiwwQkFBMEIsb0JBQW9CLDBCQUEwQiw4QkFBOEIsZ0JBQWdCLGtCQUFrQixvQkFBb0IsZ0RBQWdELDRDQUE0QyxHQUFHLGdCQUFnQixzQkFBc0IsZ0NBQWdDLEdBQUcsc0JBQXNCLG1CQUFtQixHQUFHLG1CQUFtQjtBQUN6MDZEO0FBQ0EsaUVBQWUsdUJBQXVCLEVBQUM7Ozs7Ozs7Ozs7OztBQ1gxQjs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFEO0FBQ3JEO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBLHFGQUFxRjtBQUNyRjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixxQkFBcUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Ysc0ZBQXNGLHFCQUFxQjtBQUMzRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsaURBQWlELHFCQUFxQjtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Ysc0RBQXNELHFCQUFxQjtBQUMzRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ3BGYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ3pCYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdURBQXVELGNBQWM7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDZmU7QUFDZjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDVHdEO0FBQ3hELGlFQUFlLDhEQUFhOzs7Ozs7Ozs7Ozs7Ozs7O0FDRDVCO0FBQ087QUFDUDtBQUNBO0FBQ087QUFDUDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnFFO0FBQ0o7QUFDUTtBQUNkO0FBQ1E7QUFDTjtBQUNIO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4Qzs7QUFFOUM7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBLFdBQVcsbUVBQWlCO0FBQzVCLEdBQUc7QUFDSDtBQUNBO0FBQ0EseUJBQXlCLHdFQUFjLGlCQUFpQjs7QUFFeEQsNkVBQTZFOztBQUU3RTtBQUNBO0FBQ0EsYUFBYSxxRUFBZTtBQUM1QixNQUFNOzs7QUFHTjtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTs7O0FBR04sV0FBVyxxRUFBZTtBQUMxQixHQUFHO0FBQ0g7QUFDQTtBQUNBLHNCQUFzQiwyRUFBaUIsUUFBUTs7QUFFL0MsV0FBVyxxRUFBZTtBQUMxQixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcscUVBQWU7QUFDMUIsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxxRUFBZTtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxxRUFBZTtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1FQUFpQjtBQUNoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGVBQWUscUVBQWU7QUFDOUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLGVBQWUsb0VBQVU7O0FBRXpCO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQSxXQUFXLHFFQUFlO0FBQzFCLEdBQUc7QUFDSDtBQUNBO0FBQ0Esa0JBQWtCLHVFQUFhOztBQUUvQjtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUEsV0FBVyxxRUFBZTtBQUMxQixHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQSxXQUFXLG1FQUFpQjtBQUM1QixHQUFHO0FBQ0g7QUFDQTtBQUNBLG9CQUFvQix5RUFBZTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBLFdBQVcscUVBQWU7QUFDMUIsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGVBQWUscUVBQWU7QUFDOUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLHFFQUFlO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxxRUFBZTtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7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O0FBQ1E7QUFDMkI7QUFDNkI7QUFDekU7QUFDTTtBQUNXO0FBQ1QsQ0FBQztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzRkFBc0Y7QUFDdEY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvREFBTTtBQUMxQixzQkFBc0Isb0RBQU07QUFDNUIscUJBQXFCLG9EQUFNO0FBQzNCLGdDQUFnQyxPQUFPLEVBQUUsSUFBSSxJQUFJLEtBQUs7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELDhCQUE4QjtBQUM1RixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELFNBQVM7QUFDckU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4REFBOEQsOEJBQThCO0FBQzVGLFNBQVM7QUFDVDtBQUNBO0FBQ0EsNERBQTRELFNBQVM7QUFDckU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNPOztBQUVQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsVUFBVTs7QUFFVjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsWUFBWSxxQ0FBcUMsV0FBVztBQUMzRjtBQUNBO0FBQ0EsY0FBYztBQUNkLCtCQUErQixZQUFZLHFDQUFxQyxXQUFXO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ087O0FBRVA7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLG1CQUFtQixnREFBTztBQUMxQjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQ3R4Q0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NmQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7Ozs7O1dDckJBOzs7Ozs7Ozs7Ozs7OztBQ0FxQjtBQUNtRDtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1RUFBNkI7QUFDN0IsMkVBQWlDOztBQUVqQztBQUNBO0FBQ0EsMENBQTBDLHFFQUEyQjtBQUNyRSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFFQUFxRSxtRUFBeUI7QUFDOUYsc0VBQXNFLDRFQUFrQzs7QUFFeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDZFQUFtQztBQUN2QyxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDRFQUFrQztBQUN0QyxJQUFJLDZFQUFtQztBQUN2QztBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLGlFQUF1QjtBQUMzQixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1RUFBNkI7QUFDckMsS0FBSztBQUNMLENBQUM7OztBQUdEO0FBQ0E7QUFDQSxJQUFJLG9FQUEwQjtBQUM5QixJQUFJLDRFQUFrQztBQUN0QyxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLGlFQUF1QjtBQUMzQixJQUFJLDRFQUFrQztBQUN0QyxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLCtEQUFxQjtBQUN6QixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxxRUFBcUUsbUVBQXlCO0FBQzlGLHNFQUFzRSw0RUFBa0M7O0FBRXhHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxzRUFBNEI7QUFDdEUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9jb2xjYWRlL2NvbGNhZGUuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2FkZExlYWRpbmdaZXJvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZGVmYXVsdExvY2FsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZGVmYXVsdE9wdGlvbnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2Zvcm1hdC9mb3JtYXR0ZXJzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9mb3JtYXQvbGlnaHRGb3JtYXR0ZXJzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9mb3JtYXQvbG9uZ0Zvcm1hdHRlcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ0RheU9mWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZ2V0VVRDSVNPV2Vlay9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZ2V0VVRDSVNPV2Vla1llYXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ1dlZWtZZWFyL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9wcm90ZWN0ZWRUb2tlbnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc3RhcnRPZlVUQ0lTT1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENJU09XZWVrWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc3RhcnRPZlVUQ1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENXZWVrWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vYWRkTWlsbGlzZWNvbmRzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vZm9ybWF0L2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vaXNEYXRlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vaXNWYWxpZC9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9fbGliL2J1aWxkRm9ybWF0TG9uZ0ZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRMb2NhbGl6ZUZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRNYXRjaEZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRNYXRjaFBhdHRlcm5Gbi9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9fbGliL2Zvcm1hdERpc3RhbmNlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvZm9ybWF0TG9uZy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9fbGliL2Zvcm1hdFJlbGF0aXZlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvbG9jYWxpemUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9sb2NhbGUvZW4tVVMvX2xpYi9tYXRjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3N1Yk1pbGxpc2Vjb25kcy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3RvRGF0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvbG9naWNNb2R1bGUuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb2xjYWRlIHYwLjIuMFxuICogTGlnaHR3ZWlnaHQgbWFzb25yeSBsYXlvdXRcbiAqIGJ5IERhdmlkIERlU2FuZHJvXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICAvKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5Db2xjYWRlID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSgpIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ29sY2FkZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBDb2xjYWRlKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBlbGVtZW50ID0gZ2V0UXVlcnlFbGVtZW50KCBlbGVtZW50ICk7XG5cbiAgLy8gZG8gbm90IGluaXRpYWxpemUgdHdpY2Ugb24gc2FtZSBlbGVtZW50XG4gIGlmICggZWxlbWVudCAmJiBlbGVtZW50LmNvbGNhZGVHVUlEICkge1xuICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1sgZWxlbWVudC5jb2xjYWRlR1VJRCBdO1xuICAgIGluc3RhbmNlLm9wdGlvbiggb3B0aW9ucyApO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0ge307XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG4gIC8vIGtpY2sgdGhpbmdzIG9mZlxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG52YXIgcHJvdG8gPSBDb2xjYWRlLnByb3RvdHlwZTtcblxucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRpb25zICk7XG59O1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbnZhciBHVUlEID0gMDtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBDb2xjYWRlIGludGFuY2VzXG52YXIgaW5zdGFuY2VzID0ge307XG5cbnByb3RvLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVycm9yQ2hlY2soKTtcbiAgLy8gYWRkIGd1aWQgZm9yIENvbGNhZGUuZGF0YVxuICB2YXIgZ3VpZCA9IHRoaXMuZ3VpZCA9ICsrR1VJRDtcbiAgdGhpcy5lbGVtZW50LmNvbGNhZGVHVUlEID0gZ3VpZDtcbiAgaW5zdGFuY2VzWyBndWlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIHVwZGF0ZSBpbml0aWFsIHByb3BlcnRpZXMgJiBsYXlvdXRcbiAgdGhpcy5yZWxvYWQoKTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMuX3dpbmRvd1Jlc2l6ZUhhbmRsZXIgPSB0aGlzLm9uV2luZG93UmVzaXplLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5fbG9hZEhhbmRsZXIgPSB0aGlzLm9uTG9hZC5iaW5kKCB0aGlzICk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5fd2luZG93UmVzaXplSGFuZGxlciApO1xuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzLl9sb2FkSGFuZGxlciwgdHJ1ZSApO1xufTtcblxucHJvdG8uZXJyb3JDaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXJyb3JzID0gW107XG4gIGlmICggIXRoaXMuZWxlbWVudCApIHtcbiAgICBlcnJvcnMucHVzaCggJ0JhZCBlbGVtZW50OiAnICsgdGhpcy5lbGVtZW50ICk7XG4gIH1cbiAgaWYgKCAhdGhpcy5vcHRpb25zLmNvbHVtbnMgKSB7XG4gICAgZXJyb3JzLnB1c2goICdjb2x1bW5zIG9wdGlvbiByZXF1aXJlZDogJyArIHRoaXMub3B0aW9ucy5jb2x1bW5zICk7XG4gIH1cbiAgaWYgKCAhdGhpcy5vcHRpb25zLml0ZW1zICkge1xuICAgIGVycm9ycy5wdXNoKCAnaXRlbXMgb3B0aW9uIHJlcXVpcmVkOiAnICsgdGhpcy5vcHRpb25zLml0ZW1zICk7XG4gIH1cblxuICBpZiAoIGVycm9ycy5sZW5ndGggKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnW0NvbGNhZGUgZXJyb3JdICcgKyBlcnJvcnMuam9pbignLiAnKSApO1xuICB9XG59O1xuXG4vLyB1cGRhdGUgcHJvcGVydGllcyBhbmQgZG8gbGF5b3V0XG5wcm90by5yZWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy51cGRhdGVDb2x1bW5zKCk7XG4gIHRoaXMudXBkYXRlSXRlbXMoKTtcbiAgdGhpcy5sYXlvdXQoKTtcbn07XG5cbnByb3RvLnVwZGF0ZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb2x1bW5zID0gcXVlcnlTZWxlY3QoIHRoaXMub3B0aW9ucy5jb2x1bW5zLCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnByb3RvLnVwZGF0ZUl0ZW1zID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXRlbXMgPSBxdWVyeVNlbGVjdCggdGhpcy5vcHRpb25zLml0ZW1zLCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnByb3RvLmdldEFjdGl2ZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY29sdW1ucy5maWx0ZXIoIGZ1bmN0aW9uKCBjb2x1bW4gKSB7XG4gICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggY29sdW1uICk7XG4gICAgcmV0dXJuIHN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnO1xuICB9KTtcbn07XG5cbi8vIC0tLS0tIGxheW91dCAtLS0tLSAvL1xuXG4vLyBwdWJsaWMsIHVwZGF0ZXMgYWN0aXZlQ29sdW1uc1xucHJvdG8ubGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYWN0aXZlQ29sdW1ucyA9IHRoaXMuZ2V0QWN0aXZlQ29sdW1ucygpO1xuICB0aGlzLl9sYXlvdXQoKTtcbn07XG5cbi8vIHByaXZhdGUsIGRvZXMgbm90IHVwZGF0ZSBhY3RpdmVDb2x1bW5zXG5wcm90by5fbGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlc2V0IGNvbHVtbiBoZWlnaHRzXG4gIHRoaXMuY29sdW1uSGVpZ2h0cyA9IHRoaXMuYWN0aXZlQ29sdW1ucy5tYXAoIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAwO1xuICB9KTtcbiAgLy8gbGF5b3V0IGFsbCBpdGVtc1xuICB0aGlzLmxheW91dEl0ZW1zKCB0aGlzLml0ZW1zICk7XG59O1xuXG5wcm90by5sYXlvdXRJdGVtcyA9IGZ1bmN0aW9uKCBpdGVtcyApIHtcbiAgaXRlbXMuZm9yRWFjaCggdGhpcy5sYXlvdXRJdGVtLCB0aGlzICk7XG59O1xuXG5wcm90by5sYXlvdXRJdGVtID0gZnVuY3Rpb24oIGl0ZW0gKSB7XG4gIC8vIGxheW91dCBpdGVtIGJ5IGFwcGVuZGluZyB0byBjb2x1bW5cbiAgdmFyIG1pbkhlaWdodCA9IE1hdGgubWluLmFwcGx5KCBNYXRoLCB0aGlzLmNvbHVtbkhlaWdodHMgKTtcbiAgdmFyIGluZGV4ID0gdGhpcy5jb2x1bW5IZWlnaHRzLmluZGV4T2YoIG1pbkhlaWdodCApO1xuICB0aGlzLmFjdGl2ZUNvbHVtbnNbIGluZGV4IF0uYXBwZW5kQ2hpbGQoIGl0ZW0gKTtcbiAgLy8gYXQgbGVhc3QgMXB4LCBpZiBpdGVtIGhhc24ndCBsb2FkZWRcbiAgLy8gTm90IGV4YWN0bHkgYWNjdXJhdGUsIGJ1dCBpdCdzIGNvb2xcbiAgdGhpcy5jb2x1bW5IZWlnaHRzWyBpbmRleCBdICs9IGl0ZW0ub2Zmc2V0SGVpZ2h0IHx8IDE7XG59O1xuXG4vLyAtLS0tLSBhZGRpbmcgaXRlbXMgLS0tLS0gLy9cblxucHJvdG8uYXBwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLmdldFF1ZXJ5SXRlbXMoIGVsZW1zICk7XG4gIC8vIGFkZCBpdGVtcyB0byBjb2xsZWN0aW9uXG4gIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLmNvbmNhdCggaXRlbXMgKTtcbiAgLy8gbGF5IHRoZW0gb3V0XG4gIHRoaXMubGF5b3V0SXRlbXMoIGl0ZW1zICk7XG59O1xuXG5wcm90by5wcmVwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLmdldFF1ZXJ5SXRlbXMoIGVsZW1zICk7XG4gIC8vIGFkZCBpdGVtcyB0byBjb2xsZWN0aW9uXG4gIHRoaXMuaXRlbXMgPSBpdGVtcy5jb25jYXQoIHRoaXMuaXRlbXMgKTtcbiAgLy8gbGF5IG91dCBldmVyeXRoaW5nXG4gIHRoaXMuX2xheW91dCgpO1xufTtcblxucHJvdG8uZ2V0UXVlcnlJdGVtcyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgZWxlbXMgPSBtYWtlQXJyYXkoIGVsZW1zICk7XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoIGVsZW0gKTtcbiAgfSk7XG4gIHJldHVybiBxdWVyeVNlbGVjdCggdGhpcy5vcHRpb25zLml0ZW1zLCBmcmFnbWVudCApO1xufTtcblxuLy8gLS0tLS0gbWVhc3VyZSBjb2x1bW4gaGVpZ2h0IC0tLS0tIC8vXG5cbnByb3RvLm1lYXN1cmVDb2x1bW5IZWlnaHQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGhpcy5hY3RpdmVDb2x1bW5zLmZvckVhY2goIGZ1bmN0aW9uKCBjb2x1bW4sIGkgKSB7XG4gICAgLy8gaWYgZWxlbSwgbWVhc3VyZSBvbmx5IHRoYXQgY29sdW1uXG4gICAgLy8gaWYgbm8gZWxlbSwgbWVhc3VyZSBhbGwgY29sdW1uc1xuICAgIGlmICggIWVsZW0gfHwgY29sdW1uLmNvbnRhaW5zKCBlbGVtICkgKSB7XG4gICAgICB2YXIgbGFzdENoaWxkUmVjdCA9IGNvbHVtbi5sYXN0RWxlbWVudENoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgLy8gbm90IGFuIGV4YWN0IGNhbGN1bGF0aW9uIGFzIGl0IGluY2x1ZGVzIHRvcCBib3JkZXIsIGFuZCBleGNsdWRlcyBpdGVtIGJvdHRvbSBtYXJnaW5cbiAgICAgIHRoaXMuY29sdW1uSGVpZ2h0c1sgaSBdID0gbGFzdENoaWxkUmVjdC5ib3R0b20gLSBib3VuZGluZ1JlY3QudG9wO1xuICAgIH1cbiAgfSwgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gZXZlbnRzIC0tLS0tIC8vXG5cbnByb3RvLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIGNsZWFyVGltZW91dCggdGhpcy5yZXNpemVUaW1lb3V0ICk7XG4gIHRoaXMucmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub25EZWJvdW5jZWRSZXNpemUoKTtcbiAgfS5iaW5kKCB0aGlzICksIDEwMCApO1xufTtcblxucHJvdG8ub25EZWJvdW5jZWRSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGFjdGl2ZUNvbHVtbnMgPSB0aGlzLmdldEFjdGl2ZUNvbHVtbnMoKTtcbiAgLy8gY2hlY2sgaWYgY29sdW1ucyBjaGFuZ2VkXG4gIHZhciBpc1NhbWVMZW5ndGggPSBhY3RpdmVDb2x1bW5zLmxlbmd0aCA9PSB0aGlzLmFjdGl2ZUNvbHVtbnMubGVuZ3RoO1xuICB2YXIgaXNTYW1lQ29sdW1ucyA9IHRydWU7XG4gIHRoaXMuYWN0aXZlQ29sdW1ucy5mb3JFYWNoKCBmdW5jdGlvbiggY29sdW1uLCBpICkge1xuICAgIGlzU2FtZUNvbHVtbnMgPSBpc1NhbWVDb2x1bW5zICYmIGNvbHVtbiA9PSBhY3RpdmVDb2x1bW5zW2ldO1xuICB9KTtcbiAgaWYgKCBpc1NhbWVMZW5ndGggJiYgaXNTYW1lQ29sdW1ucyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWN0aXZlQ29sdW1ucyBjaGFuZ2VkXG4gIHRoaXMuYWN0aXZlQ29sdW1ucyA9IGFjdGl2ZUNvbHVtbnM7XG4gIHRoaXMuX2xheW91dCgpO1xufTtcblxucHJvdG8ub25Mb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLm1lYXN1cmVDb2x1bW5IZWlnaHQoIGV2ZW50LnRhcmdldCApO1xufTtcblxuLy8gLS0tLS0gZGVzdHJveSAtLS0tLSAvL1xuXG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIC8vIG1vdmUgaXRlbXMgYmFjayB0byBjb250YWluZXJcbiAgdGhpcy5pdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggaXRlbSApIHtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoIGl0ZW0gKTtcbiAgfSwgdGhpcyApO1xuICAvLyByZW1vdmUgZXZlbnRzXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5fd2luZG93UmVzaXplSGFuZGxlciApO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzLl9sb2FkSGFuZGxlciwgdHJ1ZSApO1xuICAvLyByZW1vdmUgZGF0YVxuICBkZWxldGUgdGhpcy5lbGVtZW50LmNvbGNhZGVHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEhUTUwgaW5pdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5kb2NSZWFkeSggZnVuY3Rpb24oKSB7XG4gIHZhciBkYXRhRWxlbXMgPSBxdWVyeVNlbGVjdCgnW2RhdGEtY29sY2FkZV0nKTtcbiAgZGF0YUVsZW1zLmZvckVhY2goIGh0bWxJbml0ICk7XG59KTtcblxuZnVuY3Rpb24gaHRtbEluaXQoIGVsZW0gKSB7XG4gIC8vIGNvbnZlcnQgYXR0cmlidXRlIFwiZm9vOiBiYXIsIHF1eDogYmF6XCIgaW50byBvYmplY3RcbiAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2xjYWRlJyk7XG4gIHZhciBhdHRyUGFydHMgPSBhdHRyLnNwbGl0KCcsJyk7XG4gIHZhciBvcHRpb25zID0ge307XG4gIGF0dHJQYXJ0cy5mb3JFYWNoKCBmdW5jdGlvbiggcGFydCApIHtcbiAgICB2YXIgcGFpciA9IHBhcnQuc3BsaXQoJzonKTtcbiAgICB2YXIga2V5ID0gcGFpclswXS50cmltKCk7XG4gICAgdmFyIHZhbHVlID0gcGFpclsxXS50cmltKCk7XG4gICAgb3B0aW9uc1sga2V5IF0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgbmV3IENvbGNhZGUoIGVsZW0sIG9wdGlvbnMgKTtcbn1cblxuQ29sY2FkZS5kYXRhID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGVsZW0gPSBnZXRRdWVyeUVsZW1lbnQoIGVsZW0gKTtcbiAgdmFyIGlkID0gZWxlbSAmJiBlbGVtLmNvbGNhZGVHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0galF1ZXJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkNvbGNhZGUubWFrZUpRdWVyeVBsdWdpbiA9IGZ1bmN0aW9uKCAkICkge1xuICAkID0gJCB8fCB3aW5kb3cualF1ZXJ5O1xuICBpZiAoICEkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gICQuZm4uY29sY2FkZSA9IGZ1bmN0aW9uKCBhcmcwIC8qLCBhcmcxICovKSB7XG4gICAgLy8gbWV0aG9kIGNhbGwgJCgpLmNvbGNhZGUoICdtZXRob2QnLCB7IG9wdGlvbnMgfSApXG4gICAgaWYgKCB0eXBlb2YgYXJnMCA9PSAnc3RyaW5nJyApIHtcbiAgICAgIC8vIHNoaWZ0IGFyZ3VtZW50cyBieSAxXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcbiAgICAgIHJldHVybiBtZXRob2RDYWxsKCB0aGlzLCBhcmcwLCBhcmdzICk7XG4gICAgfVxuICAgIC8vIGp1c3QgJCgpLmNvbGNhZGUoeyBvcHRpb25zIH0pXG4gICAgcGxhaW5DYWxsKCB0aGlzLCBhcmcwICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWV0aG9kQ2FsbCggJGVsZW1zLCBtZXRob2ROYW1lLCBhcmdzICkge1xuICAgIHZhciByZXR1cm5WYWx1ZTtcbiAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oIGksIGVsZW0gKSB7XG4gICAgICAvLyBnZXQgaW5zdGFuY2VcbiAgICAgIHZhciBjb2xjYWRlID0gJC5kYXRhKCBlbGVtLCAnY29sY2FkZScgKTtcbiAgICAgIGlmICggIWNvbGNhZGUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGFwcGx5IG1ldGhvZCwgZ2V0IHJldHVybiB2YWx1ZVxuICAgICAgdmFyIHZhbHVlID0gY29sY2FkZVsgbWV0aG9kTmFtZSBdLmFwcGx5KCBjb2xjYWRlLCBhcmdzICk7XG4gICAgICAvLyBzZXQgcmV0dXJuIHZhbHVlIGlmIHZhbHVlIGlzIHJldHVybmVkLCB1c2Ugb25seSBmaXJzdCB2YWx1ZVxuICAgICAgcmV0dXJuVmFsdWUgPSByZXR1cm5WYWx1ZSA9PT0gdW5kZWZpbmVkID8gdmFsdWUgOiByZXR1cm5WYWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUgIT09IHVuZGVmaW5lZCA/IHJldHVyblZhbHVlIDogJGVsZW1zO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxhaW5DYWxsKCAkZWxlbXMsIG9wdGlvbnMgKSB7XG4gICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCBpLCBlbGVtICkge1xuICAgICAgdmFyIGNvbGNhZGUgPSAkLmRhdGEoIGVsZW0sICdjb2xjYWRlJyApO1xuICAgICAgaWYgKCBjb2xjYWRlICkge1xuICAgICAgICAvLyBzZXQgb3B0aW9ucyAmIGluaXRcbiAgICAgICAgY29sY2FkZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICAgICAgY29sY2FkZS5sYXlvdXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGluaXRpYWxpemUgbmV3IGluc3RhbmNlXG4gICAgICAgIGNvbGNhZGUgPSBuZXcgQ29sY2FkZSggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgICAkLmRhdGEoIGVsZW0sICdjb2xjYWRlJywgY29sY2FkZSApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyB0cnkgbWFraW5nIHBsdWdpblxuQ29sY2FkZS5tYWtlSlF1ZXJ5UGx1Z2luKCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHV0aWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbi8vIHR1cm4gZWxlbWVudCBvciBub2RlTGlzdCBpbnRvIGFuIGFycmF5XG5mdW5jdGlvbiBtYWtlQXJyYXkoIG9iaiApIHtcbiAgdmFyIGFyeSA9IFtdO1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICAgIGFyeSA9IG9iajtcbiAgfSBlbHNlIGlmICggb2JqICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInICkge1xuICAgIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgb2JqLmxlbmd0aDsgaSsrICkge1xuICAgICAgYXJ5LnB1c2goIG9ialtpXSApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgICBhcnkucHVzaCggb2JqICk7XG4gIH1cbiAgcmV0dXJuIGFyeTtcbn1cblxuLy8gZ2V0IGFycmF5IG9mIGVsZW1lbnRzXG5mdW5jdGlvbiBxdWVyeVNlbGVjdCggc2VsZWN0b3IsIGVsZW0gKSB7XG4gIGVsZW0gPSBlbGVtIHx8IGRvY3VtZW50O1xuICB2YXIgZWxlbXMgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gIHJldHVybiBtYWtlQXJyYXkoIGVsZW1zICk7XG59XG5cbmZ1bmN0aW9uIGdldFF1ZXJ5RWxlbWVudCggZWxlbSApIHtcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG4gIHJldHVybiBlbGVtO1xufVxuXG5mdW5jdGlvbiBkb2NSZWFkeSggb25SZWFkeSApIHtcbiAgaWYgKCBkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScgKSB7XG4gICAgb25SZWFkeSgpO1xuICAgIHJldHVybjtcbiAgfVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIG9uUmVhZHkgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBDb2xjYWRlO1xuXG59KSk7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gPSBuZXcgVVJMKFwiaW1hZ2VzL2NoZWNrLnBuZ1wiLCBpbXBvcnQubWV0YS51cmwpO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9TW9udHNlcnJhdCZkaXNwbGF5PXN3YXApO1wiXSk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiOnJvb3Qge1xcbiAgICAtLWNvbG9yLWJsYWNrOiAjMjY0NjUzO1xcbiAgICAtLWNvbG9yLWdyZWVuOiAjMmE5ZDhmO1xcbiAgICAtLWNvbG9yLXllbGxvdzogI2U5YzQ2YTtcXG4gICAgLS1jb2xvci1vcmFuZ2U6ICNmNGEyNjE7XFxuICAgIC0tY29sb3ItcmVkOiAjZTc2ZjUxO1xcbiAgICAtLWJhY2tncm91bmQtY29sb3ItbGlnaHQ6ICNmN2Y3Zjc7XFxuICAgIC0tYmFja2dyb3VuZC1jb2xvci1kYXJrOiAjZWVlO1xcbn1cXG5cXG4qLFxcbio6OmJlZm9yZSxcXG4qOjphZnRlciB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgYm94LXNpemluZzogaW5oZXJpdDtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTIwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1Ni43NSU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDgwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1MCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA0My43NSU7XFxuICAgIH1cXG59XFxuXFxuYm9keSB7XFxuICAgIG1pbi1oZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuXFxubGkge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBDb250ZW50ICovXFxuXFxuLmNvbnRlbnQge1xcbiAgICB3aWR0aDogMTEwcmVtO1xcbiAgICBoZWlnaHQ6IDYwcmVtO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gNTRyZW0gM3JlbTtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyMHJlbSAxZnI7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTUwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIHdpZHRoOiAxMDB2dztcXG4gICAgICAgIGhlaWdodDogMTAwdmg7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gMWZyIDNyZW07XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDkwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDIwcmVtO1xcbiAgICB9XFxufVxcblxcbi8qIEhlYWRlciAqL1xcblxcbi5oZWFkZXIge1xcbiAgICBncmlkLXJvdzogMSAvIDI7XFxuICAgIGdyaWQtY29sdW1uOiAxIC8gMztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xcbiAgICBnYXA6MXJlbTtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG59XFxuXFxuLmxvZ28ge1xcbiAgICBoZWlnaHQ6IDU1cHg7XFxuICAgIHdpZHRoOiA1NXB4O1xcbn1cXG5cXG4vKiBTaWRlIEJhciAqL1xcblxcbi5zaWRlLWJhciB7XFxuICAgIGdyaWQtcm93OiAyIC8gMztcXG4gICAgZ3JpZC1jb2x1bW46IDEgLyAyO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItZGFyayk7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgcGFkZGluZzogMnJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA1NTBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDIgLyAzO1xcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgbGVmdDogMTQwcHg7XFxuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbiAgICB9XFxufVxcblxcbi5uYXYge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4ubmF2X19pdGVtIHtcXG4gICAgd2lkdGg6IGF1dG87XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDEuNXJlbTtcXG59XFxuXFxuLm5hdl9faXRlbTpsYXN0LWNoaWxkIHtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubmF2X19pdGVtOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4ubmF2X19pdGVtLS1wcm9qZWN0cyB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLm5hdl9faXRlbS0tcHJvamVjdHMtdGl0bGUge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4gIFxcbi5uYXZfX3NlbGVjdGVkIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4ubmF2X19zZWxlY3RlZDo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG4ucHJvamVjdHMge1xcbiAgICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAtNHJlbTtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgbWF4LWhlaWdodDogMTVyZW07XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIG92ZXJmbG93LXk6IG92ZXJsYXk7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiAgXFxuLnByb2plY3RzX19pdGVtIHtcXG4gICAgcGFkZGluZzogLjRyZW0gLjhyZW07XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuICBcXG4ucHJvamVjdHNfX2l0ZW06aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG5cXG4ucHJvamVjdHNfX2l0ZW06bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgICBcXG4ubmV3LXRvZG8ge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1ib3R0b206IDRweDtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiA1cmVtO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3gtc2hhZG93OiAwLjJyZW0gMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjQpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLm5ldy10b2RvOmFjdGl2ZSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgycHgpO1xcbiAgICBib3gtc2hhZG93OiAwLjFyZW0gMC4zcmVtIDAuNXJlbSByZ2JhKDAsIDAsIDAsIDAuNCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5uZXctdG9kbyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcXG4gICAgfVxcbn1cXG4gIFxcbi5ob21lLWNvdW50LFxcbi50b2RheS1jb3VudCxcXG4ud2Vlay1jb3VudCxcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICB9XFxuICBcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIG1hcmdpbi1yaWdodDogNC42cmVtO1xcbn1cXG4gIFxcbi5wcm9qZWN0LW5hbWUge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIG1heC13aWR0aDogNjAlO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxufVxcbiAgXFxuLnByb2plY3QtY291bnQtY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jdXN0b20tcHJvamVjdC1jb3VudC1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbiNub3Rlcy1uYXYge1xcbiAgICBtYXJnaW4tdG9wOiAtOHB4O1xcbn1cXG4gIFxcbiN3ZWVrLW5hdiB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxcHg7XFxufVxcblxcbi8qIE5vdGUgc3R5bGluZyAqL1xcblxcbi5ncmlkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG59XFxuICBcXG4uZ3JpZC1jb2wge1xcbiAgICB3aWR0aDogMzMuMzMlO1xcbiAgICBwYWRkaW5nOiAwIDEwcHg7XFxufVxcbiAgXFxuLmdyaWQtY29sLS0xIHtcXG4gICAgcGFkZGluZy1sZWZ0OiAwO1xcbn1cXG4gIFxcbi5ncmlkLWNvbC0tMSAubm90ZTpmaXJzdC1jaGlsZCB7XFxuICAgIG1hcmdpbi10b3A6IDA7XFxufVxcbiAgXFxuLmdyaWQtY29sLS0yIC5ub3RlOmZpcnN0LWNoaWxkIHtcXG4gICAgbWFyZ2luLXRvcDogMDtcXG59XFxuICBcXG4uZ3JpZC1jb2wtLTMge1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwO1xcbn1cXG4gIFxcbi5ncmlkLWNvbC0tMyAubm90ZTpmaXJzdC1jaGlsZCB7XFxuICAgIG1hcmdpbi10b3A6IDA7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDExODBweCkge1xcbiAgICAuZ3JpZC1jb2wtLTIge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wge1xcbiAgICAgICAgd2lkdGg6IDUwJTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0NTBweCkge1xcbiAgICAuZ3JpZC1jb2wtLTIge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wtLTMge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgIH1cXG59XFxuICBcXG4ubm90ZSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgbWFyZ2luLXRvcDogMjBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VlZTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxufVxcbiAgXFxuLm5vdGVfX3RpdGxlLCAubm90ZV9fdGV4dCB7XFxuICAgIGhlaWdodDogYXV0bztcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogbGF0bywgc2Fucy1zZXJpZjtcXG4gICAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xcbn1cXG4gIFxcbi5ub3RlX190aXRsZTpmb2N1cywgLm5vdGVfX3RleHQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5ub3RlX190aXRsZSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbn1cXG4gIFxcbi5ub3RlOmhvdmVyIHtcXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDAzKTtcXG4gICAgICAgICAgICB0cmFuc2Zvcm0tb3JpZ2luOiA1MCUgNTAlO1xcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDNweCAzcHggNXB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnMgZWFzZS1vdXQ7XFxufVxcbiAgXFxuLm5vdGVfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDdweDtcXG4gICAgcmlnaHQ6IDhweDtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgbGluZS1oZWlnaHQ6IDE7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLyogTWFpbiBDb250YWluZXIgKi9cXG5cXG4ubWFpbl9fY29udGFpbmVyIHtcXG4gICAgcGFkZGluZzogNHJlbTtcXG4gICAgcGFkZGluZy10b3A6IDA7XFxuICAgIHBhZGRpbmctYm90dG9tOiAwO1xcbiAgICBncmlkLXJvdzogMiAvIDM7XFxuICAgIGdyaWQtY29sdW1uOiAyIC8gMztcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGJvcmRlci1ib3R0b206IDRyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGJvcmRlci10b3A6IDRyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAubWFpbl9fY29udGFpbmVyIHtcXG4gICAgICAgIHBhZGRpbmc6IDNyZW07XFxuICAgICAgICBwYWRkaW5nLXRvcDogMDtcXG4gICAgICAgIHBhZGRpbmctYm90dG9tOiAwO1xcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogM3JlbSBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgICAgIGJvcmRlci10b3A6IDNyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNTUwcHgpIHtcXG4gICAgLm1haW5fX2NvbnRhaW5lciB7XFxuICAgICAgICBncmlkLWNvbHVtbjogMSAvIDM7XFxuICAgIH1cXG59XFxuXFxuLm1haW4ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuXFxuLyogT3ZlcmxheSBOZXcgKi9cXG5cXG4ub3ZlcmxheS1uZXcge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgcGFkZGluZzogMTBweDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbiAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5vdmVybGF5LW5ldy1pbnZpc2libGUge1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcblxcbi5jcmVhdGUtbmV3IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIGhlaWdodDogNDByZW07XFxuICAgIHdpZHRoOiA4MHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBib3gtc2hhZG93OiAwIDJyZW0gNHJlbSByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmN2Y3Zjc7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC4wNSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXctb3BlbiB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDJyZW07XFxuICAgIHJpZ2h0OiAxLjFyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgbGluZS1oZWlnaHQ6IDFyZW07XFxuICAgIGZvbnQtc2l6ZTogNXJlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19oZWFkZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19oZWFkaW5nIHtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBtYXJnaW4tbGVmdDogMS41cmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19zaWRlYmFyIHtcXG4gICAgd2lkdGg6IDEycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWRhcmspO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0NTBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fc2lkZWJhciB7XFxuICAgICAgICBwYWRkaW5nOiAuNXJlbTtcXG4gICAgICAgIHdpZHRoOiAxMHJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19jb250ZW50IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgaGVpZ2h0OiBjYWxjKDEwMCUgLSA0cmVtKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmctbGVmdDogLjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zIHtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgbWFyZ2luLXRvcDogLjVyZW07XFxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtczpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXM6aG92ZXI6OmJlZm9yZSB7XFxuICAgIGNvbnRlbnQ6IFxcXCI+XFxcIjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmUge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zLWFjdGl2ZTo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19lbnRyeSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG59XFxuXFxuI25ldy10b2RvLXRpdGxlIHtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIG1hcmdpbi1ib3R0b206IDJyZW07XFxufVxcblxcbi5jcmVhdGUtbmV3X19pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjsgICAgXFxuICAgIHJlc2l6ZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19pbnB1dC1iaWcge1xcbiAgICBoZWlnaHQ6IDEycmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiBhdXRvO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZGF0ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZGF0ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fd3JhcHBlci1wcmlvcml0eS1zdWJtaXQge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjZyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5IGlucHV0W3R5cGU9XFxcInJhZGlvXFxcIl0ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGxlZnQ6IDIuMnJlbTtcXG4gICAgaGVpZ2h0OiAxcHg7XFxuICAgIHdpZHRoOiAxcHg7XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgb3BhY2l0eTogMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuIHtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBtYXJnaW46IDAgMS41cmVtIDAgLTVweDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWxvdyB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1sb3c6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbG93LWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bSB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLXllbGxvdyk7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXllbGxvdyk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtLWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXllbGxvdyk7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1oaWdoIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItcmVkKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLXJlZCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaDpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXJlZCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaC1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxLjFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fdG9kby1zdWJtaXQge1xcbiAgICAgICAgbWFyZ2luLXRvcDogOHB4O1xcbiAgICB9XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qge1xcbiAgICBmbGV4OiAxO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgZGlzcGxheTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjb2xvcjogIzE0MTQxNDtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7XFxuICAgIHJlc2l6ZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qtc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBmb250LXNpemU6IDEuMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qtc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlIHtcXG4gICAgZmxleDogMTtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtaW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogJ01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO1xcbiAgICByZXNpemU6IG5vbmU7XFxufVxcblxcbiNuZXctbm90ZS10aXRsZSB7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLWlucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1pbnB1dC1iaWcge1xcbiAgICBoZWlnaHQ6IDEycmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiBhdXRvO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1zdWJtaXQge1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtZW5kO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1zdWJtaXQ6aG92ZXIge1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0OmFjdGl2ZSB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcblxcbi8qIFRvZG8gTWFpbiAqL1xcblxcbi50b2RvIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWVlO1xcbn1cXG4udG9kby1jaGVja2VkIHtcXG4gICAgb3BhY2l0eTowLjQ7XFxufVxcbiAgXFxuLnRvZG9fX3RpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxufVxcbiAgXFxuLnRvZG9fX3RpdGxlLWNoZWNrZWQge1xcbiAgICBjb2xvcjogIzhkOGQ4ZDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7XFxufVxcbiAgXFxuLnRvZG9fX2RldGFpbCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjVyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWw6aG92ZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuICBcXG4udG9kb19fZGV0YWlsLWNoZWNrZWQge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDU5LCAxNjMsIDE0OSwgMC41KTtcXG4gICAgY29sb3I6IHJnYmEoNTksIDE2MywgMTQ5LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWwtY2hlY2tlZDpob3ZlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoNTksIDE2MywgMTQ5LCAwKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxufVxcbiAgXFxuLnRvZG9fX2RhdGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiA0LjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxufVxcbiAgXFxuLnRvZG9fX2RhdGUtY2hlY2tlZCB7XFxuICAgIGNvbG9yOiByZ2JhKDgwLCAzMSwgNTgsIDAuNSk7XFxufVxcbiAgXFxuLnRvZG9fX2NvbXBsZXRlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkICMzYmEzOTU7XFxufVxcbiAgXFxuLnRvZG9fX2NvbXBsZXRlLWNoZWNrZWQge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIGJhY2tncm91bmQ6IHVybChcIiArIF9fX0NTU19MT0FERVJfVVJMX1JFUExBQ0VNRU5UXzBfX18gKyBcIiksICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcXG59XFxuICBcXG4udG9kb19faWNvbiB7XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbiAgICBmaWxsOiAjNTAxZjNhO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnM7XFxufVxcbiAgXFxuLnRvZG9fX2ljb24tZWRpdCB7XFxuICAgIG1hcmdpbi1yaWdodDogMnJlbTtcXG59XFxuICBcXG4udG9kb19faWNvbjpob3ZlciB7XFxuICAgIGZpbGw6ICMzYmEzOTU7XFxufVxcbiAgXFxuLnRvZG9fX2ljb24tY2hlY2tlZCB7XFxuICAgIGZpbGw6IHJnYmEoODAsIDMxLCA1OCwgMC40KTtcXG4gICAgb3BhY2l0eTogMC41O1xcbn1cXG4gIFxcbi50b2RvX19pY29uLWNoZWNrZWQ6aG92ZXIge1xcbiAgICBmaWxsOiByZ2JhKDU5LCAxNjMsIDE0OSwgMC41KTtcXG59XFxuICBcXG4udG9kbzpob3ZlciB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wMDMpO1xcbiAgICB0cmFuc2Zvcm0tb3JpZ2luOiA1MCUgNTAlO1xcbiAgICBib3gtc2hhZG93OiAzcHggM3B4IDVweCAycHggcmdiYSgwLCAwLCAwLCAwLjIpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjJzIGVhc2Utb3V0O1xcbn1cXG4gIFxcbi5wcmlvcml0eS1sb3cge1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIGdyZWVuO1xcbn1cXG4gIFxcbi5wcmlvcml0eS1tZWRpdW0ge1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIG9yYW5nZTtcXG59XFxuICBcXG4ucHJpb3JpdHktaGlnaCB7XFxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgcmVkO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMnJlbTtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9faGVhZGluZyB7XFxuICAgIG1hcmdpbi1ib3R0b206IDIuNXJlbTtcXG4gICAgZm9udC1zaXplOiAyLjhyZW07XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2NvbnRlbnQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19jb250ZW50LXRleHQge1xcbiAgICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19jb250ZW50LWJ0biB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjNTAxZjNhO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGZvbnQtc2l6ZTogMS4zcmVtO1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19jb250ZW50LWJ0bjpob3ZlciB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzUwMWYzYTtcXG4gICAgY29sb3I6IHdoaXRlO1xcbn1cXG5cXG4vKiBPdmVybGF5IERldGFpbCAqL1xcblxcbi5vdmVybGF5LWRldGFpbHMge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgcGFkZGluZzogMTBweDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbiAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn0gXFxuICAgXFxuLm92ZXJsYXktZGV0YWlscy1pbnZpc2libGUge1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcblxcbi5kZXRhaWxzLXBvcHVwIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB3aWR0aDogNjByZW07XFxuICAgIHBhZGRpbmc6IDNyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1KTtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjA1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXAtb3BlbiB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwID4gKjpub3QoOmxhc3QtY2hpbGQpIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogLjhyZW07XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19jYXRhZ29yeSB7XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fdGl0bGUge1xcbiAgICBmb250LXNpemU6IDMuNHJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG4gICAgbWFyZ2luLWJvdHRvbTogMS4zcmVtICFpbXBvcnRhbnQ7XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbiAgICBsaW5lLWhlaWdodDogMTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2RldGFpbHMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fZGV0YWlscy10aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fZGV0YWlscy10ZXh0IHtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbCAhaW1wb3J0YW50O1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fcHJvamVjdCAuZGV0YWlscy1wb3B1cF9fY2F0YWdvcnkge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDIuNHJlbTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2R1ZSAuZGV0YWlscy1wb3B1cF9fY2F0YWdvcnkge1xcbiAgICBtYXJnaW4tcmlnaHQ6IC45cmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fcHJpb3JpdHkgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjFyZW07XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19jbG9zZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAuNHJlbTtcXG4gICAgcmlnaHQ6IDFyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgbGluZS1oZWlnaHQ6IDE7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gIH1cXG5cXG5cXG4vKiBPdmVybGF5IEVkaXQgKi9cXG5cXG4ub3ZlcmxheS1lZGl0IHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICAgIFxcbi5vdmVybGF5LWVkaXQtaW52aXNpYmxlIHtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4uZWRpdC1wb3B1cCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBoZWlnaHQ6IDI2cmVtO1xcbiAgICB3aWR0aDogNTVyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjdmN2Y3O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuMDUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cC1vcGVuIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDEuNHJlbTtcXG4gICAgcmlnaHQ6IDEuMXJlbTtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGxpbmUtaGVpZ2h0OiAxcmVtO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2VudHJ5IHtcXG4gICAgZmxleDogMTtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9faW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogbGF0bywgc2Fucy1zZXJpZjtcXG4gICAgcmVzaXplOiBub25lO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9faW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9faW5wdXQtYmlnIHtcXG4gICAgaGVpZ2h0OiAxMnJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogYXV0bztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19kYXRlIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2RhdGUtdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19kYXRlLWlucHV0IHtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC1mYW1pbHk6IGxhdG8sIHNhbnMtc2VyaWY7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19kYXRlLWlucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHkge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHktdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDIuNnJlbTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5IGlucHV0W3R5cGU9XFxcInJhZGlvXFxcIl0ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGxlZnQ6IDIuMnJlbTtcXG4gICAgaGVpZ2h0OiAxcHg7XFxuICAgIHdpZHRoOiAxcHg7XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgb3BhY2l0eTogMDtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0biB7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgbWFyZ2luOiAwIDEuNXJlbSAwIC01cHg7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eS1idG46aG92ZXIge1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICB9XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1sb3cge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93OmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWxvdy1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW0ge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCBvcmFuZ2U7XFxuICAgIGNvbG9yOiBvcmFuZ2U7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtOmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLW1lZGl1bS1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBvcmFuZ2U7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmVkO1xcbiAgICBjb2xvcjogcmVkO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWhpZ2g6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0taGlnaC1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZWQ7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fdG9kby1zdWJtaXQge1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGFsaWduLXNlbGY6IGNlbnRlcjtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX190b2RvLXN1Ym1pdDpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNiYTM5NTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fdG9kby1zdWJtaXQ6YWN0aXZlIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4vKiBGb290ZXIgKi9cXG5cXG4uZm9vdGVyIHtcXG4gICAgZ3JpZC1yb3c6IC0xIC8gLTI7XFxuICAgIGdyaWQtY29sdW1uOiAxIC8gLTE7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBnYXA6IDFyZW07XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG59XFxuXFxuLmZhLWdpdGh1YiB7XFxuICAgIGZvbnQtc2l6ZTogMnJlbTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG59XFxuXFxuLmZhLWdpdGh1Yjpob3ZlciB7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFFQTtJQUNJLHNCQUFzQjtJQUN0QixzQkFBc0I7SUFDdEIsdUJBQXVCO0lBQ3ZCLHVCQUF1QjtJQUN2QixvQkFBb0I7SUFDcEIsaUNBQWlDO0lBQ2pDLDZCQUE2QjtBQUNqQzs7QUFFQTs7O0lBR0ksU0FBUztJQUNULFVBQVU7SUFDVixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixlQUFlO0FBQ25COztBQUVBO0lBQ0k7UUFDSSxnQkFBZ0I7SUFDcEI7QUFDSjs7QUFFQTtJQUNJO1FBQ0ksaUJBQWlCO0lBQ3JCO0FBQ0o7O0FBRUE7SUFDSTtRQUNJLGNBQWM7SUFDbEI7QUFDSjs7QUFF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O0FBRUE7SUFDSSx3QkFBd0I7SUFDeEIsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLHFCQUFxQjtJQUNyQixVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxxQkFBcUI7QUFDekI7O0FBRUE7SUFDSSxxQkFBcUI7SUFDckIsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIsZUFBZTtJQUNmLHlCQUF5QjtJQUN6QixnQkFBZ0I7SUFDaEIsY0FBYztJQUNkLDZCQUE2QjtJQUM3QixlQUFlO0lBQ2YsbUJBQW1CO0FBQ3ZCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLHlCQUF5QjtBQUM3Qjs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUEsV0FBVzs7QUFFWDtJQUNJLGlCQUFpQjtJQUNqQixtQkFBbUI7SUFDbkIsYUFBYTtJQUNiLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsU0FBUztJQUNULFdBQVc7SUFDWCxhQUFhO0lBQ2IseUNBQXlDO0lBQ3pDLHFDQUFxQztBQUN6Qzs7QUFFQTtJQUNJLGVBQWU7SUFDZix5QkFBeUI7QUFDN0I7O0FBRUE7SUFDSSxZQUFZO0FBQ2hCXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU1vbnRzZXJyYXQmZGlzcGxheT1zd2FwJyk7XFxuXFxuOnJvb3Qge1xcbiAgICAtLWNvbG9yLWJsYWNrOiAjMjY0NjUzO1xcbiAgICAtLWNvbG9yLWdyZWVuOiAjMmE5ZDhmO1xcbiAgICAtLWNvbG9yLXllbGxvdzogI2U5YzQ2YTtcXG4gICAgLS1jb2xvci1vcmFuZ2U6ICNmNGEyNjE7XFxuICAgIC0tY29sb3ItcmVkOiAjZTc2ZjUxO1xcbiAgICAtLWJhY2tncm91bmQtY29sb3ItbGlnaHQ6ICNmN2Y3Zjc7XFxuICAgIC0tYmFja2dyb3VuZC1jb2xvci1kYXJrOiAjZWVlO1xcbn1cXG5cXG4qLFxcbio6OmJlZm9yZSxcXG4qOjphZnRlciB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgYm94LXNpemluZzogaW5oZXJpdDtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTIwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1Ni43NSU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDgwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1MCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA0My43NSU7XFxuICAgIH1cXG59XFxuXFxuYm9keSB7XFxuICAgIG1pbi1oZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuXFxubGkge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBDb250ZW50ICovXFxuXFxuLmNvbnRlbnQge1xcbiAgICB3aWR0aDogMTEwcmVtO1xcbiAgICBoZWlnaHQ6IDYwcmVtO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gNTRyZW0gM3JlbTtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyMHJlbSAxZnI7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTUwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIHdpZHRoOiAxMDB2dztcXG4gICAgICAgIGhlaWdodDogMTAwdmg7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gMWZyIDNyZW07XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDkwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDIwcmVtO1xcbiAgICB9XFxufVxcblxcbi8qIEhlYWRlciAqL1xcblxcbi5oZWFkZXIge1xcbiAgICBncmlkLXJvdzogMSAvIDI7XFxuICAgIGdyaWQtY29sdW1uOiAxIC8gMztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xcbiAgICBnYXA6MXJlbTtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG59XFxuXFxuLmxvZ28ge1xcbiAgICBoZWlnaHQ6IDU1cHg7XFxuICAgIHdpZHRoOiA1NXB4O1xcbn1cXG5cXG4vKiBTaWRlIEJhciAqL1xcblxcbi5zaWRlLWJhciB7XFxuICAgIGdyaWQtcm93OiAyIC8gMztcXG4gICAgZ3JpZC1jb2x1bW46IDEgLyAyO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItZGFyayk7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgcGFkZGluZzogMnJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA1NTBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDIgLyAzO1xcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgbGVmdDogMTQwcHg7XFxuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbiAgICB9XFxufVxcblxcbi5uYXYge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4ubmF2X19pdGVtIHtcXG4gICAgd2lkdGg6IGF1dG87XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDEuNXJlbTtcXG59XFxuXFxuLm5hdl9faXRlbTpsYXN0LWNoaWxkIHtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubmF2X19pdGVtOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4ubmF2X19pdGVtLS1wcm9qZWN0cyB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLm5hdl9faXRlbS0tcHJvamVjdHMtdGl0bGUge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4gIFxcbi5uYXZfX3NlbGVjdGVkIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4ubmF2X19zZWxlY3RlZDo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG4ucHJvamVjdHMge1xcbiAgICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAtNHJlbTtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgbWF4LWhlaWdodDogMTVyZW07XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIG92ZXJmbG93LXk6IG92ZXJsYXk7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiAgXFxuLnByb2plY3RzX19pdGVtIHtcXG4gICAgcGFkZGluZzogLjRyZW0gLjhyZW07XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuICBcXG4ucHJvamVjdHNfX2l0ZW06aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG5cXG4ucHJvamVjdHNfX2l0ZW06bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgICBcXG4ubmV3LXRvZG8ge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1ib3R0b206IDRweDtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiA1cmVtO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3gtc2hhZG93OiAwLjJyZW0gMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjQpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLm5ldy10b2RvOmFjdGl2ZSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgycHgpO1xcbiAgICBib3gtc2hhZG93OiAwLjFyZW0gMC4zcmVtIDAuNXJlbSByZ2JhKDAsIDAsIDAsIDAuNCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5uZXctdG9kbyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcXG4gICAgfVxcbn1cXG4gIFxcbi5ob21lLWNvdW50LFxcbi50b2RheS1jb3VudCxcXG4ud2Vlay1jb3VudCxcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICB9XFxuICBcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIG1hcmdpbi1yaWdodDogNC42cmVtO1xcbn1cXG4gIFxcbi5wcm9qZWN0LW5hbWUge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIG1heC13aWR0aDogNjAlO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxufVxcbiAgXFxuLnByb2plY3QtY291bnQtY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jdXN0b20tcHJvamVjdC1jb3VudC1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbiNub3Rlcy1uYXYge1xcbiAgICBtYXJnaW4tdG9wOiAtOHB4O1xcbn1cXG4gIFxcbiN3ZWVrLW5hdiB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxcHg7XFxufVxcblxcbi8qIE5vdGUgc3R5bGluZyAqL1xcblxcbi5ncmlkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG59XFxuICBcXG4uZ3JpZC1jb2wge1xcbiAgICB3aWR0aDogMzMuMzMlO1xcbiAgICBwYWRkaW5nOiAwIDEwcHg7XFxufVxcbiAgXFxuLmdyaWQtY29sLS0xIHtcXG4gICAgcGFkZGluZy1sZWZ0OiAwO1xcbn1cXG4gIFxcbi5ncmlkLWNvbC0tMSAubm90ZTpmaXJzdC1jaGlsZCB7XFxuICAgIG1hcmdpbi10b3A6IDA7XFxufVxcbiAgXFxuLmdyaWQtY29sLS0yIC5ub3RlOmZpcnN0LWNoaWxkIHtcXG4gICAgbWFyZ2luLXRvcDogMDtcXG59XFxuICBcXG4uZ3JpZC1jb2wtLTMge1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAwO1xcbn1cXG4gIFxcbi5ncmlkLWNvbC0tMyAubm90ZTpmaXJzdC1jaGlsZCB7XFxuICAgIG1hcmdpbi10b3A6IDA7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDExODBweCkge1xcbiAgICAuZ3JpZC1jb2wtLTIge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wge1xcbiAgICAgICAgd2lkdGg6IDUwJTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0NTBweCkge1xcbiAgICAuZ3JpZC1jb2wtLTIge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wtLTMge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcbiAgICAuZ3JpZC1jb2wge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgIH1cXG59XFxuICBcXG4ubm90ZSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiBmaXQtY29udGVudDtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgbWFyZ2luLXRvcDogMjBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VlZTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbiAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxufVxcbiAgXFxuLm5vdGVfX3RpdGxlLCAubm90ZV9fdGV4dCB7XFxuICAgIGhlaWdodDogYXV0bztcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogbGF0bywgc2Fucy1zZXJpZjtcXG4gICAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xcbn1cXG4gIFxcbi5ub3RlX190aXRsZTpmb2N1cywgLm5vdGVfX3RleHQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5ub3RlX190aXRsZSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDJyZW07XFxuICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbn1cXG4gIFxcbi5ub3RlOmhvdmVyIHtcXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDAzKTtcXG4gICAgICAgICAgICB0cmFuc2Zvcm0tb3JpZ2luOiA1MCUgNTAlO1xcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDNweCAzcHggNXB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnMgZWFzZS1vdXQ7XFxufVxcbiAgXFxuLm5vdGVfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDdweDtcXG4gICAgcmlnaHQ6IDhweDtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgbGluZS1oZWlnaHQ6IDE7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLyogTWFpbiBDb250YWluZXIgKi9cXG5cXG4ubWFpbl9fY29udGFpbmVyIHtcXG4gICAgcGFkZGluZzogNHJlbTtcXG4gICAgcGFkZGluZy10b3A6IDA7XFxuICAgIHBhZGRpbmctYm90dG9tOiAwO1xcbiAgICBncmlkLXJvdzogMiAvIDM7XFxuICAgIGdyaWQtY29sdW1uOiAyIC8gMztcXG4gICAgb3ZlcmZsb3cteTogYXV0bztcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGJvcmRlci1ib3R0b206IDRyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGJvcmRlci10b3A6IDRyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAubWFpbl9fY29udGFpbmVyIHtcXG4gICAgICAgIHBhZGRpbmc6IDNyZW07XFxuICAgICAgICBwYWRkaW5nLXRvcDogMDtcXG4gICAgICAgIHBhZGRpbmctYm90dG9tOiAwO1xcbiAgICAgICAgYm9yZGVyLWJvdHRvbTogM3JlbSBzb2xpZCB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgICAgIGJvcmRlci10b3A6IDNyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNTUwcHgpIHtcXG4gICAgLm1haW5fX2NvbnRhaW5lciB7XFxuICAgICAgICBncmlkLWNvbHVtbjogMSAvIDM7XFxuICAgIH1cXG59XFxuXFxuLm1haW4ge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuXFxuLyogT3ZlcmxheSBOZXcgKi9cXG5cXG4ub3ZlcmxheS1uZXcge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgcGFkZGluZzogMTBweDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbiAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5vdmVybGF5LW5ldy1pbnZpc2libGUge1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcblxcbi5jcmVhdGUtbmV3IHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIGhlaWdodDogNDByZW07XFxuICAgIHdpZHRoOiA4MHJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBib3gtc2hhZG93OiAwIDJyZW0gNHJlbSByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmN2Y3Zjc7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC4wNSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXctb3BlbiB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDJyZW07XFxuICAgIHJpZ2h0OiAxLjFyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgbGluZS1oZWlnaHQ6IDFyZW07XFxuICAgIGZvbnQtc2l6ZTogNXJlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19oZWFkZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19oZWFkaW5nIHtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBtYXJnaW4tbGVmdDogMS41cmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19zaWRlYmFyIHtcXG4gICAgd2lkdGg6IDEycmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWRhcmspO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0NTBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fc2lkZWJhciB7XFxuICAgICAgICBwYWRkaW5nOiAuNXJlbTtcXG4gICAgICAgIHdpZHRoOiAxMHJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19jb250ZW50IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgaGVpZ2h0OiBjYWxjKDEwMCUgLSA0cmVtKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtc3RhcnQ7XFxuICAgIHBhZGRpbmctbGVmdDogLjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMS44cmVtO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zIHtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgbWFyZ2luLXRvcDogLjVyZW07XFxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtczpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXM6aG92ZXI6OmJlZm9yZSB7XFxuICAgIGNvbnRlbnQ6IFxcXCI+XFxcIjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmUge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zLWFjdGl2ZTo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19lbnRyeSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG59XFxuXFxuI25ldy10b2RvLXRpdGxlIHtcXG4gICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIG1hcmdpbi1ib3R0b206IDJyZW07XFxufVxcblxcbi5jcmVhdGUtbmV3X19pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjsgICAgXFxuICAgIHJlc2l6ZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19pbnB1dC1iaWcge1xcbiAgICBoZWlnaHQ6IDEycmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiBhdXRvO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZGF0ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDFyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZGF0ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fd3JhcHBlci1wcmlvcml0eS1zdWJtaXQge1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjZyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5IGlucHV0W3R5cGU9XFxcInJhZGlvXFxcIl0ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGxlZnQ6IDIuMnJlbTtcXG4gICAgaGVpZ2h0OiAxcHg7XFxuICAgIHdpZHRoOiAxcHg7XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgb3BhY2l0eTogMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuIHtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBtYXJnaW46IDAgMS41cmVtIDAgLTVweDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWxvdyB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1sb3c6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbG93LWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bSB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLXllbGxvdyk7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXllbGxvdyk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtLWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXllbGxvdyk7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1oaWdoIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItcmVkKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLXJlZCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaDpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLXJlZCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaC1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxLjFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA0MDBweCkge1xcbiAgICAuY3JlYXRlLW5ld19fdG9kby1zdWJtaXQge1xcbiAgICAgICAgbWFyZ2luLXRvcDogOHB4O1xcbiAgICB9XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qge1xcbiAgICBmbGV4OiAxO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgZGlzcGxheTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjb2xvcjogIzE0MTQxNDtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7XFxuICAgIHJlc2l6ZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qtc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBmb250LXNpemU6IDEuMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3Qtc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlIHtcXG4gICAgZmxleDogMTtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtaW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogJ01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO1xcbiAgICByZXNpemU6IG5vbmU7XFxufVxcblxcbiNuZXctbm90ZS10aXRsZSB7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLWlucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1pbnB1dC1iaWcge1xcbiAgICBoZWlnaHQ6IDEycmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiBhdXRvO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1zdWJtaXQge1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGFsaWduLXNlbGY6IGZsZXgtZW5kO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1zdWJtaXQ6aG92ZXIge1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0OmFjdGl2ZSB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcblxcbi8qIFRvZG8gTWFpbiAqL1xcblxcbi50b2RvIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA0cmVtO1xcbiAgICBwYWRkaW5nOiAxcmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWVlO1xcbn1cXG4udG9kby1jaGVja2VkIHtcXG4gICAgb3BhY2l0eTowLjQ7XFxufVxcbiAgXFxuLnRvZG9fX3RpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxuICAgIGZvbnQtd2VpZ2h0OiAzMDA7XFxufVxcbiAgXFxuLnRvZG9fX3RpdGxlLWNoZWNrZWQge1xcbiAgICBjb2xvcjogIzhkOGQ4ZDtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7XFxufVxcbiAgXFxuLnRvZG9fX2RldGFpbCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjVyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWw6aG92ZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuICBcXG4udG9kb19fZGV0YWlsLWNoZWNrZWQge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDU5LCAxNjMsIDE0OSwgMC41KTtcXG4gICAgY29sb3I6IHJnYmEoNTksIDE2MywgMTQ5LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWwtY2hlY2tlZDpob3ZlciB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoNTksIDE2MywgMTQ5LCAwKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxufVxcbiAgXFxuLnRvZG9fX2RhdGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxuICAgIHdpZHRoOiA0LjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxufVxcbiAgXFxuLnRvZG9fX2RhdGUtY2hlY2tlZCB7XFxuICAgIGNvbG9yOiByZ2JhKDgwLCAzMSwgNTgsIDAuNSk7XFxufVxcbiAgXFxuLnRvZG9fX2NvbXBsZXRlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxLjVyZW07XFxuICAgIGhlaWdodDogMS41cmVtO1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMnB4IHNvbGlkICMzYmEzOTU7XFxufVxcbiAgXFxuLnRvZG9fX2NvbXBsZXRlLWNoZWNrZWQge1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIGJhY2tncm91bmQ6IHVybChcXFwiaW1hZ2VzL2NoZWNrLnBuZ1xcXCIpLCAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47XFxufVxcbiAgXFxuLnRvZG9fX2ljb24ge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgZmlsbDogIzUwMWYzYTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbn1cXG4gIFxcbi50b2RvX19pY29uLWVkaXQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxufVxcbiAgXFxuLnRvZG9fX2ljb246aG92ZXIge1xcbiAgICBmaWxsOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi50b2RvX19pY29uLWNoZWNrZWQge1xcbiAgICBmaWxsOiByZ2JhKDgwLCAzMSwgNTgsIDAuNCk7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG59XFxuICBcXG4udG9kb19faWNvbi1jaGVja2VkOmhvdmVyIHtcXG4gICAgZmlsbDogcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxufVxcbiAgXFxuLnRvZG86aG92ZXIge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDAzKTtcXG4gICAgdHJhbnNmb3JtLW9yaWdpbjogNTAlIDUwJTtcXG4gICAgYm94LXNoYWRvdzogM3B4IDNweCA1cHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4ycyBlYXNlLW91dDtcXG59XFxuICBcXG4ucHJpb3JpdHktbG93IHtcXG4gICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCBncmVlbjtcXG59XFxuICBcXG4ucHJpb3JpdHktbWVkaXVtIHtcXG4gICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCBvcmFuZ2U7XFxufVxcbiAgXFxuLnByaW9yaXR5LWhpZ2gge1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHJlZDtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDJyZW07XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2hlYWRpbmcge1xcbiAgICBtYXJnaW4tYm90dG9tOiAyLjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMi44cmVtO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19jb250ZW50IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC10ZXh0IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG4ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzUwMWYzYTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG46aG92ZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM1MDFmM2E7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLyogT3ZlcmxheSBEZXRhaWwgKi9cXG5cXG4ub3ZlcmxheS1kZXRhaWxzIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59IFxcbiAgIFxcbi5vdmVybGF5LWRldGFpbHMtaW52aXNpYmxlIHtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4uZGV0YWlscy1wb3B1cCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDYwcmVtO1xcbiAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMnJlbSA0cmVtIHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC4wNSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwLW9wZW4ge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cCA+ICo6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IC44cmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fY2F0YWdvcnkge1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3RpdGxlIHtcXG4gICAgZm9udC1zaXplOiAzLjRyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxuICAgIG1hcmdpbi1ib3R0b206IDEuM3JlbSAhaW1wb3J0YW50O1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgbGluZS1oZWlnaHQ6IDE7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kZXRhaWxzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2RldGFpbHMtdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDIuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2RldGFpbHMtdGV4dCB7XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWwgIWltcG9ydGFudDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3Byb2plY3QgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjRyZW07XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kdWUgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuOXJlbTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3ByaW9yaXR5IC5kZXRhaWxzLXBvcHVwX19jYXRhZ29yeSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi4xcmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fY2xvc2Uge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogLjRyZW07XFxuICAgIHJpZ2h0OiAxcmVtO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICB9XFxuXFxuXFxuLyogT3ZlcmxheSBFZGl0ICovXFxuXFxuLm92ZXJsYXktZWRpdCB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBwYWRkaW5nOiAxMHB4O1xcbiAgICB3aWR0aDogMTAwdnc7XFxuICAgIGhlaWdodDogMTAwdmg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgICBcXG4ub3ZlcmxheS1lZGl0LWludmlzaWJsZSB7XFxuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3BhY2l0eTogMDtcXG59XFxuXFxuLmVkaXQtcG9wdXAge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgaGVpZ2h0OiAyNnJlbTtcXG4gICAgd2lkdGg6IDU1cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIGJveC1zaGFkb3c6IDAgMnJlbSA0cmVtIHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y3ZjdmNztcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjA1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXAtb3BlbiB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19jbG9zZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAxLjRyZW07XFxuICAgIHJpZ2h0OiAxLjFyZW07XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBsaW5lLWhlaWdodDogMXJlbTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19lbnRyeSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6IGxhdG8sIHNhbnMtc2VyaWY7XFxuICAgIHJlc2l6ZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0LWJpZyB7XFxuICAgIGhlaWdodDogMTJyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IGF1dG87XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19kYXRlLXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dCB7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtZmFtaWx5OiBsYXRvLCBzYW5zLXNlcmlmO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX193cmFwcGVyLXByaW9yaXR5LXN1Ym1pdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5LXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjZyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eSBpbnB1dFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBsZWZ0OiAyLjJyZW07XFxuICAgIGhlaWdodDogMXB4O1xcbiAgICB3aWR0aDogMXB4O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4ge1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIG1hcmdpbjogMCAxLjVyZW0gMCAtNXB4O1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuOmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgfVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93IHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWxvdzpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1sb3ctYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgb3JhbmdlO1xcbiAgICBjb2xvcjogb3JhbmdlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLW1lZGl1bTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IG9yYW5nZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW0tYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0taGlnaCB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJlZDtcXG4gICAgY29sb3I6IHJlZDtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoOmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWhpZ2gtYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3RvZG8tc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fdG9kby1zdWJtaXQ6aG92ZXIge1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3RvZG8tc3VibWl0OmFjdGl2ZSB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLyogRm9vdGVyICovXFxuXFxuLmZvb3RlciB7XFxuICAgIGdyaWQtcm93OiAtMSAvIC0yO1xcbiAgICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgZ2FwOiAxcmVtO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWNvbG9yLW9yYW5nZSk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLW9yYW5nZSk7XFxufVxcblxcbi5mYS1naXRodWIge1xcbiAgICBmb250LXNpemU6IDJyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxufVxcblxcbi5mYS1naXRodWI6aG92ZXIge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG4gIGlmICghdXJsKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuICB1cmwgPSBTdHJpbmcodXJsLl9fZXNNb2R1bGUgPyB1cmwuZGVmYXVsdCA6IHVybCk7XG5cbiAgLy8gSWYgdXJsIGlzIGFscmVhZHkgd3JhcHBlZCBpbiBxdW90ZXMsIHJlbW92ZSB0aGVtXG4gIGlmICgvXlsnXCJdLipbJ1wiXSQvLnRlc3QodXJsKSkge1xuICAgIHVybCA9IHVybC5zbGljZSgxLCAtMSk7XG4gIH1cbiAgaWYgKG9wdGlvbnMuaGFzaCkge1xuICAgIHVybCArPSBvcHRpb25zLmhhc2g7XG4gIH1cblxuICAvLyBTaG91bGQgdXJsIGJlIHdyYXBwZWQ/XG4gIC8vIFNlZSBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3NzLXZhbHVlcy0zLyN1cmxzXG4gIGlmICgvW1wiJygpIFxcdFxcbl18KCUyMCkvLnRlc3QodXJsKSB8fCBvcHRpb25zLm5lZWRRdW90ZXMpIHtcbiAgICByZXR1cm4gXCJcXFwiXCIuY29uY2F0KHVybC5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykucmVwbGFjZSgvXFxuL2csIFwiXFxcXG5cIiksIFwiXFxcIlwiKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZExlYWRpbmdaZXJvcyhudW1iZXIsIHRhcmdldExlbmd0aCkge1xuICB2YXIgc2lnbiA9IG51bWJlciA8IDAgPyAnLScgOiAnJztcbiAgdmFyIG91dHB1dCA9IE1hdGguYWJzKG51bWJlcikudG9TdHJpbmcoKTtcblxuICB3aGlsZSAob3V0cHV0Lmxlbmd0aCA8IHRhcmdldExlbmd0aCkge1xuICAgIG91dHB1dCA9ICcwJyArIG91dHB1dDtcbiAgfVxuXG4gIHJldHVybiBzaWduICsgb3V0cHV0O1xufSIsImltcG9ydCBkZWZhdWx0TG9jYWxlIGZyb20gXCIuLi8uLi9sb2NhbGUvZW4tVVMvaW5kZXguanNcIjtcbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRMb2NhbGU7IiwidmFyIGRlZmF1bHRPcHRpb25zID0ge307XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdE9wdGlvbnMoKSB7XG4gIHJldHVybiBkZWZhdWx0T3B0aW9ucztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0T3B0aW9ucyhuZXdPcHRpb25zKSB7XG4gIGRlZmF1bHRPcHRpb25zID0gbmV3T3B0aW9ucztcbn0iLCJpbXBvcnQgZ2V0VVRDRGF5T2ZZZWFyIGZyb20gXCIuLi8uLi8uLi9fbGliL2dldFVUQ0RheU9mWWVhci9pbmRleC5qc1wiO1xuaW1wb3J0IGdldFVUQ0lTT1dlZWsgZnJvbSBcIi4uLy4uLy4uL19saWIvZ2V0VVRDSVNPV2Vlay9pbmRleC5qc1wiO1xuaW1wb3J0IGdldFVUQ0lTT1dlZWtZZWFyIGZyb20gXCIuLi8uLi8uLi9fbGliL2dldFVUQ0lTT1dlZWtZZWFyL2luZGV4LmpzXCI7XG5pbXBvcnQgZ2V0VVRDV2VlayBmcm9tIFwiLi4vLi4vLi4vX2xpYi9nZXRVVENXZWVrL2luZGV4LmpzXCI7XG5pbXBvcnQgZ2V0VVRDV2Vla1llYXIgZnJvbSBcIi4uLy4uLy4uL19saWIvZ2V0VVRDV2Vla1llYXIvaW5kZXguanNcIjtcbmltcG9ydCBhZGRMZWFkaW5nWmVyb3MgZnJvbSBcIi4uLy4uL2FkZExlYWRpbmdaZXJvcy9pbmRleC5qc1wiO1xuaW1wb3J0IGxpZ2h0Rm9ybWF0dGVycyBmcm9tIFwiLi4vbGlnaHRGb3JtYXR0ZXJzL2luZGV4LmpzXCI7XG52YXIgZGF5UGVyaW9kRW51bSA9IHtcbiAgYW06ICdhbScsXG4gIHBtOiAncG0nLFxuICBtaWRuaWdodDogJ21pZG5pZ2h0JyxcbiAgbm9vbjogJ25vb24nLFxuICBtb3JuaW5nOiAnbW9ybmluZycsXG4gIGFmdGVybm9vbjogJ2FmdGVybm9vbicsXG4gIGV2ZW5pbmc6ICdldmVuaW5nJyxcbiAgbmlnaHQ6ICduaWdodCdcbn07XG5cbi8qXG4gKiB8ICAgICB8IFVuaXQgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICB8IFVuaXQgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8LS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8ICBhICB8IEFNLCBQTSAgICAgICAgICAgICAgICAgICAgICAgICB8ICBBKiB8IE1pbGxpc2Vjb25kcyBpbiBkYXkgICAgICAgICAgICB8XG4gKiB8ICBiICB8IEFNLCBQTSwgbm9vbiwgbWlkbmlnaHQgICAgICAgICB8ICBCICB8IEZsZXhpYmxlIGRheSBwZXJpb2QgICAgICAgICAgICB8XG4gKiB8ICBjICB8IFN0YW5kLWFsb25lIGxvY2FsIGRheSBvZiB3ZWVrICB8ICBDKiB8IExvY2FsaXplZCBob3VyIHcvIGRheSBwZXJpb2QgICB8XG4gKiB8ICBkICB8IERheSBvZiBtb250aCAgICAgICAgICAgICAgICAgICB8ICBEICB8IERheSBvZiB5ZWFyICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBlICB8IExvY2FsIGRheSBvZiB3ZWVrICAgICAgICAgICAgICB8ICBFICB8IERheSBvZiB3ZWVrICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBmICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICBGKiB8IERheSBvZiB3ZWVrIGluIG1vbnRoICAgICAgICAgICB8XG4gKiB8ICBnKiB8IE1vZGlmaWVkIEp1bGlhbiBkYXkgICAgICAgICAgICB8ICBHICB8IEVyYSAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBoICB8IEhvdXIgWzEtMTJdICAgICAgICAgICAgICAgICAgICB8ICBIICB8IEhvdXIgWzAtMjNdICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBpISB8IElTTyBkYXkgb2Ygd2VlayAgICAgICAgICAgICAgICB8ICBJISB8IElTTyB3ZWVrIG9mIHllYXIgICAgICAgICAgICAgICB8XG4gKiB8ICBqKiB8IExvY2FsaXplZCBob3VyIHcvIGRheSBwZXJpb2QgICB8ICBKKiB8IExvY2FsaXplZCBob3VyIHcvbyBkYXkgcGVyaW9kICB8XG4gKiB8ICBrICB8IEhvdXIgWzEtMjRdICAgICAgICAgICAgICAgICAgICB8ICBLICB8IEhvdXIgWzAtMTFdICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBsKiB8IChkZXByZWNhdGVkKSAgICAgICAgICAgICAgICAgICB8ICBMICB8IFN0YW5kLWFsb25lIG1vbnRoICAgICAgICAgICAgICB8XG4gKiB8ICBtICB8IE1pbnV0ZSAgICAgICAgICAgICAgICAgICAgICAgICB8ICBNICB8IE1vbnRoICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBuICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICBOICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBvISB8IE9yZGluYWwgbnVtYmVyIG1vZGlmaWVyICAgICAgICB8ICBPICB8IFRpbWV6b25lIChHTVQpICAgICAgICAgICAgICAgICB8XG4gKiB8ICBwISB8IExvbmcgbG9jYWxpemVkIHRpbWUgICAgICAgICAgICB8ICBQISB8IExvbmcgbG9jYWxpemVkIGRhdGUgICAgICAgICAgICB8XG4gKiB8ICBxICB8IFN0YW5kLWFsb25lIHF1YXJ0ZXIgICAgICAgICAgICB8ICBRICB8IFF1YXJ0ZXIgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICByKiB8IFJlbGF0ZWQgR3JlZ29yaWFuIHllYXIgICAgICAgICB8ICBSISB8IElTTyB3ZWVrLW51bWJlcmluZyB5ZWFyICAgICAgICB8XG4gKiB8ICBzICB8IFNlY29uZCAgICAgICAgICAgICAgICAgICAgICAgICB8ICBTICB8IEZyYWN0aW9uIG9mIHNlY29uZCAgICAgICAgICAgICB8XG4gKiB8ICB0ISB8IFNlY29uZHMgdGltZXN0YW1wICAgICAgICAgICAgICB8ICBUISB8IE1pbGxpc2Vjb25kcyB0aW1lc3RhbXAgICAgICAgICB8XG4gKiB8ICB1ICB8IEV4dGVuZGVkIHllYXIgICAgICAgICAgICAgICAgICB8ICBVKiB8IEN5Y2xpYyB5ZWFyICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICB2KiB8IFRpbWV6b25lIChnZW5lcmljIG5vbi1sb2NhdC4pICB8ICBWKiB8IFRpbWV6b25lIChsb2NhdGlvbikgICAgICAgICAgICB8XG4gKiB8ICB3ICB8IExvY2FsIHdlZWsgb2YgeWVhciAgICAgICAgICAgICB8ICBXKiB8IFdlZWsgb2YgbW9udGggICAgICAgICAgICAgICAgICB8XG4gKiB8ICB4ICB8IFRpbWV6b25lIChJU08tODYwMSB3L28gWikgICAgICB8ICBYICB8IFRpbWV6b25lIChJU08tODYwMSkgICAgICAgICAgICB8XG4gKiB8ICB5ICB8IFllYXIgKGFicykgICAgICAgICAgICAgICAgICAgICB8ICBZICB8IExvY2FsIHdlZWstbnVtYmVyaW5nIHllYXIgICAgICB8XG4gKiB8ICB6ICB8IFRpbWV6b25lIChzcGVjaWZpYyBub24tbG9jYXQuKSB8ICBaKiB8IFRpbWV6b25lIChhbGlhc2VzKSAgICAgICAgICAgICB8XG4gKlxuICogTGV0dGVycyBtYXJrZWQgYnkgKiBhcmUgbm90IGltcGxlbWVudGVkIGJ1dCByZXNlcnZlZCBieSBVbmljb2RlIHN0YW5kYXJkLlxuICpcbiAqIExldHRlcnMgbWFya2VkIGJ5ICEgYXJlIG5vbi1zdGFuZGFyZCwgYnV0IGltcGxlbWVudGVkIGJ5IGRhdGUtZm5zOlxuICogLSBgb2AgbW9kaWZpZXMgdGhlIHByZXZpb3VzIHRva2VuIHRvIHR1cm4gaXQgaW50byBhbiBvcmRpbmFsIChzZWUgYGZvcm1hdGAgZG9jcylcbiAqIC0gYGlgIGlzIElTTyBkYXkgb2Ygd2Vlay4gRm9yIGBpYCBhbmQgYGlpYCBpcyByZXR1cm5zIG51bWVyaWMgSVNPIHdlZWsgZGF5cyxcbiAqICAgaS5lLiA3IGZvciBTdW5kYXksIDEgZm9yIE1vbmRheSwgZXRjLlxuICogLSBgSWAgaXMgSVNPIHdlZWsgb2YgeWVhciwgYXMgb3Bwb3NlZCB0byBgd2Agd2hpY2ggaXMgbG9jYWwgd2VlayBvZiB5ZWFyLlxuICogLSBgUmAgaXMgSVNPIHdlZWstbnVtYmVyaW5nIHllYXIsIGFzIG9wcG9zZWQgdG8gYFlgIHdoaWNoIGlzIGxvY2FsIHdlZWstbnVtYmVyaW5nIHllYXIuXG4gKiAgIGBSYCBpcyBzdXBwb3NlZCB0byBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYElgIGFuZCBgaWBcbiAqICAgZm9yIHVuaXZlcnNhbCBJU08gd2Vlay1udW1iZXJpbmcgZGF0ZSwgd2hlcmVhc1xuICogICBgWWAgaXMgc3VwcG9zZWQgdG8gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB3YCBhbmQgYGVgXG4gKiAgIGZvciB3ZWVrLW51bWJlcmluZyBkYXRlIHNwZWNpZmljIHRvIHRoZSBsb2NhbGUuXG4gKiAtIGBQYCBpcyBsb25nIGxvY2FsaXplZCBkYXRlIGZvcm1hdFxuICogLSBgcGAgaXMgbG9uZyBsb2NhbGl6ZWQgdGltZSBmb3JtYXRcbiAqL1xudmFyIGZvcm1hdHRlcnMgPSB7XG4gIC8vIEVyYVxuICBHOiBmdW5jdGlvbiBHKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBlcmEgPSBkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgPiAwID8gMSA6IDA7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBBRCwgQkNcbiAgICAgIGNhc2UgJ0cnOlxuICAgICAgY2FzZSAnR0cnOlxuICAgICAgY2FzZSAnR0dHJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmVyYShlcmEsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIEEsIEJcblxuICAgICAgY2FzZSAnR0dHR0cnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZXJhKGVyYSwge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93J1xuICAgICAgICB9KTtcbiAgICAgIC8vIEFubm8gRG9taW5pLCBCZWZvcmUgQ2hyaXN0XG5cbiAgICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmVyYShlcmEsIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gWWVhclxuICB5OiBmdW5jdGlvbiB5KGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIC8vIE9yZGluYWwgbnVtYmVyXG4gICAgaWYgKHRva2VuID09PSAneW8nKSB7XG4gICAgICB2YXIgc2lnbmVkWWVhciA9IGRhdGUuZ2V0VVRDRnVsbFllYXIoKTsgLy8gUmV0dXJucyAxIGZvciAxIEJDICh3aGljaCBpcyB5ZWFyIDAgaW4gSmF2YVNjcmlwdClcblxuICAgICAgdmFyIHllYXIgPSBzaWduZWRZZWFyID4gMCA/IHNpZ25lZFllYXIgOiAxIC0gc2lnbmVkWWVhcjtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKHllYXIsIHtcbiAgICAgICAgdW5pdDogJ3llYXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLnkoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBMb2NhbCB3ZWVrLW51bWJlcmluZyB5ZWFyXG4gIFk6IGZ1bmN0aW9uIFkoZGF0ZSwgdG9rZW4sIGxvY2FsaXplLCBvcHRpb25zKSB7XG4gICAgdmFyIHNpZ25lZFdlZWtZZWFyID0gZ2V0VVRDV2Vla1llYXIoZGF0ZSwgb3B0aW9ucyk7IC8vIFJldHVybnMgMSBmb3IgMSBCQyAod2hpY2ggaXMgeWVhciAwIGluIEphdmFTY3JpcHQpXG5cbiAgICB2YXIgd2Vla1llYXIgPSBzaWduZWRXZWVrWWVhciA+IDAgPyBzaWduZWRXZWVrWWVhciA6IDEgLSBzaWduZWRXZWVrWWVhcjsgLy8gVHdvIGRpZ2l0IHllYXJcblxuICAgIGlmICh0b2tlbiA9PT0gJ1lZJykge1xuICAgICAgdmFyIHR3b0RpZ2l0WWVhciA9IHdlZWtZZWFyICUgMTAwO1xuICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyh0d29EaWdpdFllYXIsIDIpO1xuICAgIH0gLy8gT3JkaW5hbCBudW1iZXJcblxuXG4gICAgaWYgKHRva2VuID09PSAnWW8nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcih3ZWVrWWVhciwge1xuICAgICAgICB1bml0OiAneWVhcidcbiAgICAgIH0pO1xuICAgIH0gLy8gUGFkZGluZ1xuXG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHdlZWtZZWFyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBJU08gd2Vlay1udW1iZXJpbmcgeWVhclxuICBSOiBmdW5jdGlvbiBSKGRhdGUsIHRva2VuKSB7XG4gICAgdmFyIGlzb1dlZWtZZWFyID0gZ2V0VVRDSVNPV2Vla1llYXIoZGF0ZSk7IC8vIFBhZGRpbmdcblxuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoaXNvV2Vla1llYXIsIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIEV4dGVuZGVkIHllYXIuIFRoaXMgaXMgYSBzaW5nbGUgbnVtYmVyIGRlc2lnbmF0aW5nIHRoZSB5ZWFyIG9mIHRoaXMgY2FsZW5kYXIgc3lzdGVtLlxuICAvLyBUaGUgbWFpbiBkaWZmZXJlbmNlIGJldHdlZW4gYHlgIGFuZCBgdWAgbG9jYWxpemVycyBhcmUgQi5DLiB5ZWFyczpcbiAgLy8gfCBZZWFyIHwgYHlgIHwgYHVgIHxcbiAgLy8gfC0tLS0tLXwtLS0tLXwtLS0tLXxcbiAgLy8gfCBBQyAxIHwgICAxIHwgICAxIHxcbiAgLy8gfCBCQyAxIHwgICAxIHwgICAwIHxcbiAgLy8gfCBCQyAyIHwgICAyIHwgIC0xIHxcbiAgLy8gQWxzbyBgeXlgIGFsd2F5cyByZXR1cm5zIHRoZSBsYXN0IHR3byBkaWdpdHMgb2YgYSB5ZWFyLFxuICAvLyB3aGlsZSBgdXVgIHBhZHMgc2luZ2xlIGRpZ2l0IHllYXJzIHRvIDIgY2hhcmFjdGVycyBhbmQgcmV0dXJucyBvdGhlciB5ZWFycyB1bmNoYW5nZWQuXG4gIHU6IGZ1bmN0aW9uIHUoZGF0ZSwgdG9rZW4pIHtcbiAgICB2YXIgeWVhciA9IGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHllYXIsIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIFF1YXJ0ZXJcbiAgUTogZnVuY3Rpb24gUShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgcXVhcnRlciA9IE1hdGguY2VpbCgoZGF0ZS5nZXRVVENNb250aCgpICsgMSkgLyAzKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIDEsIDIsIDMsIDRcbiAgICAgIGNhc2UgJ1EnOlxuICAgICAgICByZXR1cm4gU3RyaW5nKHF1YXJ0ZXIpO1xuICAgICAgLy8gMDEsIDAyLCAwMywgMDRcblxuICAgICAgY2FzZSAnUVEnOlxuICAgICAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHF1YXJ0ZXIsIDIpO1xuICAgICAgLy8gMXN0LCAybmQsIDNyZCwgNHRoXG5cbiAgICAgIGNhc2UgJ1FvJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIocXVhcnRlciwge1xuICAgICAgICAgIHVuaXQ6ICdxdWFydGVyJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFExLCBRMiwgUTMsIFE0XG5cbiAgICAgIGNhc2UgJ1FRUSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5xdWFydGVyKHF1YXJ0ZXIsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyAxLCAyLCAzLCA0IChuYXJyb3cgcXVhcnRlcjsgY291bGQgYmUgbm90IG51bWVyaWNhbClcblxuICAgICAgY2FzZSAnUVFRUVEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUucXVhcnRlcihxdWFydGVyLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIDFzdCBxdWFydGVyLCAybmQgcXVhcnRlciwgLi4uXG5cbiAgICAgIGNhc2UgJ1FRUVEnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLnF1YXJ0ZXIocXVhcnRlciwge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gU3RhbmQtYWxvbmUgcXVhcnRlclxuICBxOiBmdW5jdGlvbiBxKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBxdWFydGVyID0gTWF0aC5jZWlsKChkYXRlLmdldFVUQ01vbnRoKCkgKyAxKSAvIDMpO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gMSwgMiwgMywgNFxuICAgICAgY2FzZSAncSc6XG4gICAgICAgIHJldHVybiBTdHJpbmcocXVhcnRlcik7XG4gICAgICAvLyAwMSwgMDIsIDAzLCAwNFxuXG4gICAgICBjYXNlICdxcSc6XG4gICAgICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MocXVhcnRlciwgMik7XG4gICAgICAvLyAxc3QsIDJuZCwgM3JkLCA0dGhcblxuICAgICAgY2FzZSAncW8nOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihxdWFydGVyLCB7XG4gICAgICAgICAgdW5pdDogJ3F1YXJ0ZXInXG4gICAgICAgIH0pO1xuICAgICAgLy8gUTEsIFEyLCBRMywgUTRcblxuICAgICAgY2FzZSAncXFxJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLnF1YXJ0ZXIocXVhcnRlciwge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIDEsIDIsIDMsIDQgKG5hcnJvdyBxdWFydGVyOyBjb3VsZCBiZSBub3QgbnVtZXJpY2FsKVxuXG4gICAgICBjYXNlICdxcXFxcSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5xdWFydGVyKHF1YXJ0ZXIsIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gMXN0IHF1YXJ0ZXIsIDJuZCBxdWFydGVyLCAuLi5cblxuICAgICAgY2FzZSAncXFxcSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUucXVhcnRlcihxdWFydGVyLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBNb250aFxuICBNOiBmdW5jdGlvbiBNKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBtb250aCA9IGRhdGUuZ2V0VVRDTW9udGgoKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIGNhc2UgJ00nOlxuICAgICAgY2FzZSAnTU0nOlxuICAgICAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLk0oZGF0ZSwgdG9rZW4pO1xuICAgICAgLy8gMXN0LCAybmQsIC4uLiwgMTJ0aFxuXG4gICAgICBjYXNlICdNbyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKG1vbnRoICsgMSwge1xuICAgICAgICAgIHVuaXQ6ICdtb250aCdcbiAgICAgICAgfSk7XG4gICAgICAvLyBKYW4sIEZlYiwgLi4uLCBEZWNcblxuICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gSiwgRiwgLi4uLCBEXG5cbiAgICAgIGNhc2UgJ01NTU1NJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIEphbnVhcnksIEZlYnJ1YXJ5LCAuLi4sIERlY2VtYmVyXG5cbiAgICAgIGNhc2UgJ01NTU0nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBTdGFuZC1hbG9uZSBtb250aFxuICBMOiBmdW5jdGlvbiBMKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBtb250aCA9IGRhdGUuZ2V0VVRDTW9udGgoKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIDEsIDIsIC4uLiwgMTJcbiAgICAgIGNhc2UgJ0wnOlxuICAgICAgICByZXR1cm4gU3RyaW5nKG1vbnRoICsgMSk7XG4gICAgICAvLyAwMSwgMDIsIC4uLiwgMTJcblxuICAgICAgY2FzZSAnTEwnOlxuICAgICAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKG1vbnRoICsgMSwgMik7XG4gICAgICAvLyAxc3QsIDJuZCwgLi4uLCAxMnRoXG5cbiAgICAgIGNhc2UgJ0xvJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIobW9udGggKyAxLCB7XG4gICAgICAgICAgdW5pdDogJ21vbnRoJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIEphbiwgRmViLCAuLi4sIERlY1xuXG4gICAgICBjYXNlICdMTEwnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUubW9udGgobW9udGgsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgICAvLyBKLCBGLCAuLi4sIERcblxuICAgICAgY2FzZSAnTExMTEwnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUubW9udGgobW9udGgsIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gSmFudWFyeSwgRmVicnVhcnksIC4uLiwgRGVjZW1iZXJcblxuICAgICAgY2FzZSAnTExMTCc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUubW9udGgobW9udGgsIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIExvY2FsIHdlZWsgb2YgeWVhclxuICB3OiBmdW5jdGlvbiB3KGRhdGUsIHRva2VuLCBsb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciB3ZWVrID0gZ2V0VVRDV2VlayhkYXRlLCBvcHRpb25zKTtcblxuICAgIGlmICh0b2tlbiA9PT0gJ3dvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIod2Vlaywge1xuICAgICAgICB1bml0OiAnd2VlaydcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3Mod2VlaywgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gSVNPIHdlZWsgb2YgeWVhclxuICBJOiBmdW5jdGlvbiBJKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBpc29XZWVrID0gZ2V0VVRDSVNPV2VlayhkYXRlKTtcblxuICAgIGlmICh0b2tlbiA9PT0gJ0lvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoaXNvV2Vlaywge1xuICAgICAgICB1bml0OiAnd2VlaydcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoaXNvV2VlaywgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gRGF5IG9mIHRoZSBtb250aFxuICBkOiBmdW5jdGlvbiBkKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIGlmICh0b2tlbiA9PT0gJ2RvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoZGF0ZS5nZXRVVENEYXRlKCksIHtcbiAgICAgICAgdW5pdDogJ2RhdGUnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLmQoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBEYXkgb2YgeWVhclxuICBEOiBmdW5jdGlvbiBEKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBkYXlPZlllYXIgPSBnZXRVVENEYXlPZlllYXIoZGF0ZSk7XG5cbiAgICBpZiAodG9rZW4gPT09ICdEbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGRheU9mWWVhciwge1xuICAgICAgICB1bml0OiAnZGF5T2ZZZWFyJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXlPZlllYXIsIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIERheSBvZiB3ZWVrXG4gIEU6IGZ1bmN0aW9uIEUoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgdmFyIGRheU9mV2VlayA9IGRhdGUuZ2V0VVRDRGF5KCk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBUdWVcbiAgICAgIGNhc2UgJ0UnOlxuICAgICAgY2FzZSAnRUUnOlxuICAgICAgY2FzZSAnRUVFJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUXG5cbiAgICAgIGNhc2UgJ0VFRUVFJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVcblxuICAgICAgY2FzZSAnRUVFRUVFJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3Nob3J0JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdWVzZGF5XG5cbiAgICAgIGNhc2UgJ0VFRUUnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIExvY2FsIGRheSBvZiB3ZWVrXG4gIGU6IGZ1bmN0aW9uIGUoZGF0ZSwgdG9rZW4sIGxvY2FsaXplLCBvcHRpb25zKSB7XG4gICAgdmFyIGRheU9mV2VlayA9IGRhdGUuZ2V0VVRDRGF5KCk7XG4gICAgdmFyIGxvY2FsRGF5T2ZXZWVrID0gKGRheU9mV2VlayAtIG9wdGlvbnMud2Vla1N0YXJ0c09uICsgOCkgJSA3IHx8IDc7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBOdW1lcmljYWwgdmFsdWUgKE50aCBkYXkgb2Ygd2VlayB3aXRoIGN1cnJlbnQgbG9jYWxlIG9yIHdlZWtTdGFydHNPbilcbiAgICAgIGNhc2UgJ2UnOlxuICAgICAgICByZXR1cm4gU3RyaW5nKGxvY2FsRGF5T2ZXZWVrKTtcbiAgICAgIC8vIFBhZGRlZCBudW1lcmljYWwgdmFsdWVcblxuICAgICAgY2FzZSAnZWUnOlxuICAgICAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGxvY2FsRGF5T2ZXZWVrLCAyKTtcbiAgICAgIC8vIDFzdCwgMm5kLCAuLi4sIDd0aFxuXG4gICAgICBjYXNlICdlbyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGxvY2FsRGF5T2ZXZWVrLCB7XG4gICAgICAgICAgdW5pdDogJ2RheSdcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2VlZSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVFxuXG4gICAgICBjYXNlICdlZWVlZSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1XG5cbiAgICAgIGNhc2UgJ2VlZWVlZSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdzaG9ydCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVlc2RheVxuXG4gICAgICBjYXNlICdlZWVlJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBTdGFuZC1hbG9uZSBsb2NhbCBkYXkgb2Ygd2Vla1xuICBjOiBmdW5jdGlvbiBjKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBkYXlPZldlZWsgPSBkYXRlLmdldFVUQ0RheSgpO1xuICAgIHZhciBsb2NhbERheU9mV2VlayA9IChkYXlPZldlZWsgLSBvcHRpb25zLndlZWtTdGFydHNPbiArIDgpICUgNyB8fCA3O1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gTnVtZXJpY2FsIHZhbHVlIChzYW1lIGFzIGluIGBlYClcbiAgICAgIGNhc2UgJ2MnOlxuICAgICAgICByZXR1cm4gU3RyaW5nKGxvY2FsRGF5T2ZXZWVrKTtcbiAgICAgIC8vIFBhZGRlZCBudW1lcmljYWwgdmFsdWVcblxuICAgICAgY2FzZSAnY2MnOlxuICAgICAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGxvY2FsRGF5T2ZXZWVrLCB0b2tlbi5sZW5ndGgpO1xuICAgICAgLy8gMXN0LCAybmQsIC4uLiwgN3RoXG5cbiAgICAgIGNhc2UgJ2NvJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIobG9jYWxEYXlPZldlZWssIHtcbiAgICAgICAgICB1bml0OiAnZGF5J1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnY2NjJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgICAvLyBUXG5cbiAgICAgIGNhc2UgJ2NjY2NjJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVcblxuICAgICAgY2FzZSAnY2NjY2NjJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3Nob3J0JyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdWVzZGF5XG5cbiAgICAgIGNhc2UgJ2NjY2MnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIElTTyBkYXkgb2Ygd2Vla1xuICBpOiBmdW5jdGlvbiBpKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBkYXlPZldlZWsgPSBkYXRlLmdldFVUQ0RheSgpO1xuICAgIHZhciBpc29EYXlPZldlZWsgPSBkYXlPZldlZWsgPT09IDAgPyA3IDogZGF5T2ZXZWVrO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gMlxuICAgICAgY2FzZSAnaSc6XG4gICAgICAgIHJldHVybiBTdHJpbmcoaXNvRGF5T2ZXZWVrKTtcbiAgICAgIC8vIDAyXG5cbiAgICAgIGNhc2UgJ2lpJzpcbiAgICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhpc29EYXlPZldlZWssIHRva2VuLmxlbmd0aCk7XG4gICAgICAvLyAybmRcblxuICAgICAgY2FzZSAnaW8nOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihpc29EYXlPZldlZWssIHtcbiAgICAgICAgICB1bml0OiAnZGF5J1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1ZVxuXG4gICAgICBjYXNlICdpaWknOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFRcblxuICAgICAgY2FzZSAnaWlpaWknOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdVxuXG4gICAgICBjYXNlICdpaWlpaWknOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnc2hvcnQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1ZXNkYXlcblxuICAgICAgY2FzZSAnaWlpaSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gQU0gb3IgUE1cbiAgYTogZnVuY3Rpb24gYShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgdmFyIGRheVBlcmlvZEVudW1WYWx1ZSA9IGhvdXJzIC8gMTIgPj0gMSA/ICdwbScgOiAnYW0nO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgY2FzZSAnYSc6XG4gICAgICBjYXNlICdhYSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdhYWEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICBjYXNlICdhYWFhYSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnYWFhYSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gQU0sIFBNLCBtaWRuaWdodCwgbm9vblxuICBiOiBmdW5jdGlvbiBiKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgICB2YXIgZGF5UGVyaW9kRW51bVZhbHVlO1xuXG4gICAgaWYgKGhvdXJzID09PSAxMikge1xuICAgICAgZGF5UGVyaW9kRW51bVZhbHVlID0gZGF5UGVyaW9kRW51bS5ub29uO1xuICAgIH0gZWxzZSBpZiAoaG91cnMgPT09IDApIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGRheVBlcmlvZEVudW0ubWlkbmlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGhvdXJzIC8gMTIgPj0gMSA/ICdwbScgOiAnYW0nO1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIGNhc2UgJ2InOlxuICAgICAgY2FzZSAnYmInOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnYmJiJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgY2FzZSAnYmJiYmInOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2JiYmInOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIGluIHRoZSBtb3JuaW5nLCBpbiB0aGUgYWZ0ZXJub29uLCBpbiB0aGUgZXZlbmluZywgYXQgbmlnaHRcbiAgQjogZnVuY3Rpb24gQihkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgdmFyIGRheVBlcmlvZEVudW1WYWx1ZTtcblxuICAgIGlmIChob3VycyA+PSAxNykge1xuICAgICAgZGF5UGVyaW9kRW51bVZhbHVlID0gZGF5UGVyaW9kRW51bS5ldmVuaW5nO1xuICAgIH0gZWxzZSBpZiAoaG91cnMgPj0gMTIpIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGRheVBlcmlvZEVudW0uYWZ0ZXJub29uO1xuICAgIH0gZWxzZSBpZiAoaG91cnMgPj0gNCkge1xuICAgICAgZGF5UGVyaW9kRW51bVZhbHVlID0gZGF5UGVyaW9kRW51bS5tb3JuaW5nO1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXlQZXJpb2RFbnVtVmFsdWUgPSBkYXlQZXJpb2RFbnVtLm5pZ2h0O1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIGNhc2UgJ0InOlxuICAgICAgY2FzZSAnQkInOlxuICAgICAgY2FzZSAnQkJCJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ0JCQkJCJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdCQkJCJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBIb3VyIFsxLTEyXVxuICBoOiBmdW5jdGlvbiBoKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIGlmICh0b2tlbiA9PT0gJ2hvJykge1xuICAgICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpICUgMTI7XG4gICAgICBpZiAoaG91cnMgPT09IDApIGhvdXJzID0gMTI7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihob3Vycywge1xuICAgICAgICB1bml0OiAnaG91cidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBsaWdodEZvcm1hdHRlcnMuaChkYXRlLCB0b2tlbik7XG4gIH0sXG4gIC8vIEhvdXIgWzAtMjNdXG4gIEg6IGZ1bmN0aW9uIEgoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgaWYgKHRva2VuID09PSAnSG8nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihkYXRlLmdldFVUQ0hvdXJzKCksIHtcbiAgICAgICAgdW5pdDogJ2hvdXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLkgoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBIb3VyIFswLTExXVxuICBLOiBmdW5jdGlvbiBLKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKSAlIDEyO1xuXG4gICAgaWYgKHRva2VuID09PSAnS28nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihob3Vycywge1xuICAgICAgICB1bml0OiAnaG91cidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoaG91cnMsIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIEhvdXIgWzEtMjRdXG4gIGs6IGZ1bmN0aW9uIGsoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIGlmIChob3VycyA9PT0gMCkgaG91cnMgPSAyNDtcblxuICAgIGlmICh0b2tlbiA9PT0gJ2tvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoaG91cnMsIHtcbiAgICAgICAgdW5pdDogJ2hvdXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGhvdXJzLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBNaW51dGVcbiAgbTogZnVuY3Rpb24gbShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICBpZiAodG9rZW4gPT09ICdtbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGRhdGUuZ2V0VVRDTWludXRlcygpLCB7XG4gICAgICAgIHVuaXQ6ICdtaW51dGUnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLm0oZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBTZWNvbmRcbiAgczogZnVuY3Rpb24gcyhkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICBpZiAodG9rZW4gPT09ICdzbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGRhdGUuZ2V0VVRDU2Vjb25kcygpLCB7XG4gICAgICAgIHVuaXQ6ICdzZWNvbmQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLnMoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBGcmFjdGlvbiBvZiBzZWNvbmRcbiAgUzogZnVuY3Rpb24gUyhkYXRlLCB0b2tlbikge1xuICAgIHJldHVybiBsaWdodEZvcm1hdHRlcnMuUyhkYXRlLCB0b2tlbik7XG4gIH0sXG4gIC8vIFRpbWV6b25lIChJU08tODYwMS4gSWYgb2Zmc2V0IGlzIDAsIG91dHB1dCBpcyBhbHdheXMgYCdaJ2ApXG4gIFg6IGZ1bmN0aW9uIFgoZGF0ZSwgdG9rZW4sIF9sb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBvcmlnaW5hbERhdGUgPSBvcHRpb25zLl9vcmlnaW5hbERhdGUgfHwgZGF0ZTtcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSBvcmlnaW5hbERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblxuICAgIGlmICh0aW1lem9uZU9mZnNldCA9PT0gMCkge1xuICAgICAgcmV0dXJuICdaJztcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBIb3VycyBhbmQgb3B0aW9uYWwgbWludXRlc1xuICAgICAgY2FzZSAnWCc6XG4gICAgICAgIHJldHVybiBmb3JtYXRUaW1lem9uZVdpdGhPcHRpb25hbE1pbnV0ZXModGltZXpvbmVPZmZzZXQpO1xuICAgICAgLy8gSG91cnMsIG1pbnV0ZXMgYW5kIG9wdGlvbmFsIHNlY29uZHMgd2l0aG91dCBgOmAgZGVsaW1pdGVyXG4gICAgICAvLyBOb3RlOiBuZWl0aGVyIElTTy04NjAxIG5vciBKYXZhU2NyaXB0IHN1cHBvcnRzIHNlY29uZHMgaW4gdGltZXpvbmUgb2Zmc2V0c1xuICAgICAgLy8gc28gdGhpcyB0b2tlbiBhbHdheXMgaGFzIHRoZSBzYW1lIG91dHB1dCBhcyBgWFhgXG5cbiAgICAgIGNhc2UgJ1hYWFgnOlxuICAgICAgY2FzZSAnWFgnOlxuICAgICAgICAvLyBIb3VycyBhbmQgbWludXRlcyB3aXRob3V0IGA6YCBkZWxpbWl0ZXJcbiAgICAgICAgcmV0dXJuIGZvcm1hdFRpbWV6b25lKHRpbWV6b25lT2Zmc2V0KTtcbiAgICAgIC8vIEhvdXJzLCBtaW51dGVzIGFuZCBvcHRpb25hbCBzZWNvbmRzIHdpdGggYDpgIGRlbGltaXRlclxuICAgICAgLy8gTm90ZTogbmVpdGhlciBJU08tODYwMSBub3IgSmF2YVNjcmlwdCBzdXBwb3J0cyBzZWNvbmRzIGluIHRpbWV6b25lIG9mZnNldHNcbiAgICAgIC8vIHNvIHRoaXMgdG9rZW4gYWx3YXlzIGhhcyB0aGUgc2FtZSBvdXRwdXQgYXMgYFhYWGBcblxuICAgICAgY2FzZSAnWFhYWFgnOlxuICAgICAgY2FzZSAnWFhYJzogLy8gSG91cnMgYW5kIG1pbnV0ZXMgd2l0aCBgOmAgZGVsaW1pdGVyXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmb3JtYXRUaW1lem9uZSh0aW1lem9uZU9mZnNldCwgJzonKTtcbiAgICB9XG4gIH0sXG4gIC8vIFRpbWV6b25lIChJU08tODYwMS4gSWYgb2Zmc2V0IGlzIDAsIG91dHB1dCBpcyBgJyswMDowMCdgIG9yIGVxdWl2YWxlbnQpXG4gIHg6IGZ1bmN0aW9uIHgoZGF0ZSwgdG9rZW4sIF9sb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBvcmlnaW5hbERhdGUgPSBvcHRpb25zLl9vcmlnaW5hbERhdGUgfHwgZGF0ZTtcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSBvcmlnaW5hbERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIEhvdXJzIGFuZCBvcHRpb25hbCBtaW51dGVzXG4gICAgICBjYXNlICd4JzpcbiAgICAgICAgcmV0dXJuIGZvcm1hdFRpbWV6b25lV2l0aE9wdGlvbmFsTWludXRlcyh0aW1lem9uZU9mZnNldCk7XG4gICAgICAvLyBIb3VycywgbWludXRlcyBhbmQgb3B0aW9uYWwgc2Vjb25kcyB3aXRob3V0IGA6YCBkZWxpbWl0ZXJcbiAgICAgIC8vIE5vdGU6IG5laXRoZXIgSVNPLTg2MDEgbm9yIEphdmFTY3JpcHQgc3VwcG9ydHMgc2Vjb25kcyBpbiB0aW1lem9uZSBvZmZzZXRzXG4gICAgICAvLyBzbyB0aGlzIHRva2VuIGFsd2F5cyBoYXMgdGhlIHNhbWUgb3V0cHV0IGFzIGB4eGBcblxuICAgICAgY2FzZSAneHh4eCc6XG4gICAgICBjYXNlICd4eCc6XG4gICAgICAgIC8vIEhvdXJzIGFuZCBtaW51dGVzIHdpdGhvdXQgYDpgIGRlbGltaXRlclxuICAgICAgICByZXR1cm4gZm9ybWF0VGltZXpvbmUodGltZXpvbmVPZmZzZXQpO1xuICAgICAgLy8gSG91cnMsIG1pbnV0ZXMgYW5kIG9wdGlvbmFsIHNlY29uZHMgd2l0aCBgOmAgZGVsaW1pdGVyXG4gICAgICAvLyBOb3RlOiBuZWl0aGVyIElTTy04NjAxIG5vciBKYXZhU2NyaXB0IHN1cHBvcnRzIHNlY29uZHMgaW4gdGltZXpvbmUgb2Zmc2V0c1xuICAgICAgLy8gc28gdGhpcyB0b2tlbiBhbHdheXMgaGFzIHRoZSBzYW1lIG91dHB1dCBhcyBgeHh4YFxuXG4gICAgICBjYXNlICd4eHh4eCc6XG4gICAgICBjYXNlICd4eHgnOiAvLyBIb3VycyBhbmQgbWludXRlcyB3aXRoIGA6YCBkZWxpbWl0ZXJcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZvcm1hdFRpbWV6b25lKHRpbWV6b25lT2Zmc2V0LCAnOicpO1xuICAgIH1cbiAgfSxcbiAgLy8gVGltZXpvbmUgKEdNVClcbiAgTzogZnVuY3Rpb24gTyhkYXRlLCB0b2tlbiwgX2xvY2FsaXplLCBvcHRpb25zKSB7XG4gICAgdmFyIG9yaWdpbmFsRGF0ZSA9IG9wdGlvbnMuX29yaWdpbmFsRGF0ZSB8fCBkYXRlO1xuICAgIHZhciB0aW1lem9uZU9mZnNldCA9IG9yaWdpbmFsRGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gU2hvcnRcbiAgICAgIGNhc2UgJ08nOlxuICAgICAgY2FzZSAnT08nOlxuICAgICAgY2FzZSAnT09PJzpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgZm9ybWF0VGltZXpvbmVTaG9ydCh0aW1lem9uZU9mZnNldCwgJzonKTtcbiAgICAgIC8vIExvbmdcblxuICAgICAgY2FzZSAnT09PTyc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyBmb3JtYXRUaW1lem9uZSh0aW1lem9uZU9mZnNldCwgJzonKTtcbiAgICB9XG4gIH0sXG4gIC8vIFRpbWV6b25lIChzcGVjaWZpYyBub24tbG9jYXRpb24pXG4gIHo6IGZ1bmN0aW9uIHooZGF0ZSwgdG9rZW4sIF9sb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBvcmlnaW5hbERhdGUgPSBvcHRpb25zLl9vcmlnaW5hbERhdGUgfHwgZGF0ZTtcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSBvcmlnaW5hbERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIFNob3J0XG4gICAgICBjYXNlICd6JzpcbiAgICAgIGNhc2UgJ3p6JzpcbiAgICAgIGNhc2UgJ3p6eic6XG4gICAgICAgIHJldHVybiAnR01UJyArIGZvcm1hdFRpbWV6b25lU2hvcnQodGltZXpvbmVPZmZzZXQsICc6Jyk7XG4gICAgICAvLyBMb25nXG5cbiAgICAgIGNhc2UgJ3p6enonOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgZm9ybWF0VGltZXpvbmUodGltZXpvbmVPZmZzZXQsICc6Jyk7XG4gICAgfVxuICB9LFxuICAvLyBTZWNvbmRzIHRpbWVzdGFtcFxuICB0OiBmdW5jdGlvbiB0KGRhdGUsIHRva2VuLCBfbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3JpZ2luYWxEYXRlID0gb3B0aW9ucy5fb3JpZ2luYWxEYXRlIHx8IGRhdGU7XG4gICAgdmFyIHRpbWVzdGFtcCA9IE1hdGguZmxvb3Iob3JpZ2luYWxEYXRlLmdldFRpbWUoKSAvIDEwMDApO1xuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3ModGltZXN0YW1wLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBNaWxsaXNlY29uZHMgdGltZXN0YW1wXG4gIFQ6IGZ1bmN0aW9uIFQoZGF0ZSwgdG9rZW4sIF9sb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBvcmlnaW5hbERhdGUgPSBvcHRpb25zLl9vcmlnaW5hbERhdGUgfHwgZGF0ZTtcbiAgICB2YXIgdGltZXN0YW1wID0gb3JpZ2luYWxEYXRlLmdldFRpbWUoKTtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHRpbWVzdGFtcCwgdG9rZW4ubGVuZ3RoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZm9ybWF0VGltZXpvbmVTaG9ydChvZmZzZXQsIGRpcnR5RGVsaW1pdGVyKSB7XG4gIHZhciBzaWduID0gb2Zmc2V0ID4gMCA/ICctJyA6ICcrJztcbiAgdmFyIGFic09mZnNldCA9IE1hdGguYWJzKG9mZnNldCk7XG4gIHZhciBob3VycyA9IE1hdGguZmxvb3IoYWJzT2Zmc2V0IC8gNjApO1xuICB2YXIgbWludXRlcyA9IGFic09mZnNldCAlIDYwO1xuXG4gIGlmIChtaW51dGVzID09PSAwKSB7XG4gICAgcmV0dXJuIHNpZ24gKyBTdHJpbmcoaG91cnMpO1xuICB9XG5cbiAgdmFyIGRlbGltaXRlciA9IGRpcnR5RGVsaW1pdGVyIHx8ICcnO1xuICByZXR1cm4gc2lnbiArIFN0cmluZyhob3VycykgKyBkZWxpbWl0ZXIgKyBhZGRMZWFkaW5nWmVyb3MobWludXRlcywgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFRpbWV6b25lV2l0aE9wdGlvbmFsTWludXRlcyhvZmZzZXQsIGRpcnR5RGVsaW1pdGVyKSB7XG4gIGlmIChvZmZzZXQgJSA2MCA9PT0gMCkge1xuICAgIHZhciBzaWduID0gb2Zmc2V0ID4gMCA/ICctJyA6ICcrJztcbiAgICByZXR1cm4gc2lnbiArIGFkZExlYWRpbmdaZXJvcyhNYXRoLmFicyhvZmZzZXQpIC8gNjAsIDIpO1xuICB9XG5cbiAgcmV0dXJuIGZvcm1hdFRpbWV6b25lKG9mZnNldCwgZGlydHlEZWxpbWl0ZXIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRUaW1lem9uZShvZmZzZXQsIGRpcnR5RGVsaW1pdGVyKSB7XG4gIHZhciBkZWxpbWl0ZXIgPSBkaXJ0eURlbGltaXRlciB8fCAnJztcbiAgdmFyIHNpZ24gPSBvZmZzZXQgPiAwID8gJy0nIDogJysnO1xuICB2YXIgYWJzT2Zmc2V0ID0gTWF0aC5hYnMob2Zmc2V0KTtcbiAgdmFyIGhvdXJzID0gYWRkTGVhZGluZ1plcm9zKE1hdGguZmxvb3IoYWJzT2Zmc2V0IC8gNjApLCAyKTtcbiAgdmFyIG1pbnV0ZXMgPSBhZGRMZWFkaW5nWmVyb3MoYWJzT2Zmc2V0ICUgNjAsIDIpO1xuICByZXR1cm4gc2lnbiArIGhvdXJzICsgZGVsaW1pdGVyICsgbWludXRlcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZm9ybWF0dGVyczsiLCJpbXBvcnQgYWRkTGVhZGluZ1plcm9zIGZyb20gXCIuLi8uLi9hZGRMZWFkaW5nWmVyb3MvaW5kZXguanNcIjtcbi8qXG4gKiB8ICAgICB8IFVuaXQgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICB8IFVuaXQgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8LS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiB8ICBhICB8IEFNLCBQTSAgICAgICAgICAgICAgICAgICAgICAgICB8ICBBKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBkICB8IERheSBvZiBtb250aCAgICAgICAgICAgICAgICAgICB8ICBEICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBoICB8IEhvdXIgWzEtMTJdICAgICAgICAgICAgICAgICAgICB8ICBIICB8IEhvdXIgWzAtMjNdICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBtICB8IE1pbnV0ZSAgICAgICAgICAgICAgICAgICAgICAgICB8ICBNICB8IE1vbnRoICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8ICBzICB8IFNlY29uZCAgICAgICAgICAgICAgICAgICAgICAgICB8ICBTICB8IEZyYWN0aW9uIG9mIHNlY29uZCAgICAgICAgICAgICB8XG4gKiB8ICB5ICB8IFllYXIgKGFicykgICAgICAgICAgICAgICAgICAgICB8ICBZICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICogTGV0dGVycyBtYXJrZWQgYnkgKiBhcmUgbm90IGltcGxlbWVudGVkIGJ1dCByZXNlcnZlZCBieSBVbmljb2RlIHN0YW5kYXJkLlxuICovXG5cbnZhciBmb3JtYXR0ZXJzID0ge1xuICAvLyBZZWFyXG4gIHk6IGZ1bmN0aW9uIHkoZGF0ZSwgdG9rZW4pIHtcbiAgICAvLyBGcm9tIGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtMzEvdHIzNS1kYXRlcy5odG1sI0RhdGVfRm9ybWF0X3Rva2Vuc1xuICAgIC8vIHwgWWVhciAgICAgfCAgICAgeSB8IHl5IHwgICB5eXkgfCAgeXl5eSB8IHl5eXl5IHxcbiAgICAvLyB8LS0tLS0tLS0tLXwtLS0tLS0tfC0tLS18LS0tLS0tLXwtLS0tLS0tfC0tLS0tLS18XG4gICAgLy8gfCBBRCAxICAgICB8ICAgICAxIHwgMDEgfCAgIDAwMSB8ICAwMDAxIHwgMDAwMDEgfFxuICAgIC8vIHwgQUQgMTIgICAgfCAgICAxMiB8IDEyIHwgICAwMTIgfCAgMDAxMiB8IDAwMDEyIHxcbiAgICAvLyB8IEFEIDEyMyAgIHwgICAxMjMgfCAyMyB8ICAgMTIzIHwgIDAxMjMgfCAwMDEyMyB8XG4gICAgLy8gfCBBRCAxMjM0ICB8ICAxMjM0IHwgMzQgfCAgMTIzNCB8ICAxMjM0IHwgMDEyMzQgfFxuICAgIC8vIHwgQUQgMTIzNDUgfCAxMjM0NSB8IDQ1IHwgMTIzNDUgfCAxMjM0NSB8IDEyMzQ1IHxcbiAgICB2YXIgc2lnbmVkWWVhciA9IGRhdGUuZ2V0VVRDRnVsbFllYXIoKTsgLy8gUmV0dXJucyAxIGZvciAxIEJDICh3aGljaCBpcyB5ZWFyIDAgaW4gSmF2YVNjcmlwdClcblxuICAgIHZhciB5ZWFyID0gc2lnbmVkWWVhciA+IDAgPyBzaWduZWRZZWFyIDogMSAtIHNpZ25lZFllYXI7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyh0b2tlbiA9PT0gJ3l5JyA/IHllYXIgJSAxMDAgOiB5ZWFyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBNb250aFxuICBNOiBmdW5jdGlvbiBNKGRhdGUsIHRva2VuKSB7XG4gICAgdmFyIG1vbnRoID0gZGF0ZS5nZXRVVENNb250aCgpO1xuICAgIHJldHVybiB0b2tlbiA9PT0gJ00nID8gU3RyaW5nKG1vbnRoICsgMSkgOiBhZGRMZWFkaW5nWmVyb3MobW9udGggKyAxLCAyKTtcbiAgfSxcbiAgLy8gRGF5IG9mIHRoZSBtb250aFxuICBkOiBmdW5jdGlvbiBkKGRhdGUsIHRva2VuKSB7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXRlLmdldFVUQ0RhdGUoKSwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gQU0gb3IgUE1cbiAgYTogZnVuY3Rpb24gYShkYXRlLCB0b2tlbikge1xuICAgIHZhciBkYXlQZXJpb2RFbnVtVmFsdWUgPSBkYXRlLmdldFVUQ0hvdXJzKCkgLyAxMiA+PSAxID8gJ3BtJyA6ICdhbSc7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlICdhJzpcbiAgICAgIGNhc2UgJ2FhJzpcbiAgICAgICAgcmV0dXJuIGRheVBlcmlvZEVudW1WYWx1ZS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICBjYXNlICdhYWEnOlxuICAgICAgICByZXR1cm4gZGF5UGVyaW9kRW51bVZhbHVlO1xuXG4gICAgICBjYXNlICdhYWFhYSc6XG4gICAgICAgIHJldHVybiBkYXlQZXJpb2RFbnVtVmFsdWVbMF07XG5cbiAgICAgIGNhc2UgJ2FhYWEnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGRheVBlcmlvZEVudW1WYWx1ZSA9PT0gJ2FtJyA/ICdhLm0uJyA6ICdwLm0uJztcbiAgICB9XG4gIH0sXG4gIC8vIEhvdXIgWzEtMTJdXG4gIGg6IGZ1bmN0aW9uIGgoZGF0ZSwgdG9rZW4pIHtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGRhdGUuZ2V0VVRDSG91cnMoKSAlIDEyIHx8IDEyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBIb3VyIFswLTIzXVxuICBIOiBmdW5jdGlvbiBIKGRhdGUsIHRva2VuKSB7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXRlLmdldFVUQ0hvdXJzKCksIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIE1pbnV0ZVxuICBtOiBmdW5jdGlvbiBtKGRhdGUsIHRva2VuKSB7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXRlLmdldFVUQ01pbnV0ZXMoKSwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gU2Vjb25kXG4gIHM6IGZ1bmN0aW9uIHMoZGF0ZSwgdG9rZW4pIHtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGRhdGUuZ2V0VVRDU2Vjb25kcygpLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBGcmFjdGlvbiBvZiBzZWNvbmRcbiAgUzogZnVuY3Rpb24gUyhkYXRlLCB0b2tlbikge1xuICAgIHZhciBudW1iZXJPZkRpZ2l0cyA9IHRva2VuLmxlbmd0aDtcbiAgICB2YXIgbWlsbGlzZWNvbmRzID0gZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKTtcbiAgICB2YXIgZnJhY3Rpb25hbFNlY29uZHMgPSBNYXRoLmZsb29yKG1pbGxpc2Vjb25kcyAqIE1hdGgucG93KDEwLCBudW1iZXJPZkRpZ2l0cyAtIDMpKTtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGZyYWN0aW9uYWxTZWNvbmRzLCB0b2tlbi5sZW5ndGgpO1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgZm9ybWF0dGVyczsiLCJ2YXIgZGF0ZUxvbmdGb3JtYXR0ZXIgPSBmdW5jdGlvbiBkYXRlTG9uZ0Zvcm1hdHRlcihwYXR0ZXJuLCBmb3JtYXRMb25nKSB7XG4gIHN3aXRjaCAocGF0dGVybikge1xuICAgIGNhc2UgJ1AnOlxuICAgICAgcmV0dXJuIGZvcm1hdExvbmcuZGF0ZSh7XG4gICAgICAgIHdpZHRoOiAnc2hvcnQnXG4gICAgICB9KTtcblxuICAgIGNhc2UgJ1BQJzpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLmRhdGUoe1xuICAgICAgICB3aWR0aDogJ21lZGl1bSdcbiAgICAgIH0pO1xuXG4gICAgY2FzZSAnUFBQJzpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLmRhdGUoe1xuICAgICAgICB3aWR0aDogJ2xvbmcnXG4gICAgICB9KTtcblxuICAgIGNhc2UgJ1BQUFAnOlxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZm9ybWF0TG9uZy5kYXRlKHtcbiAgICAgICAgd2lkdGg6ICdmdWxsJ1xuICAgICAgfSk7XG4gIH1cbn07XG5cbnZhciB0aW1lTG9uZ0Zvcm1hdHRlciA9IGZ1bmN0aW9uIHRpbWVMb25nRm9ybWF0dGVyKHBhdHRlcm4sIGZvcm1hdExvbmcpIHtcbiAgc3dpdGNoIChwYXR0ZXJuKSB7XG4gICAgY2FzZSAncCc6XG4gICAgICByZXR1cm4gZm9ybWF0TG9uZy50aW1lKHtcbiAgICAgICAgd2lkdGg6ICdzaG9ydCdcbiAgICAgIH0pO1xuXG4gICAgY2FzZSAncHAnOlxuICAgICAgcmV0dXJuIGZvcm1hdExvbmcudGltZSh7XG4gICAgICAgIHdpZHRoOiAnbWVkaXVtJ1xuICAgICAgfSk7XG5cbiAgICBjYXNlICdwcHAnOlxuICAgICAgcmV0dXJuIGZvcm1hdExvbmcudGltZSh7XG4gICAgICAgIHdpZHRoOiAnbG9uZydcbiAgICAgIH0pO1xuXG4gICAgY2FzZSAncHBwcCc6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLnRpbWUoe1xuICAgICAgICB3aWR0aDogJ2Z1bGwnXG4gICAgICB9KTtcbiAgfVxufTtcblxudmFyIGRhdGVUaW1lTG9uZ0Zvcm1hdHRlciA9IGZ1bmN0aW9uIGRhdGVUaW1lTG9uZ0Zvcm1hdHRlcihwYXR0ZXJuLCBmb3JtYXRMb25nKSB7XG4gIHZhciBtYXRjaFJlc3VsdCA9IHBhdHRlcm4ubWF0Y2goLyhQKykocCspPy8pIHx8IFtdO1xuICB2YXIgZGF0ZVBhdHRlcm4gPSBtYXRjaFJlc3VsdFsxXTtcbiAgdmFyIHRpbWVQYXR0ZXJuID0gbWF0Y2hSZXN1bHRbMl07XG5cbiAgaWYgKCF0aW1lUGF0dGVybikge1xuICAgIHJldHVybiBkYXRlTG9uZ0Zvcm1hdHRlcihwYXR0ZXJuLCBmb3JtYXRMb25nKTtcbiAgfVxuXG4gIHZhciBkYXRlVGltZUZvcm1hdDtcblxuICBzd2l0Y2ggKGRhdGVQYXR0ZXJuKSB7XG4gICAgY2FzZSAnUCc6XG4gICAgICBkYXRlVGltZUZvcm1hdCA9IGZvcm1hdExvbmcuZGF0ZVRpbWUoe1xuICAgICAgICB3aWR0aDogJ3Nob3J0J1xuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ1BQJzpcbiAgICAgIGRhdGVUaW1lRm9ybWF0ID0gZm9ybWF0TG9uZy5kYXRlVGltZSh7XG4gICAgICAgIHdpZHRoOiAnbWVkaXVtJ1xuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ1BQUCc6XG4gICAgICBkYXRlVGltZUZvcm1hdCA9IGZvcm1hdExvbmcuZGF0ZVRpbWUoe1xuICAgICAgICB3aWR0aDogJ2xvbmcnXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnUFBQUCc6XG4gICAgZGVmYXVsdDpcbiAgICAgIGRhdGVUaW1lRm9ybWF0ID0gZm9ybWF0TG9uZy5kYXRlVGltZSh7XG4gICAgICAgIHdpZHRoOiAnZnVsbCdcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gZGF0ZVRpbWVGb3JtYXQucmVwbGFjZSgne3tkYXRlfX0nLCBkYXRlTG9uZ0Zvcm1hdHRlcihkYXRlUGF0dGVybiwgZm9ybWF0TG9uZykpLnJlcGxhY2UoJ3t7dGltZX19JywgdGltZUxvbmdGb3JtYXR0ZXIodGltZVBhdHRlcm4sIGZvcm1hdExvbmcpKTtcbn07XG5cbnZhciBsb25nRm9ybWF0dGVycyA9IHtcbiAgcDogdGltZUxvbmdGb3JtYXR0ZXIsXG4gIFA6IGRhdGVUaW1lTG9uZ0Zvcm1hdHRlclxufTtcbmV4cG9ydCBkZWZhdWx0IGxvbmdGb3JtYXR0ZXJzOyIsIi8qKlxuICogR29vZ2xlIENocm9tZSBhcyBvZiA2Ny4wLjMzOTYuODcgaW50cm9kdWNlZCB0aW1lem9uZXMgd2l0aCBvZmZzZXQgdGhhdCBpbmNsdWRlcyBzZWNvbmRzLlxuICogVGhleSB1c3VhbGx5IGFwcGVhciBmb3IgZGF0ZXMgdGhhdCBkZW5vdGUgdGltZSBiZWZvcmUgdGhlIHRpbWV6b25lcyB3ZXJlIGludHJvZHVjZWRcbiAqIChlLmcuIGZvciAnRXVyb3BlL1ByYWd1ZScgdGltZXpvbmUgdGhlIG9mZnNldCBpcyBHTVQrMDA6NTc6NDQgYmVmb3JlIDEgT2N0b2JlciAxODkxXG4gKiBhbmQgR01UKzAxOjAwOjAwIGFmdGVyIHRoYXQgZGF0ZSlcbiAqXG4gKiBEYXRlI2dldFRpbWV6b25lT2Zmc2V0IHJldHVybnMgdGhlIG9mZnNldCBpbiBtaW51dGVzIGFuZCB3b3VsZCByZXR1cm4gNTcgZm9yIHRoZSBleGFtcGxlIGFib3ZlLFxuICogd2hpY2ggd291bGQgbGVhZCB0byBpbmNvcnJlY3QgY2FsY3VsYXRpb25zLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgdGltZXpvbmUgb2Zmc2V0IGluIG1pbGxpc2Vjb25kcyB0aGF0IHRha2VzIHNlY29uZHMgaW4gYWNjb3VudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VGltZXpvbmVPZmZzZXRJbk1pbGxpc2Vjb25kcyhkYXRlKSB7XG4gIHZhciB1dGNEYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpLCBkYXRlLmdldEhvdXJzKCksIGRhdGUuZ2V0TWludXRlcygpLCBkYXRlLmdldFNlY29uZHMoKSwgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSkpO1xuICB1dGNEYXRlLnNldFVUQ0Z1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gIHJldHVybiBkYXRlLmdldFRpbWUoKSAtIHV0Y0RhdGUuZ2V0VGltZSgpO1xufSIsImltcG9ydCB0b0RhdGUgZnJvbSBcIi4uLy4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG52YXIgTUlMTElTRUNPTkRTX0lOX0RBWSA9IDg2NDAwMDAwO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VVRDRGF5T2ZZZWFyKGRpcnR5RGF0ZSkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGRhdGUgPSB0b0RhdGUoZGlydHlEYXRlKTtcbiAgdmFyIHRpbWVzdGFtcCA9IGRhdGUuZ2V0VGltZSgpO1xuICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB2YXIgc3RhcnRPZlllYXJUaW1lc3RhbXAgPSBkYXRlLmdldFRpbWUoKTtcbiAgdmFyIGRpZmZlcmVuY2UgPSB0aW1lc3RhbXAgLSBzdGFydE9mWWVhclRpbWVzdGFtcDtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZGlmZmVyZW5jZSAvIE1JTExJU0VDT05EU19JTl9EQVkpICsgMTtcbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDSVNPV2VlayBmcm9tIFwiLi4vc3RhcnRPZlVUQ0lTT1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDSVNPV2Vla1llYXIgZnJvbSBcIi4uL3N0YXJ0T2ZVVENJU09XZWVrWWVhci9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG52YXIgTUlMTElTRUNPTkRTX0lOX1dFRUsgPSA2MDQ4MDAwMDA7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRVVENJU09XZWVrKGRpcnR5RGF0ZSkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGRhdGUgPSB0b0RhdGUoZGlydHlEYXRlKTtcbiAgdmFyIGRpZmYgPSBzdGFydE9mVVRDSVNPV2VlayhkYXRlKS5nZXRUaW1lKCkgLSBzdGFydE9mVVRDSVNPV2Vla1llYXIoZGF0ZSkuZ2V0VGltZSgpOyAvLyBSb3VuZCB0aGUgbnVtYmVyIG9mIGRheXMgdG8gdGhlIG5lYXJlc3QgaW50ZWdlclxuICAvLyBiZWNhdXNlIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIGEgd2VlayBpcyBub3QgY29uc3RhbnRcbiAgLy8gKGUuZy4gaXQncyBkaWZmZXJlbnQgaW4gdGhlIHdlZWsgb2YgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIGNsb2NrIHNoaWZ0KVxuXG4gIHJldHVybiBNYXRoLnJvdW5kKGRpZmYgLyBNSUxMSVNFQ09ORFNfSU5fV0VFSykgKyAxO1xufSIsImltcG9ydCB0b0RhdGUgZnJvbSBcIi4uLy4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ0lTT1dlZWsgZnJvbSBcIi4uL3N0YXJ0T2ZVVENJU09XZWVrL2luZGV4LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRVVENJU09XZWVrWWVhcihkaXJ0eURhdGUpIHtcbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciB5ZWFyID0gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xuICB2YXIgZm91cnRoT2ZKYW51YXJ5T2ZOZXh0WWVhciA9IG5ldyBEYXRlKDApO1xuICBmb3VydGhPZkphbnVhcnlPZk5leHRZZWFyLnNldFVUQ0Z1bGxZZWFyKHllYXIgKyAxLCAwLCA0KTtcbiAgZm91cnRoT2ZKYW51YXJ5T2ZOZXh0WWVhci5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIHN0YXJ0T2ZOZXh0WWVhciA9IHN0YXJ0T2ZVVENJU09XZWVrKGZvdXJ0aE9mSmFudWFyeU9mTmV4dFllYXIpO1xuICB2YXIgZm91cnRoT2ZKYW51YXJ5T2ZUaGlzWWVhciA9IG5ldyBEYXRlKDApO1xuICBmb3VydGhPZkphbnVhcnlPZlRoaXNZZWFyLnNldFVUQ0Z1bGxZZWFyKHllYXIsIDAsIDQpO1xuICBmb3VydGhPZkphbnVhcnlPZlRoaXNZZWFyLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB2YXIgc3RhcnRPZlRoaXNZZWFyID0gc3RhcnRPZlVUQ0lTT1dlZWsoZm91cnRoT2ZKYW51YXJ5T2ZUaGlzWWVhcik7XG5cbiAgaWYgKGRhdGUuZ2V0VGltZSgpID49IHN0YXJ0T2ZOZXh0WWVhci5nZXRUaW1lKCkpIHtcbiAgICByZXR1cm4geWVhciArIDE7XG4gIH0gZWxzZSBpZiAoZGF0ZS5nZXRUaW1lKCkgPj0gc3RhcnRPZlRoaXNZZWFyLmdldFRpbWUoKSkge1xuICAgIHJldHVybiB5ZWFyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB5ZWFyIC0gMTtcbiAgfVxufSIsImltcG9ydCB0b0RhdGUgZnJvbSBcIi4uLy4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHN0YXJ0T2ZVVENXZWVrIGZyb20gXCIuLi9zdGFydE9mVVRDV2Vlay9pbmRleC5qc1wiO1xuaW1wb3J0IHN0YXJ0T2ZVVENXZWVrWWVhciBmcm9tIFwiLi4vc3RhcnRPZlVUQ1dlZWtZZWFyL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbnZhciBNSUxMSVNFQ09ORFNfSU5fV0VFSyA9IDYwNDgwMDAwMDtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFVUQ1dlZWsoZGlydHlEYXRlLCBvcHRpb25zKSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgZGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuICB2YXIgZGlmZiA9IHN0YXJ0T2ZVVENXZWVrKGRhdGUsIG9wdGlvbnMpLmdldFRpbWUoKSAtIHN0YXJ0T2ZVVENXZWVrWWVhcihkYXRlLCBvcHRpb25zKS5nZXRUaW1lKCk7IC8vIFJvdW5kIHRoZSBudW1iZXIgb2YgZGF5cyB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyXG4gIC8vIGJlY2F1c2UgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaW4gYSB3ZWVrIGlzIG5vdCBjb25zdGFudFxuICAvLyAoZS5nLiBpdCdzIGRpZmZlcmVudCBpbiB0aGUgd2VlayBvZiB0aGUgZGF5bGlnaHQgc2F2aW5nIHRpbWUgY2xvY2sgc2hpZnQpXG5cbiAgcmV0dXJuIE1hdGgucm91bmQoZGlmZiAvIE1JTExJU0VDT05EU19JTl9XRUVLKSArIDE7XG59IiwiaW1wb3J0IHRvRGF0ZSBmcm9tIFwiLi4vLi4vdG9EYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDV2VlayBmcm9tIFwiLi4vc3RhcnRPZlVUQ1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCB0b0ludGVnZXIgZnJvbSBcIi4uL3RvSW50ZWdlci9pbmRleC5qc1wiO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdE9wdGlvbnMgfSBmcm9tIFwiLi4vZGVmYXVsdE9wdGlvbnMvaW5kZXguanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFVUQ1dlZWtZZWFyKGRpcnR5RGF0ZSwgb3B0aW9ucykge1xuICB2YXIgX3JlZiwgX3JlZjIsIF9yZWYzLCBfb3B0aW9ucyRmaXJzdFdlZWtDb24sIF9vcHRpb25zJGxvY2FsZSwgX29wdGlvbnMkbG9jYWxlJG9wdGlvLCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwsIF9kZWZhdWx0T3B0aW9ucyRsb2NhbDI7XG5cbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciB5ZWFyID0gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSBnZXREZWZhdWx0T3B0aW9ucygpO1xuICB2YXIgZmlyc3RXZWVrQ29udGFpbnNEYXRlID0gdG9JbnRlZ2VyKChfcmVmID0gKF9yZWYyID0gKF9yZWYzID0gKF9vcHRpb25zJGZpcnN0V2Vla0NvbiA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9vcHRpb25zJGZpcnN0V2Vla0NvbiAhPT0gdm9pZCAwID8gX29wdGlvbnMkZmlyc3RXZWVrQ29uIDogb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlID0gb3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9vcHRpb25zJGxvY2FsZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSRvcHRpbyA9IF9vcHRpb25zJGxvY2FsZS5vcHRpb25zKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRpb25zJGxvY2FsZSRvcHRpby5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYzICE9PSB2b2lkIDAgPyBfcmVmMyA6IGRlZmF1bHRPcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZjIgIT09IHZvaWQgMCA/IF9yZWYyIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9IF9kZWZhdWx0T3B0aW9ucyRsb2NhbC5vcHRpb25zKSA9PT0gbnVsbCB8fCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZiAhPT0gdm9pZCAwID8gX3JlZiA6IDEpOyAvLyBUZXN0IGlmIHdlZWtTdGFydHNPbiBpcyBiZXR3ZWVuIDEgYW5kIDcgX2FuZF8gaXMgbm90IE5hTlxuXG4gIGlmICghKGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA+PSAxICYmIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA8PSA3KSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdmaXJzdFdlZWtDb250YWluc0RhdGUgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDcgaW5jbHVzaXZlbHknKTtcbiAgfVxuXG4gIHZhciBmaXJzdFdlZWtPZk5leHRZZWFyID0gbmV3IERhdGUoMCk7XG4gIGZpcnN0V2Vla09mTmV4dFllYXIuc2V0VVRDRnVsbFllYXIoeWVhciArIDEsIDAsIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSk7XG4gIGZpcnN0V2Vla09mTmV4dFllYXIuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIHZhciBzdGFydE9mTmV4dFllYXIgPSBzdGFydE9mVVRDV2VlayhmaXJzdFdlZWtPZk5leHRZZWFyLCBvcHRpb25zKTtcbiAgdmFyIGZpcnN0V2Vla09mVGhpc1llYXIgPSBuZXcgRGF0ZSgwKTtcbiAgZmlyc3RXZWVrT2ZUaGlzWWVhci5zZXRVVENGdWxsWWVhcih5ZWFyLCAwLCBmaXJzdFdlZWtDb250YWluc0RhdGUpO1xuICBmaXJzdFdlZWtPZlRoaXNZZWFyLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB2YXIgc3RhcnRPZlRoaXNZZWFyID0gc3RhcnRPZlVUQ1dlZWsoZmlyc3RXZWVrT2ZUaGlzWWVhciwgb3B0aW9ucyk7XG5cbiAgaWYgKGRhdGUuZ2V0VGltZSgpID49IHN0YXJ0T2ZOZXh0WWVhci5nZXRUaW1lKCkpIHtcbiAgICByZXR1cm4geWVhciArIDE7XG4gIH0gZWxzZSBpZiAoZGF0ZS5nZXRUaW1lKCkgPj0gc3RhcnRPZlRoaXNZZWFyLmdldFRpbWUoKSkge1xuICAgIHJldHVybiB5ZWFyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB5ZWFyIC0gMTtcbiAgfVxufSIsInZhciBwcm90ZWN0ZWREYXlPZlllYXJUb2tlbnMgPSBbJ0QnLCAnREQnXTtcbnZhciBwcm90ZWN0ZWRXZWVrWWVhclRva2VucyA9IFsnWVknLCAnWVlZWSddO1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvdGVjdGVkRGF5T2ZZZWFyVG9rZW4odG9rZW4pIHtcbiAgcmV0dXJuIHByb3RlY3RlZERheU9mWWVhclRva2Vucy5pbmRleE9mKHRva2VuKSAhPT0gLTE7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNQcm90ZWN0ZWRXZWVrWWVhclRva2VuKHRva2VuKSB7XG4gIHJldHVybiBwcm90ZWN0ZWRXZWVrWWVhclRva2Vucy5pbmRleE9mKHRva2VuKSAhPT0gLTE7XG59XG5leHBvcnQgZnVuY3Rpb24gdGhyb3dQcm90ZWN0ZWRFcnJvcih0b2tlbiwgZm9ybWF0LCBpbnB1dCkge1xuICBpZiAodG9rZW4gPT09ICdZWVlZJykge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiVXNlIGB5eXl5YCBpbnN0ZWFkIG9mIGBZWVlZYCAoaW4gYFwiLmNvbmNhdChmb3JtYXQsIFwiYCkgZm9yIGZvcm1hdHRpbmcgeWVhcnMgdG8gdGhlIGlucHV0IGBcIikuY29uY2F0KGlucHV0LCBcImA7IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFwiKSk7XG4gIH0gZWxzZSBpZiAodG9rZW4gPT09ICdZWScpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlVzZSBgeXlgIGluc3RlYWQgb2YgYFlZYCAoaW4gYFwiLmNvbmNhdChmb3JtYXQsIFwiYCkgZm9yIGZvcm1hdHRpbmcgeWVhcnMgdG8gdGhlIGlucHV0IGBcIikuY29uY2F0KGlucHV0LCBcImA7IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFwiKSk7XG4gIH0gZWxzZSBpZiAodG9rZW4gPT09ICdEJykge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiVXNlIGBkYCBpbnN0ZWFkIG9mIGBEYCAoaW4gYFwiLmNvbmNhdChmb3JtYXQsIFwiYCkgZm9yIGZvcm1hdHRpbmcgZGF5cyBvZiB0aGUgbW9udGggdG8gdGhlIGlucHV0IGBcIikuY29uY2F0KGlucHV0LCBcImA7IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFwiKSk7XG4gIH0gZWxzZSBpZiAodG9rZW4gPT09ICdERCcpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlVzZSBgZGRgIGluc3RlYWQgb2YgYEREYCAoaW4gYFwiLmNvbmNhdChmb3JtYXQsIFwiYCkgZm9yIGZvcm1hdHRpbmcgZGF5cyBvZiB0aGUgbW9udGggdG8gdGhlIGlucHV0IGBcIikuY29uY2F0KGlucHV0LCBcImA7IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFwiKSk7XG4gIH1cbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZXF1aXJlZEFyZ3MocmVxdWlyZWQsIGFyZ3MpIHtcbiAgaWYgKGFyZ3MubGVuZ3RoIDwgcmVxdWlyZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHJlcXVpcmVkICsgJyBhcmd1bWVudCcgKyAocmVxdWlyZWQgPiAxID8gJ3MnIDogJycpICsgJyByZXF1aXJlZCwgYnV0IG9ubHkgJyArIGFyZ3MubGVuZ3RoICsgJyBwcmVzZW50Jyk7XG4gIH1cbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnRPZlVUQ0lTT1dlZWsoZGlydHlEYXRlKSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgd2Vla1N0YXJ0c09uID0gMTtcbiAgdmFyIGRhdGUgPSB0b0RhdGUoZGlydHlEYXRlKTtcbiAgdmFyIGRheSA9IGRhdGUuZ2V0VVRDRGF5KCk7XG4gIHZhciBkaWZmID0gKGRheSA8IHdlZWtTdGFydHNPbiA/IDcgOiAwKSArIGRheSAtIHdlZWtTdGFydHNPbjtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpIC0gZGlmZik7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIHJldHVybiBkYXRlO1xufSIsImltcG9ydCBnZXRVVENJU09XZWVrWWVhciBmcm9tIFwiLi4vZ2V0VVRDSVNPV2Vla1llYXIvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDSVNPV2VlayBmcm9tIFwiLi4vc3RhcnRPZlVUQ0lTT1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnRPZlVUQ0lTT1dlZWtZZWFyKGRpcnR5RGF0ZSkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIHllYXIgPSBnZXRVVENJU09XZWVrWWVhcihkaXJ0eURhdGUpO1xuICB2YXIgZm91cnRoT2ZKYW51YXJ5ID0gbmV3IERhdGUoMCk7XG4gIGZvdXJ0aE9mSmFudWFyeS5zZXRVVENGdWxsWWVhcih5ZWFyLCAwLCA0KTtcbiAgZm91cnRoT2ZKYW51YXJ5LnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB2YXIgZGF0ZSA9IHN0YXJ0T2ZVVENJU09XZWVrKGZvdXJ0aE9mSmFudWFyeSk7XG4gIHJldHVybiBkYXRlO1xufSIsImltcG9ydCB0b0RhdGUgZnJvbSBcIi4uLy4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9JbnRlZ2VyIGZyb20gXCIuLi90b0ludGVnZXIvaW5kZXguanNcIjtcbmltcG9ydCB7IGdldERlZmF1bHRPcHRpb25zIH0gZnJvbSBcIi4uL2RlZmF1bHRPcHRpb25zL2luZGV4LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzdGFydE9mVVRDV2VlayhkaXJ0eURhdGUsIG9wdGlvbnMpIHtcbiAgdmFyIF9yZWYsIF9yZWYyLCBfcmVmMywgX29wdGlvbnMkd2Vla1N0YXJ0c09uLCBfb3B0aW9ucyRsb2NhbGUsIF9vcHRpb25zJGxvY2FsZSRvcHRpbywgX2RlZmF1bHRPcHRpb25zJGxvY2FsLCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyO1xuXG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSBnZXREZWZhdWx0T3B0aW9ucygpO1xuICB2YXIgd2Vla1N0YXJ0c09uID0gdG9JbnRlZ2VyKChfcmVmID0gKF9yZWYyID0gKF9yZWYzID0gKF9vcHRpb25zJHdlZWtTdGFydHNPbiA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9vcHRpb25zJHdlZWtTdGFydHNPbiAhPT0gdm9pZCAwID8gX29wdGlvbnMkd2Vla1N0YXJ0c09uIDogb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlID0gb3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9vcHRpb25zJGxvY2FsZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSRvcHRpbyA9IF9vcHRpb25zJGxvY2FsZS5vcHRpb25zKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRpb25zJGxvY2FsZSRvcHRpby53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9yZWYzICE9PSB2b2lkIDAgPyBfcmVmMyA6IGRlZmF1bHRPcHRpb25zLndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX3JlZjIgIT09IHZvaWQgMCA/IF9yZWYyIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9IF9kZWZhdWx0T3B0aW9ucyRsb2NhbC5vcHRpb25zKSA9PT0gbnVsbCB8fCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyLndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX3JlZiAhPT0gdm9pZCAwID8gX3JlZiA6IDApOyAvLyBUZXN0IGlmIHdlZWtTdGFydHNPbiBpcyBiZXR3ZWVuIDAgYW5kIDYgX2FuZF8gaXMgbm90IE5hTlxuXG4gIGlmICghKHdlZWtTdGFydHNPbiA+PSAwICYmIHdlZWtTdGFydHNPbiA8PSA2KSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd3ZWVrU3RhcnRzT24gbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDYgaW5jbHVzaXZlbHknKTtcbiAgfVxuXG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciBkYXkgPSBkYXRlLmdldFVUQ0RheSgpO1xuICB2YXIgZGlmZiA9IChkYXkgPCB3ZWVrU3RhcnRzT24gPyA3IDogMCkgKyBkYXkgLSB3ZWVrU3RhcnRzT247XG4gIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSAtIGRpZmYpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICByZXR1cm4gZGF0ZTtcbn0iLCJpbXBvcnQgZ2V0VVRDV2Vla1llYXIgZnJvbSBcIi4uL2dldFVUQ1dlZWtZZWFyL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDV2VlayBmcm9tIFwiLi4vc3RhcnRPZlVUQ1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCB0b0ludGVnZXIgZnJvbSBcIi4uL3RvSW50ZWdlci9pbmRleC5qc1wiO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdE9wdGlvbnMgfSBmcm9tIFwiLi4vZGVmYXVsdE9wdGlvbnMvaW5kZXguanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0YXJ0T2ZVVENXZWVrWWVhcihkaXJ0eURhdGUsIG9wdGlvbnMpIHtcbiAgdmFyIF9yZWYsIF9yZWYyLCBfcmVmMywgX29wdGlvbnMkZmlyc3RXZWVrQ29uLCBfb3B0aW9ucyRsb2NhbGUsIF9vcHRpb25zJGxvY2FsZSRvcHRpbywgX2RlZmF1bHRPcHRpb25zJGxvY2FsLCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyO1xuXG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSBnZXREZWZhdWx0T3B0aW9ucygpO1xuICB2YXIgZmlyc3RXZWVrQ29udGFpbnNEYXRlID0gdG9JbnRlZ2VyKChfcmVmID0gKF9yZWYyID0gKF9yZWYzID0gKF9vcHRpb25zJGZpcnN0V2Vla0NvbiA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9vcHRpb25zJGZpcnN0V2Vla0NvbiAhPT0gdm9pZCAwID8gX29wdGlvbnMkZmlyc3RXZWVrQ29uIDogb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlID0gb3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9vcHRpb25zJGxvY2FsZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSRvcHRpbyA9IF9vcHRpb25zJGxvY2FsZS5vcHRpb25zKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRpb25zJGxvY2FsZSRvcHRpby5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYzICE9PSB2b2lkIDAgPyBfcmVmMyA6IGRlZmF1bHRPcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZjIgIT09IHZvaWQgMCA/IF9yZWYyIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9IF9kZWZhdWx0T3B0aW9ucyRsb2NhbC5vcHRpb25zKSA9PT0gbnVsbCB8fCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZiAhPT0gdm9pZCAwID8gX3JlZiA6IDEpO1xuICB2YXIgeWVhciA9IGdldFVUQ1dlZWtZZWFyKGRpcnR5RGF0ZSwgb3B0aW9ucyk7XG4gIHZhciBmaXJzdFdlZWsgPSBuZXcgRGF0ZSgwKTtcbiAgZmlyc3RXZWVrLnNldFVUQ0Z1bGxZZWFyKHllYXIsIDAsIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSk7XG4gIGZpcnN0V2Vlay5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIGRhdGUgPSBzdGFydE9mVVRDV2VlayhmaXJzdFdlZWssIG9wdGlvbnMpO1xuICByZXR1cm4gZGF0ZTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0b0ludGVnZXIoZGlydHlOdW1iZXIpIHtcbiAgaWYgKGRpcnR5TnVtYmVyID09PSBudWxsIHx8IGRpcnR5TnVtYmVyID09PSB0cnVlIHx8IGRpcnR5TnVtYmVyID09PSBmYWxzZSkge1xuICAgIHJldHVybiBOYU47XG4gIH1cblxuICB2YXIgbnVtYmVyID0gTnVtYmVyKGRpcnR5TnVtYmVyKTtcblxuICBpZiAoaXNOYU4obnVtYmVyKSkge1xuICAgIHJldHVybiBudW1iZXI7XG4gIH1cblxuICByZXR1cm4gbnVtYmVyIDwgMCA/IE1hdGguY2VpbChudW1iZXIpIDogTWF0aC5mbG9vcihudW1iZXIpO1xufSIsImltcG9ydCB0b0ludGVnZXIgZnJvbSBcIi4uL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9EYXRlIGZyb20gXCIuLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL19saWIvcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG4vKipcbiAqIEBuYW1lIGFkZE1pbGxpc2Vjb25kc1xuICogQGNhdGVnb3J5IE1pbGxpc2Vjb25kIEhlbHBlcnNcbiAqIEBzdW1tYXJ5IEFkZCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhlIGdpdmVuIGRhdGUuXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBZGQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRoZSBnaXZlbiBkYXRlLlxuICpcbiAqIEBwYXJhbSB7RGF0ZXxOdW1iZXJ9IGRhdGUgLSB0aGUgZGF0ZSB0byBiZSBjaGFuZ2VkXG4gKiBAcGFyYW0ge051bWJlcn0gYW1vdW50IC0gdGhlIGFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gYmUgYWRkZWQuIFBvc2l0aXZlIGRlY2ltYWxzIHdpbGwgYmUgcm91bmRlZCB1c2luZyBgTWF0aC5mbG9vcmAsIGRlY2ltYWxzIGxlc3MgdGhhbiB6ZXJvIHdpbGwgYmUgcm91bmRlZCB1c2luZyBgTWF0aC5jZWlsYC5cbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgbmV3IGRhdGUgd2l0aCB0aGUgbWlsbGlzZWNvbmRzIGFkZGVkXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IDIgYXJndW1lbnRzIHJlcXVpcmVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEFkZCA3NTAgbWlsbGlzZWNvbmRzIHRvIDEwIEp1bHkgMjAxNCAxMjo0NTozMC4wMDA6XG4gKiBjb25zdCByZXN1bHQgPSBhZGRNaWxsaXNlY29uZHMobmV3IERhdGUoMjAxNCwgNiwgMTAsIDEyLCA0NSwgMzAsIDApLCA3NTApXG4gKiAvLz0+IFRodSBKdWwgMTAgMjAxNCAxMjo0NTozMC43NTBcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNaWxsaXNlY29uZHMoZGlydHlEYXRlLCBkaXJ0eUFtb3VudCkge1xuICByZXF1aXJlZEFyZ3MoMiwgYXJndW1lbnRzKTtcbiAgdmFyIHRpbWVzdGFtcCA9IHRvRGF0ZShkaXJ0eURhdGUpLmdldFRpbWUoKTtcbiAgdmFyIGFtb3VudCA9IHRvSW50ZWdlcihkaXJ0eUFtb3VudCk7XG4gIHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXAgKyBhbW91bnQpO1xufSIsImltcG9ydCBpc1ZhbGlkIGZyb20gXCIuLi9pc1ZhbGlkL2luZGV4LmpzXCI7XG5pbXBvcnQgc3ViTWlsbGlzZWNvbmRzIGZyb20gXCIuLi9zdWJNaWxsaXNlY29uZHMvaW5kZXguanNcIjtcbmltcG9ydCB0b0RhdGUgZnJvbSBcIi4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IGZvcm1hdHRlcnMgZnJvbSBcIi4uL19saWIvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXguanNcIjtcbmltcG9ydCBsb25nRm9ybWF0dGVycyBmcm9tIFwiLi4vX2xpYi9mb3JtYXQvbG9uZ0Zvcm1hdHRlcnMvaW5kZXguanNcIjtcbmltcG9ydCBnZXRUaW1lem9uZU9mZnNldEluTWlsbGlzZWNvbmRzIGZyb20gXCIuLi9fbGliL2dldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMvaW5kZXguanNcIjtcbmltcG9ydCB7IGlzUHJvdGVjdGVkRGF5T2ZZZWFyVG9rZW4sIGlzUHJvdGVjdGVkV2Vla1llYXJUb2tlbiwgdGhyb3dQcm90ZWN0ZWRFcnJvciB9IGZyb20gXCIuLi9fbGliL3Byb3RlY3RlZFRva2Vucy9pbmRleC5qc1wiO1xuaW1wb3J0IHRvSW50ZWdlciBmcm9tIFwiLi4vX2xpYi90b0ludGVnZXIvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL19saWIvcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0T3B0aW9ucyB9IGZyb20gXCIuLi9fbGliL2RlZmF1bHRPcHRpb25zL2luZGV4LmpzXCI7XG5pbXBvcnQgZGVmYXVsdExvY2FsZSBmcm9tIFwiLi4vX2xpYi9kZWZhdWx0TG9jYWxlL2luZGV4LmpzXCI7IC8vIFRoaXMgUmVnRXhwIGNvbnNpc3RzIG9mIHRocmVlIHBhcnRzIHNlcGFyYXRlZCBieSBgfGA6XG4vLyAtIFt5WVFxTUx3SWREZWNpaEhLa21zXW8gbWF0Y2hlcyBhbnkgYXZhaWxhYmxlIG9yZGluYWwgbnVtYmVyIHRva2VuXG4vLyAgIChvbmUgb2YgdGhlIGNlcnRhaW4gbGV0dGVycyBmb2xsb3dlZCBieSBgb2ApXG4vLyAtIChcXHcpXFwxKiBtYXRjaGVzIGFueSBzZXF1ZW5jZXMgb2YgdGhlIHNhbWUgbGV0dGVyXG4vLyAtICcnIG1hdGNoZXMgdHdvIHF1b3RlIGNoYXJhY3RlcnMgaW4gYSByb3dcbi8vIC0gJygnJ3xbXiddKSsoJ3wkKSBtYXRjaGVzIGFueXRoaW5nIHN1cnJvdW5kZWQgYnkgdHdvIHF1b3RlIGNoYXJhY3RlcnMgKCcpLFxuLy8gICBleGNlcHQgYSBzaW5nbGUgcXVvdGUgc3ltYm9sLCB3aGljaCBlbmRzIHRoZSBzZXF1ZW5jZS5cbi8vICAgVHdvIHF1b3RlIGNoYXJhY3RlcnMgZG8gbm90IGVuZCB0aGUgc2VxdWVuY2UuXG4vLyAgIElmIHRoZXJlIGlzIG5vIG1hdGNoaW5nIHNpbmdsZSBxdW90ZVxuLy8gICB0aGVuIHRoZSBzZXF1ZW5jZSB3aWxsIGNvbnRpbnVlIHVudGlsIHRoZSBlbmQgb2YgdGhlIHN0cmluZy5cbi8vIC0gLiBtYXRjaGVzIGFueSBzaW5nbGUgY2hhcmFjdGVyIHVubWF0Y2hlZCBieSBwcmV2aW91cyBwYXJ0cyBvZiB0aGUgUmVnRXhwc1xuXG52YXIgZm9ybWF0dGluZ1Rva2Vuc1JlZ0V4cCA9IC9beVlRcU1Md0lkRGVjaWhIS2ttc11vfChcXHcpXFwxKnwnJ3wnKCcnfFteJ10pKygnfCQpfC4vZzsgLy8gVGhpcyBSZWdFeHAgY2F0Y2hlcyBzeW1ib2xzIGVzY2FwZWQgYnkgcXVvdGVzLCBhbmQgYWxzb1xuLy8gc2VxdWVuY2VzIG9mIHN5bWJvbHMgUCwgcCwgYW5kIHRoZSBjb21iaW5hdGlvbnMgbGlrZSBgUFBQUFBQUHBwcHBwYFxuXG52YXIgbG9uZ0Zvcm1hdHRpbmdUb2tlbnNSZWdFeHAgPSAvUCtwK3xQK3xwK3wnJ3wnKCcnfFteJ10pKygnfCQpfC4vZztcbnZhciBlc2NhcGVkU3RyaW5nUmVnRXhwID0gL14nKFteXSo/KSc/JC87XG52YXIgZG91YmxlUXVvdGVSZWdFeHAgPSAvJycvZztcbnZhciB1bmVzY2FwZWRMYXRpbkNoYXJhY3RlclJlZ0V4cCA9IC9bYS16QS1aXS87XG4vKipcbiAqIEBuYW1lIGZvcm1hdFxuICogQGNhdGVnb3J5IENvbW1vbiBIZWxwZXJzXG4gKiBAc3VtbWFyeSBGb3JtYXQgdGhlIGRhdGUuXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBSZXR1cm4gdGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZyBpbiB0aGUgZ2l2ZW4gZm9ybWF0LiBUaGUgcmVzdWx0IG1heSB2YXJ5IGJ5IGxvY2FsZS5cbiAqXG4gKiA+IOKaoO+4jyBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBgZm9ybWF0YCB0b2tlbnMgZGlmZmVyIGZyb20gTW9tZW50LmpzIGFuZCBvdGhlciBsaWJyYXJpZXMuXG4gKiA+IFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICpcbiAqIFRoZSBjaGFyYWN0ZXJzIHdyYXBwZWQgYmV0d2VlbiB0d28gc2luZ2xlIHF1b3RlcyBjaGFyYWN0ZXJzICgnKSBhcmUgZXNjYXBlZC5cbiAqIFR3byBzaW5nbGUgcXVvdGVzIGluIGEgcm93LCB3aGV0aGVyIGluc2lkZSBvciBvdXRzaWRlIGEgcXVvdGVkIHNlcXVlbmNlLCByZXByZXNlbnQgYSAncmVhbCcgc2luZ2xlIHF1b3RlLlxuICogKHNlZSB0aGUgbGFzdCBleGFtcGxlKVxuICpcbiAqIEZvcm1hdCBvZiB0aGUgc3RyaW5nIGlzIGJhc2VkIG9uIFVuaWNvZGUgVGVjaG5pY2FsIFN0YW5kYXJkICMzNTpcbiAqIGh0dHBzOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbiAqIHdpdGggYSBmZXcgYWRkaXRpb25zIChzZWUgbm90ZSA3IGJlbG93IHRoZSB0YWJsZSkuXG4gKlxuICogQWNjZXB0ZWQgcGF0dGVybnM6XG4gKiB8IFVuaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBQYXR0ZXJuIHwgUmVzdWx0IGV4YW1wbGVzICAgICAgICAgICAgICAgICAgIHwgTm90ZXMgfFxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLXxcbiAqIHwgRXJhICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEcuLkdHRyAgfCBBRCwgQkMgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHR0dHICAgIHwgQW5ubyBEb21pbmksIEJlZm9yZSBDaHJpc3QgICAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR0dHR0cgICB8IEEsIEIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgQ2FsZW5kYXIgeWVhciAgICAgICAgICAgICAgICAgICB8IHkgICAgICAgfCA0NCwgMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB5byAgICAgIHwgNDR0aCwgMXN0LCAwdGgsIDE3dGggICAgICAgICAgICAgIHwgNSw3ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeXkgICAgICB8IDQ0LCAwMSwgMDAsIDE3ICAgICAgICAgICAgICAgICAgICB8IDUgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHl5eSAgICAgfCAwNDQsIDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB5eXl5ICAgIHwgMDA0NCwgMDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeXl5eXkgICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDMsNSAgIHxcbiAqIHwgTG9jYWwgd2Vlay1udW1iZXJpbmcgeWVhciAgICAgICB8IFkgICAgICAgfCA0NCwgMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBZbyAgICAgIHwgNDR0aCwgMXN0LCAxOTAwdGgsIDIwMTd0aCAgICAgICAgIHwgNSw3ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWVkgICAgICB8IDQ0LCAwMSwgMDAsIDE3ICAgICAgICAgICAgICAgICAgICB8IDUsOCAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFlZWSAgICAgfCAwNDQsIDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBZWVlZICAgIHwgMDA0NCwgMDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgIHwgNSw4ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWVlZWVkgICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDMsNSAgIHxcbiAqIHwgSVNPIHdlZWstbnVtYmVyaW5nIHllYXIgICAgICAgICB8IFIgICAgICAgfCAtNDMsIDAsIDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgfCA1LDcgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBSUiAgICAgIHwgLTQzLCAwMCwgMDEsIDE5MDAsIDIwMTcgICAgICAgICAgIHwgNSw3ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUlJSICAgICB8IC0wNDMsIDAwMCwgMDAxLCAxOTAwLCAyMDE3ICAgICAgICB8IDUsNyAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFJSUlIgICAgfCAtMDA0MywgMDAwMCwgMDAwMSwgMTkwMCwgMjAxNyAgICAgfCA1LDcgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBSUlJSUiAgIHwgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMyw1LDcgfFxuICogfCBFeHRlbmRlZCB5ZWFyICAgICAgICAgICAgICAgICAgIHwgdSAgICAgICB8IC00MywgMCwgMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICB8IDUgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHV1ICAgICAgfCAtNDMsIDAxLCAxOTAwLCAyMDE3ICAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB1dXUgICAgIHwgLTA0MywgMDAxLCAxOTAwLCAyMDE3ICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgdXV1dSAgICB8IC0wMDQzLCAwMDAxLCAxOTAwLCAyMDE3ICAgICAgICAgICB8IDUgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHV1dXV1ICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzLDUgICB8XG4gKiB8IFF1YXJ0ZXIgKGZvcm1hdHRpbmcpICAgICAgICAgICAgfCBRICAgICAgIHwgMSwgMiwgMywgNCAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUW8gICAgICB8IDFzdCwgMm5kLCAzcmQsIDR0aCAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFFRICAgICAgfCAwMSwgMDIsIDAzLCAwNCAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBRUVEgICAgIHwgUTEsIFEyLCBRMywgUTQgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUVFRUSAgICB8IDFzdCBxdWFydGVyLCAybmQgcXVhcnRlciwgLi4uICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFFRUVFRICAgfCAxLCAyLCAzLCA0ICAgICAgICAgICAgICAgICAgICAgICAgfCA0ICAgICB8XG4gKiB8IFF1YXJ0ZXIgKHN0YW5kLWFsb25lKSAgICAgICAgICAgfCBxICAgICAgIHwgMSwgMiwgMywgNCAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgcW8gICAgICB8IDFzdCwgMm5kLCAzcmQsIDR0aCAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHFxICAgICAgfCAwMSwgMDIsIDAzLCAwNCAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBxcXEgICAgIHwgUTEsIFEyLCBRMywgUTQgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgcXFxcSAgICB8IDFzdCBxdWFydGVyLCAybmQgcXVhcnRlciwgLi4uICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHFxcXFxICAgfCAxLCAyLCAzLCA0ICAgICAgICAgICAgICAgICAgICAgICAgfCA0ICAgICB8XG4gKiB8IE1vbnRoIChmb3JtYXR0aW5nKSAgICAgICAgICAgICAgfCBNICAgICAgIHwgMSwgMiwgLi4uLCAxMiAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTW8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDEydGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IE1NICAgICAgfCAwMSwgMDIsIC4uLiwgMTIgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTU0gICAgIHwgSmFuLCBGZWIsIC4uLiwgRGVjICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTU1NTSAgICB8IEphbnVhcnksIEZlYnJ1YXJ5LCAuLi4sIERlY2VtYmVyICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IE1NTU1NICAgfCBKLCBGLCAuLi4sIEQgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IE1vbnRoIChzdGFuZC1hbG9uZSkgICAgICAgICAgICAgfCBMICAgICAgIHwgMSwgMiwgLi4uLCAxMiAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTG8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDEydGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IExMICAgICAgfCAwMSwgMDIsIC4uLiwgMTIgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTEwgICAgIHwgSmFuLCBGZWIsIC4uLiwgRGVjICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTExMTCAgICB8IEphbnVhcnksIEZlYnJ1YXJ5LCAuLi4sIERlY2VtYmVyICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IExMTExMICAgfCBKLCBGLCAuLi4sIEQgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IExvY2FsIHdlZWsgb2YgeWVhciAgICAgICAgICAgICAgfCB3ICAgICAgIHwgMSwgMiwgLi4uLCA1MyAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgd28gICAgICB8IDFzdCwgMm5kLCAuLi4sIDUzdGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHd3ICAgICAgfCAwMSwgMDIsIC4uLiwgNTMgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IElTTyB3ZWVrIG9mIHllYXIgICAgICAgICAgICAgICAgfCBJICAgICAgIHwgMSwgMiwgLi4uLCA1MyAgICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgSW8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDUzdGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IElJICAgICAgfCAwMSwgMDIsIC4uLiwgNTMgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8IERheSBvZiBtb250aCAgICAgICAgICAgICAgICAgICAgfCBkICAgICAgIHwgMSwgMiwgLi4uLCAzMSAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZG8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDMxc3QgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGRkICAgICAgfCAwMSwgMDIsIC4uLiwgMzEgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IERheSBvZiB5ZWFyICAgICAgICAgICAgICAgICAgICAgfCBEICAgICAgIHwgMSwgMiwgLi4uLCAzNjUsIDM2NiAgICAgICAgICAgICAgIHwgOSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRG8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDM2NXRoLCAzNjZ0aCAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEREICAgICAgfCAwMSwgMDIsIC4uLiwgMzY1LCAzNjYgICAgICAgICAgICAgfCA5ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBEREQgICAgIHwgMDAxLCAwMDIsIC4uLiwgMzY1LCAzNjYgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRERERCAgICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDMgICAgIHxcbiAqIHwgRGF5IG9mIHdlZWsgKGZvcm1hdHRpbmcpICAgICAgICB8IEUuLkVFRSAgfCBNb24sIFR1ZSwgV2VkLCAuLi4sIFN1biAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBFRUVFICAgIHwgTW9uZGF5LCBUdWVzZGF5LCAuLi4sIFN1bmRheSAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRUVFRUUgICB8IE0sIFQsIFcsIFQsIEYsIFMsIFMgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEVFRUVFRSAgfCBNbywgVHUsIFdlLCBUaCwgRnIsIFNhLCBTdSAgICAgICAgfCAgICAgICB8XG4gKiB8IElTTyBkYXkgb2Ygd2VlayAoZm9ybWF0dGluZykgICAgfCBpICAgICAgIHwgMSwgMiwgMywgLi4uLCA3ICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaW8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDd0aCAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGlpICAgICAgfCAwMSwgMDIsIC4uLiwgMDcgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBpaWkgICAgIHwgTW9uLCBUdWUsIFdlZCwgLi4uLCBTdW4gICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaWlpaSAgICB8IE1vbmRheSwgVHVlc2RheSwgLi4uLCBTdW5kYXkgICAgICB8IDIsNyAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGlpaWlpICAgfCBNLCBULCBXLCBULCBGLCBTLCBTICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBpaWlpaWkgIHwgTW8sIFR1LCBXZSwgVGgsIEZyLCBTYSwgU3UgICAgICAgIHwgNyAgICAgfFxuICogfCBMb2NhbCBkYXkgb2Ygd2VlayAoZm9ybWF0dGluZykgIHwgZSAgICAgICB8IDIsIDMsIDQsIC4uLiwgMSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVvICAgICAgfCAybmQsIDNyZCwgLi4uLCAxc3QgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlZSAgICAgIHwgMDIsIDAzLCAuLi4sIDAxICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZWVlICAgICB8IE1vbiwgVHVlLCBXZWQsIC4uLiwgU3VuICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVlZWUgICAgfCBNb25kYXksIFR1ZXNkYXksIC4uLiwgU3VuZGF5ICAgICAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlZWVlZSAgIHwgTSwgVCwgVywgVCwgRiwgUywgUyAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZWVlZWVlICB8IE1vLCBUdSwgV2UsIFRoLCBGciwgU2EsIFN1ICAgICAgICB8ICAgICAgIHxcbiAqIHwgTG9jYWwgZGF5IG9mIHdlZWsgKHN0YW5kLWFsb25lKSB8IGMgICAgICAgfCAyLCAzLCA0LCAuLi4sIDEgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBjbyAgICAgIHwgMm5kLCAzcmQsIC4uLiwgMXN0ICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2MgICAgICB8IDAyLCAwMywgLi4uLCAwMSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjYyAgICAgfCBNb24sIFR1ZSwgV2VkLCAuLi4sIFN1biAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBjY2NjICAgIHwgTW9uZGF5LCBUdWVzZGF5LCAuLi4sIFN1bmRheSAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2NjY2MgICB8IE0sIFQsIFcsIFQsIEYsIFMsIFMgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjY2NjYyAgfCBNbywgVHUsIFdlLCBUaCwgRnIsIFNhLCBTdSAgICAgICAgfCAgICAgICB8XG4gKiB8IEFNLCBQTSAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhLi5hYSAgIHwgQU0sIFBNICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYWFhICAgICB8IGFtLCBwbSAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGFhYWEgICAgfCBhLm0uLCBwLm0uICAgICAgICAgICAgICAgICAgICAgICAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhYWFhYSAgIHwgYSwgcCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCBBTSwgUE0sIG5vb24sIG1pZG5pZ2h0ICAgICAgICAgIHwgYi4uYmIgICB8IEFNLCBQTSwgbm9vbiwgbWlkbmlnaHQgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGJiYiAgICAgfCBhbSwgcG0sIG5vb24sIG1pZG5pZ2h0ICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBiYmJiICAgIHwgYS5tLiwgcC5tLiwgbm9vbiwgbWlkbmlnaHQgICAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYmJiYmIgICB8IGEsIHAsIG4sIG1pICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgRmxleGlibGUgZGF5IHBlcmlvZCAgICAgICAgICAgICB8IEIuLkJCQiAgfCBhdCBuaWdodCwgaW4gdGhlIG1vcm5pbmcsIC4uLiAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBCQkJCICAgIHwgYXQgbmlnaHQsIGluIHRoZSBtb3JuaW5nLCAuLi4gICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQkJCQkIgICB8IGF0IG5pZ2h0LCBpbiB0aGUgbW9ybmluZywgLi4uICAgICB8ICAgICAgIHxcbiAqIHwgSG91ciBbMS0xMl0gICAgICAgICAgICAgICAgICAgICB8IGggICAgICAgfCAxLCAyLCAuLi4sIDExLCAxMiAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBobyAgICAgIHwgMXN0LCAybmQsIC4uLiwgMTF0aCwgMTJ0aCAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaGggICAgICB8IDAxLCAwMiwgLi4uLCAxMSwgMTIgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgSG91ciBbMC0yM10gICAgICAgICAgICAgICAgICAgICB8IEggICAgICAgfCAwLCAxLCAyLCAuLi4sIDIzICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBIbyAgICAgIHwgMHRoLCAxc3QsIDJuZCwgLi4uLCAyM3JkICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgSEggICAgICB8IDAwLCAwMSwgMDIsIC4uLiwgMjMgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgSG91ciBbMC0xMV0gICAgICAgICAgICAgICAgICAgICB8IEsgICAgICAgfCAxLCAyLCAuLi4sIDExLCAwICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBLbyAgICAgIHwgMXN0LCAybmQsIC4uLiwgMTF0aCwgMHRoICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgS0sgICAgICB8IDAxLCAwMiwgLi4uLCAxMSwgMDAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgSG91ciBbMS0yNF0gICAgICAgICAgICAgICAgICAgICB8IGsgICAgICAgfCAyNCwgMSwgMiwgLi4uLCAyMyAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBrbyAgICAgIHwgMjR0aCwgMXN0LCAybmQsIC4uLiwgMjNyZCAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwga2sgICAgICB8IDI0LCAwMSwgMDIsIC4uLiwgMjMgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgTWludXRlICAgICAgICAgICAgICAgICAgICAgICAgICB8IG0gICAgICAgfCAwLCAxLCAuLi4sIDU5ICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtbyAgICAgIHwgMHRoLCAxc3QsIC4uLiwgNTl0aCAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbW0gICAgICB8IDAwLCAwMSwgLi4uLCA1OSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgU2Vjb25kICAgICAgICAgICAgICAgICAgICAgICAgICB8IHMgICAgICAgfCAwLCAxLCAuLi4sIDU5ICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBzbyAgICAgIHwgMHRoLCAxc3QsIC4uLiwgNTl0aCAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgc3MgICAgICB8IDAwLCAwMSwgLi4uLCA1OSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgRnJhY3Rpb24gb2Ygc2Vjb25kICAgICAgICAgICAgICB8IFMgICAgICAgfCAwLCAxLCAuLi4sIDkgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTUyAgICAgIHwgMDAsIDAxLCAuLi4sIDk5ICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU1NTICAgICB8IDAwMCwgMDAxLCAuLi4sIDk5OSAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFNTU1MgICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzICAgICB8XG4gKiB8IFRpbWV6b25lIChJU08tODYwMSB3LyBaKSAgICAgICAgfCBYICAgICAgIHwgLTA4LCArMDUzMCwgWiAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWFggICAgICB8IC0wODAwLCArMDUzMCwgWiAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFhYWCAgICAgfCAtMDg6MDAsICswNTozMCwgWiAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBYWFhYICAgIHwgLTA4MDAsICswNTMwLCBaLCArMTIzNDU2ICAgICAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWFhYWFggICB8IC0wODowMCwgKzA1OjMwLCBaLCArMTI6MzQ6NTYgICAgICB8ICAgICAgIHxcbiAqIHwgVGltZXpvbmUgKElTTy04NjAxIHcvbyBaKSAgICAgICB8IHggICAgICAgfCAtMDgsICswNTMwLCArMDAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB4eCAgICAgIHwgLTA4MDAsICswNTMwLCArMDAwMCAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeHh4ICAgICB8IC0wODowMCwgKzA1OjMwLCArMDA6MDAgICAgICAgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHh4eHggICAgfCAtMDgwMCwgKzA1MzAsICswMDAwLCArMTIzNDU2ICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB4eHh4eCAgIHwgLTA4OjAwLCArMDU6MzAsICswMDowMCwgKzEyOjM0OjU2IHwgICAgICAgfFxuICogfCBUaW1lem9uZSAoR01UKSAgICAgICAgICAgICAgICAgIHwgTy4uLk9PTyB8IEdNVC04LCBHTVQrNTozMCwgR01UKzAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IE9PT08gICAgfCBHTVQtMDg6MDAsIEdNVCswNTozMCwgR01UKzAwOjAwICAgfCAyICAgICB8XG4gKiB8IFRpbWV6b25lIChzcGVjaWZpYyBub24tbG9jYXQuKSAgfCB6Li4uenp6IHwgR01ULTgsIEdNVCs1OjMwLCBHTVQrMCAgICAgICAgICAgIHwgNiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgenp6eiAgICB8IEdNVC0wODowMCwgR01UKzA1OjMwLCBHTVQrMDA6MDAgICB8IDIsNiAgIHxcbiAqIHwgU2Vjb25kcyB0aW1lc3RhbXAgICAgICAgICAgICAgICB8IHQgICAgICAgfCA1MTI5Njk1MjAgICAgICAgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB0dCAgICAgIHwgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMyw3ICAgfFxuICogfCBNaWxsaXNlY29uZHMgdGltZXN0YW1wICAgICAgICAgIHwgVCAgICAgICB8IDUxMjk2OTUyMDkwMCAgICAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFRUICAgICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzLDcgICB8XG4gKiB8IExvbmcgbG9jYWxpemVkIGRhdGUgICAgICAgICAgICAgfCBQICAgICAgIHwgMDQvMjkvMTQ1MyAgICAgICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUFAgICAgICB8IEFwciAyOSwgMTQ1MyAgICAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFBQUCAgICAgfCBBcHJpbCAyOXRoLCAxNDUzICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBQUFBQICAgIHwgRnJpZGF5LCBBcHJpbCAyOXRoLCAxNDUzICAgICAgICAgIHwgMiw3ICAgfFxuICogfCBMb25nIGxvY2FsaXplZCB0aW1lICAgICAgICAgICAgIHwgcCAgICAgICB8IDEyOjAwIEFNICAgICAgICAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHBwICAgICAgfCAxMjowMDowMCBBTSAgICAgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBwcHAgICAgIHwgMTI6MDA6MDAgQU0gR01UKzIgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgcHBwcCAgICB8IDEyOjAwOjAwIEFNIEdNVCswMjowMCAgICAgICAgICAgICB8IDIsNyAgIHxcbiAqIHwgQ29tYmluYXRpb24gb2YgZGF0ZSBhbmQgdGltZSAgICB8IFBwICAgICAgfCAwNC8yOS8xNDUzLCAxMjowMCBBTSAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBQUHBwICAgIHwgQXByIDI5LCAxNDUzLCAxMjowMDowMCBBTSAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUFBQcHBwICB8IEFwcmlsIDI5dGgsIDE0NTMgYXQgLi4uICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFBQUFBwcHBwfCBGcmlkYXksIEFwcmlsIDI5dGgsIDE0NTMgYXQgLi4uICAgfCAyLDcgICB8XG4gKiBOb3RlczpcbiAqIDEuIFwiRm9ybWF0dGluZ1wiIHVuaXRzIChlLmcuIGZvcm1hdHRpbmcgcXVhcnRlcikgaW4gdGhlIGRlZmF1bHQgZW4tVVMgbG9jYWxlXG4gKiAgICBhcmUgdGhlIHNhbWUgYXMgXCJzdGFuZC1hbG9uZVwiIHVuaXRzLCBidXQgYXJlIGRpZmZlcmVudCBpbiBzb21lIGxhbmd1YWdlcy5cbiAqICAgIFwiRm9ybWF0dGluZ1wiIHVuaXRzIGFyZSBkZWNsaW5lZCBhY2NvcmRpbmcgdG8gdGhlIHJ1bGVzIG9mIHRoZSBsYW5ndWFnZVxuICogICAgaW4gdGhlIGNvbnRleHQgb2YgYSBkYXRlLiBcIlN0YW5kLWFsb25lXCIgdW5pdHMgYXJlIGFsd2F5cyBub21pbmF0aXZlIHNpbmd1bGFyOlxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnZG8gTExMTCcsIHtsb2NhbGU6IGNzfSkgLy89PiAnNi4gbGlzdG9wYWQnYFxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnZG8gTU1NTScsIHtsb2NhbGU6IGNzfSkgLy89PiAnNi4gbGlzdG9wYWR1J2BcbiAqXG4gKiAyLiBBbnkgc2VxdWVuY2Ugb2YgdGhlIGlkZW50aWNhbCBsZXR0ZXJzIGlzIGEgcGF0dGVybiwgdW5sZXNzIGl0IGlzIGVzY2FwZWQgYnlcbiAqICAgIHRoZSBzaW5nbGUgcXVvdGUgY2hhcmFjdGVycyAoc2VlIGJlbG93KS5cbiAqICAgIElmIHRoZSBzZXF1ZW5jZSBpcyBsb25nZXIgdGhhbiBsaXN0ZWQgaW4gdGFibGUgKGUuZy4gYEVFRUVFRUVFRUVFYClcbiAqICAgIHRoZSBvdXRwdXQgd2lsbCBiZSB0aGUgc2FtZSBhcyBkZWZhdWx0IHBhdHRlcm4gZm9yIHRoaXMgdW5pdCwgdXN1YWxseVxuICogICAgdGhlIGxvbmdlc3Qgb25lIChpbiBjYXNlIG9mIElTTyB3ZWVrZGF5cywgYEVFRUVgKS4gRGVmYXVsdCBwYXR0ZXJucyBmb3IgdW5pdHNcbiAqICAgIGFyZSBtYXJrZWQgd2l0aCBcIjJcIiBpbiB0aGUgbGFzdCBjb2x1bW4gb2YgdGhlIHRhYmxlLlxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnTU1NJykgLy89PiAnTm92J2BcbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ01NTU0nKSAvLz0+ICdOb3ZlbWJlcidgXG4gKlxuICogICAgYGZvcm1hdChuZXcgRGF0ZSgyMDE3LCAxMCwgNiksICdNTU1NTScpIC8vPT4gJ04nYFxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnTU1NTU1NJykgLy89PiAnTm92ZW1iZXInYFxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnTU1NTU1NTScpIC8vPT4gJ05vdmVtYmVyJ2BcbiAqXG4gKiAzLiBTb21lIHBhdHRlcm5zIGNvdWxkIGJlIHVubGltaXRlZCBsZW5ndGggKHN1Y2ggYXMgYHl5eXl5eXl5YCkuXG4gKiAgICBUaGUgb3V0cHV0IHdpbGwgYmUgcGFkZGVkIHdpdGggemVyb3MgdG8gbWF0Y2ggdGhlIGxlbmd0aCBvZiB0aGUgcGF0dGVybi5cbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ3l5eXl5eXl5JykgLy89PiAnMDAwMDIwMTcnYFxuICpcbiAqIDQuIGBRUVFRUWAgYW5kIGBxcXFxcWAgY291bGQgYmUgbm90IHN0cmljdGx5IG51bWVyaWNhbCBpbiBzb21lIGxvY2FsZXMuXG4gKiAgICBUaGVzZSB0b2tlbnMgcmVwcmVzZW50IHRoZSBzaG9ydGVzdCBmb3JtIG9mIHRoZSBxdWFydGVyLlxuICpcbiAqIDUuIFRoZSBtYWluIGRpZmZlcmVuY2UgYmV0d2VlbiBgeWAgYW5kIGB1YCBwYXR0ZXJucyBhcmUgQi5DLiB5ZWFyczpcbiAqXG4gKiAgICB8IFllYXIgfCBgeWAgfCBgdWAgfFxuICogICAgfC0tLS0tLXwtLS0tLXwtLS0tLXxcbiAqICAgIHwgQUMgMSB8ICAgMSB8ICAgMSB8XG4gKiAgICB8IEJDIDEgfCAgIDEgfCAgIDAgfFxuICogICAgfCBCQyAyIHwgICAyIHwgIC0xIHxcbiAqXG4gKiAgICBBbHNvIGB5eWAgYWx3YXlzIHJldHVybnMgdGhlIGxhc3QgdHdvIGRpZ2l0cyBvZiBhIHllYXIsXG4gKiAgICB3aGlsZSBgdXVgIHBhZHMgc2luZ2xlIGRpZ2l0IHllYXJzIHRvIDIgY2hhcmFjdGVycyBhbmQgcmV0dXJucyBvdGhlciB5ZWFycyB1bmNoYW5nZWQ6XG4gKlxuICogICAgfCBZZWFyIHwgYHl5YCB8IGB1dWAgfFxuICogICAgfC0tLS0tLXwtLS0tLS18LS0tLS0tfFxuICogICAgfCAxICAgIHwgICAwMSB8ICAgMDEgfFxuICogICAgfCAxNCAgIHwgICAxNCB8ICAgMTQgfFxuICogICAgfCAzNzYgIHwgICA3NiB8ICAzNzYgfFxuICogICAgfCAxNDUzIHwgICA1MyB8IDE0NTMgfFxuICpcbiAqICAgIFRoZSBzYW1lIGRpZmZlcmVuY2UgaXMgdHJ1ZSBmb3IgbG9jYWwgYW5kIElTTyB3ZWVrLW51bWJlcmluZyB5ZWFycyAoYFlgIGFuZCBgUmApLFxuICogICAgZXhjZXB0IGxvY2FsIHdlZWstbnVtYmVyaW5nIHllYXJzIGFyZSBkZXBlbmRlbnQgb24gYG9wdGlvbnMud2Vla1N0YXJ0c09uYFxuICogICAgYW5kIGBvcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZWAgKGNvbXBhcmUgW2dldElTT1dlZWtZZWFyXXtAbGluayBodHRwczovL2RhdGUtZm5zLm9yZy9kb2NzL2dldElTT1dlZWtZZWFyfVxuICogICAgYW5kIFtnZXRXZWVrWWVhcl17QGxpbmsgaHR0cHM6Ly9kYXRlLWZucy5vcmcvZG9jcy9nZXRXZWVrWWVhcn0pLlxuICpcbiAqIDYuIFNwZWNpZmljIG5vbi1sb2NhdGlvbiB0aW1lem9uZXMgYXJlIGN1cnJlbnRseSB1bmF2YWlsYWJsZSBpbiBgZGF0ZS1mbnNgLFxuICogICAgc28gcmlnaHQgbm93IHRoZXNlIHRva2VucyBmYWxsIGJhY2sgdG8gR01UIHRpbWV6b25lcy5cbiAqXG4gKiA3LiBUaGVzZSBwYXR0ZXJucyBhcmUgbm90IGluIHRoZSBVbmljb2RlIFRlY2huaWNhbCBTdGFuZGFyZCAjMzU6XG4gKiAgICAtIGBpYDogSVNPIGRheSBvZiB3ZWVrXG4gKiAgICAtIGBJYDogSVNPIHdlZWsgb2YgeWVhclxuICogICAgLSBgUmA6IElTTyB3ZWVrLW51bWJlcmluZyB5ZWFyXG4gKiAgICAtIGB0YDogc2Vjb25kcyB0aW1lc3RhbXBcbiAqICAgIC0gYFRgOiBtaWxsaXNlY29uZHMgdGltZXN0YW1wXG4gKiAgICAtIGBvYDogb3JkaW5hbCBudW1iZXIgbW9kaWZpZXJcbiAqICAgIC0gYFBgOiBsb25nIGxvY2FsaXplZCBkYXRlXG4gKiAgICAtIGBwYDogbG9uZyBsb2NhbGl6ZWQgdGltZVxuICpcbiAqIDguIGBZWWAgYW5kIGBZWVlZYCB0b2tlbnMgcmVwcmVzZW50IHdlZWstbnVtYmVyaW5nIHllYXJzIGJ1dCB0aGV5IGFyZSBvZnRlbiBjb25mdXNlZCB3aXRoIHllYXJzLlxuICogICAgWW91IHNob3VsZCBlbmFibGUgYG9wdGlvbnMudXNlQWRkaXRpb25hbFdlZWtZZWFyVG9rZW5zYCB0byB1c2UgdGhlbS4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91bmljb2RlVG9rZW5zLm1kXG4gKlxuICogOS4gYERgIGFuZCBgRERgIHRva2VucyByZXByZXNlbnQgZGF5cyBvZiB0aGUgeWVhciBidXQgdGhleSBhcmUgb2Z0ZW4gY29uZnVzZWQgd2l0aCBkYXlzIG9mIHRoZSBtb250aC5cbiAqICAgIFlvdSBzaG91bGQgZW5hYmxlIGBvcHRpb25zLnVzZUFkZGl0aW9uYWxEYXlPZlllYXJUb2tlbnNgIHRvIHVzZSB0aGVtLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqXG4gKiBAcGFyYW0ge0RhdGV8TnVtYmVyfSBkYXRlIC0gdGhlIG9yaWdpbmFsIGRhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBmb3JtYXQgLSB0aGUgc3RyaW5nIG9mIHRva2Vuc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIGFuIG9iamVjdCB3aXRoIG9wdGlvbnMuXG4gKiBAcGFyYW0ge0xvY2FsZX0gW29wdGlvbnMubG9jYWxlPWRlZmF1bHRMb2NhbGVdIC0gdGhlIGxvY2FsZSBvYmplY3QuIFNlZSBbTG9jYWxlXXtAbGluayBodHRwczovL2RhdGUtZm5zLm9yZy9kb2NzL0xvY2FsZX1cbiAqIEBwYXJhbSB7MHwxfDJ8M3w0fDV8Nn0gW29wdGlvbnMud2Vla1N0YXJ0c09uPTBdIC0gdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsgKDAgLSBTdW5kYXkpXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZmlyc3RXZWVrQ29udGFpbnNEYXRlPTFdIC0gdGhlIGRheSBvZiBKYW51YXJ5LCB3aGljaCBpc1xuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy51c2VBZGRpdGlvbmFsV2Vla1llYXJUb2tlbnM9ZmFsc2VdIC0gaWYgdHJ1ZSwgYWxsb3dzIHVzYWdlIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyIHRva2VucyBgWVlgIGFuZCBgWVlZWWA7XG4gKiAgIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy51c2VBZGRpdGlvbmFsRGF5T2ZZZWFyVG9rZW5zPWZhbHNlXSAtIGlmIHRydWUsIGFsbG93cyB1c2FnZSBvZiB0aGUgZGF5IG9mIHllYXIgdG9rZW5zIGBEYCBhbmQgYEREYDtcbiAqICAgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91bmljb2RlVG9rZW5zLm1kXG4gKiBAcmV0dXJucyB7U3RyaW5nfSB0aGUgZm9ybWF0dGVkIGRhdGUgc3RyaW5nXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IDIgYXJndW1lbnRzIHJlcXVpcmVkXG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBgZGF0ZWAgbXVzdCBub3QgYmUgSW52YWxpZCBEYXRlXG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBgb3B0aW9ucy5sb2NhbGVgIG11c3QgY29udGFpbiBgbG9jYWxpemVgIHByb3BlcnR5XG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBgb3B0aW9ucy5sb2NhbGVgIG11c3QgY29udGFpbiBgZm9ybWF0TG9uZ2AgcHJvcGVydHlcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IGBvcHRpb25zLndlZWtTdGFydHNPbmAgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDZcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IGBvcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZWAgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDdcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IHVzZSBgeXl5eWAgaW5zdGVhZCBvZiBgWVlZWWAgZm9yIGZvcm1hdHRpbmcgeWVhcnMgdXNpbmcgW2Zvcm1hdCBwcm92aWRlZF0gdG8gdGhlIGlucHV0IFtpbnB1dCBwcm92aWRlZF07IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gdXNlIGB5eWAgaW5zdGVhZCBvZiBgWVlgIGZvciBmb3JtYXR0aW5nIHllYXJzIHVzaW5nIFtmb3JtYXQgcHJvdmlkZWRdIHRvIHRoZSBpbnB1dCBbaW5wdXQgcHJvdmlkZWRdOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IHVzZSBgZGAgaW5zdGVhZCBvZiBgRGAgZm9yIGZvcm1hdHRpbmcgZGF5cyBvZiB0aGUgbW9udGggdXNpbmcgW2Zvcm1hdCBwcm92aWRlZF0gdG8gdGhlIGlucHV0IFtpbnB1dCBwcm92aWRlZF07IHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gdXNlIGBkZGAgaW5zdGVhZCBvZiBgRERgIGZvciBmb3JtYXR0aW5nIGRheXMgb2YgdGhlIG1vbnRoIHVzaW5nIFtmb3JtYXQgcHJvdmlkZWRdIHRvIHRoZSBpbnB1dCBbaW5wdXQgcHJvdmlkZWRdOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IGZvcm1hdCBzdHJpbmcgY29udGFpbnMgYW4gdW5lc2NhcGVkIGxhdGluIGFscGhhYmV0IGNoYXJhY3RlclxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBSZXByZXNlbnQgMTEgRmVicnVhcnkgMjAxNCBpbiBtaWRkbGUtZW5kaWFuIGZvcm1hdDpcbiAqIGNvbnN0IHJlc3VsdCA9IGZvcm1hdChuZXcgRGF0ZSgyMDE0LCAxLCAxMSksICdNTS9kZC95eXl5JylcbiAqIC8vPT4gJzAyLzExLzIwMTQnXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFJlcHJlc2VudCAyIEp1bHkgMjAxNCBpbiBFc3BlcmFudG86XG4gKiBpbXBvcnQgeyBlb0xvY2FsZSB9IGZyb20gJ2RhdGUtZm5zL2xvY2FsZS9lbydcbiAqIGNvbnN0IHJlc3VsdCA9IGZvcm1hdChuZXcgRGF0ZSgyMDE0LCA2LCAyKSwgXCJkbyAnZGUnIE1NTU0geXl5eVwiLCB7XG4gKiAgIGxvY2FsZTogZW9Mb2NhbGVcbiAqIH0pXG4gKiAvLz0+ICcyLWEgZGUganVsaW8gMjAxNCdcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRXNjYXBlIHN0cmluZyBieSBzaW5nbGUgcXVvdGUgY2hhcmFjdGVyczpcbiAqIGNvbnN0IHJlc3VsdCA9IGZvcm1hdChuZXcgRGF0ZSgyMDE0LCA2LCAyLCAxNSksIFwiaCAnbycnY2xvY2snXCIpXG4gKiAvLz0+IFwiMyBvJ2Nsb2NrXCJcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmb3JtYXQoZGlydHlEYXRlLCBkaXJ0eUZvcm1hdFN0ciwgb3B0aW9ucykge1xuICB2YXIgX3JlZiwgX29wdGlvbnMkbG9jYWxlLCBfcmVmMiwgX3JlZjMsIF9yZWY0LCBfb3B0aW9ucyRmaXJzdFdlZWtDb24sIF9vcHRpb25zJGxvY2FsZTIsIF9vcHRpb25zJGxvY2FsZTIkb3B0aSwgX2RlZmF1bHRPcHRpb25zJGxvY2FsLCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyLCBfcmVmNSwgX3JlZjYsIF9yZWY3LCBfb3B0aW9ucyR3ZWVrU3RhcnRzT24sIF9vcHRpb25zJGxvY2FsZTMsIF9vcHRpb25zJGxvY2FsZTMkb3B0aSwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMywgX2RlZmF1bHRPcHRpb25zJGxvY2FsNDtcblxuICByZXF1aXJlZEFyZ3MoMiwgYXJndW1lbnRzKTtcbiAgdmFyIGZvcm1hdFN0ciA9IFN0cmluZyhkaXJ0eUZvcm1hdFN0cik7XG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IGdldERlZmF1bHRPcHRpb25zKCk7XG4gIHZhciBsb2NhbGUgPSAoX3JlZiA9IChfb3B0aW9ucyRsb2NhbGUgPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMubG9jYWxlKSAhPT0gbnVsbCAmJiBfb3B0aW9ucyRsb2NhbGUgIT09IHZvaWQgMCA/IF9vcHRpb25zJGxvY2FsZSA6IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgIT09IG51bGwgJiYgX3JlZiAhPT0gdm9pZCAwID8gX3JlZiA6IGRlZmF1bHRMb2NhbGU7XG4gIHZhciBmaXJzdFdlZWtDb250YWluc0RhdGUgPSB0b0ludGVnZXIoKF9yZWYyID0gKF9yZWYzID0gKF9yZWY0ID0gKF9vcHRpb25zJGZpcnN0V2Vla0NvbiA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9vcHRpb25zJGZpcnN0V2Vla0NvbiAhPT0gdm9pZCAwID8gX29wdGlvbnMkZmlyc3RXZWVrQ29uIDogb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlMiA9IG9wdGlvbnMubG9jYWxlKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUyID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlMiRvcHRpID0gX29wdGlvbnMkbG9jYWxlMi5vcHRpb25zKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUyJG9wdGkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRpb25zJGxvY2FsZTIkb3B0aS5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWY0ICE9PSB2b2lkIDAgPyBfcmVmNCA6IGRlZmF1bHRPcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZjMgIT09IHZvaWQgMCA/IF9yZWYzIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9IF9kZWZhdWx0T3B0aW9ucyRsb2NhbC5vcHRpb25zKSA9PT0gbnVsbCB8fCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZSkgIT09IG51bGwgJiYgX3JlZjIgIT09IHZvaWQgMCA/IF9yZWYyIDogMSk7IC8vIFRlc3QgaWYgd2Vla1N0YXJ0c09uIGlzIGJldHdlZW4gMSBhbmQgNyBfYW5kXyBpcyBub3QgTmFOXG5cbiAgaWYgKCEoZmlyc3RXZWVrQ29udGFpbnNEYXRlID49IDEgJiYgZmlyc3RXZWVrQ29udGFpbnNEYXRlIDw9IDcpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2ZpcnN0V2Vla0NvbnRhaW5zRGF0ZSBtdXN0IGJlIGJldHdlZW4gMSBhbmQgNyBpbmNsdXNpdmVseScpO1xuICB9XG5cbiAgdmFyIHdlZWtTdGFydHNPbiA9IHRvSW50ZWdlcigoX3JlZjUgPSAoX3JlZjYgPSAoX3JlZjcgPSAoX29wdGlvbnMkd2Vla1N0YXJ0c09uID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX29wdGlvbnMkd2Vla1N0YXJ0c09uICE9PSB2b2lkIDAgPyBfb3B0aW9ucyR3ZWVrU3RhcnRzT24gOiBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0aW9ucyRsb2NhbGUzID0gb3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9vcHRpb25zJGxvY2FsZTMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0aW9ucyRsb2NhbGUzJG9wdGkgPSBfb3B0aW9ucyRsb2NhbGUzLm9wdGlvbnMpID09PSBudWxsIHx8IF9vcHRpb25zJGxvY2FsZTMkb3B0aSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX29wdGlvbnMkbG9jYWxlMyRvcHRpLndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX3JlZjcgIT09IHZvaWQgMCA/IF9yZWY3IDogZGVmYXVsdE9wdGlvbnMud2Vla1N0YXJ0c09uKSAhPT0gbnVsbCAmJiBfcmVmNiAhPT0gdm9pZCAwID8gX3JlZjYgOiAoX2RlZmF1bHRPcHRpb25zJGxvY2FsMyA9IGRlZmF1bHRPcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMyA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDQgPSBfZGVmYXVsdE9wdGlvbnMkbG9jYWwzLm9wdGlvbnMpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbDQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kZWZhdWx0T3B0aW9ucyRsb2NhbDQud2Vla1N0YXJ0c09uKSAhPT0gbnVsbCAmJiBfcmVmNSAhPT0gdm9pZCAwID8gX3JlZjUgOiAwKTsgLy8gVGVzdCBpZiB3ZWVrU3RhcnRzT24gaXMgYmV0d2VlbiAwIGFuZCA2IF9hbmRfIGlzIG5vdCBOYU5cblxuICBpZiAoISh3ZWVrU3RhcnRzT24gPj0gMCAmJiB3ZWVrU3RhcnRzT24gPD0gNikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignd2Vla1N0YXJ0c09uIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA2IGluY2x1c2l2ZWx5Jyk7XG4gIH1cblxuICBpZiAoIWxvY2FsZS5sb2NhbGl6ZSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdsb2NhbGUgbXVzdCBjb250YWluIGxvY2FsaXplIHByb3BlcnR5Jyk7XG4gIH1cblxuICBpZiAoIWxvY2FsZS5mb3JtYXRMb25nKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2xvY2FsZSBtdXN0IGNvbnRhaW4gZm9ybWF0TG9uZyBwcm9wZXJ0eScpO1xuICB9XG5cbiAgdmFyIG9yaWdpbmFsRGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuXG4gIGlmICghaXNWYWxpZChvcmlnaW5hbERhdGUpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xuICB9IC8vIENvbnZlcnQgdGhlIGRhdGUgaW4gc3lzdGVtIHRpbWV6b25lIHRvIHRoZSBzYW1lIGRhdGUgaW4gVVRDKzAwOjAwIHRpbWV6b25lLlxuICAvLyBUaGlzIGVuc3VyZXMgdGhhdCB3aGVuIFVUQyBmdW5jdGlvbnMgd2lsbCBiZSBpbXBsZW1lbnRlZCwgbG9jYWxlcyB3aWxsIGJlIGNvbXBhdGlibGUgd2l0aCB0aGVtLlxuICAvLyBTZWUgYW4gaXNzdWUgYWJvdXQgVVRDIGZ1bmN0aW9uczogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2lzc3Vlcy8zNzZcblxuXG4gIHZhciB0aW1lem9uZU9mZnNldCA9IGdldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMob3JpZ2luYWxEYXRlKTtcbiAgdmFyIHV0Y0RhdGUgPSBzdWJNaWxsaXNlY29uZHMob3JpZ2luYWxEYXRlLCB0aW1lem9uZU9mZnNldCk7XG4gIHZhciBmb3JtYXR0ZXJPcHRpb25zID0ge1xuICAgIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZTogZmlyc3RXZWVrQ29udGFpbnNEYXRlLFxuICAgIHdlZWtTdGFydHNPbjogd2Vla1N0YXJ0c09uLFxuICAgIGxvY2FsZTogbG9jYWxlLFxuICAgIF9vcmlnaW5hbERhdGU6IG9yaWdpbmFsRGF0ZVxuICB9O1xuICB2YXIgcmVzdWx0ID0gZm9ybWF0U3RyLm1hdGNoKGxvbmdGb3JtYXR0aW5nVG9rZW5zUmVnRXhwKS5tYXAoZnVuY3Rpb24gKHN1YnN0cmluZykge1xuICAgIHZhciBmaXJzdENoYXJhY3RlciA9IHN1YnN0cmluZ1swXTtcblxuICAgIGlmIChmaXJzdENoYXJhY3RlciA9PT0gJ3AnIHx8IGZpcnN0Q2hhcmFjdGVyID09PSAnUCcpIHtcbiAgICAgIHZhciBsb25nRm9ybWF0dGVyID0gbG9uZ0Zvcm1hdHRlcnNbZmlyc3RDaGFyYWN0ZXJdO1xuICAgICAgcmV0dXJuIGxvbmdGb3JtYXR0ZXIoc3Vic3RyaW5nLCBsb2NhbGUuZm9ybWF0TG9uZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1YnN0cmluZztcbiAgfSkuam9pbignJykubWF0Y2goZm9ybWF0dGluZ1Rva2Vuc1JlZ0V4cCkubWFwKGZ1bmN0aW9uIChzdWJzdHJpbmcpIHtcbiAgICAvLyBSZXBsYWNlIHR3byBzaW5nbGUgcXVvdGUgY2hhcmFjdGVycyB3aXRoIG9uZSBzaW5nbGUgcXVvdGUgY2hhcmFjdGVyXG4gICAgaWYgKHN1YnN0cmluZyA9PT0gXCInJ1wiKSB7XG4gICAgICByZXR1cm4gXCInXCI7XG4gICAgfVxuXG4gICAgdmFyIGZpcnN0Q2hhcmFjdGVyID0gc3Vic3RyaW5nWzBdO1xuXG4gICAgaWYgKGZpcnN0Q2hhcmFjdGVyID09PSBcIidcIikge1xuICAgICAgcmV0dXJuIGNsZWFuRXNjYXBlZFN0cmluZyhzdWJzdHJpbmcpO1xuICAgIH1cblxuICAgIHZhciBmb3JtYXR0ZXIgPSBmb3JtYXR0ZXJzW2ZpcnN0Q2hhcmFjdGVyXTtcblxuICAgIGlmIChmb3JtYXR0ZXIpIHtcbiAgICAgIGlmICghKG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucyAhPT0gdm9pZCAwICYmIG9wdGlvbnMudXNlQWRkaXRpb25hbFdlZWtZZWFyVG9rZW5zKSAmJiBpc1Byb3RlY3RlZFdlZWtZZWFyVG9rZW4oc3Vic3RyaW5nKSkge1xuICAgICAgICB0aHJvd1Byb3RlY3RlZEVycm9yKHN1YnN0cmluZywgZGlydHlGb3JtYXRTdHIsIFN0cmluZyhkaXJ0eURhdGUpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEob3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zICE9PSB2b2lkIDAgJiYgb3B0aW9ucy51c2VBZGRpdGlvbmFsRGF5T2ZZZWFyVG9rZW5zKSAmJiBpc1Byb3RlY3RlZERheU9mWWVhclRva2VuKHN1YnN0cmluZykpIHtcbiAgICAgICAgdGhyb3dQcm90ZWN0ZWRFcnJvcihzdWJzdHJpbmcsIGRpcnR5Rm9ybWF0U3RyLCBTdHJpbmcoZGlydHlEYXRlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmb3JtYXR0ZXIodXRjRGF0ZSwgc3Vic3RyaW5nLCBsb2NhbGUubG9jYWxpemUsIGZvcm1hdHRlck9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmIChmaXJzdENoYXJhY3Rlci5tYXRjaCh1bmVzY2FwZWRMYXRpbkNoYXJhY3RlclJlZ0V4cCkpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdGb3JtYXQgc3RyaW5nIGNvbnRhaW5zIGFuIHVuZXNjYXBlZCBsYXRpbiBhbHBoYWJldCBjaGFyYWN0ZXIgYCcgKyBmaXJzdENoYXJhY3RlciArICdgJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1YnN0cmluZztcbiAgfSkuam9pbignJyk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNsZWFuRXNjYXBlZFN0cmluZyhpbnB1dCkge1xuICB2YXIgbWF0Y2hlZCA9IGlucHV0Lm1hdGNoKGVzY2FwZWRTdHJpbmdSZWdFeHApO1xuXG4gIGlmICghbWF0Y2hlZCkge1xuICAgIHJldHVybiBpbnB1dDtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVkWzFdLnJlcGxhY2UoZG91YmxlUXVvdGVSZWdFeHAsIFwiJ1wiKTtcbn0iLCJmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL19saWIvcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG4vKipcbiAqIEBuYW1lIGlzRGF0ZVxuICogQGNhdGVnb3J5IENvbW1vbiBIZWxwZXJzXG4gKiBAc3VtbWFyeSBJcyB0aGUgZ2l2ZW4gdmFsdWUgYSBkYXRlP1xuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhbiBpbnN0YW5jZSBvZiBEYXRlLiBUaGUgZnVuY3Rpb24gd29ya3MgZm9yIGRhdGVzIHRyYW5zZmVycmVkIGFjcm9zcyBpZnJhbWVzLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBhIGRhdGVcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gMSBhcmd1bWVudHMgcmVxdWlyZWRcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRm9yIGEgdmFsaWQgZGF0ZTpcbiAqIGNvbnN0IHJlc3VsdCA9IGlzRGF0ZShuZXcgRGF0ZSgpKVxuICogLy89PiB0cnVlXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciBhbiBpbnZhbGlkIGRhdGU6XG4gKiBjb25zdCByZXN1bHQgPSBpc0RhdGUobmV3IERhdGUoTmFOKSlcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3Igc29tZSB2YWx1ZTpcbiAqIGNvbnN0IHJlc3VsdCA9IGlzRGF0ZSgnMjAxNC0wMi0zMScpXG4gKiAvLz0+IGZhbHNlXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciBhbiBvYmplY3Q6XG4gKiBjb25zdCByZXN1bHQgPSBpc0RhdGUoe30pXG4gKiAvLz0+IGZhbHNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlIHx8IF90eXBlb2YodmFsdWUpID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBEYXRlXSc7XG59IiwiaW1wb3J0IGlzRGF0ZSBmcm9tIFwiLi4vaXNEYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9EYXRlIGZyb20gXCIuLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL19saWIvcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG4vKipcbiAqIEBuYW1lIGlzVmFsaWRcbiAqIEBjYXRlZ29yeSBDb21tb24gSGVscGVyc1xuICogQHN1bW1hcnkgSXMgdGhlIGdpdmVuIGRhdGUgdmFsaWQ/XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBSZXR1cm5zIGZhbHNlIGlmIGFyZ3VtZW50IGlzIEludmFsaWQgRGF0ZSBhbmQgdHJ1ZSBvdGhlcndpc2UuXG4gKiBBcmd1bWVudCBpcyBjb252ZXJ0ZWQgdG8gRGF0ZSB1c2luZyBgdG9EYXRlYC4gU2VlIFt0b0RhdGVde0BsaW5rIGh0dHBzOi8vZGF0ZS1mbnMub3JnL2RvY3MvdG9EYXRlfVxuICogSW52YWxpZCBEYXRlIGlzIGEgRGF0ZSwgd2hvc2UgdGltZSB2YWx1ZSBpcyBOYU4uXG4gKlxuICogVGltZSB2YWx1ZSBvZiBEYXRlOiBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjkuMS4xXG4gKlxuICogQHBhcmFtIHsqfSBkYXRlIC0gdGhlIGRhdGUgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtCb29sZWFufSB0aGUgZGF0ZSBpcyB2YWxpZFxuICogQHRocm93cyB7VHlwZUVycm9yfSAxIGFyZ3VtZW50IHJlcXVpcmVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciB0aGUgdmFsaWQgZGF0ZTpcbiAqIGNvbnN0IHJlc3VsdCA9IGlzVmFsaWQobmV3IERhdGUoMjAxNCwgMSwgMzEpKVxuICogLy89PiB0cnVlXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciB0aGUgdmFsdWUsIGNvbnZlcnRhYmxlIGludG8gYSBkYXRlOlxuICogY29uc3QgcmVzdWx0ID0gaXNWYWxpZCgxMzkzODA0ODAwMDAwKVxuICogLy89PiB0cnVlXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciB0aGUgaW52YWxpZCBkYXRlOlxuICogY29uc3QgcmVzdWx0ID0gaXNWYWxpZChuZXcgRGF0ZSgnJykpXG4gKiAvLz0+IGZhbHNlXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNWYWxpZChkaXJ0eURhdGUpIHtcbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG5cbiAgaWYgKCFpc0RhdGUoZGlydHlEYXRlKSAmJiB0eXBlb2YgZGlydHlEYXRlICE9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHJldHVybiAhaXNOYU4oTnVtYmVyKGRhdGUpKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZEZvcm1hdExvbmdGbihhcmdzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIC8vIFRPRE86IFJlbW92ZSBTdHJpbmcoKVxuICAgIHZhciB3aWR0aCA9IG9wdGlvbnMud2lkdGggPyBTdHJpbmcob3B0aW9ucy53aWR0aCkgOiBhcmdzLmRlZmF1bHRXaWR0aDtcbiAgICB2YXIgZm9ybWF0ID0gYXJncy5mb3JtYXRzW3dpZHRoXSB8fCBhcmdzLmZvcm1hdHNbYXJncy5kZWZhdWx0V2lkdGhdO1xuICAgIHJldHVybiBmb3JtYXQ7XG4gIH07XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRMb2NhbGl6ZUZuKGFyZ3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkaXJ0eUluZGV4LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQgPSBvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMgIT09IHZvaWQgMCAmJiBvcHRpb25zLmNvbnRleHQgPyBTdHJpbmcob3B0aW9ucy5jb250ZXh0KSA6ICdzdGFuZGFsb25lJztcbiAgICB2YXIgdmFsdWVzQXJyYXk7XG5cbiAgICBpZiAoY29udGV4dCA9PT0gJ2Zvcm1hdHRpbmcnICYmIGFyZ3MuZm9ybWF0dGluZ1ZhbHVlcykge1xuICAgICAgdmFyIGRlZmF1bHRXaWR0aCA9IGFyZ3MuZGVmYXVsdEZvcm1hdHRpbmdXaWR0aCB8fCBhcmdzLmRlZmF1bHRXaWR0aDtcbiAgICAgIHZhciB3aWR0aCA9IG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucyAhPT0gdm9pZCAwICYmIG9wdGlvbnMud2lkdGggPyBTdHJpbmcob3B0aW9ucy53aWR0aCkgOiBkZWZhdWx0V2lkdGg7XG4gICAgICB2YWx1ZXNBcnJheSA9IGFyZ3MuZm9ybWF0dGluZ1ZhbHVlc1t3aWR0aF0gfHwgYXJncy5mb3JtYXR0aW5nVmFsdWVzW2RlZmF1bHRXaWR0aF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBfZGVmYXVsdFdpZHRoID0gYXJncy5kZWZhdWx0V2lkdGg7XG5cbiAgICAgIHZhciBfd2lkdGggPSBvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMgIT09IHZvaWQgMCAmJiBvcHRpb25zLndpZHRoID8gU3RyaW5nKG9wdGlvbnMud2lkdGgpIDogYXJncy5kZWZhdWx0V2lkdGg7XG5cbiAgICAgIHZhbHVlc0FycmF5ID0gYXJncy52YWx1ZXNbX3dpZHRoXSB8fCBhcmdzLnZhbHVlc1tfZGVmYXVsdFdpZHRoXTtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBhcmdzLmFyZ3VtZW50Q2FsbGJhY2sgPyBhcmdzLmFyZ3VtZW50Q2FsbGJhY2soZGlydHlJbmRleCkgOiBkaXJ0eUluZGV4OyAvLyBAdHMtaWdub3JlOiBGb3Igc29tZSByZWFzb24gVHlwZVNjcmlwdCBqdXN0IGRvbid0IHdhbnQgdG8gbWF0Y2ggaXQsIG5vIG1hdHRlciBob3cgaGFyZCB3ZSB0cnkuIEkgY2hhbGxlbmdlIHlvdSB0byB0cnkgdG8gcmVtb3ZlIGl0IVxuXG4gICAgcmV0dXJuIHZhbHVlc0FycmF5W2luZGV4XTtcbiAgfTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZE1hdGNoRm4oYXJncykge1xuICByZXR1cm4gZnVuY3Rpb24gKHN0cmluZykge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcbiAgICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgIHZhciBtYXRjaFBhdHRlcm4gPSB3aWR0aCAmJiBhcmdzLm1hdGNoUGF0dGVybnNbd2lkdGhdIHx8IGFyZ3MubWF0Y2hQYXR0ZXJuc1thcmdzLmRlZmF1bHRNYXRjaFdpZHRoXTtcbiAgICB2YXIgbWF0Y2hSZXN1bHQgPSBzdHJpbmcubWF0Y2gobWF0Y2hQYXR0ZXJuKTtcblxuICAgIGlmICghbWF0Y2hSZXN1bHQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBtYXRjaGVkU3RyaW5nID0gbWF0Y2hSZXN1bHRbMF07XG4gICAgdmFyIHBhcnNlUGF0dGVybnMgPSB3aWR0aCAmJiBhcmdzLnBhcnNlUGF0dGVybnNbd2lkdGhdIHx8IGFyZ3MucGFyc2VQYXR0ZXJuc1thcmdzLmRlZmF1bHRQYXJzZVdpZHRoXTtcbiAgICB2YXIga2V5ID0gQXJyYXkuaXNBcnJheShwYXJzZVBhdHRlcm5zKSA/IGZpbmRJbmRleChwYXJzZVBhdHRlcm5zLCBmdW5jdGlvbiAocGF0dGVybikge1xuICAgICAgcmV0dXJuIHBhdHRlcm4udGVzdChtYXRjaGVkU3RyaW5nKTtcbiAgICB9KSA6IGZpbmRLZXkocGFyc2VQYXR0ZXJucywgZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QobWF0Y2hlZFN0cmluZyk7XG4gICAgfSk7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhbHVlID0gYXJncy52YWx1ZUNhbGxiYWNrID8gYXJncy52YWx1ZUNhbGxiYWNrKGtleSkgOiBrZXk7XG4gICAgdmFsdWUgPSBvcHRpb25zLnZhbHVlQ2FsbGJhY2sgPyBvcHRpb25zLnZhbHVlQ2FsbGJhY2sodmFsdWUpIDogdmFsdWU7XG4gICAgdmFyIHJlc3QgPSBzdHJpbmcuc2xpY2UobWF0Y2hlZFN0cmluZy5sZW5ndGgpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICByZXN0OiByZXN0XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmluZEtleShvYmplY3QsIHByZWRpY2F0ZSkge1xuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHByZWRpY2F0ZShvYmplY3Rba2V5XSkpIHtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZmluZEluZGV4KGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgZm9yICh2YXIga2V5ID0gMDsga2V5IDwgYXJyYXkubGVuZ3RoOyBrZXkrKykge1xuICAgIGlmIChwcmVkaWNhdGUoYXJyYXlba2V5XSkpIHtcbiAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZE1hdGNoUGF0dGVybkZuKGFyZ3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdmFyIG1hdGNoUmVzdWx0ID0gc3RyaW5nLm1hdGNoKGFyZ3MubWF0Y2hQYXR0ZXJuKTtcbiAgICBpZiAoIW1hdGNoUmVzdWx0KSByZXR1cm4gbnVsbDtcbiAgICB2YXIgbWF0Y2hlZFN0cmluZyA9IG1hdGNoUmVzdWx0WzBdO1xuICAgIHZhciBwYXJzZVJlc3VsdCA9IHN0cmluZy5tYXRjaChhcmdzLnBhcnNlUGF0dGVybik7XG4gICAgaWYgKCFwYXJzZVJlc3VsdCkgcmV0dXJuIG51bGw7XG4gICAgdmFyIHZhbHVlID0gYXJncy52YWx1ZUNhbGxiYWNrID8gYXJncy52YWx1ZUNhbGxiYWNrKHBhcnNlUmVzdWx0WzBdKSA6IHBhcnNlUmVzdWx0WzBdO1xuICAgIHZhbHVlID0gb3B0aW9ucy52YWx1ZUNhbGxiYWNrID8gb3B0aW9ucy52YWx1ZUNhbGxiYWNrKHZhbHVlKSA6IHZhbHVlO1xuICAgIHZhciByZXN0ID0gc3RyaW5nLnNsaWNlKG1hdGNoZWRTdHJpbmcubGVuZ3RoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgcmVzdDogcmVzdFxuICAgIH07XG4gIH07XG59IiwidmFyIGZvcm1hdERpc3RhbmNlTG9jYWxlID0ge1xuICBsZXNzVGhhblhTZWNvbmRzOiB7XG4gICAgb25lOiAnbGVzcyB0aGFuIGEgc2Vjb25kJyxcbiAgICBvdGhlcjogJ2xlc3MgdGhhbiB7e2NvdW50fX0gc2Vjb25kcydcbiAgfSxcbiAgeFNlY29uZHM6IHtcbiAgICBvbmU6ICcxIHNlY29uZCcsXG4gICAgb3RoZXI6ICd7e2NvdW50fX0gc2Vjb25kcydcbiAgfSxcbiAgaGFsZkFNaW51dGU6ICdoYWxmIGEgbWludXRlJyxcbiAgbGVzc1RoYW5YTWludXRlczoge1xuICAgIG9uZTogJ2xlc3MgdGhhbiBhIG1pbnV0ZScsXG4gICAgb3RoZXI6ICdsZXNzIHRoYW4ge3tjb3VudH19IG1pbnV0ZXMnXG4gIH0sXG4gIHhNaW51dGVzOiB7XG4gICAgb25lOiAnMSBtaW51dGUnLFxuICAgIG90aGVyOiAne3tjb3VudH19IG1pbnV0ZXMnXG4gIH0sXG4gIGFib3V0WEhvdXJzOiB7XG4gICAgb25lOiAnYWJvdXQgMSBob3VyJyxcbiAgICBvdGhlcjogJ2Fib3V0IHt7Y291bnR9fSBob3VycydcbiAgfSxcbiAgeEhvdXJzOiB7XG4gICAgb25lOiAnMSBob3VyJyxcbiAgICBvdGhlcjogJ3t7Y291bnR9fSBob3VycydcbiAgfSxcbiAgeERheXM6IHtcbiAgICBvbmU6ICcxIGRheScsXG4gICAgb3RoZXI6ICd7e2NvdW50fX0gZGF5cydcbiAgfSxcbiAgYWJvdXRYV2Vla3M6IHtcbiAgICBvbmU6ICdhYm91dCAxIHdlZWsnLFxuICAgIG90aGVyOiAnYWJvdXQge3tjb3VudH19IHdlZWtzJ1xuICB9LFxuICB4V2Vla3M6IHtcbiAgICBvbmU6ICcxIHdlZWsnLFxuICAgIG90aGVyOiAne3tjb3VudH19IHdlZWtzJ1xuICB9LFxuICBhYm91dFhNb250aHM6IHtcbiAgICBvbmU6ICdhYm91dCAxIG1vbnRoJyxcbiAgICBvdGhlcjogJ2Fib3V0IHt7Y291bnR9fSBtb250aHMnXG4gIH0sXG4gIHhNb250aHM6IHtcbiAgICBvbmU6ICcxIG1vbnRoJyxcbiAgICBvdGhlcjogJ3t7Y291bnR9fSBtb250aHMnXG4gIH0sXG4gIGFib3V0WFllYXJzOiB7XG4gICAgb25lOiAnYWJvdXQgMSB5ZWFyJyxcbiAgICBvdGhlcjogJ2Fib3V0IHt7Y291bnR9fSB5ZWFycydcbiAgfSxcbiAgeFllYXJzOiB7XG4gICAgb25lOiAnMSB5ZWFyJyxcbiAgICBvdGhlcjogJ3t7Y291bnR9fSB5ZWFycydcbiAgfSxcbiAgb3ZlclhZZWFyczoge1xuICAgIG9uZTogJ292ZXIgMSB5ZWFyJyxcbiAgICBvdGhlcjogJ292ZXIge3tjb3VudH19IHllYXJzJ1xuICB9LFxuICBhbG1vc3RYWWVhcnM6IHtcbiAgICBvbmU6ICdhbG1vc3QgMSB5ZWFyJyxcbiAgICBvdGhlcjogJ2FsbW9zdCB7e2NvdW50fX0geWVhcnMnXG4gIH1cbn07XG5cbnZhciBmb3JtYXREaXN0YW5jZSA9IGZ1bmN0aW9uIGZvcm1hdERpc3RhbmNlKHRva2VuLCBjb3VudCwgb3B0aW9ucykge1xuICB2YXIgcmVzdWx0O1xuICB2YXIgdG9rZW5WYWx1ZSA9IGZvcm1hdERpc3RhbmNlTG9jYWxlW3Rva2VuXTtcblxuICBpZiAodHlwZW9mIHRva2VuVmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmVzdWx0ID0gdG9rZW5WYWx1ZTtcbiAgfSBlbHNlIGlmIChjb3VudCA9PT0gMSkge1xuICAgIHJlc3VsdCA9IHRva2VuVmFsdWUub25lO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCA9IHRva2VuVmFsdWUub3RoZXIucmVwbGFjZSgne3tjb3VudH19JywgY291bnQudG9TdHJpbmcoKSk7XG4gIH1cblxuICBpZiAob3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zICE9PSB2b2lkIDAgJiYgb3B0aW9ucy5hZGRTdWZmaXgpIHtcbiAgICBpZiAob3B0aW9ucy5jb21wYXJpc29uICYmIG9wdGlvbnMuY29tcGFyaXNvbiA+IDApIHtcbiAgICAgIHJldHVybiAnaW4gJyArIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdCArICcgYWdvJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZm9ybWF0RGlzdGFuY2U7IiwiaW1wb3J0IGJ1aWxkRm9ybWF0TG9uZ0ZuIGZyb20gXCIuLi8uLi8uLi9fbGliL2J1aWxkRm9ybWF0TG9uZ0ZuL2luZGV4LmpzXCI7XG52YXIgZGF0ZUZvcm1hdHMgPSB7XG4gIGZ1bGw6ICdFRUVFLCBNTU1NIGRvLCB5JyxcbiAgbG9uZzogJ01NTU0gZG8sIHknLFxuICBtZWRpdW06ICdNTU0gZCwgeScsXG4gIHNob3J0OiAnTU0vZGQveXl5eSdcbn07XG52YXIgdGltZUZvcm1hdHMgPSB7XG4gIGZ1bGw6ICdoOm1tOnNzIGEgenp6eicsXG4gIGxvbmc6ICdoOm1tOnNzIGEgeicsXG4gIG1lZGl1bTogJ2g6bW06c3MgYScsXG4gIHNob3J0OiAnaDptbSBhJ1xufTtcbnZhciBkYXRlVGltZUZvcm1hdHMgPSB7XG4gIGZ1bGw6IFwie3tkYXRlfX0gJ2F0JyB7e3RpbWV9fVwiLFxuICBsb25nOiBcInt7ZGF0ZX19ICdhdCcge3t0aW1lfX1cIixcbiAgbWVkaXVtOiAne3tkYXRlfX0sIHt7dGltZX19JyxcbiAgc2hvcnQ6ICd7e2RhdGV9fSwge3t0aW1lfX0nXG59O1xudmFyIGZvcm1hdExvbmcgPSB7XG4gIGRhdGU6IGJ1aWxkRm9ybWF0TG9uZ0ZuKHtcbiAgICBmb3JtYXRzOiBkYXRlRm9ybWF0cyxcbiAgICBkZWZhdWx0V2lkdGg6ICdmdWxsJ1xuICB9KSxcbiAgdGltZTogYnVpbGRGb3JtYXRMb25nRm4oe1xuICAgIGZvcm1hdHM6IHRpbWVGb3JtYXRzLFxuICAgIGRlZmF1bHRXaWR0aDogJ2Z1bGwnXG4gIH0pLFxuICBkYXRlVGltZTogYnVpbGRGb3JtYXRMb25nRm4oe1xuICAgIGZvcm1hdHM6IGRhdGVUaW1lRm9ybWF0cyxcbiAgICBkZWZhdWx0V2lkdGg6ICdmdWxsJ1xuICB9KVxufTtcbmV4cG9ydCBkZWZhdWx0IGZvcm1hdExvbmc7IiwidmFyIGZvcm1hdFJlbGF0aXZlTG9jYWxlID0ge1xuICBsYXN0V2VlazogXCInbGFzdCcgZWVlZSAnYXQnIHBcIixcbiAgeWVzdGVyZGF5OiBcIid5ZXN0ZXJkYXkgYXQnIHBcIixcbiAgdG9kYXk6IFwiJ3RvZGF5IGF0JyBwXCIsXG4gIHRvbW9ycm93OiBcIid0b21vcnJvdyBhdCcgcFwiLFxuICBuZXh0V2VlazogXCJlZWVlICdhdCcgcFwiLFxuICBvdGhlcjogJ1AnXG59O1xuXG52YXIgZm9ybWF0UmVsYXRpdmUgPSBmdW5jdGlvbiBmb3JtYXRSZWxhdGl2ZSh0b2tlbiwgX2RhdGUsIF9iYXNlRGF0ZSwgX29wdGlvbnMpIHtcbiAgcmV0dXJuIGZvcm1hdFJlbGF0aXZlTG9jYWxlW3Rva2VuXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZvcm1hdFJlbGF0aXZlOyIsImltcG9ydCBidWlsZExvY2FsaXplRm4gZnJvbSBcIi4uLy4uLy4uL19saWIvYnVpbGRMb2NhbGl6ZUZuL2luZGV4LmpzXCI7XG52YXIgZXJhVmFsdWVzID0ge1xuICBuYXJyb3c6IFsnQicsICdBJ10sXG4gIGFiYnJldmlhdGVkOiBbJ0JDJywgJ0FEJ10sXG4gIHdpZGU6IFsnQmVmb3JlIENocmlzdCcsICdBbm5vIERvbWluaSddXG59O1xudmFyIHF1YXJ0ZXJWYWx1ZXMgPSB7XG4gIG5hcnJvdzogWycxJywgJzInLCAnMycsICc0J10sXG4gIGFiYnJldmlhdGVkOiBbJ1ExJywgJ1EyJywgJ1EzJywgJ1E0J10sXG4gIHdpZGU6IFsnMXN0IHF1YXJ0ZXInLCAnMm5kIHF1YXJ0ZXInLCAnM3JkIHF1YXJ0ZXInLCAnNHRoIHF1YXJ0ZXInXVxufTsgLy8gTm90ZTogaW4gRW5nbGlzaCwgdGhlIG5hbWVzIG9mIGRheXMgb2YgdGhlIHdlZWsgYW5kIG1vbnRocyBhcmUgY2FwaXRhbGl6ZWQuXG4vLyBJZiB5b3UgYXJlIG1ha2luZyBhIG5ldyBsb2NhbGUgYmFzZWQgb24gdGhpcyBvbmUsIGNoZWNrIGlmIHRoZSBzYW1lIGlzIHRydWUgZm9yIHRoZSBsYW5ndWFnZSB5b3UncmUgd29ya2luZyBvbi5cbi8vIEdlbmVyYWxseSwgZm9ybWF0dGVkIGRhdGVzIHNob3VsZCBsb29rIGxpa2UgdGhleSBhcmUgaW4gdGhlIG1pZGRsZSBvZiBhIHNlbnRlbmNlLFxuLy8gZS5nLiBpbiBTcGFuaXNoIGxhbmd1YWdlIHRoZSB3ZWVrZGF5cyBhbmQgbW9udGhzIHNob3VsZCBiZSBpbiB0aGUgbG93ZXJjYXNlLlxuXG52YXIgbW9udGhWYWx1ZXMgPSB7XG4gIG5hcnJvdzogWydKJywgJ0YnLCAnTScsICdBJywgJ00nLCAnSicsICdKJywgJ0EnLCAnUycsICdPJywgJ04nLCAnRCddLFxuICBhYmJyZXZpYXRlZDogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxuICB3aWRlOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXVxufTtcbnZhciBkYXlWYWx1ZXMgPSB7XG4gIG5hcnJvdzogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ10sXG4gIHNob3J0OiBbJ1N1JywgJ01vJywgJ1R1JywgJ1dlJywgJ1RoJywgJ0ZyJywgJ1NhJ10sXG4gIGFiYnJldmlhdGVkOiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxuICB3aWRlOiBbJ1N1bmRheScsICdNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5J11cbn07XG52YXIgZGF5UGVyaW9kVmFsdWVzID0ge1xuICBuYXJyb3c6IHtcbiAgICBhbTogJ2EnLFxuICAgIHBtOiAncCcsXG4gICAgbWlkbmlnaHQ6ICdtaScsXG4gICAgbm9vbjogJ24nLFxuICAgIG1vcm5pbmc6ICdtb3JuaW5nJyxcbiAgICBhZnRlcm5vb246ICdhZnRlcm5vb24nLFxuICAgIGV2ZW5pbmc6ICdldmVuaW5nJyxcbiAgICBuaWdodDogJ25pZ2h0J1xuICB9LFxuICBhYmJyZXZpYXRlZDoge1xuICAgIGFtOiAnQU0nLFxuICAgIHBtOiAnUE0nLFxuICAgIG1pZG5pZ2h0OiAnbWlkbmlnaHQnLFxuICAgIG5vb246ICdub29uJyxcbiAgICBtb3JuaW5nOiAnbW9ybmluZycsXG4gICAgYWZ0ZXJub29uOiAnYWZ0ZXJub29uJyxcbiAgICBldmVuaW5nOiAnZXZlbmluZycsXG4gICAgbmlnaHQ6ICduaWdodCdcbiAgfSxcbiAgd2lkZToge1xuICAgIGFtOiAnYS5tLicsXG4gICAgcG06ICdwLm0uJyxcbiAgICBtaWRuaWdodDogJ21pZG5pZ2h0JyxcbiAgICBub29uOiAnbm9vbicsXG4gICAgbW9ybmluZzogJ21vcm5pbmcnLFxuICAgIGFmdGVybm9vbjogJ2FmdGVybm9vbicsXG4gICAgZXZlbmluZzogJ2V2ZW5pbmcnLFxuICAgIG5pZ2h0OiAnbmlnaHQnXG4gIH1cbn07XG52YXIgZm9ybWF0dGluZ0RheVBlcmlvZFZhbHVlcyA9IHtcbiAgbmFycm93OiB7XG4gICAgYW06ICdhJyxcbiAgICBwbTogJ3AnLFxuICAgIG1pZG5pZ2h0OiAnbWknLFxuICAgIG5vb246ICduJyxcbiAgICBtb3JuaW5nOiAnaW4gdGhlIG1vcm5pbmcnLFxuICAgIGFmdGVybm9vbjogJ2luIHRoZSBhZnRlcm5vb24nLFxuICAgIGV2ZW5pbmc6ICdpbiB0aGUgZXZlbmluZycsXG4gICAgbmlnaHQ6ICdhdCBuaWdodCdcbiAgfSxcbiAgYWJicmV2aWF0ZWQ6IHtcbiAgICBhbTogJ0FNJyxcbiAgICBwbTogJ1BNJyxcbiAgICBtaWRuaWdodDogJ21pZG5pZ2h0JyxcbiAgICBub29uOiAnbm9vbicsXG4gICAgbW9ybmluZzogJ2luIHRoZSBtb3JuaW5nJyxcbiAgICBhZnRlcm5vb246ICdpbiB0aGUgYWZ0ZXJub29uJyxcbiAgICBldmVuaW5nOiAnaW4gdGhlIGV2ZW5pbmcnLFxuICAgIG5pZ2h0OiAnYXQgbmlnaHQnXG4gIH0sXG4gIHdpZGU6IHtcbiAgICBhbTogJ2EubS4nLFxuICAgIHBtOiAncC5tLicsXG4gICAgbWlkbmlnaHQ6ICdtaWRuaWdodCcsXG4gICAgbm9vbjogJ25vb24nLFxuICAgIG1vcm5pbmc6ICdpbiB0aGUgbW9ybmluZycsXG4gICAgYWZ0ZXJub29uOiAnaW4gdGhlIGFmdGVybm9vbicsXG4gICAgZXZlbmluZzogJ2luIHRoZSBldmVuaW5nJyxcbiAgICBuaWdodDogJ2F0IG5pZ2h0J1xuICB9XG59O1xuXG52YXIgb3JkaW5hbE51bWJlciA9IGZ1bmN0aW9uIG9yZGluYWxOdW1iZXIoZGlydHlOdW1iZXIsIF9vcHRpb25zKSB7XG4gIHZhciBudW1iZXIgPSBOdW1iZXIoZGlydHlOdW1iZXIpOyAvLyBJZiBvcmRpbmFsIG51bWJlcnMgZGVwZW5kIG9uIGNvbnRleHQsIGZvciBleGFtcGxlLFxuICAvLyBpZiB0aGV5IGFyZSBkaWZmZXJlbnQgZm9yIGRpZmZlcmVudCBncmFtbWF0aWNhbCBnZW5kZXJzLFxuICAvLyB1c2UgYG9wdGlvbnMudW5pdGAuXG4gIC8vXG4gIC8vIGB1bml0YCBjYW4gYmUgJ3llYXInLCAncXVhcnRlcicsICdtb250aCcsICd3ZWVrJywgJ2RhdGUnLCAnZGF5T2ZZZWFyJyxcbiAgLy8gJ2RheScsICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnLlxuXG4gIHZhciByZW0xMDAgPSBudW1iZXIgJSAxMDA7XG5cbiAgaWYgKHJlbTEwMCA+IDIwIHx8IHJlbTEwMCA8IDEwKSB7XG4gICAgc3dpdGNoIChyZW0xMDAgJSAxMCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gbnVtYmVyICsgJ3N0JztcblxuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gbnVtYmVyICsgJ25kJztcblxuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gbnVtYmVyICsgJ3JkJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVtYmVyICsgJ3RoJztcbn07XG5cbnZhciBsb2NhbGl6ZSA9IHtcbiAgb3JkaW5hbE51bWJlcjogb3JkaW5hbE51bWJlcixcbiAgZXJhOiBidWlsZExvY2FsaXplRm4oe1xuICAgIHZhbHVlczogZXJhVmFsdWVzLFxuICAgIGRlZmF1bHRXaWR0aDogJ3dpZGUnXG4gIH0pLFxuICBxdWFydGVyOiBidWlsZExvY2FsaXplRm4oe1xuICAgIHZhbHVlczogcXVhcnRlclZhbHVlcyxcbiAgICBkZWZhdWx0V2lkdGg6ICd3aWRlJyxcbiAgICBhcmd1bWVudENhbGxiYWNrOiBmdW5jdGlvbiBhcmd1bWVudENhbGxiYWNrKHF1YXJ0ZXIpIHtcbiAgICAgIHJldHVybiBxdWFydGVyIC0gMTtcbiAgICB9XG4gIH0pLFxuICBtb250aDogYnVpbGRMb2NhbGl6ZUZuKHtcbiAgICB2YWx1ZXM6IG1vbnRoVmFsdWVzLFxuICAgIGRlZmF1bHRXaWR0aDogJ3dpZGUnXG4gIH0pLFxuICBkYXk6IGJ1aWxkTG9jYWxpemVGbih7XG4gICAgdmFsdWVzOiBkYXlWYWx1ZXMsXG4gICAgZGVmYXVsdFdpZHRoOiAnd2lkZSdcbiAgfSksXG4gIGRheVBlcmlvZDogYnVpbGRMb2NhbGl6ZUZuKHtcbiAgICB2YWx1ZXM6IGRheVBlcmlvZFZhbHVlcyxcbiAgICBkZWZhdWx0V2lkdGg6ICd3aWRlJyxcbiAgICBmb3JtYXR0aW5nVmFsdWVzOiBmb3JtYXR0aW5nRGF5UGVyaW9kVmFsdWVzLFxuICAgIGRlZmF1bHRGb3JtYXR0aW5nV2lkdGg6ICd3aWRlJ1xuICB9KVxufTtcbmV4cG9ydCBkZWZhdWx0IGxvY2FsaXplOyIsImltcG9ydCBidWlsZE1hdGNoRm4gZnJvbSBcIi4uLy4uLy4uL19saWIvYnVpbGRNYXRjaEZuL2luZGV4LmpzXCI7XG5pbXBvcnQgYnVpbGRNYXRjaFBhdHRlcm5GbiBmcm9tIFwiLi4vLi4vLi4vX2xpYi9idWlsZE1hdGNoUGF0dGVybkZuL2luZGV4LmpzXCI7XG52YXIgbWF0Y2hPcmRpbmFsTnVtYmVyUGF0dGVybiA9IC9eKFxcZCspKHRofHN0fG5kfHJkKT8vaTtcbnZhciBwYXJzZU9yZGluYWxOdW1iZXJQYXR0ZXJuID0gL1xcZCsvaTtcbnZhciBtYXRjaEVyYVBhdHRlcm5zID0ge1xuICBuYXJyb3c6IC9eKGJ8YSkvaSxcbiAgYWJicmV2aWF0ZWQ6IC9eKGJcXC4/XFxzP2NcXC4/fGJcXC4/XFxzP2NcXC4/XFxzP2VcXC4/fGFcXC4/XFxzP2RcXC4/fGNcXC4/XFxzP2VcXC4/KS9pLFxuICB3aWRlOiAvXihiZWZvcmUgY2hyaXN0fGJlZm9yZSBjb21tb24gZXJhfGFubm8gZG9taW5pfGNvbW1vbiBlcmEpL2lcbn07XG52YXIgcGFyc2VFcmFQYXR0ZXJucyA9IHtcbiAgYW55OiBbL15iL2ksIC9eKGF8YykvaV1cbn07XG52YXIgbWF0Y2hRdWFydGVyUGF0dGVybnMgPSB7XG4gIG5hcnJvdzogL15bMTIzNF0vaSxcbiAgYWJicmV2aWF0ZWQ6IC9ecVsxMjM0XS9pLFxuICB3aWRlOiAvXlsxMjM0XSh0aHxzdHxuZHxyZCk/IHF1YXJ0ZXIvaVxufTtcbnZhciBwYXJzZVF1YXJ0ZXJQYXR0ZXJucyA9IHtcbiAgYW55OiBbLzEvaSwgLzIvaSwgLzMvaSwgLzQvaV1cbn07XG52YXIgbWF0Y2hNb250aFBhdHRlcm5zID0ge1xuICBuYXJyb3c6IC9eW2pmbWFzb25kXS9pLFxuICBhYmJyZXZpYXRlZDogL14oamFufGZlYnxtYXJ8YXByfG1heXxqdW58anVsfGF1Z3xzZXB8b2N0fG5vdnxkZWMpL2ksXG4gIHdpZGU6IC9eKGphbnVhcnl8ZmVicnVhcnl8bWFyY2h8YXByaWx8bWF5fGp1bmV8anVseXxhdWd1c3R8c2VwdGVtYmVyfG9jdG9iZXJ8bm92ZW1iZXJ8ZGVjZW1iZXIpL2lcbn07XG52YXIgcGFyc2VNb250aFBhdHRlcm5zID0ge1xuICBuYXJyb3c6IFsvXmovaSwgL15mL2ksIC9ebS9pLCAvXmEvaSwgL15tL2ksIC9eai9pLCAvXmovaSwgL15hL2ksIC9ecy9pLCAvXm8vaSwgL15uL2ksIC9eZC9pXSxcbiAgYW55OiBbL15qYS9pLCAvXmYvaSwgL15tYXIvaSwgL15hcC9pLCAvXm1heS9pLCAvXmp1bi9pLCAvXmp1bC9pLCAvXmF1L2ksIC9ecy9pLCAvXm8vaSwgL15uL2ksIC9eZC9pXVxufTtcbnZhciBtYXRjaERheVBhdHRlcm5zID0ge1xuICBuYXJyb3c6IC9eW3NtdHdmXS9pLFxuICBzaG9ydDogL14oc3V8bW98dHV8d2V8dGh8ZnJ8c2EpL2ksXG4gIGFiYnJldmlhdGVkOiAvXihzdW58bW9ufHR1ZXx3ZWR8dGh1fGZyaXxzYXQpL2ksXG4gIHdpZGU6IC9eKHN1bmRheXxtb25kYXl8dHVlc2RheXx3ZWRuZXNkYXl8dGh1cnNkYXl8ZnJpZGF5fHNhdHVyZGF5KS9pXG59O1xudmFyIHBhcnNlRGF5UGF0dGVybnMgPSB7XG4gIG5hcnJvdzogWy9ecy9pLCAvXm0vaSwgL150L2ksIC9edy9pLCAvXnQvaSwgL15mL2ksIC9ecy9pXSxcbiAgYW55OiBbL15zdS9pLCAvXm0vaSwgL150dS9pLCAvXncvaSwgL150aC9pLCAvXmYvaSwgL15zYS9pXVxufTtcbnZhciBtYXRjaERheVBlcmlvZFBhdHRlcm5zID0ge1xuICBuYXJyb3c6IC9eKGF8cHxtaXxufChpbiB0aGV8YXQpIChtb3JuaW5nfGFmdGVybm9vbnxldmVuaW5nfG5pZ2h0KSkvaSxcbiAgYW55OiAvXihbYXBdXFwuP1xccz9tXFwuP3xtaWRuaWdodHxub29ufChpbiB0aGV8YXQpIChtb3JuaW5nfGFmdGVybm9vbnxldmVuaW5nfG5pZ2h0KSkvaVxufTtcbnZhciBwYXJzZURheVBlcmlvZFBhdHRlcm5zID0ge1xuICBhbnk6IHtcbiAgICBhbTogL15hL2ksXG4gICAgcG06IC9ecC9pLFxuICAgIG1pZG5pZ2h0OiAvXm1pL2ksXG4gICAgbm9vbjogL15uby9pLFxuICAgIG1vcm5pbmc6IC9tb3JuaW5nL2ksXG4gICAgYWZ0ZXJub29uOiAvYWZ0ZXJub29uL2ksXG4gICAgZXZlbmluZzogL2V2ZW5pbmcvaSxcbiAgICBuaWdodDogL25pZ2h0L2lcbiAgfVxufTtcbnZhciBtYXRjaCA9IHtcbiAgb3JkaW5hbE51bWJlcjogYnVpbGRNYXRjaFBhdHRlcm5Gbih7XG4gICAgbWF0Y2hQYXR0ZXJuOiBtYXRjaE9yZGluYWxOdW1iZXJQYXR0ZXJuLFxuICAgIHBhcnNlUGF0dGVybjogcGFyc2VPcmRpbmFsTnVtYmVyUGF0dGVybixcbiAgICB2YWx1ZUNhbGxiYWNrOiBmdW5jdGlvbiB2YWx1ZUNhbGxiYWNrKHZhbHVlKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICB9XG4gIH0pLFxuICBlcmE6IGJ1aWxkTWF0Y2hGbih7XG4gICAgbWF0Y2hQYXR0ZXJuczogbWF0Y2hFcmFQYXR0ZXJucyxcbiAgICBkZWZhdWx0TWF0Y2hXaWR0aDogJ3dpZGUnLFxuICAgIHBhcnNlUGF0dGVybnM6IHBhcnNlRXJhUGF0dGVybnMsXG4gICAgZGVmYXVsdFBhcnNlV2lkdGg6ICdhbnknXG4gIH0pLFxuICBxdWFydGVyOiBidWlsZE1hdGNoRm4oe1xuICAgIG1hdGNoUGF0dGVybnM6IG1hdGNoUXVhcnRlclBhdHRlcm5zLFxuICAgIGRlZmF1bHRNYXRjaFdpZHRoOiAnd2lkZScsXG4gICAgcGFyc2VQYXR0ZXJuczogcGFyc2VRdWFydGVyUGF0dGVybnMsXG4gICAgZGVmYXVsdFBhcnNlV2lkdGg6ICdhbnknLFxuICAgIHZhbHVlQ2FsbGJhY2s6IGZ1bmN0aW9uIHZhbHVlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgIHJldHVybiBpbmRleCArIDE7XG4gICAgfVxuICB9KSxcbiAgbW9udGg6IGJ1aWxkTWF0Y2hGbih7XG4gICAgbWF0Y2hQYXR0ZXJuczogbWF0Y2hNb250aFBhdHRlcm5zLFxuICAgIGRlZmF1bHRNYXRjaFdpZHRoOiAnd2lkZScsXG4gICAgcGFyc2VQYXR0ZXJuczogcGFyc2VNb250aFBhdHRlcm5zLFxuICAgIGRlZmF1bHRQYXJzZVdpZHRoOiAnYW55J1xuICB9KSxcbiAgZGF5OiBidWlsZE1hdGNoRm4oe1xuICAgIG1hdGNoUGF0dGVybnM6IG1hdGNoRGF5UGF0dGVybnMsXG4gICAgZGVmYXVsdE1hdGNoV2lkdGg6ICd3aWRlJyxcbiAgICBwYXJzZVBhdHRlcm5zOiBwYXJzZURheVBhdHRlcm5zLFxuICAgIGRlZmF1bHRQYXJzZVdpZHRoOiAnYW55J1xuICB9KSxcbiAgZGF5UGVyaW9kOiBidWlsZE1hdGNoRm4oe1xuICAgIG1hdGNoUGF0dGVybnM6IG1hdGNoRGF5UGVyaW9kUGF0dGVybnMsXG4gICAgZGVmYXVsdE1hdGNoV2lkdGg6ICdhbnknLFxuICAgIHBhcnNlUGF0dGVybnM6IHBhcnNlRGF5UGVyaW9kUGF0dGVybnMsXG4gICAgZGVmYXVsdFBhcnNlV2lkdGg6ICdhbnknXG4gIH0pXG59O1xuZXhwb3J0IGRlZmF1bHQgbWF0Y2g7IiwiaW1wb3J0IGZvcm1hdERpc3RhbmNlIGZyb20gXCIuL19saWIvZm9ybWF0RGlzdGFuY2UvaW5kZXguanNcIjtcbmltcG9ydCBmb3JtYXRMb25nIGZyb20gXCIuL19saWIvZm9ybWF0TG9uZy9pbmRleC5qc1wiO1xuaW1wb3J0IGZvcm1hdFJlbGF0aXZlIGZyb20gXCIuL19saWIvZm9ybWF0UmVsYXRpdmUvaW5kZXguanNcIjtcbmltcG9ydCBsb2NhbGl6ZSBmcm9tIFwiLi9fbGliL2xvY2FsaXplL2luZGV4LmpzXCI7XG5pbXBvcnQgbWF0Y2ggZnJvbSBcIi4vX2xpYi9tYXRjaC9pbmRleC5qc1wiO1xuXG4vKipcbiAqIEB0eXBlIHtMb2NhbGV9XG4gKiBAY2F0ZWdvcnkgTG9jYWxlc1xuICogQHN1bW1hcnkgRW5nbGlzaCBsb2NhbGUgKFVuaXRlZCBTdGF0ZXMpLlxuICogQGxhbmd1YWdlIEVuZ2xpc2hcbiAqIEBpc28tNjM5LTIgZW5nXG4gKiBAYXV0aG9yIFNhc2hhIEtvc3MgW0Brb3Nzbm9jb3JwXXtAbGluayBodHRwczovL2dpdGh1Yi5jb20va29zc25vY29ycH1cbiAqIEBhdXRob3IgTGVzaGEgS29zcyBbQGxlc2hha29zc117QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2xlc2hha29zc31cbiAqL1xudmFyIGxvY2FsZSA9IHtcbiAgY29kZTogJ2VuLVVTJyxcbiAgZm9ybWF0RGlzdGFuY2U6IGZvcm1hdERpc3RhbmNlLFxuICBmb3JtYXRMb25nOiBmb3JtYXRMb25nLFxuICBmb3JtYXRSZWxhdGl2ZTogZm9ybWF0UmVsYXRpdmUsXG4gIGxvY2FsaXplOiBsb2NhbGl6ZSxcbiAgbWF0Y2g6IG1hdGNoLFxuICBvcHRpb25zOiB7XG4gICAgd2Vla1N0YXJ0c09uOiAwXG4gICAgLyogU3VuZGF5ICovXG4gICAgLFxuICAgIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZTogMVxuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgbG9jYWxlOyIsImltcG9ydCBhZGRNaWxsaXNlY29uZHMgZnJvbSBcIi4uL2FkZE1pbGxpc2Vjb25kcy9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vX2xpYi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbmltcG9ydCB0b0ludGVnZXIgZnJvbSBcIi4uL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzXCI7XG4vKipcbiAqIEBuYW1lIHN1Yk1pbGxpc2Vjb25kc1xuICogQGNhdGVnb3J5IE1pbGxpc2Vjb25kIEhlbHBlcnNcbiAqIEBzdW1tYXJ5IFN1YnRyYWN0IHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHRoZSBnaXZlbiBkYXRlLlxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogU3VidHJhY3QgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZyb20gdGhlIGdpdmVuIGRhdGUuXG4gKlxuICogQHBhcmFtIHtEYXRlfE51bWJlcn0gZGF0ZSAtIHRoZSBkYXRlIHRvIGJlIGNoYW5nZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBhbW91bnQgLSB0aGUgYW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byBiZSBzdWJ0cmFjdGVkLiBQb3NpdGl2ZSBkZWNpbWFscyB3aWxsIGJlIHJvdW5kZWQgdXNpbmcgYE1hdGguZmxvb3JgLCBkZWNpbWFscyBsZXNzIHRoYW4gemVybyB3aWxsIGJlIHJvdW5kZWQgdXNpbmcgYE1hdGguY2VpbGAuXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIG5ldyBkYXRlIHdpdGggdGhlIG1pbGxpc2Vjb25kcyBzdWJ0cmFjdGVkXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IDIgYXJndW1lbnRzIHJlcXVpcmVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIFN1YnRyYWN0IDc1MCBtaWxsaXNlY29uZHMgZnJvbSAxMCBKdWx5IDIwMTQgMTI6NDU6MzAuMDAwOlxuICogY29uc3QgcmVzdWx0ID0gc3ViTWlsbGlzZWNvbmRzKG5ldyBEYXRlKDIwMTQsIDYsIDEwLCAxMiwgNDUsIDMwLCAwKSwgNzUwKVxuICogLy89PiBUaHUgSnVsIDEwIDIwMTQgMTI6NDU6MjkuMjUwXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3ViTWlsbGlzZWNvbmRzKGRpcnR5RGF0ZSwgZGlydHlBbW91bnQpIHtcbiAgcmVxdWlyZWRBcmdzKDIsIGFyZ3VtZW50cyk7XG4gIHZhciBhbW91bnQgPSB0b0ludGVnZXIoZGlydHlBbW91bnQpO1xuICByZXR1cm4gYWRkTWlsbGlzZWNvbmRzKGRpcnR5RGF0ZSwgLWFtb3VudCk7XG59IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuLyoqXG4gKiBAbmFtZSB0b0RhdGVcbiAqIEBjYXRlZ29yeSBDb21tb24gSGVscGVyc1xuICogQHN1bW1hcnkgQ29udmVydCB0aGUgZ2l2ZW4gYXJndW1lbnQgdG8gYW4gaW5zdGFuY2Ugb2YgRGF0ZS5cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbnZlcnQgdGhlIGdpdmVuIGFyZ3VtZW50IHRvIGFuIGluc3RhbmNlIG9mIERhdGUuXG4gKlxuICogSWYgdGhlIGFyZ3VtZW50IGlzIGFuIGluc3RhbmNlIG9mIERhdGUsIHRoZSBmdW5jdGlvbiByZXR1cm5zIGl0cyBjbG9uZS5cbiAqXG4gKiBJZiB0aGUgYXJndW1lbnQgaXMgYSBudW1iZXIsIGl0IGlzIHRyZWF0ZWQgYXMgYSB0aW1lc3RhbXAuXG4gKlxuICogSWYgdGhlIGFyZ3VtZW50IGlzIG5vbmUgb2YgdGhlIGFib3ZlLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBJbnZhbGlkIERhdGUuXG4gKlxuICogKipOb3RlKio6ICphbGwqIERhdGUgYXJndW1lbnRzIHBhc3NlZCB0byBhbnkgKmRhdGUtZm5zKiBmdW5jdGlvbiBpcyBwcm9jZXNzZWQgYnkgYHRvRGF0ZWAuXG4gKlxuICogQHBhcmFtIHtEYXRlfE51bWJlcn0gYXJndW1lbnQgLSB0aGUgdmFsdWUgdG8gY29udmVydFxuICogQHJldHVybnMge0RhdGV9IHRoZSBwYXJzZWQgZGF0ZSBpbiB0aGUgbG9jYWwgdGltZSB6b25lXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IDEgYXJndW1lbnQgcmVxdWlyZWRcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gQ2xvbmUgdGhlIGRhdGU6XG4gKiBjb25zdCByZXN1bHQgPSB0b0RhdGUobmV3IERhdGUoMjAxNCwgMSwgMTEsIDExLCAzMCwgMzApKVxuICogLy89PiBUdWUgRmViIDExIDIwMTQgMTE6MzA6MzBcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gQ29udmVydCB0aGUgdGltZXN0YW1wIHRvIGRhdGU6XG4gKiBjb25zdCByZXN1bHQgPSB0b0RhdGUoMTM5MjA5ODQzMDAwMClcbiAqIC8vPT4gVHVlIEZlYiAxMSAyMDE0IDExOjMwOjMwXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9EYXRlKGFyZ3VtZW50KSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgYXJnU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50KTsgLy8gQ2xvbmUgdGhlIGRhdGVcblxuICBpZiAoYXJndW1lbnQgaW5zdGFuY2VvZiBEYXRlIHx8IF90eXBlb2YoYXJndW1lbnQpID09PSAnb2JqZWN0JyAmJiBhcmdTdHIgPT09ICdbb2JqZWN0IERhdGVdJykge1xuICAgIC8vIFByZXZlbnQgdGhlIGRhdGUgdG8gbG9zZSB0aGUgbWlsbGlzZWNvbmRzIHdoZW4gcGFzc2VkIHRvIG5ldyBEYXRlKCkgaW4gSUUxMFxuICAgIHJldHVybiBuZXcgRGF0ZShhcmd1bWVudC5nZXRUaW1lKCkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBhcmd1bWVudCA9PT0gJ251bWJlcicgfHwgYXJnU3RyID09PSAnW29iamVjdCBOdW1iZXJdJykge1xuICAgIHJldHVybiBuZXcgRGF0ZShhcmd1bWVudCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCh0eXBlb2YgYXJndW1lbnQgPT09ICdzdHJpbmcnIHx8IGFyZ1N0ciA9PT0gJ1tvYmplY3QgU3RyaW5nXScpICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcIlN0YXJ0aW5nIHdpdGggdjIuMC4wLWJldGEuMSBkYXRlLWZucyBkb2Vzbid0IGFjY2VwdCBzdHJpbmdzIGFzIGRhdGUgYXJndW1lbnRzLiBQbGVhc2UgdXNlIGBwYXJzZUlTT2AgdG8gcGFyc2Ugc3RyaW5ncy4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91cGdyYWRlR3VpZGUubWQjc3RyaW5nLWFyZ3VtZW50c1wiKTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcblxuICAgICAgY29uc29sZS53YXJuKG5ldyBFcnJvcigpLnN0YWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERhdGUoTmFOKTtcbiAgfVxufSIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuXG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB1cGRhdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuXG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuXG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG5cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuXG4gIGNzcyArPSBvYmouY3NzO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJpbXBvcnQge2Zvcm1hdH0gZnJvbSBcImRhdGUtZm5zXCI7XG5pbXBvcnQgeyBlbCB9IGZyb20gXCJkYXRlLWZucy9sb2NhbGVcIjtcbmltcG9ydCBDb2xjYWRlIGZyb20gJ2NvbGNhZGUnO1xuaW1wb3J0IEljb25FZGl0IGZyb20gJy4vaW1hZ2VzL2VkaXQucG5nJztcbmltcG9ydCBJY29uRGVsZXRlIGZyb20gJy4vaW1hZ2VzL2Jpbi5wbmcnO1xuXG5cbi8vIERPTSBtYW5pcHVsYXRpb24gb2JqZWN0IFxuZXhwb3J0IGNvbnN0IGRvbU1hbmlwdWxhdG9yID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIGRpc3BsYXlzIGFsbCB0b2RvcyBzdG9yZWQgaW4gYXJyYXkgdG8gdGhlIGRvbVxuICAgIGZ1bmN0aW9uIHJlbmRlclRvRG9zKHRvZG9zLCBlbGVtZW50KSB7XG5cbiAgICAgICAgXG5cbiAgICAgICAgLy8gZ3JhYiByZWxldmVudCB0b2RvIGl0ZW1zXG4gICAgICAgIGNvbnN0IHRvRG9MaXN0ID0gdG9kb3NbdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCldO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0b0RvTGlzdCk7XG4gICAgICAgIFxuXG4gICAgICAgIC8vIGNsZWFyIG91dCBkaXNwbGF5IGJlZm9yZSByZWRpc3BsYXlpbmcgYWxsIHRvLWRvc1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IFwiXCIgXG4gICAgICAgIFxuICAgICAgICAvLyBkb250IHJlbmRlciBhbiBlbXB0eSBsaXN0XG4gICAgICAgIGlmICh0b0RvTGlzdC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBjcmVhdGUgYSB0by1kbyBlbGVtZW50IGZvciBlYWNoIHRvZG8gc3RvcmVkIGluIHRoZSBwYXNzZWQgYXJyYXkgXG4gICAgICAgIC8vIGFuZCBhcHBlbmQgdGhlbSB0byB0aGUgZG9tIGVsZW1lbnQgc3VwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgIHRvRG9MaXN0LmZvckVhY2goKHRvZG8sIGkpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY3JlYXRlIG1haW4gYm9keSBvZiB0aGUgdG8tZG8gaXRlbVxuICAgICAgICAgICAgY29uc3QgdG9Eb0JvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmNsYXNzTGlzdC5hZGQoJ3RvZG8nKTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmNsYXNzTGlzdC5hZGQoYHByaW9yaXR5LSR7dG9kby5wcmlvcml0eX1gKTtcbiAgICAgICAgICAgIC8vIGdpdmUgZWFjaCB0by1kbyBlbGVtZW50IGEgdW5pcXVlIHZhbHVlIHRoYXQgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgIC8vIGl0J3MgZGF0YSdzIHBvc2l0aW9uIGluIHRoZSBhcnJheVxuICAgICAgICAgICAgdG9Eb0JvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XG4gICAgICAgICAgICAvLyBzZXQgZGF0YSBhdHJyaWJ1dGUgdG8gdGhlIHRvLWRvIGl0ZW1zIHByb2plY3QgbmFtZVxuICAgICAgICAgICAgdG9Eb0JvZHkuc2V0QXR0cmlidXRlKCdkYXRhLXByb2plY3QnLCBgJHt0b2RvLnByb2plY3R9YClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gY2hlY2tib3ggXG4gICAgICAgICAgICBjb25zdCB0b0RvQ2hlY2tCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRvRG9DaGVja0JveC5jbGFzc0xpc3QuYWRkKCd0b2RvX19jb21wbGV0ZScpO1xuICAgICAgICAgICAgdG9Eb0NoZWNrQm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB0b2dnbGVDaGVja0JveChlLCB0b2RvcywgZWxlbWVudCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjcmVhdGUgdG8tZG8gaXRlbSB0aXRsZVxuICAgICAgICAgICAgY29uc3QgdG9Eb1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0b0RvVGl0bGUuY2xhc3NMaXN0LmFkZCgndG9kb19fdGl0bGUnKTtcbiAgICAgICAgICAgIHRvRG9UaXRsZS50ZXh0Q29udGVudCA9IHRvZG8ubmFtZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gZGV0YWlscyBidXR0b25cbiAgICAgICAgICAgIGNvbnN0IHRvRG9EZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0b0RvRGV0YWlscy5jbGFzc0xpc3QuYWRkKCd0b2RvX19kZXRhaWwnKTtcbiAgICAgICAgICAgIHRvRG9EZXRhaWxzLnRleHRDb250ZW50ID0gJ2RldGFpbHMnO1xuICAgICAgICAgICAgdG9Eb0RldGFpbHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckRldGFpbHMoZSwgdG9Eb0xpc3QpO1xuICAgICAgICAgICAgfSlcbiAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHRvLWRvIGR1ZSBkYXRlIGxhYmVsLlxuICAgICAgICAgICAgLy8gZGlzcGxheXMgYSBodW1hbiByZWFkYWJsZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0ZSBpbnB1dCBzdHJpbmdcbiAgICAgICAgICAgIGNvbnN0IHRvRG9EYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0b0RvRGF0ZS5jbGFzc0xpc3QuYWRkKCd0b2RvX19kYXRlJyk7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IGRhdGUgc3RyaW5nIGludG8gYSBkYXRlIHRoZSBmb3JtIG9mIFwiSmFuIDEydGhcIlxuICAgICAgICAgICAgY29uc3QgZGF0ZU9iamVjdCA9IG5ldyBEYXRlKHRvZG8uZGF0ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXRlTW9udGggPSBmb3JtYXQoZGF0ZU9iamVjdCwgJ01NTScpO1xuICAgICAgICAgICAgY29uc3QgZGF0ZURheSA9IGZvcm1hdChkYXRlT2JqZWN0LCAnZG8nKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGVGb3JtYXRlZCA9IGAke2RhdGVNb250aH0gJHtkYXRlRGF5fWA7XG4gICAgICAgICAgICB0b0RvRGF0ZS50ZXh0Q29udGVudCA9IGRhdGVGb3JtYXRlZDtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgZWRpdCBpY29uIGZvciB0aGUgdG8tZG8gaXRlbVxuICAgICAgICAgICAgY29uc3QgdG9Eb0VkaXQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHRvRG9FZGl0LnNyYz1JY29uRWRpdFxuICAgICAgICAgICAgdG9Eb0VkaXQuY2xhc3NMaXN0LmFkZCgndG9kb19faWNvbi1lZGl0Jyk7XG4gICAgICAgICAgICB0b0RvRWRpdC5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uJyk7XG4gICAgICAgICAgICB0b0RvRWRpdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gcmVuZGVyRWRpdChlLCB0b0RvTGlzdCwgZWxlbWVudCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBkZWxldGUgaWNvbiBmb3IgdGhlIHRvLWRvIGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHRvRG9EZWxldGUgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHRvRG9EZWxldGUuc3JjPUljb25EZWxldGU7XG4gICAgICAgICAgICB0b0RvRGVsZXRlLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2ljb24nKTtcbiAgICAgICAgICAgIHRvRG9EZWxldGUuY2xhc3NMaXN0LmFkZCgndG9kb19faWNvbi1iaW4nKTtcbiAgICAgICAgICAgIHRvRG9EZWxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHRvRG9zTWFuYWdlci5kZWxldGVUb0RvKGUsIHRvZG9zLCBlbGVtZW50KSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9DaGVja0JveCk7XG4gICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvVGl0bGUpO1xuICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0RldGFpbHMpO1xuICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0RhdGUpO1xuICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0VkaXQpO1xuICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0RlbGV0ZSk7XG5cbiAgICAgICAgICAgIC8vYXBwbHkgY2hlY2tlZCBzdGF0dXMgXG4gICAgICAgICAgICBpZiAodG9kby5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgYXBwbHlDaGVja2VkT25SZWxvYWQodG9Eb0JvZHkpXG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHRvRG9Cb2R5KTtcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBzYXZlIHRvZG9zIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2Rvc1wiLCBKU09OLnN0cmluZ2lmeSh0b2RvcykpO1xuICAgIH1cblxuICAgIC8vIHJlbmRlciBhbGwgdG8tZG9zIGZyb20gYWxsIHByb2plY3RzIFxuICAgIGZ1bmN0aW9uIHJlbmRlckFsbFRvRG9zKHRvRG9PYmplY3QsIGVsZW1lbnQpIHtcblxuICAgICAgICBcblxuICAgICAgICAvLyBjbGVhciBvdXQgZGlzcGxheSBiZWZvcmUgcmVkaXNwbGF5aW5nIGFsbCB0by1kb3NcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiIFxuXG4gICAgICAgIGZvciAoY29uc3QgcHJvamVjdCBpbiB0b0RvT2JqZWN0KSB7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIHRvLWRvIGVsZW1lbnQgZm9yIGVhY2ggdG9kbyBzdG9yZWQgaW4gdGhlIHBhc3NlZCBhcnJheSBcbiAgICAgICAgICAgIC8vIGFuZCBhcHBlbmQgdGhlbSB0byB0aGUgZG9tIGVsZW1lbnQgc3VwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICB0b0RvT2JqZWN0W3Byb2plY3RdLmZvckVhY2goKHRvZG8sIGkpID0+IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbWFpbiBib2R5IG9mIHRoZSB0by1kbyBpdGVtXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb0JvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5jbGFzc0xpc3QuYWRkKCd0b2RvJyk7XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuY2xhc3NMaXN0LmFkZChgcHJpb3JpdHktJHt0b2RvLnByaW9yaXR5fWApO1xuICAgICAgICAgICAgICAgIC8vIGdpdmUgZWFjaCB0by1kbyBlbGVtZW50IGEgdW5pcXVlIHZhbHVlIHRoYXQgY29ycmVzcG9uZHMgdG9cbiAgICAgICAgICAgICAgICAvLyBpdCdzIGRhdGEncyBwb3NpdGlvbiBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnLCBpKTtcbiAgICAgICAgICAgICAgICAvLyBzZXQgZGF0YSBhdHJyaWJ1dGUgdG8gdGhlIHRvLWRvIGl0ZW1zIHByb2plY3QgbmFtZVxuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1wcm9qZWN0JywgYCR7dG9kby5wcm9qZWN0fWApXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gY2hlY2tib3ggXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb0NoZWNrQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdG9Eb0NoZWNrQm94LmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2NvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgdG9Eb0NoZWNrQm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB0b2dnbGVDaGVja0JveChlLCB0b0RvT2JqZWN0LCBlbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gdGl0bGVcbiAgICAgICAgICAgICAgICBjb25zdCB0b0RvVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0b0RvVGl0bGUuY2xhc3NMaXN0LmFkZCgndG9kb19fdGl0bGUnKTtcbiAgICAgICAgICAgICAgICB0b0RvVGl0bGUudGV4dENvbnRlbnQgPSB0b2RvLm5hbWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gZGV0YWlscyBidXR0b25cbiAgICAgICAgICAgICAgICBjb25zdCB0b0RvRGV0YWlscyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIHRvRG9EZXRhaWxzLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2RldGFpbCcpO1xuICAgICAgICAgICAgICAgIHRvRG9EZXRhaWxzLnRleHRDb250ZW50ID0gJ2RldGFpbHMnO1xuICAgICAgICAgICAgICAgIHRvRG9EZXRhaWxzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRGV0YWlscyhlLCB0b0RvT2JqZWN0W3Byb2plY3RdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSB0by1kbyBkdWUgZGF0ZSBsYWJlbC5cbiAgICAgICAgICAgICAgICAvLyBkaXNwbGF5cyBhIGh1bWFuIHJlYWRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkYXRlIGlucHV0IHN0cmluZ1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvRG9EYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdG9Eb0RhdGUuY2xhc3NMaXN0LmFkZCgndG9kb19fZGF0ZScpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnQgZGF0ZSBzdHJpbmcgaW50byBhIGRhdGUgdGhlIGZvcm0gb2YgXCJKYW4gMTJ0aFwiXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZU9iamVjdCA9IG5ldyBEYXRlKHRvZG8uZGF0ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZU1vbnRoID0gZm9ybWF0KGRhdGVPYmplY3QsICdNTU0nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlRGF5ID0gZm9ybWF0KGRhdGVPYmplY3QsICdkbycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVGb3JtYXRlZCA9IGAke2RhdGVNb250aH0gJHtkYXRlRGF5fWA7XG4gICAgICAgICAgICAgICAgdG9Eb0RhdGUudGV4dENvbnRlbnQgPSBkYXRlRm9ybWF0ZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgYSBlZGl0IGljb24gZm9yIHRoZSB0by1kbyBpdGVtXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb0VkaXQ9bmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgdG9Eb0VkaXQuc3JjPUljb25FZGl0O1xuICAgICAgICAgICAgICAgIHRvRG9FZGl0LmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2ljb24tZWRpdCcpO1xuICAgICAgICAgICAgICAgIHRvRG9FZGl0LmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2ljb24nKTtcbiAgICAgICAgICAgICAgICB0b0RvRWRpdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gcmVuZGVyRWRpdChlLCB0b0RvT2JqZWN0W3Byb2plY3RdLCBlbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgZGVsZXRlIGljb24gZm9yIHRoZSB0by1kbyBpdGVtXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb0RlbGV0ZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHRvRG9EZWxldGUuc3JjPUljb25EZWxldGU7XG4gICAgICAgICAgICAgICAgdG9Eb0RlbGV0ZS5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uJyk7XG4gICAgICAgICAgICAgICAgdG9Eb0RlbGV0ZS5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uLWJpbicpO1xuICAgICAgICAgICAgICAgIHRvRG9EZWxldGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHRvRG9zTWFuYWdlci5kZWxldGVUb0RvKGUsIHRvRG9PYmplY3QsIGVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0NoZWNrQm94KTtcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvVGl0bGUpO1xuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9EZXRhaWxzKTtcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvRGF0ZSk7XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0VkaXQpO1xuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9EZWxldGUpO1xuXG4gICAgICAgICAgICAgICAgLy9hcHBseSBjaGVja2VkIHN0YXR1cyBcbiAgICAgICAgICAgICAgICBpZiAodG9kby5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5Q2hlY2tlZE9uUmVsb2FkKHRvRG9Cb2R5KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0b0RvQm9keSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2F2ZSB0b2RvcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9kb3NcIiwgSlNPTi5zdHJpbmdpZnkodG9Eb09iamVjdCkpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLy8gcmV0cmlldmUgdGhlIGRldGFpbHMgZm9yIGEgc2VsZWN0ZWQgdG8tZG8gaXRlbSBhbmQgcmVuZGVyIHRoZW0gaW4gYSBwb3B1cFxuICAgIGZ1bmN0aW9uIHJlbmRlckRldGFpbHMoZSwgdG9kb3MpIHtcblxuICAgICAgICBjb25zdCBpID0gZS50YXJnZXQucGFyZW50RWxlbWVudC5kYXRhc2V0LmluZGV4O1xuICAgICAgICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm92ZXJsYXktZGV0YWlscycpO1xuICAgICAgICBjb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRldGFpbHMtcG9wdXBfX2NvbnRlbnQnKTtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlscy1wb3B1cCcpO1xuXG4gICAgICAgIC8vIGNsZWFyIG91dCB0aGUgcG9wdXAgZGV0YWlscyBpbmZvcm1hdGlvblxuICAgICAgICBkaXNwbGF5LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAgICAgLy8gY3JlYXRlIGVsZW1lbnRzIG5lZWRlZCB0byBidWlsZCBhIGRldGFpbHMgcG9wdXBcbiAgICAgICAgLy8gbWFpbiBkaXNwbGF5IG9mIHBvcHVwXG4gICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19jb250ZW50Jyk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRpdGxlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBuYW1lLmNsYXNzTGlzdC5hZGQoJ2RldGFpbHMtcG9wdXBfX3RpdGxlJyk7XG4gICAgICAgIG5hbWUudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5uYW1lO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBwcm9qZWN0IGVsZW1lbnRcbiAgICAgICAgLy8gZWxlbWVudCBtYWRlIHVwIG9mIDIgc3BhbnMuIHRpdGxlIGFuZCBjb250ZW50XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJvamVjdC5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19wcm9qZWN0Jyk7XG4gICAgICAgIGNvbnN0IHByb2plY3RUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgcHJvamVjdFRpdGxlLnRleHRDb250ZW50ID0gJ1Byb2plY3Q6JztcbiAgICAgICAgcHJvamVjdFRpdGxlLmNsYXNzTGlzdC5hZGQoJ2RldGFpbHMtcG9wdXBfX2NhdGFnb3J5Jyk7XG4gICAgICAgIGNvbnN0IHByb2plY3RDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwcm9qZWN0Q29udGVudC50ZXh0Q29udGVudCA9IHRvZG9zW2ldLnByb2plY3Q7XG4gICAgICAgIHByb2plY3QuYXBwZW5kQ2hpbGQocHJvamVjdFRpdGxlKTtcbiAgICAgICAgcHJvamVjdC5hcHBlbmRDaGlsZChwcm9qZWN0Q29udGVudCk7XG5cblxuICAgICAgICAvLyBjcmVhdGUgcHJpb3JpdHkgZWxlbWVudFxuICAgICAgICBjb25zdCBwcmlvcml0eSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBwcmlvcml0eS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19wcmlvcml0eScpO1xuICAgICAgICBjb25zdCBwcmlvcml0eVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwcmlvcml0eVRpdGxlLnRleHRDb250ZW50ID0gXCJQcmlvcml0eTpcIjtcbiAgICAgICAgcHJpb3JpdHlUaXRsZS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19jYXRhZ29yeScpO1xuICAgICAgICBjb25zdCBwcmlvcml0eUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHByaW9yaXR5Q29udGVudC50ZXh0Q29udGVudCA9IHRvZG9zW2ldLnByaW9yaXR5WzBdLnRvVXBwZXJDYXNlKCkgKyB0b2Rvc1tpXS5wcmlvcml0eS5zbGljZSgxKTtcbiAgICAgICAgcHJpb3JpdHkuYXBwZW5kQ2hpbGQocHJpb3JpdHlUaXRsZSk7XG4gICAgICAgIHByaW9yaXR5LmFwcGVuZENoaWxkKHByaW9yaXR5Q29udGVudCk7XG5cbiAgICAgICAgIFxuXG4gICAgICAgIC8vIGNyZWF0ZSBkYXRlIGVsZW1lbnRcbiAgICAgICAgY29uc3QgZGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkYXRlLmNsYXNzTGlzdC5hZGQoJ2RldGFpbHMtcG9wdXBfX2R1ZScpO1xuICAgICAgICBjb25zdCBkYXRlVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGRhdGVUaXRsZS50ZXh0Q29udGVudCA9ICdEdWUgRGF0ZTonO1xuICAgICAgICBkYXRlVGl0bGUuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fY2F0YWdvcnknKTtcbiAgICAgICAgY29uc3QgZGF0ZUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIC8vIGRpc3BsYXkgaHVtYW4gcmVhZGFibGUgZGF0ZVxuICAgICAgICBjb25zdCBkYXkgPSBmb3JtYXQobmV3IERhdGUodG9kb3NbaV0uZGF0ZSksICdkbycpO1xuICAgICAgICBjb25zdCBtb250aCA9IGZvcm1hdChuZXcgRGF0ZSh0b2Rvc1tpXS5kYXRlKSwgJ01NTU0nKTtcbiAgICAgICAgY29uc3QgeWVhciA9IGZvcm1hdChuZXcgRGF0ZSh0b2Rvc1tpXS5kYXRlKSwgJ3l5eXknKTtcbiAgICAgICAgY29uc3QgZm9ybWF0ZWREYXRlID0gYCR7bW9udGh9ICR7ZGF5fSwgJHt5ZWFyfWA7XG4gICAgICAgIGRhdGVDb250ZW50LnRleHRDb250ZW50ID0gZm9ybWF0ZWREYXRlO1xuICAgICAgICBkYXRlLmFwcGVuZENoaWxkKGRhdGVUaXRsZSk7XG4gICAgICAgIGRhdGUuYXBwZW5kQ2hpbGQoZGF0ZUNvbnRlbnQpO1xuICAgICAgICBcblxuICAgICAgICAvLyBjcmVhdGUgZGV0YWlscyBlbGVtZW50XG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGV0YWlscy5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19kZXRhaWxzJyk7XG4gICAgICAgIGNvbnN0IGRldGFpbHNUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgZGV0YWlsc1RpdGxlLmNsYXNzTGlzdC5hZGQoJ2RldGFpbHMtcG9wdXBfX2RldGFpbHMtdGl0bGUnKTtcbiAgICAgICAgZGV0YWlsc1RpdGxlLnRleHRDb250ZW50ID0gXCJEZXRhaWxzOlwiO1xuICAgICAgICBjb25zdCBkZXRhaWxzQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgZGV0YWlsc0NvbnRlbnQudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5kZXRhaWxzO1xuICAgICAgICBkZXRhaWxzLmFwcGVuZENoaWxkKGRldGFpbHNUaXRsZSk7XG4gICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQoZGV0YWlsc0NvbnRlbnQpO1xuXG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQobmFtZSk7XG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQocHJvamVjdCk7XG4gICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQocHJpb3JpdHkpO1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKGRhdGUpO1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKGRldGFpbHMpO1xuXG4gICAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQoYm9keSk7XG5cbiAgICAgICAgLy8gc2hvdyBwb3B1cFxuICAgICAgICBwb3B1cC5jbGFzc0xpc3QudG9nZ2xlKFwiZGV0YWlscy1wb3B1cC1vcGVuXCIpO1xuICAgICAgICBvdmVybGF5LmNsYXNzTGlzdC50b2dnbGUoXCJvdmVybGF5LWRldGFpbHMtaW52aXNpYmxlXCIpO1xuXG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJFZGl0KGUsIHRvZG9zKSB7XG5cbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGUudGFyZ2V0O1xuICAgICAgICBsZXQgaT0gZWxlbWVudC5wYXJlbnRFbGVtZW50LmRhdGFzZXQuaW5kZXg7XG4gICAgICAgIGxldCBwcm9qZWN0PSBlbGVtZW50LnBhcmVudEVsZW1lbnQuZGF0YXNldC5wcm9qZWN0O1xuXG4gICAgICAgIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcub3ZlcmxheS1lZGl0Jyk7XG4gICAgICAgIGNvbnN0IGRpc3BsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9fZW50cnknKTtcbiAgICAgICAgY29uc3QgcG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cCcpO1xuXG4gICAgICAgIC8vIGNsZWFyIG91dCB0aGUgcG9wdXAgZWRpdCBpbmZvcm1hdGlvblxuICAgICAgICBkaXNwbGF5LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAgICAgLy8gcmV0cmVpdmUgbmFtZSBvZiB0b2RvIGFuZCBkaXNwbGF5IGl0IGluIGEgdGV4dCBhcmVhXG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgdGl0bGUuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9faW5wdXQnKTtcbiAgICAgICAgdGl0bGUuc2V0QXR0cmlidXRlKCdtYXhsZW5ndGgnLCAnNDAnKTtcbiAgICAgICAgdGl0bGUucmVxdWlyZWQgPSB0cnVlO1xuXG5cbiAgICAgICAgdGl0bGUudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5uYW1lO1xuXG4gICAgICAgIC8vIGF0dGF0Y2ggaW5kZXggdG8gdGl0bGUgZWxlbWVudCBzbyBpIGNhbiBncmFiIGl0IHdoZW4gY29uZmlybWluZyBlZGl0XG4gICAgICAgIC8vIGFuZCBjaGFuZ2UgdGhlIGFycmF5IGRhdGEgZm9yIHRoYXQgdG8tZG8gaXRlbVxuICAgICAgICB0aXRsZS5kYXRhc2V0LmluZGV4ID0gaTtcbiAgICAgICAgLy8gYXR0YWNoIHByb2plY3QgbmFtZSB0byB0aXRsZSBlbGVtZW50IHNvIGkgY2FuIGdyYWIgaXQgd2hlbiBjb25maXJtaW5nIGVkaXRzXG4gICAgICAgIHRpdGxlLmRhdGFzZXQucHJvamVjdCA9IHByb2plY3Q7XG5cbiAgICAgICAgLy8gcmV0cmVpdmUgZGV0YWlscyBvZiB0b2RvIGFuZCBkaXNwbGF5IGl0IGluIGEgdGV4dCBhcmVhXG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xuICAgICAgICBkZXRhaWxzLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX2lucHV0JywgJ2VkaXQtcG9wdXBfX2lucHV0LWJpZycpO1xuICAgICAgICBkZXRhaWxzLnNldEF0dHJpYnV0ZShcInBsYWNlaG9sZGVyXCIsIFwiRGV0YWlsczpcIilcbiAgICAgICAgZGV0YWlscy50ZXh0Q29udGVudCA9IHRvZG9zW2ldLmRldGFpbHM7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBlbGVtZW50cyB0aGF0IG1ha2UgdXAgdGhlIGRhdGUgc2VjdGlvblxuICAgICAgICBjb25zdCBkYXRlQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRhdGVDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fZGF0ZScpO1xuXG4gICAgICAgIGNvbnN0IGRhdGVDb250YWluZXJUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkYXRlQ29udGFpbmVyVGl0bGUuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fZGF0ZS10aXRsZScpO1xuICAgICAgICBkYXRlQ29udGFpbmVyVGl0bGUudGV4dENvbnRlbnQgPSAnRHVlIERhdGU6JztcblxuICAgICAgICBjb25zdCBkYXRlQ29udGFpbmVySW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBkYXRlQ29udGFpbmVySW5wdXQuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dCcpO1xuICAgICAgICBkYXRlQ29udGFpbmVySW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ2RhdGUnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lcklucHV0LnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lcklucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCB0b2Rvc1tpXS5kYXRlKTtcblxuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVDb250YWluZXJUaXRsZSk7XG4gICAgICAgIGRhdGVDb250YWluZXIuYXBwZW5kQ2hpbGQoZGF0ZUNvbnRhaW5lcklucHV0KTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIHByaW9yaXR5IGJ1dHRvbnMgc2VjdGlvblxuICAgICAgICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZm9vdGVyLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0Jyk7XG5cbiAgICAgICAgY29uc3QgcHJpb3JpdHlDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHknKTtcblxuICAgICAgICBjb25zdCBwcmlvcml0eVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHByaW9yaXR5VGl0bGUuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktdGl0bGUnKTtcbiAgICAgICAgcHJpb3JpdHlUaXRsZS50ZXh0Q29udGVudCA9ICdQcmlvcml0eTonO1xuICAgICAgICAvLyBsb3cgcHJpb3JpdHkgaW5wdXRcbiAgICAgICAgY29uc3QgcHJpb3JpdHlMb3dJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIHByaW9yaXR5TG93SW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3JhZGlvJyk7XG4gICAgICAgIHByaW9yaXR5TG93SW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdsb3cnKTtcbiAgICAgICAgcHJpb3JpdHlMb3dJbnB1dC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnZWRpdC1wcmlvcml0eScpO1xuICAgICAgICBwcmlvcml0eUxvd0lucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnbG93Jyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ2xvdycpIHtcbiAgICAgICAgICAgIHByaW9yaXR5TG93SW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlMb3dJbnB1dC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgIC8vIGxvdyBwcmlvcml0eSBsYWJlbFxuICAgICAgICBjb25zdCBwcmlvcml0eUxvd0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgcHJpb3JpdHlMb3dMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgXCJsb3dcIik7XG4gICAgICAgIHByaW9yaXR5TG93TGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuJywgJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93Jyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ2xvdycpIHtcbiAgICAgICAgICAgIHByaW9yaXR5TG93TGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1sb3ctYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlMb3dMYWJlbC50ZXh0Q29udGVudCA9IFwiTG93XCI7XG4gICAgICAgIC8vIG1lZGl1bSBwcmlvcml0eSBpbnB1dFxuICAgICAgICBjb25zdCBwcmlvcml0eU1lZGl1bUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgcHJpb3JpdHlNZWRpdW1JbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFkaW8nKTtcbiAgICAgICAgcHJpb3JpdHlNZWRpdW1JbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ21lZGl1bScpO1xuICAgICAgICBwcmlvcml0eU1lZGl1bUlucHV0LnNldEF0dHJpYnV0ZSgnbmFtZScsICdlZGl0LXByaW9yaXR5Jyk7XG4gICAgICAgIHByaW9yaXR5TWVkaXVtSW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsICdtZWRpdW0nKTtcbiAgICAgICAgaWYgKHRvZG9zW2ldLnByaW9yaXR5ID09PSAnbWVkaXVtJykge1xuICAgICAgICAgICAgcHJpb3JpdHlNZWRpdW1JbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcmlvcml0eU1lZGl1bUlucHV0LnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgLy8gTWVkaXVtIHByaW9yaXR5IGxhYmVsXG4gICAgICAgIGNvbnN0IHByaW9yaXR5TWVkaXVtTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBwcmlvcml0eU1lZGl1bUxhYmVsLnNldEF0dHJpYnV0ZShcImZvclwiLCBcIm1lZGl1bVwiKTtcbiAgICAgICAgcHJpb3JpdHlNZWRpdW1MYWJlbC5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX19wcmlvcml0eS1idG4nLCAnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW0nKTtcbiAgICAgICAgaWYgKHRvZG9zW2ldLnByaW9yaXR5ID09PSAnbWVkaXVtJykge1xuICAgICAgICAgICAgcHJpb3JpdHlNZWRpdW1MYWJlbC5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLW1lZGl1bS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgICAgICBwcmlvcml0eU1lZGl1bUxhYmVsLnRleHRDb250ZW50ID0gXCJNZWRpdW1cIjtcbiAgICAgICAgLy8gaGlnaCBwcmlvcml0eSBpbnB1dFxuICAgICAgICBjb25zdCBwcmlvcml0eUhpZ2hJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIHByaW9yaXR5SGlnaElucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdyYWRpbycpO1xuICAgICAgICBwcmlvcml0eUhpZ2hJbnB1dC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2hpZ2gnKTtcbiAgICAgICAgcHJpb3JpdHlIaWdoSW5wdXQuc2V0QXR0cmlidXRlKCduYW1lJywgJ2VkaXQtcHJpb3JpdHknKTtcbiAgICAgICAgcHJpb3JpdHlIaWdoSW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsICdoaWdoJyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ2hpZ2gnKSB7XG4gICAgICAgICAgICBwcmlvcml0eUhpZ2hJbnB1dC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcmlvcml0eUhpZ2hJbnB1dC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgIC8vIGhpZ2ggcHJpb3JpdHkgbGFiZWxcbiAgICAgICAgY29uc3QgcHJpb3JpdHlIaWdoTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgICAgICBwcmlvcml0eUhpZ2hMYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgXCJoaWdoXCIpO1xuICAgICAgICBwcmlvcml0eUhpZ2hMYWJlbC5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX19wcmlvcml0eS1idG4nLCAnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoJyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ2hpZ2gnKSB7XG4gICAgICAgICAgICBwcmlvcml0eUhpZ2hMYWJlbC5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWhpZ2gtYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlIaWdoTGFiZWwudGV4dENvbnRlbnQgPSBcIkhpZ2hcIjtcblxuICAgICAgICBcblxuICAgICAgICBwcmlvcml0eUNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmlvcml0eVRpdGxlKTtcbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuYXBwZW5kQ2hpbGQocHJpb3JpdHlMb3dJbnB1dCk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmFwcGVuZENoaWxkKHByaW9yaXR5TG93TGFiZWwpO1xuICAgICAgICBwcmlvcml0eUNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmlvcml0eU1lZGl1bUlucHV0KTtcbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuYXBwZW5kQ2hpbGQocHJpb3JpdHlNZWRpdW1MYWJlbCk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmFwcGVuZENoaWxkKHByaW9yaXR5SGlnaElucHV0KTtcbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuYXBwZW5kQ2hpbGQocHJpb3JpdHlIaWdoTGFiZWwpO1xuXG4gICAgICAgIC8vIHN1Ym1pdCBidXR0b24gKGlzIGluIHNhbWUgZm9vdGVyIGFzIHRoZSBwaW9yaXR5IGJ1dHRvbnMgY29udGFpbmVyKVxuICAgICAgICBjb25zdCBzdWJtaXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBcInN1Ym1pdFwiKTtcbiAgICAgICAgc3VibWl0LnNldEF0dHJpYnV0ZSgnaWQnLCAndG9kby1lZGl0LXN1Ym1pdCcpXG4gICAgICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ0NvbmZpcm0gRWRpdCcpXG4gICAgICAgIHN1Ym1pdC5jbGFzc0xpc3QuYWRkKFwiZWRpdC1wb3B1cF9fdG9kby1zdWJtaXRcIik7XG5cbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKHByaW9yaXR5Q29udGFpbmVyKTtcbiAgICAgICAgZm9vdGVyLmFwcGVuZENoaWxkKHN1Ym1pdCk7XG5cbiAgICAgICAgLy8gYXBwZW5kIGNyZWF0ZWQgZWxlbWVudHMgdG8gdGhlIERPTVxuICAgICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZChkZXRhaWxzKTtcbiAgICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZChkYXRlQ29udGFpbmVyKTtcbiAgICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZChmb290ZXIpO1xuXG4gICAgICAgIC8vbGlzdGVuZXIgdGhhdCBjaGFuZ2VzIHRoZSBoaWdobGlnaHRlZCBwcmlvcml0eSBidXR0b25cbiAgICAgICAgY29uc3QgcHJpb3JpdHlCdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bicpO1xuICAgICAgICBwcmlvcml0eUJ0bnMuZm9yRWFjaChidG4gPT4ge1xuICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PntcbiAgICAgICAgICAgICAgICBlZGl0UHJpb3JpdHkoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIC8vIHNob3cgcG9wdXBcbiAgICAgICAgcG9wdXAuY2xhc3NMaXN0LnRvZ2dsZShcImVkaXQtcG9wdXAtb3BlblwiKTtcbiAgICAgICAgb3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKFwib3ZlcmxheS1lZGl0LWludmlzaWJsZVwiKTtcblxuICAgIH1cblxuICAgIC8vIGFwcGxpZXMgbW9kaWZpZWQgc3R5bGluZyB0byBlYWNoIGVsZW1lbnQgb2YgYSBjaGVja2VkIG9mZiB0by1kbyBpdGVtIFxuICAgIGZ1bmN0aW9uIHRvZ2dsZUNoZWNrQm94KGUsIHRvRG9PYmplY3QsIGRpc3BsYXkpIHtcblxuICAgICAgICAvLyBncmFicyBhbGwgc2libGluZyBlbGVtZW50cyBvZiB0aGUgY2xpY2tlZCBjaGVja2JveFxuICAgICAgICBjb25zdCB0b0RvID0gZS50YXJnZXQucGFyZW50RWxlbWVudDtcblxuICAgICAgICBjb25zb2xlLmxvZyh0b0RvLmNsYXNzTGlzdClcblxuICAgICAgICB0b0RvLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG8tY2hlY2tlZCcpO1xuXG4gICAgICAgIGNvbnN0IHRvRG9JdGVtcyA9IHRvRG8uY2hpbGRyZW47XG4gICAgICAgIFxuICAgICAgICAvLyAvLyB0b2RvIGNoZWNrYm94XG4gICAgICAgIHRvRG9JdGVtc1swXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19jb21wbGV0ZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gdGl0bGVcbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzFdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX3RpdGxlLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkZXRhaWxzIGJ1dHRvblxuICAgICAgICAvLyB0b0RvSXRlbXNbMl0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fZGV0YWlsLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkYXRlXG4gICAgICAgIC8vIHRvRG9JdGVtc1szXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19kYXRlLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBlZGl0IGljb25cbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzRdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX2ljb24tY2hlY2tlZCcpO1xuICAgICAgICAvLyAvLyB0b2RvIGRlbGV0ZSBpY29uXG4gICAgICAgIC8vIHRvRG9JdGVtc1s1XS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19pY29uLWNoZWNrZWQnKTtcblxuICAgICAgICAvLyB0b2dnbGUgY2hlY2tlZCBzdGF0dXMgb24gdG9kbyBpdGVtIGRhdGFcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IHRvRG8uZGF0YXNldC5wcm9qZWN0O1xuICAgICAgICBjb25zdCBpbmRleCA9IHRvRG8uZGF0YXNldC5pbmRleDtcblxuICAgICAgICB0b0RvT2JqZWN0W3Byb2plY3RdW2luZGV4XS5jaGVja2VkID0gIXRvRG9PYmplY3RbcHJvamVjdF1baW5kZXhdLmNoZWNrZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKHRvRG9PYmplY3RbcHJvamVjdF0pO1xuICAgIFxuICAgICAgICAvLyBzYXZlIHRvZG9zIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2Rvc1wiLCBKU09OLnN0cmluZ2lmeSh0b0RvT2JqZWN0KSk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHByb2plY3QgY291bnRcbiAgICAgICAgcmVuZGVyUHJvamVjdE5hbWVzKHRvRG9PYmplY3QsIGRpc3BsYXkpXG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIGFwcGxpZXMgY2hlY2tlZCBzdGF0dXMgdG8gY2hlY2tlZCBpdGVtcyBvbiByZWxvYWRcbiAgICBmdW5jdGlvbiBhcHBseUNoZWNrZWRPblJlbG9hZCh0b0RvSXRlbSkge1xuXG4gICAgICAgIHRvRG9JdGVtLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG8tY2hlY2tlZCcpO1xuICAgICAgICBjb25zdCB0b0RvSXRlbXMgPSB0b0RvSXRlbS5jaGlsZHJlbjtcblxuXG4gICAgICAgIFxuICAgICAgICAvLyAvLyB0b2RvIGNoZWNrYm94XG4gICAgICAgIHRvRG9JdGVtc1swXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19jb21wbGV0ZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gdGl0bGVcbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzFdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX3RpdGxlLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkZXRhaWxzIGJ1dHRvblxuICAgICAgICAvLyB0b0RvSXRlbXNbMl0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fZGV0YWlsLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkYXRlXG4gICAgICAgIC8vIHRvRG9JdGVtc1szXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19kYXRlLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBlZGl0IGljb25cbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzRdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX2ljb24tY2hlY2tlZCcpO1xuICAgICAgICAvLyAvLyB0b2RvIGRlbGV0ZSBpY29uXG4gICAgICAgIC8vIHRvRG9JdGVtc1s1XS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19pY29uLWNoZWNrZWQnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBY3RpdmVQcmlvcml0eSgpIHtcbiAgICAgICAgLy8gcmVtb3ZlcyBhY3RpdmUgc3RhdHVzIGZyb20gYWxsIGJ1dHRvbnNcbiAgICAgICAgY29uc3QgYnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4nKTtcbiAgICAgICAgYnRucy5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShgY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS0ke2J0bi50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpfS1hY3RpdmVgKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIHRvZ2dsZSBhY3RpdmUgdmlzdWFsIHN0eWxpbmcgdG8gcHJpb3JpdHkgYnV0dG9ucyBpbiBjcmVhdGUgbmV3IHRvLWRvIG1lbnVcbiAgICBmdW5jdGlvbiBhY3RpdmVQcmlvcml0eShlKSB7XG4gICAgICAgIC8vIHJlbW92ZXMgYWN0aXZlIHN0YXR1cyBmcm9tIGFsbCBidXR0b25zXG4gICAgICAgIHJlbW92ZUFjdGl2ZVByaW9yaXR5KCk7XG4gICAgICAgIC8vIGFwcGx5IGFjdGl2ZSBzdGF0dXMgdG8gdGhlIHNlbGVjdGVkIGJ1dHRvblxuICAgICAgICBjb25zdCBwcmlvcml0eSA9IGUudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoYGNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tJHtwcmlvcml0eX0tYWN0aXZlYCk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIHByaW9yaXR5IGJ1dHRvbiBzeXRsaW5nIGluIGVkaXQgbWVudVxuICAgIC8vIGkgY291bGQgbWFrZSB0aGlzIGludG8gYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBjbGFzcyBuYW1lLCBhbmQgdXNlIHRoYXQgXG4gICAgLy8gZnVuY3Rpb24gZm9yIHRoaXMgYW5kIHRoZSBwcmV2aW91cyBmdW5jdGlvbi5cbiAgICBmdW5jdGlvbiBlZGl0UHJpb3JpdHkoZSkge1xuICAgICAgICAvLyByZW1vdmVzIGFjdGl2ZSBzdGF0dXMgZnJvbSBhbGwgYnV0dG9uc1xuICAgICAgICBjb25zdCBidG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bicpO1xuICAgICAgICBidG5zLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKGBlZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLSR7YnRuLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCl9LWFjdGl2ZWApXG4gICAgICAgIH0pXG4gICAgICAgIC8vIGFwcGx5IGFjdGl2ZSBzdGF0dXMgdG8gdGhlIHNlbGVjdGVkIGJ1dHRvblxuICAgICAgICBjb25zdCBwcmlvcml0eSA9IGUudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoYGVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tJHtwcmlvcml0eX0tYWN0aXZlYCk7XG4gICAgfVxuXG4gICAgLy8gZnVuY3Rpb24gdG8gaGFuZGxlIGNsaWNrcyBvbiB0aGUgbmF2aWdhdGlvblxuICAgIGZ1bmN0aW9uIGNoYW5nZUZvbGRlcihlLCB0b2RvcywgZGlzcGxheSkge1xuICAgICAgICBcbiAgICAgICAgLy8gc2V0cyB0aGUgY3VycmVudCBmb2xkZXIgdmFyaWFibGUgdG8gbmF2IGl0ZW0gdGhhdCB3YXMgY2xpY2tlZFxuICAgICAgICAvLyBiZWNhdXNlIGkgc2V0IGV2ZXJ5dGhpbmcgdG8gYmUgbG93ZXJjYXNlIGluIG15IGNvZGUsIGl0IHdvdWRsIGNyYXNoIHdoZW4gaSB1c2VkIHVwcGVyY2FzZVxuICAgICAgICAvLyBsZXR0ZXJzIGluIG15IGN1c3RvbSBwcm9qZWN0cy4gdGhpcyBhbGxvd3MgdXBwZXJjYXNlIHByb2plY3QgbmFtZXNcbiAgICAgICAgXG4gICAgICAgIGlmIChbJ0hvbWUnLCAnV2VlaycsICdUb2RheSddLmluY2x1ZGVzKGUudGFyZ2V0LnRleHRDb250ZW50KSkge1xuICAgICAgICAgICAgdG9Eb3NNYW5hZ2VyLmNoYW5nZUN1cnJlbnRQcm9qZWN0KGUudGFyZ2V0LnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9Eb3NNYW5hZ2VyLmNoYW5nZUN1cnJlbnRQcm9qZWN0KGUudGFyZ2V0LnRleHRDb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwieW91IGFyZSBpbiBmb2xkZXJcIiwgdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkpO1xuXG4gICAgXG5cblxuXG4gICAgICAgIFxuICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgLy8gb25seSByZW5kZXIgdGhlIHJlbGV2ZW50IHRvLWRvIGl0ZW1zXG4gICAgICAgIGlmICh0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICByZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB1cGRhdGVBY3RpdmVOYXZNYWluKGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZW5kZXJUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB1cGRhdGVBY3RpdmVOYXZNYWluKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgY2hhbmdpbmcgdG8gYSBuZXcgZW1wdHkgY3VzdG9tIHByb2plY3QsIGRpc3BsYXkgcGxhY2Vob2xkZXIgc2NyZWVuXG4gICAgICAgIGlmICghWydob21lJywgJ3dlZWsnLCAndG9kYXknXS5pbmNsdWRlcyh0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSkpIHtcbiAgICAgICAgICAgIGlmICh0b2Rvc1t0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKV0ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgIHJlbmRlckVtcHR5UHJvamVjdFBsYWNlaG9sZGVyKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIGZ1bmN0aW9uIHRvIGhhbmRsZSBjbGlja3Mgb24gdGhlIHdpZGVyIG5hdmlnYXRpb24gYXJlYS4gXG4gICAgLy8gSSBjb3VsZCdudCBnZXQgaXQgdG8gd29yayBvdGhlcndpc2UuXG4gICAgZnVuY3Rpb24gY2hhbmdlRm9sZGVyMihlLCB0b2RvcywgZGlzcGxheSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnc2Vjb25kJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGUudGFyZ2V0LmNoaWxkTm9kZXNbMF0udGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZS50YXJnZXQudGFnTmFtZSA9PSAnbGknIHx8IGUudGFyZ2V0LnRhZ05hbWUgPT0gJ0xJJykge1xuICAgICAgICAgICAgLy8gc2V0cyB0aGUgY3VycmVudCBmb2xkZXIgdmFyaWFibGUgdG8gbmF2IGl0ZW0gdGhhdCB3YXMgY2xpY2tlZFxuICAgICAgICAgICAgLy8gdG9Eb3NNYW5hZ2VyLmNoYW5nZUN1cnJlbnRQcm9qZWN0KGUudGFyZ2V0LmNoaWxkTm9kZXNbMF0udGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInlvdSBhcmUgaW4gZm9sZGVyXCIsIHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGUudGFyZ2V0LmNoaWxkTm9kZXNbMF0udGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIC8vIHNldHMgdGhlIGN1cnJlbnQgZm9sZGVyIHZhcmlhYmxlIHRvIG5hdiBpdGVtIHRoYXQgd2FzIGNsaWNrZWRcbiAgICAgICAgXG4gICAgICAgICAgICBpZiAoWydIb21lJywgJ1dlZWsnLCAnVG9kYXknXS5pbmNsdWRlcyhlLnRhcmdldC5jaGlsZE5vZGVzWzBdLnRleHRDb250ZW50KSkge1xuICAgICAgICAgICAgICAgIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdChlLnRhcmdldC5jaGlsZE5vZGVzWzBdLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b0Rvc01hbmFnZXIuY2hhbmdlQ3VycmVudFByb2plY3QoZS50YXJnZXQuY2hpbGROb2Rlc1swXS50ZXh0Q29udGVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwieW91IGFyZSBpbiBmb2xkZXJcIiwgdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkpO1xuXG5cblxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICAgICAgaWYgKHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgICAgICByZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICAgICAgdXBkYXRlQWN0aXZlTmF2TWFpbihlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUFjdGl2ZU5hdk1haW4oZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIGNoYW5naW5nIHRvIGEgbmV3IGVtcHR5IGN1c3RvbSBwcm9qZWN0LCBkaXNwbGF5IHBsYWNlaG9sZGVyIHNjcmVlblxuICAgICAgICAgICAgaWYgKCFbJ2hvbWUnLCAnd2VlaycsICd0b2RheSddLmluY2x1ZGVzKHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpKSkge1xuICAgICAgICAgICAgICAgIGlmICh0b2Rvc1t0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKV0ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJFbXB0eVByb2plY3RQbGFjZWhvbGRlcih0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLy8gcmVuZGVyIHRoZSBwcm9qZWN0IG5hbWVzIHRvIHRoZSBzaWRlIGJhclxuICAgIGZ1bmN0aW9uIHJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSkge1xuICAgICAgICBjb25zdCBwcm9qZWN0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3RzJyk7XG4gICAgICAgIC8vIGNsZWFyIGxpc3QgYmVmb3JlIGFwcGVuZGluZyBhbGwgaXRlbXNcbiAgICAgICAgcHJvamVjdENvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiXG4gICAgICAgIFxuICAgICAgICAvLyBnZXQgYW4gb2JqZWN0IG9mIG9ubHkgdGhlIGN1c3RvbSBwcm9qZWN0c1xuICAgICAgICBjb25zdCBwcm9qZWN0c09iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIHRvZG9zKTtcbiAgICAgICAgZGVsZXRlIHByb2plY3RzT2JqZWN0LmhvbWU7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC50b2RheTtcbiAgICAgICAgZGVsZXRlIHByb2plY3RzT2JqZWN0LndlZWs7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJjdXN0b20gcHJvamVjdHNcIiwgcHJvamVjdHNPYmplY3QpO1xuXG4gICAgICAgIC8vIGRpc3BsYXkgcHJvamVjdCBuYW1lcyBhbmQgY291bnRzIHRvIHRoZSBzaWRlYmFyXG4gICAgICAgIGZvciAoY29uc3QgcHJvamVjdCBpbiBwcm9qZWN0c09iamVjdCkge1xuXG4gICAgICAgICAgICAvLyBjb250YWluZXIgYXJvdW5kIHByb2plY3QgbmFtZSBhbmQgY291bnRcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3ROYW1lQ291bnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWVDb3VudC5jbGFzc0xpc3QuYWRkKCdwcm9qZWN0c19faXRlbScpO1xuICAgICAgICAgICAgLy8gcHJvamVjdE5hbWVDb3VudC5jbGFzc0xpc3QuYWRkKCdwcm9qZWN0c19faXRlbS0tY3VzdG9tJyk7XG4gICAgICAgICAgICBwcm9qZWN0TmFtZUNvdW50LmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tbGluaycpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWVDb3VudC5jbGFzc0xpc3QuYWRkKCdjdXN0b20tcHJvamVjdC1jb3VudC1jb250YWluZXInKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gZG9tTWFuaXB1bGF0b3IuY2hhbmdlRm9sZGVyMihlLCB0b2RvcywgZGlzcGxheSkpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWVDb3VudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB1cGRhdGVBY3RpdmVOYXZNYWluKGUpKTtcblxuXG4gICAgICAgICAgICAvLyBwcm9qZWN0IG5hbWVcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3ROYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWUuY2xhc3NMaXN0LmFkZCgndG9kby1mb2xkZXInKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lLmNsYXNzTGlzdC5hZGQoJ3Byb2plY3QtbmFtZScpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWUudGV4dENvbnRlbnQgPSBwcm9qZWN0O1xuICAgICAgICAgICAgLy8gZXZlbnQgbGlzdG5lciB0byBjaGFuZ2Ugd29ya2luZyBmb2xkZXIgLyBwYWdlIGRpc3BsYXlcbiAgICAgICAgICAgIHByb2plY3ROYW1lLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGRvbU1hbmlwdWxhdG9yLmNoYW5nZUZvbGRlcihlLCB0b2RvcywgZGlzcGxheSkpO1xuXG4gICAgICAgICAgICAvLyBwcm9qZWN0IGNvdW50XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0Q291bnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHByb2plY3RDb3VudC5jbGFzc0xpc3QuYWRkKCdwcm9qZWN0LWNvdW50Jyk7XG5cbiAgICAgICAgICAgIC8vIGNvdW50IGhvdyBtYW55IG5vbiBjaGVja2VkIGl0ZW1zIHRoZXJlIGFyZSBpbiB0aGUgcHJvamVjdFxuICAgICAgICAgICAgLy8gYW5kIGFzc2lnbiB0aGlzIHZhbHVlIHRvIHRoZSBjb3VudCB2YWx1ZVxuICAgICAgICAgICAgbGV0IG4gPSAwO1xuICAgICAgICAgICAgcHJvamVjdHNPYmplY3RbcHJvamVjdF0uZm9yRWFjaCh0b2RvID0+IHtcbiAgICAgICAgICAgICAgICBpZighdG9kby5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIG4rK1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvamVjdENvdW50LnRleHRDb250ZW50ID0gbjtcblxuICAgICAgICAgICAgcHJvamVjdE5hbWVDb3VudC5hcHBlbmRDaGlsZChwcm9qZWN0TmFtZSk7XG4gICAgICAgICAgICAvLyBvbmx5IHNob3cgY291bnQgaWYgZ3JlYXRlciB0aGFuIDBcbiAgICAgICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuYXBwZW5kQ2hpbGQocHJvamVjdENvdW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJvamVjdENvbnRhaW5lci5hcHBlbmRDaGlsZChwcm9qZWN0TmFtZUNvdW50KTtcblxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyB0aGlzIHJlLWFwcGx5cyBuYXYgbGluayBzZWxlY3RlZCBzdGF0dXMgdG8gc2VsZWN0ZWQgY3VzdG9tIHByb2plY3QsXG4gICAgICAgICAgICAvLyBzaW5jZSB0aGUgZW50aXJlIGN1c3RvbSBwcm9qZWN0IG5hbWVzIGRpdiBpcyByZS1yZW5kZXJlZCBlYWNoIHRpbWUuIFxuICAgICAgICAgICAgaWYodG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkgPT0gcHJvamVjdCkge1xuICAgICAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuY2xhc3NMaXN0LmFkZCgnbmF2X19zZWxlY3RlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIHVwZGF0ZSBob21lIC8gdG9kYXkgLyB3ZWVrIGZvbGRlcnMuIG9ubHkgY291bnQgbm9uIGNoZWNrZWQgaXRlbXNcbiAgICAgICAgY29uc3QgaG9tZUNvdW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhvbWUtY291bnQnKTtcbiAgICAgICAgLy8gc3VtcyBudW1iZXIgb2Ygbm9uIGNoZWNrZWQgaXRlbSBpbiBwcm9qZWN0IGFycmF5IGFuZCBkaXNwbGF5cyBjb3VudCB0ZXh0IGFzIHRoaXMgc3VtXG4gICAgICAgIC8vIHRoaXMgd2lsbCBvbmx5IGNvdW50IHRoZSBpdGVtcyB0aGF0IGFyZSBzcGVjaWZpY2FsbHkgc2F2ZWQgdG8gaG9tZSBmb2xkZXIsXG4gICAgICAgIC8vIGkgd2FudCB0byBjb3VudCBhbGwgdG9kb3MuXG5cbiAgICAgICAgLy8gaG9tZUNvdW50LnRleHRDb250ZW50ID0gdG9kb3MuaG9tZS5yZWR1Y2UoKHRvdGFsLCB2YWx1ZSkgPT4ge1xuICAgICAgICAvLyAgICAgcmV0dXJuIHRvdGFsICsgIXZhbHVlLmNoZWNrZWQ7XG4gICAgICAgIC8vIH0sIDApO1xuXG4gICAgICAgIGxldCBob21lQ291bnROdW1iZXIgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHRvZG9MaXN0IGluIHRvZG9zKSB7XG4gICAgICAgICAgICB0b2Rvc1t0b2RvTGlzdF0uZm9yRWFjaCh0b2RvID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRvZG8uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBob21lQ291bnROdW1iZXIrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGhvbWVDb3VudC50ZXh0Q29udGVudCA9IGhvbWVDb3VudE51bWJlcjtcbiAgICAgICAgLy8gcmUtc2V0IGNvdW50IGRpc3BsYXlcbiAgICAgICAgaG9tZUNvdW50LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnO1xuICAgICAgICBpZiAoaG9tZUNvdW50LnRleHRDb250ZW50IDwgMSkge1xuICAgICAgICAgICAgLy8gaGlkZSBjb3VudCBkaXNwbGF5IGlmIDBcbiAgICAgICAgICAgIGhvbWVDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgd2Vla0NvdW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndlZWstY291bnQnKTtcbiAgICAgICAgLy8gc3VtcyBudW1iZXIgb2Ygbm9uIGNoZWNrZWQgaXRlbSBpbiBwcm9qZWN0IGFycmF5IGFuZCBkaXNwbGF5cyBjb3VudCB0ZXh0IGFzIHRoaXMgc3VtXG4gICAgICAgIHdlZWtDb3VudC50ZXh0Q29udGVudCA9IHRvZG9zLndlZWsucmVkdWNlKCh0b3RhbCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCArICF2YWx1ZS5jaGVja2VkO1xuICAgICAgICB9LCAwKTtcbiAgICAgICAgLy8gcmUtc2V0IGNvdW50IGRpc3BsYXlcbiAgICAgICAgd2Vla0NvdW50LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWZsZXgnO1xuICAgICAgICBpZiAod2Vla0NvdW50LnRleHRDb250ZW50IDwgMSkge1xuICAgICAgICAgICAgLy8gaGlkZSBjb3VudCBkaXNwbGF5IGlmIDBcbiAgICAgICAgICAgIHdlZWtDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0b2RheUNvdW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRvZGF5LWNvdW50Jyk7XG4gICAgICAgIC8vIHN1bXMgbnVtYmVyIG9mIG5vbiBjaGVja2VkIGl0ZW0gaW4gcHJvamVjdCBhcnJheSBhbmQgZGlzcGxheXMgY291bnQgdGV4dCBhcyB0aGlzIHN1bVxuICAgICAgICB0b2RheUNvdW50LnRleHRDb250ZW50ID0gdG9kb3MudG9kYXkucmVkdWNlKCh0b3RhbCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCArICF2YWx1ZS5jaGVja2VkO1xuICAgICAgICB9LCAwKTtcbiAgICAgICAgLy8gcmUtc2V0IGNvdW50IGRpc3BsYXlcbiAgICAgICAgdG9kYXlDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcbiAgICAgICAgaWYgKHRvZGF5Q291bnQudGV4dENvbnRlbnQgPCAxKSB7XG4gICAgICAgICAgICAvLyBoaWRlIGNvdW50IGRpc3BsYXkgaWYgMFxuICAgICAgICAgICAgdG9kYXlDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIGRpc3BsYXkgdGhlIGFtb3VudCBvZiB0b2RvIGl0ZW1zIG5leHQgdG8gdGhlIHByb2plY3QgdGl0bGVcbiAgICBmdW5jdGlvbiByZW5kZXJQcm9qZWN0Q291bnQodG9kb3MsIGRpc3BsYXkpIHtcbiBcbiAgICB9XG5cbiAgICAvLyBzY3JvbGwgcG9qZWN0IG5hbWVzIHRvIHRvcFxuICAgIGZ1bmN0aW9uIHByb2plY3ROYW1lc1Njcm9sbFRvcCgpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdHNEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdHMnKTtcbiAgICAgICAgcHJvamVjdHNEaXYuc2Nyb2xsVG9wID0gMDtcbiAgICB9XG5cbiAgICAvLyBzY3JvbGwgcHJvamVjdCBuYW1lcyB0byBib3R0b21cbiAgICBmdW5jdGlvbiBwcm9qZWN0TmFtZXNTY3JvbGxCb3R0b20oKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3RzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3RzJyk7XG4gICAgICAgIHByb2plY3RzRGl2LnNjcm9sbFRvcCA9IHByb2plY3RzRGl2LnNjcm9sbEhlaWdodDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJFbXB0eVByb2plY3RQbGFjZWhvbGRlcih0b2RvcywgZGlzcGxheSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpLmlubmVySFRNTCA9IFxuICAgICAgICBgPGRpdiBjbGFzcz1cImFkZC1vci1yZW1vdmVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtb3ItcmVtb3ZlX19oZWFkaW5nXCI+RW1wdHkgUHJvamVjdCE8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtb3ItcmVtb3ZlX19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZC1vci1yZW1vdmVfX2NvbnRlbnQtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICBDcmVhdGUgYSBuZXcgdG8tZG8gaXRlbSBvciBkZWxldGUgcHJvamVjdC5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG5cIj5cbiAgICAgICAgICAgICAgICAgICAgRGVsZXRlIFByb2plY3RcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5gXG5cbiAgICAgICAgXG4gICAgICAgIC8vIHJlbW92ZSBwcm9qZWN0IGJ1dHRvblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG4nKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBkZWxldGUgcHJvamVjdCBmcm9tIHRvZG9zIGRhdGFcbiAgICAgICAgICAgIGRlbGV0ZSB0b2Rvc1t0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluJykuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgIC8vIHNhdmUgdG9kb3MgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2Rvc1wiLCBKU09OLnN0cmluZ2lmeSh0b2RvcykpO1xuICAgICAgICAgICAgcmVuZGVyUHJvamVjdE5hbWVzKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgIC8vIGNoYW5nZSBmb2xkZXIgdG8gaG9tZVxuICAgICAgICAgICAgdG9Eb3NNYW5hZ2VyLmNoYW5nZUN1cnJlbnRQcm9qZWN0KCdob21lJyk7XG4gICAgICAgICAgICByZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICAvLyB1cGRhdGUgbmF2ZSBsaW5rIHRvIHNob3cgaG9tZSBhY3RpdmVcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYXYnKS5jaGlsZHJlbi5pdGVtKDApLmNsYXNzTGlzdC5hZGQoJ25hdl9fc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYXYnKS5jaGlsZHJlbi5pdGVtKDApKTtcblxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB0dXJuIG9mZiBzZWxlY3RlZCBzdHlsaW5nIGZvciBhbGwgbmF2IGl0ZW1zIGFuZCBhcHBseSB0byB0aGUgc2VsZWN0ZWQgaXRlbVxuICAgIGZ1bmN0aW9uIHVwZGF0ZUFjdGl2ZU5hdk1haW4oZSkge1xuICAgICAgICBjb25zdCBuYXZJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXZfX2l0ZW0tLWxpbmsnKTtcbiAgICAgICAgbmF2SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcIm5hdl9fc2VsZWN0ZWRcIik7XG4gICAgICAgIH0pXG4gICAgICAgXG4gICAgICAgIGlmIChlLnRhcmdldC50ZXh0Q29udGVudCA9PT0gJ05vdGVzJykge1xuICAgICAgICAgICAgZS50YXJnZXQuY2xhc3NMaXN0LmFkZCgnbmF2X19zZWxlY3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT0gXCJzcGFuXCIgfHwgZS50YXJnZXQudGFnTmFtZSA9PSBcIlNQQU5cIikge1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF2X19zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldC50YWdOYW1lID09IFwibGlcIiB8fCBlLnRhcmdldC50YWdOYW1lID09IFwiTElcIikge1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ25hdl9fc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIGFmdGVyIGZvcm0gY2xvc2VzLCByZXNldCB0aGUgYWN0aXZlIGxpbmsgdG8gdGhlIG5ldyB0b2RvIG1lbnVcbiAgICBmdW5jdGlvbiByZXNldEFjdGl2ZUZvcm1MaW5rKCkge1xuICAgICAgICBjb25zdCBjcmVhdGVOZXdPcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMnKTtcbiAgICAgICAgY3JlYXRlTmV3T3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICAgICAgICBvcHRpb24uY2xhc3NMaXN0LnJlbW92ZSgnY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmUnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNyZWF0ZU5ld09wdGlvbnNbMF0uY2xhc3NMaXN0LmFkZCgnY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGFuZ2VBY3RpdmVGb3JtTGluaygpIHtcbiAgICAgICAgY29uc3QgY3JlYXRlTmV3T3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zJyk7XG4gICAgICAgIGNyZWF0ZU5ld09wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICAgICAgb3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTmV3T3B0aW9ucy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdjcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ2NyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMtYWN0aXZlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJUb0RvcyxcbiAgICAgICAgcmVuZGVyQWxsVG9Eb3MsXG4gICAgICAgIHRvZ2dsZUNoZWNrQm94LFxuICAgICAgICBhcHBseUNoZWNrZWRPblJlbG9hZCxcbiAgICAgICAgYWN0aXZlUHJpb3JpdHksXG4gICAgICAgIHJlbW92ZUFjdGl2ZVByaW9yaXR5LFxuICAgICAgICBlZGl0UHJpb3JpdHksXG4gICAgICAgIHJlbmRlckRldGFpbHMsXG4gICAgICAgIHJlbmRlckVkaXQsXG4gICAgICAgIGNoYW5nZUZvbGRlcixcbiAgICAgICAgY2hhbmdlRm9sZGVyMixcbiAgICAgICAgcmVuZGVyUHJvamVjdE5hbWVzLFxuICAgICAgICByZW5kZXJQcm9qZWN0Q291bnQsXG4gICAgICAgIHByb2plY3ROYW1lc1Njcm9sbFRvcCxcbiAgICAgICAgcHJvamVjdE5hbWVzU2Nyb2xsQm90dG9tLFxuICAgICAgICByZW5kZXJFbXB0eVByb2plY3RQbGFjZWhvbGRlcixcbiAgICAgICAgdXBkYXRlQWN0aXZlTmF2TWFpbixcbiAgICAgICAgcmVzZXRBY3RpdmVGb3JtTGluayxcbiAgICAgICAgY2hhbmdlQWN0aXZlRm9ybUxpbmtcbiAgICB9O1xufSkoKTtcblxuLy8gVG8gRG8gZGF0YSBtYW5hZ2VyIFxuZXhwb3J0IGNvbnN0IHRvRG9zTWFuYWdlciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBrZWVwIHRyYWNrIG9mIHdoYXQgcGFnZSB0aGUgdXNlciBpcyBvbiwgc28gdGhhdCBhZGRlZCBpdGVtcyBnb1xuICAgIC8vIHRvIHRoZSBjb3JyZWN0IHByb2plY3QuIGRlZmF1bHRzIHRvIGhvbWUgcGFnZSBvbiBsb2FkXG5cbiAgICBsZXQgY3VycmVudFByb2plY3QgPSBcImhvbWVcIjtcblxuICAgIC8vIGNoYW5nZSBjdXJyZW50UHJvamVjdFxuICAgIGZ1bmN0aW9uIGNoYW5nZUN1cnJlbnRQcm9qZWN0KG5ld1Byb2plY3QpIHtcbiAgICAgICAgY3VycmVudFByb2plY3QgPSBuZXdQcm9qZWN0O1xuICAgIH1cblxuICAgIC8vIGdldCBjdXJyZW50UHJvamVjdFxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRQcm9qZWN0KCkge1xuICAgICAgICByZXR1cm4gY3VycmVudFByb2plY3Q7XG4gICAgfVxuXG4gICBcblxuXG4gICAgLy8gVG8tZG8gZmFjdG9yeSBmdW5jdGlvblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRvRG8obmFtZSwgcHJpb3JpdHksIGRhdGUsIGRldGFpbHMsIHByb2plY3QsIGNoZWNrZWQ9ZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBwcmlvcml0eSxcbiAgICAgICAgICAgIGRhdGUsXG4gICAgICAgICAgICBkZXRhaWxzLFxuICAgICAgICAgICAgcHJvamVjdCxcbiAgICAgICAgICAgIGNoZWNrZWRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHJpZXZlcyB0aGUgZGF0YSBlbnRlcmVkIHRvIHRoZSBuZXcgdG8tZG8gZm9ybSBhbmQgY3JlYXRlcyBhIG5ldyB0by1kb1xuICAgIC8vIGFuZCB0aGVuIGRpc3BsYXlzIGl0IHRvIHRoZSBkb21cbiAgICBmdW5jdGlvbiBhZGROZXdUb0RvKGUsIHRvRG9MaXN0LCBkaXNwbGF5LCBvdmVybGF5LCBmb3JtKSB7XG5cbiAgICAgICAgLy8gc3RvcCBwYWdlIGZyb20gcmVmcmVzaGluZyBhZnRlciBlYWNoIHN1Ym1pdFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICBcbiAgICAgICAgY29uc3QgdG9Eb1RpdGxlID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby10aXRsZScpKS52YWx1ZTtcbiAgICAgICAgY29uc3QgdG9Eb0RldGFpbHMgPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy10b2RvLWRldGFpbHMnKSkudmFsdWU7XG4gICAgICAgIGNvbnN0IHRvRG9EYXRlID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby1kYXRlJykpLnZhbHVlO1xuICAgICAgICBjb25zdCB0b0RvUHJpb3JpdHkgPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJjcmVhdGUtbmV3LXByaW9yaXR5XCJdOmNoZWNrZWQnKSkudmFsdWU7XG4gICAgICAgIC8vIGdldCB0aGUgY3VycmVudCBwcm9qZWN0IHNvIGNhbiBzdG9yZSBuZXcgdG8tZG8gaXRlbSBpbiB0aGUgY29ycmVjdCBzdWIgYXJyYXkuXG4gICAgICAgIGNvbnN0IHRvRG9Qcm9qZWN0ID0gZ2V0Q3VycmVudFByb2plY3QoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG5ld1RvRG8gPSBjcmVhdGVUb0RvKHRvRG9UaXRsZSwgdG9Eb1ByaW9yaXR5LCB0b0RvRGF0ZSwgdG9Eb0RldGFpbHMsIHRvRG9Qcm9qZWN0KTtcbiAgICAgICAgdG9Eb0xpc3RbdG9Eb1Byb2plY3RdLnB1c2gobmV3VG9Ebyk7XG5cblxuICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgLy8gb25seSByZW5kZXIgdGhlIHJlbGV2ZW50IHRvLWRvIGl0ZW1zXG4gICAgICAgIGlmIChnZXRDdXJyZW50UHJvamVjdCgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlckFsbFRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyVG9Eb3ModG9Eb0xpc3QsIGRpc3BsYXkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBjbG9zZXMgdGhlIGZvcm0gYW5kIHJlbW92ZXMgdGhlIG92ZXJsYXkgYWZ0ZXIgc3VibWlzc2lvblxuICAgICAgICBvdmVybGF5LmNsYXNzTGlzdC50b2dnbGUoJ292ZXJsYXktbmV3LWludmlzaWJsZScpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC50b2dnbGUoJ2NyZWF0ZS1uZXctb3BlbicpO1xuXG4gICAgICAgIC8vIEkgd2FudCB0aGUgZm9ybSB0byBmYWRlIG91dCBiZWZvcmUgdGhlIGlucHV0cyBhcmUgcmVzZXRcbiAgICAgICAgY29uc3Qgc2xlZXAgPSAobWlsbGlzZWNvbmRzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1pbGxpc2Vjb25kcykpXG4gICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc2xlZXAoMzAwKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIGNsZWFyIGlucHV0cyBhZnRlciBzdWJtaXNzaW9uIFxuICAgICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgICAgLy8gcmVtb3ZlcyBhY3RpdmUgc3RhdHVzIGZyb20gYWxsIGJ1dHRvbnNcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbW92ZUFjdGl2ZVByaW9yaXR5KCk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gdXBkYXRlIHByb2plY3QgbmFtZSBjb3VudGVyIFxuICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJQcm9qZWN0TmFtZXModG9Eb0xpc3QsIGRpc3BsYXkpO1xuICAgIH1cblxuICAgIC8vIGVkaXQgc2VsZWN0ZWQgdG9kbyBkYXRhXG4gICAgZnVuY3Rpb24gZWRpdFRvRG8oZSwgdG9Eb0xpc3QsIGRpc3BsYXksIG92ZXJsYXksIGZvcm0pIHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBwb3NpdGlvbiBvZiB0aGUgdG8tZG8gaXRlbSBpbiB0aGUgZGF0YSBhcnJheVxuICAgICAgICBjb25zdCBpID0gZS50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuZGF0YXNldC5pbmRleDtcbiAgICAgICAgLy8gcmV0cmlldmUgdGhlIHByb2plY3QgdGhlIHRvLWRvIHdhcyBhc3NpZ25lZCB0b1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvamVjdCA9IGUudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmRhdGFzZXQucHJvamVjdDtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRvLWRvIGl0ZW0gZGF0YVxuICAgICAgICB0b0RvTGlzdFtwcm9qZWN0XVtpXS5uYW1lID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwX19pbnB1dCcpKS52YWx1ZTtcbiAgICAgICAgdG9Eb0xpc3RbcHJvamVjdF1baV0uZGV0YWlscyA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9faW5wdXQtYmlnJykpLnZhbHVlO1xuICAgICAgICB0b0RvTGlzdFtwcm9qZWN0XVtpXS5kYXRlID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwX19kYXRlLWlucHV0JykpLnZhbHVlO1xuICAgICAgICB0b0RvTGlzdFtwcm9qZWN0XVtpXS5wcmlvcml0eSA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cImVkaXQtcHJpb3JpdHlcIl06Y2hlY2tlZCcpKS52YWx1ZTtcblxuICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgLy8gb25seSByZW5kZXIgdGhlIHJlbGV2ZW50IHRvLWRvIGl0ZW1zXG4gICAgICAgIGlmIChnZXRDdXJyZW50UHJvamVjdCgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlckFsbFRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRvRG9MaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnRvZ2dsZSgnb3ZlcmxheS1lZGl0LWludmlzaWJsZScpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC50b2dnbGUoJ2VkaXQtcG9wdXAtb3BlbicpO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwX19pbnB1dCcpLnZhbHVlKTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlcyBzZWxlY3RlZCB0by1kbyBpdGVtIGZyb20gdGhlIGFycmF5IGFuZCByZSByZW5kZXJzIHRoZSBkaXNwbGF5XG4gICAgZnVuY3Rpb24gZGVsZXRlVG9EbyhlLCB0b0RvTGlzdCwgZGlzcGxheSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZS50YXJnZXQ7XG4gICAgICAgIGxldCBpPSBlbGVtZW50LnBhcmVudEVsZW1lbnQuZGF0YXNldC5pbmRleDtcbiAgICAgICAgbGV0IHByb2plY3Q9IGVsZW1lbnQucGFyZW50RWxlbWVudC5kYXRhc2V0LnByb2plY3Q7XG4gICAgICAgIFxuICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgLy8gb25seSByZW5kZXIgdGhlIHJlbGV2ZW50IHRvLWRvIGl0ZW1zXG4gICAgICAgIGlmIChnZXRDdXJyZW50UHJvamVjdCgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgIC8vIGlmIGluIGhvbWVcbiAgICAgICAgICAgIHRvRG9MaXN0W3Byb2plY3RdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlckFsbFRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgICAgIC8vIGxvZ3MgdGhlIGVudGlyZSB0by1kbyBvYmplY3RcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRvRG9MaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRvRG9MaXN0W3RvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpXSk7XG4gICAgICAgICAgICAvLyBsb2dzIGp1c3QgdGhlIHByb2plY3QgYXJyYXlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9Eb0xpc3RbdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCldLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyVG9Eb3ModG9Eb0xpc3QsIGRpc3BsYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2RlbCcsIHRvRG9MaXN0KVxuICAgICAgICAvL2NoZWNrIGlmIGEgcHJvamVjdCBpcyBub3cgZW1wdHksIGFuZCBkZWxldGUgdGhlIHByb2plY3QgaWYgdHJ1ZVxuICAgICAgICBjaGVja0VtcHR5UHJvamVjdCh0b0RvTGlzdCwgZGlzcGxheSk7XG4gICAgICAgIC8vIHNhdmUgdG9kb3MgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRvZG9zXCIsIEpTT04uc3RyaW5naWZ5KHRvRG9MaXN0KSk7XG4gICAgICAgIC8vIHVwZGF0ZSBwcm9qZWN0IG5hbWUgY291bnRlciBcbiAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyUHJvamVjdE5hbWVzKHRvRG9MaXN0LCBkaXNwbGF5KTtcblxuICAgIH1cblxuICAgIC8vIGFkZCBuZXcgcHJvamVjdCB0by1kb3Mgb2JqZWN0XG4gICAgZnVuY3Rpb24gYWRkTmV3UHJvamVjdChlLCB0b2Rvcywgb3ZlcmxheSwgZm9ybSwgZGlzcGxheSkge1xuICAgICAgICBjb25zdCBuZXdQcm9qZWN0ID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jcmVhdGUtbmV3X19wcm9qZWN0LWlucHV0JykpLnZhbHVlO1xuICAgICAgICAvLyBpZiB0ZXh0IHdhcyBlbnRlcmVkIGluIHRoZSBpbnB1dCBhbmQgcHJvamVjdCBkb2VzbnQgYWxyZWFkeSBleGlzdFxuICAgICAgICBpZiAobmV3UHJvamVjdCAmJiAhKG5ld1Byb2plY3QudG9Mb3dlckNhc2UoKSBpbiB0b2RvcykpIHtcbiAgICAgICAgICAgIHRvZG9zW25ld1Byb2plY3RdID0gW107XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciBwcm9qZWN0IG5hbWVzIGluIHNpZGViYXJcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHNldHMgdGhlIGN1cnJlbnQgZm9sZGVyIHZhcmlhYmxlIHRvIG5hdiBpdGVtIHRoYXQgd2FzIGNsaWNrZWRcbiAgICAgICAgICAgIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdChuZXdQcm9qZWN0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwieW91IGFyZSBpbiBmb2xkZXJcIiwgdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkpO1xuXG4gICAgICAgICAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBpZiBvbiB0aGUgaG9tZSBwYWdlLiBvdGhlcndpc2VcbiAgICAgICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICAgICAgaWYgKHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclRvRG9zKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2V0cyBuYXYgYWN0aXZlIHN0YXR1cyB0byBuZXdseSBjcmVhdGVkIHByb2plY3RcbiAgICAgICAgICAgIGNvbnN0IG5hdkl0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdl9faXRlbS0tbGluaycpO1xuICAgICAgICAgICAgbmF2SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJuYXZfX3NlbGVjdGVkXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0cycpLmxhc3RDaGlsZC5jbGFzc0xpc3QuYWRkKCduYXZfX3NlbGVjdGVkJyk7XG5cbiAgICAgICAgICAgIC8vIHNjcm9sbHMgdG8gYm90dG9tIG9mIGN1c3RvbSBwcm9qZWN0cyBkaXZcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnByb2plY3ROYW1lc1Njcm9sbEJvdHRvbSgpO1xuXG4gICAgICAgICAgLy8gaWYgdGhlIGNyZWF0ZWQgcHJvamVjdCBhbHJlYWR5IGV4aXN0cywgY2hhbmdlIGZvbGRlciB0byB0aGF0IHByb2plY3QgIFxuICAgICAgICB9IGVsc2UgaWYgKG5ld1Byb2plY3QgJiYgKG5ld1Byb2plY3QudG9Mb3dlckNhc2UoKSBpbiB0b2RvcykpIHtcblxuICAgICAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciB0aGUgcmVsZXZlbnQgdG8tZG8gaXRlbXNcbiAgICAgICAgICAgIGlmIChuZXdQcm9qZWN0LnRvTG93ZXJDYXNlKCkgPT09ICdob21lJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke25ld1Byb2plY3R9IGFscmVhZHkgZXhpc3RzLiBjaGFuZ2luZyBmb2xkZXIgdG8gJHtuZXdQcm9qZWN0fWApO1xuICAgICAgICAgICAgICAgIGNoYW5nZUN1cnJlbnRQcm9qZWN0KG5ld1Byb2plY3QudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtuZXdQcm9qZWN0fSBhbHJlYWR5IGV4aXN0cy4gY2hhbmdpbmcgZm9sZGVyIHRvICR7bmV3UHJvamVjdH1gKTtcbiAgICAgICAgICAgICAgICBjaGFuZ2VDdXJyZW50UHJvamVjdChuZXdQcm9qZWN0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclRvRG9zKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xvc2VzIHRoZSBmb3JtIGFuZCByZW1vdmVzIHRoZSBvdmVybGF5IGFmdGVyIHN1Ym1pc3Npb25cbiAgICAgICAgb3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKCdvdmVybGF5LW5ldy1pbnZpc2libGUnKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdjcmVhdGUtbmV3LW9wZW4nKTtcblxuXG4gICAgICAgIC8vIEkgd2FudCB0aGUgZm9ybSB0byBmYWRlIG91dCBiZWZvcmUgdGhlIGlucHV0IGlzIHJlc2V0XG4gICAgICAgIGNvbnN0IHNsZWVwID0gKG1pbGxpc2Vjb25kcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtaWxsaXNlY29uZHMpKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzbGVlcCgzMDApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gY2xlYXIgaW5wdXQgYWZ0ZXIgZm9ybSBjbG9zZXMgXG4gICAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgICAvLyByZXNldCBhZGQgbmV3IGZvcm0gdG8gc2hvdyBhZGQgdG9kb1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1wcm9qZWN0LW1lbnUnKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy10b2RvLW1lbnUnKS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gc2hvdyBhIHBsYWNlaG9sZGVyIHNjcmVlbiBhZnRlciBhIG5ldyBlbXB0eSBwcm9qZWN0IGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyRW1wdHlQcm9qZWN0UGxhY2Vob2xkZXIodG9kb3MsIGRpc3BsYXkpO1xuXG4gICAgICAgIC8vdXBkYXRlIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2Rvc1wiLCBKU09OLnN0cmluZ2lmeSh0b2RvcykpO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tFbXB0eVByb2plY3QodG9kb3MsIGRpc3BsYXkpIHtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBnZXQgYW4gb2JqZWN0IG9mIG9ubHkgdGhlIGN1c3RvbSBwcm9qZWN0c1xuICAgICAgICBjb25zdCBwcm9qZWN0c09iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIHRvZG9zKTtcbiAgICAgICAgZGVsZXRlIHByb2plY3RzT2JqZWN0LmhvbWU7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC50b2RheTtcbiAgICAgICAgZGVsZXRlIHByb2plY3RzT2JqZWN0LndlZWs7XG5cbiAgICAgICAgLy8gb25seSBkZWxldGUgZW1wdHkgY3VzdG9tIHByb2plY3RzXG4gICAgICAgIGlmICghWydob21lJywgJ3dlZWsnLCAndG9kYXknXS5pbmNsdWRlcyhnZXRDdXJyZW50UHJvamVjdCgpKSkge1xuICAgICAgICAgICAgLy8gZGVsZXRlcyBvbmx5IHRoZSBjdXJyZW50IGVtcHR5IHByb2plY3RcbiAgICAgICAgICAgIGlmIChwcm9qZWN0c09iamVjdFtnZXRDdXJyZW50UHJvamVjdCgpXS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVsZXRlIHRvZG9zW2dldEN1cnJlbnRQcm9qZWN0KCldO1xuICAgICAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY2hhbmdlIGZvbGRlciB0byBob21lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2hhbmdlQ3VycmVudFByb2plY3QoJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgbmF2ZSBsaW5rIHRvIHNob3cgaG9tZSBhY3RpdmVcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2JykuY2hpbGRyZW4uaXRlbSgwKS5jbGFzc0xpc3QuYWRkKCduYXZfX3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdicpLmNoaWxkcmVuLml0ZW0oMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuXG4gICAgICAgIC8vIGRlbGV0ZXMgYWxsIGVtcHR5IHByb2plY3RzXG4gICAgICAgIC8vIGZvciAoY29uc3QgcHJvamVjdCBpbiBwcm9qZWN0c09iamVjdCkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2cocHJvamVjdCk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhwcm9qZWN0c09iamVjdFtwcm9qZWN0XSk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhwcm9qZWN0c09iamVjdFtwcm9qZWN0XS5sZW5ndGgpO1xuICAgICAgICAvLyAgICAgaWYgKHByb2plY3RzT2JqZWN0W3Byb2plY3RdLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgLy8gICAgICAgICBkZWxldGUgdG9kb3NbcHJvamVjdF07XG4gICAgICAgIC8vICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyUHJvamVjdE5hbWVzKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjaGFuZ2VDdXJyZW50UHJvamVjdCxcbiAgICAgICAgZ2V0Q3VycmVudFByb2plY3QsXG4gICAgICAgIGNyZWF0ZVRvRG8sXG4gICAgICAgIGFkZE5ld1RvRG8sXG4gICAgICAgIGVkaXRUb0RvLFxuICAgICAgICBkZWxldGVUb0RvLFxuICAgICAgICBhZGROZXdQcm9qZWN0LFxuICAgICAgICBjaGVja0VtcHR5UHJvamVjdFxuICAgIH1cbn0pKCk7XG5cbi8vIFRvIERvIGRhdGEgbWFuYWdlciBcbmV4cG9ydCBjb25zdCBub3Rlc01hbmFnZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGNvbGM7XG4gICAgXG5cbiAgICBmdW5jdGlvbiBhcnJhbmdlTm90ZXMobm90ZXMpIHtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1jb2wgZ3JpZC1jb2wtLTFcIj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtY29sIGdyaWQtY29sLS0yXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWNvbCBncmlkLWNvbC0tM1wiPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmBcbiAgICAgICAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkJyk7XG4gICAgICAgXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgY29sYyBncmlkIGFscmVhZHkgYnVpbHQsIGRlbGV0ZSBpdCBzbyBjYW4gbWFrZSBhIG5ldyBvbmUuXG4gICAgICAgIC8vIGkgdHJpZWQgc28gbWFueSB3YXlzIHRvIHVwZGF0ZSB0aGUgZ3JpZCBhbmQgdGhpcyBpcyB3aGF0IHdvcmtzLlxuICAgICAgICBpZiAodHlwZW9mIGNvbGMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb2xjLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIGdyaWQuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJncmlkLWNvbCBncmlkLWNvbC0tMVwiPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtY29sIGdyaWQtY29sLS0yXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1jb2wgZ3JpZC1jb2wtLTNcIj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdGl0aWFsaXNlIGNvbGNhZGUgbWFzb25yeSBsYXlvdXRcbiAgICAgICAgY29sYyA9IG5ldyBDb2xjYWRlKCAnLmdyaWQnLCB7XG4gICAgICAgICAgICBjb2x1bW5zOiAnLmdyaWQtY29sJyxcbiAgICAgICAgICAgIGl0ZW1zOiAnLm5vdGUnXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBcblxuICAgICAgICAvLyBjcmVhdGUgbm90ZSBlbGVtZW50cyBhbmQgYXBwZW5kIHRvIGNvbGNcbiAgICAgICAgbm90ZXMuZm9yRWFjaCgobm90ZSwgaSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBub3RlQm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgbm90ZUJvZHkuY2xhc3NMaXN0LmFkZCgnbm90ZScpO1xuICAgICAgICAgICAgLy8gYXNzb2NpYXRlIGVsZW1lbnQgd2l0aCBwb3NpdGlvbiBpbiBhcnJheVxuICAgICAgICAgICAgbm90ZUJvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdGVDbG9zZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgbm90ZUNsb3NlLmNsYXNzTGlzdC5hZGQoJ25vdGVfX2Nsb3NlJyk7XG4gICAgICAgICAgICBub3RlQ2xvc2UuaW5uZXJIVE1MID0gJyZ0aW1lczsnO1xuICAgICAgICAgICAgbm90ZUNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiBkZWxldGVOb3RlKGUsIG5vdGVzKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdGVUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgbm90ZVRpdGxlLmNsYXNzTGlzdC5hZGQoJ25vdGVfX3RpdGxlJyk7XG4gICAgICAgICAgICBub3RlVGl0bGUudGV4dENvbnRlbnQgPSBub3RlLnRpdGxlO1xuICAgICAgICAgICAgbm90ZVRpdGxlLnNldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJywgJ3RydWUnKTtcbiAgICAgICAgICAgIG5vdGVUaXRsZS5zZXRBdHRyaWJ1dGUoJ3NwZWxsY2hlY2snLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIC8vIGVkaXQgdGl0bGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICAgIG5vdGVUaXRsZS5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGUgPT4gZWRpdE5vdGUoZSwgbm90ZXMpKTtcblxuICAgICAgICAgICAgY29uc3Qgbm90ZVRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG5vdGVUZXh0LmNsYXNzTGlzdC5hZGQoJ25vdGVfX3RleHQnKTtcbiAgICAgICAgICAgIG5vdGVUZXh0LnRleHRDb250ZW50ID0gbm90ZS50ZXh0O1xuICAgICAgICAgICAgbm90ZVRleHQuc2V0QXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnLCAndHJ1ZScpO1xuICAgICAgICAgICAgbm90ZVRleHQuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAvLyBlZGl0IHRpdGxlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICBub3RlVGV4dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGUgPT4gZWRpdE5vdGUoZSwgbm90ZXMpKTtcblxuICAgICAgICAgICAgbm90ZUJvZHkuYXBwZW5kQ2hpbGQobm90ZUNsb3NlKTtcbiAgICAgICAgICAgIG5vdGVCb2R5LmFwcGVuZENoaWxkKG5vdGVUaXRsZSk7XG4gICAgICAgICAgICBub3RlQm9keS5hcHBlbmRDaGlsZChub3RlVGV4dCk7XG5cbiAgICAgICAgICAgIGNvbGMuYXBwZW5kKG5vdGVCb2R5KTtcbiAgICAgXG4gICAgICAgIH0pXG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVOb3RlKHRpdGxlLCB0ZXh0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZE5ld05vdGUoZSwgbm90ZXMsIG92ZXJsYXksIGZvcm0sIGRpc3BsYXkpIHtcblxuICAgICAgICBjb25zdCBub3RlVGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LW5vdGUtdGl0bGUnKS52YWx1ZTtcbiAgICAgICAgY29uc3Qgbm90ZVRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LW5vdGUtdGV4dCcpLnZhbHVlO1xuXG4gICAgICAgIGNvbnN0IG5ld05vdGUgPSBjcmVhdGVOb3RlKG5vdGVUaXRsZSwgbm90ZVRleHQpO1xuICAgICAgICBub3Rlcy51bnNoaWZ0KG5ld05vdGUpO1xuXG4gICAgICAgIGFycmFuZ2VOb3Rlcyhub3Rlcyk7XG4gICAgICAgIC8vIHNldHMgbmF2IGFjdGl2ZSBsaW5rIHRvICdub3RlcycgXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3Rlcy1uYXYnKS5jbGljaygpO1xuICAgICAgICBcbiAgICAgICAgLy8gY2xvc2VzIHRoZSBmb3JtIGFuZCByZW1vdmVzIHRoZSBvdmVybGF5IGFmdGVyIHN1Ym1pc3Npb25cbiAgICAgICAgb3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKCdvdmVybGF5LW5ldy1pbnZpc2libGUnKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdjcmVhdGUtbmV3LW9wZW4nKTtcblxuICAgICAgICAvLyBJIHdhbnQgdGhlIGZvcm0gdG8gZmFkZSBvdXQgYmVmb3JlIHRoZSBpbnB1dHMgYXJlIHJlc2V0XG4gICAgICAgIGNvbnN0IHNsZWVwID0gKG1pbGxpc2Vjb25kcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtaWxsaXNlY29uZHMpKVxuICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHNsZWVwKDMwMCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBjbGVhciBpbnB1dHMgYWZ0ZXIgc3VibWlzc2lvbiBcbiAgICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIHJlc2V0IGFkZCBuZXcgZm9ybSB0byBzaG93IGFkZCB0b2RvXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LW5vdGUtbWVudScpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXRvZG8tbWVudScpLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBzYXZlIG5vdGVzIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJub3Rlc1wiLCBKU09OLnN0cmluZ2lmeShub3RlcykpO1xuICAgIH1cblxuICAgIC8vIGRlbGV0ZSBzZWxlY3RlZCBub3RlIGFuZCByZWZyZXNoIHRoZSBub3Rlc1xuICAgIGZ1bmN0aW9uIGRlbGV0ZU5vdGUoZSwgbm90ZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cobm90ZXMpO1xuICAgICAgICBjb25zdCBpID0gZS50YXJnZXQucGFyZW50RWxlbWVudC5kYXRhc2V0LmluZGV4O1xuICAgICAgICBub3Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGFycmFuZ2VOb3Rlcyhub3Rlcyk7XG5cbiAgICAgICAgLy8gc2F2ZSBub3RlcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm90ZXNcIiwgSlNPTi5zdHJpbmdpZnkobm90ZXMpKTtcbiAgICB9XG5cbiAgICAvLyBlZGl0IG5vdGVcbiAgICBmdW5jdGlvbiBlZGl0Tm90ZShlLCBub3Rlcykge1xuICAgICAgICBcbiAgICAgICAgLy8gdG9FZGl0IHJldHVybnMgXCJ0aXRsZVwiIG9yIFwibm90ZVwiIGRlcGVuZGluZyBvbiB3aGF0IGlzIGNoYW5nZWRcbiAgICAgICAgY29uc3QgdG9FZGl0ID0gZS50YXJnZXQuY2xhc3NMaXN0WzBdLnNsaWNlKDYpO1xuICAgICAgICBjb25zdCBpID0gZS50YXJnZXQucGFyZW50RWxlbWVudC5kYXRhc2V0LmluZGV4O1xuICAgICAgICBjb25zdCBuZXdUZXh0ID0gZS50YXJnZXQudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgaWYgKHRvRWRpdCA9PT0gXCJ0aXRsZVwiKSB7XG4gICAgICAgICAgICBub3Rlc1tpXS50aXRsZSA9IG5ld1RleHQ7ICBcbiAgICAgICAgfSBlbHNlIGlmICh0b0VkaXQgPT09XCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgIG5vdGVzW2ldLnRleHQgPSBuZXdUZXh0O1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdlZGl0aW5nIG5vdGUnKTtcblxuICAgICAgICAvLyBzYXZlIG5vdGVzIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJub3Rlc1wiLCBKU09OLnN0cmluZ2lmeShub3RlcykpO1xuICAgICAgICBcbiAgICB9XG5cbiAgICBcblxuICAgIHJldHVybiB7XG4gICAgICAgIGFycmFuZ2VOb3RlcyxcbiAgICAgICAgY3JlYXRlTm90ZSxcbiAgICAgICAgYWRkTmV3Tm90ZSxcbiAgICAgICAgZGVsZXRlTm90ZSxcbiAgICAgICAgZWRpdE5vdGVcbiAgICB9XG59KSgpOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmNcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSBzY3JpcHRVcmwgPSBzY3JpcHRzW3NjcmlwdHMubGVuZ3RoIC0gMV0uc3JjXG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIl9fd2VicGFja19yZXF1aXJlX18uYiA9IGRvY3VtZW50LmJhc2VVUkkgfHwgc2VsZi5sb2NhdGlvbi5ocmVmO1xuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG4vLyBubyBvbiBjaHVua3MgbG9hZGVkXG5cbi8vIG5vIGpzb25wIGZ1bmN0aW9uIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgJy4vc3R5bGUuY3NzJztcbmltcG9ydCB7dG9Eb3NNYW5hZ2VyLCBkb21NYW5pcHVsYXRvciwgbm90ZXNNYW5hZ2VyfSBmcm9tIFwiLi9sb2dpY01vZHVsZVwiXG5jb25zdCB0b2RvcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RvZG9zJykpIHx8IHtcbiAgICBcImhvbWVcIjogW10sXG4gICAgXCJ0b2RheVwiOiBbXSxcbiAgICBcIndlZWtcIjogW10sXG59XG5jb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKTtcbmNvbnN0IG9wZW5Gb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5ldy10b2RvJyk7XG5jb25zdCBjbG9zZUZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3JlYXRlLW5ld19fY2xvc2UnKTtcbmNvbnN0IG92ZXJsYXlOZXcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcub3ZlcmxheS1uZXcnKTtcbmNvbnN0IGFkZFRvRG9Gb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNyZWF0ZS1uZXcnKTtcbmNvbnN0IGRldGFpbHNQb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXRhaWxzLXBvcHVwJyk7XG5jb25zdCBkZXRhaWxzT3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vdmVybGF5LWRldGFpbHMnKTtcbmNvbnN0IGVkaXRQb3B1cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwJyk7XG5jb25zdCBlZGl0T3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vdmVybGF5LWVkaXQnKTtcbmNvbnN0IGVkaXRGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVkaXQtcG9wdXAnKTtcbmNvbnN0IHRvRG9Gb2xkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvZG8tZm9sZGVyJyk7XG5jb25zdCBjcmVhdGVQcm9qZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNyZWF0ZS1uZXdfX3Byb2plY3Qtc3VibWl0Jyk7XG5jb25zdCBjcmVhdGVOb3RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0Jyk7XG5jb25zdCBuZXdUb0RvTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby1saW5rJyk7IFxuY29uc3QgbmV3UHJvamVjdExpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXByb2plY3QtbGluaycpOyBcbmNvbnN0IG5ld05vdGVMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1ub3RlLWxpbmsnKTsgXG5jb25zdCBuZXdUb0RvTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby1tZW51Jyk7XG5jb25zdCBuZXdQcm9qZWN0TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctcHJvamVjdC1tZW51Jyk7XG5jb25zdCBuZXdOb3RlTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctbm90ZS1tZW51Jyk7XG5cbi8vIGluaXRpYWwgaG9tZXNjcmVlbiByZW5kZXJcbmRvbU1hbmlwdWxhdG9yLnJlbmRlckFsbFRvRG9zKHRvZG9zLCBkaXNwbGF5KTtcbmRvbU1hbmlwdWxhdG9yLnJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSk7XG5cbi8vIG5hdmlnYXRlIHRvIGhvbWUvdG9kYXkvd2Vla1xudG9Eb0ZvbGRlcnMuZm9yRWFjaChmb2xkZXIgPT4ge1xuICAgIGZvbGRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkb21NYW5pcHVsYXRvci5jaGFuZ2VGb2xkZXIoZSwgdG9kb3MsIGRpc3BsYXkpKTtcbn0pXG5cbi8vIGFycmF5IG9mIHRvLWRvIG5vdGVzIFxuLy8gZ3JhYiBhcnJheSBkYXRhIGZyb20gbG9jYWwgc3RvcmFnZSBpZiBpdCBleGlzdHMsIG9yIGNyZWF0ZSBuZXcgZXhhbXBsZSBhcnJheVxuY29uc3Qgbm90ZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdub3RlcycpKSB8fCBbXTtcblxuLy8gbmF2aWdhdGUgdG8gbm90ZXMgbWVudVxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25vdGVzLW5hdicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gbm90ZXNNYW5hZ2VyLmFycmFuZ2VOb3Rlcyhub3RlcykpO1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25vdGVzLW5hdicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IGRvbU1hbmlwdWxhdG9yLnVwZGF0ZUFjdGl2ZU5hdk1haW4oZSkpO1xuXG4vLyB0b2dnbGVzIGRpc3BsYXkgb24gZm9yIG92ZXJsYXkgYW5kIGZvcm0gd2hlbiB0aGUgb3BlbiBmb3JtIGJ1dHRvbiBpcyBjbGlja2VkXG5vcGVuRm9ybS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBvdmVybGF5TmV3LmNsYXNzTGlzdC50b2dnbGUoJ292ZXJsYXktbmV3LWludmlzaWJsZScpO1xuICAgIGFkZFRvRG9Gb3JtLmNsYXNzTGlzdC50b2dnbGUoJ2NyZWF0ZS1uZXctb3BlbicpO1xuICAgIGRvbU1hbmlwdWxhdG9yLmNoYW5nZUFjdGl2ZUZvcm1MaW5rKClcbn0pO1xuXG4vLyBjb250cm9sIHdoaWNoIGZvcm0gbWVudSBpcyBvcGVuIFxubmV3VG9Eb0xpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PntcbiAgICBuZXdQcm9qZWN0TWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgbmV3Tm90ZU1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld1RvRG9NZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbn0pO1xubmV3UHJvamVjdExpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PntcbiAgICBuZXdUb0RvTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgbmV3Tm90ZU1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld1Byb2plY3RNZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbn0pO1xubmV3Tm90ZUxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PntcbiAgICBuZXdUb0RvTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgbmV3UHJvamVjdE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld05vdGVNZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbn0pO1xuXG4vLyBjbG9zZXMgdGhlIGZvcm0gYW5kIHRvZ2dsZXMgdGhlIGRpc3BsYXkgYmFjayBcbmNsb3NlRm9ybS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBvdmVybGF5TmV3LmNsYXNzTGlzdC50b2dnbGUoJ292ZXJsYXktbmV3LWludmlzaWJsZScpO1xuICAgIGFkZFRvRG9Gb3JtLmNsYXNzTGlzdC50b2dnbGUoJ2NyZWF0ZS1uZXctb3BlbicpO1xuICAgIGFkZFRvRG9Gb3JtLnJlc2V0KCk7XG4gICAgZG9tTWFuaXB1bGF0b3IucmVzZXRBY3RpdmVGb3JtTGluaygpO1xuICAgIGRvbU1hbmlwdWxhdG9yLnJlbW92ZUFjdGl2ZVByaW9yaXR5KCk7XG4gICAgbmV3VG9Eb01lbnUuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiOyBcbiAgICBuZXdQcm9qZWN0TWVudS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgbmV3Tm90ZU1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufSk7XG5cbi8vIHdoZW4gdGhlIHN1Ym1pdCBuZXcgdG9kbyBidXR0b24gaXMgcHJlc3NlZCwgZ3JhYiBkYXRhIGZyb20gdGhlIGZvcm0gYW5kIGNyZWF0ZSBhIG5ldyB0b2RvXG5hZGRUb0RvRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBlID0+IHtcbiAgICB0b0Rvc01hbmFnZXIuYWRkTmV3VG9EbyhlLCB0b2RvcywgZGlzcGxheSwgb3ZlcmxheU5ldywgYWRkVG9Eb0Zvcm0pO1xufSk7XG5cbi8vIHdoZW4gYSBsb3cgLyBtZWRpdW0gLyBoaWdoIHByaW9yaXR5IGJ1dHRvbiBpcyBjbGlja2VkXG5jb25zdCBwcmlvcml0eUJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuJyk7XG4gICAgcHJpb3JpdHlCdG5zLmZvckVhY2goYnRuID0+IHtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+e1xuICAgICAgICBkb21NYW5pcHVsYXRvci5hY3RpdmVQcmlvcml0eShlKTtcbiAgICB9KTtcbn0pXG5cblxuLy8gYWRkIG5ldyBwb2plY3RcbmNyZWF0ZVByb2plY3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICB0b0Rvc01hbmFnZXIuYWRkTmV3UHJvamVjdChlLCB0b2Rvcywgb3ZlcmxheU5ldywgYWRkVG9Eb0Zvcm0sIGRpc3BsYXkpO1xuICAgIGRvbU1hbmlwdWxhdG9yLnJlc2V0QWN0aXZlRm9ybUxpbmsoKTtcbn0pXG5cbi8vIGFkZCBuZXcgbm90ZVxuY3JlYXRlTm90ZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgIG5vdGVzTWFuYWdlci5hZGROZXdOb3RlKGUsIG5vdGVzLCBvdmVybGF5TmV3LCBhZGRUb0RvRm9ybSwgZGlzcGxheSk7XG4gICAgZG9tTWFuaXB1bGF0b3IucmVzZXRBY3RpdmVGb3JtTGluaygpO1xufSk7XG5cbi8vIGJ1dHRvbiB0aGF0IGNvbmZpcm1zIGVkaXQgb24gYSB0b2RvXG5lZGl0Rm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBlID0+IHtcbiAgICB0b0Rvc01hbmFnZXIuZWRpdFRvRG8oZSwgdG9kb3MsIGRpc3BsYXksIGVkaXRPdmVybGF5LCBlZGl0Rm9ybSk7XG59KVxuXG4vLyBjbG9zZSBkZXRhaWxzIHBvcHVwXG5jb25zdCBjbG9zZURldGFpbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlscy1wb3B1cF9fY2xvc2UnKTtcbmNsb3NlRGV0YWlscy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBkZXRhaWxzUG9wdXAuY2xhc3NMaXN0LnRvZ2dsZShcImRldGFpbHMtcG9wdXAtb3BlblwiKTtcbiAgICBkZXRhaWxzT3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKFwib3ZlcmxheS1kZXRhaWxzLWludmlzaWJsZVwiKTtcbn0pXG5cbi8vIGNsb3NlIGVkaXQgcG9wdXBcbmNvbnN0IGNsb3NlRWRpdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwX19jbG9zZScpO1xuY2xvc2VFZGl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIGVkaXRQb3B1cC5jbGFzc0xpc3QudG9nZ2xlKFwiZWRpdC1wb3B1cC1vcGVuXCIpO1xuICAgIGVkaXRPdmVybGF5LmNsYXNzTGlzdC50b2dnbGUoXCJvdmVybGF5LWVkaXQtaW52aXNpYmxlXCIpO1xufSlcblxuLy8gbmF2aWdhdGUgdG8gbm90ZXMgbWVudVxuLy8gcmVuZGVycyB0aGUgbm90ZXMgYW5kIGFwcGx5cyBzZWxlY3RlZCBzdHlsaW5nIHRvIHRoZSBub3RlcyBuYXYgbGlua1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25vdGVzLW5hdicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gbm90ZXNNYW5hZ2VyLmFycmFuZ2VOb3Rlcyhub3RlcykpO1xuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25vdGVzLW5hdicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IGRvbU1hbmlwdWxhdG9yLnVwZGF0ZUFjdGl2ZU5hdk1haW4oZSkpO1xuXG4vLyBzZWxlY3RpbmcgdGhlIG91dGVyIGxpIGVsZW1lbnQgc28gaSBjYW4gY2hhbmdlIGZvbGRlcnMgYnkgY2xpY2tpbmcgdGhpcyBlbGVtZW50IGFzIHdlbGwgYXMgdGhlIGlubmVyIGxpIHRleHQuXG5sZXQgdG9kb0xpbmtzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5hdl9faXRlbS0tbGluaycpO1xudG9kb0xpbmtzID0gQXJyYXkuZnJvbSh0b2RvTGlua3MpO1xuLy8gcG9wIG9mZiB0aGUgbm90ZXMgbGluayBzaW5jZSBpdCBhbHJlYWR5IHdvcmtzIHdpdGhvdXQgdGhpcyBoYWNrXG50b2RvTGlua3MucG9wKCk7XG4vLyBuYXZpYWd0aW9uIDIsIGZvciB3aGVuIHRoZSBzdXJyb3VuZGluZyBsaSBpdGVtIGlzIGNsaWNrZWQuXG4vLyBpIHRyaWVkIGZvciBhIGxvbmcgdGltZSB0byBtYWtlIHRoaXMgd29yayBpbiBhIGNsZWFuZXIgd2F5IGJ1dCBjb3VsZG50IG1ha2UgaXQgd29yay5cbi8vXG50b2RvTGlua3MuZm9yRWFjaChmb2xkZXIgPT4ge1xuICAgIGZvbGRlci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkb21NYW5pcHVsYXRvci5jaGFuZ2VGb2xkZXIyKGUsIHRvZG9zLCBkaXNwbGF5KSk7XG59KVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9