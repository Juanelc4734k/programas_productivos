import mongoose from 'mongoose';

// Esquema para noticias
const newsSchema = new mongoose.Schema({
    imagen: {
        type: String,
        required: false,
        default: null
    },
    titulo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    vistas: {
        type: Number,
        default: 0
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados']
    },
    destacada: {
        type: Boolean,
        default: false
    },
    temas: [{
        type: String,
        enum: ['Cafe', 'Tecnologia', 'Comercializacion', 'Ganaderia', 'Agricultura']
    }],
    hashtags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    lugar: {
        type: String,
        trim: true
    },
    // Usuarios que han agregado esta noticia a favoritos
    favoritos: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fechaAgregado: {
            type: Date,
            default: Date.now
        }
    }],
    // Estado de la noticia
    estado: {
        type: String,
        enum: ['borrador', 'publicada', 'archivada'],
        default: 'borrador'
    },
    // Metadatos adicionales
    metadatos: {
        resumen: String,
        palabrasClave: [String],
        tiempoLectura: Number // en minutos
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Esquema para eventos
const eventSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Programas', 'Capacitaciones', 'Eventos', 'Convocatorias', 'Logros y Resultados']
    },
    fechaEvento: {
        type: Date,
        required: true
    },
    horarioEvento: {
        inicio: {
            type: String,
            required: true
        },
        fin: {
            type: String,
            required: false
        }
    },
    lugar: {
        type: String,
        required: true,
        trim: true
    },
    participantes: {
        maximo: {
            type: Number,
            default: null
        },
        registrados: [{
            usuario: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            fechaRegistro: {
                type: Date,
                default: Date.now
            },
            estado: {
                type: String,
                enum: ['confirmado', 'pendiente', 'cancelado'],
                default: 'pendiente'
            }
        }]
    },
    organizador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Campos adicionales útiles
    imagen: {
        type: String,
        required: false
    },
    estado: {
        type: String,
        enum: ['programado', 'en_curso', 'finalizado', 'cancelado'],
        default: 'programado'
    },
    requisitos: [String],
    materiales: [String],
    contacto: {
        telefono: String,
        email: String
    },
    // Usuarios que han agregado este evento a favoritos
    favoritos: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fechaAgregado: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para optimizar consultas
newsSchema.index({ categoria: 1, fecha: -1 });
newsSchema.index({ temas: 1 });
newsSchema.index({ hashtags: 1 });
newsSchema.index({ destacada: 1, fecha: -1 });
newsSchema.index({ autor: 1 });
newsSchema.index({ 'favoritos.usuario': 1 });

eventSchema.index({ categoria: 1, fechaEvento: 1 });
eventSchema.index({ fechaEvento: 1 });
eventSchema.index({ organizador: 1 });
eventSchema.index({ 'participantes.registrados.usuario': 1 });
eventSchema.index({ 'favoritos.usuario': 1 });

// Virtuals para noticias
newsSchema.virtual('totalFavoritos').get(function() {
    return this.favoritos ? this.favoritos.length : 0;
});

newsSchema.virtual('esFavorito').get(function() {
    // Este virtual se puede usar cuando se consulte con un usuario específico
    return false; // Se establecerá dinámicamente en el controlador
});

// Virtuals para eventos
eventSchema.virtual('totalParticipantes').get(function() {
    return this.participantes.registrados ? this.participantes.registrados.length : 0;
});

eventSchema.virtual('lugaresDisponibles').get(function() {
    if (!this.participantes.maximo) return null;
    return this.participantes.maximo - this.totalParticipantes;
});

eventSchema.virtual('totalFavoritos').get(function() {
    return this.favoritos ? this.favoritos.length : 0;
});

// Middleware para incrementar vistas automáticamente
newsSchema.methods.incrementarVistas = function() {
    this.vistas += 1;
    return this.save();
};

// Método para agregar/quitar favoritos en noticias
newsSchema.methods.toggleFavorito = function(userId) {
    const favoritoIndex = this.favoritos.findIndex(
        fav => fav.usuario.toString() === userId.toString()
    );
    
    if (favoritoIndex > -1) {
        // Quitar de favoritos
        this.favoritos.splice(favoritoIndex, 1);
        return { agregado: false, total: this.favoritos.length };
    } else {
        // Agregar a favoritos
        this.favoritos.push({ usuario: userId });
        return { agregado: true, total: this.favoritos.length };
    }
};

// Método para agregar/quitar favoritos en eventos
eventSchema.methods.toggleFavorito = function(userId) {
    const favoritoIndex = this.favoritos.findIndex(
        fav => fav.usuario.toString() === userId.toString()
    );
    
    if (favoritoIndex > -1) {
        // Quitar de favoritos
        this.favoritos.splice(favoritoIndex, 1);
        return { agregado: false, total: this.favoritos.length };
    } else {
        // Agregar a favoritos
        this.favoritos.push({ usuario: userId });
        return { agregado: true, total: this.favoritos.length };
    }
};

// Método para registrarse en un evento
eventSchema.methods.registrarParticipante = function(userId) {
    const yaRegistrado = this.participantes.registrados.some(
        p => p.usuario.toString() === userId.toString()
    );
    
    if (yaRegistrado) {
        throw new Error('El usuario ya está registrado en este evento');
    }
    
    if (this.participantes.maximo && this.totalParticipantes >= this.participantes.maximo) {
        throw new Error('El evento ha alcanzado el máximo de participantes');
    }
    
    this.participantes.registrados.push({ usuario: userId });
    return this.save();
};

const News = mongoose.model('News', newsSchema);
const Event = mongoose.model('Event', eventSchema);

export { News, Event };