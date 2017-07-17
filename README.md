# rmi.js
通用的远程方法调库，支持 Node 及 Browser。

## Dependence
* promise  
	rmi.js 依赖 promise 实现，请确保使用环境已支持 promise。

## Quick Start
1. index.html

在主页面里添加一个 `<iframe>`，设置其 `id`（用作通信ID）

```
<iframe id="iframe-page" src="iframe.html">
<script src="rmi.js/rmi.js"></script>
<script src="rmi.js/MainframeBridge.js"></script>
<script>
var server = rmi.create('mainframe', {
  // 添加 api
  'message': function (msg) {
    console.log('Receive message: ', msg);
    return 'response';
  }
});
server.pipe(new MainframeBridge());
</script>
```

2. iframe.html
```
<script src="rmi.js/rmi.js"></script>
<script src="rmi.js/IframeBridge.js"></script>
<script>
var client = rmi.create('iframe-page');
client.pipe(new IframeBridge());

// 调用 index.html 的 api
client.invoke('mainframe', 'message', 'hello').then(function (res) {
  console.log('Receive from mainframe: ', res);
});
</script>
```

## Demo
* [iframe](https://duoani.github.io/rmi.js/examples/iframe/)
