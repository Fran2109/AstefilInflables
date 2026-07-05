# -*- coding: utf-8 -*-
"""Regenera marketing/flyer-astefil.{png,pdf} (A5 300dpi) con QR a la URL del sitio.
Incluye auditoría automática de solapamientos/márgenes: si una edición rompe el layout, falla.
Uso: python3 tools/build_flyer.py"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import qrcode

URL_SITIO = "https://fran2109.github.io/astefil-inflables/"   # ← actualizar si cambia el dominio

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = Path(__file__).resolve().parent / "fonts"
TINTA=(27,19,16); ROJO=(232,53,43); AMAR=(255,198,27); AZUL=(31,111,208)
CIELO=(201,233,255); PAPEL=(255,253,246); VERDE=(35,177,93); ROSA=(255,122,162)
W,H,M = 1748,2480,130
boxes = {}

im = Image.new('RGB',(W,H),CIELO); d = ImageDraw.Draw(im)
for (cx,cy,r) in [(260,240,190),(1500,180,150),(880,2380,220),(1690,1500,160)]:
    d.ellipse([cx-r,cy-r,cx+r,cy+r], fill=(255,255,255))

def castle(d, ox, oy, s):
    L=lambda v: v*s
    d.line([ox+L(15.5),oy+L(26),ox+L(15.5),oy+L(10)],fill=TINTA,width=int(L(2.5)))
    d.polygon([(ox+L(15.5),oy+L(11)),(ox+L(29),oy+L(15)),(ox+L(15.5),oy+L(19))],fill=ROJO,outline=TINTA,width=int(L(2)))
    d.line([ox+L(68.5),oy+L(26),ox+L(68.5),oy+L(10)],fill=TINTA,width=int(L(2.5)))
    d.polygon([(ox+L(68.5),oy+L(11)),(ox+L(55),oy+L(15)),(ox+L(68.5),oy+L(19))],fill=AMAR,outline=TINTA,width=int(L(2)))
    d.arc([ox+L(23),oy+L(29),ox+L(61),oy+L(63)],180,360,fill=TINTA,width=int(L(13)))
    d.arc([ox+L(23),oy+L(29),ox+L(61),oy+L(63)],180,360,fill=AMAR,width=int(L(7)))
    for tx in (8,61):
        d.rounded_rectangle([ox+L(tx),oy+L(26),ox+L(tx+15),oy+L(60)],radius=L(7),fill=AZUL,outline=TINTA,width=int(L(4)))
    d.rounded_rectangle([ox+L(4),oy+L(54),ox+L(80),oy+L(78)],radius=L(9),fill=ROJO,outline=TINTA,width=int(L(4)))
    d.rounded_rectangle([ox+L(34),oy+L(62),ox+L(50),oy+L(78)],radius=L(7),fill=TINTA)

bagel = lambda s: ImageFont.truetype(str(FUENTES/'bagel.ttf'), s)
baloo = lambda s: ImageFont.truetype(str(FUENTES/'baloo800.ttf'), s)
fred  = lambda s: ImageFont.truetype(str(FUENTES/'fredoka500.ttf'), s)

castle(d, 140, 118, 6.0); boxes['castillo'] = (152, 166, 632, 598)
f170 = bagel(170); asc170,_ = f170.getmetrics()
wA = d.textlength("Astefil", font=f170)
d.text((700,458-asc170),"Astefil",font=f170,fill=AMAR,stroke_width=12,stroke_fill=TINTA)
d.text((690,448-asc170),"Astefil",font=f170,fill=ROJO,stroke_width=12,stroke_fill=TINTA)
boxes['wordmark'] = (678, 300, int(690+wA+24), 474)
f62 = baloo(62); x=698
for ch in "INFLABLES":
    d.text((x,492),ch,font=f62,fill=AZUL); x+=d.textlength(ch,font=f62)+20
boxes['inflables'] = (698, 492, int(x), 572)

def titular(texto, size, fill, baseline):
    f = bagel(size); asc,_ = f.getmetrics()
    w = d.textlength(texto, font=f)
    x0 = (W-w)//2
    d.text((x0+10, baseline+10-asc), texto, font=f, fill=AMAR, stroke_width=14, stroke_fill=TINTA)
    d.text((x0,    baseline-asc),    texto, font=f, fill=fill, stroke_width=14, stroke_fill=TINTA)
    top = baseline - asc + int(20*size/52) - 16
    bot = baseline + int((62/52-68/58)*size) + 26
    return (int(x0)-16, top, int(x0+w)+26, bot)
boxes['titular1'] = titular("¡QUE SALTE", 225, ROJO, 895)
boxes['titular2'] = titular("LA FIESTA!", 225, AZUL, 1160)

photo = Image.open(RAIZ/'public'/'img'/'hero.jpg').resize((560,746),Image.LANCZOS)
cw,ch2 = 600, 816
card = Image.new('RGBA',(cw+18,ch2+18),(0,0,0,0)); cd = ImageDraw.Draw(card)
cd.rounded_rectangle([18,18,18+cw,18+ch2],radius=18,fill=TINTA)
cd.rounded_rectangle([0,0,cw,ch2],radius=18,fill=PAPEL,outline=TINTA,width=7)
card.paste(photo,(20,20)); cd.rectangle([20,20,580,766],outline=TINTA,width=6)
cd.rectangle([cw//2-95,0,cw//2+95,42],fill=(255,198,27,235),outline=TINTA,width=4)
card = card.rotate(-3,expand=True,resample=Image.BICUBIC)
im.paste(card,(140,1206),card)
boxes['polaroid'] = (140,1206,140+card.size[0],1206+card.size[1])

chips = [("CASTILLOS",ROJO),("CON RAMPA",AZUL),("OBSTÁCULOS",ROSA),("ACUÁTICOS",VERDE)]
f52 = baloo(52); y = 1272
for i,(t,c) in enumerate(chips):
    x0 = 920 + (0 if i%2==0 else 46)
    tw = d.textlength(t,font=f52); pw, ph = int(tw)+84, 100
    d.rounded_rectangle([x0+10,y+10,x0+pw+10,y+ph+10],radius=ph//2,fill=TINTA)
    d.rounded_rectangle([x0,y,x0+pw,y+ph],radius=ph//2,fill=c,outline=TINTA,width=6)
    d.text((x0+42,y+ph//2-34),t,font=f52,fill=(255,255,255))
    boxes['chip%d'%i] = (x0,y,x0+pw+10,y+ph+10)
    y += ph + 30

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
qr.add_data(URL_SITIO); qr.make(fit=True)
qim = qr.make_image(fill_color="#1B1310", back_color="white").convert('RGB').resize((330,330), Image.NEAREST)
scw, sch = 420, 505
st = Image.new('RGBA',(scw+16,sch+16),(0,0,0,0)); sd = ImageDraw.Draw(st)
sd.rounded_rectangle([16,16,16+scw,16+sch],radius=20,fill=TINTA)
sd.rounded_rectangle([0,0,scw,sch],radius=20,fill=(255,255,255),outline=TINTA,width=7)
st.paste(qim,((scw-330)//2,34))
fb36 = baloo(36); t1="ESCANEÁ Y COTIZÁ"; sd.text(((scw-sd.textlength(t1,font=fb36))//2,392),t1,font=fb36,fill=TINTA)
ff30 = fred(30); t2="tu fecha por WhatsApp"; sd.text(((scw-sd.textlength(t2,font=ff30))//2,444),t2,font=ff30,fill=(90,74,65))
st = st.rotate(3,expand=True,resample=Image.BICUBIC)
qx, qy = W-M-st.size[0], 2350-st.size[1]
im.paste(st,(qx,qy),st)
boxes['qr'] = (qx,qy,qx+st.size[0],qy+st.size[1])

fl = baloo(42); d.text((146,2086),"WHATSAPP",font=fl,fill=TINTA)
boxes['walabel']=(146,2086,146+int(d.textlength("WHATSAPP",font=fl)),2140)
f74 = baloo(74); num="11 6226-3170"; nw=d.textlength(num,font=f74)
pw,ph = int(nw)+96, 116
d.rounded_rectangle([150,2166,150+pw,2166+ph],radius=ph//2,fill=TINTA)
d.rounded_rectangle([140,2156,140+pw,2156+ph],radius=ph//2,fill=VERDE,outline=TINTA,width=7)
d.text((140+48,2156+ph//2-48),num,font=f74,fill=(255,255,255))
boxes['wapill']=(140,2156,150+pw,2166+ph)
fig = fred(42); ig="@astefil.inflables"
d.text((146,2296),ig,font=fig,fill=TINTA)
boxes['ig']=(146,2296,146+int(d.textlength(ig,font=fig)),2350)

conf = [(250,660,'sq',AMAR),(1480,655,'ci',AZUL),(842,1500,'ci',ROJO),(1560,1210,'sq',AMAR),(770,2195,'ci',AZUL),(1000,2230,'sq',ROSA)]
for i,(cx,cy,k,c) in enumerate(conf):
    if k=='sq': d.rectangle([cx,cy,cx+26,cy+26],fill=c,outline=TINTA,width=4)
    else: d.ellipse([cx,cy,cx+26,cy+26],fill=c,outline=TINTA,width=4)
    boxes['conf%d'%i]=(cx-4,cy-4,cx+30,cy+30)

# --- auditoría ---
names = list(boxes); fails = []
for n,(x0,y0,x1,y1) in boxes.items():
    if x0<M-12 or y0<M-16 or x1>W-M+12 or y1>H-M+12: fails.append(('MARGEN',n,boxes[n]))
def solapa(a,b,gap=14):
    return not (a[2]+gap<=b[0] or b[2]+gap<=a[0] or a[3]+gap<=b[1] or b[3]+gap<=a[1])
skip = {('castillo','wordmark'),('wordmark','inflables')}
for i in range(len(names)):
    for j in range(i+1,len(names)):
        a,b = names[i],names[j]
        if (a,b) in skip or (b,a) in skip: continue
        if solapa(boxes[a],boxes[b]): fails.append(('SOLAPE',a,b))
if fails:
    raise SystemExit("Auditoría FALLÓ: %r" % fails)

out = RAIZ/'marketing'
out.mkdir(exist_ok=True)
im.save(out/'flyer-astefil.png', optimize=True)
im.save(out/'flyer-astefil.pdf', resolution=300.0)
print("Auditoría LIMPIA. OK →", out/'flyer-astefil.png', "y .pdf")
