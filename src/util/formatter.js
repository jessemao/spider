export function formatInfoObject(label, value) {
  if (label.indexOf('作者') >= 0) {
    return { author: value };
  } else if (label.indexOf('出版社') >= 0) {
    return { publisher: value };
  } else if (label.indexOf('译者') >= 0) {
    return { translator: value };
  } else if (label.indexOf('出版年') >= 0) {
    return { publishDate: value };
  } else if (label.indexOf('页数') >= 0) {
    return { pages: value };
  } else if (label.indexOf('定价') >= 0) {
    return { price: value };
  } else if (label.indexOf('装帧') >= 0) {
    return { bindings: value };
  } else if (label.indexOf('丛书') >= 0) {
    return { collections: value };
  } else if (label.indexOf('ISBN') >= 0) {
    return { isbn: value };
  }
}