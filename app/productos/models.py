from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from app.clientes.models import Cliente


class CategoriaProducto(models.Model):
    """Categorias para productos/servicios."""

    nombre = models.CharField(max_length=120, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Categoria de Producto"
        verbose_name_plural = "Categorias de Productos"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    """Producto o servicio vendible en el hotel."""

    TIPOS_PRODUCTO = [
        ("producto", "Producto"),
        ("servicio", "Servicio"),
    ]

    categoria = models.ForeignKey(
        CategoriaProducto,
        on_delete=models.PROTECT,
        related_name="productos",
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True, null=True)
    codigo_sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPOS_PRODUCTO, default="producto")
    precio_venta = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    costo = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
    )
    impuesto_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=Decimal("0.00"),
    )
    maneja_stock = models.BooleanField(default=True)
    stock_actual = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)
    imagen = models.ImageField(upload_to="productos/%Y/%m/", blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre

    def clean(self):
        if self.tipo == "servicio":
            self.maneja_stock = False
            self.stock_actual = 0
            self.stock_minimo = 0


class Venta(models.Model):
    """Venta de productos/servicios realizada por recepcion."""

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("pagada", "Pagada"),
        ("cancelada", "Cancelada"),
    ]

    METODOS_PAGO = [
        ("efectivo", "Efectivo"),
        ("tarjeta", "Tarjeta"),
        ("transferencia", "Transferencia"),
        ("qr", "QR"),
    ]

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="compras",
    )
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="ventas_creadas",
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pagada")
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO, default="efectivo")
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notas = models.TextField(blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ["-creado"]

    def __str__(self):
        return f"Venta {self.id}"

    def recalcular_total(self):
        total = self.detalles.aggregate(total=models.Sum("subtotal"))["total"] or Decimal("0.00")
        self.total = total
        self.save(update_fields=["total"])


class VentaDetalle(models.Model):
    """Detalle por producto/servicio en una venta."""

    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name="ventas_detalle")
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        verbose_name = "Detalle de Venta"
        verbose_name_plural = "Detalles de Ventas"

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

    def save(self, *args, **kwargs):
        self.subtotal = (self.precio_unitario or Decimal("0.00")) * self.cantidad
        super().save(*args, **kwargs)
