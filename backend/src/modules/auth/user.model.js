import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    documento_identidad: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    telefono: {
        type: String,
        required: true,
        trim: true,
    },
    tipo_usuario: {
        type: String,
        required: true,
        trim: true,
        enum: ['campesino', 'funcionario', 'admin'],
        default: 'campesino',
    },
    contrasena: {
        type: String,
        required: true,
        trim: true,
    },
    estado: {
        type: String,
        required: true,
        trim: true,
        enum: ['activo', 'inactivo'],
    },
    fecha_registro: {
        type: Date,
        default: Date.now(),
    },
    // Campos adicionales para campesinos
    vereda: {
        type: String,
        trim: true,
        required: function() { return this.tipo_usuario === 'campesino'; }
    },
    direccion: {
        type: String,
        trim: true,
    },
    // Campos adicionales para funcionarios
    codigo_empleado: {
        type: String,
        trim: true,
        required: function() { return this.tipo_usuario === 'funcionario'; }
    },
    dependencia: {
        type: String,
        trim: true,
        required: function() { return this.tipo_usuario === 'funcionario'; }
    }
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema);