const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class CartManager {
    constructor(filePath) {
        this.path = path.join(__dirname, filePath);
        this.carts = [];
        this.loadCarts();
    }

    async loadCarts() {
        try {
            const dataDir = path.dirname(this.path);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf8');
                this.carts = JSON.parse(data);
            } else {
                await this.saveCarts();
            }
        } catch (error) {
            console.error('Error al cargar carritos:', error);
            this.carts = [];
        }
    }

    async saveCarts() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
        } catch (error) {
            console.error('Error al guardar carritos:', error);
        }
    }

    async createCart() {
        const newCart = {
            id: uuidv4(),
            products: []
        };
        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    async getCartById(id) {
        const cart = this.carts.find(c => c.id === id);
        if (!cart) {
            throw new Error('Carrito no encontrado.');
        }
        return cart;
    }

    async addProductToCart(cartId, productId) {
        const cartIndex = this.carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado.');
        }

        const cart = this.carts[cartIndex];
        const productInCartIndex = cart.products.findIndex(p => p.product === productId);

        if (productInCartIndex !== -1) {
            cart.products[productInCartIndex].quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this.saveCarts();
        return cart;
    }
}

module.exports = CartManager;
