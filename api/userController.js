import express from "express";
import { validationResult } from "express-validator";
import {
  getUserByPublicAddress,
  getUserById,
  getAllUsers,
  getAllAuditors,
  getAllClients,
  getAllAdmins,
} from "../db/read.js";
import { createUser, updateUser, deleteUser } from "../db/write.js";
import {
  getUserByPublicAddressValidationRules,
  getByIdValidationRules,
  getAllValidationRules,
  createUserValidationRules,
  updateUserValidationRules,
} from "../validations/userValidations.js";
import { verifySignature } from "../utils/verifySignature.js";

const router = express.Router();

router.post("/createUser", createUserValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { signedMessage, account, data, signData } = req.body;

    const sign = await verifySignature(account, signData, signedMessage);

    if (!sign) {
      return res.status(400).json({ errors: [{ msg: "Invalid signature" }] });
    }

    if (typeof data.isAdmin === "undefined") {
      data.isAdmin = 0;
    }

    const resp = await createUser(data);
    res.json(resp);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.put("/updateUser/:id", updateUserValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const user = req.body;

    const data = await updateUser(user, id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.delete("/deleteUser/:id", getByIdValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const data = await deleteUser(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.get("/getAllUsers", getAllValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.get("/getAllAuditors", getAllValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await getAllAuditors();
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.get("/getAllClients", getAllValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await getAllClients();
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.get("/getAllAdmins", getAllValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await getAllAdmins();
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

router.get(
  "/getUserByPublicAddress/:publicAddress",
  getUserByPublicAddressValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { publicAddress } = req.params;

      const data = await getUserByPublicAddress(publicAddress);
      res.json(data);
    } catch (error) {
      res.status(400).json({ errors: [{ msg: error.message || error }] });
    }
  }
);

router.get("/getUserById/:id", getByIdValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const data = await getUserById(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ errors: [{ msg: error.message || error }] });
  }
});

export default router;
