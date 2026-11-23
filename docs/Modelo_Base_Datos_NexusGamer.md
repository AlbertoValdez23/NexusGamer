# Diseño de Base de Datos — NexusGamer

**Motor seleccionado:** MySQL 8 / MySQL Workbench  
**Proyecto:** tienda virtual de electrónicos gamer, precios en pesos mexicanos  
**Script ejecutable:** `database/nexusgamer_mysql8.sql`

## 1. Alcance y criterio de selección

El modelo se construyó a partir de las funciones reales del frontend: catálogo y filtros, productos destacados y nuevos, favoritos, carrito, checkout con aceptación legal, pagos, facturación CFDI, envíos, devoluciones, reseñas, soporte, quejas, derechos ARCO, cookies y newsletter.

No se incluyeron tablas que aún no tienen una función concreta en NexusGamer —por ejemplo, marketplace multivendedor, afiliados, dropshipping o suscripciones mensuales— porque aumentarían la complejidad sin resolver una necesidad actual. El esquema sí deja separadas las áreas funcionales para poder agregarlas después.

## 2. Tablas seleccionadas y justificación

| Área | Tablas | Justificación |
|---|---|---|
| Identidad y seguridad | `usuarios`, `roles`, `permisos`, `usuarios_roles`, `roles_permisos`, `sesiones` | Autenticación, autorización por roles, sesiones revocables y separación entre credenciales y perfil comercial. |
| Clientes y privacidad | `clientes`, `direcciones`, `consentimientos`, `suscripciones_marketing`, `solicitudes_arco` | Perfil del comprador, direcciones reutilizables y evidencia de consentimiento conforme a LFPDPPP. |
| Catálogo | `categorias`, `marcas`, `proveedores`, `productos`, `productos_proveedores`, `imagenes_producto`, `especificaciones_tecnicas` | Permiten búsquedas, filtros, ficha técnica, múltiples imágenes y trazabilidad de abastecimiento. |
| Inventario | `almacenes`, `inventario`, `movimientos_inventario` | Existencia por almacén, reserva de stock y kardex auditable. |
| Carrito y promoción | `carritos`, `carrito_detalle`, `cupones`, `promociones`, `promociones_productos` | Conserva carritos de usuarios e invitados, el precio observado y las reglas comerciales vigentes. |
| Venta | `estados_pedido`, `pedidos`, `detalle_pedido`, `historial_pedido` | Guarda la operación completa y una fotografía inmutable del nombre, SKU, precio e IVA comprados. |
| Pago y CFDI | `metodos_pago`, `pagos`, `datos_fiscales`, `facturas` | Admite intentos de pago y datos CFDI sin almacenar números completos de tarjeta o CVV. |
| Logística | `empresas_paqueteria`, `envios`, `rastreo_envio` | Registra guía, servicio, costo y eventos de rastreo. |
| Posventa | `devoluciones`, `reembolsos`, `tickets_soporte`, `mensajes_soporte` | Soporta revocación, garantía, quejas y devolución de fondos con seguimiento. |
| Comunidad | `favoritos`, `resenas` | Implementa el corazón de favoritos y valoraciones verificables del catálogo. |
| Gobierno | `bitacora_sistema`, `configuracion_tienda` | Auditoría de cambios sensibles y parámetros versionados de la tienda. |

El resultado contiene **46 tablas**, dos vistas, dos triggers y un procedimiento almacenado.

## 3. Claves y relaciones principales

- Todas las entidades principales usan una PK numérica autoincremental, salvo tablas puente y sesiones.
- Las relaciones muchos-a-muchos usan PK compuesta: roles–permisos, usuarios–roles, productos–proveedores, promociones–productos y favoritos.
- `usuarios.email`, `productos.sku`, `productos.slug`, `pedidos.folio` y referencias de pasarela tienen índices únicos.
- Las FK transaccionales usan `RESTRICT` para evitar borrar evidencia de compra.
- Las FK de perfil que pueden anonimizarse usan `SET NULL`.
- Los datos dependientes sin valor autónomo —detalle de carrito, imágenes o mensajes— usan `CASCADE`.
- `detalle_pedido` conserva una copia del SKU, nombre, precio e IVA. Así, un cambio futuro en catálogo no altera una compra histórica.
- `pedidos` conserva versiones de términos y privacidad aceptadas, además de fecha e IP.

## 4. Decisiones de diseño

### Normalización

El modelo se encuentra principalmente en tercera forma normal:

1. Cada campo contiene un solo valor.
2. Las tablas puente resuelven relaciones muchos-a-muchos.
3. Catálogos como estados, roles, marcas y métodos de pago evitan repetir texto.
4. Las únicas duplicaciones intencionales están en el detalle del pedido, donde funcionan como fotografía legal y contable.

### Dinero e impuestos

- Los importes usan `DECIMAL(12,2)`, no `FLOAT`.
- La moneda operativa es `MXN`.
- Los precios publicados incluyen IVA; la tasa se conserva por producto y por renglón de compra.
- El total del pedido se valida como `subtotal - descuento + envío`; `impuestos` es informativo porque ya está incluido en los precios.

### Seguridad y privacidad

- Solo se guarda `password_hash`; nunca contraseña en texto plano.
- Los tokens de sesión se almacenan como hash.
- Las IP se definen como `VARBINARY(16)` para aceptar IPv4 e IPv6 con `INET6_ATON()` / `INET6_NTOA()`.
- La base no contiene PAN de tarjeta ni CVV. Solo conserva la referencia entregada por la pasarela.
- `solicitudes_arco`, `consentimientos` y `bitacora_sistema` ofrecen trazabilidad de cumplimiento.
- En producción, la cuenta de la aplicación no debe tener permisos `DROP`, `ALTER` ni acceso directo a la bitácora.

## 5. Flujo completo de compra

1. El frontend consulta `vw_catalogo_productos`, imágenes y especificaciones.
2. El visitante inicia un `carrito` con `id_cliente` o `token_invitado`.
3. Cada selección se registra en `carrito_detalle` con cantidad y precio observado.
4. Antes del checkout se valida disponibilidad: `existencia - reservado`.
5. La aplicación crea una transacción SQL, reserva stock y registra `movimientos_inventario`.
6. Se registran dirección, cupón, importes y versiones legales en `pedidos`.
7. Los renglones se copian a `detalle_pedido`; el trigger crea el primer `historial_pedido`.
8. La pasarela procesa el cobro y devuelve una referencia a `pagos`.
9. Al autorizarse, el pedido cambia a `pagado`; almacén lo prepara y descuenta existencias.
10. `envios` recibe paquetería y guía; `rastreo_envio` conserva cada evento.
11. Si el cliente solicita CFDI, se usan `datos_fiscales` y `facturas`.
12. Una incidencia abre `tickets_soporte`; revocaciones o garantías generan `devoluciones` y, si procede, `reembolsos`.

La creación de pedido, reserva de stock y conversión del carrito debe ejecutarse en **una transacción** para impedir sobreventa.

## 6. Uso en MySQL Workbench

1. Abrir MySQL Workbench y conectarse a MySQL 8.
2. Elegir **File → Open SQL Script**.
3. Abrir `database/nexusgamer_mysql8.sql`.
4. Ejecutar todo el archivo con el icono de rayo.
5. Actualizar **Schemas** y verificar el esquema `nexusgamer`.
6. Para generar el DER visual: **Database → Reverse Engineer → nexusgamer**.
7. Organizar las tablas por área y exportar desde **File → Export → PNG/PDF/SVG**.

> El script contiene `DROP DATABASE IF EXISTS nexusgamer`; está pensado para una entrega académica reproducible. Debe eliminarse esa línea antes de usarlo sobre información real.

## 7. Consultas de demostración

```sql
-- Catálogo con rating y existencia
SELECT *
FROM nexusgamer.vw_catalogo_productos
ORDER BY destacado DESC, calificacion DESC;

-- Productos que alcanzaron inventario mínimo
SELECT p.sku, p.nombre, a.nombre AS almacen, i.existencia, i.reservado, i.minimo
FROM nexusgamer.inventario i
JOIN nexusgamer.productos p ON p.id_producto = i.id_producto
JOIN nexusgamer.almacenes a ON a.id_almacen = i.id_almacen
WHERE (i.existencia - i.reservado) <= i.minimo;

-- Pedidos con pago y envío
SELECT p.folio, ep.nombre AS estado_pedido, p.total,
       pg.estado AS estado_pago, e.estado AS estado_envio, e.numero_guia
FROM nexusgamer.pedidos p
JOIN nexusgamer.estados_pedido ep ON ep.id_estado = p.id_estado
LEFT JOIN nexusgamer.pagos pg ON pg.id_pedido = p.id_pedido
LEFT JOIN nexusgamer.envios e ON e.id_pedido = p.id_pedido
ORDER BY p.creado_en DESC;

-- Solicitudes ARCO próximas a vencer
SELECT folio, derecho, email, estado, fecha_limite
FROM nexusgamer.solicitudes_arco
WHERE estado NOT IN ('atendida', 'improcedente')
ORDER BY fecha_limite;
```

## 8. Escalabilidad: respuesta al reto profesional

Para operar al nivel de Amazon o Mercado Libre harían falta, además:

- vendedores, tiendas, comisiones y liquidaciones de marketplace;
- centros logísticos, lotes, números de serie y reservas distribuidas;
- eventos de dominio y una bandeja `outbox` para procesamiento asíncrono;
- particionamiento temporal de pedidos, pagos, bitácora y eventos;
- réplicas de lectura, caché de catálogo y motor de búsqueda especializado;
- conciliación financiera, prevención de fraude y contracargos;
- recomendación por eventos, perfiles de afinidad y experimentos A/B;
- idempotencia para APIs, webhooks y creación de pedidos;
- gobierno de datos, anonimización, retención y residencia regional;
- métricas agregadas en un almacén analítico separado de la base transaccional.

No conviene guardar cada clic o métrica masiva en la misma base OLTP: los eventos irían a una plataforma de streaming y el análisis a un data warehouse.
