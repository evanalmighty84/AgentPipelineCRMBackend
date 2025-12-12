const express = require("express");
const router = express.Router();
const relationshipsController = require("../controllers/relationshipsController");

// GET all relationships for a user
router.get("/user/:userId", relationshipsController.getRelationshipsByUser);

// GET one relationship
router.get("/:id", relationshipsController.getRelationship);

// CREATE new relationship
router.post("/", relationshipsController.createRelationship);

// UPDATE relationship
router.put("/:id", relationshipsController.updateRelationship);

// DELETE relationship
router.delete("/:id", relationshipsController.deleteRelationship);

module.exports = router;
