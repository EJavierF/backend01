const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
        this.productIdCounter = 0;
        this.loadProducts(); // Cargar productos al inicializar
    }

    // Carga los productos desde el archivo
    async loadProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf8');
                this.products = JSON.parse(data);
                // Asegurarse de que el contador de IDs sea el correcto
                if (this.products.length > 0) {
                    this.productIdCounter = Math.max(...this.products.map(p => p.id)) + 1;
                } else {
                    this.productIdCounter = 1; // Si no hay productos, empieza en 1
                }
            } else {
                await fs.promises.writeFile(this.path, '[]', 'utf8'); // Crea el archivo si no existe
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.products = []; // Asegura que products sea un array vacío en caso de error
        }
    }

    // Guarda los productos en el archivo
    async saveProducts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf8');
        } catch (error) {
            console.error('Error al guardar productos:', error);
            throw new Error('No se pudieron guardar los productos.');
        }
    }

    // Agrega un nuevo producto
    async addProduct(product) {
        // Validar que el producto tenga todos los campos requeridos
        const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
        for (const field of requiredFields) {
            if (!product[field]) {
                throw new Error(`El campo '${field}' es requerido.`);
            }
        }

        // Validar que el código no exista
        if (this.products.some(p => p.code === product.code)) {
            throw new Error(`El código '${product.code}' ya existe.`);
        }

        const newProduct = {
            id: this.productIdCounter++,
            ...product
        };

        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    // Obtiene todos los productos
    async getProducts() {
        // Asegurarse de que los productos estén cargados antes de devolverlos
        await this.loadProducts();
        return this.products;
    }

    // Obtiene un producto por su ID
    async getProductById(id) {
        await this.loadProducts(); // Asegurarse de que los productos estén cargados
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado.`);
        }
        return product;
    }

    // Modifica un producto existente
    async updateProduct(id, updatedFields) {
        await this.loadProducts(); // Cargar productos antes de modificar
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`Producto con ID ${id} no encontrado para actualizar.`);
        }

        // Asegurarse de que el 'id' no se pueda modificar
        if (updatedFields.id !== undefined) {
            delete updatedFields.id;
        }

        // Si se intenta actualizar el código, verificar que no sea duplicado
        if (updatedFields.code && this.products.some(p => p.code === updatedFields.code && p.id !== id)) {
            throw new Error(`El código '${updatedFields.code}' ya existe en otro producto.`);
        }

        this.products[index] = {
            ...this.products[index],
            ...updatedFields
        };
        await this.saveProducts();
        return this.products[index];
    }

    // Elimina un producto por su ID
    async deleteProduct(id) {
        await this.loadProducts(); // Cargar productos antes de eliminar
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        if (this.products.length === initialLength) {
            throw new Error(`Producto con ID ${id} no encontrado para eliminar.`);
        }
        await this.saveProducts();
        return { message: `Producto con ID ${id} eliminado exitosamente.` };
    }
}

module.exports = ProductManager;