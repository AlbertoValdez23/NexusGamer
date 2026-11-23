-- ============================================================================
-- NexusGamer | Modelo relacional para MySQL 8.0+
-- Moneda operativa: MXN. Zona horaria recomendada: America/Mexico_City.
-- Los importes usan DECIMAL; nunca FLOAT. Las contraseñas deben llegar
-- previamente hasheadas con Argon2id o bcrypt desde la capa de aplicación.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '-06:00';

DROP DATABASE IF EXISTS nexusgamer;
CREATE DATABASE nexusgamer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE nexusgamer;

-- --------------------------------------------------------------------------
-- 1. Identidad, acceso y clientes
-- --------------------------------------------------------------------------

CREATE TABLE roles (
  id_rol SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE permisos (
  id_permiso SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(80) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  UNIQUE KEY uk_permisos_clave (clave)
) ENGINE=InnoDB;

CREATE TABLE roles_permisos (
  id_rol SMALLINT UNSIGNED NOT NULL,
  id_permiso SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rp_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  telefono VARCHAR(20),
  email_verificado_en DATETIME,
  estado ENUM('pendiente', 'activo', 'bloqueado', 'eliminado') NOT NULL DEFAULT 'pendiente',
  intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ultimo_acceso_en DATETIME,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME,
  UNIQUE KEY uk_usuarios_email (email),
  KEY idx_usuarios_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE usuarios_roles (
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_rol SMALLINT UNSIGNED NOT NULL,
  asignado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_rol),
  CONSTRAINT fk_ur_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_ur_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id_cliente BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  fecha_nacimiento DATE,
  nivel_lealtad ENUM('starter', 'pro', 'elite') NOT NULL DEFAULT 'starter',
  puntos INT UNSIGNED NOT NULL DEFAULT 0,
  total_compras DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  cliente_desde DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_clientes_usuario (id_usuario),
  CONSTRAINT chk_clientes_puntos CHECK (puntos >= 0),
  CONSTRAINT chk_clientes_total CHECK (total_compras >= 0),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE direcciones (
  id_direccion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  tipo ENUM('envio', 'facturacion', 'ambas') NOT NULL DEFAULT 'envio',
  alias_direccion VARCHAR(50),
  destinatario VARCHAR(160) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  calle VARCHAR(140) NOT NULL,
  numero_exterior VARCHAR(20) NOT NULL,
  numero_interior VARCHAR(20),
  colonia VARCHAR(100) NOT NULL,
  codigo_postal CHAR(5) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(100) NOT NULL,
  pais CHAR(2) NOT NULL DEFAULT 'MX',
  referencias VARCHAR(300),
  predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_direcciones_usuario (id_usuario),
  KEY idx_direcciones_cp (codigo_postal),
  CONSTRAINT chk_direcciones_cp CHECK (codigo_postal REGEXP '^[0-9]{5}$'),
  CONSTRAINT fk_direcciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sesiones (
  id_sesion CHAR(36) PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  ip VARBINARY(16),
  user_agent VARCHAR(500),
  creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en DATETIME NOT NULL,
  revocada_en DATETIME,
  UNIQUE KEY uk_sesiones_token (token_hash),
  KEY idx_sesiones_usuario_expira (id_usuario, expira_en),
  CONSTRAINT fk_sesiones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE consentimientos (
  id_consentimiento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED,
  email VARCHAR(254),
  tipo ENUM('terminos', 'privacidad', 'cookies_analiticas', 'marketing') NOT NULL,
  version_documento VARCHAR(30) NOT NULL,
  otorgado BOOLEAN NOT NULL,
  ip VARBINARY(16),
  user_agent VARCHAR(500),
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  retirado_en DATETIME,
  KEY idx_consentimientos_usuario_tipo (id_usuario, tipo, registrado_en),
  CONSTRAINT fk_consentimientos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- 2. Catálogo e inventario
-- --------------------------------------------------------------------------

CREATE TABLE categorias (
  id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_categoria_padre INT UNSIGNED,
  nombre VARCHAR(80) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  descripcion VARCHAR(500),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uk_categorias_slug (slug),
  CONSTRAINT fk_categorias_padre FOREIGN KEY (id_categoria_padre) REFERENCES categorias(id_categoria) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE marcas (
  id_marca INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  sitio_web VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_marcas_nombre (nombre),
  UNIQUE KEY uk_marcas_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
  id_proveedor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(180) NOT NULL,
  rfc VARCHAR(13),
  email VARCHAR(254),
  telefono VARCHAR(20),
  plazo_entrega_dias SMALLINT UNSIGNED,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_proveedores_rfc (rfc)
) ENGINE=InnoDB;

CREATE TABLE productos (
  id_producto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT UNSIGNED NOT NULL,
  id_marca INT UNSIGNED,
  sku VARCHAR(50) NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  precio_regular DECIMAL(12,2),
  costo DECIMAL(12,2),
  tasa_iva DECIMAL(5,2) NOT NULL DEFAULT 16.00,
  garantia_dias SMALLINT UNSIGNED NOT NULL DEFAULT 90,
  peso_kg DECIMAL(8,3),
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  es_nuevo BOOLEAN NOT NULL DEFAULT FALSE,
  estado ENUM('borrador', 'activo', 'agotado', 'descontinuado') NOT NULL DEFAULT 'borrador',
  publicado_en DATETIME,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_productos_sku (sku),
  UNIQUE KEY uk_productos_slug (slug),
  KEY idx_productos_catalogo (estado, id_categoria, precio),
  FULLTEXT KEY ft_productos_busqueda (nombre, descripcion),
  CONSTRAINT chk_productos_precio CHECK (precio >= 0),
  CONSTRAINT chk_productos_precio_regular CHECK (precio_regular IS NULL OR precio_regular >= precio),
  CONSTRAINT chk_productos_iva CHECK (tasa_iva BETWEEN 0 AND 100),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
  CONSTRAINT fk_productos_marca FOREIGN KEY (id_marca) REFERENCES marcas(id_marca) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE productos_proveedores (
  id_producto BIGINT UNSIGNED NOT NULL,
  id_proveedor INT UNSIGNED NOT NULL,
  sku_proveedor VARCHAR(80),
  costo_compra DECIMAL(12,2) NOT NULL,
  proveedor_preferido BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id_producto, id_proveedor),
  CONSTRAINT chk_pp_costo CHECK (costo_compra >= 0),
  CONSTRAINT fk_pp_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_pp_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE imagenes_producto (
  id_imagen BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto BIGINT UNSIGNED NOT NULL,
  url VARCHAR(1000) NOT NULL,
  texto_alternativo VARCHAR(200) NOT NULL,
  es_principal BOOLEAN NOT NULL DEFAULT FALSE,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_imagenes_producto (id_producto, orden),
  CONSTRAINT fk_imagenes_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE especificaciones_tecnicas (
  id_especificacion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto BIGINT UNSIGNED NOT NULL,
  grupo VARCHAR(80) NOT NULL DEFAULT 'General',
  nombre VARCHAR(100) NOT NULL,
  valor VARCHAR(500) NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uk_especificacion (id_producto, grupo, nombre),
  CONSTRAINT fk_especificaciones_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE almacenes (
  id_almacen SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_almacenes_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE inventario (
  id_almacen SMALLINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  existencia INT UNSIGNED NOT NULL DEFAULT 0,
  reservado INT UNSIGNED NOT NULL DEFAULT 0,
  minimo INT UNSIGNED NOT NULL DEFAULT 2,
  maximo INT UNSIGNED,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_almacen, id_producto),
  CONSTRAINT chk_inventario_reserva CHECK (reservado <= existencia),
  CONSTRAINT chk_inventario_max CHECK (maximo IS NULL OR maximo >= minimo),
  CONSTRAINT fk_inventario_almacen FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen) ON DELETE RESTRICT,
  CONSTRAINT fk_inventario_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE movimientos_inventario (
  id_movimiento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_almacen SMALLINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  tipo ENUM('entrada', 'salida', 'reserva', 'liberacion', 'ajuste', 'devolucion') NOT NULL,
  cantidad INT NOT NULL,
  referencia_tipo VARCHAR(30),
  referencia_id BIGINT UNSIGNED,
  motivo VARCHAR(255) NOT NULL,
  realizado_por BIGINT UNSIGNED,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_movimientos_producto_fecha (id_producto, creado_en),
  KEY idx_movimientos_referencia (referencia_tipo, referencia_id),
  CONSTRAINT chk_movimientos_cantidad CHECK (cantidad <> 0),
  CONSTRAINT fk_movimientos_almacen FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen) ON DELETE RESTRICT,
  CONSTRAINT fk_movimientos_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT,
  CONSTRAINT fk_movimientos_usuario FOREIGN KEY (realizado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- 3. Carrito, promociones y compra
-- --------------------------------------------------------------------------

CREATE TABLE carritos (
  id_carrito BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente BIGINT UNSIGNED,
  token_invitado CHAR(36),
  estado ENUM('activo', 'convertido', 'abandonado', 'expirado') NOT NULL DEFAULT 'activo',
  moneda CHAR(3) NOT NULL DEFAULT 'MXN',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expira_en DATETIME,
  UNIQUE KEY uk_carritos_token (token_invitado),
  KEY idx_carritos_cliente_estado (id_cliente, estado),
  CONSTRAINT chk_carritos_propietario CHECK (id_cliente IS NOT NULL OR token_invitado IS NOT NULL),
  CONSTRAINT fk_carritos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE carrito_detalle (
  id_carrito BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  cantidad SMALLINT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  agregado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_carrito, id_producto),
  CONSTRAINT chk_carrito_cantidad CHECK (cantidad BETWEEN 1 AND 99),
  CONSTRAINT chk_carrito_precio CHECK (precio_unitario >= 0),
  CONSTRAINT fk_cd_carrito FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito) ON DELETE CASCADE,
  CONSTRAINT fk_cd_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE cupones (
  id_cupon INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL,
  tipo ENUM('porcentaje', 'importe', 'envio_gratis') NOT NULL,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0,
  compra_minima DECIMAL(12,2) NOT NULL DEFAULT 0,
  limite_usos INT UNSIGNED,
  usos_actuales INT UNSIGNED NOT NULL DEFAULT 0,
  limite_por_cliente SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  inicia_en DATETIME NOT NULL,
  termina_en DATETIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_cupones_codigo (codigo),
  CONSTRAINT chk_cupones_valor CHECK (valor >= 0),
  CONSTRAINT chk_cupones_fechas CHECK (termina_en > inicia_en)
) ENGINE=InnoDB;

CREATE TABLE promociones (
  id_promocion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  porcentaje_descuento DECIMAL(5,2),
  inicia_en DATETIME NOT NULL,
  termina_en DATETIME NOT NULL,
  unidades_disponibles INT UNSIGNED,
  limite_por_cliente SMALLINT UNSIGNED,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_promociones_descuento CHECK (porcentaje_descuento IS NULL OR porcentaje_descuento BETWEEN 0 AND 100),
  CONSTRAINT chk_promociones_fechas CHECK (termina_en > inicia_en)
) ENGINE=InnoDB;

CREATE TABLE promociones_productos (
  id_promocion INT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id_promocion, id_producto),
  CONSTRAINT fk_prp_promocion FOREIGN KEY (id_promocion) REFERENCES promociones(id_promocion) ON DELETE CASCADE,
  CONSTRAINT fk_prp_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE estados_pedido (
  id_estado TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(30) NOT NULL,
  nombre VARCHAR(60) NOT NULL,
  orden TINYINT UNSIGNED NOT NULL,
  es_final BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uk_estados_pedido_clave (clave),
  UNIQUE KEY uk_estados_pedido_orden (orden)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id_pedido BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(24) NOT NULL,
  id_cliente BIGINT UNSIGNED,
  id_carrito BIGINT UNSIGNED,
  id_estado TINYINT UNSIGNED NOT NULL,
  id_direccion_envio BIGINT UNSIGNED NOT NULL,
  id_direccion_facturacion BIGINT UNSIGNED,
  id_cupon INT UNSIGNED,
  subtotal DECIMAL(12,2) NOT NULL,
  descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
  envio DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  moneda CHAR(3) NOT NULL DEFAULT 'MXN',
  acepto_terminos BOOLEAN NOT NULL,
  version_terminos VARCHAR(30) NOT NULL,
  acepto_privacidad BOOLEAN NOT NULL,
  version_privacidad VARCHAR(30) NOT NULL,
  ip_compra VARBINARY(16),
  notas_cliente VARCHAR(500),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pedidos_folio (folio),
  UNIQUE KEY uk_pedidos_carrito (id_carrito),
  KEY idx_pedidos_cliente_fecha (id_cliente, creado_en),
  KEY idx_pedidos_estado_fecha (id_estado, creado_en),
  CONSTRAINT chk_pedidos_importes CHECK (
    subtotal >= 0 AND descuento >= 0 AND envio >= 0 AND impuestos >= 0
    AND total = ROUND(subtotal - descuento + envio, 2)
  ),
  CONSTRAINT chk_pedidos_consentimiento CHECK (acepto_terminos = TRUE AND acepto_privacidad = TRUE),
  CONSTRAINT fk_pedidos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  CONSTRAINT fk_pedidos_carrito FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito) ON DELETE SET NULL,
  CONSTRAINT fk_pedidos_estado FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_dir_envio FOREIGN KEY (id_direccion_envio) REFERENCES direcciones(id_direccion) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_dir_fact FOREIGN KEY (id_direccion_facturacion) REFERENCES direcciones(id_direccion) ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_cupon FOREIGN KEY (id_cupon) REFERENCES cupones(id_cupon) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
  id_detalle BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED,
  sku VARCHAR(50) NOT NULL,
  nombre_producto VARCHAR(180) NOT NULL,
  cantidad SMALLINT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  descuento_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  tasa_iva DECIMAL(5,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  UNIQUE KEY uk_detalle_pedido_producto (id_pedido, id_producto),
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_importes CHECK (precio_unitario >= 0 AND descuento_unitario >= 0 AND subtotal >= 0),
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE historial_pedido (
  id_historial BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_estado TINYINT UNSIGNED NOT NULL,
  comentario VARCHAR(500),
  cambiado_por BIGINT UNSIGNED,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_historial_pedido_fecha (id_pedido, creado_en),
  CONSTRAINT fk_historial_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_historial_estado FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado) ON DELETE RESTRICT,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (cambiado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- 4. Pagos, facturación, envíos y posventa
-- --------------------------------------------------------------------------

CREATE TABLE metodos_pago (
  id_metodo TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(30) NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  proveedor VARCHAR(80) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_metodos_clave (clave)
) ENGINE=InnoDB;

CREATE TABLE pagos (
  id_pago BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_metodo TINYINT UNSIGNED NOT NULL,
  referencia_pasarela VARCHAR(150),
  estado ENUM('pendiente', 'autorizado', 'rechazado', 'cancelado', 'reembolsado', 'parcial') NOT NULL DEFAULT 'pendiente',
  importe DECIMAL(12,2) NOT NULL,
  moneda CHAR(3) NOT NULL DEFAULT 'MXN',
  respuesta_pasarela JSON,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  procesado_en DATETIME,
  UNIQUE KEY uk_pagos_referencia (referencia_pasarela),
  KEY idx_pagos_pedido_estado (id_pedido, estado),
  CONSTRAINT chk_pagos_importe CHECK (importe > 0),
  CONSTRAINT fk_pagos_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_metodo FOREIGN KEY (id_metodo) REFERENCES metodos_pago(id_metodo) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE datos_fiscales (
  id_datos_fiscales BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente BIGINT UNSIGNED NOT NULL,
  rfc VARCHAR(13) NOT NULL,
  razon_social VARCHAR(180) NOT NULL,
  regimen_fiscal CHAR(3) NOT NULL,
  uso_cfdi CHAR(3) NOT NULL,
  codigo_postal_fiscal CHAR(5) NOT NULL,
  email_facturacion VARCHAR(254) NOT NULL,
  UNIQUE KEY uk_datos_fiscales_cliente_rfc (id_cliente, rfc),
  CONSTRAINT fk_datos_fiscales_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE facturas (
  id_factura BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_datos_fiscales BIGINT UNSIGNED NOT NULL,
  uuid_cfdi CHAR(36),
  serie VARCHAR(10),
  folio VARCHAR(30),
  estado ENUM('solicitada', 'emitida', 'cancelada', 'error') NOT NULL DEFAULT 'solicitada',
  subtotal DECIMAL(12,2) NOT NULL,
  iva DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  xml_url VARCHAR(1000),
  pdf_url VARCHAR(1000),
  solicitada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  emitida_en DATETIME,
  UNIQUE KEY uk_facturas_pedido (id_pedido),
  UNIQUE KEY uk_facturas_uuid (uuid_cfdi),
  CONSTRAINT fk_facturas_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
  CONSTRAINT fk_facturas_datos FOREIGN KEY (id_datos_fiscales) REFERENCES datos_fiscales(id_datos_fiscales) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE empresas_paqueteria (
  id_paqueteria SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url_rastreo VARCHAR(500),
  telefono VARCHAR(20),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uk_paqueteria_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE envios (
  id_envio BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_paqueteria SMALLINT UNSIGNED,
  numero_guia VARCHAR(100),
  tipo_servicio VARCHAR(80) NOT NULL,
  estado ENUM('preparando', 'recolectado', 'en_transito', 'en_reparto', 'entregado', 'incidencia', 'devuelto') NOT NULL DEFAULT 'preparando',
  costo DECIMAL(12,2) NOT NULL DEFAULT 0,
  fecha_estimada DATE,
  enviado_en DATETIME,
  entregado_en DATETIME,
  UNIQUE KEY uk_envios_guia (numero_guia),
  KEY idx_envios_pedido (id_pedido),
  CONSTRAINT fk_envios_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
  CONSTRAINT fk_envios_paqueteria FOREIGN KEY (id_paqueteria) REFERENCES empresas_paqueteria(id_paqueteria) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE rastreo_envio (
  id_evento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_envio BIGINT UNSIGNED NOT NULL,
  estado VARCHAR(80) NOT NULL,
  ubicacion VARCHAR(180),
  descripcion VARCHAR(500),
  ocurrido_en DATETIME NOT NULL,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_rastreo_envio_fecha (id_envio, ocurrido_en),
  CONSTRAINT fk_rastreo_envio FOREIGN KEY (id_envio) REFERENCES envios(id_envio) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE devoluciones (
  id_devolucion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(24) NOT NULL,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_detalle BIGINT UNSIGNED,
  motivo ENUM('revocacion', 'defecto', 'danio_origen', 'producto_incorrecto', 'otro') NOT NULL,
  descripcion VARCHAR(1000) NOT NULL,
  estado ENUM('solicitada', 'aprobada', 'rechazada', 'recibida', 'resuelta') NOT NULL DEFAULT 'solicitada',
  cantidad SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  guia_retorno VARCHAR(100),
  solicitada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resuelta_en DATETIME,
  UNIQUE KEY uk_devoluciones_folio (folio),
  KEY idx_devoluciones_pedido (id_pedido),
  CONSTRAINT fk_devoluciones_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE RESTRICT,
  CONSTRAINT fk_devoluciones_detalle FOREIGN KEY (id_detalle) REFERENCES detalle_pedido(id_detalle) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reembolsos (
  id_reembolso BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_devolucion BIGINT UNSIGNED,
  id_pago BIGINT UNSIGNED NOT NULL,
  referencia_pasarela VARCHAR(150),
  importe DECIMAL(12,2) NOT NULL,
  estado ENUM('solicitado', 'procesando', 'completado', 'fallido') NOT NULL DEFAULT 'solicitado',
  solicitado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completado_en DATETIME,
  CONSTRAINT chk_reembolsos_importe CHECK (importe > 0),
  CONSTRAINT fk_reembolsos_devolucion FOREIGN KEY (id_devolucion) REFERENCES devoluciones(id_devolucion) ON DELETE SET NULL,
  CONSTRAINT fk_reembolsos_pago FOREIGN KEY (id_pago) REFERENCES pagos(id_pago) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- 5. Experiencia, soporte, privacidad y auditoría
-- --------------------------------------------------------------------------

CREATE TABLE favoritos (
  id_cliente BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  agregado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente, id_producto),
  CONSTRAINT fk_favoritos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  CONSTRAINT fk_favoritos_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE resenas (
  id_resena BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_cliente BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  id_detalle BIGINT UNSIGNED,
  calificacion TINYINT UNSIGNED NOT NULL,
  titulo VARCHAR(120),
  comentario VARCHAR(2000),
  verificada BOOLEAN NOT NULL DEFAULT FALSE,
  estado ENUM('pendiente', 'publicada', 'rechazada') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_resena_cliente_producto (id_cliente, id_producto),
  KEY idx_resenas_producto_estado (id_producto, estado),
  CONSTRAINT chk_resenas_calificacion CHECK (calificacion BETWEEN 1 AND 5),
  CONSTRAINT fk_resenas_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
  CONSTRAINT fk_resenas_detalle FOREIGN KEY (id_detalle) REFERENCES detalle_pedido(id_detalle) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE tickets_soporte (
  id_ticket BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(24) NOT NULL,
  id_cliente BIGINT UNSIGNED,
  id_pedido BIGINT UNSIGNED,
  tipo ENUM('soporte', 'queja', 'garantia', 'facturacion', 'envio') NOT NULL,
  asunto VARCHAR(180) NOT NULL,
  prioridad ENUM('baja', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  estado ENUM('abierto', 'en_proceso', 'esperando_cliente', 'resuelto', 'cerrado') NOT NULL DEFAULT 'abierto',
  asignado_a BIGINT UNSIGNED,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vence_respuesta_en DATETIME,
  cerrado_en DATETIME,
  UNIQUE KEY uk_tickets_folio (folio),
  KEY idx_tickets_estado_prioridad (estado, prioridad, creado_en),
  CONSTRAINT fk_tickets_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_asignado FOREIGN KEY (asignado_a) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE mensajes_soporte (
  id_mensaje BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_ticket BIGINT UNSIGNED NOT NULL,
  id_usuario BIGINT UNSIGNED,
  autor_tipo ENUM('cliente', 'agente', 'sistema') NOT NULL,
  mensaje TEXT NOT NULL,
  adjunto_url VARCHAR(1000),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_mensajes_ticket_fecha (id_ticket, creado_en),
  CONSTRAINT fk_mensajes_ticket FOREIGN KEY (id_ticket) REFERENCES tickets_soporte(id_ticket) ON DELETE CASCADE,
  CONSTRAINT fk_mensajes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE solicitudes_arco (
  id_solicitud BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  folio VARCHAR(24) NOT NULL,
  id_usuario BIGINT UNSIGNED,
  nombre_solicitante VARCHAR(180) NOT NULL,
  email VARCHAR(254) NOT NULL,
  derecho ENUM('acceso', 'rectificacion', 'cancelacion', 'oposicion') NOT NULL,
  descripcion TEXT NOT NULL,
  estado ENUM('recibida', 'validando_identidad', 'en_proceso', 'atendida', 'improcedente') NOT NULL DEFAULT 'recibida',
  recibida_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_limite DATE NOT NULL,
  resuelta_en DATETIME,
  resolucion TEXT,
  UNIQUE KEY uk_arco_folio (folio),
  KEY idx_arco_estado_limite (estado, fecha_limite),
  CONSTRAINT fk_arco_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE suscripciones_marketing (
  id_suscripcion BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED,
  email VARCHAR(254) NOT NULL,
  estado ENUM('pendiente', 'activa', 'cancelada') NOT NULL DEFAULT 'pendiente',
  origen VARCHAR(80) NOT NULL DEFAULT 'footer',
  token_confirmacion CHAR(64),
  consentido_en DATETIME,
  cancelado_en DATETIME,
  UNIQUE KEY uk_suscripciones_email (email),
  CONSTRAINT fk_suscripciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE bitacora_sistema (
  id_evento BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED,
  accion VARCHAR(80) NOT NULL,
  entidad VARCHAR(80) NOT NULL,
  entidad_id VARCHAR(80),
  datos_anteriores JSON,
  datos_nuevos JSON,
  ip VARBINARY(16),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bitacora_entidad (entidad, entidad_id, creado_en),
  KEY idx_bitacora_usuario (id_usuario, creado_en),
  CONSTRAINT fk_bitacora_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE configuracion_tienda (
  clave VARCHAR(80) PRIMARY KEY,
  valor JSON NOT NULL,
  descripcion VARCHAR(255),
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE solicitudes_idempotentes (
  clave CHAR(36) PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NOT NULL,
  id_pedido BIGINT UNSIGNED,
  folio VARCHAR(24),
  creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en DATETIME NOT NULL,
  KEY idx_idempotencia_usuario (id_usuario, creada_en),
  CONSTRAINT fk_idempotencia_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_idempotencia_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------------
-- 6. Vistas y automatizaciones
-- --------------------------------------------------------------------------

CREATE OR REPLACE VIEW vw_catalogo_productos AS
SELECT
  p.id_producto,
  p.sku,
  p.nombre,
  p.slug,
  c.nombre AS categoria,
  m.nombre AS marca,
  p.precio,
  p.precio_regular,
  p.destacado,
  p.es_nuevo,
  COALESCE(rv.calificacion, 0) AS calificacion,
  COALESCE(rv.total_resenas, 0) AS total_resenas,
  COALESCE(st.disponibilidad, 0) AS disponibilidad
FROM productos p
JOIN categorias c ON c.id_categoria = p.id_categoria
LEFT JOIN marcas m ON m.id_marca = p.id_marca
LEFT JOIN (
  SELECT id_producto, ROUND(AVG(calificacion), 1) AS calificacion, COUNT(*) AS total_resenas
  FROM resenas
  WHERE estado = 'publicada'
  GROUP BY id_producto
) rv ON rv.id_producto = p.id_producto
LEFT JOIN (
  SELECT id_producto, SUM(existencia - reservado) AS disponibilidad
  FROM inventario
  GROUP BY id_producto
) st ON st.id_producto = p.id_producto
WHERE p.estado IN ('activo', 'agotado');

CREATE OR REPLACE VIEW vw_ventas_mensuales AS
SELECT
  DATE_FORMAT(p.creado_en, '%Y-%m') AS periodo,
  COUNT(DISTINCT p.id_pedido) AS pedidos,
  SUM(dp.cantidad) AS unidades,
  SUM(p.total) AS venta_total
FROM pedidos p
JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
JOIN estados_pedido ep ON ep.id_estado = p.id_estado
WHERE ep.clave NOT IN ('cancelado')
GROUP BY DATE_FORMAT(p.creado_en, '%Y-%m');

DELIMITER $$

CREATE TRIGGER trg_pedido_historial_inicial
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
  INSERT INTO historial_pedido (id_pedido, id_estado, comentario)
  VALUES (NEW.id_pedido, NEW.id_estado, 'Pedido creado');
END$$

CREATE TRIGGER trg_pedido_cambio_estado
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
  IF NOT (NEW.id_estado <=> OLD.id_estado) THEN
    INSERT INTO historial_pedido (id_pedido, id_estado, comentario)
    VALUES (NEW.id_pedido, NEW.id_estado, 'Cambio automático de estado');
  END IF;
END$$

CREATE PROCEDURE sp_cambiar_estado_pedido(
  IN p_id_pedido BIGINT UNSIGNED,
  IN p_estado_clave VARCHAR(30),
  IN p_comentario VARCHAR(500),
  IN p_usuario BIGINT UNSIGNED
)
BEGIN
  DECLARE v_estado TINYINT UNSIGNED;
  DECLARE v_estado_actual TINYINT UNSIGNED;
  SELECT id_estado INTO v_estado
  FROM estados_pedido
  WHERE clave = p_estado_clave;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de pedido inexistente';
  END IF;

  SELECT id_estado INTO v_estado_actual
  FROM pedidos
  WHERE id_pedido = p_id_pedido;

  IF v_estado_actual IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido inexistente';
  END IF;

  IF v_estado_actual = v_estado THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido ya tiene ese estado';
  END IF;

  UPDATE pedidos SET id_estado = v_estado WHERE id_pedido = p_id_pedido;
  UPDATE historial_pedido h
  JOIN (
    SELECT MAX(id_historial) AS id_historial
    FROM historial_pedido
    WHERE id_pedido = p_id_pedido
  ) ultimo ON ultimo.id_historial = h.id_historial
  SET h.comentario = COALESCE(p_comentario, h.comentario),
      h.cambiado_por = p_usuario;
END$$

DELIMITER ;

-- --------------------------------------------------------------------------
-- 7. Datos iniciales y catálogo del frontend
-- --------------------------------------------------------------------------

INSERT INTO roles (nombre, descripcion) VALUES
  ('cliente', 'Comprador de la tienda'),
  ('soporte', 'Agente de atención al cliente'),
  ('almacen', 'Operación de inventario y envíos'),
  ('administrador', 'Administración completa');

INSERT INTO permisos (clave, descripcion) VALUES
  ('catalogo.leer', 'Consultar catálogo'),
  ('pedidos.crear', 'Crear pedidos'),
  ('pedidos.gestionar', 'Gestionar estados de pedidos'),
  ('inventario.gestionar', 'Registrar movimientos de inventario'),
  ('soporte.gestionar', 'Atender tickets y solicitudes'),
  ('admin.total', 'Acceso administrativo total');

INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r
JOIN permisos p ON
  (r.nombre = 'cliente' AND p.clave IN ('catalogo.leer', 'pedidos.crear'))
  OR (r.nombre = 'soporte' AND p.clave IN ('catalogo.leer', 'pedidos.gestionar', 'soporte.gestionar'))
  OR (r.nombre = 'almacen' AND p.clave IN ('catalogo.leer', 'pedidos.gestionar', 'inventario.gestionar'))
  OR (r.nombre = 'administrador');

INSERT INTO categorias (nombre, slug, orden) VALUES
  ('Computadoras', 'computadoras', 1),
  ('Audífonos', 'audifonos', 2),
  ('Laptops', 'laptops', 3),
  ('Monitores', 'monitores', 4),
  ('Periféricos', 'perifericos', 5),
  ('Sillas', 'sillas', 6),
  ('Accesorios', 'accesorios', 7);

INSERT INTO marcas (nombre, slug) VALUES
  ('NexusGamer', 'nexusgamer'),
  ('HyperX', 'hyperx'),
  ('ASUS ROG', 'asus-rog'),
  ('Razer', 'razer'),
  ('Logitech', 'logitech'),
  ('DXRacer', 'dxracer'),
  ('Astro', 'astro');

INSERT INTO productos
  (id_categoria, id_marca, sku, nombre, slug, descripcion, precio, precio_regular, costo,
   destacado, es_nuevo, estado, publicado_en)
VALUES
  ((SELECT id_categoria FROM categorias WHERE slug='computadoras'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-PC-4080', 'PC Gamer Ultimate RTX 4080 RGB', 'pc-gamer-ultimate-rtx-4080-rgb',
   'PC gamer con RTX 4080, Intel Core i9, 32 GB DDR5, SSD NVMe 2 TB y refrigeración líquida.', 38500, 44999, 32000, TRUE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='audifonos'), (SELECT id_marca FROM marcas WHERE slug='hyperx'),
   'HX-CLOUD3-W', 'Audífonos HyperX Cloud III Wireless', 'hyperx-cloud-iii-wireless',
   'Audífonos inalámbricos con sonido surround 7.1, micrófono desmontable y 38 horas de batería.', 2799, NULL, 1950, TRUE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='laptops'), (SELECT id_marca FROM marcas WHERE slug='asus-rog'),
   'AS-G16-4070', 'Laptop Gamer ASUS ROG Strix G16', 'asus-rog-strix-g16',
   'Laptop con pantalla QHD 165 Hz, RTX 4070, Ryzen 9, 16 GB RAM y teclado RGB.', 29999, 34999, 25000, TRUE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='monitores'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-MON-27Q', 'Monitor Gaming 240Hz Curvo 27 QHD', 'monitor-gaming-240hz-curvo-27-qhd',
   'Monitor curvo QHD 240 Hz, panel VA, respuesta de 1 ms, FreeSync Premium Pro y HDR600.', 9499, NULL, 7000, FALSE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='perifericos'), (SELECT id_marca FROM marcas WHERE slug='razer'),
   'RZ-BWV4-TKL', 'Teclado Mecánico RGB Razer BlackWidow V4', 'razer-blackwidow-v4',
   'Teclado mecánico TKL con switches Razer Green, Chroma RGB y reposamuñecas magnético.', 3799, 4499, 2800, FALSE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='perifericos'), (SELECT id_marca FROM marcas WHERE slug='logitech'),
   'LG-GPX-SL2', 'Mouse Gaming Logitech G Pro X Superlight 2', 'logitech-g-pro-x-superlight-2',
   'Mouse inalámbrico de 60 g, sensor HERO 2 de 25600 DPI y batería de 95 horas.', 2199, NULL, 1550, TRUE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='sillas'), (SELECT id_marca FROM marcas WHERE slug='dxracer'),
   'DX-FPRO-RGB', 'Silla Gamer DXRacer Formula Pro RGB', 'dxracer-formula-pro-rgb',
   'Silla ergonómica con soporte lumbar, reposabrazos 4D, inclinación 135 grados y LED RGB.', 8499, 9999, 6200, FALSE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='accesorios'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-SETUP-KIT', 'Setup Gamer Completo Escritorio RGB', 'setup-gamer-completo-escritorio-rgb',
   'Kit con soporte para auriculares, hub USB-C, portavasos magnético y tira LED ambilight.', 2499, NULL, 1700, FALSE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='audifonos'), (SELECT id_marca FROM marcas WHERE slug='astro'),
   'AS-A50-G5', 'Headset Inalámbrico Astro A50 Gen 5', 'astro-a50-gen-5',
   'Headset premium con Dolby Atmos, estación de carga, micrófono retráctil y 24 horas de autonomía.', 5299, NULL, 3900, TRUE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='perifericos'), (SELECT id_marca FROM marcas WHERE slug='razer'),
   'RZ-VPR-V3', 'Mouse Razer Viper V3 Pro', 'razer-viper-v3-pro',
   'Mouse competitivo ultraligero con sensor Focus Pro 35K y conexión HyperSpeed.', 3299, 3699, 2450, FALSE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='monitores'), (SELECT id_marca FROM marcas WHERE slug='asus-rog'),
   'AS-XG27AQ', 'Monitor ASUS ROG Strix 27 QHD', 'asus-rog-strix-xg27aq',
   'Monitor IPS QHD de 27 pulgadas, 170 Hz, G-SYNC compatible y DisplayHDR 400.', 10999, 12499, 8200, TRUE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='accesorios'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-MIC-USB', 'Micrófono USB Stream Pro', 'microfono-usb-stream-pro',
   'Micrófono de condensador con patrón cardioide, monitoreo directo y control de ganancia.', 1899, NULL, 1200, FALSE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='perifericos'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-PAD-XL', 'Mousepad Nexus Control XL', 'mousepad-nexus-control-xl',
   'Superficie de control de 90 por 40 centímetros, base antideslizante y borde reforzado.', 649, 799, 310, FALSE, FALSE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='accesorios'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-CAM-2K', 'Webcam Creator 2K 60fps', 'webcam-creator-2k-60fps',
   'Cámara para streaming con enfoque automático, HDR, doble micrófono y obturador de privacidad.', 2499, 2899, 1750, FALSE, TRUE, 'activo', NOW()),
  ((SELECT id_categoria FROM categorias WHERE slug='computadoras'), (SELECT id_marca FROM marcas WHERE slug='nexusgamer'),
   'NG-PC-4060', 'PC Gamer Core RTX 4060', 'pc-gamer-core-rtx-4060',
   'Equipo equilibrado con RTX 4060, Ryzen 5, 16 GB DDR5 y SSD NVMe de 1 TB.', 21999, 23999, 18400, TRUE, FALSE, 'activo', NOW());

INSERT INTO almacenes (nombre, codigo, ciudad) VALUES
  ('Centro de distribución CDMX', 'CDMX-01', 'Ciudad de México');

INSERT INTO inventario (id_almacen, id_producto, existencia, reservado, minimo, maximo)
SELECT 1, id_producto, 25, 0, 3, 80 FROM productos;

INSERT INTO estados_pedido (clave, nombre, orden, es_final) VALUES
  ('pendiente_pago', 'Pendiente de pago', 1, FALSE),
  ('pagado', 'Pago confirmado', 2, FALSE),
  ('preparando', 'Preparando pedido', 3, FALSE),
  ('enviado', 'Enviado', 4, FALSE),
  ('entregado', 'Entregado', 5, TRUE),
  ('cancelado', 'Cancelado', 6, TRUE),
  ('devuelto', 'Devuelto', 7, TRUE);

INSERT INTO metodos_pago (clave, nombre, proveedor) VALUES
  ('mercado_pago', 'Mercado Pago', 'Mercado Pago'),
  ('stripe', 'Tarjeta bancaria', 'Stripe'),
  ('paypal', 'PayPal', 'PayPal'),
  ('oxxo', 'Pago referenciado OXXO', 'Mercado Pago');

INSERT INTO empresas_paqueteria (nombre, url_rastreo) VALUES
  ('DHL Express', 'https://www.dhl.com/mx-es/home/rastreo.html'),
  ('Estafeta', 'https://www.estafeta.com/Herramientas/Rastreo');

INSERT INTO configuracion_tienda (clave, valor, descripcion) VALUES
  ('moneda', JSON_OBJECT('codigo', 'MXN', 'simbolo', '$'), 'Moneda de operación'),
  ('iva', JSON_OBJECT('tasa', 16), 'IVA general incluido en precios'),
  ('envio_gratis', JSON_OBJECT('minimo', 5000), 'Importe mínimo para envío gratuito'),
  ('version_legal', JSON_OBJECT('terminos', '2025-01-15', 'privacidad', '2025-01-15'), 'Versiones vigentes'),
  ('garantia_minima', JSON_OBJECT('dias', 90), 'Garantía mínima informada en la tienda');

-- Usuario técnico de ejemplo. Sustituir el hash antes de usar en un entorno real.
INSERT INTO usuarios (email, password_hash, nombre, apellidos, email_verificado_en, estado)
VALUES ('admin@nexusgamer.mx', '$2b$12$REEMPLAZAR_HASH_DE_DEMOSTRACION', 'Admin', 'NexusGamer', NOW(), 'activo');

INSERT INTO usuarios_roles (id_usuario, id_rol)
SELECT u.id_usuario, r.id_rol
FROM usuarios u JOIN roles r
WHERE u.email = 'admin@nexusgamer.mx' AND r.nombre = 'administrador';

-- Consultas rápidas de comprobación:
-- SELECT * FROM vw_catalogo_productos ORDER BY destacado DESC, nombre;
-- SELECT TABLE_NAME FROM information_schema.TABLES
-- WHERE TABLE_SCHEMA = 'nexusgamer' ORDER BY TABLE_NAME;
