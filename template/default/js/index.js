(function() {
	function Commands() {
		var $$ = this.$$;
		this.commands = linux_commands || [];
		this.elm_query = $$('query');
		this.elm_btn = $$('search_btn');
		this.elm_result = $$('result');
		this.elm_search_result = $$('search_list_result');

		// 获取根路径
		this.root_path = (function() {
			var elm_path = $$('current_path');
			if(!window.location.origin) {
				window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
			}
			var url = window.location.origin + window.location.pathname;

			if(elm_path) {
				var elm_val = elm_path.value;
				elm_val = elm_val.replace(/\\/g, "/");
				console.log(elm_val);
				return url.replace(elm_val, "").replace(/\/$/, '');
			} else {
				return '';
			}

		})();

		this.query = ''; //
		this.query_size = 5; //搜索框结果显示5条
		this.page_size = 50; //每页显示20条

		this.init()
	}

	Commands.prototype = {
		$$: function(id) {
			return document.getElementById(id)
		},
		bindEvent: function(elm, type, handle) {
			if(elm.addEventListener) {
				elm.addEventListener(type, handle, false);
			} else if(elm.attachEvent) {
				elm.attachEvent('on' + type, handle);
			}
		},
		isSreachIndexOF: function(oldstr, kw) {
			var istrue = false;
			if(oldstr && Object.prototype.toString.call(oldstr) === '[object Array]') {
				for(var i = 0; i < oldstr.length; i++) {
					oldstr[i].toLowerCase() === kw.toLowerCase() ? istrue = true : null;
				}
				return istrue;
			}
			if(!oldstr || !kw) return false;
			return oldstr.toLowerCase().indexOf(kw.toLowerCase()) > -1 ? true : false;
		},
		//获取URL上面的参数
		getQueryString: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = decodeURIComponent(window.location.hash.replace(/^(\#\!|\#)/, '')).match(reg);
			if(r != null) return unescape(r[2]);
			return null;
		},
		pushState: function() {
			if(window.history && window.history.pushState)
				this.query ? history.pushState({}, "linux_commands", "#!kw=" + this.query) :
				history.pushState({}, "linux_commands", window.location.pathname);
		},
		//简单模版
		simple: function(str, obj) {
			return str.replace(/\$\w+\$/gi, function(matchs) {
				var returns = obj[matchs.replace(/\$/g, "")];
				return typeof returns === "undefined" ? "" : returns;
			})
		},
		createKeyworldsHTML: function(json, keywolds, islist) {
			console.log(json);
			var name = json.n,
				des = json.d,
				self = this,
				reg = new RegExp("(" + keywolds + ")", "ig"),
				str = '';
			if(keywolds) {
				name = json.n.replace(reg, '<i class="kw">' + "$1" + "</i>");
				des = json.d.replace(reg, '<i class="kw">' + "$1" + "</i>") || '';
			}

			var rootp = this.root_path.replace(/\/$/, '');
			str = islist ? '<a href="' + rootp + '/c$url$.html"><strong>$name$</strong> - $des$</a><p></p>' : '<a href="' + rootp + '/c$url$.html"><strong>$name$</strong> - $des$</a>';
			return this.simple(str, {
				name: name,
				url: json.p,
				des: des
			});
		},
		/**
		 * [searchResult ]
		 * @param  {[type]} islist [是否为列表]
		 */
		searchResult: function(islist) {
			var arr = this.commands,
				self = this,
				i = 0,
				page_size = arr.length,
				arrResultHTML = [],
				show_list_count = islist ? this.page_size : this.query_size;
			if(arr && arr.length && Object.prototype.toString.call(arr).indexOf('Array') > -1) {
				var count = 0
				for(; i < page_size; i++) {
					if(!arr[i]) break;
					if(self.isSreachIndexOF(arr[i].n, self.query) ||
						self.isSreachIndexOF(arr[i].d, self.query)
					) {
						if(count < show_list_count) {
							arrResultHTML.push(self.createKeyworldsHTML(arr[i], self.query, islist));
							++count;
						}
					}
				}
			}

			var elm = islist ? this.elm_search_result : this.elm_result;
			elm.innerHTML = '';
			for(var i = 0; i < arrResultHTML.length; i++) {
				var myLi = document.createElement("LI");
				myLi.innerHTML = arrResultHTML[i];
				elm.appendChild(myLi);
			}
			if(arrResultHTML.length === 0) {
				var myLi = document.createElement("LI");
				myLi.innerHTML = '<span>' + this.query ? '请尝试输入一些字符，进行搜索！' + '</span>' : '没有搜索到任何内容，请尝试输入其它字符！';
				elm.appendChild(myLi);
			}
		},
		init: function() {
			var self = this;
			var kw = self.getQueryString('kw');
			kw = kw && kw.length > 0 ? kw : '';
			var timer = null
			this.elm_query.value = kw;
			this.query = kw || '';
			if(this.elm_search_result) self.searchResult(true);
			this.bindEvent(this.elm_query, 'input', function(e) {
				self.query = e.target.value;

				self.pushState()
				if(self.query) {
					self.searchResult();
				} else {
					self.elm_result.style.display = 'none';
				}
				if(!self.elm_search_result) {
					self.elm_result.style.display = self.query ? 'block' : 'none';
				} else {
					self.elm_btn.click();
				}
			})
			this.bindEvent(this.elm_btn, 'click', function(e) {
				self.elm_result.style.display = 'none';
				if(self.elm_search_result) self.searchResult(true);
				else {
					window.location.href = self.root_path + '/list.html#!kw=' + self.query;
				}
			})
			this.bindEvent(this.elm_query, 'focus', function(e) {
				self.searchResult();
				if(self.query) self.elm_result.style.display = 'block';
			})
			this.bindEvent(this.elm_query, 'blur', function(e) {
					timer = setTimeout(function() {
						self.elm_result.style.display = 'none';
					}, 300)
				})
				// 输入Enter键
			this.bindEvent(document, 'keyup', function(e) {
				if(e.key == 'Enter') {
					self.elm_btn.click();
				}
			})

			if(kw) self.searchResult();
		}
	}

	new Commands()

})()