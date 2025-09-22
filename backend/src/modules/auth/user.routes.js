import express from "express";
import { getAllUsers, getUser, updateStatus } from "./user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateStatus);

export default router;