# -*- coding: utf-8 -*-
"""Regenera og-image.jpg (1200x630) en la raíz del repo. Uso: python3 tools/build_og_image.py"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTES = Path(__file__).resolve().parent / "fonts"
TINTA=(27,19,16); ROJO=(232,53,43); AMAR=(255,198,27); AZUL=(31,111,208)
CIELO=(201,233,255); PAPEL=(255,253,246); VERDE=(35,177,93)

def castle(d, ox, oy, s):
    L=lambda v: v*s
    d.line([ox+L(15.5),oy+L(26),ox+L(15.5),oy+L(10)],fill=TINTA,width=max(2,int(L(2.5))))
    d.polygon([(ox+L(15.5),oy+L(11)),(ox+L(29),oy+L(15)),(ox+L(15.5),oy+L(19))],fill=ROJO,outline=TINTA,width=max(2,int(L(2))))
    d.line([ox+L(68.5),oy+L(26),ox+L(68.5),oy+L(10)],fill=TINTA,width=max(2,int(L(2.5))))
    d.polygon([(ox+L(68.5),oy+L(11)),(ox+L(55),oy+L(15)),(ox+L(68.5),oy+L(19))],fill=AMAR,outline=TINTA,width=max(2,int(L(2))))
    d.arc([ox+L(23),oy+L(29),ox+L(61),oy+L(63)],180,360,fill=TINTA,width=int(L(13)))
    d.arc([ox+L(23),oy+L(29),ox+L(61),oy+L(63)],180,360,fill=AMAR,width=int(L(7)))
    for tx in (8,61):
        d.rounded_rectangle([ox+L(tx),oy+L(26),ox+L(tx+15),oy+L(60)],radius=L(7),fill=AZUL,outline=TINTA,width=int(L(4)))
    d.rounded_rectangle([ox+L(4),oy+L(54),ox+L(80),oy+L(78)],radius=L(9),fill=ROJO,outline=TINTA,width=int(L(4)))
    d.rounded_rectangle([ox+L(34),oy+L(62),ox+L(50),oy+L(78)],radius=L(7),fill=TINTA)

W,H = 1200,630
im = Image.new('RGB',(W,H),CIELO); d = ImageDraw.Draw(im)
for (cx,cy,r) in [(180,560,120),(1030,80,90),(620,40,60)]:
    d.ellipse([cx-r,cy-r,cx+r,cy+r], fill=(255,255,255))
castle(d, 90, 52, 3.4)

bagel120 = ImageFont.truetype(str(FUENTES/"bagel.ttf"),120)
asc120,_ = bagel120.getmetrics()
d.text((96,448-asc120),"Astefil",font=bagel120,fill=AMAR,stroke_width=10,stroke_fill=TINTA)
d.text((88,440-asc120),"Astefil",font=bagel120,fill=ROJO,stroke_width=10,stroke_fill=TINTA)
baloo40 = ImageFont.truetype(str(FUENTES/"baloo800.ttf"),40)
x=92
for ch in "INFLABLES":
    d.text((x,470),ch,font=baloo40,fill=AZUL); x+=d.textlength(ch,font=baloo40)+12

baloo44 = ImageFont.truetype(str(FUENTES/"baloo800.ttf"),44)
txt="WhatsApp 11 6226-3170"; tw=d.textlength(txt,font=baloo44)
px0,py0,pw,ph = 88,548,int(tw)+72,66
d.rounded_rectangle([px0+8,py0+8,px0+pw+8,py0+ph+8],radius=ph//2,fill=TINTA)
d.rounded_rectangle([px0,py0,px0+pw,py0+ph],radius=ph//2,fill=VERDE,outline=TINTA,width=5)
d.text((px0+36,py0+ph//2-27),txt,font=baloo44,fill=(255,255,255))

photo = Image.open(RAIZ/"public"/"img"/"hero.jpg").resize((330,440),Image.LANCZOS)
card = Image.new('RGBA',(330+28+8, 440+28+22+8),(0,0,0,0))
cd = ImageDraw.Draw(card)
cd.rounded_rectangle([8,8,8+330+28,8+440+28+22],radius=14,fill=TINTA)
cd.rounded_rectangle([0,0,330+28,440+28+22],radius=14,fill=PAPEL,outline=TINTA,width=5)
card.paste(photo,(14,14)); cd.rectangle([14,14,14+330,14+440],outline=TINTA,width=4)
cd.rectangle([120,0,240,26],fill=(255,198,27,235),outline=TINTA,width=3)
card = card.rotate(-5,expand=True,resample=Image.BICUBIC)
im.paste(card,(W-56-card.size[0],(H-card.size[1])//2),card)

out = RAIZ/"public"/"og-image.jpg"
im.save(out,quality=82,optimize=True)
print("OK →", out)
