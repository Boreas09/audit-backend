import { getUserByPublicAddress } from "./read.js";
import { getDB } from "./sqlDatabase.js";

//USERS

function validateRole(user) {
  if (!user.isAdmin && !user.isClient && !user.isAuditor && !user.isAudit) {
    return true;
  }
  const roles = [user.isAdmin, user.isClient, user.isAuditor, user.isAudit];

  // Check that exactly one role is 1 and the others are 0
  const validRoles = roles.filter((role) => role === 1);

  if (validRoles.length !== 1) {
    return false; // Validation failed
  }

  return true; // Validation passed
}

// henüz bitmedi daha yapılması gerekiyor,
export async function onlyOwner(companyId, address) {
  const db = getDB();

  return new Promise(async (resolve, reject) => {
    user = await getUserByPublicAddress(address);

    db.get(
      `SELECT owner FROM companies WHERE companyId = ?`,
      [companyId],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        if (row.owner !== user.id) {
          return reject(new Error("onlyOwner"));
        }
        resolve();
      }
    );
  });
}

export async function createUser(user) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    if (!validateRole(user)) {
      reject(new Error("Can not have multiple roles"));
    }

    db.run(
      `INSERT INTO users (name, publicAddress, mail, github, telegram, isAdmin, isAuditor, isClient) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.name,
        user.publicAddress,
        user.mail,
        user.github,
        user.telegram,
        user.isAdmin,
        user.isAuditor,
        user.isClient,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ msg: "user created successfully" });
        }
      }
    );
  });
}

//id ye göre
export async function updateUser(user, id) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    const { name, email, github, telegram } = user;
    // Initialize an array for the query parameters
    let query = "UPDATE users SET ";
    let values = [];

    // Add dynamic fields to the query if they are provided
    if (name) {
      query += "name = ?, ";
      values.push(name);
    }
    if (email) {
      query += "email = ?, ";
      values.push(email);
    }
    if (github) {
      query += "github = ?, ";
      values.push(github);
    }
    if (telegram) {
      query += "telegram = ?, ";
      values.push(telegram);
    }

    // Remove the last comma and space from the query
    query = query.slice(0, -2); // Remove the trailing ", "

    // Add the WHERE clause
    query += " WHERE id = ?";
    values.push(id); // Add userId to the query

    db.run(query, values, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ msg: "User updated successfully" });
      }
    });
  });
}

export async function deleteUser(id) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(`SELECT id FROM users WHERE id = ?`, [id], (userErr, userRow) => {
        if (userErr) {
          return reject(
            new Error("Error checking user existence: " + userErr.message)
          );
        }
        if (!userRow) {
          return reject(new Error("User with the given ID does not exist"));
        }

        db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
          if (err) {
            reject(new Error("No user with given id: " + err.message));
          } else {
            resolve({ msg: "user deleted successfully" });
          }
        });
      });
    });
  });
}

export async function assignUserToCompany(userId, companyId) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(
        `SELECT id FROM users WHERE id = ?`,
        [userId],
        (userErr, userRow) => {
          if (userErr) {
            return reject(
              new Error("Error checking user existence: " + userErr.message)
            );
          }
          if (!userRow) {
            return reject(new Error("User with the given ID does not exist"));
          }

          // Check if the company exists
          db.get(
            `SELECT companyId FROM companies WHERE companyId = ?`,
            [companyId],
            (companyErr, companyRow) => {
              if (companyErr) {
                return reject(
                  new Error(
                    "Error checking company existence: " + companyErr.message
                  )
                );
              }
              if (!companyRow) {
                return reject(
                  new Error("Company with the given ID does not exist")
                );
              }

              // If both exist, proceed with the insertion
              db.run(
                `INSERT INTO usersXcompanies (userId, companyId) VALUES (?, ?)`,
                [userId, companyId],
                function (err) {
                  if (err) {
                    return reject(
                      new Error(
                        "Error inserting into usersXcompanies: " + err.message
                      )
                    );
                  }
                  resolve({
                    msg: `user ${userId} assigned to company ${companyId}`,
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

export async function removeUserFromCompany(userId, companyId) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(
        `SELECT id FROM users WHERE id = ?`,
        [userId],
        (userErr, userRow) => {
          if (userErr) {
            return reject(
              new Error("Error checking user existence: " + userErr.message)
            );
          }
          if (!userRow) {
            return reject(new Error("User with the given ID does not exist"));
          }

          // Check if the company exists
          db.get(
            `SELECT companyId FROM companies WHERE companyId = ?`,
            [companyId],
            (companyErr, companyRow) => {
              if (companyErr) {
                return reject(
                  new Error(
                    "Error checking company existence: " + companyErr.message
                  )
                );
              }
              if (!companyRow) {
                return reject(
                  new Error("Company with the given ID does not exist")
                );
              }

              // If both exist, proceed with the insertion
              db.run(
                `DELETE FROM usersXcompanies WHERE userId = ? AND companyId = ?`,
                [userId, companyId],
                function (err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      msg: `user ${userId} removed from company ${companyId}`,
                    });
                  }
                }
              );
            }
          );
        }
      );
    });
  });
}

export async function createCompany(company) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    if (!validateRole(user)) {
      reject(new Error("Can not have multiple roles"));
    }

    db.run(
      `INSERT INTO company (isClient, isAudit, name, address , email , telegram , website, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company.isClient,
        company.isAudit,
        company.name,
        company.address,
        company.email,
        company.telegram,
        company.website,
        company.owner,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ msg: "Company created successfully" });
        }
      }
    );
  });
}

//id ye göre
export async function updateCompany(company, id) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    // Initialize query components
    let query = "UPDATE companies SET ";
    let values = [];

    if (company.name) {
      query += "name = ?, ";
      values.push(company.name);
    }
    if (company.address) {
      query += "address = ?, ";
      values.push(company.address);
    }
    if (company.email) {
      query += "email = ?, ";
      values.push(company.email);
    }
    if (company.telegram) {
      query += "telegram = ?, ";
      values.push(company.telegram);
    }
    if (company.website) {
      query += "website = ?, ";
      values.push(company.website);
    }

    // Remove trailing comma and space from query
    query = query.slice(0, -2);

    // Add WHERE clause
    query += " WHERE companyId = ?";
    values.push(id);

    db.run(query, values, function (err) {
      if (err) {
        return reject(err);
      }
      if (this.changes === 0) {
        return reject(new Error("No company found with the given ID"));
      }
      resolve({
        msg: "Company updated successfully",
        companyId: id,
      });
    });
  });
}

export async function deleteCompany(id) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(
        `SELECT companyId FROM companies WHERE companyId = ?`,
        [id],
        (compErr, compRow) => {
          if (compErr) {
            return reject(
              new Error("Error checking user existence: " + compErr.message)
            );
          }
          if (!compRow) {
            return reject(
              new Error("Company with the given ID does not exist")
            );
          }

          db.run(
            `DELETE FROM companies WHERE companyId = ?`,
            [id],
            function (err) {
              if (err) {
                reject(new Error("No company with given id: " + err.message));
              } else {
                resolve({ msg: "company deleted successfully" });
              }
            }
          );
        }
      );
    });
  });
}

export async function assignManagerToCompany(userId, companyId) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(
        `SELECT id FROM users WHERE id = ?`,
        [userId],
        (userErr, userRow) => {
          if (userErr) {
            return reject(
              new Error("Error checking user existence: " + userErr.message)
            );
          }
          if (!userRow) {
            return reject(new Error("User with the given ID does not exist"));
          }

          // Check if the company exists
          db.get(
            `SELECT companyId FROM companies WHERE companyId = ?`,
            [companyId],
            (companyErr, companyRow) => {
              if (companyErr) {
                return reject(
                  new Error(
                    "Error checking company existence: " + companyErr.message
                  )
                );
              }
              if (!companyRow) {
                return reject(
                  new Error("Company with the given ID does not exist")
                );
              }

              // If both exist, proceed with the insertion
              db.run(
                `INSERT INTO companyManagers (managerId, userId) VALUES (?, ?)`,
                [companyId, userId],
                function (err) {
                  if (err) {
                    return reject(
                      new Error(
                        "Error inserting into companyManagers: " + err.message
                      )
                    );
                  }
                  resolve({
                    msg: `user ${userId} added manager to company ${companyId}`,
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

export async function removeManagerFromCompany(userId, companyId) {
  const db = getDB();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if the user exists
      db.get(
        `SELECT id FROM users WHERE id = ?`,
        [userId],
        (userErr, userRow) => {
          if (userErr) {
            return reject(
              new Error("Error checking user existence: " + userErr.message)
            );
          }
          if (!userRow) {
            return reject(new Error("User with the given ID does not exist"));
          }

          // Check if the company exists
          db.get(
            `SELECT companyId FROM companies WHERE companyId = ?`,
            [companyId],
            (companyErr, companyRow) => {
              if (companyErr) {
                return reject(
                  new Error(
                    "Error checking company existence: " + companyErr.message
                  )
                );
              }
              if (!companyRow) {
                return reject(
                  new Error("Company with the given ID does not exist")
                );
              }

              // If both exist, proceed with the insertion
              db.run(
                `DELETE FROM companyManagers WHERE managerId = ? AND userId = ?`,
                [companyId, userId],
                function (err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve({
                      msg: `user ${userId} removed manager from company ${companyId}`,
                    });
                  }
                }
              );
            }
          );
        }
      );
    });
  });
}
