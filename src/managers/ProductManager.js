const Product = require('../dao/models/Product');

class ProductManager {
    constructor() {
        // El constructor ya no necesita una ruta de archivo, interactúa directamente con el modelo de Mongoose.
    }

    async addProduct(product) {
        try {
            const newProduct = new Product(product);
            await newProduct.save();
            return newProduct.toObject(); // Devolver un objeto plano
        } catch (error) {
            console.error('Error al agregar producto en DB:', error);
            throw new Error('Error al agregar producto.');
        }
    }

    // Método para obtener productos con paginación, filtros y ordenamiento
    async getProductsPaginated(limit = 10, page = 1, sort = null, query = {}) {
        try {
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                lean: true, // Devolver objetos JavaScript planos (más rápido para Handlebars)
                sort: {}
            };

            // Aplicar ordenamiento por precio si se especifica
            if (sort === 'asc') {
                options.sort.price = 1; // 1 para ascendente
            } else if (sort === 'desc') {
                options.sort.price = -1; // -1 para descendente
            }

            // Construir filtro de consulta
            let filter = {};
            if (query.category) {
                filter.category = query.category;
            }
            // Para buscar por disponibilidad (status)
            if (query.status !== undefined) {
                filter.status = query.status; // Asume que 'status' es un booleano (true/false)
            }
            // Puedes añadir más filtros aquí (ej. por 'code', 'title', etc.)

            const result = await Product.paginate(filter, options);

            // Construir los links para la paginación
            // Nota: Los links se construirán en el router de vistas para tener acceso a req.protocol y req.get('host')
            // Aquí solo devolvemos los datos necesarios para que el router los construya.
            return {
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                // prevLink y nextLink se construirán en el router de vistas
            };

        } catch (error) {
            console.error('Error al obtener productos paginados:', error);
            return {
                status: 'error',
                payload: [],
                message: 'Error al obtener productos paginados.'
            };
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id).lean();
            if (!product) {
                throw new Error('Producto no encontrado.');
            }
            return product;
        } catch (error) {
            console.error('Error al obtener producto por ID en DB:', error);
            throw new Error('Error al obtener producto.');
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            // No permitir actualizar ni eliminar el ID
            delete updatedFields.id;
            const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true }).lean();
            if (!updatedProduct) {
                throw new Error('Producto no encontrado para actualizar.');
            }
            return updatedProduct;
        } catch (error) {
            console.error('Error al actualizar producto en DB:', error);
            throw new Error('Error al actualizar producto.');
        }
    }

    async deleteProduct(id) {
        try {
            const result = await Product.findByIdAndDelete(id);
            if (!result) {
                throw new Error('Producto no encontrado para eliminar.');
            }
            return { message: 'Producto eliminado exitosamente.' };
        } catch (error) {
            console.error('Error al eliminar producto en DB:', error);
            throw new Error('Error al eliminar producto.');
        }
    }
}

module.exports = ProductManager;
