"use client";

import { useEffect, useRef } from "react";
import { sky } from "@/lib/sky";

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.,1.); }`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHour;
uniform float uLook;
uniform float uTravel;
uniform float uSteps;
uniform vec2 uMouse;

#define PI 3.14159265

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for(int i=0;i<4;i++){ v += a*noise(p); p = p*2.03 + vec2(1.7,9.2); a *= .5; }
  return v;
}

// ---------- dunas: ladera larga a barlovento, cara de avalancha abrupta ----------
float dunes(vec2 p){
  vec2 q = p*0.075;
  float w = fbm(q*0.6)*3.6;
  float s = q.x + q.y*0.42 + w;
  float f = fract(s);
  float prof = smoothstep(0.0, 0.8, f) * (1.0 - smoothstep(0.8, 1.0, f));
  prof = prof*prof*(3.0 - 2.0*prof);
  float amp = 3.4*(0.5 + 0.7*noise(q*0.45 + 3.1));
  return prof*amp + fbm(p*0.035)*2.2;
}
float ripples(vec2 p){
  float n = noise(p*0.7);
  return 0.03*sin(p.x*6.0 + p.y*2.2 + n*7.0) * (0.6 + 0.4*n);
}

vec3 sunDirection(float h){
  float a = (mod(h,24.0) - 6.0)/12.0*PI;
  return normalize(vec3(-cos(a), sin(a)*0.92, 0.55));
}

// rota v alrededor del eje k (Rodrigues)
vec3 rotAxis(vec3 v, vec3 k, float a){
  return v*cos(a) + cross(k,v)*sin(a) + k*dot(k,v)*(1.0-cos(a));
}

vec3 skyColor(vec3 rd, vec3 sd, bool stars){
  float el = sd.y;
  float day = smoothstep(-0.10, 0.22, el);
  float h = clamp(rd.y, 0.0, 1.0);
  vec3 dayC = mix(vec3(0.93,0.84,0.70), vec3(0.36,0.58,0.86), pow(h, 0.55));
  vec3 nightC = mix(vec3(0.045,0.05,0.12), vec3(0.008,0.012,0.04), pow(h, 0.45));
  vec3 col = mix(nightC, dayC, day);

  float sunAmt = max(dot(rd, sd), 0.0);
  float dusk = exp(-pow((el - 0.02)/0.14, 2.0));
  vec3 duskC = mix(vec3(1.0,0.42,0.16), vec3(0.72,0.28,0.5), smoothstep(0.0, 0.35, h));
  col = mix(col, duskC, clamp(dusk*(0.55*pow(1.0-h, 2.5) + 0.6*pow(sunAmt, 5.0)), 0.0, 1.0));
  // cinturón de Venus: banda rosa frente al ocaso
  float anti = max(dot(rd, vec3(-sd.x, 0.0, -sd.z)), 0.0);
  col += vec3(0.5,0.25,0.35)*dusk*0.25*anti*exp(-pow((h-0.12)/0.08,2.0));

  // sol
  float vis = smoothstep(-0.03, 0.01, el);
  col += vec3(1.0,0.82,0.6)*pow(sunAmt, 1400.0)*14.0*vis;
  col += vec3(1.0,0.62,0.32)*pow(sunAmt, 14.0)*0.45*(0.3 + dusk)*vis;
  col += vec3(1.0,0.85,0.6)*pow(sunAmt, 3.0)*0.08*day;

  if (stars){
    float night = 1.0 - smoothstep(-0.2, 0.0, el);
    if (night > 0.0 && rd.y > -0.05){
      // la bóveda gira con la hora alrededor del polo (latitud ~30°N)
      vec3 pole = normalize(vec3(0.0, sin(0.52), -cos(0.52)));
      vec3 d = rotAxis(rd, pole, -uHour*PI/12.0);
      vec2 sp = vec2(atan(d.z, d.x), asin(clamp(d.y,-1.0,1.0)));
      vec2 g = sp*vec2(120.0, 120.0);
      vec2 id = floor(g); vec2 f = fract(g) - 0.5;
      float r = hash(id);
      float star = 0.0;
      if (r > 0.94){
        vec2 o = (vec2(hash(id+1.7), hash(id+5.3)) - 0.5)*0.6;
        float b = (r - 0.94)/0.06;
        float tw = 0.65 + 0.35*sin(uTime*(1.5 + r*4.0) + r*30.0);
        float dd = length(f - o);
        star = (b*b*smoothstep(0.12, 0.0, dd) + b*0.02/(dd*dd*40.0 + 0.05))*tw;
      }
      vec3 starC = mix(vec3(0.75,0.82,1.0), vec3(1.0,0.86,0.68), hash(id+9.1));
      // Vía Láctea: banda alrededor de un gran círculo, con polvo oscuro
      vec3 mwN = normalize(vec3(0.62, 0.35, 0.7));
      float bd = dot(d, mwN);
      float band = exp(-pow(bd/0.16, 2.0));
      float dust = fbm(sp*vec2(9.0, 14.0) + 3.0);
      float lane = smoothstep(0.45, 0.75, fbm(sp*vec2(16.0, 22.0)))*exp(-pow(bd/0.05, 2.0));
      vec3 mw = vec3(0.8,0.77,0.95)*band*(0.26 + 0.45*dust) - vec3(0.15)*lane;
      float horizon = smoothstep(-0.02, 0.18, rd.y);
      col += (starC*star*1.6 + max(mw, 0.0))*night*horizon;
    }
  }
  return col;
}

// campo de altura: avanza con paso relajado y, al cruzar la superficie,
// interpola linealmente entre las dos últimas muestras (sin escalonado)
float march(vec3 ro, vec3 rd){
  float t = 0.3;
  float tPrev = t;
  float dPrev = (ro + rd*t).y - dunes((ro + rd*t).xz);
  for (int i = 0; i < 160; i++){
    if (float(i) >= uSteps) break;
    t += max(dPrev*0.5, 0.012*t);
    vec3 p = ro + rd*t;
    float d = p.y - dunes(p.xz);
    if (d < 0.0){
      float tt = tPrev + (t - tPrev)*dPrev/(dPrev - d);
      // un paso de refinamiento extra
      vec3 q = ro + rd*tt;
      float dq = q.y - dunes(q.xz);
      if (dq > 0.0) return tt + (t - tt)*dq/(dq - d);
      return tPrev + (tt - tPrev)*dPrev/(dPrev - dq);
    }
    tPrev = t;
    dPrev = d;
    if (t > 110.0) break;
  }
  return -1.0;
}

float softShadow(vec3 p, vec3 sd){
  float res = 1.0, t = 0.25;
  for (int i = 0; i < 20; i++){
    vec3 q = p + sd*t;
    float h = q.y - dunes(q.xz);
    res = min(res, 10.0*h/t);
    if (res < 0.0) break;
    t += clamp(h*0.6, 0.25, 2.5);
  }
  return clamp(res, 0.0, 1.0);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
  vec3 sd = sunDirection(uHour);
  float noon = smoothstep(0.55, 0.9, sd.y);
  float night = 1.0 - smoothstep(-0.2, 0.02, sd.y);

  // calima: el aire caliente ondula cerca del horizonte
  uv.x += sin(uv.y*90.0 + uTime*7.0)*0.0016*noon*smoothstep(0.12, -0.05, uv.y + 0.05);

  // cámara: avanza sobre las dunas; de noche levanta la vista
  float z = uTime*0.55 + uTravel;
  vec3 ro = vec3(sin(z*0.05)*6.0, 0.0, z);
  float gh = max(max(dunes(ro.xz), dunes(ro.xz + vec2(0.0, 5.0))), dunes(ro.xz + vec2(0.0, 10.0)));
  ro.y = gh + 2.4;
  float yaw = uMouse.x*0.22 + sin(z*0.05)*0.08;
  float pitch = -0.09 + uMouse.y*0.06 + uLook*0.62;
  vec3 fwd = normalize(vec3(sin(yaw), sin(pitch), cos(yaw)));
  vec3 right = normalize(cross(vec3(0,1,0), fwd));
  vec3 up = cross(fwd, right);
  vec3 rd = normalize(uv.x*right + uv.y*up + 1.55*fwd);

  vec3 col;
  float t = (rd.y > 0.35) ? -1.0 : march(ro, rd);
  if (t < 0.0){
    col = skyColor(rd, sd, true);
  } else {
    vec3 p = ro + rd*t;
    // la normal se mide a una escala que crece con la distancia y las rizaduras se
    // desvanecen lejos: evita el moiré en el horizonte
    float e = 0.04 + t*0.004;
    float rk = exp(-t*0.07);
    float hx = dunes(p.xz + vec2(e,0)) + rk*ripples(p.xz + vec2(e,0)) - dunes(p.xz - vec2(e,0)) - rk*ripples(p.xz - vec2(e,0));
    float hz = dunes(p.xz + vec2(0,e)) + rk*ripples(p.xz + vec2(0,e)) - dunes(p.xz - vec2(0,e)) - rk*ripples(p.xz - vec2(0,e));
    vec3 n = normalize(vec3(-hx, 2.0*e, -hz));

    vec3 sand = mix(vec3(0.86,0.58,0.34), vec3(0.93,0.7,0.47), noise(p.xz*0.3));
    sand *= 0.92 + 0.12*noise(p.xz*4.0);
    float sunUp = smoothstep(-0.04, 0.06, sd.y);
    float sh = sunUp > 0.0 ? softShadow(p + n*0.05, sd) : 0.0;
    float dif = max(dot(n, sd), 0.0)*sh*sunUp;
    vec3 sunC = mix(vec3(1.0,0.48,0.22), vec3(1.0,0.93,0.82), smoothstep(0.0, 0.45, sd.y));
    vec3 skyAmb = skyColor(vec3(0.0,1.0,0.0), sd, false);
    float bounce = max(dot(n, -sd*vec3(1,0,1)), 0.0);
    col = sand*(sunC*dif*1.9 + skyAmb*(0.42 + 0.35*n.y) + sunC*bounce*0.06*sunUp);
    // brillo especular de los granos al sol rasante
    col += sunC*pow(max(dot(reflect(rd, n), sd), 0.0), 40.0)*0.12*sh*sunUp;
    // noche sin luna: sólo la luz de las estrellas
    col += sand*vec3(0.025,0.032,0.07)*night*(0.6 + 0.4*n.y);

    // espejismo: al mediodía, la arena lejana refleja el cielo como un lago
    float mir = noon*smoothstep(28.0, 70.0, t)*smoothstep(0.03, -0.01, rd.y);
    vec3 refl = skyColor(normalize(vec3(rd.x, -rd.y + 0.004*sin(uTime*3.0 + rd.x*60.0), rd.z)), sd, false);
    col = mix(col, refl*0.95, mir*0.85);

    // polvo / perspectiva aérea
    float fog = 1.0 - exp(-t*0.022);
    vec3 fogC = skyColor(normalize(vec3(rd.x, 0.03, rd.z)), sd, false);
    col = mix(col, fogC, fog);
  }

  // gradación, viñeta, grano
  col = 1.0 - exp(-col*1.35);
  col = pow(col, vec3(0.95));
  vec2 q = gl_FragCoord.xy/uRes;
  col *= 0.72 + 0.28*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.22);
  col += (hash(gl_FragCoord.xy + fract(uTime)*91.0) - 0.5)*0.025;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
  return s;
}

export default function DesertGL() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { res: U("uRes"), time: U("uTime"), hour: U("uHour"), look: U("uLook"), travel: U("uTravel"), steps: U("uSteps"), mouse: U("uMouse") };

    // calidad adaptativa: menos resolución y pasos en pantallas pequeñas
    const small = window.innerWidth < 768;
    let scale = small ? 0.42 : 0.55;
    const steps = small ? 96 : 150;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0, last = performance.now(), slow = 0;
    const t0 = performance.now();
    let mx = 0, my = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;
      // si va lento de forma sostenida, baja la resolución una vez
      if (dt > 40) slow++;
      else slow = Math.max(0, slow - 1);
      if (slow > 90 && scale > 0.36) {
        scale -= 0.1;
        slow = 0;
        resize();
      }
      mx += (sky.mx - mx) * 0.04;
      my += (sky.my - my) * 0.04;
      const t = reduced ? 0 : (now - t0) / 1000;
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.hour, sky.hour);
      gl.uniform1f(u.look, sky.look);
      gl.uniform1f(u.travel, sky.travel);
      gl.uniform1f(u.steps, steps);
      gl.uniform2f(u.mouse, mx, -my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
