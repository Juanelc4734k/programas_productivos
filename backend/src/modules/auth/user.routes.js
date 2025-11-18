import express from "express";
import { getAllUsers, getUser, updateStatus, deleteUser } from "./user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateStatus);
router.delete("/:id", deleteUser);

export default router;