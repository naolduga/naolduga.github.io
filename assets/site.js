// Shared by the blog pages: theme toggle (light by default) and the contour background.
(function(){
  var root=document.documentElement, btns=document.querySelectorAll('.theme-btn');
  function sync(){
    var dark=root.dataset.theme==='dark';
    btns.forEach(function(b){b.textContent=dark?'☼':'☾';b.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');});
  }
  btns.forEach(function(b){b.addEventListener('click',function(){
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('theme',root.dataset.theme);}catch(e){}
    sync();document.dispatchEvent(new Event('themechange'));
  });});
  sync();
})();
  // Topographic background. Seeded noise, so the same "terrain" every visit.
  (function(){
    function noise(seed){
      var p=new Uint8Array(512),r=seed;for(var i=0;i<256;i++)p[i]=i;
      for(i=255;i>0;i--){r=(r*16807)%2147483647;var j=r%(i+1),t=p[i];p[i]=p[j];p[j]=t;}
      for(i=0;i<256;i++)p[i+256]=p[i];
      function f(t){return t*t*(3-2*t)}
      function h(x,y){return p[p[x&255]+(y&255)]/255}
      function n(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=f(xf),v=f(yf);
        var a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);
        return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
      return function(x,y){return n(x,y)*.55+n(x*2.1+7,y*2.1+3)*.28+n(x*4.3+11,y*4.3+5)*.17;};
    }
    var field=noise(1975);
    function draw(cv,minor,major,scale,offY){
      var dpr=Math.min(window.devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;
      if(!w||!h)return;
      cv.width=w*dpr;cv.height=h*dpr;var c=cv.getContext('2d');c.scale(dpr,dpr);
      var step=7,cols=Math.ceil(w/step)+1,rows=Math.ceil(h/step)+1,v=new Float32Array(cols*rows);
      for(var y=0;y<rows;y++)for(var x=0;x<cols;x++)v[y*cols+x]=field(x*step/scale,(y*step+offY)/scale);
      var levels=22;
      for(var L=1;L<levels;L++){
        var t=L/levels;c.beginPath();
        for(y=0;y<rows-1;y++)for(x=0;x<cols-1;x++){
          var a=v[y*cols+x],b=v[y*cols+x+1],d=v[(y+1)*cols+x],e=v[(y+1)*cols+x+1];
          var k=(a>t?8:0)|(b>t?4:0)|(e>t?2:0)|(d>t?1:0);if(k===0||k===15)continue;
          var X=x*step,Y=y*step,pts=[];
          function lerp(p,q){return (t-p)/(q-p)}
          if((a>t)!==(b>t))pts.push([X+step*lerp(a,b),Y]);
          if((b>t)!==(e>t))pts.push([X+step,Y+step*lerp(b,e)]);
          if((d>t)!==(e>t))pts.push([X+step*lerp(d,e),Y+step]);
          if((a>t)!==(d>t))pts.push([X,Y+step*lerp(a,d)]);
          for(var i=0;i+1<pts.length;i+=2){c.moveTo(pts[i][0],pts[i][1]);c.lineTo(pts[i+1][0],pts[i+1][1]);}
        }
        var idx=L%5===0;c.strokeStyle=idx?major:minor;c.lineWidth=idx?1.1:.7;c.stroke();
      }
    }
    var bg=document.getElementById('topo'),band=document.querySelector('.topo-band'),lastW=0;
    function render(force){
      if(!force&&window.innerWidth===lastW)return;lastW=window.innerWidth;
      var dk=document.documentElement.dataset.theme==='dark';
      draw(bg,dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)',dk?'rgba(255,255,255,.12)':'rgba(0,0,0,.12)',260,0);
      if(band)draw(band,'rgba(226,166,42,.10)','rgba(226,166,42,.22)',220,900);
    }
    render(true);document.addEventListener('themechange',function(){render(true);});var to;window.addEventListener('resize',function(){clearTimeout(to);to=setTimeout(render,150);});
  })();

// Menu: collapses on small screens, closes on choice, Escape or outside tap.
(function(){
  var nav=document.querySelector('.topnav'),btn=nav&&nav.querySelector('.menu-btn');if(!btn)return;
  function setOpen(o){nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.textContent=o?'Close':'Menu';}
  btn.addEventListener('click',function(){setOpen(!nav.classList.contains('open'));});
  nav.querySelectorAll('ul a, .mark').forEach(function(a){a.addEventListener('click',function(){setOpen(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){setOpen(false);btn.focus();}});
  document.addEventListener('click',function(e){if(nav.classList.contains('open')&&!nav.contains(e.target))setOpen(false);});
})();
