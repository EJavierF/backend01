const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [
        {
            // Referencia al modelo Product usando ObjectId
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // 'Product' es el nombre del modelo de productos
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
