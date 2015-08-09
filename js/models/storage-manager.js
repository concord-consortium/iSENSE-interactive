// A singleton to manage the loading and saving of objects from localStorage
// It is not designed with multiple windows in mind, in that case
var StorageManager = {
  _cache: {},
  _types: {},

  initializeTypes: function() {
    this._types.ClassPeriod = require('./class-period');
    this._types.Project = require('./project');
    this._types.Dataset = require('./dataset');
    this._types.AppState = require('./app-state');
  },

  _getTypeCache: function(type){
    if(!this._cache.hasOwnProperty(type)){
    	 this._cache[type] = {};
    }

    return this._cache[type];
  },

  find: function(type, uri){
    var typeCache,
        storedItem,
        typeObject,
        storedObject;

    typeCache = this._getTypeCache(type);

    if(typeCache.hasOwnProperty(uri)){
      return typeCache[uri];
    }

    storedItem = window.localStorage.getItem(type + " " + uri);
    if(storedItem === null) {
      return null;
    }

    storedItem = JSON.parse(storedItem);
    typeObject = this._types[type];

    // need to use require to login
    // call the deserialize method
    // note this won't handle circular references because we haven't
    // cached the object before call deserialize on it
    // to fix that we'd need each object to have a "null" constructor that
    // was called first and the empty object is stored in the cache first
    // and additionally the derserialize implementations would need to know the
    // dependent objects should be be accessed just their references stored
    storedObject = typeObject.deserialize(this, storedItem);

    // put the object in the cache
    typeCache[uri] = storedObject;

    return storedObject;
  },

  findRequired: function(type, uri){
  	var object = this.find(type, uri);

  	if (object === null) {
      throw "Can't find " + type + " with " + uri;
  	}

  	return object;
  },

  save: function(object, type, uri){
  	// this should update the cache as well as putting the object in localStorage
  	var typeCache = this._getTypeCache(type),
  	    serializedObject;

  	typeCache[uri] = object;

  	// pass in the StorageManager so the object can save its related objects
  	serializedObject = object.serialize(this);

  	window.localStorage.setItem(type + " " + uri, JSON.stringify(serializedObject));
  }
};

module.exports = StorageManager;
