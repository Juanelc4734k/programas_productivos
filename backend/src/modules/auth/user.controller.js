import userModel from "./user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) return res.status(404).json({ message: "El usuario no existe" });
        res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) return res.status(404).json({ message: "El usuario no existe" });
        user.estado = user.estado === "activo" ? "inactivo" : "activo";
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}