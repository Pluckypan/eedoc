$(function() {
	var searchTpl = "";
	searchTpl += "<li class=\"search-result-items\">";
	searchTpl += "	<span class=\"article-date\">";
	searchTpl += "		<%=post.create_time%>";
	searchTpl += "	</span>";
	searchTpl += "	<a href=\"<%=relative_path%><%=post.url%>\" class=\"article-title\">";
	searchTpl += "		<%=post.name%>";
	searchTpl += "	</a>";
	searchTpl += "</li>";

	$("#search-input").bind("input propertychange", function(event) {
		var key = $("#search-input").val();
		key = key.trim();
		var result = [];
		if (key && key.length > 0) {
			result = indexDB.filter(function(itm) {
				return itm.name.indexOf(key) >= 0 ||
					itm.desc.indexOf(key) >= 0 ||
					itm.category.indexOf(key) >= 0 ||
					$.inArray(key, itm.tags) >= 0
			});
		}
		$('#search-result').html('');
		result.forEach(function(post) {
			var html = ejs.render(searchTpl, {
				'post': post,
				'relative_path': relative_path
			});
			$('#search-result').append(html);
		});
	});
});
