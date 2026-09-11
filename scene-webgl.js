(() => {
  const canvas = document.querySelector('#bellebrume-stage');
  const whisper = document.querySelector('.scene-whisper');
  const root = document.querySelector('.cover');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return;

  const vert = `
    attribute vec2 a_pos; attribute vec2 a_uv;
    uniform vec2 u_center; uniform vec2 u_size; uniform vec2 u_shift;
    uniform vec4 u_uvrect; uniform float u_turn;
    varying vec2 v_uv;
    void main(){
      float c=cos(u_turn), s=sin(u_turn);
      vec2 p=vec2(a_pos.x*c-a_pos.y*s,a_pos.x*s+a_pos.y*c);
      gl_Position=vec4(p*u_size+u_center+u_shift,0.,1.);
      v_uv=u_uvrect.xy+a_uv*u_uvrect.zw;
    }`;
  const frag = `
    precision mediump float; varying vec2 v_uv;
    uniform sampler2D u_tex; uniform float u_alpha;
    void main(){ vec4 c=texture2D(u_tex,v_uv); gl_FragColor=vec4(c.rgb,c.a*u_alpha); }`;
  const shader = (type, src) => { const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s; };
  const program=gl.createProgram(); gl.attachShader(program,shader(gl.VERTEX_SHADER,vert)); gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag)); gl.linkProgram(program); gl.useProgram(program);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, -1,1,0,1, 1,-1,1,0, 1,1,1,1]),gl.STATIC_DRAW);
  const stride=16;
  const pos=gl.getAttribLocation(program,'a_pos'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,stride,0);
  const uv=gl.getAttribLocation(program,'a_uv'); gl.enableVertexAttribArray(uv); gl.vertexAttribPointer(uv,2,gl.FLOAT,false,stride,8);
  const loc=n=>gl.getUniformLocation(program,n);
  const U={center:loc('u_center'),size:loc('u_size'),shift:loc('u_shift'),uv:loc('u_uvrect'),turn:loc('u_turn'),alpha:loc('u_alpha')};

  function texture(src){ const t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])); const im=new Image(); im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);t.ready=true;t.ratio=im.width/im.height;}; im.src=src; return t; }
  const bg=texture('assets/bellebrume-collage.png');
  const collage=texture('assets/collage-opening.png');
  const rect=(x,y,w,h)=>[x/1672,1-(y+h)/941,w/1672,h/941];
  const pieces=[
    {name:'window',c:[-.56,.34],s:[.34,.43],uv:rect(100,10,610,430),depth:.28},
    {name:'laundry',c:[.48,.48],s:[.48,.30],uv:rect(790,10,850,430),depth:.18},
    {name:'leaves',c:[-.72,-.58],s:[.47,.47],uv:rect(20,420,790,500),depth:.48},
    {name:'pot',c:[.72,-.55],s:[.22,.32],uv:rect(1300,470,350,450),depth:.4},
    {name:'light',c:[.08,.03],s:[.10,.13],uv:rect(800,380,210,230),depth:.22}
  ];
  let pointer={x:0,y:0}, seen=false, born=performance.now();
  const resize=()=>{ const d=Math.min(devicePixelRatio,2); canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height);}; resize(); addEventListener('resize',resize);
  addEventListener('pointermove',e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;});
  canvas.addEventListener('pointerdown',e=>{
    const x=e.clientX/innerWidth*2-1, y=1-e.clientY/innerHeight*2;
    if(x>-0.9&&x<-.2&&y>.05&&y<.78&&!seen){
      seen=true; localStorage.setItem('bellebrume-window','seen');
      whisper.textContent='La personne te voit. Elle referme doucement la fenêtre. Quelque part, une porte vient de s’ouvrir.';
      whisper.classList.add('visible');
      document.querySelector('.invitation').textContent='Quelqu’un sait maintenant que tu es arrivé.';
      document.querySelector('.enter span').textContent='Suivre la porte ouverte';
      setTimeout(()=>whisper.classList.remove('visible'),5200);
    }
  });
  function draw(tex, center, size, uvrect=[0,0,1,1], shift=[0,0], turn=0, alpha=1){ if(!tex.ready)return; gl.bindTexture(gl.TEXTURE_2D,tex); gl.uniform2fv(U.center,center);gl.uniform2fv(U.size,size);gl.uniform2fv(U.shift,shift);gl.uniform4fv(U.uv,uvrect);gl.uniform1f(U.turn,turn);gl.uniform1f(U.alpha,alpha);gl.drawArrays(gl.TRIANGLES,0,6); }
  function frame(now){
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const aspect=innerWidth/innerHeight, imageAspect=1.7778; let sx=1,sy=1; if(aspect>imageAspect) sy=aspect/imageAspect; else sx=imageAspect/aspect;
    draw(bg,[0,0],[sx,sy],[0,0,1,1],[-pointer.x*.012,pointer.y*.009]);
    const t=(now-born)/1000;
    pieces.forEach(p=>{
      let sway=Math.sin(t*(p.name==='laundry'?1.25:.48)+p.depth*8)*.006;
      let alpha=1, turn=sway;
      if(p.name==='window'){
        const intro=Math.min(1,Math.max(0,(t-1.2)/1.4)); alpha=seen?Math.max(0,1-(t-(performance.now()-born)/1000)*0):intro;
        if(seen){ const since=(now-window.seenAt||now)/1000; alpha=Math.max(0,1-since); }
      }
      if(p.name==='light') alpha=.7+Math.sin(t*2.1)*.18;
      draw(collage,p.c,p.s,p.uv,[pointer.x*p.depth*.07,-pointer.y*p.depth*.05],turn,alpha);
    });
    requestAnimationFrame(frame);
  }
  canvas.addEventListener('pointerdown',()=>{ if(seen&&!window.seenAt) window.seenAt=performance.now(); },{once:true});
  requestAnimationFrame(frame);

  let ambience;
  document.querySelector('.sound').addEventListener('click', e=>setTimeout(()=>{
    if(e.currentTarget.getAttribute('aria-pressed')!=='true' || ambience) return;
    const ac=new (window.AudioContext||window.webkitAudioContext)();
    const gain=ac.createGain(), filter=ac.createBiquadFilter(), noise=ac.createBufferSource();
    const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=b.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*.18;
    noise.buffer=b;noise.loop=true;filter.type='lowpass';filter.frequency.value=420;gain.gain.value=.045;noise.connect(filter).connect(gain).connect(ac.destination);noise.start();ambience={ac,gain};
  },0));
})();
