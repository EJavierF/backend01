const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true }, // Campo para disponibilidad
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
});

// Aplicar el plugin de paginación al esquema de producto
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
