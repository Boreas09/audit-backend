import express from "express";
import { validationResult } from "express-validator";
import {
  getCompanyById,
  getAllAuditorCompanies,
  getAllClientCompanies,
  getManagerIdByCompanyId,
  getCompanyType,
  getManagerByCompanyId,
  getUsersByCompanyId,
  getAllCompanies,
  getCompanyByUserId,
  getScopebyUserId,
  getAllScopes,
} from "../db/read.js";
import {
  removeUserFromCompany,
  assignUserToCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  assignManagerToCompany,
  removeManagerFromCompany,
} from "../db/write.js";
import {
  getByIdValidationRules,
  getAllValidationRules,
  assignUserToCompanyValidationRules,
  createCompanyValidationRules,
  updateCompanyValidationRules,
} from "../validations/companyValidations.js";

const router = express.Router();

router.post(
  "/createCompany",
  createCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const company = req.body;
      const data = await createCompany(company);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

//only owner
router.put(
  "/updateCompany/:id",
  updateCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const company = req.body;
      const data = await updateCompany(company, id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

// only owner
router.delete(
  "/deleteCompany/:id",
  getByIdValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const data = await deleteCompany(id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.post(
  "/assignUserToCompany",
  assignUserToCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { userId, companyId } = req.body;
      const usersInCompany = await getUsersByCompanyId(companyId);

      if (usersInCompany.filter((user) => user.id === userId).length > 0) {
        return res.status(400).json({ error: "User already in company." });
      }

      const data = await assignUserToCompany(userId, companyId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.post(
  "/removeUserFromCompany",
  assignUserToCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, companyId } = req.body;

      const usersInCompany = await getUsersByCompanyId(companyId);

      if (usersInCompany.filter((user) => user.id === userId).length === 0) {
        return res
          .status(400)
          .json({ error: "There is no user in company with given ID." });
      }
      const data = await removeUserFromCompany(userId, companyId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

//make it so that only the company owner can assign a manager
router.post(
  "/assignManagerToCompany",
  assignUserToCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, companyId } = req.body;
      const managersInCompany = await getManagerByCompanyId(companyId);

      if (managersInCompany.filter((user) => user.id === userId).length > 0) {
        return res
          .status(400)
          .json({ error: "User is already manager in company." });
      }

      const data = await assignManagerToCompany(userId, companyId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

// make it so that only the company owner can remove a manager
router.post(
  "/removeManagerFromCompany",
  assignUserToCompanyValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, companyId } = req.body;
      const managersInCompany = await getManagerByCompanyId(companyId);

      if (managersInCompany.filter((user) => user.id === userId).length === 0) {
        return res
          .status(400)
          .json({ error: "There is no manager in company with given ID." });
      }
      const data = await removeManagerFromCompany(userId, companyId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get("/getAllCompanies", getAllValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = await getAllCompanies();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

router.get(
  "/getAllAuditorCompanies",
  getAllValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await getAllAuditorCompanies();
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get(
  "/getAllClientCompanies",
  getAllValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await getAllClientCompanies();
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get(
  "/getManagerIdByCompanyId/:id",
  getByIdValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const data = await getManagerIdByCompanyId(id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get("/getCompanyType/:id", getByIdValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const data = await getCompanyType(id);
    res.json({ type: data });
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

router.get(
  "/getManagersByCompanyId/:id",
  getByIdValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const data = await getManagerByCompanyId(id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get(
  "/getUsersByCompanyId/:id",
  getByIdValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const data = await getUsersByCompanyId(id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get("/getCompanyById/:id", getByIdValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const data = await getCompanyById(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

router.get(
  "/getCompanyByUserId/:id",
  getByIdValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const data = await getCompanyByUserId(id);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message || error });
    }
  }
);

router.get("/scopeByUserId/:id", getByIdValidationRules, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const data = await getScopebyUserId(id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

router.get("/getAllScopes", async (req, res) => {
  try {
    const data = await getAllScopes();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
});

export default router;
