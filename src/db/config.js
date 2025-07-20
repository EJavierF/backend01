const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Asegúrate de tener un servidor MongoDB corriendo localmente o cambia la URL
        await mongoose.connect('mongodb://localhost:27017/ecommerce', {
            // useNewUrlParser: true, // Estas opciones están obsoletas en Mongoose 6+
            // useUnifiedTopology: true, // y no son necesarias.
        });
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        // Salir del proceso si hay un error crítico de conexión a la base de datos
        process.exit(1);
    }
};

module.exports = connectDB;
