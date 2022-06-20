'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx , app } = this;
    const packageData = app.package()
    const allPackage = app.allPackage
    console.log("allPackage", allPackage);
    ctx.body = packageData;
  }
}

module.exports = HomeController;
