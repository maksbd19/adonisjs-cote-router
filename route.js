"use strict";

/**
 * Route class to create a single route instance and the have the ability to
 * modify the instance to alter some data
 */
class Route {
  /**
   * Create a new route instance
   *
   * @param {string} app application namespace
   * @param {string} namespace route namespace
   * @param {string} path route path
   * @param {string} handler route handler in {Controller}.{Mehtod} format
   */
  constructor(app, namespace, path, handler) {
    this._app = app;
    this._namespace = namespace;
    this._path = path;
    this._handler = handler;
    this._middlewares = [];
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
    const path = `${this._app}/${this._namespace}/${this._path}`;
    return path.replace(new RegExp(/\/+/, "g"), "/");
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
