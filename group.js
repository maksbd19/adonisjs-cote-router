"use strict";

/**
 * Create and maintain route group
 */

class RouteGroup {
  constructor(namespace) {
    this._routes = [];
    this._middlewares = [];
    this._separator = "/";
    this._namespace = namespace;
  }

  /**
   * Set separator of the namespace
   *
   * @returns void
   */
  set separator(separator) {
    this._separator = separator;
  }

  /**
   * Add a route to this group
   *
   * @param {Route} route
   *
   * @returns void
   */
  add(route) {
    this._routes.push(route);
  }

  /**
   * get namespace of this group
   *
   * @returns {string} namespace
   */
  get namespace() {
    return this._namespace;
  }

  /**
   * get middlewares of this group
   *
   * @returns {Array} middlewares
   */
  get middlewares() {
    return this._middlewares;
  }

  /**
   * get separator of this group
   *
   * @returns {string} separator
   */
  get separator() {
    return this._separator;
  }

  /**
   * Add a new set of middlewares to this group
   *
   * @param {array} middleware
   */
  middleware(middleware) {
    if (middleware) {
      const middlewares = Array.isArray(middleware) ? middleware : [middleware];
      this._middlewares = this._middlewares.concat(middlewares);
    }
    return this;
  }

  /**
   * Flatten all the routes registered to this group is a single dimentional array
   * of routes. Nested route groups are also flatten by recursive call
   *
   * @param {*} props
   *
   * @returns {Array} routes
   */
  flatten(props) {
    const routes = [];

    if (props) {
      const namespace = [props.namespace, this.namespace]
        .filter(i => !!i)
        .join(this.separator);

      const middlewares = props.middlewares
        .concat(this._middlewares)
        .filter((value, index, self) => self.indexOf(value) === index);

      props.namespace = namespace;
      props.middlewares = middlewares;
    } else {
      props = {
        namespace: this.namespace,
        middlewares: this._middlewares
      };
    }

    this._routes.forEach(el => {
      if (el instanceof RouteGroup) {
        routes.push(...el.flatten(props));
      } else {
        routes.push(el.updateProps(props));
      }
    });
    return routes;
  }
}

module.exports = RouteGroup;
