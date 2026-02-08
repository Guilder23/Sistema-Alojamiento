# coding: utf-8
"""
Script simple para recrear base de datos
1. Elimina db.sqlite3
2. Ejecuta migraciones
3. Crea usuarios y roles
"""
import os
import subprocess

DB_FILE = "db.sqlite3"

print("=" * 60)
print(" RECREAR BASE DE DATOS")
print("=" * 60 + "\n")

# 1. Eliminar db.sqlite3
if os.path.exists(DB_FILE):
    print("1. Eliminando base de datos antigua...")
    os.remove(DB_FILE)
    print("   OK db.sqlite3 eliminado\n")
else:
    print("1. No existe db.sqlite3 anterior\n")

# 2. Ejecutar migraciones
print("2. Ejecutando migraciones...")
result = subprocess.run(["python", "manage.py", "migrate"], capture_output=True, text=True)
if result.returncode == 0:
    print("   OK Migraciones aplicadas\n")
else:
    print(f"   ERROR: {result.stderr}")
    exit(1)

# 3. Crear usuarios (ahora ejecutamos el script de creacion)
print("3. Creando usuarios y roles...")
exec(open("crear_usuarios_roles.py", encoding="utf-8").read())
