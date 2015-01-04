var express = require("express");
var superagent = require("superagent");
var cheerio = require("cheerio");

var app = express();

app.get("/", function (req, res, next){
	superagent.get("https://cnodejs.org/")
	  .end(function (err, sres){
	  	if (err) {
	  		return next(err);
	  	}

	  	var $ = cheerio.load(sres.text);
	  	var items = [];
	  	$("#topic_list .topic_title").each(function (index, element){
	  		var $element = $(element);
	  		items.push({
	  			title: $element.attr("title"),
	  			href: "https://cnodejs.org" + $element.attr("href")
	  		});
	  	});

	  	$("#topic_list a.user_avatar img").each(function (index, element){
	  		var $element1 = $(element);
	  		items[index].author =  $element1.attr("title")
	  	});

	  	res.send(items);
	  });
});

app.listen(3000, function (req, res){
	console.log("app is running at port 3000");
});



