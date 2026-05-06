import { executeQuery } from "./db";

/**
 * Función auxiliar para limpiar los datos de Turso.
 * Convierte BigInt a Number y asegura que sean objetos planos serializables.
 */
function mapPlainObject(row: any) {
  if (!row) return null;

  const precioOfertaLimpio = row.precio_oferta && Number(row.precio_oferta) > 0 
    ? Number(row.precio_oferta) 
    : undefined;

  return {
    ...row,
    id_producto: row.id_producto !== undefined ? Number(row.id_producto) : undefined,
    id_categoria: row.id_categoria !== undefined ? Number(row.id_categoria) : undefined,
    id_modelo: row.id_modelo !== undefined ? Number(row.id_modelo) : undefined,
    precio: row.precio !== undefined ? Number(row.precio) : 0,
    precio_oferta: precioOfertaLimpio, 
    likes: row.likes !== undefined ? Number(row.likes) : 0,
    ya_tiene_like: Number(row.ya_tiene_like) > 0,
  };
}

/**
 * Obtiene los productos para la Home con soporte para búsqueda y verificación de Like.
 */
export async function getProductosHome(idCliente?: number, filtro: string = "") {
  try {
    const idCliNum = idCliente ? Number(idCliente) : 0;
    const params: any[] = [idCliNum];

    let sql = `
      SELECT 
        p.id_producto, 
        p.nombre, 
        p.id_categoria,
        p.descripcion,
        (SELECT id_modelo FROM modelo WHERE id_producto = p.id_producto LIMIT 1) as id_modelo,
        (SELECT MIN(precio) FROM modelo WHERE id_producto = p.id_producto) as precio,
        NULL as precio_oferta,
        (SELECT url_imagen FROM imagen_producto WHERE id_producto = p.id_producto LIMIT 1) as imagen_url,
        (SELECT COUNT(*) FROM like_producto lp 
         JOIN modelo m ON lp.id_modelo = m.id_modelo 
         WHERE m.id_producto = p.id_producto) as likes,
        (SELECT COUNT(*) FROM like_producto lp 
         JOIN modelo m ON lp.id_modelo = m.id_modelo 
         WHERE m.id_producto = p.id_producto AND lp.id_cliente = ?) as ya_tiene_like
      FROM producto p
    `;

    // Si hay un texto en el buscador, añadimos la condición WHERE
    if (filtro) {
      sql += " WHERE (p.nombre LIKE ? OR p.descripcion LIKE ?)";
      params.push(`%${filtro}%`, `%${filtro}%`);
    }

    sql += " ORDER BY p.id_producto DESC LIMIT 12";
    
    const productos = await executeQuery(sql, params);
    return productos.map(mapPlainObject);
  } catch (error) {
    console.error("❌ Error en getProductosHome:", error);
    return [];
  }
}

/**
 * Obtiene todos los productos con filtros (Categoría y Búsqueda).
 */
export async function getTodosLosProductos(
  idCategoria?: number, 
  filtro = "", 
  idCliente?: number,
  genero = "" 
) {
  try {
    const idCliNum = idCliente ? Number(idCliente) : 0;

    // 1. Agregamos el JOIN con la tabla categoria 'c'
    let sql = `
      SELECT 
        p.*, 
        c.genero as genero_cat, -- Traemos el género de la categoría
        (SELECT id_modelo FROM modelo WHERE id_producto = p.id_producto LIMIT 1) as id_modelo,
        (SELECT MIN(precio) FROM modelo WHERE id_producto = p.id_producto) as precio,
        NULL as precio_oferta,
        (SELECT url_imagen FROM imagen_producto WHERE id_producto = p.id_producto LIMIT 1) as imagen_url,
        (SELECT COUNT(*) FROM like_producto lp 
         JOIN modelo m ON lp.id_modelo = m.id_modelo 
         WHERE m.id_producto = p.id_producto) as likes,
        (SELECT COUNT(*) FROM like_producto lp 
         JOIN modelo m ON lp.id_modelo = m.id_modelo 
         WHERE m.id_producto = p.id_producto AND lp.id_cliente = ?) as ya_tiene_like
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
    `;
    
    const params: any[] = [idCliNum];
    const conditions: string[] = [];

    // 2. Filtro de Categoría
    if (idCategoria) {
      const idCatNum = Number(idCategoria);
      if (!isNaN(idCatNum)) {
        conditions.push("p.id_categoria = ?");
        params.push(idCatNum);
      }
    }

    // 3. Filtro de Búsqueda
    if (filtro) {
      conditions.push("(p.nombre LIKE ? OR p.descripcion LIKE ?)");
      params.push(`%${filtro}%`, `%${filtro}%`);
    }

    // 4. CORRECCIÓN DE GÉNERO: Usamos c.genero (de la tabla categoría)
    if (genero === "Hombre") {
      conditions.push("(c.genero = 'Hombre' OR c.genero = 'Unisex')");
    } else if (genero === "Mujer") {
      conditions.push("(c.genero = 'Mujer' OR c.genero = 'Unisex')");
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY p.id_producto DESC";

    const productos = await executeQuery(sql, params);
    return productos.map(mapPlainObject);
    
  } catch (error) {
    console.error("❌ Error en getTodosLosProductos:", error);
    return [];
  }
}

/**
 * Detalle de producto por ID.
 */
export async function getProductoById(id: number | string, idCliente?: number) {
  try {
    const idNum = Number(id);
    const idCliNum = idCliente ? Number(idCliente) : 0;
    
    if (isNaN(idNum) || !isFinite(idNum)) return null;

    const sql = `
      SELECT p.*,
      (SELECT id_modelo FROM modelo WHERE id_producto = p.id_producto LIMIT 1) as id_modelo,
      (SELECT COUNT(*) FROM like_producto lp 
          JOIN modelo m ON lp.id_modelo = m.id_modelo 
          WHERE m.id_producto = p.id_producto) as likes,
      (SELECT COUNT(*) FROM like_producto lp 
          JOIN modelo m ON lp.id_modelo = m.id_modelo 
          WHERE m.id_producto = p.id_producto AND lp.id_cliente = ?) as ya_tiene_like
      FROM producto p 
      WHERE p.id_producto = ?
    `;
    
    const resultado = await executeQuery(sql, [idCliNum, idNum]);
    
    if (resultado.length === 0) return null;
    return mapPlainObject(resultado[0]);
  } catch (error) {
    console.error(`❌ Error al obtener producto ${id}:`, error);
    return null;
  }
}

/**
 * Obtiene los modelos (tallas/variaciones) de un producto específico.
 */
export async function getModelosDeProducto(idProducto: number | string, idCliente?: number) {
  try {
    const idNum = Number(idProducto);
    const idCliNum = idCliente ? Number(idCliente) : 0;

    if (isNaN(idNum) || !isFinite(idNum)) return [];

    const sql = `
      SELECT m.*, 
      (SELECT COUNT(*) FROM like_producto WHERE id_modelo = m.id_modelo) as likes,
      (SELECT COUNT(*) FROM like_producto WHERE id_modelo = m.id_modelo AND id_cliente = ?) as ya_tiene_like
      FROM modelo m 
      WHERE m.id_producto = ?
    `;
    
    const modelos = await executeQuery(sql, [idCliNum, idNum]);
    return modelos.map(mapPlainObject);
  } catch (error) {
    console.error("❌ Error en getModelosDeProducto:", error);
    return [];
  }
}

export async function checkUserLike(idModelo: number, idCliente: number) {
  try {
    const idModNum = Number(idModelo);
    const idCliNum = Number(idCliente);
    if (isNaN(idModNum) || isNaN(idCliNum)) return false;
    const sql = "SELECT 1 FROM like_producto WHERE id_modelo = ? AND id_cliente = ?";
    const result = await executeQuery(sql, [idModNum, idCliNum]);
    return result.length > 0;
  } catch { return false; }
}

export async function getResenasProducto(idProducto: number | string) {
  try {
    const idNum = Number(idProducto);
    if (isNaN(idNum) || !isFinite(idNum)) return [];
    const sql = `
      SELECT r.*, c.nombre as nombre_cliente
      FROM resena r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN modelo m ON r.id_modelo = m.id_modelo
      WHERE m.id_producto = ?
      ORDER BY r.fecha DESC
    `;
    const resenas = await executeQuery(sql, [idNum]);
    return resenas.map((r: any) => ({
      ...r,
      id_resena: Number(r.id_resena),
      id_modelo: Number(r.id_modelo),
      id_cliente: Number(r.id_cliente),
      calificacion: Number(r.calificacion)
    }));
  } catch { return []; }
}

export async function getImagenesProducto(idProducto: number | string) {
  try {
    const idNum = Number(idProducto);
    if (isNaN(idNum) || !isFinite(idNum)) return [];
    const sql = "SELECT url_imagen FROM imagen_producto WHERE id_producto = ?";
    const imagenes = await executeQuery(sql, [idNum]);
    return imagenes.map((img: any) => ({ ...img }));
  } catch { return []; }
}

export async function getCategoriasConImagen() {
  try {
    const sql = `
      SELECT c.*,
      (SELECT ip.url_imagen FROM imagen_producto ip
       JOIN producto p ON ip.id_producto = p.id_producto 
       WHERE p.id_categoria = c.id_categoria LIMIT 1) as imagen_url
      FROM categoria c
    `;
    const categorias = await executeQuery(sql);
    return categorias.map((cat: any) => ({
      ...cat,
      id_categoria: Number(cat.id_categoria)
    }));
  } catch { return []; }
}

export async function getAnuncios() {
  try {
    const sql = "SELECT * FROM anuncio WHERE activo = 1 ORDER BY id_anuncio DESC";
    const anuncios = await executeQuery(sql);
    return anuncios.map((a: any) => ({
      ...a,
      id_anuncio: Number(a.id_anuncio),
      id_producto: a.id_producto ? Number(a.id_producto) : null,
      descuento: Number(a.descuento || 0)
    }));
  } catch (error) {
    console.error("❌ Error en getAnuncios:", error);
    return [];
  }
}

/**
 * Obtiene los productos favoritos del cliente.
 * Se asegura de que el JOIN con like_producto sea preciso.
 */
export async function getProductosFavoritos(idCliente: number) {
  try {
    const idCliNum = Number(idCliente);
    if (!idCliNum) return [];

    const sql = `
      SELECT DISTINCT
        p.id_producto, 
        p.nombre, 
        p.id_categoria,
        p.descripcion,
        -- Traemos el ID del modelo que el usuario LIKEÓ específicamente
        m.id_modelo, 
        m.precio,
        NULL as precio_oferta,
        (SELECT url_imagen FROM imagen_producto WHERE id_producto = p.id_producto LIMIT 1) as imagen_url,
        -- Conteo total de likes del producto (global)
        (SELECT COUNT(*) FROM like_producto lp2 
         JOIN modelo m2 ON lp2.id_modelo = m2.id_modelo 
         WHERE m2.id_producto = p.id_producto) as likes,
        -- Siempre es true porque viene de la tabla de likes
        1 as ya_tiene_like 
      FROM producto p
      INNER JOIN modelo m ON p.id_producto = m.id_producto
      INNER JOIN like_producto lp ON m.id_modelo = lp.id_modelo
      WHERE lp.id_cliente = ?
      ORDER BY lp.id_like DESC
    `;

    const productos = await executeQuery(sql, [idCliNum]);
    return productos.map(mapPlainObject);
  } catch (error) {
    console.error("❌ Error en getProductosFavoritos:", error);
    return [];
  }
}
export async function getCategoriasPorGenero(genero = "") {
  try {
    let sql = `
      SELECT DISTINCT c.* FROM categoria c
      JOIN producto p ON c.id_categoria = p.id_categoria
    `;
    
    // 🔍 LA CORRECCIÓN ESTÁ AQUÍ: Añadimos el tipo : any[]
    const params: any[] = []; 

    if (genero === "Hombre") {
      sql += " WHERE (p.genero = 'Hombre' OR p.genero = 'Unisex')";
    } else if (genero === "Mujer") {
      sql += " WHERE (p.genero = 'Mujer' OR p.genero = 'Unisex')";
    }

    sql += " ORDER BY c.nombre ASC";
    
    // Asegúrate de que executeQuery acepte estos parámetros
    return await executeQuery(sql, params);
  } catch (error) {
    console.error("❌ Error en getCategoriasPorGenero:", error);
    return [];
  }
}