#!/usr/bin/env python3
"""Сборка пересъёмки: tools/syroe/*.png -> файлы в корне portfolio-assets.

Компьютер ужимается с двойной плотности до 1440 точек по ширине,
телефон остаётся 780 точек (чётко на экране телефона), лист PDF — 1190.
Имена и форматы те же, что у прежних файлов, чтобы замена была один к одному.
Запуск: /usr/bin/python3 tools/sobrat.py
"""
import pathlib
from PIL import Image

KOREN = pathlib.Path(__file__).resolve().parent.parent
SYROE = KOREN / "tools" / "syroe"

# сырой файл -> (имя на выходе, ширина)
PLAN = {
    "skuf-desktop.png": ("skuf-desktop.png", 1440),
    "skuf-mobile.png": ("skuf-mobile.png", 780),
    "arenda-desktop.png": ("arenda-desktop.png", 1440),
    "arenda-pusto.png": ("arenda-pusto.png", 1440),
    "arenda-mobile.png": ("arenda-mobile.png", 780),
    "otchet-1-ekran.png": ("otchet-1-ekran.jpg", 1440),
    "otchet-2-nahodki.png": ("otchet-2-nahodki.jpg", 1440),
    "otchet-3-telefon.png": ("otchet-3-telefon.jpg", 780),
    "otchet-4-pdf.png": ("otchet-4-pdf.jpg", 1190),
    "klinika-1-zapis.png": ("klinika-1-zapis.jpg", 1440),
    "klinika-2-galochka.png": ("klinika-2-galochka.jpg", 1440),
    "klinika-3-mobile.png": ("klinika-3-mobile.jpg", 780),
    "klinika-4-politika.png": ("klinika-4-politika.jpg", 1440),
    "dostavka-1-kartochki.png": ("dostavka-1-kartochki.jpg", 1440),
    "dostavka-2-proverki.png": ("dostavka-2-proverki.jpg", 1440),
    "dostavka-3-znachok.png": ("dostavka-3-znachok.jpg", 1440),
    "dostavka-4-mobile.png": ("dostavka-4-mobile.jpg", 780),
}

for syroj, (imya, shirina) in PLAN.items():
    im = Image.open(SYROE / syroj).convert("RGB")
    if im.width != shirina:
        im = im.resize((shirina, round(im.height * shirina / im.width)), Image.LANCZOS)
    put = KOREN / imya
    if imya.endswith(".jpg"):
        im.save(put, "JPEG", quality=88, optimize=True, progressive=True)
    else:
        im.save(put, "PNG", optimize=True)
    print(f"{imya}: {im.width}×{im.height}, {put.stat().st_size // 1024} КБ")
