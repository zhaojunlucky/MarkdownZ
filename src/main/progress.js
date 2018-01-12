export default class ProgressUtil{
    constructor(){

    }

    static getHTMLTemplate(){
        const html = `<style>
body {
  font-family: system, -apple-system, '.SFNSText-Regular', 'SF UI Text', 'Lucida Grande', 'Segoe UI', Ubuntu, Cantarell, sans-serif;
  color: #fff;
  background-color: #8aba87;
  text-align: center;
  font-size: 40px;
}

h2 {
  padding: 0;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#close {
  color: white;
  opacity: 0.7;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  text-decoration: none;
  display: none;
}

.message{
  font-size: 20px;
}

</style>
<div class="lds-css ng-scope">
  <div style="width:100%;height:100%" class="lds-wedges">
    <div>
      <div>
        <div></div>
      </div>
      <div>
        <div></div>
      </div>
      <div>
        <div></div>
      </div>
      <div>
        <div></div>
      </div>
    </div>
  </div>
<style type="text/css">@keyframes lds-wedges {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes lds-wedges {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.lds-wedges {
  position: relative;
}
.lds-wedges > div > div {
  -webkit-transform-origin: 100px 100px;
  transform-origin: 100px 100px;
  -webkit-animation: lds-wedges 3s linear infinite;
  animation: lds-wedges 3s linear infinite;
  opacity: 0.8;
}
.lds-wedges > div > div > div {
  position: absolute;
  left: 30px;
  top: 30px;
  width: 70px;
  height: 70px;
  border-radius: 70px 0 0 0;
  -webkit-transform-origin: 100px 100px;
  transform-origin: 100px 100px;
}
.lds-wedges > div div:nth-child(1) > div {
  background: #f08d43;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
.lds-wedges > div div:nth-child(1) {
  -webkit-animation-duration: 0.75s;
  animation-duration: 0.75s;
}
.lds-wedges > div div:nth-child(2) > div {
  background: #f6eddc;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
.lds-wedges > div div:nth-child(2) {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
}
.lds-wedges > div div:nth-child(3) > div {
  background: #f9d887;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
.lds-wedges > div div:nth-child(3) {
  -webkit-animation-duration: 1.5s;
  animation-duration: 1.5s;
}
.lds-wedges > div div:nth-child(4) > div {
  background: #ab2f0c;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
.lds-wedges > div div:nth-child(4) {
  -webkit-animation-duration: 3s;
  animation-duration: 3s;
}
.lds-wedges {
  width: 128px !important;
  height: 128px !important;
  -webkit-transform: translate(-64px, -64px) scale(0.64) translate(64px, 64px);
  transform: translate(-64px, -64px) scale(0.64) translate(64px, 64px);
}
</style></div>
<span id="message" class="message">Please wait...<span>
<a id="close" href="javascript:window.close()">Close this Window</a>
<script>
    const ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.on('progress-done', (event, arg) => {
        document.getElementById('close').style.display = "inline";
    });
    ipcRenderer.on('progress-update', (event, arg) => {
        document.getElementById('message').textContent = arg;
    });
</script>`;
        return html;
    }
}