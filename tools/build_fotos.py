# -*- coding: utf-8 -*-
"""Genera las variantes WebP responsive de las fotos. Uso: python tools/build_fotos.py

Las fotos de `public/img/` son masters de ~1800px pensados para el lightbox,
pero se sirven tal cual como miniaturas de ~330px en la grilla de /quinta: un
sobre-servido de ~6x en desktop y ~12x en un celular, que es justo el
dispositivo con el que la clienta abre el sitio. Este script produce, para cada
master, tres anchos en WebP; el JPEG original queda como fallback dentro del
`<picture>`.

También escribe `src/data/imagenes.ts` con las medidas intrínsecas de cada
master. Así cada `<img>` puede declarar `width`/`height` sin hardcodear nada y
el navegador reserva el espacio antes de que la imagen baje (CLS cero).

Es idempotente: salta lo que ya está al día según la fecha de modificación.
Con `--forzar` regenera todo igual.
"""
from pathlib import Path
import sys

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PUBLIC = RAIZ / "public"
SALIDA_TS = RAIZ / "src" / "data" / "imagenes.ts"

# Anchos de `srcset`. 400 cubre la miniatura en móvil, 800 la miniatura en
# pantallas densas y la foto mediana, 1440 el lightbox. Más arriba de 1440 es
# desperdicio: nadie mira estas fotos en un monitor de cine.
ANCHOS = (400, 800, 1440)
CALIDAD_WEBP = 78

# Qué carpetas mirar. Se listan explícitas para no tocar por accidente el
# favicon, el og-image ni assets que no son fotos de contenido.
CARPETAS = [PUBLIC / "img" / "quinta"]
SUELTAS = [PUBLIC / "img" / "hero.jpg"]

FORZAR = "--forzar" in sys.argv


def masters() -> list[Path]:
    """Los JPEG originales, ordenados para que la salida sea determinística."""
    encontrados: list[Path] = []
    for carpeta in CARPETAS:
        if carpeta.is_dir():
            encontrados += [p for p in carpeta.glob("*.jpg") if not es_variante(p)]
    encontrados += [p for p in SUELTAS if p.is_file()]
    return sorted(encontrados)


def es_variante(p: Path) -> bool:
    """¿Es una salida nuestra (`casa-800.webp`) y no un master?"""
    tallo = p.stem.rsplit("-", 1)
    return len(tallo) == 2 and tallo[1].isdigit()


def al_dia(destino: Path, origen: Path) -> bool:
    return (
        not FORZAR
        and destino.exists()
        and destino.stat().st_mtime >= origen.stat().st_mtime
    )


def generar(master: Path) -> tuple[int, int, int]:
    """Escribe las variantes de un master. Devuelve (ancho, alto, bytes nuevos)."""
    with Image.open(master) as im:
        im = im.convert("RGB")
        w0, h0 = im.size
        nuevos = 0
        for ancho in ANCHOS:
            # No agrandar: si el master es más chico que el ancho pedido, esa
            # variante no aporta nada y solo suma un archivo borroso.
            if ancho > w0:
                continue
            destino = master.with_name(f"{master.stem}-{ancho}.webp")
            if al_dia(destino, master):
                continue
            alto = round(h0 * ancho / w0)
            im.resize((ancho, alto), Image.LANCZOS).save(
                destino, "WEBP", quality=CALIDAD_WEBP, method=6
            )
            nuevos += destino.stat().st_size
        return w0, h0, nuevos


def ruta_publica(p: Path) -> str:
    return "/" + p.relative_to(PUBLIC).as_posix()


def main() -> int:
    fotos = masters()
    if not fotos:
        print("No se encontró ninguna foto master. ¿Está public/img/ en su lugar?")
        return 1

    medidas: dict[str, tuple[int, int]] = {}
    total_nuevo = 0
    for m in fotos:
        w, h, nuevos = generar(m)
        medidas[ruta_publica(m)] = (w, h)
        total_nuevo += nuevos
        marca = "nuevo" if nuevos else "al día"
        print(f"  {m.name:28} {w}x{h}  [{marca}]")

    lineas = [
        "// GENERADO POR tools/build_fotos.py — no editar a mano.",
        "// Medidas intrínsecas de cada master, para que cada <img> declare",
        "// width/height y el navegador reserve el espacio antes de bajarla.",
        "",
        "export const MEDIDAS: Record<string, { w: number; h: number }> = {",
    ]
    for ruta, (w, h) in sorted(medidas.items()):
        lineas.append(f'  "{ruta}": {{ w: {w}, h: {h} }},')
    lineas += ["};", ""]
    SALIDA_TS.write_text("\n".join(lineas), encoding="utf-8")

    print(f"\n{len(fotos)} fotos · {total_nuevo // 1024} KB de variantes nuevas")
    print(f"Medidas escritas en {SALIDA_TS.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
