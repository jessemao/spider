// @flow
import http from 'http';
import fs from 'fs';
import path from 'path';
import json2csv from 'json2csv';
import cheerio from 'cheerio';
import request from 'superagent';
import { formatInfoObject } from './util/formatter';

const i: number = 0;

// const url: string = "https://book.douban.com/tag/%E6%8E%A8%E7%90%86";
const URL_PREFIX = {
  douban: "http://www.9181.cn",
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

    return `${URL_PREFIX.douban}${url}`;
  }

  async fetchHome(suffix: string) {
    const formattedUrl = this.formatUrl(suffix);
    const res = await request.get(formattedUrl);
    const result = await this.lookUpAddressInfo(res);
    let addrArray = [];
    result.map((res) => {
      addrArray = addrArray.concat(res);
    })
    return addrArray;
  }

  async lookUpAddressInfo(res: any) {
    var $ = cheerio.load(res.text);
    let totalAddr = [];
    $("#showsp>table a").each((index, item) => {
      const linkUrl = $(item).attr('href');
      if(index % 2 === 0) {
        const address = this.fetchLinkUrl(this.formatUrl(linkUrl));
        totalAddr = totalAddr.concat(address);
      }
    });
    return await Promise.all(totalAddr);

  }

  async fetchLinkUrl(url: string): Array<any> {
    const res = await request.get(url);
    let addressInfoObj = {};
    var $ = cheerio.load(res.text);

    const rowsRawText = $('#rowshow').text();
    const rowsSplit = rowsRawText.split(';');
    const trans = rowsSplit.map((row) => {
      const valueSplit = row.split(':');
      return {
        lang: valueSplit[0],
        value: valueSplit[1] || '',
      }
    });

    return trans;
    // parse address title
    // const title = $('#wrapper>h1').text().replace(/\s/g, '');
    // const content = $('#wrapper .subjectwrap');

    // const addressInfo = $(content).find('#info');
    // addressInfoObj = this.parseAddressInfo($, addressInfo, addressInfoObj);
    // // parse address tags
    // const tags = $('#wrapper #db-tags-section .tag');
    // let addressTags = [];
    // tags.each((index, item) => {
    //   addressTags.push($(item).text().replace(/\s/g, ''));
    // });
    // Object.assign(addressInfoObj, { title: title, tag: addressTags, imageUrl: imageUrl });
    return addressInfoObj;
  }

  // async downloadImage(imageUrl: string, title: string) {
  //   const file = await request(imageUrl);
  //   const urlSplits = imageUrl.split('.');
  //   const imageType = urlSplits[urlSplits.length - 1];
  //   const imageNewUrl = path.join(PATH_NAME, `${title}.${imageType}`);
  //   // console.log(path.relative(BASE_NAME, imageNewUrl));
  //   let writeStream = fs.createWriteStream(imageNewUrl);
  //   writeStream.write(file.body);
  // }

  parseAddressInfo($:any, bookInfo: any, bookInfoObj: {[string]: string | Array<string>}) : {[string]: string | Array<string> } {
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

  async downloadCityAddress(city: string) {
    let result = [];
    for (var index = 0; index < 10; index++) {
      var element = await this.fetchHome(`/street/${city}_${index+1}.htm`);
      result = result.concat(element);
    }
    const csv = json2csv({data: result, fields: ['lang', 'value']});
    fs.writeFile(`${city}.csv`, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  }

}

export default Spider;

const spider = new Spider();
(async () => {
  await spider.downloadCityAddress('Zhejiang');
})();
// spider.fetchTagPages('随笔');