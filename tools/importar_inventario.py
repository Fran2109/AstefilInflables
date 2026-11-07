# -*- coding: utf-8 -*-
"""Carga el inventario inicial en Supabase. Uso:

    python tools/importar_inventario.py --origen <carpeta> --probar
    python tools/importar_inventario.py --origen <carpeta>

`--origen` es `Frontend/src/assets/inflables` del repo viejo
(`Fran2109/Astefil_Inflables`). Los datos salen de `inventario_inicial.json`;
`excluir` lista las fotos de cada carpeta que no se publican.

`--probar` genera las variantes en memoria y muestra qué se cargaría, sin
conectarse a nada. Sin esa opción pide email y clave de un admin: entra como
cualquier usuario del panel, así la RLS sigue siendo la que manda y no hace
falta la service key.

Sube cada foto igual que `subirFoto` de `src/admin/lib/db.ts` (tres anchos en
WebP, se guarda solo el path de la más grande): mantenerlos en sync.

Es idempotente: saltea los artículos cuyo nombre ya existe. Si un artículo
falla, borra las fotos que le había subido para no dejar huérfanas.
"""
import argparse
from getpass import getpass
from io import BytesIO
import json
from pathlib import Path
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
DATOS = Path(__file__).resolve().parent / "inventario_inicial.json"

BUCKET = "inflables"
ANCHOS_FOTO = (1280, 640, 400)
CALIDAD_WEBP = 80
EXTENSIONES = {".jpg", ".jpeg"}

# Solo la ve el equipo (no está en `catalogo_articulos`).
NOTA = "Importado del repo viejo: medidas y descripción a confirmar."


def leer_env() -> tuple[str, str]:
    valores = {}
    for linea in (RAIZ / ".env").read_text(encoding="utf-8").splitlines():
        if "=" in linea and not linea.lstrip().startswith("#"):
            clave, valor = linea.split("=", 1)
            valores[clave.strip()] = valor.strip()
    return valores["VITE_SUPABASE_URL"].rstrip("/"), valores["VITE_SUPABASE_ANON_KEY"]


def fotos_de(articulo: dict, origen: Path) -> list[Path]:
    """Las fotos a publicar, en orden numérico (`10.jpg` va después de `9.jpg`)."""
    carpeta = origen / articulo["carpeta"]
    if not carpeta.is_dir():
        raise SystemExit(f"No existe la carpeta {carpeta}")
    excluir = set(articulo.get("excluir", []))
    todas = [p for p in carpeta.iterdir() if p.suffix.lower() in EXTENSIONES]
    return sorted(
        (p for p in todas if int(p.stem) not in excluir), key=lambda p: int(p.stem)
    )


def variantes(foto: Path) -> dict[int, bytes]:
    """Los tres WebP de una foto. Sin `exif_transpose` las del celular quedan rotadas."""
    with Image.open(foto) as original:
        im = ImageOps.exif_transpose(original).convert("RGB")
    salida = {}
    for ancho in ANCHOS_FOTO:
        copia = im.copy()
        copia.thumbnail((ancho, ancho), Image.Resampling.LANCZOS)
        buffer = BytesIO()
        copia.save(buffer, "WEBP", quality=CALIDAD_WEBP, method=6)
        salida[ancho] = buffer.getvalue()
    return salida


class Supabase:
    def __init__(self, url: str, anon: str):
        self.url = url
        self.anon = anon
        self.token = anon
        self.uid = ""

    def pedir(self, metodo: str, ruta: str, cuerpo=None, tipo="application/json", extra=None):
        datos = cuerpo
        if tipo == "application/json" and cuerpo is not None:
            datos = json.dumps(cuerpo).encode("utf-8")
        pedido = urllib.request.Request(
            self.url + ruta,
            data=datos,
            method=metodo,
            headers={
                "apikey": self.anon,
                "Authorization": f"Bearer {self.token}",
                "Content-Type": tipo,
                **(extra or {}),
            },
        )
        try:
            with urllib.request.urlopen(pedido, timeout=120) as respuesta:
                texto = respuesta.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            detalle = e.read().decode("utf-8", "replace")
            raise RuntimeError(f"{metodo} {ruta} -> {e.code}: {detalle}") from None
        return json.loads(texto) if texto else None

    def entrar(self, email: str, clave: str) -> None:
        sesion = self.pedir(
            "POST",
            "/auth/v1/token?grant_type=password",
            {"email": email, "password": clave},
        )
        self.token = sesion["access_token"]
        self.uid = sesion["user"]["id"]

    def rol(self) -> str | None:
        filas = self.pedir("GET", f"/rest/v1/perfiles?select=rol&id=eq.{self.uid}")
        return filas[0]["rol"] if filas else None

    def nombres(self) -> set[str]:
        return {f["nombre"] for f in self.pedir("GET", "/rest/v1/articulos?select=nombre")}

    def subir(self, path: str, contenido: bytes) -> None:
        self.pedir(
            "POST",
            f"/storage/v1/object/{BUCKET}/{urllib.parse.quote(path)}",
            contenido,
            tipo="image/webp",
        )

    def borrar(self, paths: list[str]) -> None:
        self.pedir("DELETE", f"/storage/v1/object/{BUCKET}", {"prefixes": paths})

    def crear(self, fila: dict) -> None:
        self.pedir("POST", "/rest/v1/articulos", fila, extra={"Prefer": "return=minimal"})


def fila_de(articulo: dict, fotos: list[str]) -> dict:
    return {
        "nombre": articulo["nombre"],
        "cat": articulo["cat"],
        "precio": 0,  # 0 = sin definir: los precios los carga Francisco
        "activo": True,
        "descripcion": articulo["descripcion"],
        "ancho": articulo["ancho"],
        "largo": articulo["largo"],
        "alto": articulo["alto"],
        "fotos": fotos,
        "notas_internas": NOTA,
    }


def probar(inventario: list[dict], origen: Path) -> None:
    total_fotos = total_bytes = 0
    for articulo in inventario:
        fotos = fotos_de(articulo, origen)
        peso = sum(len(b) for f in fotos for b in variantes(f).values())
        total_fotos += len(fotos)
        total_bytes += peso
        print(f"{articulo['cat']:<10} {articulo['nombre']:<24} {len(fotos):>2} fotos  {peso / 1024:>6.0f} KB")
    print(f"\n{len(inventario)} artículos, {total_fotos} fotos, {total_bytes / 1024 / 1024:.1f} MB a subir.")
    print("Prueba: no se conectó a Supabase ni se cargó nada.")


def importar(inventario: list[dict], origen: Path) -> None:
    sb = Supabase(*leer_env())
    sb.entrar(input("Email: ").strip(), getpass("Clave: "))
    if sb.rol() != "admin":
        raise SystemExit("Ese usuario no es admin: la RLS no lo dejaría cargar el catálogo.")

    existentes = sb.nombres()
    creados = 0
    for articulo in inventario:
        nombre = articulo["nombre"]
        if nombre in existentes:
            print(f"Ya existe, lo salteo: {nombre}")
            continue
        subidos: list[str] = []
        fotos: list[str] = []
        try:
            for foto in fotos_de(articulo, origen):
                id_foto = uuid.uuid4()
                for ancho, contenido in variantes(foto).items():
                    path = f"{id_foto}-{ancho}.webp"
                    sb.subir(path, contenido)
                    subidos.append(path)
                fotos.append(f"{id_foto}-{ANCHOS_FOTO[0]}.webp")
            sb.crear(fila_de(articulo, fotos))
        except Exception:
            if subidos:
                sb.borrar(subidos)
            print(f"Falló en: {nombre}. Podés volver a correrlo: saltea lo ya cargado.")
            raise
        creados += 1
        print(f"Cargado: {nombre} ({len(fotos)} fotos)")
    print(f"\nListo: {creados} artículos nuevos.")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Carga el inventario inicial en Supabase.")
    parser.add_argument("--origen", required=True, type=Path, help="carpeta con una subcarpeta de fotos por modelo")
    parser.add_argument("--probar", action="store_true", help="no conecta ni carga nada")
    args = parser.parse_args()

    inventario = json.loads(DATOS.read_text(encoding="utf-8"))
    if args.probar:
        probar(inventario, args.origen)
    else:
        importar(inventario, args.origen)


if __name__ == "__main__":
    main()
