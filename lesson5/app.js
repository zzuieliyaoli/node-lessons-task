
var superagent = require("superagent");
var cheerio = require("cheerio");
var async = require("async");
var url = require("url");

var targetUrl = "https://cnodejs.org/";

superagent.get(targetUrl)  //获取列表
	.end(function(err, res){
		if (err) {
			return console.err(err);
		}
		var postUrls = [];
		var $ = cheerio.load(res.text);

		$("#topic_list .topic_title").each(function(idx, element){
			var $element = $(element);
			var href = url.resolve(targetUrl, $element.attr("href"));
			postUrls.push(href);

			//点到为止，不将https://cnodejs.org/首页所有文章爬一遍
			if (idx == 9) {
				return false;
			}
		});
		console.log(postUrls);

	var concurrencyCount = 0;

	async.mapLimit(postUrls, 5, function(postUrl, callback){
		concurrencyCount++;
		var startTime  = new Date();
		superagent.get(postUrl)
			.end(function(err, res){
				var postUrlText = res.text;
				var $ = cheerio.load(postUrlText);	
				var $element = $("div#reply1 a.user_avatar");

				var postTitle = $("div#content span.topic_full_title").text().trim();
				var author1Href = url.resolve(postUrl, $element.attr("href"));

				superagent.get(author1Href)
					.end(function(err, res){
						var $ = cheerio.load(res.text);	
						var $element = $("reply1 a.user_avatar");
						var author1 = $("div.inner.userinfo a.dark").eq(0).text().trim();
						var score1 = $("div.user_profile span.big").text().trim();
						var delay = new Date() - startTime;
						console.log( "现在的并发数为" + concurrencyCount + "\n正在抓取的是：" + postUrl + "\n已耗费" + delay+ " ms \n" );
						concurrencyCount--;
						callback(null, [postUrl,postTitle,author1,score1]);
					});
				
			});


	}, function(err, result){
		console.log("final");
		console.log(result);
	});
	
});

