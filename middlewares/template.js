const path = require('path');
const _ = require('lodash');
const pug = require('pug');

const config = localRequire('config');

/**
 * [render description]
 * @param  {[type]} f    [description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function render(f, data, options) {
  let file = path.join(config.viewPath, f);
  const extname = path.extname(file);
  if (!extname) {
    file += '.pug';
  }
  const isDevlopment = config.env === 'development';
  return pug.renderFile(file, _.extend({
    compileDebug: isDevlopment,
    cache: !isDevlopment,
  }, options, data));
}


/**
 * [parse description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function parse(file) {
  return (ctx, next) => next().then(() => {
    const {
      importer,
      timing,
    } = ctx.state;
    const end = timing.start('template');
    /* eslint no-param-reassign:0 */
    ctx.state.TEMPLATE = file;
    let html = render(file, ctx.state);
    if (importer) {
      // 替换css,js文件列表
      html = html.replace('<!--CSS_FILES_CONTAINER-->', importer.exportCss());
      html = html.replace('<!--JS_FILES_CONTAINER-->', importer.exportJs());
    }
    end();
    /* eslint no-param-reassign:0 */
    ctx.body = html;
  });
}

exports.parse = parse;
exports.render = render;
