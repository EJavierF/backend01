const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.path = path.join(__dirname, filePath);
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const dataDir = path.dirname(this.path);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf8');
                this.products = JSON.parse(data);
            } else {
                await this.saveProducts();
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.products = [];
        }
    }

    async saveProducts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error('Error al guardar productos:', error);
        }
    }

    async addProduct(product) {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = product;

        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos obligatorios son requeridos: title, description, code, price, stock, category.');
        }

        const newProduct = {
            id: uuidv4(),
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        };

        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    async getProducts() {
        return this.products;
    }

    async getProductById(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error('Producto no encontrado.');
        }
        return product;
    }

    async updateProduct(id, updatedFields) {
        let productIndex = this.products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado para actualizar.');
        }

        const productToUpdate = { ...this.products[productIndex] };

        delete updatedFields.id;

        const updatedProduct = {
            ...productToUpdate,
            ...updatedFields
        };

        this.products[productIndex] = updatedProduct;
        await this.saveProducts();
        return updatedProduct;
    }

    async deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== id);
        if (this.products.length === initialLength) {
            throw new Error('Producto no encontrado para eliminar.');
        }
        await this.saveProducts();
        return { message: 'Producto eliminado exitosamente.' };
    }
}

module.exports = ProductManager;
