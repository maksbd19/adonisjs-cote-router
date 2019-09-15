"use strict";

/**
 * Route class to create a single route instance and the have the ability to
 * modify the instance to alter some data
 */
class Route {
  /**
   * Create a new route instance
   *
   * @param {string} prefix route path prefix
   * @param {string} namespace route namespace
   * @param {string} path route path
   * @param {string} handler route handler in {Controller}.{Mehtod} format
   */
  constructor(prefix, namespace, path, handler) {
    this._prefix = prefix;
    this._namespace = namespace;
    this._path = path;
    this._handler = handler;
    this._middlewares = [];
  }

  /**
   * Update route prefix
   *
   * @param {string} prefix
   *
   * @returns void
   */
  updatePrefix(prefix) {
    this._prefix = prefix;
  }

  /**
   * Update route namespace
   *
   * @param {string} namespace
   *
   * @returns void
   */
  updateNamespace(namespace) {
    this._namespace = namespace;
  }

  /**
   * Update route path
   *
   * @param {string} path
   *
   * @returns void
   */
  updatePath(path) {
    this._path = path;
  }

  /**
   * Update route middlewares. This method will not reset them rater add
   * the new ones with the old ones as well as the group middlewares
   *
   * @param {string} middlewares
   *
   * @returns void
   */
  updateMiddlewares(middlewares) {
    this._middlewares = this._middlewares.concat(middlewares);
  }

  /**
   * Update route prefix
   *
   * @param {string} prefix
   *
   * @returns void
   */
  updateHandler(handler) {
    this._handler = handler;
  }

  /**
   * get route path
   *
   * @returns {string} route path
   */
  get path() {
    return [this._prefix, this._namespace, this._path].join("/");
  }

  /**
   * get route handler
   *
   * @returns {String} handler
   */
  get handler() {
    return this._handler;
  }

  /**
   * get route middlewares
   *
   * @returns {Array} middlewares
   */
  get middlewares() {
    return this._middlewares;
  }

  /**
   * Append middleware to the list
   *
   * @param {Array} middleware
   *
   * @returns {Route} route
   */
  middleware(middleware) {
    if (middleware) {
      const middlewares = Array.isArray(middleware) ? middleware : [middleware];
      this._middlewares = this._middlewares.concat(middlewares);
    }

    return this;
  }

  /**
   * Update all the properties of this Route
   *
   * @param {*} props
   *
   * @returns {Route} route
   */
  updateProps(props) {
    if (props.prefix) {
      this.updatePrefix(props.prefix);
    }

    if (props.namespace) {
      this.updateNamespace(props.namespace);
    }

    if (Array.isArray(props.middlewares) && props.middlewares.length) {
      this.updateMiddlewares(props.middlewares);
    }

    return this;
  }

  /**
   * Update properties from the paramters of a route group
   *
   * @param {RouteGroup} group
   *
   * @returns {Route} route
   */
  updateGroupProps(group) {
    if (group.prefix) {
      this.updatePrefix(group.prefix);
    }

    if (group.namespace) {
      this.updateNamespace(group.namespace);
    }

    if (Array.isArray(group.middlewares) && group.middlewares.length) {
      this.updateMiddlewares(group.middlewares);
    }

    return this;
  }
}

module.exports = Route;