'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _formatter = require('./util/formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var i = 0;
var url = "https://book.douban.com/tag/%E6%8E%A8%E7%90%86";
var URL_PREFIX = {
  douban: "https://book.douban.com",
  search: "subject_search",
  tag: "tag",
  subject: 'subject'
};
var BASE_NAME = _path2.default.join(__dirname, '..');
var PATH_NAME = _path2.default.join(__dirname, '../static/img');

var Spider = function () {
  function Spider() {
    _classCallCheck(this, Spider);
  }

  _createClass(Spider, [{
    key: 'formatUrl',
    value: function formatUrl(url) {
      if (Array.isArray(url)) {
        var formattedUrl = '' + URL_PREFIX.douban;
        for (var i = 0; i < url.length; i++) {
          var element = url[i];
          formattedUrl += '/' + element;
        }
        return formattedUrl;
      }

      return URL_PREFIX.douban + '/' + url;
    }
  }, {
    key: 'fetchTagPages',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(tag) {
        var res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _superagent2.default.get(this.formatUrl([URL_PREFIX.tag, encodeURI(tag)]));

              case 2:
                res = _context.sent;

                this.lookUpBookInfo(res);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetchTagPages(_x) {
        return _ref.apply(this, arguments);
      }

      return fetchTagPages;
    }()
  }, {
    key: 'fetchSearchPage',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(searchText) {
        var res, books;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _superagent2.default.get(this.formatUrl(URL_PREFIX.search)).query({ 'search_text': searchText });

              case 2:
                res = _context2.sent;

                console.log('promise: ', Promise);
                _context2.next = 6;
                return Promise.all(this.lookUpBookInfo.call(this, res));

              case 6:
                books = _context2.sent;
                return _context2.abrupt('return', books);

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchSearchPage(_x2) {
        return _ref2.apply(this, arguments);
      }

      return fetchSearchPage;
    }()
  }, {
    key: 'lookUpBookInfo',
    value: function lookUpBookInfo(res) {
      var _this = this;

      console.log('look up');
      var $ = _cheerio2.default.load(res.text);
      var books = [];
      $(".subject-item>.info>h2>a").each(function (index, item) {
        var bookUrl = $(item).attr('href');
        console.log('this:', _this);
        var book = _this.fetchBookInfo(bookUrl);
        console.log('after this');
        books.push(book);
      });
      return books;
    }
  }, {
    key: 'fetchBookInfo',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(url) {
        var res, bookInfoObj, $, title, content, imageUrl, bookInfo, tags, bookTags;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _superagent2.default.get(url);

              case 2:
                res = _context3.sent;
                bookInfoObj = {};
                $ = _cheerio2.default.load(res.text);
                // parse book title

                title = $('#wrapper>h1').text().replace(/\s/g, '');
                content = $('#wrapper .subjectwrap');
                // parse book image

                imageUrl = $(content).find('#mainpic .nbg').attr('href');
                // this.downloadImage(imageUrl, title);

                bookInfo = $(content).find('#info');

                bookInfoObj = this.parseBookInfo($, bookInfo, bookInfoObj);
                // parse book tags
                tags = $('#wrapper #db-tags-section .tag');
                bookTags = [];

                tags.each(function (index, item) {
                  bookTags.push($(item).text().replace(/\s/g, ''));
                });
                Object.assign(bookInfoObj, { title: title, tag: bookTags, imageUrl: imageUrl });
                return _context3.abrupt('return', bookInfoObj);

              case 15:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fetchBookInfo(_x3) {
        return _ref3.apply(this, arguments);
      }

      return fetchBookInfo;
    }()
  }, {
    key: 'downloadImage',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(imageUrl, title) {
        var file, urlSplits, imageType, imageNewUrl, writeStream;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return (0, _superagent2.default)(imageUrl);

              case 2:
                file = _context4.sent;
                urlSplits = imageUrl.split('.');
                imageType = urlSplits[urlSplits.length - 1];
                imageNewUrl = _path2.default.join(PATH_NAME, title + '.' + imageType);
                // console.log(path.relative(BASE_NAME, imageNewUrl));

                writeStream = _fs2.default.createWriteStream(imageNewUrl);

                writeStream.write(file.body);

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function downloadImage(_x4, _x5) {
        return _ref4.apply(this, arguments);
      }

      return downloadImage;
    }()
  }, {
    key: 'parseBookInfo',
    value: function parseBookInfo($, bookInfo, bookInfoObj) {
      bookInfo.find('.pl').each(function (index, item) {
        var label = $(item).text().replace(/\s/g, '');
        var value = $($(item)[0].next).text().replace(/\s/g, '');
        if (value === '') {
          value = $(item).next().text().replace(/\s/g, '');
        } else if (value === ':') {
          var siblings = $(item).nextAll('a');
          value = '';
          siblings.each(function (index, item) {
            value += $(item).text().replace(/\s/g, '');
            value += '/';
          });
          value = value.substring(0, value.length - 1);
        }
        Object.assign(bookInfoObj, (0, _formatter.formatInfoObject)(label, value));
      });
      return bookInfoObj;
    }
  }]);

  return Spider;
}();

exports.default = Spider;

// const spider = new Spider();
// // spider.fetchSearchPage('冰与火之歌');
// spider.fetchTagPages('随笔');