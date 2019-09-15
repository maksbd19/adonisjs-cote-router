"use strict";

const RouteGroup = require("./group");
const Route = require("./route");

const { kebabCase } = require("./functions");

/**
 * Variables used by the Router class to hold various informations
 */

let Router_routes = [];
let Router_app = "";
let Router_key = "";
let Router_group = null;
let Router_namespace = "generics";
let Router_breakIndex = -1;
let Router_client = null;

/**
 * Router class: holds all the routes and the functionality to store new route
 */

class Router {
  /**
   * Internal method to check if the route is intended for a group
   *
   * @returns {boolean} is broken
   *
   * @private
   */
  static _isBroken() {
    return Router_breakIndex > -1;
  }

  /**
   * Register the length of the routes array so that consecutive routes added
   * here can be broken into a new group based on this index
   *
   * @returns void
   *
   * @private
   */
  static _break() {
    Router_breakIndex = Router_routes.length;
  }

  /**
   * Reset the break index to -1 so that the consecutive routes belong to
   * the root namespace
   *
   * @returns void
   *
   * @private
   */
  static _release() {
    Router_breakIndex = -1;
  }

  /**
   * Get the routes after the group is broken, based on the `_brokenIndex`
   *
   * @returns {Array} array of routes
   */
  static _flushBrokenRoutes() {
    if (!this._isBroken()) {
      return [];
    }

    const routes = Router_routes.splice(Router_breakIndex);
    this._release();

    return routes;
  }

  /**
   * Prepare a cote responder with provided configurations
   *
   * @param {string} host redis host name
   * @param {string} port redis port number
   * @param {object} conf configuration options for responder
   *
   * @returns void
   */
  static prepare(host, port, conf) {
    if (!host || !port) {
      throw new Error(
        "Unable to initiate cote responder without redis host and port"
      );
    }

    try {
      const cote = require("cote")({
        redis: { host: host, port: port }
      });

      const _conf = {
        name: "Cote responder"
      };

      if (conf.name) {
        _conf.name = conf.name;
        Router_app = kebabCase(conf.name);
      }

      if (conf.key || Router_key) {
        _conf.key = conf.key || Router_key;
      }

      if (conf.port) {
        _conf.port = conf.port;
      }

      const client = new cote.Responder(_conf);

      Router_client = client;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Set the client without invoking the prepare method, its useful in cases
   * where there will already be a cote responder and this router would use
   * that client instance
   *
   * @param {*} client
   *
   * @returns void
   */
  static setClient(client) {
    Router_client = client;
  }

  /**
   * Set the name of the responder
   *
   * @param {String} name
   *
   * @returns void
   */
  static setName(name) {
    Router_app = name;
  }

  /**
   * Set the default namespace
   *
   * @param {String} namespace
   *
   * @returns void
   */
  static setNamespace(namespace) {
    Router_namespace = namespace;
  }

  /**
   * Set the default key of the responder
   *
   * @param {String} key
   *
   * @returns void
   */
  static setKey(key) {
    Router_key = key;
  }

  /**
   * Register a get route
   *
   * @param {string} path Route path
   * @param {string} handler handler method as {Controller}.{Method} format
   *
   * @returns {Route} route
   */
  static get(path, handler) {
    return this.add("get/" + path, handler);
  }

  /**
   * Register a post route
   *
   * @param {string} path Route path
   * @param {string} handler handler method as {Controller}.{Method} format
   *
   * @returns {Route} route
   */
  static post(path, handler) {
    return this.add("get/" + path, handler);
  }

  /**
   * Register a put route
   *
   * @param {string} path Route path
   * @param {string} handler handler method as {Controller}.{Method} format
   *
   * @returns {Route} route
   */
  static put(path, handler) {
    return this.add("get/" + path, handler);
  }

  /**
   * Register a delete route
   *
   * @param {string} path Route path
   * @param {string} handler handler method as {Controller}.{Method} format
   *
   * @returns {Route} route
   */
  static delete(path, handler) {
    return this.add("get/" + path, handler);
  }

  /**
   * Register a generic route
   *
   * @param {string} path Route path
   * @param {string} handler handler method as {Controller}.{Method} format
   *
   * @returns {Route} route
   */
  static add(path, handler) {
    let namespace = Router_namespace;

    if (Router_group) {
      namespace = Router_group.namespace;
    }

    const route = new Route(Router_app, namespace, path, handler);

    Router_routes.push(route);

    return route;
  }

  /**
   * Add a route with namespace as an argument
   *
   * @param {String} namespace
   * @param {String} path
   * @param {String} handler
   *
   * @returns {Route} route
   */
  static any(namespace, path, handler) {
    const route = new Route(Router_app, namespace, path, handler);

    Router_routes.push(route);

    return route;
  }

  /**
   * Create a route group based on the the routes declared inside the
   * callback function. They can have shared middlewares.
   *
   * @param {function} fn
   * @param {RouteGroup} routeGroup a group of routes
   */
  static group(fn, routeGroup) {
    routeGroup = routeGroup || new RouteGroup();
    Router_group = routeGroup;

    this.break();
    fn();

    const routes = this._flushBrokenRoutes();

    routes.forEach(route => routeGroup.add(route));

    Router_routes.push(routeGroup);
    Router_group = null;

    return routeGroup;
  }

  /**
   * Create a namespaced group of routes
   *
   * @param {string} namespace
   * @param {function} fn
   */
  static namespace(namespace, fn) {
    const group = new RouteGroup(namespace);
    return this.group(fn, group);
  }

  /**
   * Flatten route groups to one dimentional array of routes
   *
   * @returns void
   *
   * @private
   */
  static _flattenRotues() {
    const routes = [];

    Router_routes.forEach(el => {
      if (el instanceof RouteGroup) {
        routes.push(...el.flatten());
      } else {
        routes.push(el);
      }
    });

    return routes;
  }

  /**
   * register listenting to the paths registered
   *
   * @returns void
   */
  static listen() {
    if (!Router_client) {
      throw new Error(
        "Cote client is not setup yet. Call `Router.setClient()` with client as only parameter or `Router.prepare()` with arguments"
      );
    }

    if (!iocResolver) {
      throw new Error(
        "isResolver is not available, perheps AdonisJS is not properly configured or the route is not preloaded properly"
      );
    }

    const routes = this._flattenRotues();

    const methodResolver = iocResolver.forDir("httpControllers");
    const middlewareResolver = iocResolver.forDir("middleware");

    routes.forEach(route => {
      const path = route.path;
      const handler = route.handler;
      const middlewares = route.middlewares
        .map(fn => {
          try {
            const resolvedMiddleware = middlewareResolver.resolveFunc(
              `${fn}.handle`
            );
            return resolvedMiddleware["method"];
          } catch (e) {
            log.error(e);
            return null;
          }
        })
        .filter(el => el !== null);

      const resolver = methodResolver.resolveFunc(handler);

      Router_client.on(path, (req, callback) => {
        try {
          const processMiddleware = (args, _callback) => {
            if (middlewares.length === 0) {
              return _callback(null, args);
            }

            const middleware = middlewares.shift();

            middleware(args, resp => {
              if (resp instanceof Error) {
                return callaback(resp);
              }
              processMiddleware(resp, _callback);
            });
          };

          if (!middlewares || middlewares.length) {
            middlewares = [];
          }

          processMiddleware(req, (err, resp) => {
            if (err) {
              return callback(err);
            }

            resolver.method(_req, (err2, result) => {
              return callback(err2, result);
            });
          });
        } catch (e) {
          return callback(e);
        }
      });
    });
  }
}

module.exports = Router;
