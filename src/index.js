// @flow
import http from 'http';
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import request from 'superagent';
import { formatInfoObject } from './util/formatter';

const i: number = 0;
const url: string = "https://book.douban.com/tag/%E6%8E%A8%E7%90%86";
const URL_PREFIX = {
  douban: "https://book.douban.com",
  search: "subject_search",
  tag: "tag",
  subject: 'subject',
}
const BASE_NAME = path.join(__dirname, '..');
const PATH_NAME = path.join(__dirname, '../static/img');

class Spider {
  formatUrl(url: string | Array<string>): string {
    if (Array.isArray(url)) {
      let formattedUrl = `${URL_PREFIX.douban}`;
      for (var i = 0; i < url.length; i++) {
        var element = url[i];
        formattedUrl += `/${element}`;
      }
      return formattedUrl;
    }

    return `${URL_PREFIX.douban}/${url}`;
  }

  async fetchTagPages(tag: string) {
    const res = await request.get(this.formatUrl([URL_PREFIX.tag, encodeURI(tag)]));
    this.lookUpBookInfo(res);
  }

  async fetchSearchPage(searchText: string) {
    const res = await request.get(this.formatUrl(URL_PREFIX.search))
      .query({'search_text': searchText});
    console.log('promise: ', Promise);
    const books = await Promise.all(this.lookUpBookInfo.call(this, res));
    return books;
  }

  lookUpBookInfo(res: any) {
    console.log('look up')
    var $ = cheerio.load(res.text);
    const books = [];
    $(".subject-item>.info>h2>a").each((index, item) => {
      const bookUrl = $(item).attr('href');
      console.log('this:', this);
      const book = this.fetchBookInfo(bookUrl);
      console.log('after this');
      books.push(book);
    });
    return books;
  }

  async fetchBookInfo(url: string) {
    const res = await request.get(url);
    let bookInfoObj = {};
    var $ = cheerio.load(res.text);
    // parse book title
    const title = $('#wrapper>h1').text().replace(/\s/g, '');
    const content = $('#wrapper .subjectwrap');
    // parse book image
    const imageUrl = $(content).find('#mainpic .nbg').attr('href');
    // this.downloadImage(imageUrl, title);

    const bookInfo = $(content).find('#info');
    bookInfoObj = this.parseBookInfo($, bookInfo, bookInfoObj);
    // parse book tags
    const tags = $('#wrapper #db-tags-section .tag');
    let bookTags = [];
    tags.each((index, item) => {
      bookTags.push($(item).text().replace(/\s/g, ''));
    });
    Object.assign(bookInfoObj, { title: title, tag: bookTags, imageUrl: imageUrl });
    return bookInfoObj;
  }

  async downloadImage(imageUrl: string, title: string) {
    const file = await request(imageUrl);
    const urlSplits = imageUrl.split('.');
    const imageType = urlSplits[urlSplits.length - 1];
    const imageNewUrl = path.join(PATH_NAME, `${title}.${imageType}`);
    // console.log(path.relative(BASE_NAME, imageNewUrl));
    let writeStream = fs.createWriteStream(imageNewUrl);
    writeStream.write(file.body);
  }

  parseBookInfo($:any, bookInfo: any, bookInfoObj: {[string]: string | Array<string>}) : {[string]: string | Array<string> } {
    bookInfo.find('.pl').each((index, item) => {
      const label = $(item).text().replace(/\s/g, '');
      let value = $($(item)[0].next).text().replace(/\s/g, '');
      if (value === '') {
        value = $(item).next().text().replace(/\s/g, '');
      } else if (value === ':') {
        const siblings = $(item).nextAll('a');
        value = '';
        siblings.each((index, item) => {
          value += $(item).text().replace(/\s/g, '');
          value += '/';
        })
        value = value.substring(0, value.length - 1);
      }
      Object.assign(bookInfoObj, formatInfoObject(label, value));
    });
    return bookInfoObj;
  }

}

export default Spider;

// const spider = new Spider();
// // spider.fetchSearchPage('冰与火之歌');
// spider.fetchTagPages('随笔');