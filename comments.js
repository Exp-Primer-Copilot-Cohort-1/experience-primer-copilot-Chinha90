// Create web Server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
  HTML: function(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list: function(filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list + '</ul>';
    return list;
  }
}

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  console.log(pathname);
  if (pathname === '/') {
    if (queryData.id === undefined) {
      fs.readdir('./data', function(error, filelist) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description) {
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `
            <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name
              value="${queryData.id}">
              <input type="submit" value="delete">
            </form>
            `);
          response.writeHead(200);
          response.end(html);
          console.log(queryData.id);
          console.log(description);
          console.log(filelist);
          console.log(error);
        }
        );

        });
        }
    } else if (pathname === '/create') {
        var title = 'Create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `<h2>${title}</h2>`, `<form action="/create_process" method="post">
          <input type="text" name="title">
          <input type="text" name="description">
          <input type="submit" value="create">
        </form>`);
        response.writeHead(200);
        response.end(html);
    } else if (pathname === '/delete_process')
    {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        fs.unlink(`data/${id}`, function(error) {
          response.writeHead(302, {Location: `/`});
          response.end();
        });
      });
    }
    else if (pathname === '/update_process')
    {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(error) {
          fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          });
        });
      });
    }
    else if (pathname === '/update')
    {
      fs.readdir('./data', function(error, filelist) {
        fs.readFile(`data/${
            queryData.id}`, 'utf8', function(err, description) {
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list, `
                <h2>${title}</h2>
                <p>${description}</p>
                <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="text" name="title" value="${title}">
                <textarea name="description">${description}</textarea>
                <input type="submit">
                </form>
                `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            response.writeHead(200);
            response.end(html);
            });
        }
        );
    }
}


