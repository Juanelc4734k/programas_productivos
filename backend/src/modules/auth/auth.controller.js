import userModel from "./user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerCampesino = async (req, res) => {
    try {
        const { nombre, documento_identidad, correo, telefono, contrasena, vereda, direccion } = req.body;
        if (!nombre || !documento_identidad || !correo || !telefono || !contrasena || !vereda) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const user = await userModel.findOne({ 
            $or: [
                { documento_identidad },
                { correo }
            ]
        });

        if (user) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const saltRoundes = 10;
        const hashedPassword = await bcryptjs.hash(contrasena, saltRoundes);
        const newUser = new userModel({
            nombre,
            documento_identidad,
            correo,
            telefono,
            tipo_usuario: 'campesino', // ← Agregar esta línea
            vereda,
            direccion,
            contrasena: hashedPassword,
            estado: "activo",
            fecha_registro: Date.now()
        });

        await newUser.save();

        return res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error) {
        console.error('Error en registerCampesino:', error); // ← Agregar log para debugging
        return res.status(500).json({ message: "Error al crear el usuario" });
    }
}

export const registerFuncionario = async (req, res) => {
    try {
        const { nombre, documento_identidad, correo, telefono, contrasena, dependencia } = req.body;
        
        // Log de debugging - datos recibidos
        console.log('=== DEBUG REGISTER FUNCIONARIO ===');
        console.log('Datos recibidos:', {
            nombre,
            documento_identidad,
            correo,
            telefono,
            
            dependencia,
            contrasena: contrasena ? '[PRESENTE]' : '[AUSENTE]'
        });
        
        if (!nombre || !documento_identidad || !correo || !telefono || !contrasena || !dependencia) {
            console.log('Error: Campos faltantes');
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }
        
        // Buscar usuario existente con logs detallados
        console.log('Buscando usuario existente con documento:', documento_identidad, 'o correo:', correo);
        
        const existingUserByDocument = await userModel.findOne({ documento_identidad });
        const existingUserByEmail = await userModel.findOne({ correo });
        
        console.log('Usuario encontrado por documento:', existingUserByDocument ? {
            _id: existingUserByDocument._id,
            nombre: existingUserByDocument.nombre,
            documento_identidad: existingUserByDocument.documento_identidad,
            correo: existingUserByDocument.correo,
            tipo_usuario: existingUserByDocument.tipo_usuario
        } : 'No encontrado');
        
        console.log('Usuario encontrado por correo:', existingUserByEmail ? {
            _id: existingUserByEmail._id,
            nombre: existingUserByEmail.nombre,
            documento_identidad: existingUserByEmail.documento_identidad,
            correo: existingUserByEmail.correo,
            tipo_usuario: existingUserByEmail.tipo_usuario
        } : 'No encontrado');

        if (existingUserByDocument) {
            console.log('Error: Usuario ya existe con el mismo documento de identidad');
            return res.status(400).json({ 
                message: "Ya existe un usuario registrado con este documento de identidad",
                campo: "documento_identidad",
                valor: documento_identidad
            });
        }
        
        if (existingUserByEmail) {
            console.log('Error: Usuario ya existe con el mismo correo electrónico');
            return res.status(400).json({ 
                message: "Ya existe un usuario registrado con este correo electrónico",
                campo: "correo",
                valor: correo
            });
        }
        
        console.log('No se encontraron usuarios duplicados, procediendo con el registro...');

        const saltRoundes = 10;
        const hashedPassword = await bcryptjs.hash(contrasena, saltRoundes);
        
        console.log('Creando nuevo usuario funcionario...');
        const newUser = new userModel({
            nombre,
            documento_identidad,
            correo,
            telefono,
            dependencia,
            tipo_usuario: 'funcionario',
            contrasena: hashedPassword,
            estado: "inactivo",
            fecha_registro: Date.now()
        });

        const savedUser = await newUser.save();
        console.log('Usuario funcionario creado exitosamente:', {
            _id: savedUser._id,
            nombre: savedUser.nombre,
            documento_identidad: savedUser.documento_identidad,
            correo: savedUser.correo,
            dependencia: savedUser.dependencia,
            tipo_usuario: savedUser.tipo_usuario,
            estado: savedUser.estado
        });
        console.log('=== FIN DEBUG REGISTER FUNCIONARIO ===');

        return res.status(201).json({ message: "Funcionario creado correctamente, pendiente de activación." });
    } catch (error) {
        console.error('Error en registerFuncionario:', error);
        console.log('=== ERROR DEBUG REGISTER FUNCIONARIO ===');
        
        // Si es un error de duplicado de MongoDB
        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyPattern)[0];
            console.log('Error de duplicado en campo:', duplicatedField);
            return res.status(400).json({ 
                message: `Ya existe un usuario con este ${duplicatedField === 'documento_identidad' ? 'documento de identidad' : duplicatedField}`,
                campo: duplicatedField,
                error: 'DUPLICATE_KEY'
            });
        }
        
        return res.status(500).json({ message: "Error al crear el usuario", error: error.message });
    }
}

export const loginCampesino = async (req, res) => {
    try {
        const { correo, documento_identidad, contrasena } = req.body;
        if ((!correo && !documento_identidad) || !contrasena) {
            return res.status(400).json({ message: "Debe proporcionar correo o documento de identidad, y contraseña" });
        }

        const user = await userModel.findOne({
            $or: [
                { documento_identidad },
                { correo }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        if (user.tipo_usuario !== 'campesino') {
            return res.status(400).json({ message: "El usuario no es un campesino" });
        }

        if (user.estado!== 'activo') {
            return res.status(400).json({ message: "El usuario no esta activo" });
        }

        const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({
            id: user._id,
            tipo_usuario: user.tipo_usuario
        }, process.env.JWT_SECRET, {expiresIn: '1d'});
        
        return res.status(200).json({ 
            message: "Usuario logueado correctamente",
            token 
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al loguear el usuario" });
    }
}

export const loginFuncionario = async (req, res) => {
    try {
        const { correo, documento_identidad, contrasena } = req.body;
        if (!correo && !documento_identidad ||!contrasena) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const user = await userModel.findOne({
            $or: [
                { documento_identidad },
                { correo }
            ]
        })

        if (!user) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        if (user.tipo_usuario!== 'funcionario') {
            return res.status(400).json({ message: "El usuario no es un funcionario" });
        }

        if (user.estado!== 'activo') {
            return res.status(400).json({ message: "El usuario no esta activo" });
        }

        const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({
            id: user._id,
            tipo_usuario: user.tipo_usuario
        }, process.env.JWT_SECRET, {expiresIn: '1d'});

        return res.status(200).json({
            message: "Usuario logueado correctamente",
            token
        })
    } catch (error) {
        return res.status(500).json({ message: "Error al loguear el usuario" });
    }
}

export const loginAdmin = async (req, res) => {
    try {
        const { correo, documento_identidad, contrasena } = req.body;
        if ((!correo && !documento_identidad) || !contrasena) {
            return res.status(400).json({ message: "Debe proporcionar correo o documento de identidad, y contraseña" });
        }

        const user = await userModel.findOne({
            $or: [
                { documento_identidad },
                { correo }
            ]
        })

        if (!user) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        if (user.tipo_usuario !== 'admin') {
            return res.status(400).json({ message: "El usuario no es un administrador" });
        }

        if (user.estado !== 'activo') {
            return res.status(400).json({ message: "El usuario no esta activo" });
        }

        const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({
            id: user._id,
            tipo_usuario: user.tipo_usuario
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: "Usuario administrador logueado correctamente",
            token
        })
    } catch (error) {
        return res.status(500).json({ message: "Error al loguear el administrador" });
    }
}

export const me = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ message: "El usuario no existe" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el usuario" });
    }
}
