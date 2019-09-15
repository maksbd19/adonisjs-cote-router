# AdonisJS Cote Router

Using this package it is easy to use default route registration similar to what adonis provides.

## **Note:** This package is under active development

## Install

Change to your project directory and run the following command in your favourite terminal:

```bash
npm install adonis-cote-router
```

## Usage:

To use package discovery `AdonisJS` requires some configuration.

In your application starting script you should have something like following:

```js
const { Ignitor } = require("@adonisjs/ignitor");

new Ignitor(require("@adonisjs/fold"));
```

This initialize the `Ignitor` or the package that fires up `AdonisJS` framework

I found it conveinient to create a new file in `start` directory named `cote.js` to contain all the codes specific to `cote` and preload the file in the ignitor as following:

```js
new Ignitor(require("@adonisjs/fold")).preLoad("./start/cote");
```

And inside the `cote.js` file I require the routes and then invoke listen method.

```js
const Router = require("../routes");

const redisHOST = process.env.COTE_DISCOVERY_REDIS_HOST;
const redisPORT = process.env.COTE_DISCOVERY_REDIS_PORT;

Router.prepare(redisHOST, redisPORT, {
  name: "App Service",
  key: "app-microservice",
  port: 5401
});

Router.listen();
```

To keep http routes and cote routes seperate I create a new directory named `routes` in the root directory and reference it from the `cote.js` as shown earlier.

Inside `routes` directory I keep an `index.js` file where I put all my cote routes.

```js
const Router = require("adonisjs-cote-router");

Router.get("/", "HomeController@index");

Router.post("/user", "UserController@store");
Router.put("/user", "UserController@update");
Router.delete("/user", "UserController@delete");
```

Currently the route path doesn't support router parameters yet but soon they will be supported.

To able to discover automatically the controllers must recide inside `app\Controllers\Http` directory. _In near future I plan to work on keeping the routes related to cote inside its own directory like `app\Controllers\Cote`_

By default `Cote` is not statefull which means it does not care about the HTTP methods. But its nice to group the routes based on their methods and it will improve readability.

## `Router` class has the following public api's:

**`get/post/put/delete`** Generic route create methods

**`namespace`** to create a new namespaced route groups

```js
Router.namespace("admin", () => {
  Router.get("/", "AdminController@index"); // route: `admin/get/`
  Router.get("/profile", "AdminController@index"); // route `admin/get/profile`
});
```

**`group`** to create a route group

```js
Router.group(() => {
  Router.get("/", "AdminController@index");
  Router.get("/profile", "AdminController@index");
}).middleware("Authticate");
```

Groupped routes doesn't add anything with the route path but they are particularly useful for creating middleware like the example above. Middlewares are also subject to auto discovery. `Cote` middlewares are exactly same as `AdonisJS` middlewares, they are classes resided in the `app\Middlewares` directory with `handle` method which is actually invoked when the middleware is executed.

**Middlewares** are available to both `namespace`, `group` and `get/post/put/delete` methods. Chaining a `middleware` mehtod at the end with an array of middleware class names or a single one will add them with the namespaced/groupped/single route

## This is an early development of this project and subject to flaws. If you experience any then it will be really helpful if you can open an issue.

Thank you for having interest on this. Any help is appreciated.
