
var superagent = require("superagent");
var cheerio = require("cheerio");
var eventproxy = require("eventproxy");
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
			if (idx == 1) {
				return false;
			}
		});
		console.log(postUrls);


	var ep = new eventproxy();

	ep.after("toppic_html", postUrls.length, function(topics){  //返回信息
		topics = topics.map(function(topicPair){
			var postUrl = topicPair[0];  //postUrl
			var toppicHtml = topicPair[1]; // res.text
			var $ = cheerio.load(toppicHtml);
			return({
				title:$(".topic_full_title").text().trim(),
				href: postUrl,
				comment1: $(".reply_content").eq(0).text().trim(),
				author1:topicPair[2],
				score1: topicPair[3]
			});	

		});

		console.log("final");
		console.log(topics);
	});

	postUrls.forEach(function(postUrl){
		superagent.get(postUrl)
			.end(function(err, res){
				console.log("fetch " + postUrl + " successfully");
				
				//获取评论作者内容
				var postUrlText = res.text;
				var $ = cheerio.load(postUrlText);	
				var $element = $("div#reply1 a.user_avatar");
				var author1Href = url.resolve(postUrl, $element.attr("href"));

				superagent.get(author1Href)
					.end(function(err, res){
						var $ = cheerio.load(res.text);	
						var $element = $("reply1 a.user_avatar");
						var author1 = $("div.inner.userinfo a.dark").eq(0).text().trim();
						var score1 = $("div.user_profile span.big").text().trim();  

						ep.emit("toppic_html", [postUrl, postUrlText,author1,score1]);
					});

			});	
	});

	
});