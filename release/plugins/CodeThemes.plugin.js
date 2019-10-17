//META{"name":"CodeThemes","displayName":"CodeThemes","website":"https://github.com/dev-cats/BetterDiscordStuff/blob/master/release/CodeThemes.plugin.js","source":"https://raw.githubusercontent.com/dev-cats/BetterDiscordStuff/master/release/CodeThemes.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var CodeThemes = (() => {
	if (!global.ZLibrary && !global.ZLibraryPromise) global.ZLibraryPromise = new Promise((resolve, reject) => {
		require("request").get({url: "https://rauenzi.github.io/BDPluginLibrary/release/ZLibrary.js", timeout: 10000}, (err, res, body) => {
			if (err || 200 !== res.statusCode) return reject(err || res.statusMessage);
			try {const vm = require("vm"), script = new vm.Script(body, {displayErrors: true}); resolve(script.runInThisContext());}
			catch(err) {reject(err);}
		});
	});
	const config = {"info":{"name":"CodeThemes","authors":[{"name":"Mr_ChAI","discord_id":"426757590022881290","github_username":"MinerChAI"}],"version":"0.0.1","description":"A plugin to switch your codeblocks themes","github":"https://github.com/dev-cats/BetterDiscordStuff/blob/master/release/CodeThemes.plugin.js","github_raw":"https://raw.githubusercontent.com/dev-cats/BetterDiscordStuff/master/release/CodeThemes.plugin.js"},"main":"index.js"};
	const compilePlugin = ([Plugin, Api]) => {
		const plugin = (Plugin, Library) => {
  const {Patcher, Logger, Settings} = Library;
  return class ExamplePlugin extends Plugin {
    httpGet(url) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", url, false);
      xmlHttp.send(null);
      return xmlHttp.responseText;
    }
    constructor() {
      super();
      this.defaultSettings = {};
      var url = "https://api.github.com/repos/highlightjs/highlight.js/git/trees/master";
      var tree = JSON.parse(this.httpGet(url)).tree;
      Logger.log(tree);
      for (var i = 0; i < tree.length; ++i) if (tree[i].path == "src") {
        url = tree[i].url;
        break;
      }
      tree = JSON.parse(this.httpGet(url)).tree;
      Logger.log(tree);
      for (var i = 0; i < tree.length; ++i) if (tree[i].path == "styles") {
        url = tree[i].url;
        break;
      }
      var files = JSON.parse(this.httpGet(url)).tree;
      Logger.log(files);
      var names = {monokai: "Monokai"};
      this.options = [];
      var file;
      for (var i = 0; i < files.length; ++i) {
        file = files[i].path;
        if (file.endsWith(".css")) this.options.push({label: (file in names? names[file] : file.slice(0, -4)), value: file});
      }
    }

    htmlToElement (html) {
      if (!html || !html.trim()) return null;
      let template = document.createElement('template');
      try {template.innerHTML = html.replace(/(?<!pre)>[\t\r\n]+<(?!pre)/g, "><");}
      catch (err) {template.innerHTML = html.replace(/>[\t\r\n]+<(?!pre)/g, "><");}
      if (template.content.childElementCount == 1) return template.content.firstElementChild;
      else {
        var wrapper = document.createElement("span");
        var nodes = Array.from(template.content.childNodes);
        while (nodes.length) wrapper.appendChild(nodes.shift());
        return wrapper;
      }
    }

    updateTheme(){
      var baseURL = "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles";
      $("#CodeThemes").remove();
      Logger.log("Updating theme to " + this.settings.option);
      $("body").append($("<style>", {id: "CodeThemes",text: this.httpGet(`${baseURL}/${this.settings.option}`).replace(".hljs", "#app-mount .hljs").replace("url(./", `url(${baseURL}/`)}));
    }

    onStart() {
      Patcher.before(Logger, "log", (t, a) => {
        a[0] = "Patched Message: " + a[0];
      });
      this.updateTheme();
    }

    onStop() {
      $("#CodeThemes").remove();
      Patcher.unpatchAll();
    }


    getSettingsPanel() {
      return Settings.SettingPanel.build(this.saveSettings.bind(this),
        new Settings.Dropdown("Theme", "Theme to use", this.settings.option, this.options, (e) => {this.settings.option = e; this.updateTheme();}, {searchable: true}),
        this.htmlToElement('<pre><code class="hljs js"><span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">$initHighlight</span>(<span class="hljs-params">block, cls</span>) </span>{<br/>  <span class="hljs-keyword">try</span> {<br/>    <span class="hljs-keyword">if</span> (cls.search(<span class="hljs-regexp">/\\bno\\-highlight\\b</span>) != <span class="hljs-number">-1</span>)<br/>      <span class="hljs-keyword">return</span> process(block, <span class="hljs-literal">true</span>, <span class="hljs-number">0x0F</span>) +<br/>             <span class="hljs-string">` class="<span class="hljs-subst">${cls}</span>"`</span>;<br/>  } <span class="hljs-keyword">catch</span> (e) {<br/>    <span class="hljs-comment">/* handle exception */</span><br/>  }<br/>  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span> / <span class="hljs-number">2</span>; i &lt; classes.length; i++) {<br/>    <span class="hljs-keyword">if</span> (checkCondition(classes[i]) === <span class="hljs-literal">undefined</span>)<br/>      <span class="hljs-built_in">console</span>.log(<span class="hljs-string">\'undefined\'</span>);<br/>  }<br/><br/>  <span class="hljs-keyword">return</span> (<br/>    <span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span><br/>      <span class="hljs-tag">&lt;<span class="hljs-name">web-component</span>&gt;</span>{block}<span class="hljs-tag">&lt;/<span class="hljs-name">web-component</span>&gt;</span><br/>    <span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span><br/>  )<br/>}<br/><br/>export  $initHighlight;</span></code></pre>')
      );
    }
  };
};
		return plugin(Plugin, Api);
	};
	
	return !global.ZLibrary ? class {
		getName() {return config.info.name.replace(" ", "");} getAuthor() {return config.info.authors.map(a => a.name).join(", ");} getDescription() {return config.info.description;} getVersion() {return config.info.version;} stop() {}
		showAlert() {window.BdApi.alert("Loading Error",`Something went wrong trying to load the library for the plugin. You can try using a local copy of the library to fix this.<br /><br /><a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}
		async load() {
			try {await global.ZLibraryPromise;}
			catch(err) {return this.showAlert();}
			const vm = require("vm"), plugin = compilePlugin(global.ZLibrary.buildPlugin(config));
			try {new vm.Script(plugin, {displayErrors: true});} catch(err) {return bdpluginErrors.push({name: this.getName(), file: this.getName() + ".plugin.js", reason: "Plugin could not be compiled.", error: {message: err.message, stack: err.stack}});}
			global[this.getName()] = plugin;
			try {new vm.Script(`new global["${this.getName()}"]();`, {displayErrors: true});} catch(err) {return bdpluginErrors.push({name: this.getName(), file: this.getName() + ".plugin.js", reason: "Plugin could not be constructed", error: {message: err.message, stack: err.stack}});}
			bdplugins[this.getName()].plugin = new global[this.getName()]();
			bdplugins[this.getName()].plugin.load();
		}
		async start() {
			try {await global.ZLibraryPromise;}
			catch(err) {return this.showAlert();}
			bdplugins[this.getName()].plugin.start();
		}
	} : compilePlugin(global.ZLibrary.buildPlugin(config));
})();
/*@end@*/