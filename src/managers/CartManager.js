const Cart = require('../dao/models/Cart');
const Product = require('../dao/models/Product'); // Necesario para validar la existencia del producto

class CartManager {
    constructor() {
        // El constructor ya no necesita una ruta de archivo.
    }

    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            return newCart.toObject(); // Devolver un objeto plano
        } catch (error) {
            console.error('Error al crear carrito en DB:', error);
            throw new Error('Error al crear carrito.');
        }
    }

    async getCartById(id) {
        try {
            // Usar populate para traer los detalles completos de los productos
            const cart = await Cart.findById(id).populate('products.product').lean();
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }
            return cart;
        } catch (error) {
            console.error('Error al obtener carrito por ID en DB:', error);
            throw new Error('Error al obtener carrito.');
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }

            // Validar si el producto existe en la colección de productos
            const productExists = await Product.findById(productId);
            if (!productExists) {
                throw new Error('Producto no existe.');
            }

            const productInCart = cart.products.find(p => p.product.toString() === productId);

            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            return cart.toObject(); // Devolver objeto plano
        } catch (error) {
            console.error('Error al agregar producto al carrito en DB:', error);
            throw new Error('Error al agregar producto al carrito.');
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }

            const initialLength = cart.products.length;
            cart.products = cart.products.filter(p => p.product.toString() !== productId);

            if (cart.products.length === initialLength) {
                throw new Error('Producto no encontrado en el carrito.');
            }

            await cart.save();
            return cart.toObject(); // Devolver objeto plano
        } catch (error) {
            console.error('Error al eliminar producto del carrito en DB:', error);
            throw new Error('Error al eliminar producto del carrito.');
        }
    }

    async updateCartProducts(cartId, newProductsArray) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }

            // Validar que todos los IDs de producto en el nuevo arreglo existan
            for (const item of newProductsArray) {
                if (!item.product || typeof item.quantity !== 'number' || item.quantity < 0) {
                    throw new Error('Formato de producto inválido en el arreglo.');
                }
                const productExists = await Product.findById(item.product);
                if (!productExists) {
                    throw new Error(`Producto con ID ${item.product} no existe.`);
                }
            }

            cart.products = newProductsArray;
            await cart.save();
            return cart.toObject(); // Devolver objeto plano
        } catch (error) {
            console.error('Error al actualizar productos del carrito en DB:', error);
            throw new Error('Error al actualizar productos del carrito.');
        }
    }

    async updateProductQuantityInCart(cartId, productId, newQuantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }

            const productInCart = cart.products.find(p => p.product.toString() === productId);
            if (!productInCart) {
                throw new Error('Producto no encontrado en el carrito.');
            }

            if (newQuantity <= 0) {
                // Si la cantidad es 0 o menos, eliminar el producto del carrito
                cart.products = cart.products.filter(p => p.product.toString() !== productId);
            } else {
                productInCart.quantity = newQuantity;
            }

            await cart.save();
            return cart.toObject(); // Devolver objeto plano
        } catch (error) {
            console.error('Error al actualizar cantidad de producto en carrito en DB:', error);
            throw new Error('Error al actualizar cantidad de producto en carrito.');
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado.');
            }
            cart.products = [];
            await cart.save();
            return cart.toObject(); // Devolver objeto plano
        } catch (error) {
            console.error('Error al vaciar carrito en DB:', error);
            throw new Error('Error al vaciar carrito.');
        }
    }
}

module.exports = CartManager;
