/*
 * readitlater.js
 * read it later apiをたたく
 * API Reffernce : http://readitlaterlist.com/api/docs/
 * TODO:ADDにbufferからのリストを入れられるように
*/

let PLUGIN_INFO =
<VimperatorPlugin>
	<name>readitlater</name>
	<description lang="ja">Read it Later を快適に使うためのプラグインです</description>
	<version>0.3.1</version>
	<minVersion>3.0</minVersion>
	<author mail="ninja.tottori@gmail.com" homepage="http://twitter.com/ninja_tottori">ninja.tottori</author>
	<updateURL>https://github.com/vimpr/vimperator-plugins/raw/master/readitlater.js</updateURL>
	<detail lang="en"><![CDATA[
	  Q. What is this?
	    Is a plug-in for comfortable use A.Read it Later

	  Firstly, you should get API Key at page http://readitlaterlist.com/api/signup/. Then you should add such string to your (probably empty) .vimperatorrc:
		let g:readitlater_api_key = "api key"

	  And then you should save your login and password in standart Firefox password manager on readitlaterlist.com

	  == Command ==
	  :ril
	  :ril add
		To register the title and url of the page you're looking at
		You can also edit and register it so choose appropriately url, a title as an option.
		In addition, the effectiveness of Completion URL.
		URL completion is let g:readitlater_complete = "slf" you can choose a supplement to use it as readitlater_complete = "slf".

	  :ril get
		You have to get the information on the page cache has been registered.
		The default is 50
			let g:readitlater_get_count = 100
		You can change the number or retrieve.
		so plugin goes to sync over no questions asked after add, open, has been read, you might want to not increase the number profusely.

	  :ril open
		So come out to completion is a list of readitlater <Space>, will open in a new tab and select it to run (<Space>) the URL of your choice.
		This is displayed as read only and to supplement and give ril open!!.

		In addition, you can go to read at the same time and open flag.
		  let g:readitlater_open_as_read = 1
		I think the first time you should do it by yourself and so does not contain data in a cache: you must help plugin with ril get.

	  :ril read
		Is a sub-command flag for the marking curent url as read.

	  :ril stats
		Information can be taken since, list, unread, the read
	]]></detail>
	<detail lang="ja"><![CDATA[

	Q.これは何？
	A.Read it Later を快適に使うためのプラグインです

	注意1.
		パスワードマネージャに依存してるので、ReadItLaterのID/PWをパスワードマネージャに登録しておく必要があります。

	注意2.
		API Key を使うので
		http://readitlaterlist.com/api/signup/
		から自分のAPI Keyを取得して
		rcファイルに let g:readitlater_api_key = "api key" と書いておいた方が良いと思います。
		デフォルトではあらかじめ私が取得したAPI Key使ってますが、一定時間内のリクエスト数などに制限があるみたいです。
		同じキーで1時間に10000回コールするとアレされるそうなので、チームotsuneの方達などは独自で取った方がいいかと思います。


		== Command ==
	:ril
	:ril add
		今見ているページのurlとtitleを登録します
		オプションとして url , title が選べるので適当に編集して登録もできます。
		また、URL の補完も効きます。
		URL補完は let g:readitlater_complete = "slf" のようにして使用する補完を選択できます。

	:ril get
		登録されてるページの情報を取得してキャッシュしときます。
		デフォルトは50件ですが
		let g:readitlater_get_count = 100
		とかで取得件数を変更できます。
		add , open , read された後に問答無用で同期かけに行ってますので、件数をやたらに増やさない方がいいかもしれません。

	:ril open
		<Space>で補完にreaditlaterのリストが出てくるので、任意のURLを選択(<Space>)して実行すると新しいタブに開きます。
		:ril open! と!をつけると既読のみ補完に表示されます。

		また、開くと同時に既読フラグを立てに行く事ができます。
		let g:readitlater_open_as_read = 1
		としてもらえれば大丈夫です。
		※初回はキャッシュにデータが入っていないと思うので自分で:ril getしてやる必要があります。

	:ril read
		既読フラグを立てる為のサブコマンドです。
		openした時に既読にしたくないっていう人はこれを使って既読フラグを立てて下さい。

	:ril stats
		since, list, unread, read の情報がとれます


	]]></detail>
</VimperatorPlugin>;


(function(){

	commands.addUserCommand(["ril","readitlater"],	"Read It Late plugin",
		function(args){
			addItemByArgs(args);
		},
		{
		subCommands: [
			new Command(["add","a"], "Add a page to a user's list",
				function (args) {
					addItemByArgs(args);
				},{
				literal: 0,
				options : [
					[["url","u"],commands.OPTION_STRING,null,
							(function(){
							return [[ buffer.URL ,"target url"]]
						})
					],

					[["title","t"],commands.OPTION_STRING,null,
							(function(){
							return [[ buffer.title ,"title"]]
						})
					],
				],
				completer: function (context, args) completion.url(context, liberator.globalVariables.readitlater_complete)
				}
			),

			new Command(["madd","m"], "Add a mobile version of page to a user's list",
				function (args) {
					addItemByArgsWithSubstitution(args);
				},{
				literal: 0,
				options : [
					[["url","u"],commands.OPTION_STRING,null,
							(function(){
							return [[ buffer.URL ,"target url"]]
						})
					],

					[["title","t"],commands.OPTION_STRING,null,
							(function(){
							return [[ buffer.title ,"title"]]
						})
					],
				],
				completer: function (context, args) completion.url(context, liberator.globalVariables.readitlater_complete)
				}
			),

			new Command(["get","g"], "Retrieve a user's reading list",
				function (args) {
			          ListCache.unread.update(true, function(data) echo(countObjectValues(data.list) + " found."));
				},{
				options : [
					//[["num"],commands.OPTION_INT],
					//[["read","-r"],commands.OPTION_NOARG],
					//[["tags","-t"],commands.OPTION_NOARG],
					//[["myAppOnly"],commands.OPTION_NOARG],
				],
				}
			),

			new Command(["open","o"], "Open url in new tab from RIL list.",
				function (args) {
					liberator.open(args, liberator.NEW_BACKGROUND_TAB);
					if(liberator.globalVariables.readitlater_open_as_read == 1) markAsRead(args);
				},{
					bang: true,
					completer : listCompleter,
				}
			),

			new Command(["read","r"], "Mark items as read.",
				function (args) {
					markAsRead(args);
				},{
					bang: true,
					completer : listCompleter,
				}
			),

			new Command(["stats","s"], "Retrieve information about a user's list",
				function (args) {
					ReadItLater.stats();
				},{}
			),

			/*
			new Command(["test"], "Return stats / current rate limit information about your API key",
				function () {
					ReadItLater.apiTest();
				},{}
			),
			*/
		],


		},
		true
	);

	const CacheStore = storage.newMap("readitlater",{store:true});

  // Cache {{{
	function Cache ({updater, name, limit}) {
		this.limit = limit || 10 * 1000 * 60;
		this.name = name;
		this.updater = updater;
	}

	Cache.prototype = {
		get cache() CacheStore.get(name, void 0),
		set cache(value) CacheStore.set(name, value),

		get: function(callback){ // {{{
			let self = this;

			if (this.isExpired || !this.cache) {
				this.lastUpdated = new Date().getTime();
				this.update(true, callback);
				return;
			}

			callback(this.cache);
		}, // }}}

		update: function(force, callback){ // {{{
			if (!force && !this.isExpired)
				return;

			let self = this;

			liberator.log('[ReadItLater] cache updating');
			this.updater(function(data){
				self.cache = data;
				if (callback) callback(data);
			});
		}, //}}}

		save: function() CacheStore.save(),

		get isExpired() (!this.lastUpdated || (new Date().getTime() > (this.lastUpdated + this.limit))),
		remove: function(url){ // {{{
			if (!this.cache)
				return this.udpate(true);
			let names = [n for ([n, v] in Iterator(this.cache.list)) if (v.url == url)];
			for (let [, name] in Iterator(names))
				delete this.cache.list[name];
			this.save();
			this.update();
		} // }}}
	};
  // }}}

	let ReadItLater = {
		api_key : (liberator.globalVariables.readitlater_api_key) ? liberator.globalVariables.readitlater_api_key : "966T6ahYgb081icU10d44byL31p5bF20" ,

		text : function(){ // {{{

		let req = new libly.Request(
			"https://text.readitlaterlist.com/v2/text" , // url
			null, // headers
			{ // options
			asynchronous:true,
			postBody:getParameterMap(
				{
				apikey   : this.api_key,
				url      : buffer.URL,
				mode     : "less",
				images   : 0,
				}
			)
			}

		);

		req.addEventListener("success",function(data){
			e(data.responseText)
		});

		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();

		}, // }}}

		get : function(state, callback){ // {{{
		// document => http://readitlaterlist.com/api/docs#get

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

		let req = new libly.Request(
			"https://readitlaterlist.com/v2/get" , // url
			null, // headers
			{ // options
			asynchronous:true,
			postBody:getParameterMap(
				{
				apikey    : this.api_key,
				username  : logins[0].username,
				password  : logins[0].password,
				format    : "json",
				count     : (liberator.globalVariables.readitlater_get_count? liberator.globalVariables.readitlater_get_count : 50 ),
				state     : state
				//tags    : (args["tags"]) ? 1 : 0,
				//myAppOnly: (args["myAppOnly"]) ? 1 : 0,
				}
			)
			}

		);

		req.addEventListener("success",function(data) callback(libly.$U.evalJson(data.responseText)));
		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();

		}, // }}}

		add : function(url,title,callback){ // {{{

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);
		let req = new libly.Request(
			"https://readitlaterlist.com/v2/add" , // url
			null, // headers
			{ // options
			asynchronous:true,
			postBody:getParameterMap(
				{
				apikey    : this.api_key,
				username  : logins[0].username,
				password  : logins[0].password,
				url       : url,
				title     : title,
				}
			)
			}

		);
		req.addEventListener("success",callback);

		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();

		}, // }}}

		send : function(urls, callback) { //{{{
		// http://readitlaterlist.com/api/docs/#send

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);

		function make_read_list(args){
			let o = {};
			for (let i = 0; i < args.length; i++) {
				o[i] = {"url":args[i]};
			};
			return JSON.stringify(o);
		}

		let req = new libly.Request(
			"https://readitlaterlist.com/v2/send" , // url
			null, // headers
			{ // options
				asynchronous:true,
				postBody:getParameterMap(
					{
					apikey    : this.api_key,
					username  : logins[0].username,
					password  : logins[0].password,
					read      : make_read_list(urls),
					}
				)
			}
		);

		var ref = this;
		req.addEventListener("success",callback);

		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();


		}, // }}}

		stats : function(){ // {{{

		let manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		let logins = manager.findLogins({},"http://readitlaterlist.com","",null);
		let req = new libly.Request(
			"https://readitlaterlist.com/v2/stats" , // url
			null, // headers
			{ // options
				asynchronous:true,
				postBody:getParameterMap(
					{
					apikey    : this.api_key,
					username  : logins[0].username,
					password  : logins[0].password,
					format    : "json",
					}
				)
			}

		);

		req.addEventListener("success",function(data){
			let res = libly.$U.evalJson(data.responseText);
			liberator.echo(
			<style type="text/css"><![CDATA[
				div.stats{font-weight:bold;text-decoration:underline;color:gold;padding-left:1em;line-height:1.5em;}
			]]></style> +
			<div>#ReadItLater Stats</div> +
			<div class="stats">
				since : {unixtimeToDate(res.user_since)} <br />
				list : {res.count_list} <br />
				unread : {res.count_unread} <br />
				read : {res.count_read} <br />
			</div>
			);
		});

		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();

		}, // }}}

		apiTest : function(){ // {{{

		let req = new libly.Request(
			"https://readitlaterlist.com/v2/api" , // url
			null, // headers
			{ // options
			asynchronous:true,
			postBody:getParameterMap(
				{
				apikey  : this.api_key,
				}
			)
			}

		);

		req.addEventListener("success",function(data){
			liberator.echo(
			<div>
				X-Limit-User-Limit : {data.transport.getResponseHeader("X-Limit-User-Limit")} <br />
				X-Limit-User-Remaining : {data.transport.getResponseHeader("X-Limit-User-Remaining")} <br />
				X-Limit-User-Reset : {data.transport.getResponseHeader("X-Limit-User-Reset")} <br />
				X-Limit-Key-Limit : {data.transport.getResponseHeader("X-Limit-Key-Limit")} <br />
				X-Limit-Key-Remaining : {data.transport.getResponseHeader("X-Limit-Key-Remaining")} <br />
				X-Limit-Key-Reset : {data.transport.getResponseHeader("X-Limit-Key-Reset")} <br />

			</div>
			);
		});

		req.addEventListener("failure",function(data){
			liberator.echoerr(data.statusText);
			liberator.echoerr(data.responseText);
		});

		req.post();

		}, // }}}

	}

	let ListCache = {
		all: new Cache({name: 'list', updater: ReadItLater.get.bind(ReadItLater, '')}),
		unread: new Cache({name: 'list', updater: ReadItLater.get.bind(ReadItLater, 'unread')})
	};

	function markAsRead(urls){ // {{{
		if(urls.length == 0)
			urls = [buffer.URL];
		for (let [, url] in Iterator(urls))
			ListCache.unread.remove(url);
		ReadItLater.send(urls, echo.bind(null, "Mark as read: " + urls.length));
	} // }}}

	function addItemByArgs(args){ // {{{
		let url = args["url"] || args.literalArg;
		let title = args["title"] || (url ? undefined : buffer.title);
		if (!url)
			url = buffer.URL;
		ReadItLater.add(url, title, function(){
			echo("Added: " + (title || url));
			ListCache.unread.update(true);
		});
	} // }}}

	function addItemByArgsWithSubstitution(args){ // {{{
		let url = args["url"] || args.literalArg;
		let title = args["title"] || (url ? undefined : buffer.title);
		if(!url)
		  url = buffer.URL;
		// habrahabr.ru
		if(url.match(/:\/\/habrahabr\.ru/))
		  args["url"] = url.replace("habrahabr.ru", "m.habrahabr.ru").replace(/\.ru\/.+\/(\d+)/, ".ru/post/$1").replace(/#habracut$/, "");
		// livejournal.ru
		if(url.match(/:\/\/.+\.livejournal\.(com|ru)/) && !url.match(/:\/\/m\.livejournal\.(com|ru)/)){
		  // blog post
		  args["url"] = url.replace(/:\/\/(.+).livejournal.com\/(\d+).html/, "://m.livejournal.com/read/user/$1/$2");
		  // theme
		  args["url"] = args["url"].replace(/www.livejournal.ru\/themes\/id\/(\d+)$/, "m.livejournal.com/themes/all/$1");
		}
		// www.trud.ru
		if(url.match(/:\/\/www.trud.ru/))
		  args["url"] = url.replace(/\.html$/, "/print");
		// lenta.ru
		if(url.match(/:\/\/lenta.ru/))
		  args["url"] = url.replace(/\/?$/, "/_Printed.htm");
	        // roem.ru
		if(url.match(/:\/\/roem.ru/) && !url.match("reom.ru/pda"))
		  args["url"] = url.replace(/\/(\?.*)?$/, "").replace(/\/\d{4}\/\d{2}\/\d{2}\/\D+(\d+)$/, "/pda/?element_id=$1");
		// www.guardian.co.uk
		if(url.match(/guardian.co.uk\//) && !url.match("print"))
		  args["url"] = url.replace(/$/, "/print");
		if(url.match("news.rambler.ru") && !url.match("m.rambler.ru"))
		  args["url"] = url.replace(/news.rambler.ru\/(\d+)\/.+/, "m.rambler.ru/news/head/$1/");
		// TODO: http://www.vedomosti.ru/politics/news/1502544/kurator_pokoleniya
		// TODO: ttp://www.vedomosti.ru/politics/print/2012/02/14/1502544
		args["title"] = title;
		addItemByArgs(args);
	} // }}}

	function echo(msg){ // {{{
		liberator.echo("[ReadItLater] " + msg);
	} // }}}

	function listCompleter(context,args){ // {{{

		function sortDate(store){
			let ary = [];
			for (let s in store){
				ary.push([s[1].time_updated,s[1]]); // 更新日でソート
			}
			ary.sort(function(a,b){return -(a[0] - b[0])});
			return ary;
		}

		context.title = ["url","title"]
		context.filters = [CompletionContext.Filter.textDescription]; // titleも補完対象にする
		context.compare = void 0;
		context.anchored = false;
		context.incomplete = true;

		ListCache[args.bang ? 'all' : 'unread'].get(function(data){
			context.completions = [
				[item.url,item.title]
				for([, item] in Iterator(data.list))
				if(
					!args.some(function (arg) arg == item.url)
				)
			];
			context.incomplete = false;
		});

	} //}}}

	function unixtimeToDate(ut) { // {{{
		var t = new Date( ut * 1000 );
		t.setTime( t.getTime() + (60*60*1000 * 9) ); // +9は日本のタイムゾーン
		return t;
	} // }}}

	function getParameterMap(parameters){ // {{{
		return [
			key + "=" + encodeURIComponent(value)
			for ([key, value] in Iterator(parameters))
			if (value)
		].join("&");
	} // }}}

  function countObjectValues(obj){ // {{{
    return [1 for (_ in Iterator(obj))].length;
  } // }}}

	// for debug {{{
	function e(v,c){
		if(c) util.copyToClipboard(v);
		liberator.log(v,-1)
	} // }}}

	// Export {{{
	__context__.ListCache = ListCache;
	__context__.API = ReadItLater;
	__context__.WrappedAPI = {
		markAsRead: markAsRead
	}
	// }}}

})();

// vim: set noet :
