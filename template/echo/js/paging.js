function parsePost(url) {
	var arr = url.split("#");
	var books = [];
	//console.log(arr);
	if (arr && arr.length > 1) {
		var tmp = categoryPost.find(function(item) {
			return item.group == arr[arr.length - 1];
		});
		if (tmp) {
			books = books.concat(tmp.items);
		} else {
			categoryPost.forEach(function(itm) {
				books = books.concat(itm.items);
			});
		}
	} else {
		categoryPost.forEach(function(itm) {
			books = books.concat(itm.items);
		});
	}
	return books;
}

function doPaging(dataArr) {
	$(".list").html("");
	$('#paging').paging({
		nowPage: 1,
		allPages: Math.ceil(dataArr.length / 6),
		displayPage: 10,
		callBack: function(now) {
			var currentPages = now * 6 < dataArr.length ? 6 : dataArr.length - (now - 1) * 6;
			$('#resultBox').html('');
			for (var i = 0; i < currentPages; i++) {
				var num = (now - 1) * 6 + i;
				var post = dataArr[num];
				var html = ejs.render(ejsTmp, {'post':post,'type':'category','relative_path':relative_path});
				$('#resultBox').append(html);
			}
		}
	});
}
$(function() {
	var books = parsePost(window.location.href);
	doPaging(books)
	$(".categoryClick").click(function() {
		$(".category a").removeClass("current");
		$(this).addClass("current");
		doPaging(parsePost("id=#" + this.id))
	});
});;
(function($, window, document, undefined) {
	var Paging = function(elem, options) {
		var self = this;
		this.$oPaging = elem;
		this.$oFirst = this.$oPaging.find('.first');
		this.$oLast = this.$oPaging.find('.last');
		this.$oPrev = this.$oPaging.find('.prev');
		this.$oNext = this.$oPaging.find('.next');
		this.$oList = this.$oPaging.find('.list');
		this.$aItem = this.$oList.find('li');
		this.$oGo = this.$oPaging.find('.go');
		this.$oGo_text = this.$oGo.find('input');
		this.$oGo_btn = this.$oGo.find('button');
		this.defaults = {
			nowPage: 1,
			allPages: 10,
			displayPage: 5
		};
		this.opts = $.extend({}, this.defaults, options);
		this.nowPage = this.opts.nowPage;
		this.allPages = this.opts.allPages;
		this.displayPage = this.opts.displayPage > this.allPages ? this.opts.displayPage = this.allPages : this.opts.displayPage;
		this.iNum = this.nowPage;
		this.min_halfPage = Math.floor(this.displayPage / 2);
		this.big_halfPage = Math.ceil(this.displayPage / 2);
	};
	Paging.prototype = {
		clickFn: function() {
			this.cleanClassName();
			this.setPaging(this.iNum);
			this.detectionPage(this.iNum);
			this.opts.callBack && this.opts.callBack(this.iNum);
		},
		cleanClassName: function() {
			this.$aItem.removeClass('current');
		},
		detectionPage: function(currentPage) {
			if (currentPage >= this.big_halfPage + 1) {
				this.$oFirst.removeClass('inactive');
			} else {
				this.$oFirst.addClass('inactive');
			}
			if ((this.allPages - currentPage) >= this.big_halfPage) {
				this.$oLast.removeClass('inactive');
			} else {
				this.$oLast.addClass('inactive');
			}
			if (currentPage > 1) {
				this.$oPrev.removeClass('inactive');
			} else {
				this.$oPrev.addClass('inactive');
			}
			if (currentPage < this.allPages) {
				this.$oNext.removeClass('inactive');
			} else {
				this.$oNext.addClass('inactive');
			}
		},
		setPaging: function(currentPage) {
			this.$aItem = this.$oList.find('li');
			for (var i = 1; i <= this.displayPage; i++) {
				if (currentPage <= this.min_halfPage) {
					this.$aItem.eq(i - 1).text(i).attr('index', '#' + i);
					for (var j = 1; j <= this.min_halfPage; j++) {
						if (currentPage === j && i === j) {
							this.$aItem.eq(i - 1).addClass('current');
						}
					}
				} else if ((this.allPages - currentPage) < this.min_halfPage) {
					var nowNum = this.allPages - this.displayPage + i;
					this.$aItem.eq(i - 1).text(nowNum).attr('index', '#' + nowNum);
					for (var j = 0; j < this.min_halfPage; j++) {
						if ((this.allPages - currentPage) === j && i === this.displayPage - j) {
							this.$aItem.eq(i - 1).addClass('current');
						}
					}
				} else {
					var nowNum = currentPage - this.big_halfPage + i;
					if (i === this.big_halfPage) {
						this.$aItem.eq(i - 1).addClass('current');
					}
					this.$aItem.eq(i - 1).text(nowNum).attr('index', '#' + nowNum);
				}
			}
		},
		initalPaging: function() {
			for (var i = 1; i <= this.displayPage; i++) {
				var $create_li = $('<li></li>');
				$create_li.text(i).attr('index', '#' + i);
				$create_li.text(i).attr('class', 'page-numbers num');
				this.$oList.append($create_li);
			}
			if (this.allPages <= this.displayPage) {
				this.$aItem.eq(this.nowPage - 1).addClass('current');
			} else {
				this.$oGo.css({
					display: 'inline-block'
				});
				this.$oGo_text.attr('placeholder', 'Total: ' + this.allPages);
			}
			this.setPaging(this.nowPage);
			this.detectionPage(this.nowPage);
		},
		inital: function() {
			var self = this;
			this.initalPaging();
			this.opts.callBack && this.opts.callBack(this.iNum);
			this.$aItem.click(function() {
				if (!$(this).hasClass('current')) {
					self.iNum = parseInt($(this).attr('index').substring(1));
					self.clickFn();
				}
			});
			this.$oFirst.click(function() {
				if (!$(this).hasClass('inactive')) {
					self.iNum = 1;
					self.clickFn();
				}
			});
			this.$oLast.click(function() {
				if (!$(this).hasClass('inactive')) {
					self.iNum = self.allPages;
					self.clickFn();
				}
			});
			this.$oPrev.click(function() {
				if (!$(this).hasClass('inactive')) {
					self.iNum--;
					self.clickFn();
				}
			});
			this.$oNext.click(function() {
				if (!$(this).hasClass('inactive')) {
					self.iNum++;
					self.clickFn();
				}
			});
			this.$oGo_btn.click(function() {
				var value = self.$oGo_text.val();
				var reg = new RegExp(/^[0-9]*[1-9][0-9]*$/);
				if (value !== '' && reg.test(value) && value <= self.allPages) {
					self.iNum = parseInt(value);
					self.clickFn();
					self.$oGo_text.val('')
				} else {
					self.$oGo_text.val('')
				}
			});
		},
		constructor: Paging
	};
	$.fn.paging = function(options) {
		var paging = new Paging(this, options);
		return paging.inital();
	};
})(jQuery, window, document, undefined);

var ejsTmp = "";
ejsTmp += "<article class=\"col-six tab-full article animate-this animated fadeInUp\">";
ejsTmp += "	<%const placeholder='holder.js/10x10?auto=yes&random=yes&text=Mira.Sofia~'%>	";
ejsTmp += "	<div class=\"entry-media\">";
ejsTmp += "		<a href=\"<%=relative_path%><%=post.url%>\" target=\"_self\">";
ejsTmp += "			<img src=\"<%=post.cover%>\" data-src=\"<%=post.cover?post.cover:placeholder%>\" draggable=\"false\" alt=\"\" style=\"width: 100%;height: 200px; object-fit:cover;\">";
ejsTmp += "		</a>";
ejsTmp += "	</div>";
ejsTmp += "	<div class=\"entry-body\">";
ejsTmp += "		<div class=\"entry-header\">";
ejsTmp += "			<div class=\"meta-categories\">";
ejsTmp += "				<%if(post.category){%>";
ejsTmp += "					<span class=\"category-prefix\">#</span>";
ejsTmp += "					<a href=\"category.html\" rel=\"category tag\">";
ejsTmp += "						<%=post.category%>";
ejsTmp += "					</a>";
ejsTmp += "				<%}%>";
ejsTmp += "			</div>";
ejsTmp += "			<h1 class=\"post-title\">";
ejsTmp += "				<a href=\"<%=relative_path%><%=post.url%>\" target=\"\"><%=post.name%></a>";
ejsTmp += "			</h1>";
ejsTmp += "			<div class=\"meta-author-date\">";
ejsTmp += "				<span class=\"meta-date\"><%=post.create_time%></span>";
ejsTmp += "			</div>";
ejsTmp += "		</div>";
ejsTmp += "		<div class=\"entry-content\">";
ejsTmp += "			<p>";
ejsTmp += "				<%=post.desc%>";
ejsTmp += "			</p>";
ejsTmp += "		</div>";
ejsTmp += "	</div>";
ejsTmp += "</article>";
