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
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n    --color-black: #264653;\n    --color-green: #2a9d8f;\n    --color-yellow: #e9c46a;\n    --color-orange: #f4a261;\n    --color-red: #e76f51;\n    --background-color-light: #f7f7f7;\n    --background-color-dark: #eee;\n}\n\n*,\n*::before,\n*::after {\n    margin: 0;\n    padding: 0;\n}\n\nhtml {\n    box-sizing: border-box;\n    overflow-x: hidden;\n    font-size: 62.5%;\n    font-size: 12px;\n}\n\n@media (max-width: 1200px) {\n    html {\n        font-size: 62.5%;\n    }\n}\n\n@media (max-width: 1000px) {\n    html {\n        font-size: 56.75%;\n    }\n}\n\n@media (max-width: 800px) {\n    html {\n        font-size: 50%;\n    }\n}\n\n@media (max-width: 700px) {\n    html {\n        font-size: 43.75%;\n    }\n}\n\nbody {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background-size: cover;\n    font-family: 'Montserrat', sans-serif;\n    font-size: 1.6rem;\n    color: var(--color-black);\n    word-wrap: break-word;\n}\n\nli {\n    list-style: none;\n}\n\n/* Content */\n\n.content {\n    width: 110rem;\n    height: 60rem;\n    display: grid;\n    grid-template-rows: 6rem 54rem 3rem;\n    grid-template-columns: 20rem 1fr;\n    border-radius: 3px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    overflow: hidden;\n}\n\n@media (max-width: 1500px) {\n    .content {\n        width: 100vw;\n        height: 100vh;\n        grid-template-rows: 6rem 1fr 3rem;\n    }\n}\n  \n@media (max-width: 1000px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 900px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 700px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 550px) {\n    .content {\n        grid-template-columns: 1fr 20rem;\n    }\n}\n\n/* Header */\n\n.header {\n    grid-row: 1 / 2;\n    grid-column: 1 / 3;\n    display: flex;\n    justify-content: flex-start;\n    gap:1rem;\n    align-items: center;\n    padding-left: 2rem;\n    border-bottom: 1px solid #b9b9b9;\n    background-color: var(--color-orange);\n    color: var(--color-black);\n}\n\n.logo {\n    height: 55px;\n    width: 55px;\n}\n\n/* Side Bar */\n\n.side-bar {\n    grid-row: 2 / 3;\n    grid-column: 1 / 2;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-right: 1px solid #b9b9b9;\n    background-color: var(--background-color-dark);\n    z-index: 1;\n}\n  \n@media (max-width: 1000px) {\n    .side-bar {\n        padding: 2rem;\n    }\n}\n  \n@media (max-width: 550px) {\n    .side-bar {\n        grid-column: 2 / 3;\n        border-left: 1px solid #b9b9b9;\n        border-right: none;\n        position: relative;\n        left: 140px;\n        transition: all .2s;\n    }\n}\n\n.nav {\n    font-size: 1.5rem;\n    font-weight: 300;\n}\n  \n.nav__item {\n    width: auto;\n    margin-bottom: 1rem;\n    padding: .5rem 1.5rem;\n}\n\n.nav__item:last-child {\n    cursor: pointer;\n}\n\n.nav__item:hover {\n    color: var(--color-green);\n}\n  \n.nav__item--projects {\n    margin-bottom: 1rem;\n}\n  \n.nav__item--projects-title {\n    padding: .5rem 1.5rem;\n    display: block;\n}\n  \n.nav__selected {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.nav__selected::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n\n.projects {\n    margin-left: 2rem;\n    margin-right: -4rem;\n    margin-top: 1rem;\n    max-height: 15rem;\n    overflow: hidden;\n    overflow-y: overlay;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n    font-size: 1.7rem;\n}\n  \n.projects__item {\n    padding: .4rem .8rem;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n}\n  \n.projects__item:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n\n.projects__item:not(:last-child) {\n    margin-bottom: 1rem;\n}\n    \n.new-todo {\n    height: 5rem;\n    width: 5rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding-bottom: 4px;\n    border-radius: 50%;\n    background-color: var(--color-yellow);\n    font-size: 5rem;\n    line-height: 5rem;\n    color: var(--color-black);\n    box-shadow: 0.2rem 0.5rem 1rem rgba(0, 0, 0, 0.4);\n    cursor: pointer;\n}\n  \n.new-todo:active {\n    transform: translateY(2px);\n    box-shadow: 0.1rem 0.3rem 0.5rem rgba(0, 0, 0, 0.4);\n}\n  \n@media (max-width: 550px) {\n    .new-todo {\n        margin-left: auto;\n    }\n}\n  \n.home-count,\n.today-count,\n.week-count,\n.project-count {\n    width: 2rem;\n    height: 2rem;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background-color: var(--color-yellow);\n    border-radius: 50%;\n    font-size: 1.3rem;\n    font-weight: 700;\n    color: var(--color-black);\n    pointer-events: none;\n  }\n  \n.project-count {\n    margin-right: 4.6rem;\n}\n  \n.project-name {\n    cursor: pointer;\n    max-width: 60%;\n    margin-right: auto;\n}\n  \n.project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n  \n.custom-project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n#notes-nav {\n    margin-top: -8px;\n}\n  \n#week-nav {\n    margin-left: 1px;\n}\n\n/* Main Container */\n\n.main__container {\n    padding: 4rem;\n    padding-top: 0;\n    padding-bottom: 0;\n    grid-row: 2 / 3;\n    grid-column: 2 / 3;\n    overflow-y: auto;\n    background-color: var(--background-color-light);\n    border-bottom: 4rem solid var(--background-color-light);\n    border-top: 4rem solid var(--background-color-light);\n}\n  \n@media (max-width: 1000px) {\n    .main__container {\n        padding: 3rem;\n        padding-top: 0;\n        padding-bottom: 0;\n        border-bottom: 3rem solid var(--background-color-light);\n        border-top: 3rem solid var(--background-color-light);\n    }\n}\n  \n@media (max-width: 550px) {\n    .main__container {\n        grid-column: 1 / 3;\n    }\n}\n\n.main {\n    background-color: var(--background-color-light);\n}\n\n/* Overlay New */\n\n.overlay-new {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n  \n.overlay-new-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.create-new {\n    position: relative;\n    visibility: hidden;\n    height: 40rem;\n    width: 80rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n}\n  \n.create-new-open {\n    transform: scale(1);\n    visibility: visible;\n}\n  \n.create-new__close {\n    position: absolute;\n    top: 2rem;\n    right: 1.1rem;\n    color: var(--background-color-light);\n    line-height: 1rem;\n    font-size: 5rem;\n    cursor: pointer;\n}\n  \n.create-new__header {\n    display: flex;\n    align-items: center;\n    height: 5rem;\n    border-bottom: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n  \n.create-new__heading {\n    color: var(--background-color-light);\n    margin-left: 1.5rem;\n}\n  \n.create-new__sidebar {\n    width: 12rem;\n    padding: 1rem;\n    background-color: var(--background-color-dark);\n}\n  \n@media (max-width: 450px) {\n    .create-new__sidebar {\n        padding: .5rem;\n        width: 10rem;\n    }\n}\n  \n.create-new__content {\n    display: flex;\n    height: calc(100% - 4rem);\n}\n  \n.create-new__options {\n    display: flex;\n    flex-direction: column;\n    align-self: flex-start;\n    padding-left: .5rem;\n    font-size: 1.8rem;\n    font-weight: 300;\n}\n  \n.create-new__options-items {\n    padding: .5rem 1rem;\n    margin-top: .5rem;\n    border-left: 3px solid transparent;\n    cursor: pointer;\n}\n  \n.create-new__options-items:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items:hover::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__options-items-active {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items-active::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n}\n\n#new-todo-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n\n.create-new__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: var(--color-black);\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;    \n    resize: none;\n}\n  \n.create-new__input:focus {\n    outline: none;\n}\n  \n.create-new__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n}\n  \n.create-new__date-title {\n    margin-right: 1rem;\n}\n  \n.create-new__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid var(--color-black);\n    border-radius: 5px;\n    color: var(--color-black);\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: 'Montserrat', sans-serif;\n}\n  \n.create-new__date-input:focus {\n    outline: none;\n}\n  \n.create-new__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n}\n  \n@media (max-width: 400px) {\n    .create-new__wrapper-priority-submit {\n        flex-direction: column;\n    }\n}\n  \n.create-new__priority {\n    display: flex;\n    align-items: center;\n}\n  \n.create-new__priority-title {\n    margin-right: 2.6rem;\n}\n  \n.create-new__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n}\n  \n.create-new__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__priority-btn:hover {\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.create-new__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.create-new__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--medium {\n    border: 1px solid var(--color-yellow);\n    color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium:hover {\n    background-color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium-active {\n    background-color: var(--color-yellow);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--high {\n    border: 1px solid var(--color-red);\n    color: var(--color-red);\n}\n  \n.create-new__priority-btn--high:hover {\n    background-color: var(--color-red);\n}\n  \n.create-new__priority-btn--high-active {\n    background-color: var(--color-red);\n    color: var(--background-color-light);\n}\n  \n.create-new__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: var(--color-green);\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__todo-submit:active {\n    outline: none;\n}\n  \n@media (max-width: 400px) {\n    .create-new__todo-submit {\n        margin-top: 8px;\n    }\n}\n  \n.create-new__project {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__project-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n  \n.create-new__project-input:focus {\n    outline: none;\n}\n  \n.create-new__project-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__project-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__project-submit:active {\n    outline: none;\n}\n  \n.create-new__note {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__note-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n\n#new-note-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n  \n.create-new__note-input:focus {\n    outline: none;\n}\n  \n.create-new__note-input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__note-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__note-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__note-submit:active {\n    outline: none;\n}\n\n/* Todo Main */\n\n.todo {\n    display: flex;\n    align-items: center;\n    height: 4rem;\n    padding: 1rem;\n    margin-bottom: 1rem;\n    background-color: #eee;\n}\n.todo-checked {\n    opacity:0.4;\n}\n  \n.todo__title {\n    margin-right: 2rem;\n    margin-right: auto;\n    font-weight: 300;\n}\n  \n.todo__title-checked {\n    color: #8d8d8d;\n    text-decoration: line-through;\n}\n  \n.todo__detail {\n    position: relative;\n    margin-right: 2.5rem;\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 3px;\n    font-size: 1rem;\n    color: #3ba395;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.todo__detail:hover {\n    position: relative;\n    background-color: #3ba395;\n    color: white;\n}\n  \n.todo__detail-checked {\n    border: 1px solid rgba(59, 163, 149, 0.5);\n    color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__detail-checked:hover {\n    border: 1px solid rgba(59, 163, 149, 0);\n    background-color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__date {\n    margin-right: 2rem;\n    width: 4.5rem;\n    font-size: 1rem;\n    color: #501f3a;\n}\n  \n.todo__date-checked {\n    color: rgba(80, 31, 58, 0.5);\n}\n  \n.todo__complete {\n    margin-right: 1.5rem;\n    height: 1.5rem;\n    width: 1.5rem;\n    border-radius: 3px;\n    border: 2px solid #3ba395;\n}\n  \n.todo__complete-checked {\n    height: 1.5rem;\n    width: 1.5rem;\n    display: block;\n    background: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + "), #3ba395;\n    background-repeat: no-repeat;\n    background-size: contain;\n}\n  \n.todo__icon {\n    width: 1.5rem;\n    height: 1.5rem;\n    fill: #501f3a;\n    cursor: pointer;\n    transition: all .2s;\n}\n  \n.todo__icon-edit {\n    margin-right: 2rem;\n}\n  \n.todo__icon:hover {\n    fill: #3ba395;\n}\n  \n.todo__icon-checked {\n    fill: rgba(80, 31, 58, 0.4);\n    opacity: 0.5;\n}\n  \n.todo__icon-checked:hover {\n    fill: rgba(59, 163, 149, 0.5);\n}\n  \n.todo:hover {\n    transform: scale(1.003);\n    transform-origin: 50% 50%;\n    box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.priority-low {\n    border-left: 3px solid green;\n}\n  \n.priority-medium {\n    border-left: 3px solid orange;\n}\n  \n.priority-high {\n    border-left: 3px solid red;\n}\n  \n.add-or-remove {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    color: #141414;\n    font-size: 2rem;\n}\n  \n.add-or-remove__heading {\n    margin-bottom: 2.5rem;\n    font-size: 2.8rem;\n}\n  \n.add-or-remove__content {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n  \n.add-or-remove__content-text {\n    margin-bottom: 2rem;\n}\n  \n.add-or-remove__content-btn {\n    position: relative;\n    display: inline-block;\n    padding: .5rem 1rem;\n    border: 1px solid #501f3a;\n    border-radius: 3px;\n    font-size: 1.3rem;\n    color: #501f3a;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.add-or-remove__content-btn:hover {\n    position: relative;\n    background-color: #501f3a;\n    color: white;\n}\n\n/* Overlay Detail */\n\n.overlay-details {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n} \n   \n.overlay-details-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.details-popup {\n    position: relative;\n    width: 60rem;\n    padding: 3rem;\n    border-radius: 4px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    color: #501f3a;\n    background-color: rgba(255, 255, 255);\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .details-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .details-popup > *:not(:last-child) {\n    margin-bottom: .8rem;\n  }\n  \n  .details-popup__catagory {\n    color: #501f3a;\n    font-weight: 700;\n  }\n  \n  .details-popup__title {\n    font-size: 3.4rem;\n    font-weight: normal;\n    margin-bottom: 1.3rem !important;\n    color: #501f3a;\n    line-height: 1;\n  }\n  \n  .details-popup__details {\n    display: flex;\n  }\n  \n  .details-popup__details-title {\n    margin-right: 2.7rem;\n    font-weight: 700;\n  }\n  \n  .details-popup__details-text {\n    font-weight: normal !important;\n  }\n  \n  .details-popup__project .details-popup__catagory {\n    margin-right: 2.4rem;\n  }\n  \n  .details-popup__due .details-popup__catagory {\n    margin-right: .9rem;\n  }\n  \n  .details-popup__priority .details-popup__catagory {\n    margin-right: 2.1rem;\n  }\n  \n  .details-popup__close {\n    position: absolute;\n    top: .4rem;\n    right: 1rem;\n    font-size: 3rem;\n    line-height: 1;\n    cursor: pointer;\n  }\n\n\n/* Overlay Edit */\n\n.overlay-edit {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n    \n.overlay-edit-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.edit-popup {\n    position: relative;\n    visibility: hidden;\n    height: 26rem;\n    width: 55rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .edit-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .edit-popup__close {\n    position: absolute;\n    top: 1.4rem;\n    right: 1.1rem;\n    color: #3ba395;\n    line-height: 1rem;\n    font-size: 3rem;\n    cursor: pointer;\n  }\n  \n  .edit-popup__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n  }\n  \n  .edit-popup__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    resize: none;\n  }\n  \n  .edit-popup__input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n  }\n  \n  .edit-popup__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n  }\n  \n  .edit-popup__date-title {\n    margin-right: 1rem;\n  }\n  \n  .edit-popup__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 5px;\n    color: #3ba395;\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: lato, sans-serif;\n  }\n  \n  .edit-popup__date-input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n  }\n  \n  .edit-popup__priority {\n    display: flex;\n    align-items: center;\n  }\n  \n  .edit-popup__priority-title {\n    margin-right: 2.6rem;\n  }\n  \n  .edit-popup__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n  }\n  \n  .edit-popup__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n  }\n  \n  .edit-popup__priority-btn:hover {\n    color: white;\n  }\n  \n.edit-popup__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: white;\n}\n  \n.edit-popup__priority-btn--medium {\n    border: 1px solid orange;\n    color: orange;\n}\n  \n.edit-popup__priority-btn--medium:hover {\n    background-color: orange;\n}\n  \n.edit-popup__priority-btn--medium-active {\n    background-color: orange;\n    color: white;\n}\n  \n.edit-popup__priority-btn--high {\n    border: 1px solid red;\n    color: red;\n}\n  \n.edit-popup__priority-btn--high:hover {\n    background-color: red;\n}\n  \n.edit-popup__priority-btn--high-active {\n    background-color: red;\n    color: white;\n}\n  \n.edit-popup__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.edit-popup__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.edit-popup__todo-submit:active {\n    outline: none;\n}\n  \n/* Footer */\n\n.footer {\n    grid-row: -1 / -2;\n    grid-column: 1 / -1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 1rem;\n    width: 100%;\n    padding: 1rem;\n    border-top: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n\n.fa-github {\n    font-size: 2rem;\n    color: var(--color-black);\n}\n\n.fa-github:hover {\n    opacity: 0.5;\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"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","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');\n\n:root {\n    --color-black: #264653;\n    --color-green: #2a9d8f;\n    --color-yellow: #e9c46a;\n    --color-orange: #f4a261;\n    --color-red: #e76f51;\n    --background-color-light: #f7f7f7;\n    --background-color-dark: #eee;\n}\n\n*,\n*::before,\n*::after {\n    margin: 0;\n    padding: 0;\n}\n\nhtml {\n    box-sizing: border-box;\n    overflow-x: hidden;\n    font-size: 62.5%;\n    font-size: 12px;\n}\n\n@media (max-width: 1200px) {\n    html {\n        font-size: 62.5%;\n    }\n}\n\n@media (max-width: 1000px) {\n    html {\n        font-size: 56.75%;\n    }\n}\n\n@media (max-width: 800px) {\n    html {\n        font-size: 50%;\n    }\n}\n\n@media (max-width: 700px) {\n    html {\n        font-size: 43.75%;\n    }\n}\n\nbody {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background-size: cover;\n    font-family: 'Montserrat', sans-serif;\n    font-size: 1.6rem;\n    color: var(--color-black);\n    word-wrap: break-word;\n}\n\nli {\n    list-style: none;\n}\n\n/* Content */\n\n.content {\n    width: 110rem;\n    height: 60rem;\n    display: grid;\n    grid-template-rows: 6rem 54rem 3rem;\n    grid-template-columns: 20rem 1fr;\n    border-radius: 3px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    overflow: hidden;\n}\n\n@media (max-width: 1500px) {\n    .content {\n        width: 100vw;\n        height: 100vh;\n        grid-template-rows: 6rem 1fr 3rem;\n    }\n}\n  \n@media (max-width: 1000px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 900px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 700px) {\n    .content {\n        grid-template-columns: 20rem 1fr;\n    }\n}\n  \n@media (max-width: 550px) {\n    .content {\n        grid-template-columns: 1fr 20rem;\n    }\n}\n\n/* Header */\n\n.header {\n    grid-row: 1 / 2;\n    grid-column: 1 / 3;\n    display: flex;\n    justify-content: flex-start;\n    gap:1rem;\n    align-items: center;\n    padding-left: 2rem;\n    border-bottom: 1px solid #b9b9b9;\n    background-color: var(--color-orange);\n    color: var(--color-black);\n}\n\n.logo {\n    height: 55px;\n    width: 55px;\n}\n\n/* Side Bar */\n\n.side-bar {\n    grid-row: 2 / 3;\n    grid-column: 1 / 2;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-right: 1px solid #b9b9b9;\n    background-color: var(--background-color-dark);\n    z-index: 1;\n}\n  \n@media (max-width: 1000px) {\n    .side-bar {\n        padding: 2rem;\n    }\n}\n  \n@media (max-width: 550px) {\n    .side-bar {\n        grid-column: 2 / 3;\n        border-left: 1px solid #b9b9b9;\n        border-right: none;\n        position: relative;\n        left: 140px;\n        transition: all .2s;\n    }\n}\n\n.nav {\n    font-size: 1.5rem;\n    font-weight: 300;\n}\n  \n.nav__item {\n    width: auto;\n    margin-bottom: 1rem;\n    padding: .5rem 1.5rem;\n}\n\n.nav__item:last-child {\n    cursor: pointer;\n}\n\n.nav__item:hover {\n    color: var(--color-green);\n}\n  \n.nav__item--projects {\n    margin-bottom: 1rem;\n}\n  \n.nav__item--projects-title {\n    padding: .5rem 1.5rem;\n    display: block;\n}\n  \n.nav__selected {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.nav__selected::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n\n.projects {\n    margin-left: 2rem;\n    margin-right: -4rem;\n    margin-top: 1rem;\n    max-height: 15rem;\n    overflow: hidden;\n    overflow-y: overlay;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n    font-size: 1.7rem;\n}\n  \n.projects__item {\n    padding: .4rem .8rem;\n    overflow-wrap: break-word;\n    word-wrap: break-word;\n}\n  \n.projects__item:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n\n.projects__item:not(:last-child) {\n    margin-bottom: 1rem;\n}\n    \n.new-todo {\n    height: 5rem;\n    width: 5rem;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding-bottom: 4px;\n    border-radius: 50%;\n    background-color: var(--color-yellow);\n    font-size: 5rem;\n    line-height: 5rem;\n    color: var(--color-black);\n    box-shadow: 0.2rem 0.5rem 1rem rgba(0, 0, 0, 0.4);\n    cursor: pointer;\n}\n  \n.new-todo:active {\n    transform: translateY(2px);\n    box-shadow: 0.1rem 0.3rem 0.5rem rgba(0, 0, 0, 0.4);\n}\n  \n@media (max-width: 550px) {\n    .new-todo {\n        margin-left: auto;\n    }\n}\n  \n.home-count,\n.today-count,\n.week-count,\n.project-count {\n    width: 2rem;\n    height: 2rem;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    background-color: var(--color-yellow);\n    border-radius: 50%;\n    font-size: 1.3rem;\n    font-weight: 700;\n    color: var(--color-black);\n    pointer-events: none;\n  }\n  \n.project-count {\n    margin-right: 4.6rem;\n}\n  \n.project-name {\n    cursor: pointer;\n    max-width: 60%;\n    margin-right: auto;\n}\n  \n.project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n  \n.custom-project-count-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n#notes-nav {\n    margin-top: -8px;\n}\n  \n#week-nav {\n    margin-left: 1px;\n}\n\n/* Main Container */\n\n.main__container {\n    padding: 4rem;\n    padding-top: 0;\n    padding-bottom: 0;\n    grid-row: 2 / 3;\n    grid-column: 2 / 3;\n    overflow-y: auto;\n    background-color: var(--background-color-light);\n    border-bottom: 4rem solid var(--background-color-light);\n    border-top: 4rem solid var(--background-color-light);\n}\n  \n@media (max-width: 1000px) {\n    .main__container {\n        padding: 3rem;\n        padding-top: 0;\n        padding-bottom: 0;\n        border-bottom: 3rem solid var(--background-color-light);\n        border-top: 3rem solid var(--background-color-light);\n    }\n}\n  \n@media (max-width: 550px) {\n    .main__container {\n        grid-column: 1 / 3;\n    }\n}\n\n.main {\n    background-color: var(--background-color-light);\n}\n\n/* Overlay New */\n\n.overlay-new {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n  \n.overlay-new-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.create-new {\n    position: relative;\n    visibility: hidden;\n    height: 40rem;\n    width: 80rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n}\n  \n.create-new-open {\n    transform: scale(1);\n    visibility: visible;\n}\n  \n.create-new__close {\n    position: absolute;\n    top: 2rem;\n    right: 1.1rem;\n    color: var(--background-color-light);\n    line-height: 1rem;\n    font-size: 5rem;\n    cursor: pointer;\n}\n  \n.create-new__header {\n    display: flex;\n    align-items: center;\n    height: 5rem;\n    border-bottom: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n  \n.create-new__heading {\n    color: var(--background-color-light);\n    margin-left: 1.5rem;\n}\n  \n.create-new__sidebar {\n    width: 12rem;\n    padding: 1rem;\n    background-color: var(--background-color-dark);\n}\n  \n@media (max-width: 450px) {\n    .create-new__sidebar {\n        padding: .5rem;\n        width: 10rem;\n    }\n}\n  \n.create-new__content {\n    display: flex;\n    height: calc(100% - 4rem);\n}\n  \n.create-new__options {\n    display: flex;\n    flex-direction: column;\n    align-self: flex-start;\n    padding-left: .5rem;\n    font-size: 1.8rem;\n    font-weight: 300;\n}\n  \n.create-new__options-items {\n    padding: .5rem 1rem;\n    margin-top: .5rem;\n    border-left: 3px solid transparent;\n    cursor: pointer;\n}\n  \n.create-new__options-items:hover {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items:hover::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__options-items-active {\n    color: var(--color-green);\n    font-weight: normal;\n}\n  \n.create-new__options-items-active::before {\n    content: \">\";\n    margin-right: .7rem;\n    font-weight: 700;\n}\n  \n.create-new__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n}\n\n#new-todo-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n\n.create-new__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: var(--color-black);\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;    \n    resize: none;\n}\n  \n.create-new__input:focus {\n    outline: none;\n}\n  \n.create-new__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n}\n  \n.create-new__date-title {\n    margin-right: 1rem;\n}\n  \n.create-new__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid var(--color-black);\n    border-radius: 5px;\n    color: var(--color-black);\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: 'Montserrat', sans-serif;\n}\n  \n.create-new__date-input:focus {\n    outline: none;\n}\n  \n.create-new__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n}\n  \n@media (max-width: 400px) {\n    .create-new__wrapper-priority-submit {\n        flex-direction: column;\n    }\n}\n  \n.create-new__priority {\n    display: flex;\n    align-items: center;\n}\n  \n.create-new__priority-title {\n    margin-right: 2.6rem;\n}\n  \n.create-new__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n}\n  \n.create-new__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__priority-btn:hover {\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.create-new__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.create-new__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--medium {\n    border: 1px solid var(--color-yellow);\n    color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium:hover {\n    background-color: var(--color-yellow);\n}\n  \n.create-new__priority-btn--medium-active {\n    background-color: var(--color-yellow);\n    color: var(--background-color-light);\n}\n  \n.create-new__priority-btn--high {\n    border: 1px solid var(--color-red);\n    color: var(--color-red);\n}\n  \n.create-new__priority-btn--high:hover {\n    background-color: var(--color-red);\n}\n  \n.create-new__priority-btn--high-active {\n    background-color: var(--color-red);\n    color: var(--background-color-light);\n}\n  \n.create-new__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: var(--color-green);\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__todo-submit:active {\n    outline: none;\n}\n  \n@media (max-width: 400px) {\n    .create-new__todo-submit {\n        margin-top: 8px;\n    }\n}\n  \n.create-new__project {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__project-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n  \n.create-new__project-input:focus {\n    outline: none;\n}\n  \n.create-new__project-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__project-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__project-submit:active {\n    outline: none;\n}\n  \n.create-new__note {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    border-left: 1px solid #b9b9b9;\n    display: none;\n}\n  \n.create-new__note-input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: 'Montserrat', sans-serif;\n    resize: none;\n}\n\n#new-note-title {\n    border-bottom: 1px solid #b9b9b9;\n    margin-bottom: 2rem;\n}\n  \n.create-new__note-input:focus {\n    outline: none;\n}\n  \n.create-new__note-input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n}\n  \n.create-new__note-submit {\n    text-align: center;\n    align-self: flex-end;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1.1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.create-new__note-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.create-new__note-submit:active {\n    outline: none;\n}\n\n/* Todo Main */\n\n.todo {\n    display: flex;\n    align-items: center;\n    height: 4rem;\n    padding: 1rem;\n    margin-bottom: 1rem;\n    background-color: #eee;\n}\n.todo-checked {\n    opacity:0.4;\n}\n  \n.todo__title {\n    margin-right: 2rem;\n    margin-right: auto;\n    font-weight: 300;\n}\n  \n.todo__title-checked {\n    color: #8d8d8d;\n    text-decoration: line-through;\n}\n  \n.todo__detail {\n    position: relative;\n    margin-right: 2.5rem;\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 3px;\n    font-size: 1rem;\n    color: #3ba395;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.todo__detail:hover {\n    position: relative;\n    background-color: #3ba395;\n    color: white;\n}\n  \n.todo__detail-checked {\n    border: 1px solid rgba(59, 163, 149, 0.5);\n    color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__detail-checked:hover {\n    border: 1px solid rgba(59, 163, 149, 0);\n    background-color: rgba(59, 163, 149, 0.5);\n}\n  \n.todo__date {\n    margin-right: 2rem;\n    width: 4.5rem;\n    font-size: 1rem;\n    color: #501f3a;\n}\n  \n.todo__date-checked {\n    color: rgba(80, 31, 58, 0.5);\n}\n  \n.todo__complete {\n    margin-right: 1.5rem;\n    height: 1.5rem;\n    width: 1.5rem;\n    border-radius: 3px;\n    border: 2px solid #3ba395;\n}\n  \n.todo__complete-checked {\n    height: 1.5rem;\n    width: 1.5rem;\n    display: block;\n    background: url(\"images/check.png\"), #3ba395;\n    background-repeat: no-repeat;\n    background-size: contain;\n}\n  \n.todo__icon {\n    width: 1.5rem;\n    height: 1.5rem;\n    fill: #501f3a;\n    cursor: pointer;\n    transition: all .2s;\n}\n  \n.todo__icon-edit {\n    margin-right: 2rem;\n}\n  \n.todo__icon:hover {\n    fill: #3ba395;\n}\n  \n.todo__icon-checked {\n    fill: rgba(80, 31, 58, 0.4);\n    opacity: 0.5;\n}\n  \n.todo__icon-checked:hover {\n    fill: rgba(59, 163, 149, 0.5);\n}\n  \n.todo:hover {\n    transform: scale(1.003);\n    transform-origin: 50% 50%;\n    box-shadow: 3px 3px 5px 2px rgba(0, 0, 0, 0.2);\n    transition: all .2s ease-out;\n}\n  \n.priority-low {\n    border-left: 3px solid green;\n}\n  \n.priority-medium {\n    border-left: 3px solid orange;\n}\n  \n.priority-high {\n    border-left: 3px solid red;\n}\n  \n.add-or-remove {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    color: #141414;\n    font-size: 2rem;\n}\n  \n.add-or-remove__heading {\n    margin-bottom: 2.5rem;\n    font-size: 2.8rem;\n}\n  \n.add-or-remove__content {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n}\n  \n.add-or-remove__content-text {\n    margin-bottom: 2rem;\n}\n  \n.add-or-remove__content-btn {\n    position: relative;\n    display: inline-block;\n    padding: .5rem 1rem;\n    border: 1px solid #501f3a;\n    border-radius: 3px;\n    font-size: 1.3rem;\n    color: #501f3a;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.add-or-remove__content-btn:hover {\n    position: relative;\n    background-color: #501f3a;\n    color: white;\n}\n\n/* Overlay Detail */\n\n.overlay-details {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n} \n   \n.overlay-details-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.details-popup {\n    position: relative;\n    width: 60rem;\n    padding: 3rem;\n    border-radius: 4px;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    color: #501f3a;\n    background-color: rgba(255, 255, 255);\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .details-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .details-popup > *:not(:last-child) {\n    margin-bottom: .8rem;\n  }\n  \n  .details-popup__catagory {\n    color: #501f3a;\n    font-weight: 700;\n  }\n  \n  .details-popup__title {\n    font-size: 3.4rem;\n    font-weight: normal;\n    margin-bottom: 1.3rem !important;\n    color: #501f3a;\n    line-height: 1;\n  }\n  \n  .details-popup__details {\n    display: flex;\n  }\n  \n  .details-popup__details-title {\n    margin-right: 2.7rem;\n    font-weight: 700;\n  }\n  \n  .details-popup__details-text {\n    font-weight: normal !important;\n  }\n  \n  .details-popup__project .details-popup__catagory {\n    margin-right: 2.4rem;\n  }\n  \n  .details-popup__due .details-popup__catagory {\n    margin-right: .9rem;\n  }\n  \n  .details-popup__priority .details-popup__catagory {\n    margin-right: 2.1rem;\n  }\n  \n  .details-popup__close {\n    position: absolute;\n    top: .4rem;\n    right: 1rem;\n    font-size: 3rem;\n    line-height: 1;\n    cursor: pointer;\n  }\n\n\n/* Overlay Edit */\n\n.overlay-edit {\n    z-index: 2;\n    position: fixed;\n    top: 0;\n    left: 0;\n    padding: 10px;\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    visibility: visible;\n    opacity: 1;\n    background-color: rgba(0, 0, 0, 0.6);\n    transition: all .3s;\n}\n    \n.overlay-edit-invisible {\n    visibility: hidden;\n    opacity: 0;\n}\n\n.edit-popup {\n    position: relative;\n    visibility: hidden;\n    height: 26rem;\n    width: 55rem;\n    border-radius: 4px;\n    overflow: hidden;\n    box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.6);\n    background-color: #f7f7f7;\n    transform: scale(0.05);\n    transition: all .3s;\n  }\n  \n  .edit-popup-open {\n    transform: scale(1);\n    visibility: visible;\n  }\n  \n  .edit-popup__close {\n    position: absolute;\n    top: 1.4rem;\n    right: 1.1rem;\n    color: #3ba395;\n    line-height: 1rem;\n    font-size: 3rem;\n    cursor: pointer;\n  }\n  \n  .edit-popup__entry {\n    flex: 1;\n    padding: 2rem;\n    display: flex;\n    flex-direction: column;\n    border-left: 1px solid #b9b9b9;\n  }\n  \n  .edit-popup__input {\n    width: 100%;\n    border: none;\n    background-color: transparent;\n    color: #141414;\n    font-size: 1.6rem;\n    font-family: lato, sans-serif;\n    resize: none;\n  }\n  \n  .edit-popup__input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__input-big {\n    height: 12rem;\n    margin-bottom: auto;\n    font-size: 1.4rem;\n  }\n  \n  .edit-popup__date {\n    display: flex;\n    align-items: center;\n    margin-bottom: 1rem;\n  }\n  \n  .edit-popup__date-title {\n    margin-right: 1rem;\n  }\n  \n  .edit-popup__date-input {\n    padding: .5rem 1rem;\n    border: 1px solid #3ba395;\n    border-radius: 5px;\n    color: #3ba395;\n    background-color: transparent;\n    font-size: 1rem;\n    font-weight: 700;\n    text-transform: uppercase;\n    font-family: lato, sans-serif;\n  }\n  \n  .edit-popup__date-input:focus {\n    outline: none;\n  }\n  \n  .edit-popup__wrapper-priority-submit {\n    display: flex;\n    justify-content: space-between;\n  }\n  \n  .edit-popup__priority {\n    display: flex;\n    align-items: center;\n  }\n  \n  .edit-popup__priority-title {\n    margin-right: 2.6rem;\n  }\n  \n  .edit-popup__priority input[type=\"radio\"] {\n    position: relative;\n    left: 2.2rem;\n    height: 1px;\n    width: 1px;\n    padding: 0;\n    margin: 0;\n    opacity: 0;\n  }\n  \n  .edit-popup__priority-btn {\n    display: inline-block;\n    margin: 0 1.5rem 0 -5px;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    cursor: pointer;\n    transition: all .3s;\n  }\n  \n  .edit-popup__priority-btn:hover {\n    color: white;\n  }\n  \n.edit-popup__priority-btn--low {\n    border: 1px solid var(--color-green);\n    color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low:hover {\n    background-color: var(--color-green);\n}\n  \n.edit-popup__priority-btn--low-active {\n    background-color: var(--color-green);\n    color: white;\n}\n  \n.edit-popup__priority-btn--medium {\n    border: 1px solid orange;\n    color: orange;\n}\n  \n.edit-popup__priority-btn--medium:hover {\n    background-color: orange;\n}\n  \n.edit-popup__priority-btn--medium-active {\n    background-color: orange;\n    color: white;\n}\n  \n.edit-popup__priority-btn--high {\n    border: 1px solid red;\n    color: red;\n}\n  \n.edit-popup__priority-btn--high:hover {\n    background-color: red;\n}\n  \n.edit-popup__priority-btn--high-active {\n    background-color: red;\n    color: white;\n}\n  \n.edit-popup__todo-submit {\n    text-align: center;\n    align-self: center;\n    padding: .5rem 1rem;\n    border-radius: 3px;\n    border: 1px solid #3ba395;\n    font-size: 1rem;\n    text-transform: uppercase;\n    font-weight: 700;\n    color: #3ba395;\n    background-color: transparent;\n    cursor: pointer;\n    transition: all .3s;\n}\n  \n.edit-popup__todo-submit:hover {\n    color: white;\n    background-color: #3ba395;\n}\n  \n.edit-popup__todo-submit:active {\n    outline: none;\n}\n  \n/* Footer */\n\n.footer {\n    grid-row: -1 / -2;\n    grid-column: 1 / -1;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    gap: 1rem;\n    width: 100%;\n    padding: 1rem;\n    border-top: 1px solid var(--color-orange);\n    background-color: var(--color-orange);\n}\n\n.fa-github {\n    font-size: 2rem;\n    color: var(--color-black);\n}\n\n.fa-github:hover {\n    opacity: 0.5;\n}"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQXlDO0FBQ2hEO0FBQ0EsSUFBSSxvQ0FBUSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0dBQUU7QUFDckIsSUFBSSxLQUFLLEVBTU47O0FBRUgsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEMsVUFBVTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLFNBQVM7QUFDbkM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsbUJBQW1CLGdCQUFnQjtBQUNuQztBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN1dEO0FBQzBHO0FBQ2pCO0FBQ087QUFDaEcsNENBQTRDLCtHQUFtQztBQUMvRSw4QkFBOEIsbUZBQTJCLENBQUMsNEZBQXFDO0FBQy9GLHdIQUF3SDtBQUN4SCx5Q0FBeUMsc0ZBQStCO0FBQ3hFO0FBQ0EsaURBQWlELDZCQUE2Qiw2QkFBNkIsOEJBQThCLDhCQUE4QiwyQkFBMkIsd0NBQXdDLG9DQUFvQyxHQUFHLDhCQUE4QixnQkFBZ0IsaUJBQWlCLEdBQUcsVUFBVSw2QkFBNkIseUJBQXlCLHVCQUF1QixzQkFBc0IsR0FBRyxnQ0FBZ0MsWUFBWSwyQkFBMkIsT0FBTyxHQUFHLGdDQUFnQyxZQUFZLDRCQUE0QixPQUFPLEdBQUcsK0JBQStCLFlBQVkseUJBQXlCLE9BQU8sR0FBRywrQkFBK0IsWUFBWSw0QkFBNEIsT0FBTyxHQUFHLFVBQVUsd0JBQXdCLG9CQUFvQiwwQkFBMEIsOEJBQThCLDZCQUE2Qiw0Q0FBNEMsd0JBQXdCLGdDQUFnQyw0QkFBNEIsR0FBRyxRQUFRLHVCQUF1QixHQUFHLCtCQUErQixvQkFBb0Isb0JBQW9CLG9CQUFvQiwwQ0FBMEMsdUNBQXVDLHlCQUF5QixpREFBaUQsdUJBQXVCLEdBQUcsZ0NBQWdDLGdCQUFnQix1QkFBdUIsd0JBQXdCLDRDQUE0QyxPQUFPLEdBQUcsa0NBQWtDLGdCQUFnQiwyQ0FBMkMsT0FBTyxHQUFHLGlDQUFpQyxnQkFBZ0IsMkNBQTJDLE9BQU8sR0FBRyxpQ0FBaUMsZ0JBQWdCLDJDQUEyQyxPQUFPLEdBQUcsaUNBQWlDLGdCQUFnQiwyQ0FBMkMsT0FBTyxHQUFHLDZCQUE2QixzQkFBc0IseUJBQXlCLG9CQUFvQixrQ0FBa0MsZUFBZSwwQkFBMEIseUJBQXlCLHVDQUF1Qyw0Q0FBNEMsZ0NBQWdDLEdBQUcsV0FBVyxtQkFBbUIsa0JBQWtCLEdBQUcsaUNBQWlDLHNCQUFzQix5QkFBeUIsb0JBQW9CLG9CQUFvQiw2QkFBNkIscUNBQXFDLHNDQUFzQyxxREFBcUQsaUJBQWlCLEdBQUcsa0NBQWtDLGlCQUFpQix3QkFBd0IsT0FBTyxHQUFHLGlDQUFpQyxpQkFBaUIsNkJBQTZCLHlDQUF5Qyw2QkFBNkIsNkJBQTZCLHNCQUFzQiw4QkFBOEIsT0FBTyxHQUFHLFVBQVUsd0JBQXdCLHVCQUF1QixHQUFHLGtCQUFrQixrQkFBa0IsMEJBQTBCLDRCQUE0QixHQUFHLDJCQUEyQixzQkFBc0IsR0FBRyxzQkFBc0IsZ0NBQWdDLEdBQUcsNEJBQTRCLDBCQUEwQixHQUFHLGtDQUFrQyw0QkFBNEIscUJBQXFCLEdBQUcsc0JBQXNCLGdDQUFnQywwQkFBMEIsR0FBRyw4QkFBOEIscUJBQXFCLDBCQUEwQix1QkFBdUIsR0FBRyxlQUFlLHdCQUF3QiwwQkFBMEIsdUJBQXVCLHdCQUF3Qix1QkFBdUIsMEJBQTBCLGdDQUFnQyw0QkFBNEIsd0JBQXdCLEdBQUcsdUJBQXVCLDJCQUEyQixnQ0FBZ0MsNEJBQTRCLEdBQUcsNkJBQTZCLGdDQUFnQywwQkFBMEIsR0FBRyxzQ0FBc0MsMEJBQTBCLEdBQUcsbUJBQW1CLG1CQUFtQixrQkFBa0Isb0JBQW9CLDhCQUE4QiwwQkFBMEIsMEJBQTBCLHlCQUF5Qiw0Q0FBNEMsc0JBQXNCLHdCQUF3QixnQ0FBZ0Msd0RBQXdELHNCQUFzQixHQUFHLHdCQUF3QixpQ0FBaUMsMERBQTBELEdBQUcsaUNBQWlDLGlCQUFpQiw0QkFBNEIsT0FBTyxHQUFHLGlFQUFpRSxrQkFBa0IsbUJBQW1CLDJCQUEyQiwwQkFBMEIsOEJBQThCLDRDQUE0Qyx5QkFBeUIsd0JBQXdCLHVCQUF1QixnQ0FBZ0MsMkJBQTJCLEtBQUssc0JBQXNCLDJCQUEyQixHQUFHLHFCQUFxQixzQkFBc0IscUJBQXFCLHlCQUF5QixHQUFHLGdDQUFnQyxvQkFBb0IscUNBQXFDLDBCQUEwQixHQUFHLHVDQUF1QyxvQkFBb0IscUNBQXFDLDBCQUEwQixHQUFHLGdCQUFnQix1QkFBdUIsR0FBRyxpQkFBaUIsdUJBQXVCLEdBQUcsOENBQThDLG9CQUFvQixxQkFBcUIsd0JBQXdCLHNCQUFzQix5QkFBeUIsdUJBQXVCLHNEQUFzRCw4REFBOEQsMkRBQTJELEdBQUcsa0NBQWtDLHdCQUF3Qix3QkFBd0IseUJBQXlCLDRCQUE0QixrRUFBa0UsK0RBQStELE9BQU8sR0FBRyxpQ0FBaUMsd0JBQXdCLDZCQUE2QixPQUFPLEdBQUcsV0FBVyxzREFBc0QsR0FBRyx1Q0FBdUMsaUJBQWlCLHNCQUFzQixhQUFhLGNBQWMsb0JBQW9CLG1CQUFtQixvQkFBb0Isb0JBQW9CLDBCQUEwQiw4QkFBOEIsMEJBQTBCLGlCQUFpQiwyQ0FBMkMsMEJBQTBCLEdBQUcsOEJBQThCLHlCQUF5QixpQkFBaUIsR0FBRyxpQkFBaUIseUJBQXlCLHlCQUF5QixvQkFBb0IsbUJBQW1CLHlCQUF5Qix1QkFBdUIsaURBQWlELGdDQUFnQyw2QkFBNkIsMEJBQTBCLEdBQUcsd0JBQXdCLDBCQUEwQiwwQkFBMEIsR0FBRywwQkFBMEIseUJBQXlCLGdCQUFnQixvQkFBb0IsMkNBQTJDLHdCQUF3QixzQkFBc0Isc0JBQXNCLEdBQUcsMkJBQTJCLG9CQUFvQiwwQkFBMEIsbUJBQW1CLG1EQUFtRCw0Q0FBNEMsR0FBRyw0QkFBNEIsMkNBQTJDLDBCQUEwQixHQUFHLDRCQUE0QixtQkFBbUIsb0JBQW9CLHFEQUFxRCxHQUFHLGlDQUFpQyw0QkFBNEIseUJBQXlCLHVCQUF1QixPQUFPLEdBQUcsNEJBQTRCLG9CQUFvQixnQ0FBZ0MsR0FBRyw0QkFBNEIsb0JBQW9CLDZCQUE2Qiw2QkFBNkIsMEJBQTBCLHdCQUF3Qix1QkFBdUIsR0FBRyxrQ0FBa0MsMEJBQTBCLHdCQUF3Qix5Q0FBeUMsc0JBQXNCLEdBQUcsd0NBQXdDLGdDQUFnQywwQkFBMEIsR0FBRyxnREFBZ0QscUJBQXFCLDBCQUEwQix1QkFBdUIsR0FBRyx5Q0FBeUMsZ0NBQWdDLDBCQUEwQixHQUFHLGlEQUFpRCxxQkFBcUIsMEJBQTBCLHVCQUF1QixHQUFHLDBCQUEwQixjQUFjLG9CQUFvQixvQkFBb0IsNkJBQTZCLHFDQUFxQyxHQUFHLHFCQUFxQix1Q0FBdUMsMEJBQTBCLEdBQUcsd0JBQXdCLGtCQUFrQixtQkFBbUIsb0NBQW9DLGdDQUFnQyx3QkFBd0IsZ0RBQWdELG1CQUFtQixHQUFHLGdDQUFnQyxvQkFBb0IsR0FBRyw4QkFBOEIsb0JBQW9CLDBCQUEwQix3QkFBd0IsR0FBRyx5QkFBeUIsb0JBQW9CLDBCQUEwQiwwQkFBMEIsR0FBRywrQkFBK0IseUJBQXlCLEdBQUcsK0JBQStCLDBCQUEwQiwyQ0FBMkMseUJBQXlCLGdDQUFnQyxvQ0FBb0Msc0JBQXNCLHVCQUF1QixnQ0FBZ0MsNENBQTRDLEdBQUcscUNBQXFDLG9CQUFvQixHQUFHLDRDQUE0QyxvQkFBb0IscUNBQXFDLEdBQUcsaUNBQWlDLDRDQUE0QyxpQ0FBaUMsT0FBTyxHQUFHLDZCQUE2QixvQkFBb0IsMEJBQTBCLEdBQUcsbUNBQW1DLDJCQUEyQixHQUFHLG1EQUFtRCx5QkFBeUIsbUJBQW1CLGtCQUFrQixpQkFBaUIsaUJBQWlCLGdCQUFnQixpQkFBaUIsR0FBRyxpQ0FBaUMsNEJBQTRCLDhCQUE4QiwwQkFBMEIseUJBQXlCLHNCQUFzQixnQ0FBZ0MsdUJBQXVCLHNCQUFzQiwwQkFBMEIsR0FBRyx1Q0FBdUMsMkNBQTJDLEdBQUcsc0NBQXNDLDJDQUEyQyxnQ0FBZ0MsR0FBRyw0Q0FBNEMsMkNBQTJDLEdBQUcsNkNBQTZDLDJDQUEyQywyQ0FBMkMsR0FBRyx5Q0FBeUMsNENBQTRDLGlDQUFpQyxHQUFHLCtDQUErQyw0Q0FBNEMsR0FBRyxnREFBZ0QsNENBQTRDLDJDQUEyQyxHQUFHLHVDQUF1Qyx5Q0FBeUMsOEJBQThCLEdBQUcsNkNBQTZDLHlDQUF5QyxHQUFHLDhDQUE4Qyx5Q0FBeUMsMkNBQTJDLEdBQUcsZ0NBQWdDLHlCQUF5Qix5QkFBeUIsMEJBQTBCLHlCQUF5QixnQ0FBZ0Msd0JBQXdCLGdDQUFnQyx1QkFBdUIsZ0NBQWdDLG9DQUFvQyxzQkFBc0IsMEJBQTBCLEdBQUcsc0NBQXNDLG1CQUFtQixnQ0FBZ0MsR0FBRyx1Q0FBdUMsb0JBQW9CLEdBQUcsaUNBQWlDLGdDQUFnQywwQkFBMEIsT0FBTyxHQUFHLDRCQUE0QixjQUFjLG9CQUFvQixvQkFBb0IsNkJBQTZCLHFDQUFxQyxxQ0FBcUMsb0JBQW9CLEdBQUcsa0NBQWtDLGtCQUFrQixtQkFBbUIsb0NBQW9DLHFCQUFxQix3QkFBd0IsNENBQTRDLG1CQUFtQixHQUFHLHdDQUF3QyxvQkFBb0IsR0FBRyxtQ0FBbUMseUJBQXlCLDJCQUEyQiwwQkFBMEIseUJBQXlCLGdDQUFnQyx3QkFBd0IsZ0NBQWdDLHVCQUF1QixxQkFBcUIsb0NBQW9DLHNCQUFzQiwwQkFBMEIsR0FBRyx5Q0FBeUMsbUJBQW1CLGdDQUFnQyxHQUFHLDBDQUEwQyxvQkFBb0IsR0FBRyx5QkFBeUIsY0FBYyxvQkFBb0Isb0JBQW9CLDZCQUE2QixxQ0FBcUMscUNBQXFDLG9CQUFvQixHQUFHLCtCQUErQixrQkFBa0IsbUJBQW1CLG9DQUFvQyxxQkFBcUIsd0JBQXdCLDRDQUE0QyxtQkFBbUIsR0FBRyxxQkFBcUIsdUNBQXVDLDBCQUEwQixHQUFHLHFDQUFxQyxvQkFBb0IsR0FBRyxtQ0FBbUMsb0JBQW9CLDBCQUEwQix3QkFBd0IsR0FBRyxnQ0FBZ0MseUJBQXlCLDJCQUEyQiwwQkFBMEIseUJBQXlCLGdDQUFnQyx3QkFBd0IsZ0NBQWdDLHVCQUF1QixxQkFBcUIsb0NBQW9DLHNCQUFzQiwwQkFBMEIsR0FBRyxzQ0FBc0MsbUJBQW1CLGdDQUFnQyxHQUFHLHVDQUF1QyxvQkFBb0IsR0FBRyw4QkFBOEIsb0JBQW9CLDBCQUEwQixtQkFBbUIsb0JBQW9CLDBCQUEwQiw2QkFBNkIsR0FBRyxpQkFBaUIsa0JBQWtCLEdBQUcsb0JBQW9CLHlCQUF5Qix5QkFBeUIsdUJBQXVCLEdBQUcsNEJBQTRCLHFCQUFxQixvQ0FBb0MsR0FBRyxxQkFBcUIseUJBQXlCLDJCQUEyQiwwQkFBMEIsZ0NBQWdDLHlCQUF5QixzQkFBc0IscUJBQXFCLGdDQUFnQyx1QkFBdUIsc0JBQXNCLDBCQUEwQixHQUFHLDJCQUEyQix5QkFBeUIsZ0NBQWdDLG1CQUFtQixHQUFHLDZCQUE2QixnREFBZ0QscUNBQXFDLEdBQUcsbUNBQW1DLDhDQUE4QyxnREFBZ0QsR0FBRyxtQkFBbUIseUJBQXlCLG9CQUFvQixzQkFBc0IscUJBQXFCLEdBQUcsMkJBQTJCLG1DQUFtQyxHQUFHLHVCQUF1QiwyQkFBMkIscUJBQXFCLG9CQUFvQix5QkFBeUIsZ0NBQWdDLEdBQUcsK0JBQStCLHFCQUFxQixvQkFBb0IscUJBQXFCLDJFQUEyRSxtQ0FBbUMsK0JBQStCLEdBQUcsbUJBQW1CLG9CQUFvQixxQkFBcUIsb0JBQW9CLHNCQUFzQiwwQkFBMEIsR0FBRyx3QkFBd0IseUJBQXlCLEdBQUcseUJBQXlCLG9CQUFvQixHQUFHLDJCQUEyQixrQ0FBa0MsbUJBQW1CLEdBQUcsaUNBQWlDLG9DQUFvQyxHQUFHLG1CQUFtQiw4QkFBOEIsZ0NBQWdDLHFEQUFxRCxtQ0FBbUMsR0FBRyxxQkFBcUIsbUNBQW1DLEdBQUcsd0JBQXdCLG9DQUFvQyxHQUFHLHNCQUFzQixpQ0FBaUMsR0FBRyxzQkFBc0Isb0JBQW9CLDZCQUE2QiwwQkFBMEIscUJBQXFCLHNCQUFzQixHQUFHLCtCQUErQiw0QkFBNEIsd0JBQXdCLEdBQUcsK0JBQStCLG9CQUFvQiw2QkFBNkIsMEJBQTBCLEdBQUcsb0NBQW9DLDBCQUEwQixHQUFHLG1DQUFtQyx5QkFBeUIsNEJBQTRCLDBCQUEwQixnQ0FBZ0MseUJBQXlCLHdCQUF3QixxQkFBcUIsZ0NBQWdDLHVCQUF1QixzQkFBc0IsMEJBQTBCLEdBQUcseUNBQXlDLHlCQUF5QixnQ0FBZ0MsbUJBQW1CLEdBQUcsOENBQThDLGlCQUFpQixzQkFBc0IsYUFBYSxjQUFjLG9CQUFvQixtQkFBbUIsb0JBQW9CLG9CQUFvQiwwQkFBMEIsOEJBQThCLDBCQUEwQixpQkFBaUIsMkNBQTJDLDBCQUEwQixJQUFJLG1DQUFtQyx5QkFBeUIsaUJBQWlCLEdBQUcsb0JBQW9CLHlCQUF5QixtQkFBbUIsb0JBQW9CLHlCQUF5QixpREFBaUQscUJBQXFCLDRDQUE0Qyw2QkFBNkIsMEJBQTBCLEtBQUssNkJBQTZCLDBCQUEwQiwwQkFBMEIsS0FBSyw2Q0FBNkMsMkJBQTJCLEtBQUssa0NBQWtDLHFCQUFxQix1QkFBdUIsS0FBSywrQkFBK0Isd0JBQXdCLDBCQUEwQix1Q0FBdUMscUJBQXFCLHFCQUFxQixLQUFLLGlDQUFpQyxvQkFBb0IsS0FBSyx1Q0FBdUMsMkJBQTJCLHVCQUF1QixLQUFLLHNDQUFzQyxxQ0FBcUMsS0FBSywwREFBMEQsMkJBQTJCLEtBQUssc0RBQXNELDBCQUEwQixLQUFLLDJEQUEyRCwyQkFBMkIsS0FBSywrQkFBK0IseUJBQXlCLGlCQUFpQixrQkFBa0Isc0JBQXNCLHFCQUFxQixzQkFBc0IsS0FBSywyQ0FBMkMsaUJBQWlCLHNCQUFzQixhQUFhLGNBQWMsb0JBQW9CLG1CQUFtQixvQkFBb0Isb0JBQW9CLDBCQUEwQiw4QkFBOEIsMEJBQTBCLGlCQUFpQiwyQ0FBMkMsMEJBQTBCLEdBQUcsaUNBQWlDLHlCQUF5QixpQkFBaUIsR0FBRyxpQkFBaUIseUJBQXlCLHlCQUF5QixvQkFBb0IsbUJBQW1CLHlCQUF5Qix1QkFBdUIsaURBQWlELGdDQUFnQyw2QkFBNkIsMEJBQTBCLEtBQUssMEJBQTBCLDBCQUEwQiwwQkFBMEIsS0FBSyw0QkFBNEIseUJBQXlCLGtCQUFrQixvQkFBb0IscUJBQXFCLHdCQUF3QixzQkFBc0Isc0JBQXNCLEtBQUssNEJBQTRCLGNBQWMsb0JBQW9CLG9CQUFvQiw2QkFBNkIscUNBQXFDLEtBQUssNEJBQTRCLGtCQUFrQixtQkFBbUIsb0NBQW9DLHFCQUFxQix3QkFBd0Isb0NBQW9DLG1CQUFtQixLQUFLLGtDQUFrQyxvQkFBb0IsS0FBSyxnQ0FBZ0Msb0JBQW9CLDBCQUEwQix3QkFBd0IsS0FBSywyQkFBMkIsb0JBQW9CLDBCQUEwQiwwQkFBMEIsS0FBSyxpQ0FBaUMseUJBQXlCLEtBQUssaUNBQWlDLDBCQUEwQixnQ0FBZ0MseUJBQXlCLHFCQUFxQixvQ0FBb0Msc0JBQXNCLHVCQUF1QixnQ0FBZ0Msb0NBQW9DLEtBQUssdUNBQXVDLG9CQUFvQixLQUFLLDhDQUE4QyxvQkFBb0IscUNBQXFDLEtBQUssK0JBQStCLG9CQUFvQiwwQkFBMEIsS0FBSyxxQ0FBcUMsMkJBQTJCLEtBQUsscURBQXFELHlCQUF5QixtQkFBbUIsa0JBQWtCLGlCQUFpQixpQkFBaUIsZ0JBQWdCLGlCQUFpQixLQUFLLG1DQUFtQyw0QkFBNEIsOEJBQThCLDBCQUEwQix5QkFBeUIsc0JBQXNCLGdDQUFnQyx1QkFBdUIsc0JBQXNCLDBCQUEwQixLQUFLLHlDQUF5QyxtQkFBbUIsS0FBSyxzQ0FBc0MsMkNBQTJDLGdDQUFnQyxHQUFHLDRDQUE0QywyQ0FBMkMsR0FBRyw2Q0FBNkMsMkNBQTJDLG1CQUFtQixHQUFHLHlDQUF5QywrQkFBK0Isb0JBQW9CLEdBQUcsK0NBQStDLCtCQUErQixHQUFHLGdEQUFnRCwrQkFBK0IsbUJBQW1CLEdBQUcsdUNBQXVDLDRCQUE0QixpQkFBaUIsR0FBRyw2Q0FBNkMsNEJBQTRCLEdBQUcsOENBQThDLDRCQUE0QixtQkFBbUIsR0FBRyxnQ0FBZ0MseUJBQXlCLHlCQUF5QiwwQkFBMEIseUJBQXlCLGdDQUFnQyxzQkFBc0IsZ0NBQWdDLHVCQUF1QixxQkFBcUIsb0NBQW9DLHNCQUFzQiwwQkFBMEIsR0FBRyxzQ0FBc0MsbUJBQW1CLGdDQUFnQyxHQUFHLHVDQUF1QyxvQkFBb0IsR0FBRywrQkFBK0Isd0JBQXdCLDBCQUEwQixvQkFBb0IsMEJBQTBCLDhCQUE4QixnQkFBZ0Isa0JBQWtCLG9CQUFvQixnREFBZ0QsNENBQTRDLEdBQUcsZ0JBQWdCLHNCQUFzQixnQ0FBZ0MsR0FBRyxzQkFBc0IsbUJBQW1CLEdBQUcsT0FBTyxnRkFBZ0YsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxPQUFPLE9BQU8sVUFBVSxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsYUFBYSxXQUFXLE9BQU8sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLEtBQUssS0FBSyxZQUFZLE1BQU0sTUFBTSxLQUFLLEtBQUssVUFBVSxNQUFNLE1BQU0sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLEtBQUssWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxXQUFXLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxLQUFLLFVBQVUsVUFBVSxZQUFZLE1BQU0sTUFBTSxLQUFLLEtBQUssWUFBWSxNQUFNLE1BQU0sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLEtBQUssS0FBSyxZQUFZLE1BQU0sTUFBTSxLQUFLLEtBQUssWUFBWSxNQUFNLE1BQU0sV0FBVyxLQUFLLFVBQVUsWUFBWSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxNQUFNLFdBQVcsS0FBSyxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxNQUFNLEtBQUssS0FBSyxVQUFVLE1BQU0sTUFBTSxLQUFLLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksTUFBTSxNQUFNLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLFFBQVEsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sYUFBYSxNQUFNLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxLQUFLLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxNQUFNLE1BQU0sS0FBSyxLQUFLLFlBQVksTUFBTSxNQUFNLEtBQUssWUFBWSxPQUFPLGFBQWEsTUFBTSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxNQUFNLEtBQUssWUFBWSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsVUFBVSxZQUFZLGFBQWEsV0FBVyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksT0FBTyxLQUFLLEtBQUssVUFBVSxVQUFVLE1BQU0sTUFBTSxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLEtBQUssWUFBWSxNQUFNLE1BQU0sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxLQUFLLFVBQVUsTUFBTSxNQUFNLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsV0FBVyxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLFdBQVcsS0FBSyxVQUFVLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxXQUFXLFVBQVUsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLFdBQVcsT0FBTyxhQUFhLE1BQU0sVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsTUFBTSxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLE9BQU8sS0FBSyxVQUFVLE1BQU0sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFFBQVEsYUFBYSxNQUFNLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxXQUFXLE1BQU0sS0FBSyxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsWUFBWSxXQUFXLFVBQVUsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsV0FBVyxNQUFNLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxZQUFZLE9BQU8sS0FBSyxVQUFVLFlB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLHFFQUFlO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZUFBZSxxRUFBZTtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FB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QUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELDhCQUE4QjtBQUM1RixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELFNBQVM7QUFDckU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4REFBOEQsOEJBQThCO0FBQzVGLFNBQVM7QUFDVDtBQUNBO0FBQ0EsNERBQTRELFNBQVM7QUFDckU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBOztBQUVBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNPOztBQUVQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsVUFBVTs7QUFFVjtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsWUFBWSxxQ0FBcUMsV0FBVztBQUMzRjtBQUNBO0FBQ0EsY0FBYztBQUNkLCtCQUErQixZQUFZLHFDQUFxQyxXQUFXO0FBQzNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ087O0FBRVA7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBLG1CQUFtQixnREFBTztBQUMxQjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQ3R4Q0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0NmQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7Ozs7O1dDckJBOzs7Ozs7Ozs7Ozs7OztBQ0FxQjtBQUNtRDtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1RUFBNkI7QUFDN0IsMkVBQWlDOztBQUVqQztBQUNBO0FBQ0EsMENBQTBDLHFFQUEyQjtBQUNyRSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFFQUFxRSxtRUFBeUI7QUFDOUYsc0VBQXNFLDRFQUFrQzs7QUFFeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDZFQUFtQztBQUN2QyxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDRFQUFrQztBQUN0QyxJQUFJLDZFQUFtQztBQUN2QztBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLGlFQUF1QjtBQUMzQixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1RUFBNkI7QUFDckMsS0FBSztBQUNMLENBQUM7OztBQUdEO0FBQ0E7QUFDQSxJQUFJLG9FQUEwQjtBQUM5QixJQUFJLDRFQUFrQztBQUN0QyxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLGlFQUF1QjtBQUMzQixJQUFJLDRFQUFrQztBQUN0QyxDQUFDOztBQUVEO0FBQ0E7QUFDQSxJQUFJLCtEQUFxQjtBQUN6QixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxxRUFBcUUsbUVBQXlCO0FBQzlGLHNFQUFzRSw0RUFBa0M7O0FBRXhHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxzRUFBNEI7QUFDdEUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9jb2xjYWRlL2NvbGNhZGUuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9nZXRVcmwuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2FkZExlYWRpbmdaZXJvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZGVmYXVsdExvY2FsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZGVmYXVsdE9wdGlvbnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2Zvcm1hdC9mb3JtYXR0ZXJzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9mb3JtYXQvbGlnaHRGb3JtYXR0ZXJzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9mb3JtYXQvbG9uZ0Zvcm1hdHRlcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ0RheU9mWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZ2V0VVRDSVNPV2Vlay9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvZ2V0VVRDSVNPV2Vla1llYXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL2dldFVUQ1dlZWtZZWFyL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vX2xpYi9wcm90ZWN0ZWRUb2tlbnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc3RhcnRPZlVUQ0lTT1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENJU09XZWVrWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvc3RhcnRPZlVUQ1dlZWsvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9fbGliL3N0YXJ0T2ZVVENXZWVrWWVhci9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vYWRkTWlsbGlzZWNvbmRzL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vZm9ybWF0L2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vaXNEYXRlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vaXNWYWxpZC9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9fbGliL2J1aWxkRm9ybWF0TG9uZ0ZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRMb2NhbGl6ZUZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRNYXRjaEZuL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL19saWIvYnVpbGRNYXRjaFBhdHRlcm5Gbi9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9fbGliL2Zvcm1hdERpc3RhbmNlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvZm9ybWF0TG9uZy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9fbGliL2Zvcm1hdFJlbGF0aXZlL2luZGV4LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9kYXRlLWZucy9lc20vbG9jYWxlL2VuLVVTL19saWIvbG9jYWxpemUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL2RhdGUtZm5zL2VzbS9sb2NhbGUvZW4tVVMvX2xpYi9tYXRjaC9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL2xvY2FsZS9lbi1VUy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3N1Yk1pbGxpc2Vjb25kcy9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvZGF0ZS1mbnMvZXNtL3RvRGF0ZS9pbmRleC5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvbG9naWNNb2R1bGUuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDb2xjYWRlIHYwLjIuMFxuICogTGlnaHR3ZWlnaHQgbWFzb25yeSBsYXlvdXRcbiAqIGJ5IERhdmlkIERlU2FuZHJvXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICAvKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5Db2xjYWRlID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSgpIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ29sY2FkZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBDb2xjYWRlKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBlbGVtZW50ID0gZ2V0UXVlcnlFbGVtZW50KCBlbGVtZW50ICk7XG5cbiAgLy8gZG8gbm90IGluaXRpYWxpemUgdHdpY2Ugb24gc2FtZSBlbGVtZW50XG4gIGlmICggZWxlbWVudCAmJiBlbGVtZW50LmNvbGNhZGVHVUlEICkge1xuICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1sgZWxlbWVudC5jb2xjYWRlR1VJRCBdO1xuICAgIGluc3RhbmNlLm9wdGlvbiggb3B0aW9ucyApO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0ge307XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG4gIC8vIGtpY2sgdGhpbmdzIG9mZlxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG52YXIgcHJvdG8gPSBDb2xjYWRlLnByb3RvdHlwZTtcblxucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRpb25zICk7XG59O1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbnZhciBHVUlEID0gMDtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBDb2xjYWRlIGludGFuY2VzXG52YXIgaW5zdGFuY2VzID0ge307XG5cbnByb3RvLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVycm9yQ2hlY2soKTtcbiAgLy8gYWRkIGd1aWQgZm9yIENvbGNhZGUuZGF0YVxuICB2YXIgZ3VpZCA9IHRoaXMuZ3VpZCA9ICsrR1VJRDtcbiAgdGhpcy5lbGVtZW50LmNvbGNhZGVHVUlEID0gZ3VpZDtcbiAgaW5zdGFuY2VzWyBndWlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIHVwZGF0ZSBpbml0aWFsIHByb3BlcnRpZXMgJiBsYXlvdXRcbiAgdGhpcy5yZWxvYWQoKTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMuX3dpbmRvd1Jlc2l6ZUhhbmRsZXIgPSB0aGlzLm9uV2luZG93UmVzaXplLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5fbG9hZEhhbmRsZXIgPSB0aGlzLm9uTG9hZC5iaW5kKCB0aGlzICk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5fd2luZG93UmVzaXplSGFuZGxlciApO1xuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzLl9sb2FkSGFuZGxlciwgdHJ1ZSApO1xufTtcblxucHJvdG8uZXJyb3JDaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXJyb3JzID0gW107XG4gIGlmICggIXRoaXMuZWxlbWVudCApIHtcbiAgICBlcnJvcnMucHVzaCggJ0JhZCBlbGVtZW50OiAnICsgdGhpcy5lbGVtZW50ICk7XG4gIH1cbiAgaWYgKCAhdGhpcy5vcHRpb25zLmNvbHVtbnMgKSB7XG4gICAgZXJyb3JzLnB1c2goICdjb2x1bW5zIG9wdGlvbiByZXF1aXJlZDogJyArIHRoaXMub3B0aW9ucy5jb2x1bW5zICk7XG4gIH1cbiAgaWYgKCAhdGhpcy5vcHRpb25zLml0ZW1zICkge1xuICAgIGVycm9ycy5wdXNoKCAnaXRlbXMgb3B0aW9uIHJlcXVpcmVkOiAnICsgdGhpcy5vcHRpb25zLml0ZW1zICk7XG4gIH1cblxuICBpZiAoIGVycm9ycy5sZW5ndGggKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnW0NvbGNhZGUgZXJyb3JdICcgKyBlcnJvcnMuam9pbignLiAnKSApO1xuICB9XG59O1xuXG4vLyB1cGRhdGUgcHJvcGVydGllcyBhbmQgZG8gbGF5b3V0XG5wcm90by5yZWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy51cGRhdGVDb2x1bW5zKCk7XG4gIHRoaXMudXBkYXRlSXRlbXMoKTtcbiAgdGhpcy5sYXlvdXQoKTtcbn07XG5cbnByb3RvLnVwZGF0ZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb2x1bW5zID0gcXVlcnlTZWxlY3QoIHRoaXMub3B0aW9ucy5jb2x1bW5zLCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnByb3RvLnVwZGF0ZUl0ZW1zID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXRlbXMgPSBxdWVyeVNlbGVjdCggdGhpcy5vcHRpb25zLml0ZW1zLCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnByb3RvLmdldEFjdGl2ZUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY29sdW1ucy5maWx0ZXIoIGZ1bmN0aW9uKCBjb2x1bW4gKSB7XG4gICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggY29sdW1uICk7XG4gICAgcmV0dXJuIHN0eWxlLmRpc3BsYXkgIT0gJ25vbmUnO1xuICB9KTtcbn07XG5cbi8vIC0tLS0tIGxheW91dCAtLS0tLSAvL1xuXG4vLyBwdWJsaWMsIHVwZGF0ZXMgYWN0aXZlQ29sdW1uc1xucHJvdG8ubGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYWN0aXZlQ29sdW1ucyA9IHRoaXMuZ2V0QWN0aXZlQ29sdW1ucygpO1xuICB0aGlzLl9sYXlvdXQoKTtcbn07XG5cbi8vIHByaXZhdGUsIGRvZXMgbm90IHVwZGF0ZSBhY3RpdmVDb2x1bW5zXG5wcm90by5fbGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlc2V0IGNvbHVtbiBoZWlnaHRzXG4gIHRoaXMuY29sdW1uSGVpZ2h0cyA9IHRoaXMuYWN0aXZlQ29sdW1ucy5tYXAoIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAwO1xuICB9KTtcbiAgLy8gbGF5b3V0IGFsbCBpdGVtc1xuICB0aGlzLmxheW91dEl0ZW1zKCB0aGlzLml0ZW1zICk7XG59O1xuXG5wcm90by5sYXlvdXRJdGVtcyA9IGZ1bmN0aW9uKCBpdGVtcyApIHtcbiAgaXRlbXMuZm9yRWFjaCggdGhpcy5sYXlvdXRJdGVtLCB0aGlzICk7XG59O1xuXG5wcm90by5sYXlvdXRJdGVtID0gZnVuY3Rpb24oIGl0ZW0gKSB7XG4gIC8vIGxheW91dCBpdGVtIGJ5IGFwcGVuZGluZyB0byBjb2x1bW5cbiAgdmFyIG1pbkhlaWdodCA9IE1hdGgubWluLmFwcGx5KCBNYXRoLCB0aGlzLmNvbHVtbkhlaWdodHMgKTtcbiAgdmFyIGluZGV4ID0gdGhpcy5jb2x1bW5IZWlnaHRzLmluZGV4T2YoIG1pbkhlaWdodCApO1xuICB0aGlzLmFjdGl2ZUNvbHVtbnNbIGluZGV4IF0uYXBwZW5kQ2hpbGQoIGl0ZW0gKTtcbiAgLy8gYXQgbGVhc3QgMXB4LCBpZiBpdGVtIGhhc24ndCBsb2FkZWRcbiAgLy8gTm90IGV4YWN0bHkgYWNjdXJhdGUsIGJ1dCBpdCdzIGNvb2xcbiAgdGhpcy5jb2x1bW5IZWlnaHRzWyBpbmRleCBdICs9IGl0ZW0ub2Zmc2V0SGVpZ2h0IHx8IDE7XG59O1xuXG4vLyAtLS0tLSBhZGRpbmcgaXRlbXMgLS0tLS0gLy9cblxucHJvdG8uYXBwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLmdldFF1ZXJ5SXRlbXMoIGVsZW1zICk7XG4gIC8vIGFkZCBpdGVtcyB0byBjb2xsZWN0aW9uXG4gIHRoaXMuaXRlbXMgPSB0aGlzLml0ZW1zLmNvbmNhdCggaXRlbXMgKTtcbiAgLy8gbGF5IHRoZW0gb3V0XG4gIHRoaXMubGF5b3V0SXRlbXMoIGl0ZW1zICk7XG59O1xuXG5wcm90by5wcmVwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLmdldFF1ZXJ5SXRlbXMoIGVsZW1zICk7XG4gIC8vIGFkZCBpdGVtcyB0byBjb2xsZWN0aW9uXG4gIHRoaXMuaXRlbXMgPSBpdGVtcy5jb25jYXQoIHRoaXMuaXRlbXMgKTtcbiAgLy8gbGF5IG91dCBldmVyeXRoaW5nXG4gIHRoaXMuX2xheW91dCgpO1xufTtcblxucHJvdG8uZ2V0UXVlcnlJdGVtcyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgZWxlbXMgPSBtYWtlQXJyYXkoIGVsZW1zICk7XG4gIHZhciBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoIGVsZW0gKTtcbiAgfSk7XG4gIHJldHVybiBxdWVyeVNlbGVjdCggdGhpcy5vcHRpb25zLml0ZW1zLCBmcmFnbWVudCApO1xufTtcblxuLy8gLS0tLS0gbWVhc3VyZSBjb2x1bW4gaGVpZ2h0IC0tLS0tIC8vXG5cbnByb3RvLm1lYXN1cmVDb2x1bW5IZWlnaHQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGJvdW5kaW5nUmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdGhpcy5hY3RpdmVDb2x1bW5zLmZvckVhY2goIGZ1bmN0aW9uKCBjb2x1bW4sIGkgKSB7XG4gICAgLy8gaWYgZWxlbSwgbWVhc3VyZSBvbmx5IHRoYXQgY29sdW1uXG4gICAgLy8gaWYgbm8gZWxlbSwgbWVhc3VyZSBhbGwgY29sdW1uc1xuICAgIGlmICggIWVsZW0gfHwgY29sdW1uLmNvbnRhaW5zKCBlbGVtICkgKSB7XG4gICAgICB2YXIgbGFzdENoaWxkUmVjdCA9IGNvbHVtbi5sYXN0RWxlbWVudENoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgLy8gbm90IGFuIGV4YWN0IGNhbGN1bGF0aW9uIGFzIGl0IGluY2x1ZGVzIHRvcCBib3JkZXIsIGFuZCBleGNsdWRlcyBpdGVtIGJvdHRvbSBtYXJnaW5cbiAgICAgIHRoaXMuY29sdW1uSGVpZ2h0c1sgaSBdID0gbGFzdENoaWxkUmVjdC5ib3R0b20gLSBib3VuZGluZ1JlY3QudG9wO1xuICAgIH1cbiAgfSwgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gZXZlbnRzIC0tLS0tIC8vXG5cbnByb3RvLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIGNsZWFyVGltZW91dCggdGhpcy5yZXNpemVUaW1lb3V0ICk7XG4gIHRoaXMucmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub25EZWJvdW5jZWRSZXNpemUoKTtcbiAgfS5iaW5kKCB0aGlzICksIDEwMCApO1xufTtcblxucHJvdG8ub25EZWJvdW5jZWRSZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGFjdGl2ZUNvbHVtbnMgPSB0aGlzLmdldEFjdGl2ZUNvbHVtbnMoKTtcbiAgLy8gY2hlY2sgaWYgY29sdW1ucyBjaGFuZ2VkXG4gIHZhciBpc1NhbWVMZW5ndGggPSBhY3RpdmVDb2x1bW5zLmxlbmd0aCA9PSB0aGlzLmFjdGl2ZUNvbHVtbnMubGVuZ3RoO1xuICB2YXIgaXNTYW1lQ29sdW1ucyA9IHRydWU7XG4gIHRoaXMuYWN0aXZlQ29sdW1ucy5mb3JFYWNoKCBmdW5jdGlvbiggY29sdW1uLCBpICkge1xuICAgIGlzU2FtZUNvbHVtbnMgPSBpc1NhbWVDb2x1bW5zICYmIGNvbHVtbiA9PSBhY3RpdmVDb2x1bW5zW2ldO1xuICB9KTtcbiAgaWYgKCBpc1NhbWVMZW5ndGggJiYgaXNTYW1lQ29sdW1ucyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWN0aXZlQ29sdW1ucyBjaGFuZ2VkXG4gIHRoaXMuYWN0aXZlQ29sdW1ucyA9IGFjdGl2ZUNvbHVtbnM7XG4gIHRoaXMuX2xheW91dCgpO1xufTtcblxucHJvdG8ub25Mb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLm1lYXN1cmVDb2x1bW5IZWlnaHQoIGV2ZW50LnRhcmdldCApO1xufTtcblxuLy8gLS0tLS0gZGVzdHJveSAtLS0tLSAvL1xuXG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIC8vIG1vdmUgaXRlbXMgYmFjayB0byBjb250YWluZXJcbiAgdGhpcy5pdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggaXRlbSApIHtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoIGl0ZW0gKTtcbiAgfSwgdGhpcyApO1xuICAvLyByZW1vdmUgZXZlbnRzXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcy5fd2luZG93UmVzaXplSGFuZGxlciApO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzLl9sb2FkSGFuZGxlciwgdHJ1ZSApO1xuICAvLyByZW1vdmUgZGF0YVxuICBkZWxldGUgdGhpcy5lbGVtZW50LmNvbGNhZGVHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEhUTUwgaW5pdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5kb2NSZWFkeSggZnVuY3Rpb24oKSB7XG4gIHZhciBkYXRhRWxlbXMgPSBxdWVyeVNlbGVjdCgnW2RhdGEtY29sY2FkZV0nKTtcbiAgZGF0YUVsZW1zLmZvckVhY2goIGh0bWxJbml0ICk7XG59KTtcblxuZnVuY3Rpb24gaHRtbEluaXQoIGVsZW0gKSB7XG4gIC8vIGNvbnZlcnQgYXR0cmlidXRlIFwiZm9vOiBiYXIsIHF1eDogYmF6XCIgaW50byBvYmplY3RcbiAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2xjYWRlJyk7XG4gIHZhciBhdHRyUGFydHMgPSBhdHRyLnNwbGl0KCcsJyk7XG4gIHZhciBvcHRpb25zID0ge307XG4gIGF0dHJQYXJ0cy5mb3JFYWNoKCBmdW5jdGlvbiggcGFydCApIHtcbiAgICB2YXIgcGFpciA9IHBhcnQuc3BsaXQoJzonKTtcbiAgICB2YXIga2V5ID0gcGFpclswXS50cmltKCk7XG4gICAgdmFyIHZhbHVlID0gcGFpclsxXS50cmltKCk7XG4gICAgb3B0aW9uc1sga2V5IF0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgbmV3IENvbGNhZGUoIGVsZW0sIG9wdGlvbnMgKTtcbn1cblxuQ29sY2FkZS5kYXRhID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGVsZW0gPSBnZXRRdWVyeUVsZW1lbnQoIGVsZW0gKTtcbiAgdmFyIGlkID0gZWxlbSAmJiBlbGVtLmNvbGNhZGVHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0galF1ZXJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkNvbGNhZGUubWFrZUpRdWVyeVBsdWdpbiA9IGZ1bmN0aW9uKCAkICkge1xuICAkID0gJCB8fCB3aW5kb3cualF1ZXJ5O1xuICBpZiAoICEkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gICQuZm4uY29sY2FkZSA9IGZ1bmN0aW9uKCBhcmcwIC8qLCBhcmcxICovKSB7XG4gICAgLy8gbWV0aG9kIGNhbGwgJCgpLmNvbGNhZGUoICdtZXRob2QnLCB7IG9wdGlvbnMgfSApXG4gICAgaWYgKCB0eXBlb2YgYXJnMCA9PSAnc3RyaW5nJyApIHtcbiAgICAgIC8vIHNoaWZ0IGFyZ3VtZW50cyBieSAxXG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcbiAgICAgIHJldHVybiBtZXRob2RDYWxsKCB0aGlzLCBhcmcwLCBhcmdzICk7XG4gICAgfVxuICAgIC8vIGp1c3QgJCgpLmNvbGNhZGUoeyBvcHRpb25zIH0pXG4gICAgcGxhaW5DYWxsKCB0aGlzLCBhcmcwICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWV0aG9kQ2FsbCggJGVsZW1zLCBtZXRob2ROYW1lLCBhcmdzICkge1xuICAgIHZhciByZXR1cm5WYWx1ZTtcbiAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oIGksIGVsZW0gKSB7XG4gICAgICAvLyBnZXQgaW5zdGFuY2VcbiAgICAgIHZhciBjb2xjYWRlID0gJC5kYXRhKCBlbGVtLCAnY29sY2FkZScgKTtcbiAgICAgIGlmICggIWNvbGNhZGUgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGFwcGx5IG1ldGhvZCwgZ2V0IHJldHVybiB2YWx1ZVxuICAgICAgdmFyIHZhbHVlID0gY29sY2FkZVsgbWV0aG9kTmFtZSBdLmFwcGx5KCBjb2xjYWRlLCBhcmdzICk7XG4gICAgICAvLyBzZXQgcmV0dXJuIHZhbHVlIGlmIHZhbHVlIGlzIHJldHVybmVkLCB1c2Ugb25seSBmaXJzdCB2YWx1ZVxuICAgICAgcmV0dXJuVmFsdWUgPSByZXR1cm5WYWx1ZSA9PT0gdW5kZWZpbmVkID8gdmFsdWUgOiByZXR1cm5WYWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWUgIT09IHVuZGVmaW5lZCA/IHJldHVyblZhbHVlIDogJGVsZW1zO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxhaW5DYWxsKCAkZWxlbXMsIG9wdGlvbnMgKSB7XG4gICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCBpLCBlbGVtICkge1xuICAgICAgdmFyIGNvbGNhZGUgPSAkLmRhdGEoIGVsZW0sICdjb2xjYWRlJyApO1xuICAgICAgaWYgKCBjb2xjYWRlICkge1xuICAgICAgICAvLyBzZXQgb3B0aW9ucyAmIGluaXRcbiAgICAgICAgY29sY2FkZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICAgICAgY29sY2FkZS5sYXlvdXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGluaXRpYWxpemUgbmV3IGluc3RhbmNlXG4gICAgICAgIGNvbGNhZGUgPSBuZXcgQ29sY2FkZSggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgICAkLmRhdGEoIGVsZW0sICdjb2xjYWRlJywgY29sY2FkZSApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG4vLyB0cnkgbWFraW5nIHBsdWdpblxuQ29sY2FkZS5tYWtlSlF1ZXJ5UGx1Z2luKCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHV0aWxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbi8vIHR1cm4gZWxlbWVudCBvciBub2RlTGlzdCBpbnRvIGFuIGFycmF5XG5mdW5jdGlvbiBtYWtlQXJyYXkoIG9iaiApIHtcbiAgdmFyIGFyeSA9IFtdO1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICAgIGFyeSA9IG9iajtcbiAgfSBlbHNlIGlmICggb2JqICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInICkge1xuICAgIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgb2JqLmxlbmd0aDsgaSsrICkge1xuICAgICAgYXJ5LnB1c2goIG9ialtpXSApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgICBhcnkucHVzaCggb2JqICk7XG4gIH1cbiAgcmV0dXJuIGFyeTtcbn1cblxuLy8gZ2V0IGFycmF5IG9mIGVsZW1lbnRzXG5mdW5jdGlvbiBxdWVyeVNlbGVjdCggc2VsZWN0b3IsIGVsZW0gKSB7XG4gIGVsZW0gPSBlbGVtIHx8IGRvY3VtZW50O1xuICB2YXIgZWxlbXMgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gIHJldHVybiBtYWtlQXJyYXkoIGVsZW1zICk7XG59XG5cbmZ1bmN0aW9uIGdldFF1ZXJ5RWxlbWVudCggZWxlbSApIHtcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG4gIHJldHVybiBlbGVtO1xufVxuXG5mdW5jdGlvbiBkb2NSZWFkeSggb25SZWFkeSApIHtcbiAgaWYgKCBkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScgKSB7XG4gICAgb25SZWFkeSgpO1xuICAgIHJldHVybjtcbiAgfVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIG9uUmVhZHkgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBDb2xjYWRlO1xuXG59KSk7XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0dFVF9VUkxfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvZ2V0VXJsLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18gPSBuZXcgVVJMKFwiaW1hZ2VzL2NoZWNrLnBuZ1wiLCBpbXBvcnQubWV0YS51cmwpO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9TW9udHNlcnJhdCZkaXNwbGF5PXN3YXApO1wiXSk7XG52YXIgX19fQ1NTX0xPQURFUl9VUkxfUkVQTEFDRU1FTlRfMF9fXyA9IF9fX0NTU19MT0FERVJfR0VUX1VSTF9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9VUkxfSU1QT1JUXzBfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiOnJvb3Qge1xcbiAgICAtLWNvbG9yLWJsYWNrOiAjMjY0NjUzO1xcbiAgICAtLWNvbG9yLWdyZWVuOiAjMmE5ZDhmO1xcbiAgICAtLWNvbG9yLXllbGxvdzogI2U5YzQ2YTtcXG4gICAgLS1jb2xvci1vcmFuZ2U6ICNmNGEyNjE7XFxuICAgIC0tY29sb3ItcmVkOiAjZTc2ZjUxO1xcbiAgICAtLWJhY2tncm91bmQtY29sb3ItbGlnaHQ6ICNmN2Y3Zjc7XFxuICAgIC0tYmFja2dyb3VuZC1jb2xvci1kYXJrOiAjZWVlO1xcbn1cXG5cXG4qLFxcbio6OmJlZm9yZSxcXG4qOjphZnRlciB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTIwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1Ni43NSU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDgwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1MCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA0My43NSU7XFxuICAgIH1cXG59XFxuXFxuYm9keSB7XFxuICAgIG1pbi1oZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuXFxubGkge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBDb250ZW50ICovXFxuXFxuLmNvbnRlbnQge1xcbiAgICB3aWR0aDogMTEwcmVtO1xcbiAgICBoZWlnaHQ6IDYwcmVtO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gNTRyZW0gM3JlbTtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyMHJlbSAxZnI7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTUwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIHdpZHRoOiAxMDB2dztcXG4gICAgICAgIGhlaWdodDogMTAwdmg7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gMWZyIDNyZW07XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDkwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDIwcmVtO1xcbiAgICB9XFxufVxcblxcbi8qIEhlYWRlciAqL1xcblxcbi5oZWFkZXIge1xcbiAgICBncmlkLXJvdzogMSAvIDI7XFxuICAgIGdyaWQtY29sdW1uOiAxIC8gMztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xcbiAgICBnYXA6MXJlbTtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG59XFxuXFxuLmxvZ28ge1xcbiAgICBoZWlnaHQ6IDU1cHg7XFxuICAgIHdpZHRoOiA1NXB4O1xcbn1cXG5cXG4vKiBTaWRlIEJhciAqL1xcblxcbi5zaWRlLWJhciB7XFxuICAgIGdyaWQtcm93OiAyIC8gMztcXG4gICAgZ3JpZC1jb2x1bW46IDEgLyAyO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItZGFyayk7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgcGFkZGluZzogMnJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA1NTBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDIgLyAzO1xcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgbGVmdDogMTQwcHg7XFxuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbiAgICB9XFxufVxcblxcbi5uYXYge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4ubmF2X19pdGVtIHtcXG4gICAgd2lkdGg6IGF1dG87XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDEuNXJlbTtcXG59XFxuXFxuLm5hdl9faXRlbTpsYXN0LWNoaWxkIHtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubmF2X19pdGVtOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4ubmF2X19pdGVtLS1wcm9qZWN0cyB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLm5hdl9faXRlbS0tcHJvamVjdHMtdGl0bGUge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4gIFxcbi5uYXZfX3NlbGVjdGVkIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4ubmF2X19zZWxlY3RlZDo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG4ucHJvamVjdHMge1xcbiAgICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAtNHJlbTtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgbWF4LWhlaWdodDogMTVyZW07XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIG92ZXJmbG93LXk6IG92ZXJsYXk7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiAgXFxuLnByb2plY3RzX19pdGVtIHtcXG4gICAgcGFkZGluZzogLjRyZW0gLjhyZW07XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuICBcXG4ucHJvamVjdHNfX2l0ZW06aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG5cXG4ucHJvamVjdHNfX2l0ZW06bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgICBcXG4ubmV3LXRvZG8ge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1ib3R0b206IDRweDtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiA1cmVtO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3gtc2hhZG93OiAwLjJyZW0gMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjQpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLm5ldy10b2RvOmFjdGl2ZSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgycHgpO1xcbiAgICBib3gtc2hhZG93OiAwLjFyZW0gMC4zcmVtIDAuNXJlbSByZ2JhKDAsIDAsIDAsIDAuNCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5uZXctdG9kbyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcXG4gICAgfVxcbn1cXG4gIFxcbi5ob21lLWNvdW50LFxcbi50b2RheS1jb3VudCxcXG4ud2Vlay1jb3VudCxcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICB9XFxuICBcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIG1hcmdpbi1yaWdodDogNC42cmVtO1xcbn1cXG4gIFxcbi5wcm9qZWN0LW5hbWUge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIG1heC13aWR0aDogNjAlO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxufVxcbiAgXFxuLnByb2plY3QtY291bnQtY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jdXN0b20tcHJvamVjdC1jb3VudC1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbiNub3Rlcy1uYXYge1xcbiAgICBtYXJnaW4tdG9wOiAtOHB4O1xcbn1cXG4gIFxcbiN3ZWVrLW5hdiB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxcHg7XFxufVxcblxcbi8qIE1haW4gQ29udGFpbmVyICovXFxuXFxuLm1haW5fX2NvbnRhaW5lciB7XFxuICAgIHBhZGRpbmc6IDRyZW07XFxuICAgIHBhZGRpbmctdG9wOiAwO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMDtcXG4gICAgZ3JpZC1yb3c6IDIgLyAzO1xcbiAgICBncmlkLWNvbHVtbjogMiAvIDM7XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBib3JkZXItYm90dG9tOiA0cmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBib3JkZXItdG9wOiA0cmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiAxMDAwcHgpIHtcXG4gICAgLm1haW5fX2NvbnRhaW5lciB7XFxuICAgICAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICAgICAgcGFkZGluZy10b3A6IDA7XFxuICAgICAgICBwYWRkaW5nLWJvdHRvbTogMDtcXG4gICAgICAgIGJvcmRlci1ib3R0b206IDNyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgICAgICBib3JkZXItdG9wOiAzcmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5tYWluX19jb250YWluZXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDEgLyAzO1xcbiAgICB9XFxufVxcblxcbi5tYWluIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcblxcbi8qIE92ZXJsYXkgTmV3ICovXFxuXFxuLm92ZXJsYXktbmV3IHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4ub3ZlcmxheS1uZXctaW52aXNpYmxlIHtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4uY3JlYXRlLW5ldyB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBoZWlnaHQ6IDQwcmVtO1xcbiAgICB3aWR0aDogODByZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjdmN2Y3O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuMDUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3LW9wZW4ge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19jbG9zZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAycmVtO1xcbiAgICByaWdodDogMS4xcmVtO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGxpbmUtaGVpZ2h0OiAxcmVtO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faGVhZGVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faGVhZGluZyB7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgbWFyZ2luLWxlZnQ6IDEuNXJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fc2lkZWJhciB7XFxuICAgIHdpZHRoOiAxMnJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1kYXJrKTtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDUwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3NpZGViYXIge1xcbiAgICAgICAgcGFkZGluZzogLjVyZW07XFxuICAgICAgICB3aWR0aDogMTByZW07XFxuICAgIH1cXG59XFxuICBcXG4uY3JlYXRlLW5ld19fY29udGVudCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGhlaWdodDogY2FsYygxMDAlIC0gNHJlbSk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nLWxlZnQ6IC41cmVtO1xcbiAgICBmb250LXNpemU6IDEuOHJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcyB7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIG1hcmdpbi10b3A6IC41cmVtO1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXM6aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zOmhvdmVyOjpiZWZvcmUge1xcbiAgICBjb250ZW50OiBcXFwiPlxcXCI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMtYWN0aXZlIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmU6OmJlZm9yZSB7XFxuICAgIGNvbnRlbnQ6IFxcXCI+XFxcIjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZW50cnkge1xcbiAgICBmbGV4OiAxO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxufVxcblxcbiNuZXctdG9kby10aXRsZSB7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbn1cXG5cXG4uY3JlYXRlLW5ld19faW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7ICAgIFxcbiAgICByZXNpemU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2lucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faW5wdXQtYmlnIHtcXG4gICAgaGVpZ2h0OiAxMnJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogYXV0bztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19kYXRlLXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19kYXRlLWlucHV0IHtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtaW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X193cmFwcGVyLXByaW9yaXR5LXN1Ym1pdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDAwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIH1cXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHkge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS10aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi42cmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eSBpbnB1dFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBsZWZ0OiAyLjJyZW07XFxuICAgIGhlaWdodDogMXB4O1xcbiAgICB3aWR0aDogMXB4O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0biB7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgbWFyZ2luOiAwIDEuNXJlbSAwIC01cHg7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bjpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1sb3cge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbG93OmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWxvdy1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1tZWRpdW0ge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1tZWRpdW06aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bS1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaCB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLXJlZCk7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWhpZ2g6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWhpZ2gtYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItcmVkKTtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdDpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNiYTM5NTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fdG9kby1zdWJtaXQ6YWN0aXZlIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDAwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0IHtcXG4gICAgICAgIG1hcmdpbi10b3A6IDhweDtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0IHtcXG4gICAgZmxleDogMTtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3QtaW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogJ01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO1xcbiAgICByZXNpemU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3QtaW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxLjFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdDpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNiYTM5NTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1zdWJtaXQ6YWN0aXZlIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBkaXNwbGF5OiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgcmVzaXplOiBub25lO1xcbn1cXG5cXG4jbmV3LW5vdGUtdGl0bGUge1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtaW5wdXQtYmlnIHtcXG4gICAgaGVpZ2h0OiAxMnJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogYXV0bztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBmb250LXNpemU6IDEuMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG5cXG4vKiBUb2RvIE1haW4gKi9cXG5cXG4udG9kbyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VlZTtcXG59XFxuLnRvZG8tY2hlY2tlZCB7XFxuICAgIG9wYWNpdHk6MC40O1xcbn1cXG4gIFxcbi50b2RvX190aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbn1cXG4gIFxcbi50b2RvX190aXRsZS1jaGVja2VkIHtcXG4gICAgY29sb3I6ICM4ZDhkOGQ7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWwge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIG1hcmdpbi1yaWdodDogMi41cmVtO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4udG9kb19fZGV0YWlsOmhvdmVyIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLnRvZG9fX2RldGFpbC1jaGVja2VkIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxuICAgIGNvbG9yOiByZ2JhKDU5LCAxNjMsIDE0OSwgMC41KTtcXG59XFxuICBcXG4udG9kb19fZGV0YWlsLWNoZWNrZWQ6aG92ZXIge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDU5LCAxNjMsIDE0OSwgMCk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTksIDE2MywgMTQ5LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19kYXRlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogNC41cmVtO1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbn1cXG4gIFxcbi50b2RvX19kYXRlLWNoZWNrZWQge1xcbiAgICBjb2xvcjogcmdiYSg4MCwgMzEsIDU4LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19jb21wbGV0ZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjM2JhMzk1O1xcbn1cXG4gIFxcbi50b2RvX19jb21wbGV0ZS1jaGVja2VkIHtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICBiYWNrZ3JvdW5kOiB1cmwoXCIgKyBfX19DU1NfTE9BREVSX1VSTF9SRVBMQUNFTUVOVF8wX19fICsgXCIpLCAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47XFxufVxcbiAgXFxuLnRvZG9fX2ljb24ge1xcbiAgICB3aWR0aDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgZmlsbDogIzUwMWYzYTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbn1cXG4gIFxcbi50b2RvX19pY29uLWVkaXQge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDJyZW07XFxufVxcbiAgXFxuLnRvZG9fX2ljb246aG92ZXIge1xcbiAgICBmaWxsOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi50b2RvX19pY29uLWNoZWNrZWQge1xcbiAgICBmaWxsOiByZ2JhKDgwLCAzMSwgNTgsIDAuNCk7XFxuICAgIG9wYWNpdHk6IDAuNTtcXG59XFxuICBcXG4udG9kb19faWNvbi1jaGVja2VkOmhvdmVyIHtcXG4gICAgZmlsbDogcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxufVxcbiAgXFxuLnRvZG86aG92ZXIge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMDAzKTtcXG4gICAgdHJhbnNmb3JtLW9yaWdpbjogNTAlIDUwJTtcXG4gICAgYm94LXNoYWRvdzogM3B4IDNweCA1cHggMnB4IHJnYmEoMCwgMCwgMCwgMC4yKTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4ycyBlYXNlLW91dDtcXG59XFxuICBcXG4ucHJpb3JpdHktbG93IHtcXG4gICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCBncmVlbjtcXG59XFxuICBcXG4ucHJpb3JpdHktbWVkaXVtIHtcXG4gICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCBvcmFuZ2U7XFxufVxcbiAgXFxuLnByaW9yaXR5LWhpZ2gge1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHJlZDtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDJyZW07XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2hlYWRpbmcge1xcbiAgICBtYXJnaW4tYm90dG9tOiAyLjVyZW07XFxuICAgIGZvbnQtc2l6ZTogMi44cmVtO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19jb250ZW50IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC10ZXh0IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG4ge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzUwMWYzYTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudC1idG46aG92ZXIge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICM1MDFmM2E7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG59XFxuXFxuLyogT3ZlcmxheSBEZXRhaWwgKi9cXG5cXG4ub3ZlcmxheS1kZXRhaWxzIHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59IFxcbiAgIFxcbi5vdmVybGF5LWRldGFpbHMtaW52aXNpYmxlIHtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4uZGV0YWlscy1wb3B1cCB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDYwcmVtO1xcbiAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIGJveC1zaGFkb3c6IDAgMnJlbSA0cmVtIHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSk7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC4wNSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwLW9wZW4ge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cCA+ICo6bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IC44cmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fY2F0YWdvcnkge1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3RpdGxlIHtcXG4gICAgZm9udC1zaXplOiAzLjRyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XFxuICAgIG1hcmdpbi1ib3R0b206IDEuM3JlbSAhaW1wb3J0YW50O1xcbiAgICBjb2xvcjogIzUwMWYzYTtcXG4gICAgbGluZS1oZWlnaHQ6IDE7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kZXRhaWxzIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2RldGFpbHMtdGl0bGUge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDIuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2RldGFpbHMtdGV4dCB7XFxuICAgIGZvbnQtd2VpZ2h0OiBub3JtYWwgIWltcG9ydGFudDtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3Byb2plY3QgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjRyZW07XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kdWUgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuOXJlbTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX3ByaW9yaXR5IC5kZXRhaWxzLXBvcHVwX19jYXRhZ29yeSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi4xcmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fY2xvc2Uge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogLjRyZW07XFxuICAgIHJpZ2h0OiAxcmVtO1xcbiAgICBmb250LXNpemU6IDNyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiAxO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICB9XFxuXFxuXFxuLyogT3ZlcmxheSBFZGl0ICovXFxuXFxuLm92ZXJsYXktZWRpdCB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBwYWRkaW5nOiAxMHB4O1xcbiAgICB3aWR0aDogMTAwdnc7XFxuICAgIGhlaWdodDogMTAwdmg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgICBcXG4ub3ZlcmxheS1lZGl0LWludmlzaWJsZSB7XFxuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3BhY2l0eTogMDtcXG59XFxuXFxuLmVkaXQtcG9wdXAge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgaGVpZ2h0OiAyNnJlbTtcXG4gICAgd2lkdGg6IDU1cmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiA0cHg7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIGJveC1zaGFkb3c6IDAgMnJlbSA0cmVtIHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2Y3ZjdmNztcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjA1KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXAtb3BlbiB7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19jbG9zZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAxLjRyZW07XFxuICAgIHJpZ2h0OiAxLjFyZW07XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBsaW5lLWhlaWdodDogMXJlbTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19lbnRyeSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGJvcmRlci1sZWZ0OiAxcHggc29saWQgI2I5YjliOTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6IGxhdG8sIHNhbnMtc2VyaWY7XFxuICAgIHJlc2l6ZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2lucHV0LWJpZyB7XFxuICAgIGhlaWdodDogMTJyZW07XFxuICAgIG1hcmdpbi1ib3R0b206IGF1dG87XFxuICAgIGZvbnQtc2l6ZTogMS40cmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19kYXRlLXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dCB7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtZmFtaWx5OiBsYXRvLCBzYW5zLXNlcmlmO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX193cmFwcGVyLXByaW9yaXR5LXN1Ym1pdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5LXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjZyZW07XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eSBpbnB1dFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBsZWZ0OiAyLjJyZW07XFxuICAgIGhlaWdodDogMXB4O1xcbiAgICB3aWR0aDogMXB4O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIG9wYWNpdHk6IDA7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4ge1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIG1hcmdpbjogMCAxLjVyZW0gMCAtNXB4O1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuOmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgfVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93IHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWxvdzpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1sb3ctYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgb3JhbmdlO1xcbiAgICBjb2xvcjogb3JhbmdlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLW1lZGl1bTpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IG9yYW5nZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW0tYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0taGlnaCB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJlZDtcXG4gICAgY29sb3I6IHJlZDtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoOmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWhpZ2gtYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3RvZG8tc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXI7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fdG9kby1zdWJtaXQ6aG92ZXIge1xcbiAgICBjb2xvcjogd2hpdGU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMzYmEzOTU7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3RvZG8tc3VibWl0OmFjdGl2ZSB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLyogRm9vdGVyICovXFxuXFxuLmZvb3RlciB7XFxuICAgIGdyaWQtcm93OiAtMSAvIC0yO1xcbiAgICBncmlkLWNvbHVtbjogMSAvIC0xO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgZ2FwOiAxcmVtO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWNvbG9yLW9yYW5nZSk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLW9yYW5nZSk7XFxufVxcblxcbi5mYS1naXRodWIge1xcbiAgICBmb250LXNpemU6IDJyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxufVxcblxcbi5mYS1naXRodWI6aG92ZXIge1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBRUE7SUFDSSxzQkFBc0I7SUFDdEIsc0JBQXNCO0lBQ3RCLHVCQUF1QjtJQUN2Qix1QkFBdUI7SUFDdkIsb0JBQW9CO0lBQ3BCLGlDQUFpQztJQUNqQyw2QkFBNkI7QUFDakM7O0FBRUE7OztJQUdJLFNBQVM7SUFDVCxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixlQUFlO0FBQ25COztBQUVBO0lBQ0k7UUFDSSxnQkFBZ0I7SUFDcEI7QUFDSjs7QUFFQTtJQUNJO1FBQ0ks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WUFBWTtFQUNkOztBQUVGO0lBQ0ksb0NBQW9DO0lBQ3BDLHlCQUF5QjtBQUM3Qjs7QUFFQTtJQUNJLG9DQUFvQztBQUN4Qzs7QUFFQTtJQUNJLG9DQUFvQztJQUNwQyxZQUFZO0FBQ2hCOztBQUVBO0lBQ0ksd0JBQXdCO0lBQ3hCLGFBQWE7QUFDakI7O0FBRUE7SUFDSSx3QkFBd0I7QUFDNUI7O0FBRUE7SUFDSSx3QkFBd0I7SUFDeEIsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLHFCQUFxQjtJQUNyQixVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxxQkFBcUI7QUFDekI7O0FBRUE7SUFDSSxxQkFBcUI7SUFDckIsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIsZUFBZTtJQUNmLHlCQUF5QjtJQUN6QixnQkFBZ0I7SUFDaEIsY0FBYztJQUNkLDZCQUE2QjtJQUM3QixlQUFlO0lBQ2YsbUJBQW1CO0FBQ3ZCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLHlCQUF5QjtBQUM3Qjs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUEsV0FBVzs7QUFFWDtJQUNJLGlCQUFpQjtJQUNqQixtQkFBbUI7SUFDbkIsYUFBYTtJQUNiLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsU0FBUztJQUNULFdBQVc7SUFDWCxhQUFhO0lBQ2IseUNBQXlDO0lBQ3pDLHFDQUFxQztBQUN6Qzs7QUFFQTtJQUNJLGVBQWU7SUFDZix5QkFBeUI7QUFDN0I7O0FBRUE7SUFDSSxZQUFZO0FBQ2hCXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU1vbnRzZXJyYXQmZGlzcGxheT1zd2FwJyk7XFxuXFxuOnJvb3Qge1xcbiAgICAtLWNvbG9yLWJsYWNrOiAjMjY0NjUzO1xcbiAgICAtLWNvbG9yLWdyZWVuOiAjMmE5ZDhmO1xcbiAgICAtLWNvbG9yLXllbGxvdzogI2U5YzQ2YTtcXG4gICAgLS1jb2xvci1vcmFuZ2U6ICNmNGEyNjE7XFxuICAgIC0tY29sb3ItcmVkOiAjZTc2ZjUxO1xcbiAgICAtLWJhY2tncm91bmQtY29sb3ItbGlnaHQ6ICNmN2Y3Zjc7XFxuICAgIC0tYmFja2dyb3VuZC1jb2xvci1kYXJrOiAjZWVlO1xcbn1cXG5cXG4qLFxcbio6OmJlZm9yZSxcXG4qOjphZnRlciB7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG59XFxuXFxuaHRtbCB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcXG4gICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTIwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA2Mi41JTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1Ni43NSU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDgwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA1MCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIGh0bWwge1xcbiAgICAgICAgZm9udC1zaXplOiA0My43NSU7XFxuICAgIH1cXG59XFxuXFxuYm9keSB7XFxuICAgIG1pbi1oZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuXFxubGkge1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBDb250ZW50ICovXFxuXFxuLmNvbnRlbnQge1xcbiAgICB3aWR0aDogMTEwcmVtO1xcbiAgICBoZWlnaHQ6IDYwcmVtO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gNTRyZW0gM3JlbTtcXG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAyMHJlbSAxZnI7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG5cXG5AbWVkaWEgKG1heC13aWR0aDogMTUwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIHdpZHRoOiAxMDB2dztcXG4gICAgICAgIGhlaWdodDogMTAwdmg7XFxuICAgICAgICBncmlkLXRlbXBsYXRlLXJvd3M6IDZyZW0gMWZyIDNyZW07XFxuICAgIH1cXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogMTAwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDkwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMjByZW0gMWZyO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5jb250ZW50IHtcXG4gICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDIwcmVtO1xcbiAgICB9XFxufVxcblxcbi8qIEhlYWRlciAqL1xcblxcbi5oZWFkZXIge1xcbiAgICBncmlkLXJvdzogMSAvIDI7XFxuICAgIGdyaWQtY29sdW1uOiAxIC8gMztcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0O1xcbiAgICBnYXA6MXJlbTtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1sZWZ0OiAycmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG59XFxuXFxuLmxvZ28ge1xcbiAgICBoZWlnaHQ6IDU1cHg7XFxuICAgIHdpZHRoOiA1NXB4O1xcbn1cXG5cXG4vKiBTaWRlIEJhciAqL1xcblxcbi5zaWRlLWJhciB7XFxuICAgIGdyaWQtcm93OiAyIC8gMztcXG4gICAgZ3JpZC1jb2x1bW46IDEgLyAyO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItZGFyayk7XFxuICAgIHotaW5kZXg6IDE7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgcGFkZGluZzogMnJlbTtcXG4gICAgfVxcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiA1NTBweCkge1xcbiAgICAuc2lkZS1iYXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDIgLyAzO1xcbiAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICAgICAgYm9yZGVyLXJpZ2h0OiBub25lO1xcbiAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgICAgbGVmdDogMTQwcHg7XFxuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgLjJzO1xcbiAgICB9XFxufVxcblxcbi5uYXYge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4ubmF2X19pdGVtIHtcXG4gICAgd2lkdGg6IGF1dG87XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxuICAgIHBhZGRpbmc6IC41cmVtIDEuNXJlbTtcXG59XFxuXFxuLm5hdl9faXRlbTpsYXN0LWNoaWxkIHtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ubmF2X19pdGVtOmhvdmVyIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4ubmF2X19pdGVtLS1wcm9qZWN0cyB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgXFxuLm5hdl9faXRlbS0tcHJvamVjdHMtdGl0bGUge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG4gIFxcbi5uYXZfX3NlbGVjdGVkIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4ubmF2X19zZWxlY3RlZDo6YmVmb3JlIHtcXG4gICAgY29udGVudDogXFxcIj5cXFwiO1xcbiAgICBtYXJnaW4tcmlnaHQ6IC43cmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbn1cXG5cXG4ucHJvamVjdHMge1xcbiAgICBtYXJnaW4tbGVmdDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiAtNHJlbTtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgbWF4LWhlaWdodDogMTVyZW07XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIG92ZXJmbG93LXk6IG92ZXJsYXk7XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG4gICAgZm9udC1zaXplOiAxLjdyZW07XFxufVxcbiAgXFxuLnByb2plY3RzX19pdGVtIHtcXG4gICAgcGFkZGluZzogLjRyZW0gLjhyZW07XFxuICAgIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XFxuICAgIHdvcmQtd3JhcDogYnJlYWstd29yZDtcXG59XFxuICBcXG4ucHJvamVjdHNfX2l0ZW06aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG5cXG4ucHJvamVjdHNfX2l0ZW06bm90KDpsYXN0LWNoaWxkKSB7XFxuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XFxufVxcbiAgICBcXG4ubmV3LXRvZG8ge1xcbiAgICBoZWlnaHQ6IDVyZW07XFxuICAgIHdpZHRoOiA1cmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgcGFkZGluZy1ib3R0b206IDRweDtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGxpbmUtaGVpZ2h0OiA1cmVtO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3gtc2hhZG93OiAwLjJyZW0gMC41cmVtIDFyZW0gcmdiYSgwLCAwLCAwLCAwLjQpO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLm5ldy10b2RvOmFjdGl2ZSB7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgycHgpO1xcbiAgICBib3gtc2hhZG93OiAwLjFyZW0gMC4zcmVtIDAuNXJlbSByZ2JhKDAsIDAsIDAsIDAuNCk7XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5uZXctdG9kbyB7XFxuICAgICAgICBtYXJnaW4tbGVmdDogYXV0bztcXG4gICAgfVxcbn1cXG4gIFxcbi5ob21lLWNvdW50LFxcbi50b2RheS1jb3VudCxcXG4ud2Vlay1jb3VudCxcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIHdpZHRoOiAycmVtO1xcbiAgICBoZWlnaHQ6IDJyZW07XFxuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICBmb250LXNpemU6IDEuM3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxuICB9XFxuICBcXG4ucHJvamVjdC1jb3VudCB7XFxuICAgIG1hcmdpbi1yaWdodDogNC42cmVtO1xcbn1cXG4gIFxcbi5wcm9qZWN0LW5hbWUge1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIG1heC13aWR0aDogNjAlO1xcbiAgICBtYXJnaW4tcmlnaHQ6IGF1dG87XFxufVxcbiAgXFxuLnByb2plY3QtY291bnQtY29udGFpbmVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jdXN0b20tcHJvamVjdC1jb3VudC1jb250YWluZXIge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbiNub3Rlcy1uYXYge1xcbiAgICBtYXJnaW4tdG9wOiAtOHB4O1xcbn1cXG4gIFxcbiN3ZWVrLW5hdiB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxcHg7XFxufVxcblxcbi8qIE1haW4gQ29udGFpbmVyICovXFxuXFxuLm1haW5fX2NvbnRhaW5lciB7XFxuICAgIHBhZGRpbmc6IDRyZW07XFxuICAgIHBhZGRpbmctdG9wOiAwO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMDtcXG4gICAgZ3JpZC1yb3c6IDIgLyAzO1xcbiAgICBncmlkLWNvbHVtbjogMiAvIDM7XFxuICAgIG92ZXJmbG93LXk6IGF1dG87XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBib3JkZXItYm90dG9tOiA0cmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICBib3JkZXItdG9wOiA0cmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbkBtZWRpYSAobWF4LXdpZHRoOiAxMDAwcHgpIHtcXG4gICAgLm1haW5fX2NvbnRhaW5lciB7XFxuICAgICAgICBwYWRkaW5nOiAzcmVtO1xcbiAgICAgICAgcGFkZGluZy10b3A6IDA7XFxuICAgICAgICBwYWRkaW5nLWJvdHRvbTogMDtcXG4gICAgICAgIGJvcmRlci1ib3R0b206IDNyZW0gc29saWQgdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgICAgICBib3JkZXItdG9wOiAzcmVtIHNvbGlkIHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbiAgICB9XFxufVxcbiAgXFxuQG1lZGlhIChtYXgtd2lkdGg6IDU1MHB4KSB7XFxuICAgIC5tYWluX19jb250YWluZXIge1xcbiAgICAgICAgZ3JpZC1jb2x1bW46IDEgLyAzO1xcbiAgICB9XFxufVxcblxcbi5tYWluIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcblxcbi8qIE92ZXJsYXkgTmV3ICovXFxuXFxuLm92ZXJsYXktbmV3IHtcXG4gICAgei1pbmRleDogMjtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHBhZGRpbmc6IDEwcHg7XFxuICAgIHdpZHRoOiAxMDB2dztcXG4gICAgaGVpZ2h0OiAxMDB2aDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC42KTtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4ub3ZlcmxheS1uZXctaW52aXNpYmxlIHtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBvcGFjaXR5OiAwO1xcbn1cXG5cXG4uY3JlYXRlLW5ldyB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICBoZWlnaHQ6IDQwcmVtO1xcbiAgICB3aWR0aDogODByZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgYm94LXNoYWRvdzogMCAycmVtIDRyZW0gcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjdmN2Y3O1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuMDUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3LW9wZW4ge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19jbG9zZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAycmVtO1xcbiAgICByaWdodDogMS4xcmVtO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxuICAgIGxpbmUtaGVpZ2h0OiAxcmVtO1xcbiAgICBmb250LXNpemU6IDVyZW07XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faGVhZGVyIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaGVpZ2h0OiA1cmVtO1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tY29sb3Itb3JhbmdlKTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3Itb3JhbmdlKTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faGVhZGluZyB7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG4gICAgbWFyZ2luLWxlZnQ6IDEuNXJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fc2lkZWJhciB7XFxuICAgIHdpZHRoOiAxMnJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1kYXJrKTtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDUwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3NpZGViYXIge1xcbiAgICAgICAgcGFkZGluZzogLjVyZW07XFxuICAgICAgICB3aWR0aDogMTByZW07XFxuICAgIH1cXG59XFxuICBcXG4uY3JlYXRlLW5ld19fY29udGVudCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGhlaWdodDogY2FsYygxMDAlIC0gNHJlbSk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LXN0YXJ0O1xcbiAgICBwYWRkaW5nLWxlZnQ6IC41cmVtO1xcbiAgICBmb250LXNpemU6IDEuOHJlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcyB7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIG1hcmdpbi10b3A6IC41cmVtO1xcbiAgICBib3JkZXItbGVmdDogM3B4IHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXM6aG92ZXIge1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zOmhvdmVyOjpiZWZvcmUge1xcbiAgICBjb250ZW50OiBcXFwiPlxcXCI7XFxuICAgIG1hcmdpbi1yaWdodDogLjdyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMtYWN0aXZlIHtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmU6OmJlZm9yZSB7XFxuICAgIGNvbnRlbnQ6IFxcXCI+XFxcIjtcXG4gICAgbWFyZ2luLXJpZ2h0OiAuN3JlbTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fZW50cnkge1xcbiAgICBmbGV4OiAxO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxufVxcblxcbiNuZXctdG9kby10aXRsZSB7XFxuICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBtYXJnaW4tYm90dG9tOiAycmVtO1xcbn1cXG5cXG4uY3JlYXRlLW5ld19faW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWJsYWNrKTtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7ICAgIFxcbiAgICByZXNpemU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2lucHV0OmZvY3VzIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19faW5wdXQtYmlnIHtcXG4gICAgaGVpZ2h0OiAxMnJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogYXV0bztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19kYXRlLXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19kYXRlLWlucHV0IHtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tY29sb3ItYmxhY2spO1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ibGFjayk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtZmFtaWx5OiAnTW9udHNlcnJhdCcsIHNhbnMtc2VyaWY7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX2RhdGUtaW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X193cmFwcGVyLXByaW9yaXR5LXN1Ym1pdCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDAwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3dyYXBwZXItcHJpb3JpdHktc3VibWl0IHtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIH1cXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHkge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS10aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi42cmVtO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eSBpbnB1dFt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBsZWZ0OiAyLjJyZW07XFxuICAgIGhlaWdodDogMXB4O1xcbiAgICB3aWR0aDogMXB4O1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICBtYXJnaW46IDA7XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0biB7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgbWFyZ2luOiAwIDEuNXJlbSAwIC01cHg7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bjpob3ZlciB7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1sb3cge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tbG93OmhvdmVyIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWxvdy1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxuICAgIGNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yLWxpZ2h0KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1tZWRpdW0ge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3IteWVsbG93KTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuLS1tZWRpdW06aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLW1lZGl1bS1hY3RpdmUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci15ZWxsb3cpO1xcbiAgICBjb2xvcjogdmFyKC0tYmFja2dyb3VuZC1jb2xvci1saWdodCk7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0taGlnaCB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLXJlZCk7XFxuICAgIGNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWhpZ2g6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1yZWQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLWhpZ2gtYWN0aXZlIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tY29sb3ItcmVkKTtcXG4gICAgY29sb3I6IHZhcigtLWJhY2tncm91bmQtY29sb3ItbGlnaHQpO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGZvbnQtc2l6ZTogMS4xcmVtO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItZ3JlZW4pO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X190b2RvLXN1Ym1pdDpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNiYTM5NTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fdG9kby1zdWJtaXQ6YWN0aXZlIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG5AbWVkaWEgKG1heC13aWR0aDogNDAwcHgpIHtcXG4gICAgLmNyZWF0ZS1uZXdfX3RvZG8tc3VibWl0IHtcXG4gICAgICAgIG1hcmdpbi10b3A6IDhweDtcXG4gICAgfVxcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0IHtcXG4gICAgZmxleDogMTtcXG4gICAgcGFkZGluZzogMnJlbTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3QtaW5wdXQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgYm9yZGVyOiBub25lO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY29sb3I6ICMxNDE0MTQ7XFxuICAgIGZvbnQtc2l6ZTogMS42cmVtO1xcbiAgICBmb250LWZhbWlseTogJ01vbnRzZXJyYXQnLCBzYW5zLXNlcmlmO1xcbiAgICByZXNpemU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX3Byb2plY3QtaW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzNiYTM5NTtcXG4gICAgZm9udC1zaXplOiAxLjFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdDpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzNiYTM5NTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fcHJvamVjdC1zdWJtaXQ6YWN0aXZlIHtcXG4gICAgb3V0bGluZTogbm9uZTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZSB7XFxuICAgIGZsZXg6IDE7XFxuICAgIHBhZGRpbmc6IDJyZW07XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjYjliOWI5O1xcbiAgICBkaXNwbGF5OiBub25lO1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLWlucHV0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGNvbG9yOiAjMTQxNDE0O1xcbiAgICBmb250LXNpemU6IDEuNnJlbTtcXG4gICAgZm9udC1mYW1pbHk6ICdNb250c2VycmF0Jywgc2Fucy1zZXJpZjtcXG4gICAgcmVzaXplOiBub25lO1xcbn1cXG5cXG4jbmV3LW5vdGUtdGl0bGUge1xcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2I5YjliOTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMnJlbTtcXG59XFxuICBcXG4uY3JlYXRlLW5ld19fbm90ZS1pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtaW5wdXQtYmlnIHtcXG4gICAgaGVpZ2h0OiAxMnJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogYXV0bztcXG4gICAgZm9udC1zaXplOiAxLjRyZW07XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0IHtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBhbGlnbi1zZWxmOiBmbGV4LWVuZDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBmb250LXNpemU6IDEuMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmNyZWF0ZS1uZXdfX25vdGUtc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5jcmVhdGUtbmV3X19ub3RlLXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG5cXG4vKiBUb2RvIE1haW4gKi9cXG5cXG4udG9kbyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGhlaWdodDogNHJlbTtcXG4gICAgcGFkZGluZzogMXJlbTtcXG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2VlZTtcXG59XFxuLnRvZG8tY2hlY2tlZCB7XFxuICAgIG9wYWNpdHk6MC40O1xcbn1cXG4gIFxcbi50b2RvX190aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMnJlbTtcXG4gICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xcbiAgICBmb250LXdlaWdodDogMzAwO1xcbn1cXG4gIFxcbi50b2RvX190aXRsZS1jaGVja2VkIHtcXG4gICAgY29sb3I6ICM4ZDhkOGQ7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO1xcbn1cXG4gIFxcbi50b2RvX19kZXRhaWwge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIG1hcmdpbi1yaWdodDogMi41cmVtO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG59XFxuICBcXG4udG9kb19fZGV0YWlsOmhvdmVyIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcbiAgXFxuLnRvZG9fX2RldGFpbC1jaGVja2VkIHtcXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg1OSwgMTYzLCAxNDksIDAuNSk7XFxuICAgIGNvbG9yOiByZ2JhKDU5LCAxNjMsIDE0OSwgMC41KTtcXG59XFxuICBcXG4udG9kb19fZGV0YWlsLWNoZWNrZWQ6aG92ZXIge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDU5LCAxNjMsIDE0OSwgMCk7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTksIDE2MywgMTQ5LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19kYXRlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbiAgICB3aWR0aDogNC41cmVtO1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbn1cXG4gIFxcbi50b2RvX19kYXRlLWNoZWNrZWQge1xcbiAgICBjb2xvcjogcmdiYSg4MCwgMzEsIDU4LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvX19jb21wbGV0ZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMS41cmVtO1xcbiAgICBoZWlnaHQ6IDEuNXJlbTtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjM2JhMzk1O1xcbn1cXG4gIFxcbi50b2RvX19jb21wbGV0ZS1jaGVja2VkIHtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxuICAgIHdpZHRoOiAxLjVyZW07XFxuICAgIGRpc3BsYXk6IGJsb2NrO1xcbiAgICBiYWNrZ3JvdW5kOiB1cmwoXFxcImltYWdlcy9jaGVjay5wbmdcXFwiKSwgIzNiYTM5NTtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1zaXplOiBjb250YWluO1xcbn1cXG4gIFxcbi50b2RvX19pY29uIHtcXG4gICAgd2lkdGg6IDEuNXJlbTtcXG4gICAgaGVpZ2h0OiAxLjVyZW07XFxuICAgIGZpbGw6ICM1MDFmM2E7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4ycztcXG59XFxuICBcXG4udG9kb19faWNvbi1lZGl0IHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAycmVtO1xcbn1cXG4gIFxcbi50b2RvX19pY29uOmhvdmVyIHtcXG4gICAgZmlsbDogIzNiYTM5NTtcXG59XFxuICBcXG4udG9kb19faWNvbi1jaGVja2VkIHtcXG4gICAgZmlsbDogcmdiYSg4MCwgMzEsIDU4LCAwLjQpO1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVxcbiAgXFxuLnRvZG9fX2ljb24tY2hlY2tlZDpob3ZlciB7XFxuICAgIGZpbGw6IHJnYmEoNTksIDE2MywgMTQ5LCAwLjUpO1xcbn1cXG4gIFxcbi50b2RvOmhvdmVyIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjAwMyk7XFxuICAgIHRyYW5zZm9ybS1vcmlnaW46IDUwJSA1MCU7XFxuICAgIGJveC1zaGFkb3c6IDNweCAzcHggNXB4IDJweCByZ2JhKDAsIDAsIDAsIDAuMik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuMnMgZWFzZS1vdXQ7XFxufVxcbiAgXFxuLnByaW9yaXR5LWxvdyB7XFxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgZ3JlZW47XFxufVxcbiAgXFxuLnByaW9yaXR5LW1lZGl1bSB7XFxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgb3JhbmdlO1xcbn1cXG4gIFxcbi5wcmlvcml0eS1oaWdoIHtcXG4gICAgYm9yZGVyLWxlZnQ6IDNweCBzb2xpZCByZWQ7XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmUge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBjb2xvcjogIzE0MTQxNDtcXG4gICAgZm9udC1zaXplOiAycmVtO1xcbn1cXG4gIFxcbi5hZGQtb3ItcmVtb3ZlX19oZWFkaW5nIHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMi41cmVtO1xcbiAgICBmb250LXNpemU6IDIuOHJlbTtcXG59XFxuICBcXG4uYWRkLW9yLXJlbW92ZV9fY29udGVudCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2NvbnRlbnQtdGV4dCB7XFxuICAgIG1hcmdpbi1ib3R0b206IDJyZW07XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2NvbnRlbnQtYnRuIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICAgIHBhZGRpbmc6IC41cmVtIDFyZW07XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICM1MDFmM2E7XFxuICAgIGJvcmRlci1yYWRpdXM6IDNweDtcXG4gICAgZm9udC1zaXplOiAxLjNyZW07XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmFkZC1vci1yZW1vdmVfX2NvbnRlbnQtYnRuOmhvdmVyIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNTAxZjNhO1xcbiAgICBjb2xvcjogd2hpdGU7XFxufVxcblxcbi8qIE92ZXJsYXkgRGV0YWlsICovXFxuXFxuLm92ZXJsYXktZGV0YWlscyB7XFxuICAgIHotaW5kZXg6IDI7XFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcXG4gICAgdG9wOiAwO1xcbiAgICBsZWZ0OiAwO1xcbiAgICBwYWRkaW5nOiAxMHB4O1xcbiAgICB3aWR0aDogMTAwdnc7XFxuICAgIGhlaWdodDogMTAwdmg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufSBcXG4gICBcXG4ub3ZlcmxheS1kZXRhaWxzLWludmlzaWJsZSB7XFxuICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgb3BhY2l0eTogMDtcXG59XFxuXFxuLmRldGFpbHMtcG9wdXAge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiA2MHJlbTtcXG4gICAgcGFkZGluZzogM3JlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBib3gtc2hhZG93OiAwIDJyZW0gNHJlbSByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIGNvbG9yOiAjNTAxZjNhO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUpO1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuMDUpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cC1vcGVuIHtcXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xcbiAgICBtYXJnaW4tYm90dG9tOiAuOHJlbTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2NhdGFnb3J5IHtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX190aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMy40cmVtO1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxLjNyZW0gIWltcG9ydGFudDtcXG4gICAgY29sb3I6ICM1MDFmM2E7XFxuICAgIGxpbmUtaGVpZ2h0OiAxO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fZGV0YWlscyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kZXRhaWxzLXRpdGxlIHtcXG4gICAgbWFyZ2luLXJpZ2h0OiAyLjdyZW07XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19kZXRhaWxzLXRleHQge1xcbiAgICBmb250LXdlaWdodDogbm9ybWFsICFpbXBvcnRhbnQ7XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19wcm9qZWN0IC5kZXRhaWxzLXBvcHVwX19jYXRhZ29yeSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi40cmVtO1xcbiAgfVxcbiAgXFxuICAuZGV0YWlscy1wb3B1cF9fZHVlIC5kZXRhaWxzLXBvcHVwX19jYXRhZ29yeSB7XFxuICAgIG1hcmdpbi1yaWdodDogLjlyZW07XFxuICB9XFxuICBcXG4gIC5kZXRhaWxzLXBvcHVwX19wcmlvcml0eSAuZGV0YWlscy1wb3B1cF9fY2F0YWdvcnkge1xcbiAgICBtYXJnaW4tcmlnaHQ6IDIuMXJlbTtcXG4gIH1cXG4gIFxcbiAgLmRldGFpbHMtcG9wdXBfX2Nsb3NlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IC40cmVtO1xcbiAgICByaWdodDogMXJlbTtcXG4gICAgZm9udC1zaXplOiAzcmVtO1xcbiAgICBsaW5lLWhlaWdodDogMTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgfVxcblxcblxcbi8qIE92ZXJsYXkgRWRpdCAqL1xcblxcbi5vdmVybGF5LWVkaXQge1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogZml4ZWQ7XFxuICAgIHRvcDogMDtcXG4gICAgbGVmdDogMDtcXG4gICAgcGFkZGluZzogMTBweDtcXG4gICAgd2lkdGg6IDEwMHZ3O1xcbiAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gICAgb3BhY2l0eTogMTtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjYpO1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbn1cXG4gICAgXFxuLm92ZXJsYXktZWRpdC1pbnZpc2libGUge1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIG9wYWNpdHk6IDA7XFxufVxcblxcbi5lZGl0LXBvcHVwIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB2aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIGhlaWdodDogMjZyZW07XFxuICAgIHdpZHRoOiA1NXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogNHB4O1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBib3gtc2hhZG93OiAwIDJyZW0gNHJlbSByZ2JhKDAsIDAsIDAsIDAuNik7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmN2Y3Zjc7XFxuICAgIHRyYW5zZm9ybTogc2NhbGUoMC4wNSk7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwLW9wZW4ge1xcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fY2xvc2Uge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMS40cmVtO1xcbiAgICByaWdodDogMS4xcmVtO1xcbiAgICBjb2xvcjogIzNiYTM5NTtcXG4gICAgbGluZS1oZWlnaHQ6IDFyZW07XFxuICAgIGZvbnQtc2l6ZTogM3JlbTtcXG4gICAgY3Vyc29yOiBwb2ludGVyO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZW50cnkge1xcbiAgICBmbGV4OiAxO1xcbiAgICBwYWRkaW5nOiAycmVtO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNiOWI5Yjk7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19pbnB1dCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjb2xvcjogIzE0MTQxNDtcXG4gICAgZm9udC1zaXplOiAxLjZyZW07XFxuICAgIGZvbnQtZmFtaWx5OiBsYXRvLCBzYW5zLXNlcmlmO1xcbiAgICByZXNpemU6IG5vbmU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19pbnB1dDpmb2N1cyB7XFxuICAgIG91dGxpbmU6IG5vbmU7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19pbnB1dC1iaWcge1xcbiAgICBoZWlnaHQ6IDEycmVtO1xcbiAgICBtYXJnaW4tYm90dG9tOiBhdXRvO1xcbiAgICBmb250LXNpemU6IDEuNHJlbTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2RhdGUge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBtYXJnaW4tYm90dG9tOiAxcmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fZGF0ZS10aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2RhdGUtaW5wdXQge1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjM2JhMzk1O1xcbiAgICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICAgIGNvbG9yOiAjM2JhMzk1O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgZm9udC1zaXplOiAxcmVtO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xcbiAgICBmb250LWZhbWlseTogbGF0bywgc2Fucy1zZXJpZjtcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX2RhdGUtaW5wdXQ6Zm9jdXMge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fd3JhcHBlci1wcmlvcml0eS1zdWJtaXQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICB9XFxuICBcXG4gIC5lZGl0LXBvcHVwX19wcmlvcml0eS10aXRsZSB7XFxuICAgIG1hcmdpbi1yaWdodDogMi42cmVtO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHkgaW5wdXRbdHlwZT1cXFwicmFkaW9cXFwiXSB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgbGVmdDogMi4ycmVtO1xcbiAgICBoZWlnaHQ6IDFweDtcXG4gICAgd2lkdGg6IDFweDtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgbWFyZ2luOiAwO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgfVxcbiAgXFxuICAuZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuIHtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBtYXJnaW46IDAgMS41cmVtIDAgLTVweDtcXG4gICAgcGFkZGluZzogLjVyZW0gMXJlbTtcXG4gICAgYm9yZGVyLXJhZGl1czogM3B4O1xcbiAgICBmb250LXNpemU6IDFyZW07XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGN1cnNvcjogcG9pbnRlcjtcXG4gICAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG4gIH1cXG4gIFxcbiAgLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bjpob3ZlciB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gIH1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWxvdyB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1sb3c6aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1ncmVlbik7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93LWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWNvbG9yLWdyZWVuKTtcXG4gICAgY29sb3I6IHdoaXRlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLW1lZGl1bSB7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIG9yYW5nZTtcXG4gICAgY29sb3I6IG9yYW5nZTtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW06aG92ZXIge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiBvcmFuZ2U7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtLWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IG9yYW5nZTtcXG4gICAgY29sb3I6IHdoaXRlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWhpZ2gge1xcbiAgICBib3JkZXI6IDFweCBzb2xpZCByZWQ7XFxuICAgIGNvbG9yOiByZWQ7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0taGlnaDpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJlZDtcXG59XFxuICBcXG4uZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoLWFjdGl2ZSB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJlZDtcXG4gICAgY29sb3I6IHdoaXRlO1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX190b2RvLXN1Ym1pdCB7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgYWxpZ24tc2VsZjogY2VudGVyO1xcbiAgICBwYWRkaW5nOiAuNXJlbSAxcmVtO1xcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XFxuICAgIGJvcmRlcjogMXB4IHNvbGlkICMzYmEzOTU7XFxuICAgIGZvbnQtc2l6ZTogMXJlbTtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgY29sb3I6ICMzYmEzOTU7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBjdXJzb3I6IHBvaW50ZXI7XFxuICAgIHRyYW5zaXRpb246IGFsbCAuM3M7XFxufVxcbiAgXFxuLmVkaXQtcG9wdXBfX3RvZG8tc3VibWl0OmhvdmVyIHtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2JhMzk1O1xcbn1cXG4gIFxcbi5lZGl0LXBvcHVwX190b2RvLXN1Ym1pdDphY3RpdmUge1xcbiAgICBvdXRsaW5lOiBub25lO1xcbn1cXG4gIFxcbi8qIEZvb3RlciAqL1xcblxcbi5mb290ZXIge1xcbiAgICBncmlkLXJvdzogLTEgLyAtMjtcXG4gICAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGdhcDogMXJlbTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIHBhZGRpbmc6IDFyZW07XFxuICAgIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1jb2xvci1vcmFuZ2UpO1xcbn1cXG5cXG4uZmEtZ2l0aHViIHtcXG4gICAgZm9udC1zaXplOiAycmVtO1xcbiAgICBjb2xvcjogdmFyKC0tY29sb3ItYmxhY2spO1xcbn1cXG5cXG4uZmEtZ2l0aHViOmhvdmVyIHtcXG4gICAgb3BhY2l0eTogMC41O1xcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuICBpZiAoIXVybCkge1xuICAgIHJldHVybiB1cmw7XG4gIH1cbiAgdXJsID0gU3RyaW5nKHVybC5fX2VzTW9kdWxlID8gdXJsLmRlZmF1bHQgOiB1cmwpO1xuXG4gIC8vIElmIHVybCBpcyBhbHJlYWR5IHdyYXBwZWQgaW4gcXVvdGVzLCByZW1vdmUgdGhlbVxuICBpZiAoL15bJ1wiXS4qWydcIl0kLy50ZXN0KHVybCkpIHtcbiAgICB1cmwgPSB1cmwuc2xpY2UoMSwgLTEpO1xuICB9XG4gIGlmIChvcHRpb25zLmhhc2gpIHtcbiAgICB1cmwgKz0gb3B0aW9ucy5oYXNoO1xuICB9XG5cbiAgLy8gU2hvdWxkIHVybCBiZSB3cmFwcGVkP1xuICAvLyBTZWUgaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzcy12YWx1ZXMtMy8jdXJsc1xuICBpZiAoL1tcIicoKSBcXHRcXG5dfCglMjApLy50ZXN0KHVybCkgfHwgb3B0aW9ucy5uZWVkUXVvdGVzKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdCh1cmwucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpLnJlcGxhY2UoL1xcbi9nLCBcIlxcXFxuXCIpLCBcIlxcXCJcIik7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRMZWFkaW5nWmVyb3MobnVtYmVyLCB0YXJnZXRMZW5ndGgpIHtcbiAgdmFyIHNpZ24gPSBudW1iZXIgPCAwID8gJy0nIDogJyc7XG4gIHZhciBvdXRwdXQgPSBNYXRoLmFicyhudW1iZXIpLnRvU3RyaW5nKCk7XG5cbiAgd2hpbGUgKG91dHB1dC5sZW5ndGggPCB0YXJnZXRMZW5ndGgpIHtcbiAgICBvdXRwdXQgPSAnMCcgKyBvdXRwdXQ7XG4gIH1cblxuICByZXR1cm4gc2lnbiArIG91dHB1dDtcbn0iLCJpbXBvcnQgZGVmYXVsdExvY2FsZSBmcm9tIFwiLi4vLi4vbG9jYWxlL2VuLVVTL2luZGV4LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBkZWZhdWx0TG9jYWxlOyIsInZhciBkZWZhdWx0T3B0aW9ucyA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRPcHRpb25zKCkge1xuICByZXR1cm4gZGVmYXVsdE9wdGlvbnM7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0RGVmYXVsdE9wdGlvbnMobmV3T3B0aW9ucykge1xuICBkZWZhdWx0T3B0aW9ucyA9IG5ld09wdGlvbnM7XG59IiwiaW1wb3J0IGdldFVUQ0RheU9mWWVhciBmcm9tIFwiLi4vLi4vLi4vX2xpYi9nZXRVVENEYXlPZlllYXIvaW5kZXguanNcIjtcbmltcG9ydCBnZXRVVENJU09XZWVrIGZyb20gXCIuLi8uLi8uLi9fbGliL2dldFVUQ0lTT1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCBnZXRVVENJU09XZWVrWWVhciBmcm9tIFwiLi4vLi4vLi4vX2xpYi9nZXRVVENJU09XZWVrWWVhci9pbmRleC5qc1wiO1xuaW1wb3J0IGdldFVUQ1dlZWsgZnJvbSBcIi4uLy4uLy4uL19saWIvZ2V0VVRDV2Vlay9pbmRleC5qc1wiO1xuaW1wb3J0IGdldFVUQ1dlZWtZZWFyIGZyb20gXCIuLi8uLi8uLi9fbGliL2dldFVUQ1dlZWtZZWFyL2luZGV4LmpzXCI7XG5pbXBvcnQgYWRkTGVhZGluZ1plcm9zIGZyb20gXCIuLi8uLi9hZGRMZWFkaW5nWmVyb3MvaW5kZXguanNcIjtcbmltcG9ydCBsaWdodEZvcm1hdHRlcnMgZnJvbSBcIi4uL2xpZ2h0Rm9ybWF0dGVycy9pbmRleC5qc1wiO1xudmFyIGRheVBlcmlvZEVudW0gPSB7XG4gIGFtOiAnYW0nLFxuICBwbTogJ3BtJyxcbiAgbWlkbmlnaHQ6ICdtaWRuaWdodCcsXG4gIG5vb246ICdub29uJyxcbiAgbW9ybmluZzogJ21vcm5pbmcnLFxuICBhZnRlcm5vb246ICdhZnRlcm5vb24nLFxuICBldmVuaW5nOiAnZXZlbmluZycsXG4gIG5pZ2h0OiAnbmlnaHQnXG59O1xuXG4vKlxuICogfCAgICAgfCBVbml0ICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgfCBVbml0ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCAgYSAgfCBBTSwgUE0gICAgICAgICAgICAgICAgICAgICAgICAgfCAgQSogfCBNaWxsaXNlY29uZHMgaW4gZGF5ICAgICAgICAgICAgfFxuICogfCAgYiAgfCBBTSwgUE0sIG5vb24sIG1pZG5pZ2h0ICAgICAgICAgfCAgQiAgfCBGbGV4aWJsZSBkYXkgcGVyaW9kICAgICAgICAgICAgfFxuICogfCAgYyAgfCBTdGFuZC1hbG9uZSBsb2NhbCBkYXkgb2Ygd2VlayAgfCAgQyogfCBMb2NhbGl6ZWQgaG91ciB3LyBkYXkgcGVyaW9kICAgfFxuICogfCAgZCAgfCBEYXkgb2YgbW9udGggICAgICAgICAgICAgICAgICAgfCAgRCAgfCBEYXkgb2YgeWVhciAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgZSAgfCBMb2NhbCBkYXkgb2Ygd2VlayAgICAgICAgICAgICAgfCAgRSAgfCBEYXkgb2Ygd2VlayAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgZiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgRiogfCBEYXkgb2Ygd2VlayBpbiBtb250aCAgICAgICAgICAgfFxuICogfCAgZyogfCBNb2RpZmllZCBKdWxpYW4gZGF5ICAgICAgICAgICAgfCAgRyAgfCBFcmEgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgaCAgfCBIb3VyIFsxLTEyXSAgICAgICAgICAgICAgICAgICAgfCAgSCAgfCBIb3VyIFswLTIzXSAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgaSEgfCBJU08gZGF5IG9mIHdlZWsgICAgICAgICAgICAgICAgfCAgSSEgfCBJU08gd2VlayBvZiB5ZWFyICAgICAgICAgICAgICAgfFxuICogfCAgaiogfCBMb2NhbGl6ZWQgaG91ciB3LyBkYXkgcGVyaW9kICAgfCAgSiogfCBMb2NhbGl6ZWQgaG91ciB3L28gZGF5IHBlcmlvZCAgfFxuICogfCAgayAgfCBIb3VyIFsxLTI0XSAgICAgICAgICAgICAgICAgICAgfCAgSyAgfCBIb3VyIFswLTExXSAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgbCogfCAoZGVwcmVjYXRlZCkgICAgICAgICAgICAgICAgICAgfCAgTCAgfCBTdGFuZC1hbG9uZSBtb250aCAgICAgICAgICAgICAgfFxuICogfCAgbSAgfCBNaW51dGUgICAgICAgICAgICAgICAgICAgICAgICAgfCAgTSAgfCBNb250aCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgTiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgbyEgfCBPcmRpbmFsIG51bWJlciBtb2RpZmllciAgICAgICAgfCAgTyAgfCBUaW1lem9uZSAoR01UKSAgICAgICAgICAgICAgICAgfFxuICogfCAgcCEgfCBMb25nIGxvY2FsaXplZCB0aW1lICAgICAgICAgICAgfCAgUCEgfCBMb25nIGxvY2FsaXplZCBkYXRlICAgICAgICAgICAgfFxuICogfCAgcSAgfCBTdGFuZC1hbG9uZSBxdWFydGVyICAgICAgICAgICAgfCAgUSAgfCBRdWFydGVyICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgciogfCBSZWxhdGVkIEdyZWdvcmlhbiB5ZWFyICAgICAgICAgfCAgUiEgfCBJU08gd2Vlay1udW1iZXJpbmcgeWVhciAgICAgICAgfFxuICogfCAgcyAgfCBTZWNvbmQgICAgICAgICAgICAgICAgICAgICAgICAgfCAgUyAgfCBGcmFjdGlvbiBvZiBzZWNvbmQgICAgICAgICAgICAgfFxuICogfCAgdCEgfCBTZWNvbmRzIHRpbWVzdGFtcCAgICAgICAgICAgICAgfCAgVCEgfCBNaWxsaXNlY29uZHMgdGltZXN0YW1wICAgICAgICAgfFxuICogfCAgdSAgfCBFeHRlbmRlZCB5ZWFyICAgICAgICAgICAgICAgICAgfCAgVSogfCBDeWNsaWMgeWVhciAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgdiogfCBUaW1lem9uZSAoZ2VuZXJpYyBub24tbG9jYXQuKSAgfCAgViogfCBUaW1lem9uZSAobG9jYXRpb24pICAgICAgICAgICAgfFxuICogfCAgdyAgfCBMb2NhbCB3ZWVrIG9mIHllYXIgICAgICAgICAgICAgfCAgVyogfCBXZWVrIG9mIG1vbnRoICAgICAgICAgICAgICAgICAgfFxuICogfCAgeCAgfCBUaW1lem9uZSAoSVNPLTg2MDEgdy9vIFopICAgICAgfCAgWCAgfCBUaW1lem9uZSAoSVNPLTg2MDEpICAgICAgICAgICAgfFxuICogfCAgeSAgfCBZZWFyIChhYnMpICAgICAgICAgICAgICAgICAgICAgfCAgWSAgfCBMb2NhbCB3ZWVrLW51bWJlcmluZyB5ZWFyICAgICAgfFxuICogfCAgeiAgfCBUaW1lem9uZSAoc3BlY2lmaWMgbm9uLWxvY2F0LikgfCAgWiogfCBUaW1lem9uZSAoYWxpYXNlcykgICAgICAgICAgICAgfFxuICpcbiAqIExldHRlcnMgbWFya2VkIGJ5ICogYXJlIG5vdCBpbXBsZW1lbnRlZCBidXQgcmVzZXJ2ZWQgYnkgVW5pY29kZSBzdGFuZGFyZC5cbiAqXG4gKiBMZXR0ZXJzIG1hcmtlZCBieSAhIGFyZSBub24tc3RhbmRhcmQsIGJ1dCBpbXBsZW1lbnRlZCBieSBkYXRlLWZuczpcbiAqIC0gYG9gIG1vZGlmaWVzIHRoZSBwcmV2aW91cyB0b2tlbiB0byB0dXJuIGl0IGludG8gYW4gb3JkaW5hbCAoc2VlIGBmb3JtYXRgIGRvY3MpXG4gKiAtIGBpYCBpcyBJU08gZGF5IG9mIHdlZWsuIEZvciBgaWAgYW5kIGBpaWAgaXMgcmV0dXJucyBudW1lcmljIElTTyB3ZWVrIGRheXMsXG4gKiAgIGkuZS4gNyBmb3IgU3VuZGF5LCAxIGZvciBNb25kYXksIGV0Yy5cbiAqIC0gYElgIGlzIElTTyB3ZWVrIG9mIHllYXIsIGFzIG9wcG9zZWQgdG8gYHdgIHdoaWNoIGlzIGxvY2FsIHdlZWsgb2YgeWVhci5cbiAqIC0gYFJgIGlzIElTTyB3ZWVrLW51bWJlcmluZyB5ZWFyLCBhcyBvcHBvc2VkIHRvIGBZYCB3aGljaCBpcyBsb2NhbCB3ZWVrLW51bWJlcmluZyB5ZWFyLlxuICogICBgUmAgaXMgc3VwcG9zZWQgdG8gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGBJYCBhbmQgYGlgXG4gKiAgIGZvciB1bml2ZXJzYWwgSVNPIHdlZWstbnVtYmVyaW5nIGRhdGUsIHdoZXJlYXNcbiAqICAgYFlgIGlzIHN1cHBvc2VkIHRvIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgd2AgYW5kIGBlYFxuICogICBmb3Igd2Vlay1udW1iZXJpbmcgZGF0ZSBzcGVjaWZpYyB0byB0aGUgbG9jYWxlLlxuICogLSBgUGAgaXMgbG9uZyBsb2NhbGl6ZWQgZGF0ZSBmb3JtYXRcbiAqIC0gYHBgIGlzIGxvbmcgbG9jYWxpemVkIHRpbWUgZm9ybWF0XG4gKi9cbnZhciBmb3JtYXR0ZXJzID0ge1xuICAvLyBFcmFcbiAgRzogZnVuY3Rpb24gRyhkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgZXJhID0gZGF0ZS5nZXRVVENGdWxsWWVhcigpID4gMCA/IDEgOiAwO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gQUQsIEJDXG4gICAgICBjYXNlICdHJzpcbiAgICAgIGNhc2UgJ0dHJzpcbiAgICAgIGNhc2UgJ0dHRyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5lcmEoZXJhLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCdcbiAgICAgICAgfSk7XG4gICAgICAvLyBBLCBCXG5cbiAgICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmVyYShlcmEsIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdydcbiAgICAgICAgfSk7XG4gICAgICAvLyBBbm5vIERvbWluaSwgQmVmb3JlIENocmlzdFxuXG4gICAgICBjYXNlICdHR0dHJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5lcmEoZXJhLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIFllYXJcbiAgeTogZnVuY3Rpb24geShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICAvLyBPcmRpbmFsIG51bWJlclxuICAgIGlmICh0b2tlbiA9PT0gJ3lvJykge1xuICAgICAgdmFyIHNpZ25lZFllYXIgPSBkYXRlLmdldFVUQ0Z1bGxZZWFyKCk7IC8vIFJldHVybnMgMSBmb3IgMSBCQyAod2hpY2ggaXMgeWVhciAwIGluIEphdmFTY3JpcHQpXG5cbiAgICAgIHZhciB5ZWFyID0gc2lnbmVkWWVhciA+IDAgPyBzaWduZWRZZWFyIDogMSAtIHNpZ25lZFllYXI7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcih5ZWFyLCB7XG4gICAgICAgIHVuaXQ6ICd5ZWFyJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy55KGRhdGUsIHRva2VuKTtcbiAgfSxcbiAgLy8gTG9jYWwgd2Vlay1udW1iZXJpbmcgeWVhclxuICBZOiBmdW5jdGlvbiBZKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBzaWduZWRXZWVrWWVhciA9IGdldFVUQ1dlZWtZZWFyKGRhdGUsIG9wdGlvbnMpOyAvLyBSZXR1cm5zIDEgZm9yIDEgQkMgKHdoaWNoIGlzIHllYXIgMCBpbiBKYXZhU2NyaXB0KVxuXG4gICAgdmFyIHdlZWtZZWFyID0gc2lnbmVkV2Vla1llYXIgPiAwID8gc2lnbmVkV2Vla1llYXIgOiAxIC0gc2lnbmVkV2Vla1llYXI7IC8vIFR3byBkaWdpdCB5ZWFyXG5cbiAgICBpZiAodG9rZW4gPT09ICdZWScpIHtcbiAgICAgIHZhciB0d29EaWdpdFllYXIgPSB3ZWVrWWVhciAlIDEwMDtcbiAgICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3ModHdvRGlnaXRZZWFyLCAyKTtcbiAgICB9IC8vIE9yZGluYWwgbnVtYmVyXG5cblxuICAgIGlmICh0b2tlbiA9PT0gJ1lvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIod2Vla1llYXIsIHtcbiAgICAgICAgdW5pdDogJ3llYXInXG4gICAgICB9KTtcbiAgICB9IC8vIFBhZGRpbmdcblxuXG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyh3ZWVrWWVhciwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gSVNPIHdlZWstbnVtYmVyaW5nIHllYXJcbiAgUjogZnVuY3Rpb24gUihkYXRlLCB0b2tlbikge1xuICAgIHZhciBpc29XZWVrWWVhciA9IGdldFVUQ0lTT1dlZWtZZWFyKGRhdGUpOyAvLyBQYWRkaW5nXG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGlzb1dlZWtZZWFyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBFeHRlbmRlZCB5ZWFyLiBUaGlzIGlzIGEgc2luZ2xlIG51bWJlciBkZXNpZ25hdGluZyB0aGUgeWVhciBvZiB0aGlzIGNhbGVuZGFyIHN5c3RlbS5cbiAgLy8gVGhlIG1haW4gZGlmZmVyZW5jZSBiZXR3ZWVuIGB5YCBhbmQgYHVgIGxvY2FsaXplcnMgYXJlIEIuQy4geWVhcnM6XG4gIC8vIHwgWWVhciB8IGB5YCB8IGB1YCB8XG4gIC8vIHwtLS0tLS18LS0tLS18LS0tLS18XG4gIC8vIHwgQUMgMSB8ICAgMSB8ICAgMSB8XG4gIC8vIHwgQkMgMSB8ICAgMSB8ICAgMCB8XG4gIC8vIHwgQkMgMiB8ICAgMiB8ICAtMSB8XG4gIC8vIEFsc28gYHl5YCBhbHdheXMgcmV0dXJucyB0aGUgbGFzdCB0d28gZGlnaXRzIG9mIGEgeWVhcixcbiAgLy8gd2hpbGUgYHV1YCBwYWRzIHNpbmdsZSBkaWdpdCB5ZWFycyB0byAyIGNoYXJhY3RlcnMgYW5kIHJldHVybnMgb3RoZXIgeWVhcnMgdW5jaGFuZ2VkLlxuICB1OiBmdW5jdGlvbiB1KGRhdGUsIHRva2VuKSB7XG4gICAgdmFyIHllYXIgPSBkYXRlLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyh5ZWFyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBRdWFydGVyXG4gIFE6IGZ1bmN0aW9uIFEoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgdmFyIHF1YXJ0ZXIgPSBNYXRoLmNlaWwoKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEpIC8gMyk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyAxLCAyLCAzLCA0XG4gICAgICBjYXNlICdRJzpcbiAgICAgICAgcmV0dXJuIFN0cmluZyhxdWFydGVyKTtcbiAgICAgIC8vIDAxLCAwMiwgMDMsIDA0XG5cbiAgICAgIGNhc2UgJ1FRJzpcbiAgICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhxdWFydGVyLCAyKTtcbiAgICAgIC8vIDFzdCwgMm5kLCAzcmQsIDR0aFxuXG4gICAgICBjYXNlICdRbyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKHF1YXJ0ZXIsIHtcbiAgICAgICAgICB1bml0OiAncXVhcnRlcidcbiAgICAgICAgfSk7XG4gICAgICAvLyBRMSwgUTIsIFEzLCBRNFxuXG4gICAgICBjYXNlICdRUVEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUucXVhcnRlcihxdWFydGVyLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gMSwgMiwgMywgNCAobmFycm93IHF1YXJ0ZXI7IGNvdWxkIGJlIG5vdCBudW1lcmljYWwpXG5cbiAgICAgIGNhc2UgJ1FRUVFRJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLnF1YXJ0ZXIocXVhcnRlciwge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyAxc3QgcXVhcnRlciwgMm5kIHF1YXJ0ZXIsIC4uLlxuXG4gICAgICBjYXNlICdRUVFRJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5xdWFydGVyKHF1YXJ0ZXIsIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIFN0YW5kLWFsb25lIHF1YXJ0ZXJcbiAgcTogZnVuY3Rpb24gcShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgcXVhcnRlciA9IE1hdGguY2VpbCgoZGF0ZS5nZXRVVENNb250aCgpICsgMSkgLyAzKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIDEsIDIsIDMsIDRcbiAgICAgIGNhc2UgJ3EnOlxuICAgICAgICByZXR1cm4gU3RyaW5nKHF1YXJ0ZXIpO1xuICAgICAgLy8gMDEsIDAyLCAwMywgMDRcblxuICAgICAgY2FzZSAncXEnOlxuICAgICAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHF1YXJ0ZXIsIDIpO1xuICAgICAgLy8gMXN0LCAybmQsIDNyZCwgNHRoXG5cbiAgICAgIGNhc2UgJ3FvJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIocXVhcnRlciwge1xuICAgICAgICAgIHVuaXQ6ICdxdWFydGVyJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFExLCBRMiwgUTMsIFE0XG5cbiAgICAgIGNhc2UgJ3FxcSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5xdWFydGVyKHF1YXJ0ZXIsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgICAvLyAxLCAyLCAzLCA0IChuYXJyb3cgcXVhcnRlcjsgY291bGQgYmUgbm90IG51bWVyaWNhbClcblxuICAgICAgY2FzZSAncXFxcXEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUucXVhcnRlcihxdWFydGVyLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIDFzdCBxdWFydGVyLCAybmQgcXVhcnRlciwgLi4uXG5cbiAgICAgIGNhc2UgJ3FxcXEnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLnF1YXJ0ZXIocXVhcnRlciwge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gTW9udGhcbiAgTTogZnVuY3Rpb24gTShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgbW9udGggPSBkYXRlLmdldFVUQ01vbnRoKCk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlICdNJzpcbiAgICAgIGNhc2UgJ01NJzpcbiAgICAgICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy5NKGRhdGUsIHRva2VuKTtcbiAgICAgIC8vIDFzdCwgMm5kLCAuLi4sIDEydGhcblxuICAgICAgY2FzZSAnTW8nOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihtb250aCArIDEsIHtcbiAgICAgICAgICB1bml0OiAnbW9udGgnXG4gICAgICAgIH0pO1xuICAgICAgLy8gSmFuLCBGZWIsIC4uLiwgRGVjXG5cbiAgICAgIGNhc2UgJ01NTSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5tb250aChtb250aCwge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIEosIEYsIC4uLiwgRFxuXG4gICAgICBjYXNlICdNTU1NTSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5tb250aChtb250aCwge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBKYW51YXJ5LCBGZWJydWFyeSwgLi4uLCBEZWNlbWJlclxuXG4gICAgICBjYXNlICdNTU1NJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5tb250aChtb250aCwge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gU3RhbmQtYWxvbmUgbW9udGhcbiAgTDogZnVuY3Rpb24gTChkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgbW9udGggPSBkYXRlLmdldFVUQ01vbnRoKCk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyAxLCAyLCAuLi4sIDEyXG4gICAgICBjYXNlICdMJzpcbiAgICAgICAgcmV0dXJuIFN0cmluZyhtb250aCArIDEpO1xuICAgICAgLy8gMDEsIDAyLCAuLi4sIDEyXG5cbiAgICAgIGNhc2UgJ0xMJzpcbiAgICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhtb250aCArIDEsIDIpO1xuICAgICAgLy8gMXN0LCAybmQsIC4uLiwgMTJ0aFxuXG4gICAgICBjYXNlICdMbyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKG1vbnRoICsgMSwge1xuICAgICAgICAgIHVuaXQ6ICdtb250aCdcbiAgICAgICAgfSk7XG4gICAgICAvLyBKYW4sIEZlYiwgLi4uLCBEZWNcblxuICAgICAgY2FzZSAnTExMJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gSiwgRiwgLi4uLCBEXG5cbiAgICAgIGNhc2UgJ0xMTExMJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIEphbnVhcnksIEZlYnJ1YXJ5LCAuLi4sIERlY2VtYmVyXG5cbiAgICAgIGNhc2UgJ0xMTEwnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm1vbnRoKG1vbnRoLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBMb2NhbCB3ZWVrIG9mIHllYXJcbiAgdzogZnVuY3Rpb24gdyhkYXRlLCB0b2tlbiwgbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgd2VlayA9IGdldFVUQ1dlZWsoZGF0ZSwgb3B0aW9ucyk7XG5cbiAgICBpZiAodG9rZW4gPT09ICd3bycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKHdlZWssIHtcbiAgICAgICAgdW5pdDogJ3dlZWsnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHdlZWssIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIElTTyB3ZWVrIG9mIHllYXJcbiAgSTogZnVuY3Rpb24gSShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgaXNvV2VlayA9IGdldFVUQ0lTT1dlZWsoZGF0ZSk7XG5cbiAgICBpZiAodG9rZW4gPT09ICdJbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGlzb1dlZWssIHtcbiAgICAgICAgdW5pdDogJ3dlZWsnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGlzb1dlZWssIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIERheSBvZiB0aGUgbW9udGhcbiAgZDogZnVuY3Rpb24gZChkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICBpZiAodG9rZW4gPT09ICdkbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGRhdGUuZ2V0VVRDRGF0ZSgpLCB7XG4gICAgICAgIHVuaXQ6ICdkYXRlJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy5kKGRhdGUsIHRva2VuKTtcbiAgfSxcbiAgLy8gRGF5IG9mIHllYXJcbiAgRDogZnVuY3Rpb24gRChkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgZGF5T2ZZZWFyID0gZ2V0VVRDRGF5T2ZZZWFyKGRhdGUpO1xuXG4gICAgaWYgKHRva2VuID09PSAnRG8nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihkYXlPZlllYXIsIHtcbiAgICAgICAgdW5pdDogJ2RheU9mWWVhcidcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoZGF5T2ZZZWFyLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBEYXkgb2Ygd2Vla1xuICBFOiBmdW5jdGlvbiBFKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBkYXlPZldlZWsgPSBkYXRlLmdldFVUQ0RheSgpO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gVHVlXG4gICAgICBjYXNlICdFJzpcbiAgICAgIGNhc2UgJ0VFJzpcbiAgICAgIGNhc2UgJ0VFRSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVFxuXG4gICAgICBjYXNlICdFRUVFRSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1XG5cbiAgICAgIGNhc2UgJ0VFRUVFRSc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdzaG9ydCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVlc2RheVxuXG4gICAgICBjYXNlICdFRUVFJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBMb2NhbCBkYXkgb2Ygd2Vla1xuICBlOiBmdW5jdGlvbiBlKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBkYXlPZldlZWsgPSBkYXRlLmdldFVUQ0RheSgpO1xuICAgIHZhciBsb2NhbERheU9mV2VlayA9IChkYXlPZldlZWsgLSBvcHRpb25zLndlZWtTdGFydHNPbiArIDgpICUgNyB8fCA3O1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gTnVtZXJpY2FsIHZhbHVlIChOdGggZGF5IG9mIHdlZWsgd2l0aCBjdXJyZW50IGxvY2FsZSBvciB3ZWVrU3RhcnRzT24pXG4gICAgICBjYXNlICdlJzpcbiAgICAgICAgcmV0dXJuIFN0cmluZyhsb2NhbERheU9mV2Vlayk7XG4gICAgICAvLyBQYWRkZWQgbnVtZXJpY2FsIHZhbHVlXG5cbiAgICAgIGNhc2UgJ2VlJzpcbiAgICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhsb2NhbERheU9mV2VlaywgMik7XG4gICAgICAvLyAxc3QsIDJuZCwgLi4uLCA3dGhcblxuICAgICAgY2FzZSAnZW8nOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihsb2NhbERheU9mV2Vlaywge1xuICAgICAgICAgIHVuaXQ6ICdkYXknXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdlZWUnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFRcblxuICAgICAgY2FzZSAnZWVlZWUnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdVxuXG4gICAgICBjYXNlICdlZWVlZWUnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnc2hvcnQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1ZXNkYXlcblxuICAgICAgY2FzZSAnZWVlZSc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5KGRheU9mV2Vlaywge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gU3RhbmQtYWxvbmUgbG9jYWwgZGF5IG9mIHdlZWtcbiAgYzogZnVuY3Rpb24gYyhkYXRlLCB0b2tlbiwgbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGF5T2ZXZWVrID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgICB2YXIgbG9jYWxEYXlPZldlZWsgPSAoZGF5T2ZXZWVrIC0gb3B0aW9ucy53ZWVrU3RhcnRzT24gKyA4KSAlIDcgfHwgNztcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIE51bWVyaWNhbCB2YWx1ZSAoc2FtZSBhcyBpbiBgZWApXG4gICAgICBjYXNlICdjJzpcbiAgICAgICAgcmV0dXJuIFN0cmluZyhsb2NhbERheU9mV2Vlayk7XG4gICAgICAvLyBQYWRkZWQgbnVtZXJpY2FsIHZhbHVlXG5cbiAgICAgIGNhc2UgJ2NjJzpcbiAgICAgICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhsb2NhbERheU9mV2VlaywgdG9rZW4ubGVuZ3RoKTtcbiAgICAgIC8vIDFzdCwgMm5kLCAuLi4sIDd0aFxuXG4gICAgICBjYXNlICdjbyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGxvY2FsRGF5T2ZXZWVrLCB7XG4gICAgICAgICAgdW5pdDogJ2RheSdcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2NjYyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVFxuXG4gICAgICBjYXNlICdjY2NjYyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdzdGFuZGFsb25lJ1xuICAgICAgICB9KTtcbiAgICAgIC8vIFR1XG5cbiAgICAgIGNhc2UgJ2NjY2NjYyc6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICdzaG9ydCcsXG4gICAgICAgICAgY29udGV4dDogJ3N0YW5kYWxvbmUnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVlc2RheVxuXG4gICAgICBjYXNlICdjY2NjJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXkoZGF5T2ZXZWVrLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnc3RhbmRhbG9uZSdcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBJU08gZGF5IG9mIHdlZWtcbiAgaTogZnVuY3Rpb24gaShkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgZGF5T2ZXZWVrID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgICB2YXIgaXNvRGF5T2ZXZWVrID0gZGF5T2ZXZWVrID09PSAwID8gNyA6IGRheU9mV2VlaztcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIDJcbiAgICAgIGNhc2UgJ2knOlxuICAgICAgICByZXR1cm4gU3RyaW5nKGlzb0RheU9mV2Vlayk7XG4gICAgICAvLyAwMlxuXG4gICAgICBjYXNlICdpaSc6XG4gICAgICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoaXNvRGF5T2ZXZWVrLCB0b2tlbi5sZW5ndGgpO1xuICAgICAgLy8gMm5kXG5cbiAgICAgIGNhc2UgJ2lvJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoaXNvRGF5T2ZXZWVrLCB7XG4gICAgICAgICAgdW5pdDogJ2RheSdcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdWVcblxuICAgICAgY2FzZSAnaWlpJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUXG5cbiAgICAgIGNhc2UgJ2lpaWlpJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgICAgLy8gVHVcblxuICAgICAgY2FzZSAnaWlpaWlpJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3Nob3J0JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgICAvLyBUdWVzZGF5XG5cbiAgICAgIGNhc2UgJ2lpaWknOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheShkYXlPZldlZWssIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIEFNIG9yIFBNXG4gIGE6IGZ1bmN0aW9uIGEoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIHZhciBkYXlQZXJpb2RFbnVtVmFsdWUgPSBob3VycyAvIDEyID49IDEgPyAncG0nIDogJ2FtJztcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgY2FzZSAnYWEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnYWJicmV2aWF0ZWQnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnYWFhJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgY2FzZSAnYWFhYWEnOlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnbmFycm93JyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2FhYWEnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ3dpZGUnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIC8vIEFNLCBQTSwgbWlkbmlnaHQsIG5vb25cbiAgYjogZnVuY3Rpb24gYihkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgdmFyIGRheVBlcmlvZEVudW1WYWx1ZTtcblxuICAgIGlmIChob3VycyA9PT0gMTIpIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGRheVBlcmlvZEVudW0ubm9vbjtcbiAgICB9IGVsc2UgaWYgKGhvdXJzID09PSAwKSB7XG4gICAgICBkYXlQZXJpb2RFbnVtVmFsdWUgPSBkYXlQZXJpb2RFbnVtLm1pZG5pZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBkYXlQZXJpb2RFbnVtVmFsdWUgPSBob3VycyAvIDEyID49IDEgPyAncG0nIDogJ2FtJztcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlICdiJzpcbiAgICAgIGNhc2UgJ2JiJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ2FiYnJldmlhdGVkJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG5cbiAgICAgIGNhc2UgJ2JiYic6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGNhc2UgJ2JiYmJiJzpcbiAgICAgICAgcmV0dXJuIGxvY2FsaXplLmRheVBlcmlvZChkYXlQZXJpb2RFbnVtVmFsdWUsIHtcbiAgICAgICAgICB3aWR0aDogJ25hcnJvdycsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdiYmJiJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICd3aWRlJyxcbiAgICAgICAgICBjb250ZXh0OiAnZm9ybWF0dGluZydcbiAgICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAvLyBpbiB0aGUgbW9ybmluZywgaW4gdGhlIGFmdGVybm9vbiwgaW4gdGhlIGV2ZW5pbmcsIGF0IG5pZ2h0XG4gIEI6IGZ1bmN0aW9uIEIoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIHZhciBkYXlQZXJpb2RFbnVtVmFsdWU7XG5cbiAgICBpZiAoaG91cnMgPj0gMTcpIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGRheVBlcmlvZEVudW0uZXZlbmluZztcbiAgICB9IGVsc2UgaWYgKGhvdXJzID49IDEyKSB7XG4gICAgICBkYXlQZXJpb2RFbnVtVmFsdWUgPSBkYXlQZXJpb2RFbnVtLmFmdGVybm9vbjtcbiAgICB9IGVsc2UgaWYgKGhvdXJzID49IDQpIHtcbiAgICAgIGRheVBlcmlvZEVudW1WYWx1ZSA9IGRheVBlcmlvZEVudW0ubW9ybmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGF5UGVyaW9kRW51bVZhbHVlID0gZGF5UGVyaW9kRW51bS5uaWdodDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlICdCJzpcbiAgICAgIGNhc2UgJ0JCJzpcbiAgICAgIGNhc2UgJ0JCQic6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICdhYmJyZXZpYXRlZCcsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuXG4gICAgICBjYXNlICdCQkJCQic6XG4gICAgICAgIHJldHVybiBsb2NhbGl6ZS5kYXlQZXJpb2QoZGF5UGVyaW9kRW51bVZhbHVlLCB7XG4gICAgICAgICAgd2lkdGg6ICduYXJyb3cnLFxuICAgICAgICAgIGNvbnRleHQ6ICdmb3JtYXR0aW5nJ1xuICAgICAgICB9KTtcblxuICAgICAgY2FzZSAnQkJCQic6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbG9jYWxpemUuZGF5UGVyaW9kKGRheVBlcmlvZEVudW1WYWx1ZSwge1xuICAgICAgICAgIHdpZHRoOiAnd2lkZScsXG4gICAgICAgICAgY29udGV4dDogJ2Zvcm1hdHRpbmcnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgLy8gSG91ciBbMS0xMl1cbiAgaDogZnVuY3Rpb24gaChkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICBpZiAodG9rZW4gPT09ICdobycpIHtcbiAgICAgIHZhciBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKSAlIDEyO1xuICAgICAgaWYgKGhvdXJzID09PSAwKSBob3VycyA9IDEyO1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoaG91cnMsIHtcbiAgICAgICAgdW5pdDogJ2hvdXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLmgoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBIb3VyIFswLTIzXVxuICBIOiBmdW5jdGlvbiBIKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIGlmICh0b2tlbiA9PT0gJ0hvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoZGF0ZS5nZXRVVENIb3VycygpLCB7XG4gICAgICAgIHVuaXQ6ICdob3VyJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy5IKGRhdGUsIHRva2VuKTtcbiAgfSxcbiAgLy8gSG91ciBbMC0xMV1cbiAgSzogZnVuY3Rpb24gSyhkYXRlLCB0b2tlbiwgbG9jYWxpemUpIHtcbiAgICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCkgJSAxMjtcblxuICAgIGlmICh0b2tlbiA9PT0gJ0tvJykge1xuICAgICAgcmV0dXJuIGxvY2FsaXplLm9yZGluYWxOdW1iZXIoaG91cnMsIHtcbiAgICAgICAgdW5pdDogJ2hvdXInXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKGhvdXJzLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBIb3VyIFsxLTI0XVxuICBrOiBmdW5jdGlvbiBrKGRhdGUsIHRva2VuLCBsb2NhbGl6ZSkge1xuICAgIHZhciBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgICBpZiAoaG91cnMgPT09IDApIGhvdXJzID0gMjQ7XG5cbiAgICBpZiAodG9rZW4gPT09ICdrbycpIHtcbiAgICAgIHJldHVybiBsb2NhbGl6ZS5vcmRpbmFsTnVtYmVyKGhvdXJzLCB7XG4gICAgICAgIHVuaXQ6ICdob3VyJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhob3VycywgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gTWludXRlXG4gIG06IGZ1bmN0aW9uIG0oZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgaWYgKHRva2VuID09PSAnbW8nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihkYXRlLmdldFVUQ01pbnV0ZXMoKSwge1xuICAgICAgICB1bml0OiAnbWludXRlJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy5tKGRhdGUsIHRva2VuKTtcbiAgfSxcbiAgLy8gU2Vjb25kXG4gIHM6IGZ1bmN0aW9uIHMoZGF0ZSwgdG9rZW4sIGxvY2FsaXplKSB7XG4gICAgaWYgKHRva2VuID09PSAnc28nKSB7XG4gICAgICByZXR1cm4gbG9jYWxpemUub3JkaW5hbE51bWJlcihkYXRlLmdldFVUQ1NlY29uZHMoKSwge1xuICAgICAgICB1bml0OiAnc2Vjb25kJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpZ2h0Rm9ybWF0dGVycy5zKGRhdGUsIHRva2VuKTtcbiAgfSxcbiAgLy8gRnJhY3Rpb24gb2Ygc2Vjb25kXG4gIFM6IGZ1bmN0aW9uIFMoZGF0ZSwgdG9rZW4pIHtcbiAgICByZXR1cm4gbGlnaHRGb3JtYXR0ZXJzLlMoZGF0ZSwgdG9rZW4pO1xuICB9LFxuICAvLyBUaW1lem9uZSAoSVNPLTg2MDEuIElmIG9mZnNldCBpcyAwLCBvdXRwdXQgaXMgYWx3YXlzIGAnWidgKVxuICBYOiBmdW5jdGlvbiBYKGRhdGUsIHRva2VuLCBfbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3JpZ2luYWxEYXRlID0gb3B0aW9ucy5fb3JpZ2luYWxEYXRlIHx8IGRhdGU7XG4gICAgdmFyIHRpbWV6b25lT2Zmc2V0ID0gb3JpZ2luYWxEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cbiAgICBpZiAodGltZXpvbmVPZmZzZXQgPT09IDApIHtcbiAgICAgIHJldHVybiAnWic7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgLy8gSG91cnMgYW5kIG9wdGlvbmFsIG1pbnV0ZXNcbiAgICAgIGNhc2UgJ1gnOlxuICAgICAgICByZXR1cm4gZm9ybWF0VGltZXpvbmVXaXRoT3B0aW9uYWxNaW51dGVzKHRpbWV6b25lT2Zmc2V0KTtcbiAgICAgIC8vIEhvdXJzLCBtaW51dGVzIGFuZCBvcHRpb25hbCBzZWNvbmRzIHdpdGhvdXQgYDpgIGRlbGltaXRlclxuICAgICAgLy8gTm90ZTogbmVpdGhlciBJU08tODYwMSBub3IgSmF2YVNjcmlwdCBzdXBwb3J0cyBzZWNvbmRzIGluIHRpbWV6b25lIG9mZnNldHNcbiAgICAgIC8vIHNvIHRoaXMgdG9rZW4gYWx3YXlzIGhhcyB0aGUgc2FtZSBvdXRwdXQgYXMgYFhYYFxuXG4gICAgICBjYXNlICdYWFhYJzpcbiAgICAgIGNhc2UgJ1hYJzpcbiAgICAgICAgLy8gSG91cnMgYW5kIG1pbnV0ZXMgd2l0aG91dCBgOmAgZGVsaW1pdGVyXG4gICAgICAgIHJldHVybiBmb3JtYXRUaW1lem9uZSh0aW1lem9uZU9mZnNldCk7XG4gICAgICAvLyBIb3VycywgbWludXRlcyBhbmQgb3B0aW9uYWwgc2Vjb25kcyB3aXRoIGA6YCBkZWxpbWl0ZXJcbiAgICAgIC8vIE5vdGU6IG5laXRoZXIgSVNPLTg2MDEgbm9yIEphdmFTY3JpcHQgc3VwcG9ydHMgc2Vjb25kcyBpbiB0aW1lem9uZSBvZmZzZXRzXG4gICAgICAvLyBzbyB0aGlzIHRva2VuIGFsd2F5cyBoYXMgdGhlIHNhbWUgb3V0cHV0IGFzIGBYWFhgXG5cbiAgICAgIGNhc2UgJ1hYWFhYJzpcbiAgICAgIGNhc2UgJ1hYWCc6IC8vIEhvdXJzIGFuZCBtaW51dGVzIHdpdGggYDpgIGRlbGltaXRlclxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZm9ybWF0VGltZXpvbmUodGltZXpvbmVPZmZzZXQsICc6Jyk7XG4gICAgfVxuICB9LFxuICAvLyBUaW1lem9uZSAoSVNPLTg2MDEuIElmIG9mZnNldCBpcyAwLCBvdXRwdXQgaXMgYCcrMDA6MDAnYCBvciBlcXVpdmFsZW50KVxuICB4OiBmdW5jdGlvbiB4KGRhdGUsIHRva2VuLCBfbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3JpZ2luYWxEYXRlID0gb3B0aW9ucy5fb3JpZ2luYWxEYXRlIHx8IGRhdGU7XG4gICAgdmFyIHRpbWV6b25lT2Zmc2V0ID0gb3JpZ2luYWxEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBIb3VycyBhbmQgb3B0aW9uYWwgbWludXRlc1xuICAgICAgY2FzZSAneCc6XG4gICAgICAgIHJldHVybiBmb3JtYXRUaW1lem9uZVdpdGhPcHRpb25hbE1pbnV0ZXModGltZXpvbmVPZmZzZXQpO1xuICAgICAgLy8gSG91cnMsIG1pbnV0ZXMgYW5kIG9wdGlvbmFsIHNlY29uZHMgd2l0aG91dCBgOmAgZGVsaW1pdGVyXG4gICAgICAvLyBOb3RlOiBuZWl0aGVyIElTTy04NjAxIG5vciBKYXZhU2NyaXB0IHN1cHBvcnRzIHNlY29uZHMgaW4gdGltZXpvbmUgb2Zmc2V0c1xuICAgICAgLy8gc28gdGhpcyB0b2tlbiBhbHdheXMgaGFzIHRoZSBzYW1lIG91dHB1dCBhcyBgeHhgXG5cbiAgICAgIGNhc2UgJ3h4eHgnOlxuICAgICAgY2FzZSAneHgnOlxuICAgICAgICAvLyBIb3VycyBhbmQgbWludXRlcyB3aXRob3V0IGA6YCBkZWxpbWl0ZXJcbiAgICAgICAgcmV0dXJuIGZvcm1hdFRpbWV6b25lKHRpbWV6b25lT2Zmc2V0KTtcbiAgICAgIC8vIEhvdXJzLCBtaW51dGVzIGFuZCBvcHRpb25hbCBzZWNvbmRzIHdpdGggYDpgIGRlbGltaXRlclxuICAgICAgLy8gTm90ZTogbmVpdGhlciBJU08tODYwMSBub3IgSmF2YVNjcmlwdCBzdXBwb3J0cyBzZWNvbmRzIGluIHRpbWV6b25lIG9mZnNldHNcbiAgICAgIC8vIHNvIHRoaXMgdG9rZW4gYWx3YXlzIGhhcyB0aGUgc2FtZSBvdXRwdXQgYXMgYHh4eGBcblxuICAgICAgY2FzZSAneHh4eHgnOlxuICAgICAgY2FzZSAneHh4JzogLy8gSG91cnMgYW5kIG1pbnV0ZXMgd2l0aCBgOmAgZGVsaW1pdGVyXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmb3JtYXRUaW1lem9uZSh0aW1lem9uZU9mZnNldCwgJzonKTtcbiAgICB9XG4gIH0sXG4gIC8vIFRpbWV6b25lIChHTVQpXG4gIE86IGZ1bmN0aW9uIE8oZGF0ZSwgdG9rZW4sIF9sb2NhbGl6ZSwgb3B0aW9ucykge1xuICAgIHZhciBvcmlnaW5hbERhdGUgPSBvcHRpb25zLl9vcmlnaW5hbERhdGUgfHwgZGF0ZTtcbiAgICB2YXIgdGltZXpvbmVPZmZzZXQgPSBvcmlnaW5hbERhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcblxuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIC8vIFNob3J0XG4gICAgICBjYXNlICdPJzpcbiAgICAgIGNhc2UgJ09PJzpcbiAgICAgIGNhc2UgJ09PTyc6XG4gICAgICAgIHJldHVybiAnR01UJyArIGZvcm1hdFRpbWV6b25lU2hvcnQodGltZXpvbmVPZmZzZXQsICc6Jyk7XG4gICAgICAvLyBMb25nXG5cbiAgICAgIGNhc2UgJ09PT08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgZm9ybWF0VGltZXpvbmUodGltZXpvbmVPZmZzZXQsICc6Jyk7XG4gICAgfVxuICB9LFxuICAvLyBUaW1lem9uZSAoc3BlY2lmaWMgbm9uLWxvY2F0aW9uKVxuICB6OiBmdW5jdGlvbiB6KGRhdGUsIHRva2VuLCBfbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3JpZ2luYWxEYXRlID0gb3B0aW9ucy5fb3JpZ2luYWxEYXRlIHx8IGRhdGU7XG4gICAgdmFyIHRpbWV6b25lT2Zmc2V0ID0gb3JpZ2luYWxEYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XG5cbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAvLyBTaG9ydFxuICAgICAgY2FzZSAneic6XG4gICAgICBjYXNlICd6eic6XG4gICAgICBjYXNlICd6enonOlxuICAgICAgICByZXR1cm4gJ0dNVCcgKyBmb3JtYXRUaW1lem9uZVNob3J0KHRpbWV6b25lT2Zmc2V0LCAnOicpO1xuICAgICAgLy8gTG9uZ1xuXG4gICAgICBjYXNlICd6enp6JzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnR01UJyArIGZvcm1hdFRpbWV6b25lKHRpbWV6b25lT2Zmc2V0LCAnOicpO1xuICAgIH1cbiAgfSxcbiAgLy8gU2Vjb25kcyB0aW1lc3RhbXBcbiAgdDogZnVuY3Rpb24gdChkYXRlLCB0b2tlbiwgX2xvY2FsaXplLCBvcHRpb25zKSB7XG4gICAgdmFyIG9yaWdpbmFsRGF0ZSA9IG9wdGlvbnMuX29yaWdpbmFsRGF0ZSB8fCBkYXRlO1xuICAgIHZhciB0aW1lc3RhbXAgPSBNYXRoLmZsb29yKG9yaWdpbmFsRGF0ZS5nZXRUaW1lKCkgLyAxMDAwKTtcbiAgICByZXR1cm4gYWRkTGVhZGluZ1plcm9zKHRpbWVzdGFtcCwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gTWlsbGlzZWNvbmRzIHRpbWVzdGFtcFxuICBUOiBmdW5jdGlvbiBUKGRhdGUsIHRva2VuLCBfbG9jYWxpemUsIG9wdGlvbnMpIHtcbiAgICB2YXIgb3JpZ2luYWxEYXRlID0gb3B0aW9ucy5fb3JpZ2luYWxEYXRlIHx8IGRhdGU7XG4gICAgdmFyIHRpbWVzdGFtcCA9IG9yaWdpbmFsRGF0ZS5nZXRUaW1lKCk7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyh0aW1lc3RhbXAsIHRva2VuLmxlbmd0aCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGZvcm1hdFRpbWV6b25lU2hvcnQob2Zmc2V0LCBkaXJ0eURlbGltaXRlcikge1xuICB2YXIgc2lnbiA9IG9mZnNldCA+IDAgPyAnLScgOiAnKyc7XG4gIHZhciBhYnNPZmZzZXQgPSBNYXRoLmFicyhvZmZzZXQpO1xuICB2YXIgaG91cnMgPSBNYXRoLmZsb29yKGFic09mZnNldCAvIDYwKTtcbiAgdmFyIG1pbnV0ZXMgPSBhYnNPZmZzZXQgJSA2MDtcblxuICBpZiAobWludXRlcyA9PT0gMCkge1xuICAgIHJldHVybiBzaWduICsgU3RyaW5nKGhvdXJzKTtcbiAgfVxuXG4gIHZhciBkZWxpbWl0ZXIgPSBkaXJ0eURlbGltaXRlciB8fCAnJztcbiAgcmV0dXJuIHNpZ24gKyBTdHJpbmcoaG91cnMpICsgZGVsaW1pdGVyICsgYWRkTGVhZGluZ1plcm9zKG1pbnV0ZXMsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRUaW1lem9uZVdpdGhPcHRpb25hbE1pbnV0ZXMob2Zmc2V0LCBkaXJ0eURlbGltaXRlcikge1xuICBpZiAob2Zmc2V0ICUgNjAgPT09IDApIHtcbiAgICB2YXIgc2lnbiA9IG9mZnNldCA+IDAgPyAnLScgOiAnKyc7XG4gICAgcmV0dXJuIHNpZ24gKyBhZGRMZWFkaW5nWmVyb3MoTWF0aC5hYnMob2Zmc2V0KSAvIDYwLCAyKTtcbiAgfVxuXG4gIHJldHVybiBmb3JtYXRUaW1lem9uZShvZmZzZXQsIGRpcnR5RGVsaW1pdGVyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VGltZXpvbmUob2Zmc2V0LCBkaXJ0eURlbGltaXRlcikge1xuICB2YXIgZGVsaW1pdGVyID0gZGlydHlEZWxpbWl0ZXIgfHwgJyc7XG4gIHZhciBzaWduID0gb2Zmc2V0ID4gMCA/ICctJyA6ICcrJztcbiAgdmFyIGFic09mZnNldCA9IE1hdGguYWJzKG9mZnNldCk7XG4gIHZhciBob3VycyA9IGFkZExlYWRpbmdaZXJvcyhNYXRoLmZsb29yKGFic09mZnNldCAvIDYwKSwgMik7XG4gIHZhciBtaW51dGVzID0gYWRkTGVhZGluZ1plcm9zKGFic09mZnNldCAlIDYwLCAyKTtcbiAgcmV0dXJuIHNpZ24gKyBob3VycyArIGRlbGltaXRlciArIG1pbnV0ZXM7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZvcm1hdHRlcnM7IiwiaW1wb3J0IGFkZExlYWRpbmdaZXJvcyBmcm9tIFwiLi4vLi4vYWRkTGVhZGluZ1plcm9zL2luZGV4LmpzXCI7XG4vKlxuICogfCAgICAgfCBVbml0ICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgfCBVbml0ICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCAgYSAgfCBBTSwgUE0gICAgICAgICAgICAgICAgICAgICAgICAgfCAgQSogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgZCAgfCBEYXkgb2YgbW9udGggICAgICAgICAgICAgICAgICAgfCAgRCAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgaCAgfCBIb3VyIFsxLTEyXSAgICAgICAgICAgICAgICAgICAgfCAgSCAgfCBIb3VyIFswLTIzXSAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgbSAgfCBNaW51dGUgICAgICAgICAgICAgICAgICAgICAgICAgfCAgTSAgfCBNb250aCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCAgcyAgfCBTZWNvbmQgICAgICAgICAgICAgICAgICAgICAgICAgfCAgUyAgfCBGcmFjdGlvbiBvZiBzZWNvbmQgICAgICAgICAgICAgfFxuICogfCAgeSAgfCBZZWFyIChhYnMpICAgICAgICAgICAgICAgICAgICAgfCAgWSAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICpcbiAqIExldHRlcnMgbWFya2VkIGJ5ICogYXJlIG5vdCBpbXBsZW1lbnRlZCBidXQgcmVzZXJ2ZWQgYnkgVW5pY29kZSBzdGFuZGFyZC5cbiAqL1xuXG52YXIgZm9ybWF0dGVycyA9IHtcbiAgLy8gWWVhclxuICB5OiBmdW5jdGlvbiB5KGRhdGUsIHRva2VuKSB7XG4gICAgLy8gRnJvbSBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LTMxL3RyMzUtZGF0ZXMuaHRtbCNEYXRlX0Zvcm1hdF90b2tlbnNcbiAgICAvLyB8IFllYXIgICAgIHwgICAgIHkgfCB5eSB8ICAgeXl5IHwgIHl5eXkgfCB5eXl5eSB8XG4gICAgLy8gfC0tLS0tLS0tLS18LS0tLS0tLXwtLS0tfC0tLS0tLS18LS0tLS0tLXwtLS0tLS0tfFxuICAgIC8vIHwgQUQgMSAgICAgfCAgICAgMSB8IDAxIHwgICAwMDEgfCAgMDAwMSB8IDAwMDAxIHxcbiAgICAvLyB8IEFEIDEyICAgIHwgICAgMTIgfCAxMiB8ICAgMDEyIHwgIDAwMTIgfCAwMDAxMiB8XG4gICAgLy8gfCBBRCAxMjMgICB8ICAgMTIzIHwgMjMgfCAgIDEyMyB8ICAwMTIzIHwgMDAxMjMgfFxuICAgIC8vIHwgQUQgMTIzNCAgfCAgMTIzNCB8IDM0IHwgIDEyMzQgfCAgMTIzNCB8IDAxMjM0IHxcbiAgICAvLyB8IEFEIDEyMzQ1IHwgMTIzNDUgfCA0NSB8IDEyMzQ1IHwgMTIzNDUgfCAxMjM0NSB8XG4gICAgdmFyIHNpZ25lZFllYXIgPSBkYXRlLmdldFVUQ0Z1bGxZZWFyKCk7IC8vIFJldHVybnMgMSBmb3IgMSBCQyAod2hpY2ggaXMgeWVhciAwIGluIEphdmFTY3JpcHQpXG5cbiAgICB2YXIgeWVhciA9IHNpZ25lZFllYXIgPiAwID8gc2lnbmVkWWVhciA6IDEgLSBzaWduZWRZZWFyO1xuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3ModG9rZW4gPT09ICd5eScgPyB5ZWFyICUgMTAwIDogeWVhciwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gTW9udGhcbiAgTTogZnVuY3Rpb24gTShkYXRlLCB0b2tlbikge1xuICAgIHZhciBtb250aCA9IGRhdGUuZ2V0VVRDTW9udGgoKTtcbiAgICByZXR1cm4gdG9rZW4gPT09ICdNJyA/IFN0cmluZyhtb250aCArIDEpIDogYWRkTGVhZGluZ1plcm9zKG1vbnRoICsgMSwgMik7XG4gIH0sXG4gIC8vIERheSBvZiB0aGUgbW9udGhcbiAgZDogZnVuY3Rpb24gZChkYXRlLCB0b2tlbikge1xuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoZGF0ZS5nZXRVVENEYXRlKCksIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIEFNIG9yIFBNXG4gIGE6IGZ1bmN0aW9uIGEoZGF0ZSwgdG9rZW4pIHtcbiAgICB2YXIgZGF5UGVyaW9kRW51bVZhbHVlID0gZGF0ZS5nZXRVVENIb3VycygpIC8gMTIgPj0gMSA/ICdwbScgOiAnYW0nO1xuXG4gICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgY2FzZSAnYSc6XG4gICAgICBjYXNlICdhYSc6XG4gICAgICAgIHJldHVybiBkYXlQZXJpb2RFbnVtVmFsdWUudG9VcHBlckNhc2UoKTtcblxuICAgICAgY2FzZSAnYWFhJzpcbiAgICAgICAgcmV0dXJuIGRheVBlcmlvZEVudW1WYWx1ZTtcblxuICAgICAgY2FzZSAnYWFhYWEnOlxuICAgICAgICByZXR1cm4gZGF5UGVyaW9kRW51bVZhbHVlWzBdO1xuXG4gICAgICBjYXNlICdhYWFhJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBkYXlQZXJpb2RFbnVtVmFsdWUgPT09ICdhbScgPyAnYS5tLicgOiAncC5tLic7XG4gICAgfVxuICB9LFxuICAvLyBIb3VyIFsxLTEyXVxuICBoOiBmdW5jdGlvbiBoKGRhdGUsIHRva2VuKSB7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXRlLmdldFVUQ0hvdXJzKCkgJSAxMiB8fCAxMiwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gSG91ciBbMC0yM11cbiAgSDogZnVuY3Rpb24gSChkYXRlLCB0b2tlbikge1xuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoZGF0ZS5nZXRVVENIb3VycygpLCB0b2tlbi5sZW5ndGgpO1xuICB9LFxuICAvLyBNaW51dGVcbiAgbTogZnVuY3Rpb24gbShkYXRlLCB0b2tlbikge1xuICAgIHJldHVybiBhZGRMZWFkaW5nWmVyb3MoZGF0ZS5nZXRVVENNaW51dGVzKCksIHRva2VuLmxlbmd0aCk7XG4gIH0sXG4gIC8vIFNlY29uZFxuICBzOiBmdW5jdGlvbiBzKGRhdGUsIHRva2VuKSB7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhkYXRlLmdldFVUQ1NlY29uZHMoKSwgdG9rZW4ubGVuZ3RoKTtcbiAgfSxcbiAgLy8gRnJhY3Rpb24gb2Ygc2Vjb25kXG4gIFM6IGZ1bmN0aW9uIFMoZGF0ZSwgdG9rZW4pIHtcbiAgICB2YXIgbnVtYmVyT2ZEaWdpdHMgPSB0b2tlbi5sZW5ndGg7XG4gICAgdmFyIG1pbGxpc2Vjb25kcyA9IGRhdGUuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gICAgdmFyIGZyYWN0aW9uYWxTZWNvbmRzID0gTWF0aC5mbG9vcihtaWxsaXNlY29uZHMgKiBNYXRoLnBvdygxMCwgbnVtYmVyT2ZEaWdpdHMgLSAzKSk7XG4gICAgcmV0dXJuIGFkZExlYWRpbmdaZXJvcyhmcmFjdGlvbmFsU2Vjb25kcywgdG9rZW4ubGVuZ3RoKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IGZvcm1hdHRlcnM7IiwidmFyIGRhdGVMb25nRm9ybWF0dGVyID0gZnVuY3Rpb24gZGF0ZUxvbmdGb3JtYXR0ZXIocGF0dGVybiwgZm9ybWF0TG9uZykge1xuICBzd2l0Y2ggKHBhdHRlcm4pIHtcbiAgICBjYXNlICdQJzpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLmRhdGUoe1xuICAgICAgICB3aWR0aDogJ3Nob3J0J1xuICAgICAgfSk7XG5cbiAgICBjYXNlICdQUCc6XG4gICAgICByZXR1cm4gZm9ybWF0TG9uZy5kYXRlKHtcbiAgICAgICAgd2lkdGg6ICdtZWRpdW0nXG4gICAgICB9KTtcblxuICAgIGNhc2UgJ1BQUCc6XG4gICAgICByZXR1cm4gZm9ybWF0TG9uZy5kYXRlKHtcbiAgICAgICAgd2lkdGg6ICdsb25nJ1xuICAgICAgfSk7XG5cbiAgICBjYXNlICdQUFBQJzpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZvcm1hdExvbmcuZGF0ZSh7XG4gICAgICAgIHdpZHRoOiAnZnVsbCdcbiAgICAgIH0pO1xuICB9XG59O1xuXG52YXIgdGltZUxvbmdGb3JtYXR0ZXIgPSBmdW5jdGlvbiB0aW1lTG9uZ0Zvcm1hdHRlcihwYXR0ZXJuLCBmb3JtYXRMb25nKSB7XG4gIHN3aXRjaCAocGF0dGVybikge1xuICAgIGNhc2UgJ3AnOlxuICAgICAgcmV0dXJuIGZvcm1hdExvbmcudGltZSh7XG4gICAgICAgIHdpZHRoOiAnc2hvcnQnXG4gICAgICB9KTtcblxuICAgIGNhc2UgJ3BwJzpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLnRpbWUoe1xuICAgICAgICB3aWR0aDogJ21lZGl1bSdcbiAgICAgIH0pO1xuXG4gICAgY2FzZSAncHBwJzpcbiAgICAgIHJldHVybiBmb3JtYXRMb25nLnRpbWUoe1xuICAgICAgICB3aWR0aDogJ2xvbmcnXG4gICAgICB9KTtcblxuICAgIGNhc2UgJ3BwcHAnOlxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZm9ybWF0TG9uZy50aW1lKHtcbiAgICAgICAgd2lkdGg6ICdmdWxsJ1xuICAgICAgfSk7XG4gIH1cbn07XG5cbnZhciBkYXRlVGltZUxvbmdGb3JtYXR0ZXIgPSBmdW5jdGlvbiBkYXRlVGltZUxvbmdGb3JtYXR0ZXIocGF0dGVybiwgZm9ybWF0TG9uZykge1xuICB2YXIgbWF0Y2hSZXN1bHQgPSBwYXR0ZXJuLm1hdGNoKC8oUCspKHArKT8vKSB8fCBbXTtcbiAgdmFyIGRhdGVQYXR0ZXJuID0gbWF0Y2hSZXN1bHRbMV07XG4gIHZhciB0aW1lUGF0dGVybiA9IG1hdGNoUmVzdWx0WzJdO1xuXG4gIGlmICghdGltZVBhdHRlcm4pIHtcbiAgICByZXR1cm4gZGF0ZUxvbmdGb3JtYXR0ZXIocGF0dGVybiwgZm9ybWF0TG9uZyk7XG4gIH1cblxuICB2YXIgZGF0ZVRpbWVGb3JtYXQ7XG5cbiAgc3dpdGNoIChkYXRlUGF0dGVybikge1xuICAgIGNhc2UgJ1AnOlxuICAgICAgZGF0ZVRpbWVGb3JtYXQgPSBmb3JtYXRMb25nLmRhdGVUaW1lKHtcbiAgICAgICAgd2lkdGg6ICdzaG9ydCdcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdQUCc6XG4gICAgICBkYXRlVGltZUZvcm1hdCA9IGZvcm1hdExvbmcuZGF0ZVRpbWUoe1xuICAgICAgICB3aWR0aDogJ21lZGl1bSdcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdQUFAnOlxuICAgICAgZGF0ZVRpbWVGb3JtYXQgPSBmb3JtYXRMb25nLmRhdGVUaW1lKHtcbiAgICAgICAgd2lkdGg6ICdsb25nJ1xuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ1BQUFAnOlxuICAgIGRlZmF1bHQ6XG4gICAgICBkYXRlVGltZUZvcm1hdCA9IGZvcm1hdExvbmcuZGF0ZVRpbWUoe1xuICAgICAgICB3aWR0aDogJ2Z1bGwnXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIGRhdGVUaW1lRm9ybWF0LnJlcGxhY2UoJ3t7ZGF0ZX19JywgZGF0ZUxvbmdGb3JtYXR0ZXIoZGF0ZVBhdHRlcm4sIGZvcm1hdExvbmcpKS5yZXBsYWNlKCd7e3RpbWV9fScsIHRpbWVMb25nRm9ybWF0dGVyKHRpbWVQYXR0ZXJuLCBmb3JtYXRMb25nKSk7XG59O1xuXG52YXIgbG9uZ0Zvcm1hdHRlcnMgPSB7XG4gIHA6IHRpbWVMb25nRm9ybWF0dGVyLFxuICBQOiBkYXRlVGltZUxvbmdGb3JtYXR0ZXJcbn07XG5leHBvcnQgZGVmYXVsdCBsb25nRm9ybWF0dGVyczsiLCIvKipcbiAqIEdvb2dsZSBDaHJvbWUgYXMgb2YgNjcuMC4zMzk2Ljg3IGludHJvZHVjZWQgdGltZXpvbmVzIHdpdGggb2Zmc2V0IHRoYXQgaW5jbHVkZXMgc2Vjb25kcy5cbiAqIFRoZXkgdXN1YWxseSBhcHBlYXIgZm9yIGRhdGVzIHRoYXQgZGVub3RlIHRpbWUgYmVmb3JlIHRoZSB0aW1lem9uZXMgd2VyZSBpbnRyb2R1Y2VkXG4gKiAoZS5nLiBmb3IgJ0V1cm9wZS9QcmFndWUnIHRpbWV6b25lIHRoZSBvZmZzZXQgaXMgR01UKzAwOjU3OjQ0IGJlZm9yZSAxIE9jdG9iZXIgMTg5MVxuICogYW5kIEdNVCswMTowMDowMCBhZnRlciB0aGF0IGRhdGUpXG4gKlxuICogRGF0ZSNnZXRUaW1lem9uZU9mZnNldCByZXR1cm5zIHRoZSBvZmZzZXQgaW4gbWludXRlcyBhbmQgd291bGQgcmV0dXJuIDU3IGZvciB0aGUgZXhhbXBsZSBhYm92ZSxcbiAqIHdoaWNoIHdvdWxkIGxlYWQgdG8gaW5jb3JyZWN0IGNhbGN1bGF0aW9ucy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHRpbWV6b25lIG9mZnNldCBpbiBtaWxsaXNlY29uZHMgdGhhdCB0YWtlcyBzZWNvbmRzIGluIGFjY291bnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFRpbWV6b25lT2Zmc2V0SW5NaWxsaXNlY29uZHMoZGF0ZSkge1xuICB2YXIgdXRjRGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSwgZGF0ZS5nZXRIb3VycygpLCBkYXRlLmdldE1pbnV0ZXMoKSwgZGF0ZS5nZXRTZWNvbmRzKCksIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpKTtcbiAgdXRjRGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkpO1xuICByZXR1cm4gZGF0ZS5nZXRUaW1lKCkgLSB1dGNEYXRlLmdldFRpbWUoKTtcbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xudmFyIE1JTExJU0VDT05EU19JTl9EQVkgPSA4NjQwMDAwMDtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFVUQ0RheU9mWWVhcihkaXJ0eURhdGUpIHtcbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciB0aW1lc3RhbXAgPSBkYXRlLmdldFRpbWUoKTtcbiAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIHN0YXJ0T2ZZZWFyVGltZXN0YW1wID0gZGF0ZS5nZXRUaW1lKCk7XG4gIHZhciBkaWZmZXJlbmNlID0gdGltZXN0YW1wIC0gc3RhcnRPZlllYXJUaW1lc3RhbXA7XG4gIHJldHVybiBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyBNSUxMSVNFQ09ORFNfSU5fREFZKSArIDE7XG59IiwiaW1wb3J0IHRvRGF0ZSBmcm9tIFwiLi4vLi4vdG9EYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ0lTT1dlZWsgZnJvbSBcIi4uL3N0YXJ0T2ZVVENJU09XZWVrL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ0lTT1dlZWtZZWFyIGZyb20gXCIuLi9zdGFydE9mVVRDSVNPV2Vla1llYXIvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xudmFyIE1JTExJU0VDT05EU19JTl9XRUVLID0gNjA0ODAwMDAwO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VVRDSVNPV2VlayhkaXJ0eURhdGUpIHtcbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciBkaWZmID0gc3RhcnRPZlVUQ0lTT1dlZWsoZGF0ZSkuZ2V0VGltZSgpIC0gc3RhcnRPZlVUQ0lTT1dlZWtZZWFyKGRhdGUpLmdldFRpbWUoKTsgLy8gUm91bmQgdGhlIG51bWJlciBvZiBkYXlzIHRvIHRoZSBuZWFyZXN0IGludGVnZXJcbiAgLy8gYmVjYXVzZSB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpbiBhIHdlZWsgaXMgbm90IGNvbnN0YW50XG4gIC8vIChlLmcuIGl0J3MgZGlmZmVyZW50IGluIHRoZSB3ZWVrIG9mIHRoZSBkYXlsaWdodCBzYXZpbmcgdGltZSBjbG9jayBzaGlmdClcblxuICByZXR1cm4gTWF0aC5yb3VuZChkaWZmIC8gTUlMTElTRUNPTkRTX0lOX1dFRUspICsgMTtcbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuaW1wb3J0IHN0YXJ0T2ZVVENJU09XZWVrIGZyb20gXCIuLi9zdGFydE9mVVRDSVNPV2Vlay9pbmRleC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VVRDSVNPV2Vla1llYXIoZGlydHlEYXRlKSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgZGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuICB2YXIgeWVhciA9IGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbiAgdmFyIGZvdXJ0aE9mSmFudWFyeU9mTmV4dFllYXIgPSBuZXcgRGF0ZSgwKTtcbiAgZm91cnRoT2ZKYW51YXJ5T2ZOZXh0WWVhci5zZXRVVENGdWxsWWVhcih5ZWFyICsgMSwgMCwgNCk7XG4gIGZvdXJ0aE9mSmFudWFyeU9mTmV4dFllYXIuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIHZhciBzdGFydE9mTmV4dFllYXIgPSBzdGFydE9mVVRDSVNPV2Vlayhmb3VydGhPZkphbnVhcnlPZk5leHRZZWFyKTtcbiAgdmFyIGZvdXJ0aE9mSmFudWFyeU9mVGhpc1llYXIgPSBuZXcgRGF0ZSgwKTtcbiAgZm91cnRoT2ZKYW51YXJ5T2ZUaGlzWWVhci5zZXRVVENGdWxsWWVhcih5ZWFyLCAwLCA0KTtcbiAgZm91cnRoT2ZKYW51YXJ5T2ZUaGlzWWVhci5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIHN0YXJ0T2ZUaGlzWWVhciA9IHN0YXJ0T2ZVVENJU09XZWVrKGZvdXJ0aE9mSmFudWFyeU9mVGhpc1llYXIpO1xuXG4gIGlmIChkYXRlLmdldFRpbWUoKSA+PSBzdGFydE9mTmV4dFllYXIuZ2V0VGltZSgpKSB7XG4gICAgcmV0dXJuIHllYXIgKyAxO1xuICB9IGVsc2UgaWYgKGRhdGUuZ2V0VGltZSgpID49IHN0YXJ0T2ZUaGlzWWVhci5nZXRUaW1lKCkpIHtcbiAgICByZXR1cm4geWVhcjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geWVhciAtIDE7XG4gIH1cbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDV2VlayBmcm9tIFwiLi4vc3RhcnRPZlVUQ1dlZWsvaW5kZXguanNcIjtcbmltcG9ydCBzdGFydE9mVVRDV2Vla1llYXIgZnJvbSBcIi4uL3N0YXJ0T2ZVVENXZWVrWWVhci9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG52YXIgTUlMTElTRUNPTkRTX0lOX1dFRUsgPSA2MDQ4MDAwMDA7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRVVENXZWVrKGRpcnR5RGF0ZSwgb3B0aW9ucykge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGRhdGUgPSB0b0RhdGUoZGlydHlEYXRlKTtcbiAgdmFyIGRpZmYgPSBzdGFydE9mVVRDV2VlayhkYXRlLCBvcHRpb25zKS5nZXRUaW1lKCkgLSBzdGFydE9mVVRDV2Vla1llYXIoZGF0ZSwgb3B0aW9ucykuZ2V0VGltZSgpOyAvLyBSb3VuZCB0aGUgbnVtYmVyIG9mIGRheXMgdG8gdGhlIG5lYXJlc3QgaW50ZWdlclxuICAvLyBiZWNhdXNlIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIGEgd2VlayBpcyBub3QgY29uc3RhbnRcbiAgLy8gKGUuZy4gaXQncyBkaWZmZXJlbnQgaW4gdGhlIHdlZWsgb2YgdGhlIGRheWxpZ2h0IHNhdmluZyB0aW1lIGNsb2NrIHNoaWZ0KVxuXG4gIHJldHVybiBNYXRoLnJvdW5kKGRpZmYgLyBNSUxMSVNFQ09ORFNfSU5fV0VFSykgKyAxO1xufSIsImltcG9ydCB0b0RhdGUgZnJvbSBcIi4uLy4uL3RvRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ1dlZWsgZnJvbSBcIi4uL3N0YXJ0T2ZVVENXZWVrL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9JbnRlZ2VyIGZyb20gXCIuLi90b0ludGVnZXIvaW5kZXguanNcIjtcbmltcG9ydCB7IGdldERlZmF1bHRPcHRpb25zIH0gZnJvbSBcIi4uL2RlZmF1bHRPcHRpb25zL2luZGV4LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRVVENXZWVrWWVhcihkaXJ0eURhdGUsIG9wdGlvbnMpIHtcbiAgdmFyIF9yZWYsIF9yZWYyLCBfcmVmMywgX29wdGlvbnMkZmlyc3RXZWVrQ29uLCBfb3B0aW9ucyRsb2NhbGUsIF9vcHRpb25zJGxvY2FsZSRvcHRpbywgX2RlZmF1bHRPcHRpb25zJGxvY2FsLCBfZGVmYXVsdE9wdGlvbnMkbG9jYWwyO1xuXG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuICB2YXIgZGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuICB2YXIgeWVhciA9IGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbiAgdmFyIGRlZmF1bHRPcHRpb25zID0gZ2V0RGVmYXVsdE9wdGlvbnMoKTtcbiAgdmFyIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA9IHRvSW50ZWdlcigoX3JlZiA9IChfcmVmMiA9IChfcmVmMyA9IChfb3B0aW9ucyRmaXJzdFdlZWtDb24gPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfb3B0aW9ucyRmaXJzdFdlZWtDb24gIT09IHZvaWQgMCA/IF9vcHRpb25zJGZpcnN0V2Vla0NvbiA6IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSA9IG9wdGlvbnMubG9jYWxlKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPSBfb3B0aW9ucyRsb2NhbGUub3B0aW9ucykgPT09IG51bGwgfHwgX29wdGlvbnMkbG9jYWxlJG9wdGlvID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfb3B0aW9ucyRsb2NhbGUkb3B0aW8uZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfcmVmMyAhPT0gdm9pZCAwID8gX3JlZjMgOiBkZWZhdWx0T3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYyICE9PSB2b2lkIDAgPyBfcmVmMiA6IChfZGVmYXVsdE9wdGlvbnMkbG9jYWwgPSBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDIgPSBfZGVmYXVsdE9wdGlvbnMkbG9jYWwub3B0aW9ucykgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2RlZmF1bHRPcHRpb25zJGxvY2FsMi5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYgIT09IHZvaWQgMCA/IF9yZWYgOiAxKTsgLy8gVGVzdCBpZiB3ZWVrU3RhcnRzT24gaXMgYmV0d2VlbiAxIGFuZCA3IF9hbmRfIGlzIG5vdCBOYU5cblxuICBpZiAoIShmaXJzdFdlZWtDb250YWluc0RhdGUgPj0gMSAmJiBmaXJzdFdlZWtDb250YWluc0RhdGUgPD0gNykpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignZmlyc3RXZWVrQ29udGFpbnNEYXRlIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA3IGluY2x1c2l2ZWx5Jyk7XG4gIH1cblxuICB2YXIgZmlyc3RXZWVrT2ZOZXh0WWVhciA9IG5ldyBEYXRlKDApO1xuICBmaXJzdFdlZWtPZk5leHRZZWFyLnNldFVUQ0Z1bGxZZWFyKHllYXIgKyAxLCAwLCBmaXJzdFdlZWtDb250YWluc0RhdGUpO1xuICBmaXJzdFdlZWtPZk5leHRZZWFyLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB2YXIgc3RhcnRPZk5leHRZZWFyID0gc3RhcnRPZlVUQ1dlZWsoZmlyc3RXZWVrT2ZOZXh0WWVhciwgb3B0aW9ucyk7XG4gIHZhciBmaXJzdFdlZWtPZlRoaXNZZWFyID0gbmV3IERhdGUoMCk7XG4gIGZpcnN0V2Vla09mVGhpc1llYXIuc2V0VVRDRnVsbFllYXIoeWVhciwgMCwgZmlyc3RXZWVrQ29udGFpbnNEYXRlKTtcbiAgZmlyc3RXZWVrT2ZUaGlzWWVhci5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIHN0YXJ0T2ZUaGlzWWVhciA9IHN0YXJ0T2ZVVENXZWVrKGZpcnN0V2Vla09mVGhpc1llYXIsIG9wdGlvbnMpO1xuXG4gIGlmIChkYXRlLmdldFRpbWUoKSA+PSBzdGFydE9mTmV4dFllYXIuZ2V0VGltZSgpKSB7XG4gICAgcmV0dXJuIHllYXIgKyAxO1xuICB9IGVsc2UgaWYgKGRhdGUuZ2V0VGltZSgpID49IHN0YXJ0T2ZUaGlzWWVhci5nZXRUaW1lKCkpIHtcbiAgICByZXR1cm4geWVhcjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geWVhciAtIDE7XG4gIH1cbn0iLCJ2YXIgcHJvdGVjdGVkRGF5T2ZZZWFyVG9rZW5zID0gWydEJywgJ0REJ107XG52YXIgcHJvdGVjdGVkV2Vla1llYXJUb2tlbnMgPSBbJ1lZJywgJ1lZWVknXTtcbmV4cG9ydCBmdW5jdGlvbiBpc1Byb3RlY3RlZERheU9mWWVhclRva2VuKHRva2VuKSB7XG4gIHJldHVybiBwcm90ZWN0ZWREYXlPZlllYXJUb2tlbnMuaW5kZXhPZih0b2tlbikgIT09IC0xO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvdGVjdGVkV2Vla1llYXJUb2tlbih0b2tlbikge1xuICByZXR1cm4gcHJvdGVjdGVkV2Vla1llYXJUb2tlbnMuaW5kZXhPZih0b2tlbikgIT09IC0xO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRocm93UHJvdGVjdGVkRXJyb3IodG9rZW4sIGZvcm1hdCwgaW5wdXQpIHtcbiAgaWYgKHRva2VuID09PSAnWVlZWScpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlVzZSBgeXl5eWAgaW5zdGVhZCBvZiBgWVlZWWAgKGluIGBcIi5jb25jYXQoZm9ybWF0LCBcImApIGZvciBmb3JtYXR0aW5nIHllYXJzIHRvIHRoZSBpbnB1dCBgXCIpLmNvbmNhdChpbnB1dCwgXCJgOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcIikpO1xuICB9IGVsc2UgaWYgKHRva2VuID09PSAnWVknKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJVc2UgYHl5YCBpbnN0ZWFkIG9mIGBZWWAgKGluIGBcIi5jb25jYXQoZm9ybWF0LCBcImApIGZvciBmb3JtYXR0aW5nIHllYXJzIHRvIHRoZSBpbnB1dCBgXCIpLmNvbmNhdChpbnB1dCwgXCJgOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcIikpO1xuICB9IGVsc2UgaWYgKHRva2VuID09PSAnRCcpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIlVzZSBgZGAgaW5zdGVhZCBvZiBgRGAgKGluIGBcIi5jb25jYXQoZm9ybWF0LCBcImApIGZvciBmb3JtYXR0aW5nIGRheXMgb2YgdGhlIG1vbnRoIHRvIHRoZSBpbnB1dCBgXCIpLmNvbmNhdChpbnB1dCwgXCJgOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcIikpO1xuICB9IGVsc2UgaWYgKHRva2VuID09PSAnREQnKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJVc2UgYGRkYCBpbnN0ZWFkIG9mIGBERGAgKGluIGBcIi5jb25jYXQoZm9ybWF0LCBcImApIGZvciBmb3JtYXR0aW5nIGRheXMgb2YgdGhlIG1vbnRoIHRvIHRoZSBpbnB1dCBgXCIpLmNvbmNhdChpbnB1dCwgXCJgOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcIikpO1xuICB9XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVxdWlyZWRBcmdzKHJlcXVpcmVkLCBhcmdzKSB7XG4gIGlmIChhcmdzLmxlbmd0aCA8IHJlcXVpcmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihyZXF1aXJlZCArICcgYXJndW1lbnQnICsgKHJlcXVpcmVkID4gMSA/ICdzJyA6ICcnKSArICcgcmVxdWlyZWQsIGJ1dCBvbmx5ICcgKyBhcmdzLmxlbmd0aCArICcgcHJlc2VudCcpO1xuICB9XG59IiwiaW1wb3J0IHRvRGF0ZSBmcm9tIFwiLi4vLi4vdG9EYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0YXJ0T2ZVVENJU09XZWVrKGRpcnR5RGF0ZSkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIHdlZWtTdGFydHNPbiA9IDE7XG4gIHZhciBkYXRlID0gdG9EYXRlKGRpcnR5RGF0ZSk7XG4gIHZhciBkYXkgPSBkYXRlLmdldFVUQ0RheSgpO1xuICB2YXIgZGlmZiA9IChkYXkgPCB3ZWVrU3RhcnRzT24gPyA3IDogMCkgKyBkYXkgLSB3ZWVrU3RhcnRzT247XG4gIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSAtIGRpZmYpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICByZXR1cm4gZGF0ZTtcbn0iLCJpbXBvcnQgZ2V0VVRDSVNPV2Vla1llYXIgZnJvbSBcIi4uL2dldFVUQ0lTT1dlZWtZZWFyL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ0lTT1dlZWsgZnJvbSBcIi4uL3N0YXJ0T2ZVVENJU09XZWVrL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN0YXJ0T2ZVVENJU09XZWVrWWVhcihkaXJ0eURhdGUpIHtcbiAgcmVxdWlyZWRBcmdzKDEsIGFyZ3VtZW50cyk7XG4gIHZhciB5ZWFyID0gZ2V0VVRDSVNPV2Vla1llYXIoZGlydHlEYXRlKTtcbiAgdmFyIGZvdXJ0aE9mSmFudWFyeSA9IG5ldyBEYXRlKDApO1xuICBmb3VydGhPZkphbnVhcnkuc2V0VVRDRnVsbFllYXIoeWVhciwgMCwgNCk7XG4gIGZvdXJ0aE9mSmFudWFyeS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgdmFyIGRhdGUgPSBzdGFydE9mVVRDSVNPV2Vlayhmb3VydGhPZkphbnVhcnkpO1xuICByZXR1cm4gZGF0ZTtcbn0iLCJpbXBvcnQgdG9EYXRlIGZyb20gXCIuLi8uLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuaW1wb3J0IHRvSW50ZWdlciBmcm9tIFwiLi4vdG9JbnRlZ2VyL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0T3B0aW9ucyB9IGZyb20gXCIuLi9kZWZhdWx0T3B0aW9ucy9pbmRleC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RhcnRPZlVUQ1dlZWsoZGlydHlEYXRlLCBvcHRpb25zKSB7XG4gIHZhciBfcmVmLCBfcmVmMiwgX3JlZjMsIF9vcHRpb25zJHdlZWtTdGFydHNPbiwgX29wdGlvbnMkbG9jYWxlLCBfb3B0aW9ucyRsb2NhbGUkb3B0aW8sIF9kZWZhdWx0T3B0aW9ucyRsb2NhbCwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMjtcblxuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGRlZmF1bHRPcHRpb25zID0gZ2V0RGVmYXVsdE9wdGlvbnMoKTtcbiAgdmFyIHdlZWtTdGFydHNPbiA9IHRvSW50ZWdlcigoX3JlZiA9IChfcmVmMiA9IChfcmVmMyA9IChfb3B0aW9ucyR3ZWVrU3RhcnRzT24gPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMud2Vla1N0YXJ0c09uKSAhPT0gbnVsbCAmJiBfb3B0aW9ucyR3ZWVrU3RhcnRzT24gIT09IHZvaWQgMCA/IF9vcHRpb25zJHdlZWtTdGFydHNPbiA6IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSA9IG9wdGlvbnMubG9jYWxlKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPSBfb3B0aW9ucyRsb2NhbGUub3B0aW9ucykgPT09IG51bGwgfHwgX29wdGlvbnMkbG9jYWxlJG9wdGlvID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfb3B0aW9ucyRsb2NhbGUkb3B0aW8ud2Vla1N0YXJ0c09uKSAhPT0gbnVsbCAmJiBfcmVmMyAhPT0gdm9pZCAwID8gX3JlZjMgOiBkZWZhdWx0T3B0aW9ucy53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9yZWYyICE9PSB2b2lkIDAgPyBfcmVmMiA6IChfZGVmYXVsdE9wdGlvbnMkbG9jYWwgPSBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDIgPSBfZGVmYXVsdE9wdGlvbnMkbG9jYWwub3B0aW9ucykgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2RlZmF1bHRPcHRpb25zJGxvY2FsMi53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9yZWYgIT09IHZvaWQgMCA/IF9yZWYgOiAwKTsgLy8gVGVzdCBpZiB3ZWVrU3RhcnRzT24gaXMgYmV0d2VlbiAwIGFuZCA2IF9hbmRfIGlzIG5vdCBOYU5cblxuICBpZiAoISh3ZWVrU3RhcnRzT24gPj0gMCAmJiB3ZWVrU3RhcnRzT24gPD0gNikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignd2Vla1N0YXJ0c09uIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA2IGluY2x1c2l2ZWx5Jyk7XG4gIH1cblxuICB2YXIgZGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuICB2YXIgZGF5ID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgdmFyIGRpZmYgPSAoZGF5IDwgd2Vla1N0YXJ0c09uID8gNyA6IDApICsgZGF5IC0gd2Vla1N0YXJ0c09uO1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgLSBkaWZmKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgcmV0dXJuIGRhdGU7XG59IiwiaW1wb3J0IGdldFVUQ1dlZWtZZWFyIGZyb20gXCIuLi9nZXRVVENXZWVrWWVhci9pbmRleC5qc1wiO1xuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgc3RhcnRPZlVUQ1dlZWsgZnJvbSBcIi4uL3N0YXJ0T2ZVVENXZWVrL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9JbnRlZ2VyIGZyb20gXCIuLi90b0ludGVnZXIvaW5kZXguanNcIjtcbmltcG9ydCB7IGdldERlZmF1bHRPcHRpb25zIH0gZnJvbSBcIi4uL2RlZmF1bHRPcHRpb25zL2luZGV4LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzdGFydE9mVVRDV2Vla1llYXIoZGlydHlEYXRlLCBvcHRpb25zKSB7XG4gIHZhciBfcmVmLCBfcmVmMiwgX3JlZjMsIF9vcHRpb25zJGZpcnN0V2Vla0NvbiwgX29wdGlvbnMkbG9jYWxlLCBfb3B0aW9ucyRsb2NhbGUkb3B0aW8sIF9kZWZhdWx0T3B0aW9ucyRsb2NhbCwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMjtcblxuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGRlZmF1bHRPcHRpb25zID0gZ2V0RGVmYXVsdE9wdGlvbnMoKTtcbiAgdmFyIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA9IHRvSW50ZWdlcigoX3JlZiA9IChfcmVmMiA9IChfcmVmMyA9IChfb3B0aW9ucyRmaXJzdFdlZWtDb24gPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfb3B0aW9ucyRmaXJzdFdlZWtDb24gIT09IHZvaWQgMCA/IF9vcHRpb25zJGZpcnN0V2Vla0NvbiA6IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZSA9IG9wdGlvbnMubG9jYWxlKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0aW9ucyRsb2NhbGUkb3B0aW8gPSBfb3B0aW9ucyRsb2NhbGUub3B0aW9ucykgPT09IG51bGwgfHwgX29wdGlvbnMkbG9jYWxlJG9wdGlvID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfb3B0aW9ucyRsb2NhbGUkb3B0aW8uZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfcmVmMyAhPT0gdm9pZCAwID8gX3JlZjMgOiBkZWZhdWx0T3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYyICE9PSB2b2lkIDAgPyBfcmVmMiA6IChfZGVmYXVsdE9wdGlvbnMkbG9jYWwgPSBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDIgPSBfZGVmYXVsdE9wdGlvbnMkbG9jYWwub3B0aW9ucykgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2RlZmF1bHRPcHRpb25zJGxvY2FsMi5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYgIT09IHZvaWQgMCA/IF9yZWYgOiAxKTtcbiAgdmFyIHllYXIgPSBnZXRVVENXZWVrWWVhcihkaXJ0eURhdGUsIG9wdGlvbnMpO1xuICB2YXIgZmlyc3RXZWVrID0gbmV3IERhdGUoMCk7XG4gIGZpcnN0V2Vlay5zZXRVVENGdWxsWWVhcih5ZWFyLCAwLCBmaXJzdFdlZWtDb250YWluc0RhdGUpO1xuICBmaXJzdFdlZWsuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIHZhciBkYXRlID0gc3RhcnRPZlVUQ1dlZWsoZmlyc3RXZWVrLCBvcHRpb25zKTtcbiAgcmV0dXJuIGRhdGU7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdG9JbnRlZ2VyKGRpcnR5TnVtYmVyKSB7XG4gIGlmIChkaXJ0eU51bWJlciA9PT0gbnVsbCB8fCBkaXJ0eU51bWJlciA9PT0gdHJ1ZSB8fCBkaXJ0eU51bWJlciA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gTmFOO1xuICB9XG5cbiAgdmFyIG51bWJlciA9IE51bWJlcihkaXJ0eU51bWJlcik7XG5cbiAgaWYgKGlzTmFOKG51bWJlcikpIHtcbiAgICByZXR1cm4gbnVtYmVyO1xuICB9XG5cbiAgcmV0dXJuIG51bWJlciA8IDAgPyBNYXRoLmNlaWwobnVtYmVyKSA6IE1hdGguZmxvb3IobnVtYmVyKTtcbn0iLCJpbXBvcnQgdG9JbnRlZ2VyIGZyb20gXCIuLi9fbGliL3RvSW50ZWdlci9pbmRleC5qc1wiO1xuaW1wb3J0IHRvRGF0ZSBmcm9tIFwiLi4vdG9EYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuLyoqXG4gKiBAbmFtZSBhZGRNaWxsaXNlY29uZHNcbiAqIEBjYXRlZ29yeSBNaWxsaXNlY29uZCBIZWxwZXJzXG4gKiBAc3VtbWFyeSBBZGQgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIHRoZSBnaXZlbiBkYXRlLlxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQWRkIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aGUgZ2l2ZW4gZGF0ZS5cbiAqXG4gKiBAcGFyYW0ge0RhdGV8TnVtYmVyfSBkYXRlIC0gdGhlIGRhdGUgdG8gYmUgY2hhbmdlZFxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCAtIHRoZSBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIGJlIGFkZGVkLiBQb3NpdGl2ZSBkZWNpbWFscyB3aWxsIGJlIHJvdW5kZWQgdXNpbmcgYE1hdGguZmxvb3JgLCBkZWNpbWFscyBsZXNzIHRoYW4gemVybyB3aWxsIGJlIHJvdW5kZWQgdXNpbmcgYE1hdGguY2VpbGAuXG4gKiBAcmV0dXJucyB7RGF0ZX0gdGhlIG5ldyBkYXRlIHdpdGggdGhlIG1pbGxpc2Vjb25kcyBhZGRlZFxuICogQHRocm93cyB7VHlwZUVycm9yfSAyIGFyZ3VtZW50cyByZXF1aXJlZFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBBZGQgNzUwIG1pbGxpc2Vjb25kcyB0byAxMCBKdWx5IDIwMTQgMTI6NDU6MzAuMDAwOlxuICogY29uc3QgcmVzdWx0ID0gYWRkTWlsbGlzZWNvbmRzKG5ldyBEYXRlKDIwMTQsIDYsIDEwLCAxMiwgNDUsIDMwLCAwKSwgNzUwKVxuICogLy89PiBUaHUgSnVsIDEwIDIwMTQgMTI6NDU6MzAuNzUwXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkTWlsbGlzZWNvbmRzKGRpcnR5RGF0ZSwgZGlydHlBbW91bnQpIHtcbiAgcmVxdWlyZWRBcmdzKDIsIGFyZ3VtZW50cyk7XG4gIHZhciB0aW1lc3RhbXAgPSB0b0RhdGUoZGlydHlEYXRlKS5nZXRUaW1lKCk7XG4gIHZhciBhbW91bnQgPSB0b0ludGVnZXIoZGlydHlBbW91bnQpO1xuICByZXR1cm4gbmV3IERhdGUodGltZXN0YW1wICsgYW1vdW50KTtcbn0iLCJpbXBvcnQgaXNWYWxpZCBmcm9tIFwiLi4vaXNWYWxpZC9pbmRleC5qc1wiO1xuaW1wb3J0IHN1Yk1pbGxpc2Vjb25kcyBmcm9tIFwiLi4vc3ViTWlsbGlzZWNvbmRzL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9EYXRlIGZyb20gXCIuLi90b0RhdGUvaW5kZXguanNcIjtcbmltcG9ydCBmb3JtYXR0ZXJzIGZyb20gXCIuLi9fbGliL2Zvcm1hdC9mb3JtYXR0ZXJzL2luZGV4LmpzXCI7XG5pbXBvcnQgbG9uZ0Zvcm1hdHRlcnMgZnJvbSBcIi4uL19saWIvZm9ybWF0L2xvbmdGb3JtYXR0ZXJzL2luZGV4LmpzXCI7XG5pbXBvcnQgZ2V0VGltZXpvbmVPZmZzZXRJbk1pbGxpc2Vjb25kcyBmcm9tIFwiLi4vX2xpYi9nZXRUaW1lem9uZU9mZnNldEluTWlsbGlzZWNvbmRzL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBpc1Byb3RlY3RlZERheU9mWWVhclRva2VuLCBpc1Byb3RlY3RlZFdlZWtZZWFyVG9rZW4sIHRocm93UHJvdGVjdGVkRXJyb3IgfSBmcm9tIFwiLi4vX2xpYi9wcm90ZWN0ZWRUb2tlbnMvaW5kZXguanNcIjtcbmltcG9ydCB0b0ludGVnZXIgZnJvbSBcIi4uL19saWIvdG9JbnRlZ2VyL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdE9wdGlvbnMgfSBmcm9tIFwiLi4vX2xpYi9kZWZhdWx0T3B0aW9ucy9pbmRleC5qc1wiO1xuaW1wb3J0IGRlZmF1bHRMb2NhbGUgZnJvbSBcIi4uL19saWIvZGVmYXVsdExvY2FsZS9pbmRleC5qc1wiOyAvLyBUaGlzIFJlZ0V4cCBjb25zaXN0cyBvZiB0aHJlZSBwYXJ0cyBzZXBhcmF0ZWQgYnkgYHxgOlxuLy8gLSBbeVlRcU1Md0lkRGVjaWhIS2ttc11vIG1hdGNoZXMgYW55IGF2YWlsYWJsZSBvcmRpbmFsIG51bWJlciB0b2tlblxuLy8gICAob25lIG9mIHRoZSBjZXJ0YWluIGxldHRlcnMgZm9sbG93ZWQgYnkgYG9gKVxuLy8gLSAoXFx3KVxcMSogbWF0Y2hlcyBhbnkgc2VxdWVuY2VzIG9mIHRoZSBzYW1lIGxldHRlclxuLy8gLSAnJyBtYXRjaGVzIHR3byBxdW90ZSBjaGFyYWN0ZXJzIGluIGEgcm93XG4vLyAtICcoJyd8W14nXSkrKCd8JCkgbWF0Y2hlcyBhbnl0aGluZyBzdXJyb3VuZGVkIGJ5IHR3byBxdW90ZSBjaGFyYWN0ZXJzICgnKSxcbi8vICAgZXhjZXB0IGEgc2luZ2xlIHF1b3RlIHN5bWJvbCwgd2hpY2ggZW5kcyB0aGUgc2VxdWVuY2UuXG4vLyAgIFR3byBxdW90ZSBjaGFyYWN0ZXJzIGRvIG5vdCBlbmQgdGhlIHNlcXVlbmNlLlxuLy8gICBJZiB0aGVyZSBpcyBubyBtYXRjaGluZyBzaW5nbGUgcXVvdGVcbi8vICAgdGhlbiB0aGUgc2VxdWVuY2Ugd2lsbCBjb250aW51ZSB1bnRpbCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcuXG4vLyAtIC4gbWF0Y2hlcyBhbnkgc2luZ2xlIGNoYXJhY3RlciB1bm1hdGNoZWQgYnkgcHJldmlvdXMgcGFydHMgb2YgdGhlIFJlZ0V4cHNcblxudmFyIGZvcm1hdHRpbmdUb2tlbnNSZWdFeHAgPSAvW3lZUXFNTHdJZERlY2loSEtrbXNdb3woXFx3KVxcMSp8Jyd8JygnJ3xbXiddKSsoJ3wkKXwuL2c7IC8vIFRoaXMgUmVnRXhwIGNhdGNoZXMgc3ltYm9scyBlc2NhcGVkIGJ5IHF1b3RlcywgYW5kIGFsc29cbi8vIHNlcXVlbmNlcyBvZiBzeW1ib2xzIFAsIHAsIGFuZCB0aGUgY29tYmluYXRpb25zIGxpa2UgYFBQUFBQUFBwcHBwcGBcblxudmFyIGxvbmdGb3JtYXR0aW5nVG9rZW5zUmVnRXhwID0gL1ArcCt8UCt8cCt8Jyd8JygnJ3xbXiddKSsoJ3wkKXwuL2c7XG52YXIgZXNjYXBlZFN0cmluZ1JlZ0V4cCA9IC9eJyhbXl0qPyknPyQvO1xudmFyIGRvdWJsZVF1b3RlUmVnRXhwID0gLycnL2c7XG52YXIgdW5lc2NhcGVkTGF0aW5DaGFyYWN0ZXJSZWdFeHAgPSAvW2EtekEtWl0vO1xuLyoqXG4gKiBAbmFtZSBmb3JtYXRcbiAqIEBjYXRlZ29yeSBDb21tb24gSGVscGVyc1xuICogQHN1bW1hcnkgRm9ybWF0IHRoZSBkYXRlLlxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJuIHRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmcgaW4gdGhlIGdpdmVuIGZvcm1hdC4gVGhlIHJlc3VsdCBtYXkgdmFyeSBieSBsb2NhbGUuXG4gKlxuICogPiDimqDvuI8gUGxlYXNlIG5vdGUgdGhhdCB0aGUgYGZvcm1hdGAgdG9rZW5zIGRpZmZlciBmcm9tIE1vbWVudC5qcyBhbmQgb3RoZXIgbGlicmFyaWVzLlxuICogPiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqXG4gKiBUaGUgY2hhcmFjdGVycyB3cmFwcGVkIGJldHdlZW4gdHdvIHNpbmdsZSBxdW90ZXMgY2hhcmFjdGVycyAoJykgYXJlIGVzY2FwZWQuXG4gKiBUd28gc2luZ2xlIHF1b3RlcyBpbiBhIHJvdywgd2hldGhlciBpbnNpZGUgb3Igb3V0c2lkZSBhIHF1b3RlZCBzZXF1ZW5jZSwgcmVwcmVzZW50IGEgJ3JlYWwnIHNpbmdsZSBxdW90ZS5cbiAqIChzZWUgdGhlIGxhc3QgZXhhbXBsZSlcbiAqXG4gKiBGb3JtYXQgb2YgdGhlIHN0cmluZyBpcyBiYXNlZCBvbiBVbmljb2RlIFRlY2huaWNhbCBTdGFuZGFyZCAjMzU6XG4gKiBodHRwczovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRmllbGRfU3ltYm9sX1RhYmxlXG4gKiB3aXRoIGEgZmV3IGFkZGl0aW9ucyAoc2VlIG5vdGUgNyBiZWxvdyB0aGUgdGFibGUpLlxuICpcbiAqIEFjY2VwdGVkIHBhdHRlcm5zOlxuICogfCBVbml0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUGF0dGVybiB8IFJlc3VsdCBleGFtcGxlcyAgICAgICAgICAgICAgICAgICB8IE5vdGVzIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS18XG4gKiB8IEVyYSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBHLi5HR0cgIHwgQUQsIEJDICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR0dHRyAgICB8IEFubm8gRG9taW5pLCBCZWZvcmUgQ2hyaXN0ICAgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEdHR0dHICAgfCBBLCBCICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IENhbGVuZGFyIHllYXIgICAgICAgICAgICAgICAgICAgfCB5ICAgICAgIHwgNDQsIDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeW8gICAgICB8IDQ0dGgsIDFzdCwgMHRoLCAxN3RoICAgICAgICAgICAgICB8IDUsNyAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHl5ICAgICAgfCA0NCwgMDEsIDAwLCAxNyAgICAgICAgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB5eXkgICAgIHwgMDQ0LCAwMDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeXl5eSAgICB8IDAwNDQsIDAwMDEsIDE5MDAsIDIwMTcgICAgICAgICAgICB8IDUgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHl5eXl5ICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzLDUgICB8XG4gKiB8IExvY2FsIHdlZWstbnVtYmVyaW5nIHllYXIgICAgICAgfCBZICAgICAgIHwgNDQsIDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWW8gICAgICB8IDQ0dGgsIDFzdCwgMTkwMHRoLCAyMDE3dGggICAgICAgICB8IDUsNyAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFlZICAgICAgfCA0NCwgMDEsIDAwLCAxNyAgICAgICAgICAgICAgICAgICAgfCA1LDggICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBZWVkgICAgIHwgMDQ0LCAwMDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWVlZWSAgICB8IDAwNDQsIDAwMDEsIDE5MDAsIDIwMTcgICAgICAgICAgICB8IDUsOCAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFlZWVlZICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzLDUgICB8XG4gKiB8IElTTyB3ZWVrLW51bWJlcmluZyB5ZWFyICAgICAgICAgfCBSICAgICAgIHwgLTQzLCAwLCAxLCAxOTAwLCAyMDE3ICAgICAgICAgICAgIHwgNSw3ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUlIgICAgICB8IC00MywgMDAsIDAxLCAxOTAwLCAyMDE3ICAgICAgICAgICB8IDUsNyAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFJSUiAgICAgfCAtMDQzLCAwMDAsIDAwMSwgMTkwMCwgMjAxNyAgICAgICAgfCA1LDcgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBSUlJSICAgIHwgLTAwNDMsIDAwMDAsIDAwMDEsIDE5MDAsIDIwMTcgICAgIHwgNSw3ICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUlJSUlIgICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDMsNSw3IHxcbiAqIHwgRXh0ZW5kZWQgeWVhciAgICAgICAgICAgICAgICAgICB8IHUgICAgICAgfCAtNDMsIDAsIDEsIDE5MDAsIDIwMTcgICAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB1dSAgICAgIHwgLTQzLCAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICAgIHwgNSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgdXV1ICAgICB8IC0wNDMsIDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgICB8IDUgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHV1dXUgICAgfCAtMDA0MywgMDAwMSwgMTkwMCwgMjAxNyAgICAgICAgICAgfCA1ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB1dXV1dSAgIHwgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMyw1ICAgfFxuICogfCBRdWFydGVyIChmb3JtYXR0aW5nKSAgICAgICAgICAgIHwgUSAgICAgICB8IDEsIDIsIDMsIDQgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFFvICAgICAgfCAxc3QsIDJuZCwgM3JkLCA0dGggICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBRUSAgICAgIHwgMDEsIDAyLCAwMywgMDQgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUVFRICAgICB8IFExLCBRMiwgUTMsIFE0ICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFFRUVEgICAgfCAxc3QgcXVhcnRlciwgMm5kIHF1YXJ0ZXIsIC4uLiAgICAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBRUVFRUSAgIHwgMSwgMiwgMywgNCAgICAgICAgICAgICAgICAgICAgICAgIHwgNCAgICAgfFxuICogfCBRdWFydGVyIChzdGFuZC1hbG9uZSkgICAgICAgICAgIHwgcSAgICAgICB8IDEsIDIsIDMsIDQgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHFvICAgICAgfCAxc3QsIDJuZCwgM3JkLCA0dGggICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBxcSAgICAgIHwgMDEsIDAyLCAwMywgMDQgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgcXFxICAgICB8IFExLCBRMiwgUTMsIFE0ICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHFxcXEgICAgfCAxc3QgcXVhcnRlciwgMm5kIHF1YXJ0ZXIsIC4uLiAgICAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBxcXFxcSAgIHwgMSwgMiwgMywgNCAgICAgICAgICAgICAgICAgICAgICAgIHwgNCAgICAgfFxuICogfCBNb250aCAoZm9ybWF0dGluZykgICAgICAgICAgICAgIHwgTSAgICAgICB8IDEsIDIsIC4uLiwgMTIgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IE1vICAgICAgfCAxc3QsIDJuZCwgLi4uLCAxMnRoICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTSAgICAgIHwgMDEsIDAyLCAuLi4sIDEyICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTU1NICAgICB8IEphbiwgRmViLCAuLi4sIERlYyAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IE1NTU0gICAgfCBKYW51YXJ5LCBGZWJydWFyeSwgLi4uLCBEZWNlbWJlciAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTU1NTSAgIHwgSiwgRiwgLi4uLCBEICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCBNb250aCAoc3RhbmQtYWxvbmUpICAgICAgICAgICAgIHwgTCAgICAgICB8IDEsIDIsIC4uLiwgMTIgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IExvICAgICAgfCAxc3QsIDJuZCwgLi4uLCAxMnRoICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTCAgICAgIHwgMDEsIDAyLCAuLi4sIDEyICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgTExMICAgICB8IEphbiwgRmViLCAuLi4sIERlYyAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IExMTEwgICAgfCBKYW51YXJ5LCBGZWJydWFyeSwgLi4uLCBEZWNlbWJlciAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTExMTCAgIHwgSiwgRiwgLi4uLCBEICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCBMb2NhbCB3ZWVrIG9mIHllYXIgICAgICAgICAgICAgIHwgdyAgICAgICB8IDEsIDIsIC4uLiwgNTMgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHdvICAgICAgfCAxc3QsIDJuZCwgLi4uLCA1M3RoICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB3dyAgICAgIHwgMDEsIDAyLCAuLi4sIDUzICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCBJU08gd2VlayBvZiB5ZWFyICAgICAgICAgICAgICAgIHwgSSAgICAgICB8IDEsIDIsIC4uLiwgNTMgICAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IElvICAgICAgfCAxc3QsIDJuZCwgLi4uLCA1M3RoICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBJSSAgICAgIHwgMDEsIDAyLCAuLi4sIDUzICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCBEYXkgb2YgbW9udGggICAgICAgICAgICAgICAgICAgIHwgZCAgICAgICB8IDEsIDIsIC4uLiwgMzEgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGRvICAgICAgfCAxc3QsIDJuZCwgLi4uLCAzMXN0ICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBkZCAgICAgIHwgMDEsIDAyLCAuLi4sIDMxICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCBEYXkgb2YgeWVhciAgICAgICAgICAgICAgICAgICAgIHwgRCAgICAgICB8IDEsIDIsIC4uLiwgMzY1LCAzNjYgICAgICAgICAgICAgICB8IDkgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IERvICAgICAgfCAxc3QsIDJuZCwgLi4uLCAzNjV0aCwgMzY2dGggICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBERCAgICAgIHwgMDEsIDAyLCAuLi4sIDM2NSwgMzY2ICAgICAgICAgICAgIHwgOSAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgREREICAgICB8IDAwMSwgMDAyLCAuLi4sIDM2NSwgMzY2ICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEREREQgICAgfCAuLi4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAzICAgICB8XG4gKiB8IERheSBvZiB3ZWVrIChmb3JtYXR0aW5nKSAgICAgICAgfCBFLi5FRUUgIHwgTW9uLCBUdWUsIFdlZCwgLi4uLCBTdW4gICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRUVFRSAgICB8IE1vbmRheSwgVHVlc2RheSwgLi4uLCBTdW5kYXkgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEVFRUVFICAgfCBNLCBULCBXLCBULCBGLCBTLCBTICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBFRUVFRUUgIHwgTW8sIFR1LCBXZSwgVGgsIEZyLCBTYSwgU3UgICAgICAgIHwgICAgICAgfFxuICogfCBJU08gZGF5IG9mIHdlZWsgKGZvcm1hdHRpbmcpICAgIHwgaSAgICAgICB8IDEsIDIsIDMsIC4uLiwgNyAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGlvICAgICAgfCAxc3QsIDJuZCwgLi4uLCA3dGggICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBpaSAgICAgIHwgMDEsIDAyLCAuLi4sIDA3ICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaWlpICAgICB8IE1vbiwgVHVlLCBXZWQsIC4uLiwgU3VuICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGlpaWkgICAgfCBNb25kYXksIFR1ZXNkYXksIC4uLiwgU3VuZGF5ICAgICAgfCAyLDcgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBpaWlpaSAgIHwgTSwgVCwgVywgVCwgRiwgUywgUyAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaWlpaWlpICB8IE1vLCBUdSwgV2UsIFRoLCBGciwgU2EsIFN1ICAgICAgICB8IDcgICAgIHxcbiAqIHwgTG9jYWwgZGF5IG9mIHdlZWsgKGZvcm1hdHRpbmcpICB8IGUgICAgICAgfCAyLCAzLCA0LCAuLi4sIDEgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlbyAgICAgIHwgMm5kLCAzcmQsIC4uLiwgMXN0ICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZWUgICAgICB8IDAyLCAwMywgLi4uLCAwMSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVlZSAgICAgfCBNb24sIFR1ZSwgV2VkLCAuLi4sIFN1biAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBlZWVlICAgIHwgTW9uZGF5LCBUdWVzZGF5LCAuLi4sIFN1bmRheSAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgZWVlZWUgICB8IE0sIFQsIFcsIFQsIEYsIFMsIFMgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGVlZWVlZSAgfCBNbywgVHUsIFdlLCBUaCwgRnIsIFNhLCBTdSAgICAgICAgfCAgICAgICB8XG4gKiB8IExvY2FsIGRheSBvZiB3ZWVrIChzdGFuZC1hbG9uZSkgfCBjICAgICAgIHwgMiwgMywgNCwgLi4uLCAxICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgY28gICAgICB8IDJuZCwgM3JkLCAuLi4sIDFzdCAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjICAgICAgfCAwMiwgMDMsIC4uLiwgMDEgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBjY2MgICAgIHwgTW9uLCBUdWUsIFdlZCwgLi4uLCBTdW4gICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2NjYyAgICB8IE1vbmRheSwgVHVlc2RheSwgLi4uLCBTdW5kYXkgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjY2NjICAgfCBNLCBULCBXLCBULCBGLCBTLCBTICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBjY2NjY2MgIHwgTW8sIFR1LCBXZSwgVGgsIEZyLCBTYSwgU3UgICAgICAgIHwgICAgICAgfFxuICogfCBBTSwgUE0gICAgICAgICAgICAgICAgICAgICAgICAgIHwgYS4uYWEgICB8IEFNLCBQTSAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGFhYSAgICAgfCBhbSwgcG0gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhYWFhICAgIHwgYS5tLiwgcC5tLiAgICAgICAgICAgICAgICAgICAgICAgIHwgMiAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYWFhYWEgICB8IGEsIHAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgQU0sIFBNLCBub29uLCBtaWRuaWdodCAgICAgICAgICB8IGIuLmJiICAgfCBBTSwgUE0sIG5vb24sIG1pZG5pZ2h0ICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBiYmIgICAgIHwgYW0sIHBtLCBub29uLCBtaWRuaWdodCAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYmJiYiAgICB8IGEubS4sIHAubS4sIG5vb24sIG1pZG5pZ2h0ICAgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGJiYmJiICAgfCBhLCBwLCBuLCBtaSAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IEZsZXhpYmxlIGRheSBwZXJpb2QgICAgICAgICAgICAgfCBCLi5CQkIgIHwgYXQgbmlnaHQsIGluIHRoZSBtb3JuaW5nLCAuLi4gICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQkJCQiAgICB8IGF0IG5pZ2h0LCBpbiB0aGUgbW9ybmluZywgLi4uICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEJCQkJCICAgfCBhdCBuaWdodCwgaW4gdGhlIG1vcm5pbmcsIC4uLiAgICAgfCAgICAgICB8XG4gKiB8IEhvdXIgWzEtMTJdICAgICAgICAgICAgICAgICAgICAgfCBoICAgICAgIHwgMSwgMiwgLi4uLCAxMSwgMTIgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgaG8gICAgICB8IDFzdCwgMm5kLCAuLi4sIDExdGgsIDEydGggICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGhoICAgICAgfCAwMSwgMDIsIC4uLiwgMTEsIDEyICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IEhvdXIgWzAtMjNdICAgICAgICAgICAgICAgICAgICAgfCBIICAgICAgIHwgMCwgMSwgMiwgLi4uLCAyMyAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgSG8gICAgICB8IDB0aCwgMXN0LCAybmQsIC4uLiwgMjNyZCAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEhIICAgICAgfCAwMCwgMDEsIDAyLCAuLi4sIDIzICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IEhvdXIgWzAtMTFdICAgICAgICAgICAgICAgICAgICAgfCBLICAgICAgIHwgMSwgMiwgLi4uLCAxMSwgMCAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgS28gICAgICB8IDFzdCwgMm5kLCAuLi4sIDExdGgsIDB0aCAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEtLICAgICAgfCAwMSwgMDIsIC4uLiwgMTEsIDAwICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IEhvdXIgWzEtMjRdICAgICAgICAgICAgICAgICAgICAgfCBrICAgICAgIHwgMjQsIDEsIDIsIC4uLiwgMjMgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwga28gICAgICB8IDI0dGgsIDFzdCwgMm5kLCAuLi4sIDIzcmQgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGtrICAgICAgfCAyNCwgMDEsIDAyLCAuLi4sIDIzICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IE1pbnV0ZSAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtICAgICAgIHwgMCwgMSwgLi4uLCA1OSAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbW8gICAgICB8IDB0aCwgMXN0LCAuLi4sIDU5dGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG1tICAgICAgfCAwMCwgMDEsIC4uLiwgNTkgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IFNlY29uZCAgICAgICAgICAgICAgICAgICAgICAgICAgfCBzICAgICAgIHwgMCwgMSwgLi4uLCA1OSAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgc28gICAgICB8IDB0aCwgMXN0LCAuLi4sIDU5dGggICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHNzICAgICAgfCAwMCwgMDEsIC4uLiwgNTkgICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8IEZyYWN0aW9uIG9mIHNlY29uZCAgICAgICAgICAgICAgfCBTICAgICAgIHwgMCwgMSwgLi4uLCA5ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU1MgICAgICB8IDAwLCAwMSwgLi4uLCA5OSAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFNTUyAgICAgfCAwMDAsIDAwMSwgLi4uLCA5OTkgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTU1NTICAgIHwgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMyAgICAgfFxuICogfCBUaW1lem9uZSAoSVNPLTg2MDEgdy8gWikgICAgICAgIHwgWCAgICAgICB8IC0wOCwgKzA1MzAsIFogICAgICAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFhYICAgICAgfCAtMDgwMCwgKzA1MzAsIFogICAgICAgICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBYWFggICAgIHwgLTA4OjAwLCArMDU6MzAsIFogICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgWFhYWCAgICB8IC0wODAwLCArMDUzMCwgWiwgKzEyMzQ1NiAgICAgICAgICB8IDIgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFhYWFhYICAgfCAtMDg6MDAsICswNTozMCwgWiwgKzEyOjM0OjU2ICAgICAgfCAgICAgICB8XG4gKiB8IFRpbWV6b25lIChJU08tODYwMSB3L28gWikgICAgICAgfCB4ICAgICAgIHwgLTA4LCArMDUzMCwgKzAwICAgICAgICAgICAgICAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeHggICAgICB8IC0wODAwLCArMDUzMCwgKzAwMDAgICAgICAgICAgICAgICB8ICAgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHh4eCAgICAgfCAtMDg6MDAsICswNTozMCwgKzAwOjAwICAgICAgICAgICAgfCAyICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCB4eHh4ICAgIHwgLTA4MDAsICswNTMwLCArMDAwMCwgKzEyMzQ1NiAgICAgIHwgICAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgeHh4eHggICB8IC0wODowMCwgKzA1OjMwLCArMDA6MDAsICsxMjozNDo1NiB8ICAgICAgIHxcbiAqIHwgVGltZXpvbmUgKEdNVCkgICAgICAgICAgICAgICAgICB8IE8uLi5PT08gfCBHTVQtOCwgR01UKzU6MzAsIEdNVCswICAgICAgICAgICAgfCAgICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBPT09PICAgIHwgR01ULTA4OjAwLCBHTVQrMDU6MzAsIEdNVCswMDowMCAgIHwgMiAgICAgfFxuICogfCBUaW1lem9uZSAoc3BlY2lmaWMgbm9uLWxvY2F0LikgIHwgei4uLnp6eiB8IEdNVC04LCBHTVQrNTozMCwgR01UKzAgICAgICAgICAgICB8IDYgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHp6enogICAgfCBHTVQtMDg6MDAsIEdNVCswNTozMCwgR01UKzAwOjAwICAgfCAyLDYgICB8XG4gKiB8IFNlY29uZHMgdGltZXN0YW1wICAgICAgICAgICAgICAgfCB0ICAgICAgIHwgNTEyOTY5NTIwICAgICAgICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgdHQgICAgICB8IC4uLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDMsNyAgIHxcbiAqIHwgTWlsbGlzZWNvbmRzIHRpbWVzdGFtcCAgICAgICAgICB8IFQgICAgICAgfCA1MTI5Njk1MjA5MDAgICAgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUVCAgICAgIHwgLi4uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMyw3ICAgfFxuICogfCBMb25nIGxvY2FsaXplZCBkYXRlICAgICAgICAgICAgIHwgUCAgICAgICB8IDA0LzI5LzE0NTMgICAgICAgICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFBQICAgICAgfCBBcHIgMjksIDE0NTMgICAgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBQUFAgICAgIHwgQXByaWwgMjl0aCwgMTQ1MyAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUFBQUCAgICB8IEZyaWRheSwgQXByaWwgMjl0aCwgMTQ1MyAgICAgICAgICB8IDIsNyAgIHxcbiAqIHwgTG9uZyBsb2NhbGl6ZWQgdGltZSAgICAgICAgICAgICB8IHAgICAgICAgfCAxMjowMCBBTSAgICAgICAgICAgICAgICAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBwcCAgICAgIHwgMTI6MDA6MDAgQU0gICAgICAgICAgICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgcHBwICAgICB8IDEyOjAwOjAwIEFNIEdNVCsyICAgICAgICAgICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IHBwcHAgICAgfCAxMjowMDowMCBBTSBHTVQrMDI6MDAgICAgICAgICAgICAgfCAyLDcgICB8XG4gKiB8IENvbWJpbmF0aW9uIG9mIGRhdGUgYW5kIHRpbWUgICAgfCBQcCAgICAgIHwgMDQvMjkvMTQ1MywgMTI6MDAgQU0gICAgICAgICAgICAgIHwgNyAgICAgfFxuICogfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUFBwcCAgICB8IEFwciAyOSwgMTQ1MywgMTI6MDA6MDAgQU0gICAgICAgICB8IDcgICAgIHxcbiAqIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFBQUHBwcCAgfCBBcHJpbCAyOXRoLCAxNDUzIGF0IC4uLiAgICAgICAgICAgfCA3ICAgICB8XG4gKiB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBQUFBQcHBwcHwgRnJpZGF5LCBBcHJpbCAyOXRoLCAxNDUzIGF0IC4uLiAgIHwgMiw3ICAgfFxuICogTm90ZXM6XG4gKiAxLiBcIkZvcm1hdHRpbmdcIiB1bml0cyAoZS5nLiBmb3JtYXR0aW5nIHF1YXJ0ZXIpIGluIHRoZSBkZWZhdWx0IGVuLVVTIGxvY2FsZVxuICogICAgYXJlIHRoZSBzYW1lIGFzIFwic3RhbmQtYWxvbmVcIiB1bml0cywgYnV0IGFyZSBkaWZmZXJlbnQgaW4gc29tZSBsYW5ndWFnZXMuXG4gKiAgICBcIkZvcm1hdHRpbmdcIiB1bml0cyBhcmUgZGVjbGluZWQgYWNjb3JkaW5nIHRvIHRoZSBydWxlcyBvZiB0aGUgbGFuZ3VhZ2VcbiAqICAgIGluIHRoZSBjb250ZXh0IG9mIGEgZGF0ZS4gXCJTdGFuZC1hbG9uZVwiIHVuaXRzIGFyZSBhbHdheXMgbm9taW5hdGl2ZSBzaW5ndWxhcjpcbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ2RvIExMTEwnLCB7bG9jYWxlOiBjc30pIC8vPT4gJzYuIGxpc3RvcGFkJ2BcbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ2RvIE1NTU0nLCB7bG9jYWxlOiBjc30pIC8vPT4gJzYuIGxpc3RvcGFkdSdgXG4gKlxuICogMi4gQW55IHNlcXVlbmNlIG9mIHRoZSBpZGVudGljYWwgbGV0dGVycyBpcyBhIHBhdHRlcm4sIHVubGVzcyBpdCBpcyBlc2NhcGVkIGJ5XG4gKiAgICB0aGUgc2luZ2xlIHF1b3RlIGNoYXJhY3RlcnMgKHNlZSBiZWxvdykuXG4gKiAgICBJZiB0aGUgc2VxdWVuY2UgaXMgbG9uZ2VyIHRoYW4gbGlzdGVkIGluIHRhYmxlIChlLmcuIGBFRUVFRUVFRUVFRWApXG4gKiAgICB0aGUgb3V0cHV0IHdpbGwgYmUgdGhlIHNhbWUgYXMgZGVmYXVsdCBwYXR0ZXJuIGZvciB0aGlzIHVuaXQsIHVzdWFsbHlcbiAqICAgIHRoZSBsb25nZXN0IG9uZSAoaW4gY2FzZSBvZiBJU08gd2Vla2RheXMsIGBFRUVFYCkuIERlZmF1bHQgcGF0dGVybnMgZm9yIHVuaXRzXG4gKiAgICBhcmUgbWFya2VkIHdpdGggXCIyXCIgaW4gdGhlIGxhc3QgY29sdW1uIG9mIHRoZSB0YWJsZS5cbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ01NTScpIC8vPT4gJ05vdidgXG4gKlxuICogICAgYGZvcm1hdChuZXcgRGF0ZSgyMDE3LCAxMCwgNiksICdNTU1NJykgLy89PiAnTm92ZW1iZXInYFxuICpcbiAqICAgIGBmb3JtYXQobmV3IERhdGUoMjAxNywgMTAsIDYpLCAnTU1NTU0nKSAvLz0+ICdOJ2BcbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ01NTU1NTScpIC8vPT4gJ05vdmVtYmVyJ2BcbiAqXG4gKiAgICBgZm9ybWF0KG5ldyBEYXRlKDIwMTcsIDEwLCA2KSwgJ01NTU1NTU0nKSAvLz0+ICdOb3ZlbWJlcidgXG4gKlxuICogMy4gU29tZSBwYXR0ZXJucyBjb3VsZCBiZSB1bmxpbWl0ZWQgbGVuZ3RoIChzdWNoIGFzIGB5eXl5eXl5eWApLlxuICogICAgVGhlIG91dHB1dCB3aWxsIGJlIHBhZGRlZCB3aXRoIHplcm9zIHRvIG1hdGNoIHRoZSBsZW5ndGggb2YgdGhlIHBhdHRlcm4uXG4gKlxuICogICAgYGZvcm1hdChuZXcgRGF0ZSgyMDE3LCAxMCwgNiksICd5eXl5eXl5eScpIC8vPT4gJzAwMDAyMDE3J2BcbiAqXG4gKiA0LiBgUVFRUVFgIGFuZCBgcXFxcXFgIGNvdWxkIGJlIG5vdCBzdHJpY3RseSBudW1lcmljYWwgaW4gc29tZSBsb2NhbGVzLlxuICogICAgVGhlc2UgdG9rZW5zIHJlcHJlc2VudCB0aGUgc2hvcnRlc3QgZm9ybSBvZiB0aGUgcXVhcnRlci5cbiAqXG4gKiA1LiBUaGUgbWFpbiBkaWZmZXJlbmNlIGJldHdlZW4gYHlgIGFuZCBgdWAgcGF0dGVybnMgYXJlIEIuQy4geWVhcnM6XG4gKlxuICogICAgfCBZZWFyIHwgYHlgIHwgYHVgIHxcbiAqICAgIHwtLS0tLS18LS0tLS18LS0tLS18XG4gKiAgICB8IEFDIDEgfCAgIDEgfCAgIDEgfFxuICogICAgfCBCQyAxIHwgICAxIHwgICAwIHxcbiAqICAgIHwgQkMgMiB8ICAgMiB8ICAtMSB8XG4gKlxuICogICAgQWxzbyBgeXlgIGFsd2F5cyByZXR1cm5zIHRoZSBsYXN0IHR3byBkaWdpdHMgb2YgYSB5ZWFyLFxuICogICAgd2hpbGUgYHV1YCBwYWRzIHNpbmdsZSBkaWdpdCB5ZWFycyB0byAyIGNoYXJhY3RlcnMgYW5kIHJldHVybnMgb3RoZXIgeWVhcnMgdW5jaGFuZ2VkOlxuICpcbiAqICAgIHwgWWVhciB8IGB5eWAgfCBgdXVgIHxcbiAqICAgIHwtLS0tLS18LS0tLS0tfC0tLS0tLXxcbiAqICAgIHwgMSAgICB8ICAgMDEgfCAgIDAxIHxcbiAqICAgIHwgMTQgICB8ICAgMTQgfCAgIDE0IHxcbiAqICAgIHwgMzc2ICB8ICAgNzYgfCAgMzc2IHxcbiAqICAgIHwgMTQ1MyB8ICAgNTMgfCAxNDUzIHxcbiAqXG4gKiAgICBUaGUgc2FtZSBkaWZmZXJlbmNlIGlzIHRydWUgZm9yIGxvY2FsIGFuZCBJU08gd2Vlay1udW1iZXJpbmcgeWVhcnMgKGBZYCBhbmQgYFJgKSxcbiAqICAgIGV4Y2VwdCBsb2NhbCB3ZWVrLW51bWJlcmluZyB5ZWFycyBhcmUgZGVwZW5kZW50IG9uIGBvcHRpb25zLndlZWtTdGFydHNPbmBcbiAqICAgIGFuZCBgb3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGVgIChjb21wYXJlIFtnZXRJU09XZWVrWWVhcl17QGxpbmsgaHR0cHM6Ly9kYXRlLWZucy5vcmcvZG9jcy9nZXRJU09XZWVrWWVhcn1cbiAqICAgIGFuZCBbZ2V0V2Vla1llYXJde0BsaW5rIGh0dHBzOi8vZGF0ZS1mbnMub3JnL2RvY3MvZ2V0V2Vla1llYXJ9KS5cbiAqXG4gKiA2LiBTcGVjaWZpYyBub24tbG9jYXRpb24gdGltZXpvbmVzIGFyZSBjdXJyZW50bHkgdW5hdmFpbGFibGUgaW4gYGRhdGUtZm5zYCxcbiAqICAgIHNvIHJpZ2h0IG5vdyB0aGVzZSB0b2tlbnMgZmFsbCBiYWNrIHRvIEdNVCB0aW1lem9uZXMuXG4gKlxuICogNy4gVGhlc2UgcGF0dGVybnMgYXJlIG5vdCBpbiB0aGUgVW5pY29kZSBUZWNobmljYWwgU3RhbmRhcmQgIzM1OlxuICogICAgLSBgaWA6IElTTyBkYXkgb2Ygd2Vla1xuICogICAgLSBgSWA6IElTTyB3ZWVrIG9mIHllYXJcbiAqICAgIC0gYFJgOiBJU08gd2Vlay1udW1iZXJpbmcgeWVhclxuICogICAgLSBgdGA6IHNlY29uZHMgdGltZXN0YW1wXG4gKiAgICAtIGBUYDogbWlsbGlzZWNvbmRzIHRpbWVzdGFtcFxuICogICAgLSBgb2A6IG9yZGluYWwgbnVtYmVyIG1vZGlmaWVyXG4gKiAgICAtIGBQYDogbG9uZyBsb2NhbGl6ZWQgZGF0ZVxuICogICAgLSBgcGA6IGxvbmcgbG9jYWxpemVkIHRpbWVcbiAqXG4gKiA4LiBgWVlgIGFuZCBgWVlZWWAgdG9rZW5zIHJlcHJlc2VudCB3ZWVrLW51bWJlcmluZyB5ZWFycyBidXQgdGhleSBhcmUgb2Z0ZW4gY29uZnVzZWQgd2l0aCB5ZWFycy5cbiAqICAgIFlvdSBzaG91bGQgZW5hYmxlIGBvcHRpb25zLnVzZUFkZGl0aW9uYWxXZWVrWWVhclRva2Vuc2AgdG8gdXNlIHRoZW0uIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICpcbiAqIDkuIGBEYCBhbmQgYEREYCB0b2tlbnMgcmVwcmVzZW50IGRheXMgb2YgdGhlIHllYXIgYnV0IHRoZXkgYXJlIG9mdGVuIGNvbmZ1c2VkIHdpdGggZGF5cyBvZiB0aGUgbW9udGguXG4gKiAgICBZb3Ugc2hvdWxkIGVuYWJsZSBgb3B0aW9ucy51c2VBZGRpdGlvbmFsRGF5T2ZZZWFyVG9rZW5zYCB0byB1c2UgdGhlbS4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91bmljb2RlVG9rZW5zLm1kXG4gKlxuICogQHBhcmFtIHtEYXRlfE51bWJlcn0gZGF0ZSAtIHRoZSBvcmlnaW5hbCBkYXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gZm9ybWF0IC0gdGhlIHN0cmluZyBvZiB0b2tlbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBhbiBvYmplY3Qgd2l0aCBvcHRpb25zLlxuICogQHBhcmFtIHtMb2NhbGV9IFtvcHRpb25zLmxvY2FsZT1kZWZhdWx0TG9jYWxlXSAtIHRoZSBsb2NhbGUgb2JqZWN0LiBTZWUgW0xvY2FsZV17QGxpbmsgaHR0cHM6Ly9kYXRlLWZucy5vcmcvZG9jcy9Mb2NhbGV9XG4gKiBAcGFyYW0gezB8MXwyfDN8NHw1fDZ9IFtvcHRpb25zLndlZWtTdGFydHNPbj0wXSAtIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrICgwIC0gU3VuZGF5KVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmZpcnN0V2Vla0NvbnRhaW5zRGF0ZT0xXSAtIHRoZSBkYXkgb2YgSmFudWFyeSwgd2hpY2ggaXNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMudXNlQWRkaXRpb25hbFdlZWtZZWFyVG9rZW5zPWZhbHNlXSAtIGlmIHRydWUsIGFsbG93cyB1c2FnZSBvZiB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciB0b2tlbnMgYFlZYCBhbmQgYFlZWVlgO1xuICogICBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMudXNlQWRkaXRpb25hbERheU9mWWVhclRva2Vucz1mYWxzZV0gLSBpZiB0cnVlLCBhbGxvd3MgdXNhZ2Ugb2YgdGhlIGRheSBvZiB5ZWFyIHRva2VucyBgRGAgYW5kIGBERGA7XG4gKiAgIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdW5pY29kZVRva2Vucy5tZFxuICogQHJldHVybnMge1N0cmluZ30gdGhlIGZvcm1hdHRlZCBkYXRlIHN0cmluZ1xuICogQHRocm93cyB7VHlwZUVycm9yfSAyIGFyZ3VtZW50cyByZXF1aXJlZFxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gYGRhdGVgIG11c3Qgbm90IGJlIEludmFsaWQgRGF0ZVxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gYG9wdGlvbnMubG9jYWxlYCBtdXN0IGNvbnRhaW4gYGxvY2FsaXplYCBwcm9wZXJ0eVxuICogQHRocm93cyB7UmFuZ2VFcnJvcn0gYG9wdGlvbnMubG9jYWxlYCBtdXN0IGNvbnRhaW4gYGZvcm1hdExvbmdgIHByb3BlcnR5XG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBgb3B0aW9ucy53ZWVrU3RhcnRzT25gIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA2XG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBgb3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGVgIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA3XG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSB1c2UgYHl5eXlgIGluc3RlYWQgb2YgYFlZWVlgIGZvciBmb3JtYXR0aW5nIHllYXJzIHVzaW5nIFtmb3JtYXQgcHJvdmlkZWRdIHRvIHRoZSBpbnB1dCBbaW5wdXQgcHJvdmlkZWRdOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IHVzZSBgeXlgIGluc3RlYWQgb2YgYFlZYCBmb3IgZm9ybWF0dGluZyB5ZWFycyB1c2luZyBbZm9ybWF0IHByb3ZpZGVkXSB0byB0aGUgaW5wdXQgW2lucHV0IHByb3ZpZGVkXTsgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91bmljb2RlVG9rZW5zLm1kXG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSB1c2UgYGRgIGluc3RlYWQgb2YgYERgIGZvciBmb3JtYXR0aW5nIGRheXMgb2YgdGhlIG1vbnRoIHVzaW5nIFtmb3JtYXQgcHJvdmlkZWRdIHRvIHRoZSBpbnB1dCBbaW5wdXQgcHJvdmlkZWRdOyBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9ibG9iL21hc3Rlci9kb2NzL3VuaWNvZGVUb2tlbnMubWRcbiAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IHVzZSBgZGRgIGluc3RlYWQgb2YgYEREYCBmb3IgZm9ybWF0dGluZyBkYXlzIG9mIHRoZSBtb250aCB1c2luZyBbZm9ybWF0IHByb3ZpZGVkXSB0byB0aGUgaW5wdXQgW2lucHV0IHByb3ZpZGVkXTsgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vZGF0ZS1mbnMvZGF0ZS1mbnMvYmxvYi9tYXN0ZXIvZG9jcy91bmljb2RlVG9rZW5zLm1kXG4gKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBmb3JtYXQgc3RyaW5nIGNvbnRhaW5zIGFuIHVuZXNjYXBlZCBsYXRpbiBhbHBoYWJldCBjaGFyYWN0ZXJcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gUmVwcmVzZW50IDExIEZlYnJ1YXJ5IDIwMTQgaW4gbWlkZGxlLWVuZGlhbiBmb3JtYXQ6XG4gKiBjb25zdCByZXN1bHQgPSBmb3JtYXQobmV3IERhdGUoMjAxNCwgMSwgMTEpLCAnTU0vZGQveXl5eScpXG4gKiAvLz0+ICcwMi8xMS8yMDE0J1xuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBSZXByZXNlbnQgMiBKdWx5IDIwMTQgaW4gRXNwZXJhbnRvOlxuICogaW1wb3J0IHsgZW9Mb2NhbGUgfSBmcm9tICdkYXRlLWZucy9sb2NhbGUvZW8nXG4gKiBjb25zdCByZXN1bHQgPSBmb3JtYXQobmV3IERhdGUoMjAxNCwgNiwgMiksIFwiZG8gJ2RlJyBNTU1NIHl5eXlcIiwge1xuICogICBsb2NhbGU6IGVvTG9jYWxlXG4gKiB9KVxuICogLy89PiAnMi1hIGRlIGp1bGlvIDIwMTQnXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEVzY2FwZSBzdHJpbmcgYnkgc2luZ2xlIHF1b3RlIGNoYXJhY3RlcnM6XG4gKiBjb25zdCByZXN1bHQgPSBmb3JtYXQobmV3IERhdGUoMjAxNCwgNiwgMiwgMTUpLCBcImggJ28nJ2Nsb2NrJ1wiKVxuICogLy89PiBcIjMgbydjbG9ja1wiXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0KGRpcnR5RGF0ZSwgZGlydHlGb3JtYXRTdHIsIG9wdGlvbnMpIHtcbiAgdmFyIF9yZWYsIF9vcHRpb25zJGxvY2FsZSwgX3JlZjIsIF9yZWYzLCBfcmVmNCwgX29wdGlvbnMkZmlyc3RXZWVrQ29uLCBfb3B0aW9ucyRsb2NhbGUyLCBfb3B0aW9ucyRsb2NhbGUyJG9wdGksIF9kZWZhdWx0T3B0aW9ucyRsb2NhbCwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMiwgX3JlZjUsIF9yZWY2LCBfcmVmNywgX29wdGlvbnMkd2Vla1N0YXJ0c09uLCBfb3B0aW9ucyRsb2NhbGUzLCBfb3B0aW9ucyRsb2NhbGUzJG9wdGksIF9kZWZhdWx0T3B0aW9ucyRsb2NhbDMsIF9kZWZhdWx0T3B0aW9ucyRsb2NhbDQ7XG5cbiAgcmVxdWlyZWRBcmdzKDIsIGFyZ3VtZW50cyk7XG4gIHZhciBmb3JtYXRTdHIgPSBTdHJpbmcoZGlydHlGb3JtYXRTdHIpO1xuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSBnZXREZWZhdWx0T3B0aW9ucygpO1xuICB2YXIgbG9jYWxlID0gKF9yZWYgPSAoX29wdGlvbnMkbG9jYWxlID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLmxvY2FsZSkgIT09IG51bGwgJiYgX29wdGlvbnMkbG9jYWxlICE9PSB2b2lkIDAgPyBfb3B0aW9ucyRsb2NhbGUgOiBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpICE9PSBudWxsICYmIF9yZWYgIT09IHZvaWQgMCA/IF9yZWYgOiBkZWZhdWx0TG9jYWxlO1xuICB2YXIgZmlyc3RXZWVrQ29udGFpbnNEYXRlID0gdG9JbnRlZ2VyKChfcmVmMiA9IChfcmVmMyA9IChfcmVmNCA9IChfb3B0aW9ucyRmaXJzdFdlZWtDb24gPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMuZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfb3B0aW9ucyRmaXJzdFdlZWtDb24gIT09IHZvaWQgMCA/IF9vcHRpb25zJGZpcnN0V2Vla0NvbiA6IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZTIgPSBvcHRpb25zLmxvY2FsZSkgPT09IG51bGwgfHwgX29wdGlvbnMkbG9jYWxlMiA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9vcHRpb25zJGxvY2FsZTIkb3B0aSA9IF9vcHRpb25zJGxvY2FsZTIub3B0aW9ucykgPT09IG51bGwgfHwgX29wdGlvbnMkbG9jYWxlMiRvcHRpID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfb3B0aW9ucyRsb2NhbGUyJG9wdGkuZmlyc3RXZWVrQ29udGFpbnNEYXRlKSAhPT0gbnVsbCAmJiBfcmVmNCAhPT0gdm9pZCAwID8gX3JlZjQgOiBkZWZhdWx0T3B0aW9ucy5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYzICE9PSB2b2lkIDAgPyBfcmVmMyA6IChfZGVmYXVsdE9wdGlvbnMkbG9jYWwgPSBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDIgPSBfZGVmYXVsdE9wdGlvbnMkbG9jYWwub3B0aW9ucykgPT09IG51bGwgfHwgX2RlZmF1bHRPcHRpb25zJGxvY2FsMiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2RlZmF1bHRPcHRpb25zJGxvY2FsMi5maXJzdFdlZWtDb250YWluc0RhdGUpICE9PSBudWxsICYmIF9yZWYyICE9PSB2b2lkIDAgPyBfcmVmMiA6IDEpOyAvLyBUZXN0IGlmIHdlZWtTdGFydHNPbiBpcyBiZXR3ZWVuIDEgYW5kIDcgX2FuZF8gaXMgbm90IE5hTlxuXG4gIGlmICghKGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA+PSAxICYmIGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSA8PSA3KSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdmaXJzdFdlZWtDb250YWluc0RhdGUgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDcgaW5jbHVzaXZlbHknKTtcbiAgfVxuXG4gIHZhciB3ZWVrU3RhcnRzT24gPSB0b0ludGVnZXIoKF9yZWY1ID0gKF9yZWY2ID0gKF9yZWY3ID0gKF9vcHRpb25zJHdlZWtTdGFydHNPbiA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9vcHRpb25zJHdlZWtTdGFydHNPbiAhPT0gdm9pZCAwID8gX29wdGlvbnMkd2Vla1N0YXJ0c09uIDogb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlMyA9IG9wdGlvbnMubG9jYWxlKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUzID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdGlvbnMkbG9jYWxlMyRvcHRpID0gX29wdGlvbnMkbG9jYWxlMy5vcHRpb25zKSA9PT0gbnVsbCB8fCBfb3B0aW9ucyRsb2NhbGUzJG9wdGkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRpb25zJGxvY2FsZTMkb3B0aS53ZWVrU3RhcnRzT24pICE9PSBudWxsICYmIF9yZWY3ICE9PSB2b2lkIDAgPyBfcmVmNyA6IGRlZmF1bHRPcHRpb25zLndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX3JlZjYgIT09IHZvaWQgMCA/IF9yZWY2IDogKF9kZWZhdWx0T3B0aW9ucyRsb2NhbDMgPSBkZWZhdWx0T3B0aW9ucy5sb2NhbGUpID09PSBudWxsIHx8IF9kZWZhdWx0T3B0aW9ucyRsb2NhbDMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfZGVmYXVsdE9wdGlvbnMkbG9jYWw0ID0gX2RlZmF1bHRPcHRpb25zJGxvY2FsMy5vcHRpb25zKSA9PT0gbnVsbCB8fCBfZGVmYXVsdE9wdGlvbnMkbG9jYWw0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZGVmYXVsdE9wdGlvbnMkbG9jYWw0LndlZWtTdGFydHNPbikgIT09IG51bGwgJiYgX3JlZjUgIT09IHZvaWQgMCA/IF9yZWY1IDogMCk7IC8vIFRlc3QgaWYgd2Vla1N0YXJ0c09uIGlzIGJldHdlZW4gMCBhbmQgNiBfYW5kXyBpcyBub3QgTmFOXG5cbiAgaWYgKCEod2Vla1N0YXJ0c09uID49IDAgJiYgd2Vla1N0YXJ0c09uIDw9IDYpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3dlZWtTdGFydHNPbiBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNiBpbmNsdXNpdmVseScpO1xuICB9XG5cbiAgaWYgKCFsb2NhbGUubG9jYWxpemUpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignbG9jYWxlIG11c3QgY29udGFpbiBsb2NhbGl6ZSBwcm9wZXJ0eScpO1xuICB9XG5cbiAgaWYgKCFsb2NhbGUuZm9ybWF0TG9uZykge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdsb2NhbGUgbXVzdCBjb250YWluIGZvcm1hdExvbmcgcHJvcGVydHknKTtcbiAgfVxuXG4gIHZhciBvcmlnaW5hbERhdGUgPSB0b0RhdGUoZGlydHlEYXRlKTtcblxuICBpZiAoIWlzVmFsaWQob3JpZ2luYWxEYXRlKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHRpbWUgdmFsdWUnKTtcbiAgfSAvLyBDb252ZXJ0IHRoZSBkYXRlIGluIHN5c3RlbSB0aW1lem9uZSB0byB0aGUgc2FtZSBkYXRlIGluIFVUQyswMDowMCB0aW1lem9uZS5cbiAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgd2hlbiBVVEMgZnVuY3Rpb25zIHdpbGwgYmUgaW1wbGVtZW50ZWQsIGxvY2FsZXMgd2lsbCBiZSBjb21wYXRpYmxlIHdpdGggdGhlbS5cbiAgLy8gU2VlIGFuIGlzc3VlIGFib3V0IFVUQyBmdW5jdGlvbnM6IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXRlLWZucy9kYXRlLWZucy9pc3N1ZXMvMzc2XG5cblxuICB2YXIgdGltZXpvbmVPZmZzZXQgPSBnZXRUaW1lem9uZU9mZnNldEluTWlsbGlzZWNvbmRzKG9yaWdpbmFsRGF0ZSk7XG4gIHZhciB1dGNEYXRlID0gc3ViTWlsbGlzZWNvbmRzKG9yaWdpbmFsRGF0ZSwgdGltZXpvbmVPZmZzZXQpO1xuICB2YXIgZm9ybWF0dGVyT3B0aW9ucyA9IHtcbiAgICBmaXJzdFdlZWtDb250YWluc0RhdGU6IGZpcnN0V2Vla0NvbnRhaW5zRGF0ZSxcbiAgICB3ZWVrU3RhcnRzT246IHdlZWtTdGFydHNPbixcbiAgICBsb2NhbGU6IGxvY2FsZSxcbiAgICBfb3JpZ2luYWxEYXRlOiBvcmlnaW5hbERhdGVcbiAgfTtcbiAgdmFyIHJlc3VsdCA9IGZvcm1hdFN0ci5tYXRjaChsb25nRm9ybWF0dGluZ1Rva2Vuc1JlZ0V4cCkubWFwKGZ1bmN0aW9uIChzdWJzdHJpbmcpIHtcbiAgICB2YXIgZmlyc3RDaGFyYWN0ZXIgPSBzdWJzdHJpbmdbMF07XG5cbiAgICBpZiAoZmlyc3RDaGFyYWN0ZXIgPT09ICdwJyB8fCBmaXJzdENoYXJhY3RlciA9PT0gJ1AnKSB7XG4gICAgICB2YXIgbG9uZ0Zvcm1hdHRlciA9IGxvbmdGb3JtYXR0ZXJzW2ZpcnN0Q2hhcmFjdGVyXTtcbiAgICAgIHJldHVybiBsb25nRm9ybWF0dGVyKHN1YnN0cmluZywgbG9jYWxlLmZvcm1hdExvbmcpO1xuICAgIH1cblxuICAgIHJldHVybiBzdWJzdHJpbmc7XG4gIH0pLmpvaW4oJycpLm1hdGNoKGZvcm1hdHRpbmdUb2tlbnNSZWdFeHApLm1hcChmdW5jdGlvbiAoc3Vic3RyaW5nKSB7XG4gICAgLy8gUmVwbGFjZSB0d28gc2luZ2xlIHF1b3RlIGNoYXJhY3RlcnMgd2l0aCBvbmUgc2luZ2xlIHF1b3RlIGNoYXJhY3RlclxuICAgIGlmIChzdWJzdHJpbmcgPT09IFwiJydcIikge1xuICAgICAgcmV0dXJuIFwiJ1wiO1xuICAgIH1cblxuICAgIHZhciBmaXJzdENoYXJhY3RlciA9IHN1YnN0cmluZ1swXTtcblxuICAgIGlmIChmaXJzdENoYXJhY3RlciA9PT0gXCInXCIpIHtcbiAgICAgIHJldHVybiBjbGVhbkVzY2FwZWRTdHJpbmcoc3Vic3RyaW5nKTtcbiAgICB9XG5cbiAgICB2YXIgZm9ybWF0dGVyID0gZm9ybWF0dGVyc1tmaXJzdENoYXJhY3Rlcl07XG5cbiAgICBpZiAoZm9ybWF0dGVyKSB7XG4gICAgICBpZiAoIShvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMgIT09IHZvaWQgMCAmJiBvcHRpb25zLnVzZUFkZGl0aW9uYWxXZWVrWWVhclRva2VucykgJiYgaXNQcm90ZWN0ZWRXZWVrWWVhclRva2VuKHN1YnN0cmluZykpIHtcbiAgICAgICAgdGhyb3dQcm90ZWN0ZWRFcnJvcihzdWJzdHJpbmcsIGRpcnR5Rm9ybWF0U3RyLCBTdHJpbmcoZGlydHlEYXRlKSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghKG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucyAhPT0gdm9pZCAwICYmIG9wdGlvbnMudXNlQWRkaXRpb25hbERheU9mWWVhclRva2VucykgJiYgaXNQcm90ZWN0ZWREYXlPZlllYXJUb2tlbihzdWJzdHJpbmcpKSB7XG4gICAgICAgIHRocm93UHJvdGVjdGVkRXJyb3Ioc3Vic3RyaW5nLCBkaXJ0eUZvcm1hdFN0ciwgU3RyaW5nKGRpcnR5RGF0ZSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm9ybWF0dGVyKHV0Y0RhdGUsIHN1YnN0cmluZywgbG9jYWxlLmxvY2FsaXplLCBmb3JtYXR0ZXJPcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoZmlyc3RDaGFyYWN0ZXIubWF0Y2godW5lc2NhcGVkTGF0aW5DaGFyYWN0ZXJSZWdFeHApKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignRm9ybWF0IHN0cmluZyBjb250YWlucyBhbiB1bmVzY2FwZWQgbGF0aW4gYWxwaGFiZXQgY2hhcmFjdGVyIGAnICsgZmlyc3RDaGFyYWN0ZXIgKyAnYCcpO1xuICAgIH1cblxuICAgIHJldHVybiBzdWJzdHJpbmc7XG4gIH0pLmpvaW4oJycpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjbGVhbkVzY2FwZWRTdHJpbmcoaW5wdXQpIHtcbiAgdmFyIG1hdGNoZWQgPSBpbnB1dC5tYXRjaChlc2NhcGVkU3RyaW5nUmVnRXhwKTtcblxuICBpZiAoIW1hdGNoZWQpIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlZFsxXS5yZXBsYWNlKGRvdWJsZVF1b3RlUmVnRXhwLCBcIidcIik7XG59IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuLyoqXG4gKiBAbmFtZSBpc0RhdGVcbiAqIEBjYXRlZ29yeSBDb21tb24gSGVscGVyc1xuICogQHN1bW1hcnkgSXMgdGhlIGdpdmVuIHZhbHVlIGEgZGF0ZT9cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYW4gaW5zdGFuY2Ugb2YgRGF0ZS4gVGhlIGZ1bmN0aW9uIHdvcmtzIGZvciBkYXRlcyB0cmFuc2ZlcnJlZCBhY3Jvc3MgaWZyYW1lcy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgYSBkYXRlXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IDEgYXJndW1lbnRzIHJlcXVpcmVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZvciBhIHZhbGlkIGRhdGU6XG4gKiBjb25zdCByZXN1bHQgPSBpc0RhdGUobmV3IERhdGUoKSlcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3IgYW4gaW52YWxpZCBkYXRlOlxuICogY29uc3QgcmVzdWx0ID0gaXNEYXRlKG5ldyBEYXRlKE5hTikpXG4gKiAvLz0+IHRydWVcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRm9yIHNvbWUgdmFsdWU6XG4gKiBjb25zdCByZXN1bHQgPSBpc0RhdGUoJzIwMTQtMDItMzEnKVxuICogLy89PiBmYWxzZVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3IgYW4gb2JqZWN0OlxuICogY29uc3QgcmVzdWx0ID0gaXNEYXRlKHt9KVxuICogLy89PiBmYWxzZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZSkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZSB8fCBfdHlwZW9mKHZhbHVlKSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufSIsImltcG9ydCBpc0RhdGUgZnJvbSBcIi4uL2lzRGF0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHRvRGF0ZSBmcm9tIFwiLi4vdG9EYXRlL2luZGV4LmpzXCI7XG5pbXBvcnQgcmVxdWlyZWRBcmdzIGZyb20gXCIuLi9fbGliL3JlcXVpcmVkQXJncy9pbmRleC5qc1wiO1xuLyoqXG4gKiBAbmFtZSBpc1ZhbGlkXG4gKiBAY2F0ZWdvcnkgQ29tbW9uIEhlbHBlcnNcbiAqIEBzdW1tYXJ5IElzIHRoZSBnaXZlbiBkYXRlIHZhbGlkP1xuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJucyBmYWxzZSBpZiBhcmd1bWVudCBpcyBJbnZhbGlkIERhdGUgYW5kIHRydWUgb3RoZXJ3aXNlLlxuICogQXJndW1lbnQgaXMgY29udmVydGVkIHRvIERhdGUgdXNpbmcgYHRvRGF0ZWAuIFNlZSBbdG9EYXRlXXtAbGluayBodHRwczovL2RhdGUtZm5zLm9yZy9kb2NzL3RvRGF0ZX1cbiAqIEludmFsaWQgRGF0ZSBpcyBhIERhdGUsIHdob3NlIHRpbWUgdmFsdWUgaXMgTmFOLlxuICpcbiAqIFRpbWUgdmFsdWUgb2YgRGF0ZTogaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS45LjEuMVxuICpcbiAqIEBwYXJhbSB7Kn0gZGF0ZSAtIHRoZSBkYXRlIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gdGhlIGRhdGUgaXMgdmFsaWRcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gMSBhcmd1bWVudCByZXF1aXJlZFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3IgdGhlIHZhbGlkIGRhdGU6XG4gKiBjb25zdCByZXN1bHQgPSBpc1ZhbGlkKG5ldyBEYXRlKDIwMTQsIDEsIDMxKSlcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3IgdGhlIHZhbHVlLCBjb252ZXJ0YWJsZSBpbnRvIGEgZGF0ZTpcbiAqIGNvbnN0IHJlc3VsdCA9IGlzVmFsaWQoMTM5MzgwNDgwMDAwMClcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGb3IgdGhlIGludmFsaWQgZGF0ZTpcbiAqIGNvbnN0IHJlc3VsdCA9IGlzVmFsaWQobmV3IERhdGUoJycpKVxuICogLy89PiBmYWxzZVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzVmFsaWQoZGlydHlEYXRlKSB7XG4gIHJlcXVpcmVkQXJncygxLCBhcmd1bWVudHMpO1xuXG4gIGlmICghaXNEYXRlKGRpcnR5RGF0ZSkgJiYgdHlwZW9mIGRpcnR5RGF0ZSAhPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZGF0ZSA9IHRvRGF0ZShkaXJ0eURhdGUpO1xuICByZXR1cm4gIWlzTmFOKE51bWJlcihkYXRlKSk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRGb3JtYXRMb25nRm4oYXJncykge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAvLyBUT0RPOiBSZW1vdmUgU3RyaW5nKClcbiAgICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoID8gU3RyaW5nKG9wdGlvbnMud2lkdGgpIDogYXJncy5kZWZhdWx0V2lkdGg7XG4gICAgdmFyIGZvcm1hdCA9IGFyZ3MuZm9ybWF0c1t3aWR0aF0gfHwgYXJncy5mb3JtYXRzW2FyZ3MuZGVmYXVsdFdpZHRoXTtcbiAgICByZXR1cm4gZm9ybWF0O1xuICB9O1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkTG9jYWxpemVGbihhcmdzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGlydHlJbmRleCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0ID0gb3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zICE9PSB2b2lkIDAgJiYgb3B0aW9ucy5jb250ZXh0ID8gU3RyaW5nKG9wdGlvbnMuY29udGV4dCkgOiAnc3RhbmRhbG9uZSc7XG4gICAgdmFyIHZhbHVlc0FycmF5O1xuXG4gICAgaWYgKGNvbnRleHQgPT09ICdmb3JtYXR0aW5nJyAmJiBhcmdzLmZvcm1hdHRpbmdWYWx1ZXMpIHtcbiAgICAgIHZhciBkZWZhdWx0V2lkdGggPSBhcmdzLmRlZmF1bHRGb3JtYXR0aW5nV2lkdGggfHwgYXJncy5kZWZhdWx0V2lkdGg7XG4gICAgICB2YXIgd2lkdGggPSBvcHRpb25zICE9PSBudWxsICYmIG9wdGlvbnMgIT09IHZvaWQgMCAmJiBvcHRpb25zLndpZHRoID8gU3RyaW5nKG9wdGlvbnMud2lkdGgpIDogZGVmYXVsdFdpZHRoO1xuICAgICAgdmFsdWVzQXJyYXkgPSBhcmdzLmZvcm1hdHRpbmdWYWx1ZXNbd2lkdGhdIHx8IGFyZ3MuZm9ybWF0dGluZ1ZhbHVlc1tkZWZhdWx0V2lkdGhdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgX2RlZmF1bHRXaWR0aCA9IGFyZ3MuZGVmYXVsdFdpZHRoO1xuXG4gICAgICB2YXIgX3dpZHRoID0gb3B0aW9ucyAhPT0gbnVsbCAmJiBvcHRpb25zICE9PSB2b2lkIDAgJiYgb3B0aW9ucy53aWR0aCA/IFN0cmluZyhvcHRpb25zLndpZHRoKSA6IGFyZ3MuZGVmYXVsdFdpZHRoO1xuXG4gICAgICB2YWx1ZXNBcnJheSA9IGFyZ3MudmFsdWVzW193aWR0aF0gfHwgYXJncy52YWx1ZXNbX2RlZmF1bHRXaWR0aF07XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gYXJncy5hcmd1bWVudENhbGxiYWNrID8gYXJncy5hcmd1bWVudENhbGxiYWNrKGRpcnR5SW5kZXgpIDogZGlydHlJbmRleDsgLy8gQHRzLWlnbm9yZTogRm9yIHNvbWUgcmVhc29uIFR5cGVTY3JpcHQganVzdCBkb24ndCB3YW50IHRvIG1hdGNoIGl0LCBubyBtYXR0ZXIgaG93IGhhcmQgd2UgdHJ5LiBJIGNoYWxsZW5nZSB5b3UgdG8gdHJ5IHRvIHJlbW92ZSBpdCFcblxuICAgIHJldHVybiB2YWx1ZXNBcnJheVtpbmRleF07XG4gIH07XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRNYXRjaEZuKGFyZ3MpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICB2YXIgbWF0Y2hQYXR0ZXJuID0gd2lkdGggJiYgYXJncy5tYXRjaFBhdHRlcm5zW3dpZHRoXSB8fCBhcmdzLm1hdGNoUGF0dGVybnNbYXJncy5kZWZhdWx0TWF0Y2hXaWR0aF07XG4gICAgdmFyIG1hdGNoUmVzdWx0ID0gc3RyaW5nLm1hdGNoKG1hdGNoUGF0dGVybik7XG5cbiAgICBpZiAoIW1hdGNoUmVzdWx0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2hlZFN0cmluZyA9IG1hdGNoUmVzdWx0WzBdO1xuICAgIHZhciBwYXJzZVBhdHRlcm5zID0gd2lkdGggJiYgYXJncy5wYXJzZVBhdHRlcm5zW3dpZHRoXSB8fCBhcmdzLnBhcnNlUGF0dGVybnNbYXJncy5kZWZhdWx0UGFyc2VXaWR0aF07XG4gICAgdmFyIGtleSA9IEFycmF5LmlzQXJyYXkocGFyc2VQYXR0ZXJucykgPyBmaW5kSW5kZXgocGFyc2VQYXR0ZXJucywgZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QobWF0Y2hlZFN0cmluZyk7XG4gICAgfSkgOiBmaW5kS2V5KHBhcnNlUGF0dGVybnMsIGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgICByZXR1cm4gcGF0dGVybi50ZXN0KG1hdGNoZWRTdHJpbmcpO1xuICAgIH0pO1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YWx1ZSA9IGFyZ3MudmFsdWVDYWxsYmFjayA/IGFyZ3MudmFsdWVDYWxsYmFjayhrZXkpIDoga2V5O1xuICAgIHZhbHVlID0gb3B0aW9ucy52YWx1ZUNhbGxiYWNrID8gb3B0aW9ucy52YWx1ZUNhbGxiYWNrKHZhbHVlKSA6IHZhbHVlO1xuICAgIHZhciByZXN0ID0gc3RyaW5nLnNsaWNlKG1hdGNoZWRTdHJpbmcubGVuZ3RoKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgcmVzdDogcmVzdFxuICAgIH07XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpbmRLZXkob2JqZWN0LCBwcmVkaWNhdGUpIHtcbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBwcmVkaWNhdGUob2JqZWN0W2tleV0pKSB7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGZpbmRJbmRleChhcnJheSwgcHJlZGljYXRlKSB7XG4gIGZvciAodmFyIGtleSA9IDA7IGtleSA8IGFycmF5Lmxlbmd0aDsga2V5KyspIHtcbiAgICBpZiAocHJlZGljYXRlKGFycmF5W2tleV0pKSB7XG4gICAgICByZXR1cm4ga2V5O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRNYXRjaFBhdHRlcm5GbihhcmdzKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgIHZhciBtYXRjaFJlc3VsdCA9IHN0cmluZy5tYXRjaChhcmdzLm1hdGNoUGF0dGVybik7XG4gICAgaWYgKCFtYXRjaFJlc3VsdCkgcmV0dXJuIG51bGw7XG4gICAgdmFyIG1hdGNoZWRTdHJpbmcgPSBtYXRjaFJlc3VsdFswXTtcbiAgICB2YXIgcGFyc2VSZXN1bHQgPSBzdHJpbmcubWF0Y2goYXJncy5wYXJzZVBhdHRlcm4pO1xuICAgIGlmICghcGFyc2VSZXN1bHQpIHJldHVybiBudWxsO1xuICAgIHZhciB2YWx1ZSA9IGFyZ3MudmFsdWVDYWxsYmFjayA/IGFyZ3MudmFsdWVDYWxsYmFjayhwYXJzZVJlc3VsdFswXSkgOiBwYXJzZVJlc3VsdFswXTtcbiAgICB2YWx1ZSA9IG9wdGlvbnMudmFsdWVDYWxsYmFjayA/IG9wdGlvbnMudmFsdWVDYWxsYmFjayh2YWx1ZSkgOiB2YWx1ZTtcbiAgICB2YXIgcmVzdCA9IHN0cmluZy5zbGljZShtYXRjaGVkU3RyaW5nLmxlbmd0aCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIHJlc3Q6IHJlc3RcbiAgICB9O1xuICB9O1xufSIsInZhciBmb3JtYXREaXN0YW5jZUxvY2FsZSA9IHtcbiAgbGVzc1RoYW5YU2Vjb25kczoge1xuICAgIG9uZTogJ2xlc3MgdGhhbiBhIHNlY29uZCcsXG4gICAgb3RoZXI6ICdsZXNzIHRoYW4ge3tjb3VudH19IHNlY29uZHMnXG4gIH0sXG4gIHhTZWNvbmRzOiB7XG4gICAgb25lOiAnMSBzZWNvbmQnLFxuICAgIG90aGVyOiAne3tjb3VudH19IHNlY29uZHMnXG4gIH0sXG4gIGhhbGZBTWludXRlOiAnaGFsZiBhIG1pbnV0ZScsXG4gIGxlc3NUaGFuWE1pbnV0ZXM6IHtcbiAgICBvbmU6ICdsZXNzIHRoYW4gYSBtaW51dGUnLFxuICAgIG90aGVyOiAnbGVzcyB0aGFuIHt7Y291bnR9fSBtaW51dGVzJ1xuICB9LFxuICB4TWludXRlczoge1xuICAgIG9uZTogJzEgbWludXRlJyxcbiAgICBvdGhlcjogJ3t7Y291bnR9fSBtaW51dGVzJ1xuICB9LFxuICBhYm91dFhIb3Vyczoge1xuICAgIG9uZTogJ2Fib3V0IDEgaG91cicsXG4gICAgb3RoZXI6ICdhYm91dCB7e2NvdW50fX0gaG91cnMnXG4gIH0sXG4gIHhIb3Vyczoge1xuICAgIG9uZTogJzEgaG91cicsXG4gICAgb3RoZXI6ICd7e2NvdW50fX0gaG91cnMnXG4gIH0sXG4gIHhEYXlzOiB7XG4gICAgb25lOiAnMSBkYXknLFxuICAgIG90aGVyOiAne3tjb3VudH19IGRheXMnXG4gIH0sXG4gIGFib3V0WFdlZWtzOiB7XG4gICAgb25lOiAnYWJvdXQgMSB3ZWVrJyxcbiAgICBvdGhlcjogJ2Fib3V0IHt7Y291bnR9fSB3ZWVrcydcbiAgfSxcbiAgeFdlZWtzOiB7XG4gICAgb25lOiAnMSB3ZWVrJyxcbiAgICBvdGhlcjogJ3t7Y291bnR9fSB3ZWVrcydcbiAgfSxcbiAgYWJvdXRYTW9udGhzOiB7XG4gICAgb25lOiAnYWJvdXQgMSBtb250aCcsXG4gICAgb3RoZXI6ICdhYm91dCB7e2NvdW50fX0gbW9udGhzJ1xuICB9LFxuICB4TW9udGhzOiB7XG4gICAgb25lOiAnMSBtb250aCcsXG4gICAgb3RoZXI6ICd7e2NvdW50fX0gbW9udGhzJ1xuICB9LFxuICBhYm91dFhZZWFyczoge1xuICAgIG9uZTogJ2Fib3V0IDEgeWVhcicsXG4gICAgb3RoZXI6ICdhYm91dCB7e2NvdW50fX0geWVhcnMnXG4gIH0sXG4gIHhZZWFyczoge1xuICAgIG9uZTogJzEgeWVhcicsXG4gICAgb3RoZXI6ICd7e2NvdW50fX0geWVhcnMnXG4gIH0sXG4gIG92ZXJYWWVhcnM6IHtcbiAgICBvbmU6ICdvdmVyIDEgeWVhcicsXG4gICAgb3RoZXI6ICdvdmVyIHt7Y291bnR9fSB5ZWFycydcbiAgfSxcbiAgYWxtb3N0WFllYXJzOiB7XG4gICAgb25lOiAnYWxtb3N0IDEgeWVhcicsXG4gICAgb3RoZXI6ICdhbG1vc3Qge3tjb3VudH19IHllYXJzJ1xuICB9XG59O1xuXG52YXIgZm9ybWF0RGlzdGFuY2UgPSBmdW5jdGlvbiBmb3JtYXREaXN0YW5jZSh0b2tlbiwgY291bnQsIG9wdGlvbnMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgdmFyIHRva2VuVmFsdWUgPSBmb3JtYXREaXN0YW5jZUxvY2FsZVt0b2tlbl07XG5cbiAgaWYgKHR5cGVvZiB0b2tlblZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJlc3VsdCA9IHRva2VuVmFsdWU7XG4gIH0gZWxzZSBpZiAoY291bnQgPT09IDEpIHtcbiAgICByZXN1bHQgPSB0b2tlblZhbHVlLm9uZTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSB0b2tlblZhbHVlLm90aGVyLnJlcGxhY2UoJ3t7Y291bnR9fScsIGNvdW50LnRvU3RyaW5nKCkpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMgIT09IG51bGwgJiYgb3B0aW9ucyAhPT0gdm9pZCAwICYmIG9wdGlvbnMuYWRkU3VmZml4KSB7XG4gICAgaWYgKG9wdGlvbnMuY29tcGFyaXNvbiAmJiBvcHRpb25zLmNvbXBhcmlzb24gPiAwKSB7XG4gICAgICByZXR1cm4gJ2luICcgKyByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQgKyAnIGFnbyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZvcm1hdERpc3RhbmNlOyIsImltcG9ydCBidWlsZEZvcm1hdExvbmdGbiBmcm9tIFwiLi4vLi4vLi4vX2xpYi9idWlsZEZvcm1hdExvbmdGbi9pbmRleC5qc1wiO1xudmFyIGRhdGVGb3JtYXRzID0ge1xuICBmdWxsOiAnRUVFRSwgTU1NTSBkbywgeScsXG4gIGxvbmc6ICdNTU1NIGRvLCB5JyxcbiAgbWVkaXVtOiAnTU1NIGQsIHknLFxuICBzaG9ydDogJ01NL2RkL3l5eXknXG59O1xudmFyIHRpbWVGb3JtYXRzID0ge1xuICBmdWxsOiAnaDptbTpzcyBhIHp6enonLFxuICBsb25nOiAnaDptbTpzcyBhIHonLFxuICBtZWRpdW06ICdoOm1tOnNzIGEnLFxuICBzaG9ydDogJ2g6bW0gYSdcbn07XG52YXIgZGF0ZVRpbWVGb3JtYXRzID0ge1xuICBmdWxsOiBcInt7ZGF0ZX19ICdhdCcge3t0aW1lfX1cIixcbiAgbG9uZzogXCJ7e2RhdGV9fSAnYXQnIHt7dGltZX19XCIsXG4gIG1lZGl1bTogJ3t7ZGF0ZX19LCB7e3RpbWV9fScsXG4gIHNob3J0OiAne3tkYXRlfX0sIHt7dGltZX19J1xufTtcbnZhciBmb3JtYXRMb25nID0ge1xuICBkYXRlOiBidWlsZEZvcm1hdExvbmdGbih7XG4gICAgZm9ybWF0czogZGF0ZUZvcm1hdHMsXG4gICAgZGVmYXVsdFdpZHRoOiAnZnVsbCdcbiAgfSksXG4gIHRpbWU6IGJ1aWxkRm9ybWF0TG9uZ0ZuKHtcbiAgICBmb3JtYXRzOiB0aW1lRm9ybWF0cyxcbiAgICBkZWZhdWx0V2lkdGg6ICdmdWxsJ1xuICB9KSxcbiAgZGF0ZVRpbWU6IGJ1aWxkRm9ybWF0TG9uZ0ZuKHtcbiAgICBmb3JtYXRzOiBkYXRlVGltZUZvcm1hdHMsXG4gICAgZGVmYXVsdFdpZHRoOiAnZnVsbCdcbiAgfSlcbn07XG5leHBvcnQgZGVmYXVsdCBmb3JtYXRMb25nOyIsInZhciBmb3JtYXRSZWxhdGl2ZUxvY2FsZSA9IHtcbiAgbGFzdFdlZWs6IFwiJ2xhc3QnIGVlZWUgJ2F0JyBwXCIsXG4gIHllc3RlcmRheTogXCIneWVzdGVyZGF5IGF0JyBwXCIsXG4gIHRvZGF5OiBcIid0b2RheSBhdCcgcFwiLFxuICB0b21vcnJvdzogXCIndG9tb3Jyb3cgYXQnIHBcIixcbiAgbmV4dFdlZWs6IFwiZWVlZSAnYXQnIHBcIixcbiAgb3RoZXI6ICdQJ1xufTtcblxudmFyIGZvcm1hdFJlbGF0aXZlID0gZnVuY3Rpb24gZm9ybWF0UmVsYXRpdmUodG9rZW4sIF9kYXRlLCBfYmFzZURhdGUsIF9vcHRpb25zKSB7XG4gIHJldHVybiBmb3JtYXRSZWxhdGl2ZUxvY2FsZVt0b2tlbl07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmb3JtYXRSZWxhdGl2ZTsiLCJpbXBvcnQgYnVpbGRMb2NhbGl6ZUZuIGZyb20gXCIuLi8uLi8uLi9fbGliL2J1aWxkTG9jYWxpemVGbi9pbmRleC5qc1wiO1xudmFyIGVyYVZhbHVlcyA9IHtcbiAgbmFycm93OiBbJ0InLCAnQSddLFxuICBhYmJyZXZpYXRlZDogWydCQycsICdBRCddLFxuICB3aWRlOiBbJ0JlZm9yZSBDaHJpc3QnLCAnQW5ubyBEb21pbmknXVxufTtcbnZhciBxdWFydGVyVmFsdWVzID0ge1xuICBuYXJyb3c6IFsnMScsICcyJywgJzMnLCAnNCddLFxuICBhYmJyZXZpYXRlZDogWydRMScsICdRMicsICdRMycsICdRNCddLFxuICB3aWRlOiBbJzFzdCBxdWFydGVyJywgJzJuZCBxdWFydGVyJywgJzNyZCBxdWFydGVyJywgJzR0aCBxdWFydGVyJ11cbn07IC8vIE5vdGU6IGluIEVuZ2xpc2gsIHRoZSBuYW1lcyBvZiBkYXlzIG9mIHRoZSB3ZWVrIGFuZCBtb250aHMgYXJlIGNhcGl0YWxpemVkLlxuLy8gSWYgeW91IGFyZSBtYWtpbmcgYSBuZXcgbG9jYWxlIGJhc2VkIG9uIHRoaXMgb25lLCBjaGVjayBpZiB0aGUgc2FtZSBpcyB0cnVlIGZvciB0aGUgbGFuZ3VhZ2UgeW91J3JlIHdvcmtpbmcgb24uXG4vLyBHZW5lcmFsbHksIGZvcm1hdHRlZCBkYXRlcyBzaG91bGQgbG9vayBsaWtlIHRoZXkgYXJlIGluIHRoZSBtaWRkbGUgb2YgYSBzZW50ZW5jZSxcbi8vIGUuZy4gaW4gU3BhbmlzaCBsYW5ndWFnZSB0aGUgd2Vla2RheXMgYW5kIG1vbnRocyBzaG91bGQgYmUgaW4gdGhlIGxvd2VyY2FzZS5cblxudmFyIG1vbnRoVmFsdWVzID0ge1xuICBuYXJyb3c6IFsnSicsICdGJywgJ00nLCAnQScsICdNJywgJ0onLCAnSicsICdBJywgJ1MnLCAnTycsICdOJywgJ0QnXSxcbiAgYWJicmV2aWF0ZWQ6IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXSxcbiAgd2lkZTogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPY3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlY2VtYmVyJ11cbn07XG52YXIgZGF5VmFsdWVzID0ge1xuICBuYXJyb3c6IFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLFxuICBzaG9ydDogWydTdScsICdNbycsICdUdScsICdXZScsICdUaCcsICdGcicsICdTYSddLFxuICBhYmJyZXZpYXRlZDogWydTdW4nLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXSxcbiAgd2lkZTogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddXG59O1xudmFyIGRheVBlcmlvZFZhbHVlcyA9IHtcbiAgbmFycm93OiB7XG4gICAgYW06ICdhJyxcbiAgICBwbTogJ3AnLFxuICAgIG1pZG5pZ2h0OiAnbWknLFxuICAgIG5vb246ICduJyxcbiAgICBtb3JuaW5nOiAnbW9ybmluZycsXG4gICAgYWZ0ZXJub29uOiAnYWZ0ZXJub29uJyxcbiAgICBldmVuaW5nOiAnZXZlbmluZycsXG4gICAgbmlnaHQ6ICduaWdodCdcbiAgfSxcbiAgYWJicmV2aWF0ZWQ6IHtcbiAgICBhbTogJ0FNJyxcbiAgICBwbTogJ1BNJyxcbiAgICBtaWRuaWdodDogJ21pZG5pZ2h0JyxcbiAgICBub29uOiAnbm9vbicsXG4gICAgbW9ybmluZzogJ21vcm5pbmcnLFxuICAgIGFmdGVybm9vbjogJ2FmdGVybm9vbicsXG4gICAgZXZlbmluZzogJ2V2ZW5pbmcnLFxuICAgIG5pZ2h0OiAnbmlnaHQnXG4gIH0sXG4gIHdpZGU6IHtcbiAgICBhbTogJ2EubS4nLFxuICAgIHBtOiAncC5tLicsXG4gICAgbWlkbmlnaHQ6ICdtaWRuaWdodCcsXG4gICAgbm9vbjogJ25vb24nLFxuICAgIG1vcm5pbmc6ICdtb3JuaW5nJyxcbiAgICBhZnRlcm5vb246ICdhZnRlcm5vb24nLFxuICAgIGV2ZW5pbmc6ICdldmVuaW5nJyxcbiAgICBuaWdodDogJ25pZ2h0J1xuICB9XG59O1xudmFyIGZvcm1hdHRpbmdEYXlQZXJpb2RWYWx1ZXMgPSB7XG4gIG5hcnJvdzoge1xuICAgIGFtOiAnYScsXG4gICAgcG06ICdwJyxcbiAgICBtaWRuaWdodDogJ21pJyxcbiAgICBub29uOiAnbicsXG4gICAgbW9ybmluZzogJ2luIHRoZSBtb3JuaW5nJyxcbiAgICBhZnRlcm5vb246ICdpbiB0aGUgYWZ0ZXJub29uJyxcbiAgICBldmVuaW5nOiAnaW4gdGhlIGV2ZW5pbmcnLFxuICAgIG5pZ2h0OiAnYXQgbmlnaHQnXG4gIH0sXG4gIGFiYnJldmlhdGVkOiB7XG4gICAgYW06ICdBTScsXG4gICAgcG06ICdQTScsXG4gICAgbWlkbmlnaHQ6ICdtaWRuaWdodCcsXG4gICAgbm9vbjogJ25vb24nLFxuICAgIG1vcm5pbmc6ICdpbiB0aGUgbW9ybmluZycsXG4gICAgYWZ0ZXJub29uOiAnaW4gdGhlIGFmdGVybm9vbicsXG4gICAgZXZlbmluZzogJ2luIHRoZSBldmVuaW5nJyxcbiAgICBuaWdodDogJ2F0IG5pZ2h0J1xuICB9LFxuICB3aWRlOiB7XG4gICAgYW06ICdhLm0uJyxcbiAgICBwbTogJ3AubS4nLFxuICAgIG1pZG5pZ2h0OiAnbWlkbmlnaHQnLFxuICAgIG5vb246ICdub29uJyxcbiAgICBtb3JuaW5nOiAnaW4gdGhlIG1vcm5pbmcnLFxuICAgIGFmdGVybm9vbjogJ2luIHRoZSBhZnRlcm5vb24nLFxuICAgIGV2ZW5pbmc6ICdpbiB0aGUgZXZlbmluZycsXG4gICAgbmlnaHQ6ICdhdCBuaWdodCdcbiAgfVxufTtcblxudmFyIG9yZGluYWxOdW1iZXIgPSBmdW5jdGlvbiBvcmRpbmFsTnVtYmVyKGRpcnR5TnVtYmVyLCBfb3B0aW9ucykge1xuICB2YXIgbnVtYmVyID0gTnVtYmVyKGRpcnR5TnVtYmVyKTsgLy8gSWYgb3JkaW5hbCBudW1iZXJzIGRlcGVuZCBvbiBjb250ZXh0LCBmb3IgZXhhbXBsZSxcbiAgLy8gaWYgdGhleSBhcmUgZGlmZmVyZW50IGZvciBkaWZmZXJlbnQgZ3JhbW1hdGljYWwgZ2VuZGVycyxcbiAgLy8gdXNlIGBvcHRpb25zLnVuaXRgLlxuICAvL1xuICAvLyBgdW5pdGAgY2FuIGJlICd5ZWFyJywgJ3F1YXJ0ZXInLCAnbW9udGgnLCAnd2VlaycsICdkYXRlJywgJ2RheU9mWWVhcicsXG4gIC8vICdkYXknLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJy5cblxuICB2YXIgcmVtMTAwID0gbnVtYmVyICUgMTAwO1xuXG4gIGlmIChyZW0xMDAgPiAyMCB8fCByZW0xMDAgPCAxMCkge1xuICAgIHN3aXRjaCAocmVtMTAwICUgMTApIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIG51bWJlciArICdzdCc7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIG51bWJlciArICduZCc7XG5cbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIG51bWJlciArICdyZCc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bWJlciArICd0aCc7XG59O1xuXG52YXIgbG9jYWxpemUgPSB7XG4gIG9yZGluYWxOdW1iZXI6IG9yZGluYWxOdW1iZXIsXG4gIGVyYTogYnVpbGRMb2NhbGl6ZUZuKHtcbiAgICB2YWx1ZXM6IGVyYVZhbHVlcyxcbiAgICBkZWZhdWx0V2lkdGg6ICd3aWRlJ1xuICB9KSxcbiAgcXVhcnRlcjogYnVpbGRMb2NhbGl6ZUZuKHtcbiAgICB2YWx1ZXM6IHF1YXJ0ZXJWYWx1ZXMsXG4gICAgZGVmYXVsdFdpZHRoOiAnd2lkZScsXG4gICAgYXJndW1lbnRDYWxsYmFjazogZnVuY3Rpb24gYXJndW1lbnRDYWxsYmFjayhxdWFydGVyKSB7XG4gICAgICByZXR1cm4gcXVhcnRlciAtIDE7XG4gICAgfVxuICB9KSxcbiAgbW9udGg6IGJ1aWxkTG9jYWxpemVGbih7XG4gICAgdmFsdWVzOiBtb250aFZhbHVlcyxcbiAgICBkZWZhdWx0V2lkdGg6ICd3aWRlJ1xuICB9KSxcbiAgZGF5OiBidWlsZExvY2FsaXplRm4oe1xuICAgIHZhbHVlczogZGF5VmFsdWVzLFxuICAgIGRlZmF1bHRXaWR0aDogJ3dpZGUnXG4gIH0pLFxuICBkYXlQZXJpb2Q6IGJ1aWxkTG9jYWxpemVGbih7XG4gICAgdmFsdWVzOiBkYXlQZXJpb2RWYWx1ZXMsXG4gICAgZGVmYXVsdFdpZHRoOiAnd2lkZScsXG4gICAgZm9ybWF0dGluZ1ZhbHVlczogZm9ybWF0dGluZ0RheVBlcmlvZFZhbHVlcyxcbiAgICBkZWZhdWx0Rm9ybWF0dGluZ1dpZHRoOiAnd2lkZSdcbiAgfSlcbn07XG5leHBvcnQgZGVmYXVsdCBsb2NhbGl6ZTsiLCJpbXBvcnQgYnVpbGRNYXRjaEZuIGZyb20gXCIuLi8uLi8uLi9fbGliL2J1aWxkTWF0Y2hGbi9pbmRleC5qc1wiO1xuaW1wb3J0IGJ1aWxkTWF0Y2hQYXR0ZXJuRm4gZnJvbSBcIi4uLy4uLy4uL19saWIvYnVpbGRNYXRjaFBhdHRlcm5Gbi9pbmRleC5qc1wiO1xudmFyIG1hdGNoT3JkaW5hbE51bWJlclBhdHRlcm4gPSAvXihcXGQrKSh0aHxzdHxuZHxyZCk/L2k7XG52YXIgcGFyc2VPcmRpbmFsTnVtYmVyUGF0dGVybiA9IC9cXGQrL2k7XG52YXIgbWF0Y2hFcmFQYXR0ZXJucyA9IHtcbiAgbmFycm93OiAvXihifGEpL2ksXG4gIGFiYnJldmlhdGVkOiAvXihiXFwuP1xccz9jXFwuP3xiXFwuP1xccz9jXFwuP1xccz9lXFwuP3xhXFwuP1xccz9kXFwuP3xjXFwuP1xccz9lXFwuPykvaSxcbiAgd2lkZTogL14oYmVmb3JlIGNocmlzdHxiZWZvcmUgY29tbW9uIGVyYXxhbm5vIGRvbWluaXxjb21tb24gZXJhKS9pXG59O1xudmFyIHBhcnNlRXJhUGF0dGVybnMgPSB7XG4gIGFueTogWy9eYi9pLCAvXihhfGMpL2ldXG59O1xudmFyIG1hdGNoUXVhcnRlclBhdHRlcm5zID0ge1xuICBuYXJyb3c6IC9eWzEyMzRdL2ksXG4gIGFiYnJldmlhdGVkOiAvXnFbMTIzNF0vaSxcbiAgd2lkZTogL15bMTIzNF0odGh8c3R8bmR8cmQpPyBxdWFydGVyL2lcbn07XG52YXIgcGFyc2VRdWFydGVyUGF0dGVybnMgPSB7XG4gIGFueTogWy8xL2ksIC8yL2ksIC8zL2ksIC80L2ldXG59O1xudmFyIG1hdGNoTW9udGhQYXR0ZXJucyA9IHtcbiAgbmFycm93OiAvXltqZm1hc29uZF0vaSxcbiAgYWJicmV2aWF0ZWQ6IC9eKGphbnxmZWJ8bWFyfGFwcnxtYXl8anVufGp1bHxhdWd8c2VwfG9jdHxub3Z8ZGVjKS9pLFxuICB3aWRlOiAvXihqYW51YXJ5fGZlYnJ1YXJ5fG1hcmNofGFwcmlsfG1heXxqdW5lfGp1bHl8YXVndXN0fHNlcHRlbWJlcnxvY3RvYmVyfG5vdmVtYmVyfGRlY2VtYmVyKS9pXG59O1xudmFyIHBhcnNlTW9udGhQYXR0ZXJucyA9IHtcbiAgbmFycm93OiBbL15qL2ksIC9eZi9pLCAvXm0vaSwgL15hL2ksIC9ebS9pLCAvXmovaSwgL15qL2ksIC9eYS9pLCAvXnMvaSwgL15vL2ksIC9ebi9pLCAvXmQvaV0sXG4gIGFueTogWy9eamEvaSwgL15mL2ksIC9ebWFyL2ksIC9eYXAvaSwgL15tYXkvaSwgL15qdW4vaSwgL15qdWwvaSwgL15hdS9pLCAvXnMvaSwgL15vL2ksIC9ebi9pLCAvXmQvaV1cbn07XG52YXIgbWF0Y2hEYXlQYXR0ZXJucyA9IHtcbiAgbmFycm93OiAvXltzbXR3Zl0vaSxcbiAgc2hvcnQ6IC9eKHN1fG1vfHR1fHdlfHRofGZyfHNhKS9pLFxuICBhYmJyZXZpYXRlZDogL14oc3VufG1vbnx0dWV8d2VkfHRodXxmcml8c2F0KS9pLFxuICB3aWRlOiAvXihzdW5kYXl8bW9uZGF5fHR1ZXNkYXl8d2VkbmVzZGF5fHRodXJzZGF5fGZyaWRheXxzYXR1cmRheSkvaVxufTtcbnZhciBwYXJzZURheVBhdHRlcm5zID0ge1xuICBuYXJyb3c6IFsvXnMvaSwgL15tL2ksIC9edC9pLCAvXncvaSwgL150L2ksIC9eZi9pLCAvXnMvaV0sXG4gIGFueTogWy9ec3UvaSwgL15tL2ksIC9edHUvaSwgL153L2ksIC9edGgvaSwgL15mL2ksIC9ec2EvaV1cbn07XG52YXIgbWF0Y2hEYXlQZXJpb2RQYXR0ZXJucyA9IHtcbiAgbmFycm93OiAvXihhfHB8bWl8bnwoaW4gdGhlfGF0KSAobW9ybmluZ3xhZnRlcm5vb258ZXZlbmluZ3xuaWdodCkpL2ksXG4gIGFueTogL14oW2FwXVxcLj9cXHM/bVxcLj98bWlkbmlnaHR8bm9vbnwoaW4gdGhlfGF0KSAobW9ybmluZ3xhZnRlcm5vb258ZXZlbmluZ3xuaWdodCkpL2lcbn07XG52YXIgcGFyc2VEYXlQZXJpb2RQYXR0ZXJucyA9IHtcbiAgYW55OiB7XG4gICAgYW06IC9eYS9pLFxuICAgIHBtOiAvXnAvaSxcbiAgICBtaWRuaWdodDogL15taS9pLFxuICAgIG5vb246IC9ebm8vaSxcbiAgICBtb3JuaW5nOiAvbW9ybmluZy9pLFxuICAgIGFmdGVybm9vbjogL2FmdGVybm9vbi9pLFxuICAgIGV2ZW5pbmc6IC9ldmVuaW5nL2ksXG4gICAgbmlnaHQ6IC9uaWdodC9pXG4gIH1cbn07XG52YXIgbWF0Y2ggPSB7XG4gIG9yZGluYWxOdW1iZXI6IGJ1aWxkTWF0Y2hQYXR0ZXJuRm4oe1xuICAgIG1hdGNoUGF0dGVybjogbWF0Y2hPcmRpbmFsTnVtYmVyUGF0dGVybixcbiAgICBwYXJzZVBhdHRlcm46IHBhcnNlT3JkaW5hbE51bWJlclBhdHRlcm4sXG4gICAgdmFsdWVDYWxsYmFjazogZnVuY3Rpb24gdmFsdWVDYWxsYmFjayh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlLCAxMCk7XG4gICAgfVxuICB9KSxcbiAgZXJhOiBidWlsZE1hdGNoRm4oe1xuICAgIG1hdGNoUGF0dGVybnM6IG1hdGNoRXJhUGF0dGVybnMsXG4gICAgZGVmYXVsdE1hdGNoV2lkdGg6ICd3aWRlJyxcbiAgICBwYXJzZVBhdHRlcm5zOiBwYXJzZUVyYVBhdHRlcm5zLFxuICAgIGRlZmF1bHRQYXJzZVdpZHRoOiAnYW55J1xuICB9KSxcbiAgcXVhcnRlcjogYnVpbGRNYXRjaEZuKHtcbiAgICBtYXRjaFBhdHRlcm5zOiBtYXRjaFF1YXJ0ZXJQYXR0ZXJucyxcbiAgICBkZWZhdWx0TWF0Y2hXaWR0aDogJ3dpZGUnLFxuICAgIHBhcnNlUGF0dGVybnM6IHBhcnNlUXVhcnRlclBhdHRlcm5zLFxuICAgIGRlZmF1bHRQYXJzZVdpZHRoOiAnYW55JyxcbiAgICB2YWx1ZUNhbGxiYWNrOiBmdW5jdGlvbiB2YWx1ZUNhbGxiYWNrKGluZGV4KSB7XG4gICAgICByZXR1cm4gaW5kZXggKyAxO1xuICAgIH1cbiAgfSksXG4gIG1vbnRoOiBidWlsZE1hdGNoRm4oe1xuICAgIG1hdGNoUGF0dGVybnM6IG1hdGNoTW9udGhQYXR0ZXJucyxcbiAgICBkZWZhdWx0TWF0Y2hXaWR0aDogJ3dpZGUnLFxuICAgIHBhcnNlUGF0dGVybnM6IHBhcnNlTW9udGhQYXR0ZXJucyxcbiAgICBkZWZhdWx0UGFyc2VXaWR0aDogJ2FueSdcbiAgfSksXG4gIGRheTogYnVpbGRNYXRjaEZuKHtcbiAgICBtYXRjaFBhdHRlcm5zOiBtYXRjaERheVBhdHRlcm5zLFxuICAgIGRlZmF1bHRNYXRjaFdpZHRoOiAnd2lkZScsXG4gICAgcGFyc2VQYXR0ZXJuczogcGFyc2VEYXlQYXR0ZXJucyxcbiAgICBkZWZhdWx0UGFyc2VXaWR0aDogJ2FueSdcbiAgfSksXG4gIGRheVBlcmlvZDogYnVpbGRNYXRjaEZuKHtcbiAgICBtYXRjaFBhdHRlcm5zOiBtYXRjaERheVBlcmlvZFBhdHRlcm5zLFxuICAgIGRlZmF1bHRNYXRjaFdpZHRoOiAnYW55JyxcbiAgICBwYXJzZVBhdHRlcm5zOiBwYXJzZURheVBlcmlvZFBhdHRlcm5zLFxuICAgIGRlZmF1bHRQYXJzZVdpZHRoOiAnYW55J1xuICB9KVxufTtcbmV4cG9ydCBkZWZhdWx0IG1hdGNoOyIsImltcG9ydCBmb3JtYXREaXN0YW5jZSBmcm9tIFwiLi9fbGliL2Zvcm1hdERpc3RhbmNlL2luZGV4LmpzXCI7XG5pbXBvcnQgZm9ybWF0TG9uZyBmcm9tIFwiLi9fbGliL2Zvcm1hdExvbmcvaW5kZXguanNcIjtcbmltcG9ydCBmb3JtYXRSZWxhdGl2ZSBmcm9tIFwiLi9fbGliL2Zvcm1hdFJlbGF0aXZlL2luZGV4LmpzXCI7XG5pbXBvcnQgbG9jYWxpemUgZnJvbSBcIi4vX2xpYi9sb2NhbGl6ZS9pbmRleC5qc1wiO1xuaW1wb3J0IG1hdGNoIGZyb20gXCIuL19saWIvbWF0Y2gvaW5kZXguanNcIjtcblxuLyoqXG4gKiBAdHlwZSB7TG9jYWxlfVxuICogQGNhdGVnb3J5IExvY2FsZXNcbiAqIEBzdW1tYXJ5IEVuZ2xpc2ggbG9jYWxlIChVbml0ZWQgU3RhdGVzKS5cbiAqIEBsYW5ndWFnZSBFbmdsaXNoXG4gKiBAaXNvLTYzOS0yIGVuZ1xuICogQGF1dGhvciBTYXNoYSBLb3NzIFtAa29zc25vY29ycF17QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2tvc3Nub2NvcnB9XG4gKiBAYXV0aG9yIExlc2hhIEtvc3MgW0BsZXNoYWtvc3Nde0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9sZXNoYWtvc3N9XG4gKi9cbnZhciBsb2NhbGUgPSB7XG4gIGNvZGU6ICdlbi1VUycsXG4gIGZvcm1hdERpc3RhbmNlOiBmb3JtYXREaXN0YW5jZSxcbiAgZm9ybWF0TG9uZzogZm9ybWF0TG9uZyxcbiAgZm9ybWF0UmVsYXRpdmU6IGZvcm1hdFJlbGF0aXZlLFxuICBsb2NhbGl6ZTogbG9jYWxpemUsXG4gIG1hdGNoOiBtYXRjaCxcbiAgb3B0aW9uczoge1xuICAgIHdlZWtTdGFydHNPbjogMFxuICAgIC8qIFN1bmRheSAqL1xuICAgICxcbiAgICBmaXJzdFdlZWtDb250YWluc0RhdGU6IDFcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IGxvY2FsZTsiLCJpbXBvcnQgYWRkTWlsbGlzZWNvbmRzIGZyb20gXCIuLi9hZGRNaWxsaXNlY29uZHMvaW5kZXguanNcIjtcbmltcG9ydCByZXF1aXJlZEFyZ3MgZnJvbSBcIi4uL19saWIvcmVxdWlyZWRBcmdzL2luZGV4LmpzXCI7XG5pbXBvcnQgdG9JbnRlZ2VyIGZyb20gXCIuLi9fbGliL3RvSW50ZWdlci9pbmRleC5qc1wiO1xuLyoqXG4gKiBAbmFtZSBzdWJNaWxsaXNlY29uZHNcbiAqIEBjYXRlZ29yeSBNaWxsaXNlY29uZCBIZWxwZXJzXG4gKiBAc3VtbWFyeSBTdWJ0cmFjdCB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZnJvbSB0aGUgZ2l2ZW4gZGF0ZS5cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFN1YnRyYWN0IHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHRoZSBnaXZlbiBkYXRlLlxuICpcbiAqIEBwYXJhbSB7RGF0ZXxOdW1iZXJ9IGRhdGUgLSB0aGUgZGF0ZSB0byBiZSBjaGFuZ2VkXG4gKiBAcGFyYW0ge051bWJlcn0gYW1vdW50IC0gdGhlIGFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gYmUgc3VidHJhY3RlZC4gUG9zaXRpdmUgZGVjaW1hbHMgd2lsbCBiZSByb3VuZGVkIHVzaW5nIGBNYXRoLmZsb29yYCwgZGVjaW1hbHMgbGVzcyB0aGFuIHplcm8gd2lsbCBiZSByb3VuZGVkIHVzaW5nIGBNYXRoLmNlaWxgLlxuICogQHJldHVybnMge0RhdGV9IHRoZSBuZXcgZGF0ZSB3aXRoIHRoZSBtaWxsaXNlY29uZHMgc3VidHJhY3RlZFxuICogQHRocm93cyB7VHlwZUVycm9yfSAyIGFyZ3VtZW50cyByZXF1aXJlZFxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBTdWJ0cmFjdCA3NTAgbWlsbGlzZWNvbmRzIGZyb20gMTAgSnVseSAyMDE0IDEyOjQ1OjMwLjAwMDpcbiAqIGNvbnN0IHJlc3VsdCA9IHN1Yk1pbGxpc2Vjb25kcyhuZXcgRGF0ZSgyMDE0LCA2LCAxMCwgMTIsIDQ1LCAzMCwgMCksIDc1MClcbiAqIC8vPT4gVGh1IEp1bCAxMCAyMDE0IDEyOjQ1OjI5LjI1MFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN1Yk1pbGxpc2Vjb25kcyhkaXJ0eURhdGUsIGRpcnR5QW1vdW50KSB7XG4gIHJlcXVpcmVkQXJncygyLCBhcmd1bWVudHMpO1xuICB2YXIgYW1vdW50ID0gdG9JbnRlZ2VyKGRpcnR5QW1vdW50KTtcbiAgcmV0dXJuIGFkZE1pbGxpc2Vjb25kcyhkaXJ0eURhdGUsIC1hbW91bnQpO1xufSIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfTsgfSBlbHNlIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9OyB9IHJldHVybiBfdHlwZW9mKG9iaik7IH1cblxuaW1wb3J0IHJlcXVpcmVkQXJncyBmcm9tIFwiLi4vX2xpYi9yZXF1aXJlZEFyZ3MvaW5kZXguanNcIjtcbi8qKlxuICogQG5hbWUgdG9EYXRlXG4gKiBAY2F0ZWdvcnkgQ29tbW9uIEhlbHBlcnNcbiAqIEBzdW1tYXJ5IENvbnZlcnQgdGhlIGdpdmVuIGFyZ3VtZW50IHRvIGFuIGluc3RhbmNlIG9mIERhdGUuXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDb252ZXJ0IHRoZSBnaXZlbiBhcmd1bWVudCB0byBhbiBpbnN0YW5jZSBvZiBEYXRlLlxuICpcbiAqIElmIHRoZSBhcmd1bWVudCBpcyBhbiBpbnN0YW5jZSBvZiBEYXRlLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBpdHMgY2xvbmUuXG4gKlxuICogSWYgdGhlIGFyZ3VtZW50IGlzIGEgbnVtYmVyLCBpdCBpcyB0cmVhdGVkIGFzIGEgdGltZXN0YW1wLlxuICpcbiAqIElmIHRoZSBhcmd1bWVudCBpcyBub25lIG9mIHRoZSBhYm92ZSwgdGhlIGZ1bmN0aW9uIHJldHVybnMgSW52YWxpZCBEYXRlLlxuICpcbiAqICoqTm90ZSoqOiAqYWxsKiBEYXRlIGFyZ3VtZW50cyBwYXNzZWQgdG8gYW55ICpkYXRlLWZucyogZnVuY3Rpb24gaXMgcHJvY2Vzc2VkIGJ5IGB0b0RhdGVgLlxuICpcbiAqIEBwYXJhbSB7RGF0ZXxOdW1iZXJ9IGFyZ3VtZW50IC0gdGhlIHZhbHVlIHRvIGNvbnZlcnRcbiAqIEByZXR1cm5zIHtEYXRlfSB0aGUgcGFyc2VkIGRhdGUgaW4gdGhlIGxvY2FsIHRpbWUgem9uZVxuICogQHRocm93cyB7VHlwZUVycm9yfSAxIGFyZ3VtZW50IHJlcXVpcmVkXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIENsb25lIHRoZSBkYXRlOlxuICogY29uc3QgcmVzdWx0ID0gdG9EYXRlKG5ldyBEYXRlKDIwMTQsIDEsIDExLCAxMSwgMzAsIDMwKSlcbiAqIC8vPT4gVHVlIEZlYiAxMSAyMDE0IDExOjMwOjMwXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIENvbnZlcnQgdGhlIHRpbWVzdGFtcCB0byBkYXRlOlxuICogY29uc3QgcmVzdWx0ID0gdG9EYXRlKDEzOTIwOTg0MzAwMDApXG4gKiAvLz0+IFR1ZSBGZWIgMTEgMjAxNCAxMTozMDozMFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRvRGF0ZShhcmd1bWVudCkge1xuICByZXF1aXJlZEFyZ3MoMSwgYXJndW1lbnRzKTtcbiAgdmFyIGFyZ1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudCk7IC8vIENsb25lIHRoZSBkYXRlXG5cbiAgaWYgKGFyZ3VtZW50IGluc3RhbmNlb2YgRGF0ZSB8fCBfdHlwZW9mKGFyZ3VtZW50KSA9PT0gJ29iamVjdCcgJiYgYXJnU3RyID09PSAnW29iamVjdCBEYXRlXScpIHtcbiAgICAvLyBQcmV2ZW50IHRoZSBkYXRlIHRvIGxvc2UgdGhlIG1pbGxpc2Vjb25kcyB3aGVuIHBhc3NlZCB0byBuZXcgRGF0ZSgpIGluIElFMTBcbiAgICByZXR1cm4gbmV3IERhdGUoYXJndW1lbnQuZ2V0VGltZSgpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgYXJndW1lbnQgPT09ICdudW1iZXInIHx8IGFyZ1N0ciA9PT0gJ1tvYmplY3QgTnVtYmVyXScpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoYXJndW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIGlmICgodHlwZW9mIGFyZ3VtZW50ID09PSAnc3RyaW5nJyB8fCBhcmdTdHIgPT09ICdbb2JqZWN0IFN0cmluZ10nKSAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXCJTdGFydGluZyB3aXRoIHYyLjAuMC1iZXRhLjEgZGF0ZS1mbnMgZG9lc24ndCBhY2NlcHQgc3RyaW5ncyBhcyBkYXRlIGFyZ3VtZW50cy4gUGxlYXNlIHVzZSBgcGFyc2VJU09gIHRvIHBhcnNlIHN0cmluZ3MuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2RhdGUtZm5zL2RhdGUtZm5zL2Jsb2IvbWFzdGVyL2RvY3MvdXBncmFkZUd1aWRlLm1kI3N0cmluZy1hcmd1bWVudHNcIik7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG5cbiAgICAgIGNvbnNvbGUud2FybihuZXcgRXJyb3IoKS5zdGFjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEYXRlKE5hTik7XG4gIH1cbn0iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0IHtmb3JtYXR9IGZyb20gXCJkYXRlLWZuc1wiO1xuaW1wb3J0IHsgZWwgfSBmcm9tIFwiZGF0ZS1mbnMvbG9jYWxlXCI7XG5pbXBvcnQgQ29sY2FkZSBmcm9tICdjb2xjYWRlJztcbmltcG9ydCBJY29uRWRpdCBmcm9tICcuL2ltYWdlcy9lZGl0LnBuZyc7XG5pbXBvcnQgSWNvbkRlbGV0ZSBmcm9tICcuL2ltYWdlcy9iaW4ucG5nJztcblxuXG4vLyBET00gbWFuaXB1bGF0aW9uIG9iamVjdCBcbmV4cG9ydCBjb25zdCBkb21NYW5pcHVsYXRvciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyBkaXNwbGF5cyBhbGwgdG9kb3Mgc3RvcmVkIGluIGFycmF5IHRvIHRoZSBkb21cbiAgICBmdW5jdGlvbiByZW5kZXJUb0Rvcyh0b2RvcywgZWxlbWVudCkge1xuXG4gICAgICAgIFxuXG4gICAgICAgIC8vIGdyYWIgcmVsZXZlbnQgdG9kbyBpdGVtc1xuICAgICAgICBjb25zdCB0b0RvTGlzdCA9IHRvZG9zW3RvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpXTtcbiAgICAgICAgLy8gY29uc29sZS5sb2codG9Eb0xpc3QpO1xuICAgICAgICBcblxuICAgICAgICAvLyBjbGVhciBvdXQgZGlzcGxheSBiZWZvcmUgcmVkaXNwbGF5aW5nIGFsbCB0by1kb3NcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiIFxuICAgICAgICBcbiAgICAgICAgLy8gZG9udCByZW5kZXIgYW4gZW1wdHkgbGlzdFxuICAgICAgICBpZiAodG9Eb0xpc3QubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gY3JlYXRlIGEgdG8tZG8gZWxlbWVudCBmb3IgZWFjaCB0b2RvIHN0b3JlZCBpbiB0aGUgcGFzc2VkIGFycmF5IFxuICAgICAgICAvLyBhbmQgYXBwZW5kIHRoZW0gdG8gdGhlIGRvbSBlbGVtZW50IHN1cHBsaWVkIHRvIHRoZSBmdW5jdGlvblxuICAgICAgICB0b0RvTGlzdC5mb3JFYWNoKCh0b2RvLCBpKSA9PiB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBtYWluIGJvZHkgb2YgdGhlIHRvLWRvIGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHRvRG9Cb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0b0RvQm9keS5jbGFzc0xpc3QuYWRkKCd0b2RvJyk7XG4gICAgICAgICAgICB0b0RvQm9keS5jbGFzc0xpc3QuYWRkKGBwcmlvcml0eS0ke3RvZG8ucHJpb3JpdHl9YCk7XG4gICAgICAgICAgICAvLyBnaXZlIGVhY2ggdG8tZG8gZWxlbWVudCBhIHVuaXF1ZSB2YWx1ZSB0aGF0IGNvcnJlc3BvbmRzIHRvXG4gICAgICAgICAgICAvLyBpdCdzIGRhdGEncyBwb3NpdGlvbiBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIHRvRG9Cb2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGkpO1xuICAgICAgICAgICAgLy8gc2V0IGRhdGEgYXRycmlidXRlIHRvIHRoZSB0by1kbyBpdGVtcyBwcm9qZWN0IG5hbWVcbiAgICAgICAgICAgIHRvRG9Cb2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1wcm9qZWN0JywgYCR7dG9kby5wcm9qZWN0fWApXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0by1kbyBpdGVtIGNoZWNrYm94IFxuICAgICAgICAgICAgY29uc3QgdG9Eb0NoZWNrQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0b0RvQ2hlY2tCb3guY2xhc3NMaXN0LmFkZCgndG9kb19fY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRvRG9DaGVja0JveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gdG9nZ2xlQ2hlY2tCb3goZSwgdG9kb3MsIGVsZW1lbnQpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY3JlYXRlIHRvLWRvIGl0ZW0gdGl0bGVcbiAgICAgICAgICAgIGNvbnN0IHRvRG9UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdG9Eb1RpdGxlLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX3RpdGxlJyk7XG4gICAgICAgICAgICB0b0RvVGl0bGUudGV4dENvbnRlbnQgPSB0b2RvLm5hbWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0by1kbyBpdGVtIGRldGFpbHMgYnV0dG9uXG4gICAgICAgICAgICBjb25zdCB0b0RvRGV0YWlscyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdG9Eb0RldGFpbHMuY2xhc3NMaXN0LmFkZCgndG9kb19fZGV0YWlsJyk7XG4gICAgICAgICAgICB0b0RvRGV0YWlscy50ZXh0Q29udGVudCA9ICdkZXRhaWxzJztcbiAgICAgICAgICAgIHRvRG9EZXRhaWxzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICByZW5kZXJEZXRhaWxzKGUsIHRvRG9MaXN0KTtcbiAgICAgICAgICAgIH0pXG4gICAgXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSB0by1kbyBkdWUgZGF0ZSBsYWJlbC5cbiAgICAgICAgICAgIC8vIGRpc3BsYXlzIGEgaHVtYW4gcmVhZGFibGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGUgaW5wdXQgc3RyaW5nXG4gICAgICAgICAgICBjb25zdCB0b0RvRGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdG9Eb0RhdGUuY2xhc3NMaXN0LmFkZCgndG9kb19fZGF0ZScpO1xuICAgICAgICAgICAgLy8gY29udmVydCBkYXRlIHN0cmluZyBpbnRvIGEgZGF0ZSB0aGUgZm9ybSBvZiBcIkphbiAxMnRoXCJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVPYmplY3QgPSBuZXcgRGF0ZSh0b2RvLmRhdGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0ZU1vbnRoID0gZm9ybWF0KGRhdGVPYmplY3QsICdNTU0nKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGVEYXkgPSBmb3JtYXQoZGF0ZU9iamVjdCwgJ2RvJyk7XG4gICAgICAgICAgICBjb25zdCBkYXRlRm9ybWF0ZWQgPSBgJHtkYXRlTW9udGh9ICR7ZGF0ZURheX1gO1xuICAgICAgICAgICAgdG9Eb0RhdGUudGV4dENvbnRlbnQgPSBkYXRlRm9ybWF0ZWQ7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGVkaXQgaWNvbiBmb3IgdGhlIHRvLWRvIGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHRvRG9FZGl0ID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICB0b0RvRWRpdC5zcmM9SWNvbkVkaXRcbiAgICAgICAgICAgIHRvRG9FZGl0LmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2ljb24tZWRpdCcpO1xuICAgICAgICAgICAgdG9Eb0VkaXQuY2xhc3NMaXN0LmFkZCgndG9kb19faWNvbicpO1xuICAgICAgICAgICAgdG9Eb0VkaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHJlbmRlckVkaXQoZSwgdG9Eb0xpc3QsIGVsZW1lbnQpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gY3JlYXRlIGEgZGVsZXRlIGljb24gZm9yIHRoZSB0by1kbyBpdGVtXG4gICAgICAgICAgICBjb25zdCB0b0RvRGVsZXRlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICB0b0RvRGVsZXRlLnNyYz1JY29uRGVsZXRlO1xuICAgICAgICAgICAgdG9Eb0RlbGV0ZS5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uJyk7XG4gICAgICAgICAgICB0b0RvRGVsZXRlLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2ljb24tYmluJyk7XG4gICAgICAgICAgICB0b0RvRGVsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB0b0Rvc01hbmFnZXIuZGVsZXRlVG9EbyhlLCB0b2RvcywgZWxlbWVudCkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvQ2hlY2tCb3gpO1xuICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb1RpdGxlKTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9EZXRhaWxzKTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9EYXRlKTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9FZGl0KTtcbiAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9EZWxldGUpO1xuXG4gICAgICAgICAgICAvL2FwcGx5IGNoZWNrZWQgc3RhdHVzIFxuICAgICAgICAgICAgaWYgKHRvZG8uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGFwcGx5Q2hlY2tlZE9uUmVsb2FkKHRvRG9Cb2R5KVxuICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZCh0b0RvQm9keSk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gc2F2ZSB0b2RvcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9kb3NcIiwgSlNPTi5zdHJpbmdpZnkodG9kb3MpKTtcbiAgICB9XG5cbiAgICAvLyByZW5kZXIgYWxsIHRvLWRvcyBmcm9tIGFsbCBwcm9qZWN0cyBcbiAgICBmdW5jdGlvbiByZW5kZXJBbGxUb0Rvcyh0b0RvT2JqZWN0LCBlbGVtZW50KSB7XG5cbiAgICAgICAgXG5cbiAgICAgICAgLy8gY2xlYXIgb3V0IGRpc3BsYXkgYmVmb3JlIHJlZGlzcGxheWluZyBhbGwgdG8tZG9zXG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIiBcblxuICAgICAgICBmb3IgKGNvbnN0IHByb2plY3QgaW4gdG9Eb09iamVjdCkge1xuXG4gICAgICAgICAgICAvLyBjcmVhdGUgYSB0by1kbyBlbGVtZW50IGZvciBlYWNoIHRvZG8gc3RvcmVkIGluIHRoZSBwYXNzZWQgYXJyYXkgXG4gICAgICAgICAgICAvLyBhbmQgYXBwZW5kIHRoZW0gdG8gdGhlIGRvbSBlbGVtZW50IHN1cHBsaWVkIHRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgdG9Eb09iamVjdFtwcm9qZWN0XS5mb3JFYWNoKCh0b2RvLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG1haW4gYm9keSBvZiB0aGUgdG8tZG8gaXRlbVxuICAgICAgICAgICAgICAgIGNvbnN0IHRvRG9Cb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuY2xhc3NMaXN0LmFkZCgndG9kbycpO1xuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LmNsYXNzTGlzdC5hZGQoYHByaW9yaXR5LSR7dG9kby5wcmlvcml0eX1gKTtcbiAgICAgICAgICAgICAgICAvLyBnaXZlIGVhY2ggdG8tZG8gZWxlbWVudCBhIHVuaXF1ZSB2YWx1ZSB0aGF0IGNvcnJlc3BvbmRzIHRvXG4gICAgICAgICAgICAgICAgLy8gaXQncyBkYXRhJ3MgcG9zaXRpb24gaW4gdGhlIGFycmF5XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaSk7XG4gICAgICAgICAgICAgICAgLy8gc2V0IGRhdGEgYXRycmlidXRlIHRvIHRoZSB0by1kbyBpdGVtcyBwcm9qZWN0IG5hbWVcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvamVjdCcsIGAke3RvZG8ucHJvamVjdH1gKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0by1kbyBpdGVtIGNoZWNrYm94IFxuICAgICAgICAgICAgICAgIGNvbnN0IHRvRG9DaGVja0JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIHRvRG9DaGVja0JveC5jbGFzc0xpc3QuYWRkKCd0b2RvX19jb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgIHRvRG9DaGVja0JveC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gdG9nZ2xlQ2hlY2tCb3goZSwgdG9Eb09iamVjdCwgZWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0by1kbyBpdGVtIHRpdGxlXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdG9Eb1RpdGxlLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX3RpdGxlJyk7XG4gICAgICAgICAgICAgICAgdG9Eb1RpdGxlLnRleHRDb250ZW50ID0gdG9kby5uYW1lO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSB0by1kbyBpdGVtIGRldGFpbHMgYnV0dG9uXG4gICAgICAgICAgICAgICAgY29uc3QgdG9Eb0RldGFpbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICB0b0RvRGV0YWlscy5jbGFzc0xpc3QuYWRkKCd0b2RvX19kZXRhaWwnKTtcbiAgICAgICAgICAgICAgICB0b0RvRGV0YWlscy50ZXh0Q29udGVudCA9ICdkZXRhaWxzJztcbiAgICAgICAgICAgICAgICB0b0RvRGV0YWlscy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckRldGFpbHMoZSwgdG9Eb09iamVjdFtwcm9qZWN0XSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgdG8tZG8gZHVlIGRhdGUgbGFiZWwuXG4gICAgICAgICAgICAgICAgLy8gZGlzcGxheXMgYSBodW1hbiByZWFkYWJsZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZGF0ZSBpbnB1dCBzdHJpbmdcbiAgICAgICAgICAgICAgICBjb25zdCB0b0RvRGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIHRvRG9EYXRlLmNsYXNzTGlzdC5hZGQoJ3RvZG9fX2RhdGUnKTtcbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IGRhdGUgc3RyaW5nIGludG8gYSBkYXRlIHRoZSBmb3JtIG9mIFwiSmFuIDEydGhcIlxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVPYmplY3QgPSBuZXcgRGF0ZSh0b2RvLmRhdGUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVNb250aCA9IGZvcm1hdChkYXRlT2JqZWN0LCAnTU1NJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZURheSA9IGZvcm1hdChkYXRlT2JqZWN0LCAnZG8nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlRm9ybWF0ZWQgPSBgJHtkYXRlTW9udGh9ICR7ZGF0ZURheX1gO1xuICAgICAgICAgICAgICAgIHRvRG9EYXRlLnRleHRDb250ZW50ID0gZGF0ZUZvcm1hdGVkO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGEgZWRpdCBpY29uIGZvciB0aGUgdG8tZG8gaXRlbVxuICAgICAgICAgICAgICAgIGNvbnN0IHRvRG9FZGl0PW5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHRvRG9FZGl0LnNyYz1JY29uRWRpdDtcbiAgICAgICAgICAgICAgICB0b0RvRWRpdC5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uLWVkaXQnKTtcbiAgICAgICAgICAgICAgICB0b0RvRWRpdC5jbGFzc0xpc3QuYWRkKCd0b2RvX19pY29uJyk7XG4gICAgICAgICAgICAgICAgdG9Eb0VkaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHJlbmRlckVkaXQoZSwgdG9Eb09iamVjdFtwcm9qZWN0XSwgZWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBhIGRlbGV0ZSBpY29uIGZvciB0aGUgdG8tZG8gaXRlbVxuICAgICAgICAgICAgICAgIGNvbnN0IHRvRG9EZWxldGUgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB0b0RvRGVsZXRlLnNyYz1JY29uRGVsZXRlO1xuICAgICAgICAgICAgICAgIHRvRG9EZWxldGUuY2xhc3NMaXN0LmFkZCgndG9kb19faWNvbicpO1xuICAgICAgICAgICAgICAgIHRvRG9EZWxldGUuY2xhc3NMaXN0LmFkZCgndG9kb19faWNvbi1iaW4nKTtcbiAgICAgICAgICAgICAgICB0b0RvRGVsZXRlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB0b0Rvc01hbmFnZXIuZGVsZXRlVG9EbyhlLCB0b0RvT2JqZWN0LCBlbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9DaGVja0JveCk7XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb1RpdGxlKTtcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgdG9Eb0JvZHkuYXBwZW5kQ2hpbGQodG9Eb0RhdGUpO1xuICAgICAgICAgICAgICAgIHRvRG9Cb2R5LmFwcGVuZENoaWxkKHRvRG9FZGl0KTtcbiAgICAgICAgICAgICAgICB0b0RvQm9keS5hcHBlbmRDaGlsZCh0b0RvRGVsZXRlKTtcblxuICAgICAgICAgICAgICAgIC8vYXBwbHkgY2hlY2tlZCBzdGF0dXMgXG4gICAgICAgICAgICAgICAgaWYgKHRvZG8uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBhcHBseUNoZWNrZWRPblJlbG9hZCh0b0RvQm9keSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQodG9Eb0JvZHkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgdG9kb3MgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRvZG9zXCIsIEpTT04uc3RyaW5naWZ5KHRvRG9PYmplY3QpKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIHJldHJpZXZlIHRoZSBkZXRhaWxzIGZvciBhIHNlbGVjdGVkIHRvLWRvIGl0ZW0gYW5kIHJlbmRlciB0aGVtIGluIGEgcG9wdXBcbiAgICBmdW5jdGlvbiByZW5kZXJEZXRhaWxzKGUsIHRvZG9zKSB7XG5cbiAgICAgICAgY29uc3QgaSA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuZGF0YXNldC5pbmRleDtcbiAgICAgICAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vdmVybGF5LWRldGFpbHMnKTtcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZXRhaWxzLXBvcHVwX19jb250ZW50Jyk7XG4gICAgICAgIGNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRldGFpbHMtcG9wdXAnKTtcblxuICAgICAgICAvLyBjbGVhciBvdXQgdGhlIHBvcHVwIGRldGFpbHMgaW5mb3JtYXRpb25cbiAgICAgICAgZGlzcGxheS5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgICAgIC8vIGNyZWF0ZSBlbGVtZW50cyBuZWVkZWQgdG8gYnVpbGQgYSBkZXRhaWxzIHBvcHVwXG4gICAgICAgIC8vIG1haW4gZGlzcGxheSBvZiBwb3B1cFxuICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fY29udGVudCcpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aXRsZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbmFtZS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX190aXRsZScpO1xuICAgICAgICBuYW1lLnRleHRDb250ZW50ID0gdG9kb3NbaV0ubmFtZTtcblxuICAgICAgICAvLyBjcmVhdGUgcHJvamVjdCBlbGVtZW50XG4gICAgICAgIC8vIGVsZW1lbnQgbWFkZSB1cCBvZiAyIHNwYW5zLiB0aXRsZSBhbmQgY29udGVudFxuICAgICAgICBjb25zdCBwcm9qZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHByb2plY3QuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fcHJvamVjdCcpO1xuICAgICAgICBjb25zdCBwcm9qZWN0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHByb2plY3RUaXRsZS50ZXh0Q29udGVudCA9ICdQcm9qZWN0Oic7XG4gICAgICAgIHByb2plY3RUaXRsZS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19jYXRhZ29yeScpO1xuICAgICAgICBjb25zdCBwcm9qZWN0Q29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgcHJvamVjdENvbnRlbnQudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5wcm9qZWN0O1xuICAgICAgICBwcm9qZWN0LmFwcGVuZENoaWxkKHByb2plY3RUaXRsZSk7XG4gICAgICAgIHByb2plY3QuYXBwZW5kQ2hpbGQocHJvamVjdENvbnRlbnQpO1xuXG5cbiAgICAgICAgLy8gY3JlYXRlIHByaW9yaXR5IGVsZW1lbnRcbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcHJpb3JpdHkuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fcHJpb3JpdHknKTtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgcHJpb3JpdHlUaXRsZS50ZXh0Q29udGVudCA9IFwiUHJpb3JpdHk6XCI7XG4gICAgICAgIHByaW9yaXR5VGl0bGUuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fY2F0YWdvcnknKTtcbiAgICAgICAgY29uc3QgcHJpb3JpdHlDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBwcmlvcml0eUNvbnRlbnQudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5wcmlvcml0eVswXS50b1VwcGVyQ2FzZSgpICsgdG9kb3NbaV0ucHJpb3JpdHkuc2xpY2UoMSk7XG4gICAgICAgIHByaW9yaXR5LmFwcGVuZENoaWxkKHByaW9yaXR5VGl0bGUpO1xuICAgICAgICBwcmlvcml0eS5hcHBlbmRDaGlsZChwcmlvcml0eUNvbnRlbnQpO1xuXG4gICAgICAgICBcblxuICAgICAgICAvLyBjcmVhdGUgZGF0ZSBlbGVtZW50XG4gICAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGF0ZS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19kdWUnKTtcbiAgICAgICAgY29uc3QgZGF0ZVRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBkYXRlVGl0bGUudGV4dENvbnRlbnQgPSAnRHVlIERhdGU6JztcbiAgICAgICAgZGF0ZVRpdGxlLmNsYXNzTGlzdC5hZGQoJ2RldGFpbHMtcG9wdXBfX2NhdGFnb3J5Jyk7XG4gICAgICAgIGNvbnN0IGRhdGVDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAvLyBkaXNwbGF5IGh1bWFuIHJlYWRhYmxlIGRhdGVcbiAgICAgICAgY29uc3QgZGF5ID0gZm9ybWF0KG5ldyBEYXRlKHRvZG9zW2ldLmRhdGUpLCAnZG8nKTtcbiAgICAgICAgY29uc3QgbW9udGggPSBmb3JtYXQobmV3IERhdGUodG9kb3NbaV0uZGF0ZSksICdNTU1NJyk7XG4gICAgICAgIGNvbnN0IHllYXIgPSBmb3JtYXQobmV3IERhdGUodG9kb3NbaV0uZGF0ZSksICd5eXl5Jyk7XG4gICAgICAgIGNvbnN0IGZvcm1hdGVkRGF0ZSA9IGAke21vbnRofSAke2RheX0sICR7eWVhcn1gO1xuICAgICAgICBkYXRlQ29udGVudC50ZXh0Q29udGVudCA9IGZvcm1hdGVkRGF0ZTtcbiAgICAgICAgZGF0ZS5hcHBlbmRDaGlsZChkYXRlVGl0bGUpO1xuICAgICAgICBkYXRlLmFwcGVuZENoaWxkKGRhdGVDb250ZW50KTtcbiAgICAgICAgXG5cbiAgICAgICAgLy8gY3JlYXRlIGRldGFpbHMgZWxlbWVudFxuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRldGFpbHMuY2xhc3NMaXN0LmFkZCgnZGV0YWlscy1wb3B1cF9fZGV0YWlscycpO1xuICAgICAgICBjb25zdCBkZXRhaWxzVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGRldGFpbHNUaXRsZS5jbGFzc0xpc3QuYWRkKCdkZXRhaWxzLXBvcHVwX19kZXRhaWxzLXRpdGxlJyk7XG4gICAgICAgIGRldGFpbHNUaXRsZS50ZXh0Q29udGVudCA9IFwiRGV0YWlsczpcIjtcbiAgICAgICAgY29uc3QgZGV0YWlsc0NvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGRldGFpbHNDb250ZW50LnRleHRDb250ZW50ID0gdG9kb3NbaV0uZGV0YWlscztcbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZChkZXRhaWxzVGl0bGUpO1xuICAgICAgICBkZXRhaWxzLmFwcGVuZENoaWxkKGRldGFpbHNDb250ZW50KTtcblxuICAgICAgICBib2R5LmFwcGVuZENoaWxkKG5hbWUpO1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKHByb2plY3QpO1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKHByaW9yaXR5KTtcbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChkYXRlKTtcbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChkZXRhaWxzKTtcblxuICAgICAgICBkaXNwbGF5LmFwcGVuZENoaWxkKGJvZHkpO1xuXG4gICAgICAgIC8vIHNob3cgcG9wdXBcbiAgICAgICAgcG9wdXAuY2xhc3NMaXN0LnRvZ2dsZShcImRldGFpbHMtcG9wdXAtb3BlblwiKTtcbiAgICAgICAgb3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKFwib3ZlcmxheS1kZXRhaWxzLWludmlzaWJsZVwiKTtcblxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRWRpdChlLCB0b2Rvcykge1xuXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlLnRhcmdldDtcbiAgICAgICAgbGV0IGk9IGVsZW1lbnQucGFyZW50RWxlbWVudC5kYXRhc2V0LmluZGV4O1xuICAgICAgICBsZXQgcHJvamVjdD0gZWxlbWVudC5wYXJlbnRFbGVtZW50LmRhdGFzZXQucHJvamVjdDtcblxuICAgICAgICBjb25zdCBvdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm92ZXJsYXktZWRpdCcpO1xuICAgICAgICBjb25zdCBkaXNwbGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVkaXQtcG9wdXBfX2VudHJ5Jyk7XG4gICAgICAgIGNvbnN0IHBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVkaXQtcG9wdXAnKTtcblxuICAgICAgICAvLyBjbGVhciBvdXQgdGhlIHBvcHVwIGVkaXQgaW5mb3JtYXRpb25cbiAgICAgICAgZGlzcGxheS5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgICAgIC8vIHJldHJlaXZlIG5hbWUgb2YgdG9kbyBhbmQgZGlzcGxheSBpdCBpbiBhIHRleHQgYXJlYVxuICAgICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgIHRpdGxlLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX2lucHV0Jyk7XG4gICAgICAgIHRpdGxlLnNldEF0dHJpYnV0ZSgnbWF4bGVuZ3RoJywgJzQwJyk7XG4gICAgICAgIHRpdGxlLnJlcXVpcmVkID0gdHJ1ZTtcblxuXG4gICAgICAgIHRpdGxlLnRleHRDb250ZW50ID0gdG9kb3NbaV0ubmFtZTtcblxuICAgICAgICAvLyBhdHRhdGNoIGluZGV4IHRvIHRpdGxlIGVsZW1lbnQgc28gaSBjYW4gZ3JhYiBpdCB3aGVuIGNvbmZpcm1pbmcgZWRpdFxuICAgICAgICAvLyBhbmQgY2hhbmdlIHRoZSBhcnJheSBkYXRhIGZvciB0aGF0IHRvLWRvIGl0ZW1cbiAgICAgICAgdGl0bGUuZGF0YXNldC5pbmRleCA9IGk7XG4gICAgICAgIC8vIGF0dGFjaCBwcm9qZWN0IG5hbWUgdG8gdGl0bGUgZWxlbWVudCBzbyBpIGNhbiBncmFiIGl0IHdoZW4gY29uZmlybWluZyBlZGl0c1xuICAgICAgICB0aXRsZS5kYXRhc2V0LnByb2plY3QgPSBwcm9qZWN0O1xuXG4gICAgICAgIC8vIHJldHJlaXZlIGRldGFpbHMgb2YgdG9kbyBhbmQgZGlzcGxheSBpdCBpbiBhIHRleHQgYXJlYVxuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbiAgICAgICAgZGV0YWlscy5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX19pbnB1dCcsICdlZGl0LXBvcHVwX19pbnB1dC1iaWcnKTtcbiAgICAgICAgZGV0YWlscy5zZXRBdHRyaWJ1dGUoXCJwbGFjZWhvbGRlclwiLCBcIkRldGFpbHM6XCIpXG4gICAgICAgIGRldGFpbHMudGV4dENvbnRlbnQgPSB0b2Rvc1tpXS5kZXRhaWxzO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgZWxlbWVudHMgdGhhdCBtYWtlIHVwIHRoZSBkYXRlIHNlY3Rpb25cbiAgICAgICAgY29uc3QgZGF0ZUNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkYXRlQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX2RhdGUnKTtcblxuICAgICAgICBjb25zdCBkYXRlQ29udGFpbmVyVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lclRpdGxlLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX2RhdGUtdGl0bGUnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lclRpdGxlLnRleHRDb250ZW50ID0gJ0R1ZSBEYXRlOic7XG5cbiAgICAgICAgY29uc3QgZGF0ZUNvbnRhaW5lcklucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lcklucHV0LmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX2RhdGUtaW5wdXQnKTtcbiAgICAgICAgZGF0ZUNvbnRhaW5lcklucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdkYXRlJyk7XG4gICAgICAgIGRhdGVDb250YWluZXJJbnB1dC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgIGRhdGVDb250YWluZXJJbnB1dC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdG9kb3NbaV0uZGF0ZSk7XG5cbiAgICAgICAgZGF0ZUNvbnRhaW5lci5hcHBlbmRDaGlsZChkYXRlQ29udGFpbmVyVGl0bGUpO1xuICAgICAgICBkYXRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGRhdGVDb250YWluZXJJbnB1dCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBwcmlvcml0eSBidXR0b25zIHNlY3Rpb25cbiAgICAgICAgY29uc3QgZm9vdGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGZvb3Rlci5jbGFzc0xpc3QuYWRkKCdlZGl0LXBvcHVwX193cmFwcGVyLXByaW9yaXR5LXN1Ym1pdCcpO1xuXG4gICAgICAgIGNvbnN0IHByaW9yaXR5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX3ByaW9yaXR5Jyk7XG5cbiAgICAgICAgY29uc3QgcHJpb3JpdHlUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBwcmlvcml0eVRpdGxlLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LXRpdGxlJyk7XG4gICAgICAgIHByaW9yaXR5VGl0bGUudGV4dENvbnRlbnQgPSAnUHJpb3JpdHk6JztcbiAgICAgICAgLy8gbG93IHByaW9yaXR5IGlucHV0XG4gICAgICAgIGNvbnN0IHByaW9yaXR5TG93SW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBwcmlvcml0eUxvd0lucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdyYWRpbycpO1xuICAgICAgICBwcmlvcml0eUxvd0lucHV0LnNldEF0dHJpYnV0ZSgnaWQnLCAnbG93Jyk7XG4gICAgICAgIHByaW9yaXR5TG93SW5wdXQuc2V0QXR0cmlidXRlKCduYW1lJywgJ2VkaXQtcHJpb3JpdHknKTtcbiAgICAgICAgcHJpb3JpdHlMb3dJbnB1dC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJ2xvdycpO1xuICAgICAgICBpZiAodG9kb3NbaV0ucHJpb3JpdHkgPT09ICdsb3cnKSB7XG4gICAgICAgICAgICBwcmlvcml0eUxvd0lucHV0LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHByaW9yaXR5TG93SW5wdXQucmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAvLyBsb3cgcHJpb3JpdHkgbGFiZWxcbiAgICAgICAgY29uc3QgcHJpb3JpdHlMb3dMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgICAgIHByaW9yaXR5TG93TGFiZWwuc2V0QXR0cmlidXRlKFwiZm9yXCIsIFwibG93XCIpO1xuICAgICAgICBwcmlvcml0eUxvd0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bicsICdlZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLWxvdycpO1xuICAgICAgICBpZiAodG9kb3NbaV0ucHJpb3JpdHkgPT09ICdsb3cnKSB7XG4gICAgICAgICAgICBwcmlvcml0eUxvd0xhYmVsLmNsYXNzTGlzdC5hZGQoJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbG93LWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHByaW9yaXR5TG93TGFiZWwudGV4dENvbnRlbnQgPSBcIkxvd1wiO1xuICAgICAgICAvLyBtZWRpdW0gcHJpb3JpdHkgaW5wdXRcbiAgICAgICAgY29uc3QgcHJpb3JpdHlNZWRpdW1JbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIHByaW9yaXR5TWVkaXVtSW5wdXQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3JhZGlvJyk7XG4gICAgICAgIHByaW9yaXR5TWVkaXVtSW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdtZWRpdW0nKTtcbiAgICAgICAgcHJpb3JpdHlNZWRpdW1JbnB1dC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnZWRpdC1wcmlvcml0eScpO1xuICAgICAgICBwcmlvcml0eU1lZGl1bUlucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnbWVkaXVtJyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ21lZGl1bScpIHtcbiAgICAgICAgICAgIHByaW9yaXR5TWVkaXVtSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlNZWRpdW1JbnB1dC5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgIC8vIE1lZGl1bSBwcmlvcml0eSBsYWJlbFxuICAgICAgICBjb25zdCBwcmlvcml0eU1lZGl1bUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgcHJpb3JpdHlNZWRpdW1MYWJlbC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgXCJtZWRpdW1cIik7XG4gICAgICAgIHByaW9yaXR5TWVkaXVtTGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuJywgJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0tbWVkaXVtJyk7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5wcmlvcml0eSA9PT0gJ21lZGl1bScpIHtcbiAgICAgICAgICAgIHByaW9yaXR5TWVkaXVtTGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1tZWRpdW0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlNZWRpdW1MYWJlbC50ZXh0Q29udGVudCA9IFwiTWVkaXVtXCI7XG4gICAgICAgIC8vIGhpZ2ggcHJpb3JpdHkgaW5wdXRcbiAgICAgICAgY29uc3QgcHJpb3JpdHlIaWdoSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBwcmlvcml0eUhpZ2hJbnB1dC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFkaW8nKTtcbiAgICAgICAgcHJpb3JpdHlIaWdoSW5wdXQuc2V0QXR0cmlidXRlKCdpZCcsICdoaWdoJyk7XG4gICAgICAgIHByaW9yaXR5SGlnaElucHV0LnNldEF0dHJpYnV0ZSgnbmFtZScsICdlZGl0LXByaW9yaXR5Jyk7XG4gICAgICAgIHByaW9yaXR5SGlnaElucHV0LnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnaGlnaCcpO1xuICAgICAgICBpZiAodG9kb3NbaV0ucHJpb3JpdHkgPT09ICdoaWdoJykge1xuICAgICAgICAgICAgcHJpb3JpdHlIaWdoSW5wdXQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcHJpb3JpdHlIaWdoSW5wdXQucmVxdWlyZWQgPSB0cnVlO1xuICAgICAgICAvLyBoaWdoIHByaW9yaXR5IGxhYmVsXG4gICAgICAgIGNvbnN0IHByaW9yaXR5SGlnaExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICAgICAgcHJpb3JpdHlIaWdoTGFiZWwuc2V0QXR0cmlidXRlKFwiZm9yXCIsIFwiaGlnaFwiKTtcbiAgICAgICAgcHJpb3JpdHlIaWdoTGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuJywgJ2VkaXQtcG9wdXBfX3ByaW9yaXR5LWJ0bi0taGlnaCcpO1xuICAgICAgICBpZiAodG9kb3NbaV0ucHJpb3JpdHkgPT09ICdoaWdoJykge1xuICAgICAgICAgICAgcHJpb3JpdHlIaWdoTGFiZWwuY2xhc3NMaXN0LmFkZCgnZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS1oaWdoLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHByaW9yaXR5SGlnaExhYmVsLnRleHRDb250ZW50ID0gXCJIaWdoXCI7XG5cbiAgICAgICAgXG5cbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuYXBwZW5kQ2hpbGQocHJpb3JpdHlUaXRsZSk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmFwcGVuZENoaWxkKHByaW9yaXR5TG93SW5wdXQpO1xuICAgICAgICBwcmlvcml0eUNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmlvcml0eUxvd0xhYmVsKTtcbiAgICAgICAgcHJpb3JpdHlDb250YWluZXIuYXBwZW5kQ2hpbGQocHJpb3JpdHlNZWRpdW1JbnB1dCk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmFwcGVuZENoaWxkKHByaW9yaXR5TWVkaXVtTGFiZWwpO1xuICAgICAgICBwcmlvcml0eUNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmlvcml0eUhpZ2hJbnB1dCk7XG4gICAgICAgIHByaW9yaXR5Q29udGFpbmVyLmFwcGVuZENoaWxkKHByaW9yaXR5SGlnaExhYmVsKTtcblxuICAgICAgICAvLyBzdWJtaXQgYnV0dG9uIChpcyBpbiBzYW1lIGZvb3RlciBhcyB0aGUgcGlvcml0eSBidXR0b25zIGNvbnRhaW5lcilcbiAgICAgICAgY29uc3Qgc3VibWl0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBzdWJtaXQuc2V0QXR0cmlidXRlKCd0eXBlJywgXCJzdWJtaXRcIik7XG4gICAgICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3RvZG8tZWRpdC1zdWJtaXQnKVxuICAgICAgICBzdWJtaXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsICdDb25maXJtIEVkaXQnKVxuICAgICAgICBzdWJtaXQuY2xhc3NMaXN0LmFkZChcImVkaXQtcG9wdXBfX3RvZG8tc3VibWl0XCIpO1xuXG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChwcmlvcml0eUNvbnRhaW5lcik7XG4gICAgICAgIGZvb3Rlci5hcHBlbmRDaGlsZChzdWJtaXQpO1xuXG4gICAgICAgIC8vIGFwcGVuZCBjcmVhdGVkIGVsZW1lbnRzIHRvIHRoZSBET01cbiAgICAgICAgZGlzcGxheS5hcHBlbmRDaGlsZCh0aXRsZSk7XG4gICAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQoZGV0YWlscyk7XG4gICAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQoZGF0ZUNvbnRhaW5lcik7XG4gICAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQoZm9vdGVyKTtcblxuICAgICAgICAvL2xpc3RlbmVyIHRoYXQgY2hhbmdlcyB0aGUgaGlnaGxpZ2h0ZWQgcHJpb3JpdHkgYnV0dG9uXG4gICAgICAgIGNvbnN0IHByaW9yaXR5QnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4nKTtcbiAgICAgICAgcHJpb3JpdHlCdG5zLmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT57XG4gICAgICAgICAgICAgICAgZWRpdFByaW9yaXR5KGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG5cblxuICAgICAgICAvLyBzaG93IHBvcHVwXG4gICAgICAgIHBvcHVwLmNsYXNzTGlzdC50b2dnbGUoXCJlZGl0LXBvcHVwLW9wZW5cIik7XG4gICAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnRvZ2dsZShcIm92ZXJsYXktZWRpdC1pbnZpc2libGVcIik7XG5cbiAgICB9XG5cbiAgICAvLyBhcHBsaWVzIG1vZGlmaWVkIHN0eWxpbmcgdG8gZWFjaCBlbGVtZW50IG9mIGEgY2hlY2tlZCBvZmYgdG8tZG8gaXRlbSBcbiAgICBmdW5jdGlvbiB0b2dnbGVDaGVja0JveChlLCB0b0RvT2JqZWN0LCBkaXNwbGF5KSB7XG5cbiAgICAgICAgLy8gZ3JhYnMgYWxsIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIGNsaWNrZWQgY2hlY2tib3hcbiAgICAgICAgY29uc3QgdG9EbyA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG5cbiAgICAgICAgY29uc29sZS5sb2codG9Eby5jbGFzc0xpc3QpXG5cbiAgICAgICAgdG9Eby5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvLWNoZWNrZWQnKTtcblxuICAgICAgICBjb25zdCB0b0RvSXRlbXMgPSB0b0RvLmNoaWxkcmVuO1xuICAgICAgICBcbiAgICAgICAgLy8gLy8gdG9kbyBjaGVja2JveFxuICAgICAgICB0b0RvSXRlbXNbMF0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fY29tcGxldGUtY2hlY2tlZCcpO1xuICAgICAgICAvLyAvLyB0b2RvIHRpdGxlXG4gICAgICAgIC8vIHRvRG9JdGVtc1sxXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX190aXRsZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZGV0YWlscyBidXR0b25cbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzJdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX2RldGFpbC1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZGF0ZVxuICAgICAgICAvLyB0b0RvSXRlbXNbM10uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fZGF0ZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZWRpdCBpY29uXG4gICAgICAgIC8vIHRvRG9JdGVtc1s0XS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19pY29uLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkZWxldGUgaWNvblxuICAgICAgICAvLyB0b0RvSXRlbXNbNV0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19faWNvbi1jaGVja2VkJyk7XG5cbiAgICAgICAgLy8gdG9nZ2xlIGNoZWNrZWQgc3RhdHVzIG9uIHRvZG8gaXRlbSBkYXRhXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSB0b0RvLmRhdGFzZXQucHJvamVjdDtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0b0RvLmRhdGFzZXQuaW5kZXg7XG5cbiAgICAgICAgdG9Eb09iamVjdFtwcm9qZWN0XVtpbmRleF0uY2hlY2tlZCA9ICF0b0RvT2JqZWN0W3Byb2plY3RdW2luZGV4XS5jaGVja2VkO1xuICAgICAgICBjb25zb2xlLmxvZyh0b0RvT2JqZWN0W3Byb2plY3RdKTtcbiAgICBcbiAgICAgICAgLy8gc2F2ZSB0b2RvcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9kb3NcIiwgSlNPTi5zdHJpbmdpZnkodG9Eb09iamVjdCkpO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBwcm9qZWN0IGNvdW50XG4gICAgICAgIHJlbmRlclByb2plY3ROYW1lcyh0b0RvT2JqZWN0LCBkaXNwbGF5KVxuICAgICAgICBcbiAgICB9XG5cbiAgICAvLyBhcHBsaWVzIGNoZWNrZWQgc3RhdHVzIHRvIGNoZWNrZWQgaXRlbXMgb24gcmVsb2FkXG4gICAgZnVuY3Rpb24gYXBwbHlDaGVja2VkT25SZWxvYWQodG9Eb0l0ZW0pIHtcblxuICAgICAgICB0b0RvSXRlbS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvLWNoZWNrZWQnKTtcbiAgICAgICAgY29uc3QgdG9Eb0l0ZW1zID0gdG9Eb0l0ZW0uY2hpbGRyZW47XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gLy8gdG9kbyBjaGVja2JveFxuICAgICAgICB0b0RvSXRlbXNbMF0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fY29tcGxldGUtY2hlY2tlZCcpO1xuICAgICAgICAvLyAvLyB0b2RvIHRpdGxlXG4gICAgICAgIC8vIHRvRG9JdGVtc1sxXS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX190aXRsZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZGV0YWlscyBidXR0b25cbiAgICAgICAgLy8gdG9Eb0l0ZW1zWzJdLmNsYXNzTGlzdC50b2dnbGUoJ3RvZG9fX2RldGFpbC1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZGF0ZVxuICAgICAgICAvLyB0b0RvSXRlbXNbM10uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19fZGF0ZS1jaGVja2VkJyk7XG4gICAgICAgIC8vIC8vIHRvZG8gZWRpdCBpY29uXG4gICAgICAgIC8vIHRvRG9JdGVtc1s0XS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RvX19pY29uLWNoZWNrZWQnKTtcbiAgICAgICAgLy8gLy8gdG9kbyBkZWxldGUgaWNvblxuICAgICAgICAvLyB0b0RvSXRlbXNbNV0uY2xhc3NMaXN0LnRvZ2dsZSgndG9kb19faWNvbi1jaGVja2VkJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQWN0aXZlUHJpb3JpdHkoKSB7XG4gICAgICAgIC8vIHJlbW92ZXMgYWN0aXZlIHN0YXR1cyBmcm9tIGFsbCBidXR0b25zXG4gICAgICAgIGNvbnN0IGJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY3JlYXRlLW5ld19fcHJpb3JpdHktYnRuJyk7XG4gICAgICAgIGJ0bnMuZm9yRWFjaChidG4gPT4ge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoYGNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bi0tJHtidG4udGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKX0tYWN0aXZlYClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyB0b2dnbGUgYWN0aXZlIHZpc3VhbCBzdHlsaW5nIHRvIHByaW9yaXR5IGJ1dHRvbnMgaW4gY3JlYXRlIG5ldyB0by1kbyBtZW51XG4gICAgZnVuY3Rpb24gYWN0aXZlUHJpb3JpdHkoZSkge1xuICAgICAgICAvLyByZW1vdmVzIGFjdGl2ZSBzdGF0dXMgZnJvbSBhbGwgYnV0dG9uc1xuICAgICAgICByZW1vdmVBY3RpdmVQcmlvcml0eSgpO1xuICAgICAgICAvLyBhcHBseSBhY3RpdmUgc3RhdHVzIHRvIHRoZSBzZWxlY3RlZCBidXR0b25cbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSBlLnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKGBjcmVhdGUtbmV3X19wcmlvcml0eS1idG4tLSR7cHJpb3JpdHl9LWFjdGl2ZWApO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBwcmlvcml0eSBidXR0b24gc3l0bGluZyBpbiBlZGl0IG1lbnVcbiAgICAvLyBpIGNvdWxkIG1ha2UgdGhpcyBpbnRvIGEgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIGEgY2xhc3MgbmFtZSwgYW5kIHVzZSB0aGF0IFxuICAgIC8vIGZ1bmN0aW9uIGZvciB0aGlzIGFuZCB0aGUgcHJldmlvdXMgZnVuY3Rpb24uXG4gICAgZnVuY3Rpb24gZWRpdFByaW9yaXR5KGUpIHtcbiAgICAgICAgLy8gcmVtb3ZlcyBhY3RpdmUgc3RhdHVzIGZyb20gYWxsIGJ1dHRvbnNcbiAgICAgICAgY29uc3QgYnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lZGl0LXBvcHVwX19wcmlvcml0eS1idG4nKTtcbiAgICAgICAgYnRucy5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShgZWRpdC1wb3B1cF9fcHJpb3JpdHktYnRuLS0ke2J0bi50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpfS1hY3RpdmVgKVxuICAgICAgICB9KVxuICAgICAgICAvLyBhcHBseSBhY3RpdmUgc3RhdHVzIHRvIHRoZSBzZWxlY3RlZCBidXR0b25cbiAgICAgICAgY29uc3QgcHJpb3JpdHkgPSBlLnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKGBlZGl0LXBvcHVwX19wcmlvcml0eS1idG4tLSR7cHJpb3JpdHl9LWFjdGl2ZWApO1xuICAgIH1cblxuICAgIC8vIGZ1bmN0aW9uIHRvIGhhbmRsZSBjbGlja3Mgb24gdGhlIG5hdmlnYXRpb25cbiAgICBmdW5jdGlvbiBjaGFuZ2VGb2xkZXIoZSwgdG9kb3MsIGRpc3BsYXkpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIHNldHMgdGhlIGN1cnJlbnQgZm9sZGVyIHZhcmlhYmxlIHRvIG5hdiBpdGVtIHRoYXQgd2FzIGNsaWNrZWRcbiAgICAgICAgLy8gYmVjYXVzZSBpIHNldCBldmVyeXRoaW5nIHRvIGJlIGxvd2VyY2FzZSBpbiBteSBjb2RlLCBpdCB3b3VkbCBjcmFzaCB3aGVuIGkgdXNlZCB1cHBlcmNhc2VcbiAgICAgICAgLy8gbGV0dGVycyBpbiBteSBjdXN0b20gcHJvamVjdHMuIHRoaXMgYWxsb3dzIHVwcGVyY2FzZSBwcm9qZWN0IG5hbWVzXG4gICAgICAgIFxuICAgICAgICBpZiAoWydIb21lJywgJ1dlZWsnLCAnVG9kYXknXS5pbmNsdWRlcyhlLnRhcmdldC50ZXh0Q29udGVudCkpIHtcbiAgICAgICAgICAgIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdChlLnRhcmdldC50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdChlLnRhcmdldC50ZXh0Q29udGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyhcInlvdSBhcmUgaW4gZm9sZGVyXCIsIHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpKTtcblxuICAgIFxuXG5cblxuICAgICAgICBcbiAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICBpZiAodG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkgPT09ICdob21lJykge1xuICAgICAgICAgICAgcmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgdXBkYXRlQWN0aXZlTmF2TWFpbihlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVuZGVyVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgdXBkYXRlQWN0aXZlTmF2TWFpbihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGNoYW5naW5nIHRvIGEgbmV3IGVtcHR5IGN1c3RvbSBwcm9qZWN0LCBkaXNwbGF5IHBsYWNlaG9sZGVyIHNjcmVlblxuICAgICAgICBpZiAoIVsnaG9tZScsICd3ZWVrJywgJ3RvZGF5J10uaW5jbHVkZXModG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCkpKSB7XG4gICAgICAgICAgICBpZiAodG9kb3NbdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCldLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICByZW5kZXJFbXB0eVByb2plY3RQbGFjZWhvbGRlcih0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICAvLyBmdW5jdGlvbiB0byBoYW5kbGUgY2xpY2tzIG9uIHRoZSB3aWRlciBuYXZpZ2F0aW9uIGFyZWEuIFxuICAgIC8vIEkgY291bGQnbnQgZ2V0IGl0IHRvIHdvcmsgb3RoZXJ3aXNlLlxuICAgIGZ1bmN0aW9uIGNoYW5nZUZvbGRlcjIoZSwgdG9kb3MsIGRpc3BsYXkpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3NlY29uZCcpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldC5jaGlsZE5vZGVzWzBdLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT0gJ2xpJyB8fCBlLnRhcmdldC50YWdOYW1lID09ICdMSScpIHtcbiAgICAgICAgICAgIC8vIHNldHMgdGhlIGN1cnJlbnQgZm9sZGVyIHZhcmlhYmxlIHRvIG5hdiBpdGVtIHRoYXQgd2FzIGNsaWNrZWRcbiAgICAgICAgICAgIC8vIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdChlLnRhcmdldC5jaGlsZE5vZGVzWzBdLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJ5b3UgYXJlIGluIGZvbGRlclwiLCB0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlLnRhcmdldC5jaGlsZE5vZGVzWzBdLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICAvLyBzZXRzIHRoZSBjdXJyZW50IGZvbGRlciB2YXJpYWJsZSB0byBuYXYgaXRlbSB0aGF0IHdhcyBjbGlja2VkXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgKFsnSG9tZScsICdXZWVrJywgJ1RvZGF5J10uaW5jbHVkZXMoZS50YXJnZXQuY2hpbGROb2Rlc1swXS50ZXh0Q29udGVudCkpIHtcbiAgICAgICAgICAgICAgICB0b0Rvc01hbmFnZXIuY2hhbmdlQ3VycmVudFByb2plY3QoZS50YXJnZXQuY2hpbGROb2Rlc1swXS50ZXh0Q29udGVudC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdG9Eb3NNYW5hZ2VyLmNoYW5nZUN1cnJlbnRQcm9qZWN0KGUudGFyZ2V0LmNoaWxkTm9kZXNbMF0udGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInlvdSBhcmUgaW4gZm9sZGVyXCIsIHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpKTtcblxuXG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciB0aGUgcmVsZXZlbnQgdG8tZG8gaXRlbXNcbiAgICAgICAgICAgIGlmICh0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZUFjdGl2ZU5hdk1haW4oZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbmRlclRvRG9zKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgICAgICB1cGRhdGVBY3RpdmVOYXZNYWluKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBjaGFuZ2luZyB0byBhIG5ldyBlbXB0eSBjdXN0b20gcHJvamVjdCwgZGlzcGxheSBwbGFjZWhvbGRlciBzY3JlZW5cbiAgICAgICAgICAgIGlmICghWydob21lJywgJ3dlZWsnLCAndG9kYXknXS5pbmNsdWRlcyh0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSkpIHtcbiAgICAgICAgICAgICAgICBpZiAodG9kb3NbdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCldLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyRW1wdHlQcm9qZWN0UGxhY2Vob2xkZXIodG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIHJlbmRlciB0aGUgcHJvamVjdCBuYW1lcyB0byB0aGUgc2lkZSBiYXJcbiAgICBmdW5jdGlvbiByZW5kZXJQcm9qZWN0TmFtZXModG9kb3MsIGRpc3BsYXkpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0cycpO1xuICAgICAgICAvLyBjbGVhciBsaXN0IGJlZm9yZSBhcHBlbmRpbmcgYWxsIGl0ZW1zXG4gICAgICAgIHByb2plY3RDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIlxuICAgICAgICBcbiAgICAgICAgLy8gZ2V0IGFuIG9iamVjdCBvZiBvbmx5IHRoZSBjdXN0b20gcHJvamVjdHNcbiAgICAgICAgY29uc3QgcHJvamVjdHNPYmplY3QgPSBPYmplY3QuYXNzaWduKHt9LCB0b2Rvcyk7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC5ob21lO1xuICAgICAgICBkZWxldGUgcHJvamVjdHNPYmplY3QudG9kYXk7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC53ZWVrO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY3VzdG9tIHByb2plY3RzXCIsIHByb2plY3RzT2JqZWN0KTtcblxuICAgICAgICAvLyBkaXNwbGF5IHByb2plY3QgbmFtZXMgYW5kIGNvdW50cyB0byB0aGUgc2lkZWJhclxuICAgICAgICBmb3IgKGNvbnN0IHByb2plY3QgaW4gcHJvamVjdHNPYmplY3QpIHtcblxuICAgICAgICAgICAgLy8gY29udGFpbmVyIGFyb3VuZCBwcm9qZWN0IG5hbWUgYW5kIGNvdW50XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0TmFtZUNvdW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuY2xhc3NMaXN0LmFkZCgncHJvamVjdHNfX2l0ZW0nKTtcbiAgICAgICAgICAgIC8vIHByb2plY3ROYW1lQ291bnQuY2xhc3NMaXN0LmFkZCgncHJvamVjdHNfX2l0ZW0tLWN1c3RvbScpO1xuICAgICAgICAgICAgcHJvamVjdE5hbWVDb3VudC5jbGFzc0xpc3QuYWRkKCduYXZfX2l0ZW0tLWxpbmsnKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuY2xhc3NMaXN0LmFkZCgnY3VzdG9tLXByb2plY3QtY291bnQtY29udGFpbmVyJyk7XG4gICAgICAgICAgICBwcm9qZWN0TmFtZUNvdW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IGRvbU1hbmlwdWxhdG9yLmNoYW5nZUZvbGRlcjIoZSwgdG9kb3MsIGRpc3BsYXkpKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gdXBkYXRlQWN0aXZlTmF2TWFpbihlKSk7XG5cblxuICAgICAgICAgICAgLy8gcHJvamVjdCBuYW1lXG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lLmNsYXNzTGlzdC5hZGQoJ3RvZG8tZm9sZGVyJyk7XG4gICAgICAgICAgICBwcm9qZWN0TmFtZS5jbGFzc0xpc3QuYWRkKCdwcm9qZWN0LW5hbWUnKTtcbiAgICAgICAgICAgIHByb2plY3ROYW1lLnRleHRDb250ZW50ID0gcHJvamVjdDtcbiAgICAgICAgICAgIC8vIGV2ZW50IGxpc3RuZXIgdG8gY2hhbmdlIHdvcmtpbmcgZm9sZGVyIC8gcGFnZSBkaXNwbGF5XG4gICAgICAgICAgICBwcm9qZWN0TmFtZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiBkb21NYW5pcHVsYXRvci5jaGFuZ2VGb2xkZXIoZSwgdG9kb3MsIGRpc3BsYXkpKTtcblxuICAgICAgICAgICAgLy8gcHJvamVjdCBjb3VudFxuICAgICAgICAgICAgY29uc3QgcHJvamVjdENvdW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBwcm9qZWN0Q291bnQuY2xhc3NMaXN0LmFkZCgncHJvamVjdC1jb3VudCcpO1xuXG4gICAgICAgICAgICAvLyBjb3VudCBob3cgbWFueSBub24gY2hlY2tlZCBpdGVtcyB0aGVyZSBhcmUgaW4gdGhlIHByb2plY3RcbiAgICAgICAgICAgIC8vIGFuZCBhc3NpZ24gdGhpcyB2YWx1ZSB0byB0aGUgY291bnQgdmFsdWVcbiAgICAgICAgICAgIGxldCBuID0gMDtcbiAgICAgICAgICAgIHByb2plY3RzT2JqZWN0W3Byb2plY3RdLmZvckVhY2godG9kbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIXRvZG8uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBuKytcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByb2plY3RDb3VudC50ZXh0Q29udGVudCA9IG47XG5cbiAgICAgICAgICAgIHByb2plY3ROYW1lQ291bnQuYXBwZW5kQ2hpbGQocHJvamVjdE5hbWUpO1xuICAgICAgICAgICAgLy8gb25seSBzaG93IGNvdW50IGlmIGdyZWF0ZXIgdGhhbiAwXG4gICAgICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0TmFtZUNvdW50LmFwcGVuZENoaWxkKHByb2plY3RDb3VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByb2plY3RDb250YWluZXIuYXBwZW5kQ2hpbGQocHJvamVjdE5hbWVDb3VudCk7XG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gdGhpcyByZS1hcHBseXMgbmF2IGxpbmsgc2VsZWN0ZWQgc3RhdHVzIHRvIHNlbGVjdGVkIGN1c3RvbSBwcm9qZWN0LFxuICAgICAgICAgICAgLy8gc2luY2UgdGhlIGVudGlyZSBjdXN0b20gcHJvamVjdCBuYW1lcyBkaXYgaXMgcmUtcmVuZGVyZWQgZWFjaCB0aW1lLiBcbiAgICAgICAgICAgIGlmKHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpID09IHByb2plY3QpIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0TmFtZUNvdW50LmNsYXNzTGlzdC5hZGQoJ25hdl9fc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgICAgICAvLyB1cGRhdGUgaG9tZSAvIHRvZGF5IC8gd2VlayBmb2xkZXJzLiBvbmx5IGNvdW50IG5vbiBjaGVja2VkIGl0ZW1zXG4gICAgICAgIGNvbnN0IGhvbWVDb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ob21lLWNvdW50Jyk7XG4gICAgICAgIC8vIHN1bXMgbnVtYmVyIG9mIG5vbiBjaGVja2VkIGl0ZW0gaW4gcHJvamVjdCBhcnJheSBhbmQgZGlzcGxheXMgY291bnQgdGV4dCBhcyB0aGlzIHN1bVxuICAgICAgICAvLyB0aGlzIHdpbGwgb25seSBjb3VudCB0aGUgaXRlbXMgdGhhdCBhcmUgc3BlY2lmaWNhbGx5IHNhdmVkIHRvIGhvbWUgZm9sZGVyLFxuICAgICAgICAvLyBpIHdhbnQgdG8gY291bnQgYWxsIHRvZG9zLlxuXG4gICAgICAgIC8vIGhvbWVDb3VudC50ZXh0Q29udGVudCA9IHRvZG9zLmhvbWUucmVkdWNlKCh0b3RhbCwgdmFsdWUpID0+IHtcbiAgICAgICAgLy8gICAgIHJldHVybiB0b3RhbCArICF2YWx1ZS5jaGVja2VkO1xuICAgICAgICAvLyB9LCAwKTtcblxuICAgICAgICBsZXQgaG9tZUNvdW50TnVtYmVyID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB0b2RvTGlzdCBpbiB0b2Rvcykge1xuICAgICAgICAgICAgdG9kb3NbdG9kb0xpc3RdLmZvckVhY2godG9kbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0b2RvLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaG9tZUNvdW50TnVtYmVyKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBob21lQ291bnQudGV4dENvbnRlbnQgPSBob21lQ291bnROdW1iZXI7XG4gICAgICAgIC8vIHJlLXNldCBjb3VudCBkaXNwbGF5XG4gICAgICAgIGhvbWVDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcbiAgICAgICAgaWYgKGhvbWVDb3VudC50ZXh0Q29udGVudCA8IDEpIHtcbiAgICAgICAgICAgIC8vIGhpZGUgY291bnQgZGlzcGxheSBpZiAwXG4gICAgICAgICAgICBob21lQ291bnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdlZWtDb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53ZWVrLWNvdW50Jyk7XG4gICAgICAgIC8vIHN1bXMgbnVtYmVyIG9mIG5vbiBjaGVja2VkIGl0ZW0gaW4gcHJvamVjdCBhcnJheSBhbmQgZGlzcGxheXMgY291bnQgdGV4dCBhcyB0aGlzIHN1bVxuICAgICAgICB3ZWVrQ291bnQudGV4dENvbnRlbnQgPSB0b2Rvcy53ZWVrLnJlZHVjZSgodG90YWwsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdG90YWwgKyAhdmFsdWUuY2hlY2tlZDtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIC8vIHJlLXNldCBjb3VudCBkaXNwbGF5XG4gICAgICAgIHdlZWtDb3VudC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1mbGV4JztcbiAgICAgICAgaWYgKHdlZWtDb3VudC50ZXh0Q29udGVudCA8IDEpIHtcbiAgICAgICAgICAgIC8vIGhpZGUgY291bnQgZGlzcGxheSBpZiAwXG4gICAgICAgICAgICB3ZWVrQ291bnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc3QgdG9kYXlDb3VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b2RheS1jb3VudCcpO1xuICAgICAgICAvLyBzdW1zIG51bWJlciBvZiBub24gY2hlY2tlZCBpdGVtIGluIHByb2plY3QgYXJyYXkgYW5kIGRpc3BsYXlzIGNvdW50IHRleHQgYXMgdGhpcyBzdW1cbiAgICAgICAgdG9kYXlDb3VudC50ZXh0Q29udGVudCA9IHRvZG9zLnRvZGF5LnJlZHVjZSgodG90YWwsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdG90YWwgKyAhdmFsdWUuY2hlY2tlZDtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIC8vIHJlLXNldCBjb3VudCBkaXNwbGF5XG4gICAgICAgIHRvZGF5Q291bnQuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtZmxleCc7XG4gICAgICAgIGlmICh0b2RheUNvdW50LnRleHRDb250ZW50IDwgMSkge1xuICAgICAgICAgICAgLy8gaGlkZSBjb3VudCBkaXNwbGF5IGlmIDBcbiAgICAgICAgICAgIHRvZGF5Q291bnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG5cbiAgICAvLyBkaXNwbGF5IHRoZSBhbW91bnQgb2YgdG9kbyBpdGVtcyBuZXh0IHRvIHRoZSBwcm9qZWN0IHRpdGxlXG4gICAgZnVuY3Rpb24gcmVuZGVyUHJvamVjdENvdW50KHRvZG9zLCBkaXNwbGF5KSB7XG4gXG4gICAgfVxuXG4gICAgLy8gc2Nyb2xsIHBvamVjdCBuYW1lcyB0byB0b3BcbiAgICBmdW5jdGlvbiBwcm9qZWN0TmFtZXNTY3JvbGxUb3AoKSB7XG4gICAgICAgIGNvbnN0IHByb2plY3RzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2plY3RzJyk7XG4gICAgICAgIHByb2plY3RzRGl2LnNjcm9sbFRvcCA9IDA7XG4gICAgfVxuXG4gICAgLy8gc2Nyb2xsIHByb2plY3QgbmFtZXMgdG8gYm90dG9tXG4gICAgZnVuY3Rpb24gcHJvamVjdE5hbWVzU2Nyb2xsQm90dG9tKCkge1xuICAgICAgICBjb25zdCBwcm9qZWN0c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9qZWN0cycpO1xuICAgICAgICBwcm9qZWN0c0Rpdi5zY3JvbGxUb3AgPSBwcm9qZWN0c0Rpdi5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyRW1wdHlQcm9qZWN0UGxhY2Vob2xkZXIodG9kb3MsIGRpc3BsYXkpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKS5pbm5lckhUTUwgPSBcbiAgICAgICAgYDxkaXYgY2xhc3M9XCJhZGQtb3ItcmVtb3ZlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLW9yLXJlbW92ZV9faGVhZGluZ1wiPkVtcHR5IFByb2plY3QhPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLW9yLXJlbW92ZV9fY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtb3ItcmVtb3ZlX19jb250ZW50LXRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgQ3JlYXRlIGEgbmV3IHRvLWRvIGl0ZW0gb3IgZGVsZXRlIHByb2plY3QuXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZC1vci1yZW1vdmVfX2NvbnRlbnQtYnRuXCI+XG4gICAgICAgICAgICAgICAgICAgIERlbGV0ZSBQcm9qZWN0XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+YFxuXG4gICAgICAgIFxuICAgICAgICAvLyByZW1vdmUgcHJvamVjdCBidXR0b25cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFkZC1vci1yZW1vdmVfX2NvbnRlbnQtYnRuJykuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZGVsZXRlIHByb2plY3QgZnJvbSB0b2RvcyBkYXRhXG4gICAgICAgICAgICBkZWxldGUgdG9kb3NbdG9Eb3NNYW5hZ2VyLmdldEN1cnJlbnRQcm9qZWN0KCldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbicpLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAvLyBzYXZlIHRvZG9zIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9kb3NcIiwgSlNPTi5zdHJpbmdpZnkodG9kb3MpKTtcbiAgICAgICAgICAgIHJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICAvLyBjaGFuZ2UgZm9sZGVyIHRvIGhvbWVcbiAgICAgICAgICAgIHRvRG9zTWFuYWdlci5jaGFuZ2VDdXJyZW50UHJvamVjdCgnaG9tZScpO1xuICAgICAgICAgICAgcmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgLy8gdXBkYXRlIG5hdmUgbGluayB0byBzaG93IGhvbWUgYWN0aXZlXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2JykuY2hpbGRyZW4uaXRlbSgwKS5jbGFzc0xpc3QuYWRkKCduYXZfX3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2JykuY2hpbGRyZW4uaXRlbSgwKSk7XG5cbiAgICAgICAgICAgIFxuXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gdHVybiBvZmYgc2VsZWN0ZWQgc3R5bGluZyBmb3IgYWxsIG5hdiBpdGVtcyBhbmQgYXBwbHkgdG8gdGhlIHNlbGVjdGVkIGl0ZW1cbiAgICBmdW5jdGlvbiB1cGRhdGVBY3RpdmVOYXZNYWluKGUpIHtcbiAgICAgICAgY29uc3QgbmF2SXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcubmF2X19pdGVtLS1saW5rJyk7XG4gICAgICAgIG5hdkl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJuYXZfX3NlbGVjdGVkXCIpO1xuICAgICAgICB9KVxuICAgICAgIFxuICAgICAgICBpZiAoZS50YXJnZXQudGV4dENvbnRlbnQgPT09ICdOb3RlcycpIHtcbiAgICAgICAgICAgIGUudGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ25hdl9fc2VsZWN0ZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC50YWdOYW1lID09IFwic3BhblwiIHx8IGUudGFyZ2V0LnRhZ05hbWUgPT0gXCJTUEFOXCIpIHtcbiAgICAgICAgICAgICAgICBlLnRhcmdldC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25hdl9fc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQudGFnTmFtZSA9PSBcImxpXCIgfHwgZS50YXJnZXQudGFnTmFtZSA9PSBcIkxJXCIpIHtcbiAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCduYXZfX3NlbGVjdGVkJyk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZS50YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICB9XG5cbiAgICAvLyBhZnRlciBmb3JtIGNsb3NlcywgcmVzZXQgdGhlIGFjdGl2ZSBsaW5rIHRvIHRoZSBuZXcgdG9kbyBtZW51XG4gICAgZnVuY3Rpb24gcmVzZXRBY3RpdmVGb3JtTGluaygpIHtcbiAgICAgICAgY29uc3QgY3JlYXRlTmV3T3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zJyk7XG4gICAgICAgIGNyZWF0ZU5ld09wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICAgICAgb3B0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2NyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMtYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjcmVhdGVOZXdPcHRpb25zWzBdLmNsYXNzTGlzdC5hZGQoJ2NyZWF0ZS1uZXdfX29wdGlvbnMtaXRlbXMtYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hhbmdlQWN0aXZlRm9ybUxpbmsoKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZU5ld09wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcycpO1xuICAgICAgICBjcmVhdGVOZXdPcHRpb25zLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgICAgICAgIG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5ld09wdGlvbnMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb24uY2xhc3NMaXN0LnJlbW92ZSgnY3JlYXRlLW5ld19fb3B0aW9ucy1pdGVtcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKCdjcmVhdGUtbmV3X19vcHRpb25zLWl0ZW1zLWFjdGl2ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVuZGVyVG9Eb3MsXG4gICAgICAgIHJlbmRlckFsbFRvRG9zLFxuICAgICAgICB0b2dnbGVDaGVja0JveCxcbiAgICAgICAgYXBwbHlDaGVja2VkT25SZWxvYWQsXG4gICAgICAgIGFjdGl2ZVByaW9yaXR5LFxuICAgICAgICByZW1vdmVBY3RpdmVQcmlvcml0eSxcbiAgICAgICAgZWRpdFByaW9yaXR5LFxuICAgICAgICByZW5kZXJEZXRhaWxzLFxuICAgICAgICByZW5kZXJFZGl0LFxuICAgICAgICBjaGFuZ2VGb2xkZXIsXG4gICAgICAgIGNoYW5nZUZvbGRlcjIsXG4gICAgICAgIHJlbmRlclByb2plY3ROYW1lcyxcbiAgICAgICAgcmVuZGVyUHJvamVjdENvdW50LFxuICAgICAgICBwcm9qZWN0TmFtZXNTY3JvbGxUb3AsXG4gICAgICAgIHByb2plY3ROYW1lc1Njcm9sbEJvdHRvbSxcbiAgICAgICAgcmVuZGVyRW1wdHlQcm9qZWN0UGxhY2Vob2xkZXIsXG4gICAgICAgIHVwZGF0ZUFjdGl2ZU5hdk1haW4sXG4gICAgICAgIHJlc2V0QWN0aXZlRm9ybUxpbmssXG4gICAgICAgIGNoYW5nZUFjdGl2ZUZvcm1MaW5rXG4gICAgfTtcbn0pKCk7XG5cbi8vIFRvIERvIGRhdGEgbWFuYWdlciBcbmV4cG9ydCBjb25zdCB0b0Rvc01hbmFnZXIgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8ga2VlcCB0cmFjayBvZiB3aGF0IHBhZ2UgdGhlIHVzZXIgaXMgb24sIHNvIHRoYXQgYWRkZWQgaXRlbXMgZ29cbiAgICAvLyB0byB0aGUgY29ycmVjdCBwcm9qZWN0LiBkZWZhdWx0cyB0byBob21lIHBhZ2Ugb24gbG9hZFxuXG4gICAgbGV0IGN1cnJlbnRQcm9qZWN0ID0gXCJob21lXCI7XG5cbiAgICAvLyBjaGFuZ2UgY3VycmVudFByb2plY3RcbiAgICBmdW5jdGlvbiBjaGFuZ2VDdXJyZW50UHJvamVjdChuZXdQcm9qZWN0KSB7XG4gICAgICAgIGN1cnJlbnRQcm9qZWN0ID0gbmV3UHJvamVjdDtcbiAgICB9XG5cbiAgICAvLyBnZXQgY3VycmVudFByb2plY3RcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50UHJvamVjdCgpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQcm9qZWN0O1xuICAgIH1cblxuICAgXG5cblxuICAgIC8vIFRvLWRvIGZhY3RvcnkgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBjcmVhdGVUb0RvKG5hbWUsIHByaW9yaXR5LCBkYXRlLCBkZXRhaWxzLCBwcm9qZWN0LCBjaGVja2VkPWZhbHNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgcHJpb3JpdHksXG4gICAgICAgICAgICBkYXRlLFxuICAgICAgICAgICAgZGV0YWlscyxcbiAgICAgICAgICAgIHByb2plY3QsXG4gICAgICAgICAgICBjaGVja2VkXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXRyaWV2ZXMgdGhlIGRhdGEgZW50ZXJlZCB0byB0aGUgbmV3IHRvLWRvIGZvcm0gYW5kIGNyZWF0ZXMgYSBuZXcgdG8tZG9cbiAgICAvLyBhbmQgdGhlbiBkaXNwbGF5cyBpdCB0byB0aGUgZG9tXG4gICAgZnVuY3Rpb24gYWRkTmV3VG9EbyhlLCB0b0RvTGlzdCwgZGlzcGxheSwgb3ZlcmxheSwgZm9ybSkge1xuXG4gICAgICAgIC8vIHN0b3AgcGFnZSBmcm9tIHJlZnJlc2hpbmcgYWZ0ZXIgZWFjaCBzdWJtaXRcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgXG4gICAgICAgIGNvbnN0IHRvRG9UaXRsZSA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXRvZG8tdGl0bGUnKSkudmFsdWU7XG4gICAgICAgIGNvbnN0IHRvRG9EZXRhaWxzID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby1kZXRhaWxzJykpLnZhbHVlO1xuICAgICAgICBjb25zdCB0b0RvRGF0ZSA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXRvZG8tZGF0ZScpKS52YWx1ZTtcbiAgICAgICAgY29uc3QgdG9Eb1ByaW9yaXR5ID0gKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY3JlYXRlLW5ldy1wcmlvcml0eVwiXTpjaGVja2VkJykpLnZhbHVlO1xuICAgICAgICAvLyBnZXQgdGhlIGN1cnJlbnQgcHJvamVjdCBzbyBjYW4gc3RvcmUgbmV3IHRvLWRvIGl0ZW0gaW4gdGhlIGNvcnJlY3Qgc3ViIGFycmF5LlxuICAgICAgICBjb25zdCB0b0RvUHJvamVjdCA9IGdldEN1cnJlbnRQcm9qZWN0KCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBuZXdUb0RvID0gY3JlYXRlVG9Ebyh0b0RvVGl0bGUsIHRvRG9Qcmlvcml0eSwgdG9Eb0RhdGUsIHRvRG9EZXRhaWxzLCB0b0RvUHJvamVjdCk7XG4gICAgICAgIHRvRG9MaXN0W3RvRG9Qcm9qZWN0XS5wdXNoKG5ld1RvRG8pO1xuXG5cbiAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICBpZiAoZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b0RvTGlzdCwgZGlzcGxheSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gY2xvc2VzIHRoZSBmb3JtIGFuZCByZW1vdmVzIHRoZSBvdmVybGF5IGFmdGVyIHN1Ym1pc3Npb25cbiAgICAgICAgb3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKCdvdmVybGF5LW5ldy1pbnZpc2libGUnKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdjcmVhdGUtbmV3LW9wZW4nKTtcblxuICAgICAgICAvLyBJIHdhbnQgdGhlIGZvcm0gdG8gZmFkZSBvdXQgYmVmb3JlIHRoZSBpbnB1dHMgYXJlIHJlc2V0XG4gICAgICAgIGNvbnN0IHNsZWVwID0gKG1pbGxpc2Vjb25kcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtaWxsaXNlY29uZHMpKVxuICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHNsZWVwKDMwMCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBjbGVhciBpbnB1dHMgYWZ0ZXIgc3VibWlzc2lvbiBcbiAgICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIHJlbW92ZXMgYWN0aXZlIHN0YXR1cyBmcm9tIGFsbCBidXR0b25zXG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW1vdmVBY3RpdmVQcmlvcml0eSgpO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vIHVwZGF0ZSBwcm9qZWN0IG5hbWUgY291bnRlciBcbiAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyUHJvamVjdE5hbWVzKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICB9XG5cbiAgICAvLyBlZGl0IHNlbGVjdGVkIHRvZG8gZGF0YVxuICAgIGZ1bmN0aW9uIGVkaXRUb0RvKGUsIHRvRG9MaXN0LCBkaXNwbGF5LCBvdmVybGF5LCBmb3JtKSB7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyByZXRyaWV2ZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRvLWRvIGl0ZW0gaW4gdGhlIGRhdGEgYXJyYXlcbiAgICAgICAgY29uc3QgaSA9IGUudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmRhdGFzZXQuaW5kZXg7XG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBwcm9qZWN0IHRoZSB0by1kbyB3YXMgYXNzaWduZWQgdG9cbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBlLnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZC5kYXRhc2V0LnByb2plY3Q7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0by1kbyBpdGVtIGRhdGFcbiAgICAgICAgdG9Eb0xpc3RbcHJvamVjdF1baV0ubmFtZSA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9faW5wdXQnKSkudmFsdWU7XG4gICAgICAgIHRvRG9MaXN0W3Byb2plY3RdW2ldLmRldGFpbHMgPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVkaXQtcG9wdXBfX2lucHV0LWJpZycpKS52YWx1ZTtcbiAgICAgICAgdG9Eb0xpc3RbcHJvamVjdF1baV0uZGF0ZSA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9fZGF0ZS1pbnB1dCcpKS52YWx1ZTtcbiAgICAgICAgdG9Eb0xpc3RbcHJvamVjdF1baV0ucHJpb3JpdHkgPSAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW25hbWU9XCJlZGl0LXByaW9yaXR5XCJdOmNoZWNrZWQnKSkudmFsdWU7XG5cbiAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICBpZiAoZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b0RvTGlzdCwgZGlzcGxheSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0b0RvTGlzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJUb0Rvcyh0b0RvTGlzdCwgZGlzcGxheSk7XG4gICAgICAgIH1cblxuICAgICAgICBvdmVybGF5LmNsYXNzTGlzdC50b2dnbGUoJ292ZXJsYXktZWRpdC1pbnZpc2libGUnKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdlZGl0LXBvcHVwLW9wZW4nKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9faW5wdXQnKS52YWx1ZSk7XG4gICAgICAgIFxuICAgIH1cblxuICAgIC8vIHJlbW92ZXMgc2VsZWN0ZWQgdG8tZG8gaXRlbSBmcm9tIHRoZSBhcnJheSBhbmQgcmUgcmVuZGVycyB0aGUgZGlzcGxheVxuICAgIGZ1bmN0aW9uIGRlbGV0ZVRvRG8oZSwgdG9Eb0xpc3QsIGRpc3BsYXkpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGUudGFyZ2V0O1xuICAgICAgICBsZXQgaT0gZWxlbWVudC5wYXJlbnRFbGVtZW50LmRhdGFzZXQuaW5kZXg7XG4gICAgICAgIGxldCBwcm9qZWN0PSBlbGVtZW50LnBhcmVudEVsZW1lbnQuZGF0YXNldC5wcm9qZWN0O1xuICAgICAgICBcbiAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgIC8vIG9ubHkgcmVuZGVyIHRoZSByZWxldmVudCB0by1kbyBpdGVtc1xuICAgICAgICBpZiAoZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICAvLyBpZiBpbiBob21lXG4gICAgICAgICAgICB0b0RvTGlzdFtwcm9qZWN0XS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b0RvTGlzdCwgZGlzcGxheSk7XG4gICAgICAgICAgICAvLyBsb2dzIHRoZSBlbnRpcmUgdG8tZG8gb2JqZWN0XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b0RvTGlzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0b0RvTGlzdFt0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKV0pO1xuICAgICAgICAgICAgLy8gbG9ncyBqdXN0IHRoZSBwcm9qZWN0IGFycmF5XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvRG9MaXN0W3RvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclRvRG9zKHRvRG9MaXN0LCBkaXNwbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdkZWwnLCB0b0RvTGlzdClcbiAgICAgICAgLy9jaGVjayBpZiBhIHByb2plY3QgaXMgbm93IGVtcHR5LCBhbmQgZGVsZXRlIHRoZSBwcm9qZWN0IGlmIHRydWVcbiAgICAgICAgY2hlY2tFbXB0eVByb2plY3QodG9Eb0xpc3QsIGRpc3BsYXkpO1xuICAgICAgICAvLyBzYXZlIHRvZG9zIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2Rvc1wiLCBKU09OLnN0cmluZ2lmeSh0b0RvTGlzdCkpO1xuICAgICAgICAvLyB1cGRhdGUgcHJvamVjdCBuYW1lIGNvdW50ZXIgXG4gICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclByb2plY3ROYW1lcyh0b0RvTGlzdCwgZGlzcGxheSk7XG5cbiAgICB9XG5cbiAgICAvLyBhZGQgbmV3IHByb2plY3QgdG8tZG9zIG9iamVjdFxuICAgIGZ1bmN0aW9uIGFkZE5ld1Byb2plY3QoZSwgdG9kb3MsIG92ZXJsYXksIGZvcm0sIGRpc3BsYXkpIHtcbiAgICAgICAgY29uc3QgbmV3UHJvamVjdCA9IChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3JlYXRlLW5ld19fcHJvamVjdC1pbnB1dCcpKS52YWx1ZTtcbiAgICAgICAgLy8gaWYgdGV4dCB3YXMgZW50ZXJlZCBpbiB0aGUgaW5wdXQgYW5kIHByb2plY3QgZG9lc250IGFscmVhZHkgZXhpc3RcbiAgICAgICAgaWYgKG5ld1Byb2plY3QgJiYgIShuZXdQcm9qZWN0LnRvTG93ZXJDYXNlKCkgaW4gdG9kb3MpKSB7XG4gICAgICAgICAgICB0b2Rvc1tuZXdQcm9qZWN0XSA9IFtdO1xuXG4gICAgICAgICAgICAvLyByZW5kZXIgcHJvamVjdCBuYW1lcyBpbiBzaWRlYmFyXG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJQcm9qZWN0TmFtZXModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBzZXRzIHRoZSBjdXJyZW50IGZvbGRlciB2YXJpYWJsZSB0byBuYXYgaXRlbSB0aGF0IHdhcyBjbGlja2VkXG4gICAgICAgICAgICB0b0Rvc01hbmFnZXIuY2hhbmdlQ3VycmVudFByb2plY3QobmV3UHJvamVjdCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInlvdSBhcmUgaW4gZm9sZGVyXCIsIHRvRG9zTWFuYWdlci5nZXRDdXJyZW50UHJvamVjdCgpKTtcblxuICAgICAgICAgICAgLy8gcmVuZGVyIGFsbCB0by1kb3MgZnJvbSBhbGwgcHJvamVjdHMgaWYgb24gdGhlIGhvbWUgcGFnZS4gb3RoZXJ3aXNlXG4gICAgICAgICAgICAvLyBvbmx5IHJlbmRlciB0aGUgcmVsZXZlbnQgdG8tZG8gaXRlbXNcbiAgICAgICAgICAgIGlmICh0b0Rvc01hbmFnZXIuZ2V0Q3VycmVudFByb2plY3QoKSA9PT0gJ2hvbWUnKSB7XG4gICAgICAgICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNldHMgbmF2IGFjdGl2ZSBzdGF0dXMgdG8gbmV3bHkgY3JlYXRlZCBwcm9qZWN0XG4gICAgICAgICAgICBjb25zdCBuYXZJdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXZfX2l0ZW0tLWxpbmsnKTtcbiAgICAgICAgICAgIG5hdkl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKFwibmF2X19zZWxlY3RlZFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvamVjdHMnKS5sYXN0Q2hpbGQuY2xhc3NMaXN0LmFkZCgnbmF2X19zZWxlY3RlZCcpO1xuXG4gICAgICAgICAgICAvLyBzY3JvbGxzIHRvIGJvdHRvbSBvZiBjdXN0b20gcHJvamVjdHMgZGl2XG4gICAgICAgICAgICBkb21NYW5pcHVsYXRvci5wcm9qZWN0TmFtZXNTY3JvbGxCb3R0b20oKTtcblxuICAgICAgICAgIC8vIGlmIHRoZSBjcmVhdGVkIHByb2plY3QgYWxyZWFkeSBleGlzdHMsIGNoYW5nZSBmb2xkZXIgdG8gdGhhdCBwcm9qZWN0ICBcbiAgICAgICAgfSBlbHNlIGlmIChuZXdQcm9qZWN0ICYmIChuZXdQcm9qZWN0LnRvTG93ZXJDYXNlKCkgaW4gdG9kb3MpKSB7XG5cbiAgICAgICAgICAgIC8vIHJlbmRlciBhbGwgdG8tZG9zIGZyb20gYWxsIHByb2plY3RzIGlmIG9uIHRoZSBob21lIHBhZ2UuIG90aGVyd2lzZVxuICAgICAgICAgICAgLy8gb25seSByZW5kZXIgdGhlIHJlbGV2ZW50IHRvLWRvIGl0ZW1zXG4gICAgICAgICAgICBpZiAobmV3UHJvamVjdC50b0xvd2VyQ2FzZSgpID09PSAnaG9tZScpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtuZXdQcm9qZWN0fSBhbHJlYWR5IGV4aXN0cy4gY2hhbmdpbmcgZm9sZGVyIHRvICR7bmV3UHJvamVjdH1gKTtcbiAgICAgICAgICAgICAgICBjaGFuZ2VDdXJyZW50UHJvamVjdChuZXdQcm9qZWN0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlckFsbFRvRG9zKHRvZG9zLCBkaXNwbGF5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bmV3UHJvamVjdH0gYWxyZWFkeSBleGlzdHMuIGNoYW5naW5nIGZvbGRlciB0byAke25ld1Byb2plY3R9YCk7XG4gICAgICAgICAgICAgICAgY2hhbmdlQ3VycmVudFByb2plY3QobmV3UHJvamVjdC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsb3NlcyB0aGUgZm9ybSBhbmQgcmVtb3ZlcyB0aGUgb3ZlcmxheSBhZnRlciBzdWJtaXNzaW9uXG4gICAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnRvZ2dsZSgnb3ZlcmxheS1uZXctaW52aXNpYmxlJyk7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnRvZ2dsZSgnY3JlYXRlLW5ldy1vcGVuJyk7XG5cblxuICAgICAgICAvLyBJIHdhbnQgdGhlIGZvcm0gdG8gZmFkZSBvdXQgYmVmb3JlIHRoZSBpbnB1dCBpcyByZXNldFxuICAgICAgICBjb25zdCBzbGVlcCA9IChtaWxsaXNlY29uZHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlzZWNvbmRzKSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc2xlZXAoMzAwKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIGNsZWFyIGlucHV0IGFmdGVyIGZvcm0gY2xvc2VzIFxuICAgICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgICAgLy8gcmVzZXQgYWRkIG5ldyBmb3JtIHRvIHNob3cgYWRkIHRvZG9cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctcHJvamVjdC1tZW51Jykuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctdG9kby1tZW51Jykuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vIHNob3cgYSBwbGFjZWhvbGRlciBzY3JlZW4gYWZ0ZXIgYSBuZXcgZW1wdHkgcHJvamVjdCBoYXMgYmVlbiBjcmVhdGVkXG4gICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlckVtcHR5UHJvamVjdFBsYWNlaG9sZGVyKHRvZG9zLCBkaXNwbGF5KTtcblxuICAgICAgICAvL3VwZGF0ZSBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9kb3NcIiwgSlNPTi5zdHJpbmdpZnkodG9kb3MpKTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrRW1wdHlQcm9qZWN0KHRvZG9zLCBkaXNwbGF5KSB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gZ2V0IGFuIG9iamVjdCBvZiBvbmx5IHRoZSBjdXN0b20gcHJvamVjdHNcbiAgICAgICAgY29uc3QgcHJvamVjdHNPYmplY3QgPSBPYmplY3QuYXNzaWduKHt9LCB0b2Rvcyk7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC5ob21lO1xuICAgICAgICBkZWxldGUgcHJvamVjdHNPYmplY3QudG9kYXk7XG4gICAgICAgIGRlbGV0ZSBwcm9qZWN0c09iamVjdC53ZWVrO1xuXG4gICAgICAgIC8vIG9ubHkgZGVsZXRlIGVtcHR5IGN1c3RvbSBwcm9qZWN0c1xuICAgICAgICBpZiAoIVsnaG9tZScsICd3ZWVrJywgJ3RvZGF5J10uaW5jbHVkZXMoZ2V0Q3VycmVudFByb2plY3QoKSkpIHtcbiAgICAgICAgICAgIC8vIGRlbGV0ZXMgb25seSB0aGUgY3VycmVudCBlbXB0eSBwcm9qZWN0XG4gICAgICAgICAgICBpZiAocHJvamVjdHNPYmplY3RbZ2V0Q3VycmVudFByb2plY3QoKV0ubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSB0b2Rvc1tnZXRDdXJyZW50UHJvamVjdCgpXTtcbiAgICAgICAgICAgICAgICBkb21NYW5pcHVsYXRvci5yZW5kZXJQcm9qZWN0TmFtZXModG9kb3MsIGRpc3BsYXkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNoYW5nZSBmb2xkZXIgdG8gaG9tZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNoYW5nZUN1cnJlbnRQcm9qZWN0KCdob21lJyk7XG4gICAgICAgICAgICAgICAgZG9tTWFuaXB1bGF0b3IucmVuZGVyQWxsVG9Eb3ModG9kb3MsIGRpc3BsYXkpO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIG5hdmUgbGluayB0byBzaG93IGhvbWUgYWN0aXZlXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdicpLmNoaWxkcmVuLml0ZW0oMCkuY2xhc3NMaXN0LmFkZCgnbmF2X19zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYXYnKS5jaGlsZHJlbi5pdGVtKDApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICAvLyBkZWxldGVzIGFsbCBlbXB0eSBwcm9qZWN0c1xuICAgICAgICAvLyBmb3IgKGNvbnN0IHByb2plY3QgaW4gcHJvamVjdHNPYmplY3QpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHByb2plY3QpO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2cocHJvamVjdHNPYmplY3RbcHJvamVjdF0pO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2cocHJvamVjdHNPYmplY3RbcHJvamVjdF0ubGVuZ3RoKTtcbiAgICAgICAgLy8gICAgIGlmIChwcm9qZWN0c09iamVjdFtwcm9qZWN0XS5sZW5ndGggPCAxKSB7XG4gICAgICAgIC8vICAgICAgICAgZGVsZXRlIHRvZG9zW3Byb2plY3RdO1xuICAgICAgICAvLyAgICAgICAgIGRvbU1hbmlwdWxhdG9yLnJlbmRlclByb2plY3ROYW1lcyh0b2RvcywgZGlzcGxheSk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlQ3VycmVudFByb2plY3QsXG4gICAgICAgIGdldEN1cnJlbnRQcm9qZWN0LFxuICAgICAgICBjcmVhdGVUb0RvLFxuICAgICAgICBhZGROZXdUb0RvLFxuICAgICAgICBlZGl0VG9EbyxcbiAgICAgICAgZGVsZXRlVG9EbyxcbiAgICAgICAgYWRkTmV3UHJvamVjdCxcbiAgICAgICAgY2hlY2tFbXB0eVByb2plY3RcbiAgICB9XG59KSgpO1xuXG4vLyBUbyBEbyBkYXRhIG1hbmFnZXIgXG5leHBvcnQgY29uc3Qgbm90ZXNNYW5hZ2VyID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjb2xjO1xuICAgIFxuXG4gICAgZnVuY3Rpb24gYXJyYW5nZU5vdGVzKG5vdGVzKSB7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haW4nKS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cImdyaWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtY29sIGdyaWQtY29sLS0xXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWNvbCBncmlkLWNvbC0tMlwiPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1jb2wgZ3JpZC1jb2wtLTNcIj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gXG4gICAgICAgIGNvbnN0IGdyaWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ3JpZCcpO1xuICAgICAgIFxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIGNvbGMgZ3JpZCBhbHJlYWR5IGJ1aWx0LCBkZWxldGUgaXQgc28gY2FuIG1ha2UgYSBuZXcgb25lLlxuICAgICAgICAvLyBpIHRyaWVkIHNvIG1hbnkgd2F5cyB0byB1cGRhdGUgdGhlIGdyaWQgYW5kIHRoaXMgaXMgd2hhdCB3b3Jrcy5cbiAgICAgICAgaWYgKHR5cGVvZiBjb2xjICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgY29sYy5kZXN0cm95KCk7XG4gICAgICAgICAgICBncmlkLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiZ3JpZC1jb2wgZ3JpZC1jb2wtLTFcIj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJncmlkLWNvbCBncmlkLWNvbC0tMlwiPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtY29sIGdyaWQtY29sLS0zXCI+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXRpdGlhbGlzZSBjb2xjYWRlIG1hc29ucnkgbGF5b3V0XG4gICAgICAgIGNvbGMgPSBuZXcgQ29sY2FkZSggJy5ncmlkJywge1xuICAgICAgICAgICAgY29sdW1uczogJy5ncmlkLWNvbCcsXG4gICAgICAgICAgICBpdGVtczogJy5ub3RlJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgXG5cbiAgICAgICAgLy8gY3JlYXRlIG5vdGUgZWxlbWVudHMgYW5kIGFwcGVuZCB0byBjb2xjXG4gICAgICAgIG5vdGVzLmZvckVhY2goKG5vdGUsIGkpID0+IHtcblxuICAgICAgICAgICAgY29uc3Qgbm90ZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG5vdGVCb2R5LmNsYXNzTGlzdC5hZGQoJ25vdGUnKTtcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZSBlbGVtZW50IHdpdGggcG9zaXRpb24gaW4gYXJyYXlcbiAgICAgICAgICAgIG5vdGVCb2R5LnNldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcsIGkpO1xuXG4gICAgICAgICAgICBjb25zdCBub3RlQ2xvc2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG5vdGVDbG9zZS5jbGFzc0xpc3QuYWRkKCdub3RlX19jbG9zZScpO1xuICAgICAgICAgICAgbm90ZUNsb3NlLmlubmVySFRNTCA9ICcmdGltZXM7JztcbiAgICAgICAgICAgIG5vdGVDbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4gZGVsZXRlTm90ZShlLCBub3RlcykpO1xuXG4gICAgICAgICAgICBjb25zdCBub3RlVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIG5vdGVUaXRsZS5jbGFzc0xpc3QuYWRkKCdub3RlX190aXRsZScpO1xuICAgICAgICAgICAgbm90ZVRpdGxlLnRleHRDb250ZW50ID0gbm90ZS50aXRsZTtcbiAgICAgICAgICAgIG5vdGVUaXRsZS5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRlZGl0YWJsZScsICd0cnVlJyk7XG4gICAgICAgICAgICBub3RlVGl0bGUuc2V0QXR0cmlidXRlKCdzcGVsbGNoZWNrJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAvLyBlZGl0IHRpdGxlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICBub3RlVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBlID0+IGVkaXROb3RlKGUsIG5vdGVzKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5vdGVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBub3RlVGV4dC5jbGFzc0xpc3QuYWRkKCdub3RlX190ZXh0Jyk7XG4gICAgICAgICAgICBub3RlVGV4dC50ZXh0Q29udGVudCA9IG5vdGUudGV4dDtcbiAgICAgICAgICAgIG5vdGVUZXh0LnNldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJywgJ3RydWUnKTtcbiAgICAgICAgICAgIG5vdGVUZXh0LnNldEF0dHJpYnV0ZSgnc3BlbGxjaGVjaycsICdmYWxzZScpO1xuICAgICAgICAgICAgLy8gZWRpdCB0aXRsZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgbm90ZVRleHQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBlID0+IGVkaXROb3RlKGUsIG5vdGVzKSk7XG5cbiAgICAgICAgICAgIG5vdGVCb2R5LmFwcGVuZENoaWxkKG5vdGVDbG9zZSk7XG4gICAgICAgICAgICBub3RlQm9keS5hcHBlbmRDaGlsZChub3RlVGl0bGUpO1xuICAgICAgICAgICAgbm90ZUJvZHkuYXBwZW5kQ2hpbGQobm90ZVRleHQpO1xuXG4gICAgICAgICAgICBjb2xjLmFwcGVuZChub3RlQm9keSk7XG4gICAgIFxuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTm90ZSh0aXRsZSwgdGV4dCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGROZXdOb3RlKGUsIG5vdGVzLCBvdmVybGF5LCBmb3JtLCBkaXNwbGF5KSB7XG5cbiAgICAgICAgY29uc3Qgbm90ZVRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1ub3RlLXRpdGxlJykudmFsdWU7XG4gICAgICAgIGNvbnN0IG5vdGVUZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1ub3RlLXRleHQnKS52YWx1ZTtcblxuICAgICAgICBjb25zdCBuZXdOb3RlID0gY3JlYXRlTm90ZShub3RlVGl0bGUsIG5vdGVUZXh0KTtcbiAgICAgICAgbm90ZXMudW5zaGlmdChuZXdOb3RlKTtcblxuICAgICAgICBhcnJhbmdlTm90ZXMobm90ZXMpO1xuICAgICAgICAvLyBzZXRzIG5hdiBhY3RpdmUgbGluayB0byAnbm90ZXMnIFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbm90ZXMtbmF2JykuY2xpY2soKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNsb3NlcyB0aGUgZm9ybSBhbmQgcmVtb3ZlcyB0aGUgb3ZlcmxheSBhZnRlciBzdWJtaXNzaW9uXG4gICAgICAgIG92ZXJsYXkuY2xhc3NMaXN0LnRvZ2dsZSgnb3ZlcmxheS1uZXctaW52aXNpYmxlJyk7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnRvZ2dsZSgnY3JlYXRlLW5ldy1vcGVuJyk7XG5cbiAgICAgICAgLy8gSSB3YW50IHRoZSBmb3JtIHRvIGZhZGUgb3V0IGJlZm9yZSB0aGUgaW5wdXRzIGFyZSByZXNldFxuICAgICAgICBjb25zdCBzbGVlcCA9IChtaWxsaXNlY29uZHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlzZWNvbmRzKSlcbiAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBzbGVlcCgzMDApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gY2xlYXIgaW5wdXRzIGFmdGVyIHN1Ym1pc3Npb24gXG4gICAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgICAvLyByZXNldCBhZGQgbmV3IGZvcm0gdG8gc2hvdyBhZGQgdG9kb1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1ub3RlLW1lbnUnKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy10b2RvLW1lbnUnKS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gc2F2ZSBub3RlcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm90ZXNcIiwgSlNPTi5zdHJpbmdpZnkobm90ZXMpKTtcbiAgICB9XG5cbiAgICAvLyBkZWxldGUgc2VsZWN0ZWQgbm90ZSBhbmQgcmVmcmVzaCB0aGUgbm90ZXNcbiAgICBmdW5jdGlvbiBkZWxldGVOb3RlKGUsIG5vdGVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG5vdGVzKTtcbiAgICAgICAgY29uc3QgaSA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuZGF0YXNldC5pbmRleDtcbiAgICAgICAgbm90ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICBhcnJhbmdlTm90ZXMobm90ZXMpO1xuXG4gICAgICAgIC8vIHNhdmUgbm90ZXMgdG8gbG9jYWwgc3RvcmFnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm5vdGVzXCIsIEpTT04uc3RyaW5naWZ5KG5vdGVzKSk7XG4gICAgfVxuXG4gICAgLy8gZWRpdCBub3RlXG4gICAgZnVuY3Rpb24gZWRpdE5vdGUoZSwgbm90ZXMpIHtcbiAgICAgICAgXG4gICAgICAgIC8vIHRvRWRpdCByZXR1cm5zIFwidGl0bGVcIiBvciBcIm5vdGVcIiBkZXBlbmRpbmcgb24gd2hhdCBpcyBjaGFuZ2VkXG4gICAgICAgIGNvbnN0IHRvRWRpdCA9IGUudGFyZ2V0LmNsYXNzTGlzdFswXS5zbGljZSg2KTtcbiAgICAgICAgY29uc3QgaSA9IGUudGFyZ2V0LnBhcmVudEVsZW1lbnQuZGF0YXNldC5pbmRleDtcbiAgICAgICAgY29uc3QgbmV3VGV4dCA9IGUudGFyZ2V0LnRleHRDb250ZW50O1xuXG4gICAgICAgIGlmICh0b0VkaXQgPT09IFwidGl0bGVcIikge1xuICAgICAgICAgICAgbm90ZXNbaV0udGl0bGUgPSBuZXdUZXh0OyAgXG4gICAgICAgIH0gZWxzZSBpZiAodG9FZGl0ID09PVwidGV4dFwiKSB7XG4gICAgICAgICAgICBub3Rlc1tpXS50ZXh0ID0gbmV3VGV4dDtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnZWRpdGluZyBub3RlJyk7XG5cbiAgICAgICAgLy8gc2F2ZSBub3RlcyB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibm90ZXNcIiwgSlNPTi5zdHJpbmdpZnkobm90ZXMpKTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcnJhbmdlTm90ZXMsXG4gICAgICAgIGNyZWF0ZU5vdGUsXG4gICAgICAgIGFkZE5ld05vdGUsXG4gICAgICAgIGRlbGV0ZU5vdGUsXG4gICAgICAgIGVkaXROb3RlXG4gICAgfVxufSkoKTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjXG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkgc2NyaXB0VXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmIgPSBkb2N1bWVudC5iYXNlVVJJIHx8IHNlbGYubG9jYXRpb24uaHJlZjtcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuLy8gbm8gb24gY2h1bmtzIGxvYWRlZFxuXG4vLyBubyBqc29ucCBmdW5jdGlvbiIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0ICcuL3N0eWxlLmNzcyc7XG5pbXBvcnQge3RvRG9zTWFuYWdlciwgZG9tTWFuaXB1bGF0b3IsIG5vdGVzTWFuYWdlcn0gZnJvbSBcIi4vbG9naWNNb2R1bGVcIlxuY29uc3QgdG9kb3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2RvcycpKSB8fCB7XG4gICAgXCJob21lXCI6IFtdLFxuICAgIFwidG9kYXlcIjogW10sXG4gICAgXCJ3ZWVrXCI6IFtdLFxufVxuY29uc3QgZGlzcGxheSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluJyk7XG5jb25zdCBvcGVuRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uZXctdG9kbycpO1xuY29uc3QgY2xvc2VGb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNyZWF0ZS1uZXdfX2Nsb3NlJyk7XG5jb25zdCBvdmVybGF5TmV3ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm92ZXJsYXktbmV3Jyk7XG5jb25zdCBhZGRUb0RvRm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jcmVhdGUtbmV3Jyk7XG5jb25zdCBkZXRhaWxzUG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZGV0YWlscy1wb3B1cCcpO1xuY29uc3QgZGV0YWlsc092ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcub3ZlcmxheS1kZXRhaWxzJyk7XG5jb25zdCBlZGl0UG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cCcpO1xuY29uc3QgZWRpdE92ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcub3ZlcmxheS1lZGl0Jyk7XG5jb25zdCBlZGl0Rm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LXBvcHVwJyk7XG5jb25zdCB0b0RvRm9sZGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2RvLWZvbGRlcicpO1xuY29uc3QgY3JlYXRlUHJvamVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jcmVhdGUtbmV3X19wcm9qZWN0LXN1Ym1pdCcpO1xuY29uc3QgY3JlYXRlTm90ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jcmVhdGUtbmV3X19ub3RlLXN1Ym1pdCcpO1xuY29uc3QgbmV3VG9Eb0xpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXRvZG8tbGluaycpOyBcbmNvbnN0IG5ld1Byb2plY3RMaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1wcm9qZWN0LWxpbmsnKTsgXG5jb25zdCBuZXdOb3RlTGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNuZXctbm90ZS1saW5rJyk7IFxuY29uc3QgbmV3VG9Eb01lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXRvZG8tbWVudScpO1xuY29uc3QgbmV3UHJvamVjdE1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LXByb2plY3QtbWVudScpO1xuY29uc3QgbmV3Tm90ZU1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbmV3LW5vdGUtbWVudScpO1xuXG4vLyBpbml0aWFsIGhvbWVzY3JlZW4gcmVuZGVyXG5kb21NYW5pcHVsYXRvci5yZW5kZXJBbGxUb0Rvcyh0b2RvcywgZGlzcGxheSk7XG5kb21NYW5pcHVsYXRvci5yZW5kZXJQcm9qZWN0TmFtZXModG9kb3MsIGRpc3BsYXkpO1xuXG4vLyBuYXZpZ2F0ZSB0byBob21lL3RvZGF5L3dlZWtcbnRvRG9Gb2xkZXJzLmZvckVhY2goZm9sZGVyID0+IHtcbiAgICBmb2xkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gZG9tTWFuaXB1bGF0b3IuY2hhbmdlRm9sZGVyKGUsIHRvZG9zLCBkaXNwbGF5KSk7XG59KVxuXG4vLyBhcnJheSBvZiB0by1kbyBub3RlcyBcbi8vIGdyYWIgYXJyYXkgZGF0YSBmcm9tIGxvY2FsIHN0b3JhZ2UgaWYgaXQgZXhpc3RzLCBvciBjcmVhdGUgbmV3IGV4YW1wbGUgYXJyYXlcbmNvbnN0IG5vdGVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbm90ZXMnKSkgfHwgW107XG5cbi8vIG5hdmlnYXRlIHRvIG5vdGVzIG1lbnVcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3Rlcy1uYXYnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG5vdGVzTWFuYWdlci5hcnJhbmdlTm90ZXMobm90ZXMpKTtcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3Rlcy1uYXYnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiBkb21NYW5pcHVsYXRvci51cGRhdGVBY3RpdmVOYXZNYWluKGUpKTtcblxuLy8gdG9nZ2xlcyBkaXNwbGF5IG9uIGZvciBvdmVybGF5IGFuZCBmb3JtIHdoZW4gdGhlIG9wZW4gZm9ybSBidXR0b24gaXMgY2xpY2tlZFxub3BlbkZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgb3ZlcmxheU5ldy5jbGFzc0xpc3QudG9nZ2xlKCdvdmVybGF5LW5ldy1pbnZpc2libGUnKTtcbiAgICBhZGRUb0RvRm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdjcmVhdGUtbmV3LW9wZW4nKTtcbiAgICBkb21NYW5pcHVsYXRvci5jaGFuZ2VBY3RpdmVGb3JtTGluaygpXG59KTtcblxuLy8gY29udHJvbCB3aGljaCBmb3JtIG1lbnUgaXMgb3BlbiBcbm5ld1RvRG9MaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT57XG4gICAgbmV3UHJvamVjdE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld05vdGVNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBuZXdUb0RvTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG59KTtcbm5ld1Byb2plY3RMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT57XG4gICAgbmV3VG9Eb01lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld05vdGVNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBuZXdQcm9qZWN0TWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG59KTtcbm5ld05vdGVMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT57XG4gICAgbmV3VG9Eb01lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld1Byb2plY3RNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBuZXdOb3RlTWVudS5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG59KTtcblxuLy8gY2xvc2VzIHRoZSBmb3JtIGFuZCB0b2dnbGVzIHRoZSBkaXNwbGF5IGJhY2sgXG5jbG9zZUZvcm0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgb3ZlcmxheU5ldy5jbGFzc0xpc3QudG9nZ2xlKCdvdmVybGF5LW5ldy1pbnZpc2libGUnKTtcbiAgICBhZGRUb0RvRm9ybS5jbGFzc0xpc3QudG9nZ2xlKCdjcmVhdGUtbmV3LW9wZW4nKTtcbiAgICBhZGRUb0RvRm9ybS5yZXNldCgpO1xuICAgIGRvbU1hbmlwdWxhdG9yLnJlc2V0QWN0aXZlRm9ybUxpbmsoKTtcbiAgICBkb21NYW5pcHVsYXRvci5yZW1vdmVBY3RpdmVQcmlvcml0eSgpO1xuICAgIG5ld1RvRG9NZW51LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjsgXG4gICAgbmV3UHJvamVjdE1lbnUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG5ld05vdGVNZW51LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn0pO1xuXG4vLyB3aGVuIHRoZSBzdWJtaXQgbmV3IHRvZG8gYnV0dG9uIGlzIHByZXNzZWQsIGdyYWIgZGF0YSBmcm9tIHRoZSBmb3JtIGFuZCBjcmVhdGUgYSBuZXcgdG9kb1xuYWRkVG9Eb0Zvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZSA9PiB7XG4gICAgdG9Eb3NNYW5hZ2VyLmFkZE5ld1RvRG8oZSwgdG9kb3MsIGRpc3BsYXksIG92ZXJsYXlOZXcsIGFkZFRvRG9Gb3JtKTtcbn0pO1xuXG4vLyB3aGVuIGEgbG93IC8gbWVkaXVtIC8gaGlnaCBwcmlvcml0eSBidXR0b24gaXMgY2xpY2tlZFxuY29uc3QgcHJpb3JpdHlCdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNyZWF0ZS1uZXdfX3ByaW9yaXR5LWJ0bicpO1xuICAgIHByaW9yaXR5QnRucy5mb3JFYWNoKGJ0biA9PiB7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PntcbiAgICAgICAgZG9tTWFuaXB1bGF0b3IuYWN0aXZlUHJpb3JpdHkoZSk7XG4gICAgfSk7XG59KVxuXG5cbi8vIGFkZCBuZXcgcG9qZWN0XG5jcmVhdGVQcm9qZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgdG9Eb3NNYW5hZ2VyLmFkZE5ld1Byb2plY3QoZSwgdG9kb3MsIG92ZXJsYXlOZXcsIGFkZFRvRG9Gb3JtLCBkaXNwbGF5KTtcbiAgICBkb21NYW5pcHVsYXRvci5yZXNldEFjdGl2ZUZvcm1MaW5rKCk7XG59KVxuXG4vLyBhZGQgbmV3IG5vdGVcbmNyZWF0ZU5vdGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICBub3Rlc01hbmFnZXIuYWRkTmV3Tm90ZShlLCBub3Rlcywgb3ZlcmxheU5ldywgYWRkVG9Eb0Zvcm0sIGRpc3BsYXkpO1xuICAgIGRvbU1hbmlwdWxhdG9yLnJlc2V0QWN0aXZlRm9ybUxpbmsoKTtcbn0pO1xuXG4vLyBidXR0b24gdGhhdCBjb25maXJtcyBlZGl0IG9uIGEgdG9kb1xuZWRpdEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZSA9PiB7XG4gICAgdG9Eb3NNYW5hZ2VyLmVkaXRUb0RvKGUsIHRvZG9zLCBkaXNwbGF5LCBlZGl0T3ZlcmxheSwgZWRpdEZvcm0pO1xufSlcblxuLy8gY2xvc2UgZGV0YWlscyBwb3B1cFxuY29uc3QgY2xvc2VEZXRhaWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRldGFpbHMtcG9wdXBfX2Nsb3NlJyk7XG5jbG9zZURldGFpbHMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgZGV0YWlsc1BvcHVwLmNsYXNzTGlzdC50b2dnbGUoXCJkZXRhaWxzLXBvcHVwLW9wZW5cIik7XG4gICAgZGV0YWlsc092ZXJsYXkuY2xhc3NMaXN0LnRvZ2dsZShcIm92ZXJsYXktZGV0YWlscy1pbnZpc2libGVcIik7XG59KVxuXG4vLyBjbG9zZSBlZGl0IHBvcHVwXG5jb25zdCBjbG9zZUVkaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZWRpdC1wb3B1cF9fY2xvc2UnKTtcbmNsb3NlRWRpdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICBlZGl0UG9wdXAuY2xhc3NMaXN0LnRvZ2dsZShcImVkaXQtcG9wdXAtb3BlblwiKTtcbiAgICBlZGl0T3ZlcmxheS5jbGFzc0xpc3QudG9nZ2xlKFwib3ZlcmxheS1lZGl0LWludmlzaWJsZVwiKTtcbn0pXG5cbi8vIG5hdmlnYXRlIHRvIG5vdGVzIG1lbnVcbi8vIHJlbmRlcnMgdGhlIG5vdGVzIGFuZCBhcHBseXMgc2VsZWN0ZWQgc3R5bGluZyB0byB0aGUgbm90ZXMgbmF2IGxpbmtcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3Rlcy1uYXYnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IG5vdGVzTWFuYWdlci5hcnJhbmdlTm90ZXMobm90ZXMpKTtcbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNub3Rlcy1uYXYnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiBkb21NYW5pcHVsYXRvci51cGRhdGVBY3RpdmVOYXZNYWluKGUpKTtcblxuLy8gc2VsZWN0aW5nIHRoZSBvdXRlciBsaSBlbGVtZW50IHNvIGkgY2FuIGNoYW5nZSBmb2xkZXJzIGJ5IGNsaWNraW5nIHRoaXMgZWxlbWVudCBhcyB3ZWxsIGFzIHRoZSBpbm5lciBsaSB0ZXh0LlxubGV0IHRvZG9MaW5rcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5uYXZfX2l0ZW0tLWxpbmsnKTtcbnRvZG9MaW5rcyA9IEFycmF5LmZyb20odG9kb0xpbmtzKTtcbi8vIHBvcCBvZmYgdGhlIG5vdGVzIGxpbmsgc2luY2UgaXQgYWxyZWFkeSB3b3JrcyB3aXRob3V0IHRoaXMgaGFja1xudG9kb0xpbmtzLnBvcCgpO1xuLy8gbmF2aWFndGlvbiAyLCBmb3Igd2hlbiB0aGUgc3Vycm91bmRpbmcgbGkgaXRlbSBpcyBjbGlja2VkLlxuLy8gaSB0cmllZCBmb3IgYSBsb25nIHRpbWUgdG8gbWFrZSB0aGlzIHdvcmsgaW4gYSBjbGVhbmVyIHdheSBidXQgY291bGRudCBtYWtlIGl0IHdvcmsuXG4vL1xudG9kb0xpbmtzLmZvckVhY2goZm9sZGVyID0+IHtcbiAgICBmb2xkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gZG9tTWFuaXB1bGF0b3IuY2hhbmdlRm9sZGVyMihlLCB0b2RvcywgZGlzcGxheSkpO1xufSlcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==