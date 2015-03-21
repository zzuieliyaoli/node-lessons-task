
var superagent = require("superagent");
var cheerio = require("cheerio");
var async = require("async");
var url = require("url");

var targetUrl = "http://www16.zzu.edu.cn/msgs/vmsgisapi.dll/vmsglist?mtype=m&lan=101,102,103";

superagent.get(targetUrl)  //获取列表
	.end(function(err, res){
		if (err) {
			return console.err(err);
		}
		var postUrls = [];
		var $ = cheerio.load(res.text);

		$("div#bok_0 div.zzj_5a a").each(function(idx, element){
			var href = $(element).attr("href");
			postUrls.push(href);
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

				var postTitle = $("div.zzj_3").text().trim();
				var postAuthor = $("div.zzj_4 span.zzj_f2").eq(0).text().trim();
				var delay = new Date() - startTime;

				console.log( "现在的并发数为" + concurrencyCount + "\n正在抓取的是：" + postUrl + "\n已耗费" + delay+ " ms \n" );
						concurrencyCount--;
				callback(null, [postUrl,postTitle,postAuthor]);
				
			});


	}, function(err, result){
		console.log("final");
		console.log(result);
	});
	
});

