import { getDB } from "./sqlDatabase.js";

// USERS

export async function getUserByPublicAddressInternal(publicAddress) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      return reject(new Error("Database not initialized"));
    }

    if (
      !publicAddress ||
      typeof publicAddress !== "string" ||
      publicAddress.length !== 66
    ) {
      return reject(new Error("Invalid public address"));
    }

    const publicAddressLowerCase = publicAddress.toLowerCase();

    db.get(
      "SELECT * FROM users WHERE publicAddress = ?",
      [publicAddressLowerCase],
      (err, row) => {
        if (err) {
          return reject(new Error("Internal server error"));
        }
        resolve(row || null); // Resolve with null if no user is found
      }
    );
  });
}

export async function getUserByPublicAddress(publicAddress) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (
      !publicAddress ||
      typeof publicAddress !== "string" ||
      publicAddress.length !== 66
    ) {
      reject(new Error("Invalid public address"));
    }

    const publicAddressLowerCase = publicAddress.toLowerCase();

    db.get(
      "SELECT * FROM users WHERE publicAddress = ?",
      [publicAddressLowerCase],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }
        if (!row) {
          reject(new Error("No user found"));
        }
        resolve(row); // Resolve with null if no user is found
      }
    );
  });
}

export async function getUserById(id) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!id && typeof id !== "string") {
      reject(new Error("Invalid id"));
    }

    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found"));
      }
      resolve(row);
    });
  });
}

export async function getClientbyPublicAddress(publicAddress) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (
      !publicAddress &&
      typeof publicAddress !== "string" &&
      publicAddress.length !== 66
    ) {
      reject(new Error("Invalid public address"));
    }

    const publicAddressLowerCase = publicAddress.toLowerCase();

    db.get(
      "SELECT * FROM users WHERE isClient = 1 AND publicAddress = ?",
      [publicAddressLowerCase],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }
        if (!row) {
          reject(new Error("No user found"));
        }
        resolve(row);
      }
    );
  });
}

export async function getAuditorbyPublicAddress(publicAddress) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (
      !publicAddress &&
      typeof publicAddress !== "string" &&
      publicAddress.length !== 66
    ) {
      reject(new Error("Invalid public address"));
    }

    const publicAddressLowerCase = publicAddress.toLowerCase();

    db.get(
      "SELECT * FROM users WHERE isAuditor = 1 AND publicAddress = ?",
      [publicAddressLowerCase],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }
        if (!row) {
          reject(new Error("No user found"));
        }
        resolve(row);
      }
    );
  });
}

export async function getAllUsers() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM users ", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found"));
      }
      resolve(row);
    });
  });
}

export async function getAllAuditors() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM users WHERE isAuditor = 1", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found"));
      }
      resolve(row);
    });
  });
}

export async function getAllClients() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM users WHERE isClient = 1", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found"));
      }
      resolve(row);
    });
  });
}

export async function getAllAdmins() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM users WHERE isAdmin = 1", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found"));
      }
      resolve(row);
    });
  });
}

// COMPANIES

export async function getCompanyById(companyId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!companyId && typeof companyId !== "string") {
      reject(new Error("Invalid id"));
    }

    db.get(
      "SELECT * FROM companies WHERE companyId = ?",
      [companyId],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }
        if (!row) {
          reject(new Error("No company found"));
        }
        resolve(row);
      }
    );
  });
}

export async function getAllClientCompanies() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM companies WHERE isClient = 1", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No company found"));
      }
      resolve(row);
    });
  });
}

export async function getAllAuditorCompanies() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM companies WHERE isAudit = 1", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No company found"));
      }
      resolve(row);
    });
  });
}

export async function getAllCompanies() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM companies ", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        resolve("No company found");
      }
      resolve(row);
    });
  });
}

export async function getManagerIdByCompanyId(companyId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!companyId || typeof companyId !== "string") {
      reject(new Error("Invalid companyId"));
    }

    db.get(
      "SELECT companyId FROM companies WHERE companyId = ?",
      [companyId],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }
        if (!row) {
          reject(new Error("No company found with the given companyId"));
        }
        resolve(row.companyId);
      }
    );
  });
}

export async function getCompanyType(companyId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!companyId || typeof companyId !== "string") {
      reject(new Error("Invalid companyId"));
    }

    db.get(
      "SELECT isClient, isAudit FROM companies WHERE companyId = ?",
      [companyId],
      (err, row) => {
        if (err) {
          reject(new Error("Internal server error"));
        }

        if (!row) {
          reject(new Error("No company found with the given companyId"));
        }

        if (row.isAudit === 0 && row.isClient === 1) {
          resolve("client");
        }

        if (row.isAudit === 1 && row.isClient === 0) {
          resolve("audit");
        }

        reject(new Error("Company is neither a client nor an audit entity"));
      }
    );
  });
}

export async function getManagerByCompanyId(companyId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!companyId) {
      reject(new Error("Invalid companyId"));
    }

    const query = `
      SELECT u.*
      FROM companies c
      JOIN companyManagers cm ON c.companyId = cm.managerId
      JOIN users u ON cm.userId = u.id
      WHERE c.companyId = ?;
    `;

    db.all(query, [companyId], (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found for the given companyId"));
      }
      resolve(row);
    });
  });
}

export async function getUsersByCompanyId(companyId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!companyId) {
      reject(new Error("Invalid companyId"));
    }

    const query = `
        SELECT u.*
        FROM companies c
        JOIN usersXcompanies cm ON c.companyId = cm.companyId
        JOIN users u ON cm.userId = u.id
        WHERE c.companyId = ?
    `;

    db.all(query, [companyId], (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No user found for the given companyId"));
      }
      resolve(row);
    });
  });
}

export async function getCompanyByUserId(userId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!userId) {
      reject(new Error("Invalid userId"));
    }

    const query = `
      SELECT c.*
      FROM users u
      JOIN usersXcompanies cm ON u.id = cm.userId
      JOIN companies c ON cm.companyId = c.companyId
      WHERE u.id = ?
    `;
    db.all(query, [userId], (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No company found for the given userId"));
      }
      resolve(row);
    });
  });
}

export async function getScopebyUserId(userId) {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    if (!userId) {
      reject(new Error("Invalid userId"));
    }

    const query = `
      SELECT s.*
      FROM scopes AS s
      JOIN usersXcompanies AS ux ON ux.companyId = s.assignedAuditorCompany OR ux.companyId = s.assignedClientCompany
      WHERE ux.userId = ?;
    `;
    db.all(query, [userId], (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        reject(new Error("No scope found for the given userId"));
      }
      resolve(row);
    });
  });
}

export async function getAllScopes() {
  return new Promise((resolve, reject) => {
    const db = getDB();

    if (!db) {
      reject(new Error("Database not initialized"));
    }

    db.all("SELECT * FROM scopes ", (err, row) => {
      if (err) {
        reject(new Error("Internal server error"));
      }
      if (!row) {
        resolve("No scope found");
      }
      resolve(row);
    });
  });
}
