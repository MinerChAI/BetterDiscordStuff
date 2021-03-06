module.exports = (Plugin, Library) => {
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
      this.options = [];
      var file;
      for (var i = 0; i < files.length; ++i) {
        file = files[i].path;
        if (file.endsWith(".css")) this.options.push({label: file.slice(0, -4), value: file});
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
