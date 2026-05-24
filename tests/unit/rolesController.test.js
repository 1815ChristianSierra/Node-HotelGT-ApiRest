/**
 * tests/unit/rolesController.test.js
 * Pruebas UNITARIAS — rolesController
 */
 
jest.mock("mysql2/promise");
jest.mock("../../src/config/dbconfig", () => ({ host: "mock", database: "mock" }));
 
const mysql = require("mysql2/promise");
const {
  getRoles,
  getRoleById,
  insertRole,
  updateRole,
  deleteRole,
} = require("../../src/controllers/rolesController");
 
// Cada argumento = resultado de una query en orden de llamada
function buildConnection(...queryResults) {
  let callCount = 0;
  return {
    query: jest.fn().mockImplementation(() => {
      const result = queryResults[callCount] ?? queryResults[queryResults.length - 1];
      callCount++;
      return Promise.resolve([result]);
    }),
    end:              jest.fn().mockResolvedValue(undefined),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit:           jest.fn().mockResolvedValue(undefined),
    rollback:         jest.fn().mockResolvedValue(undefined),
  };
}
 
beforeEach(() => jest.clearAllMocks());
 
// ─────────────────────────────────────────────────────────────────
// getRoles
// ─────────────────────────────────────────────────────────────────
describe("getRoles()", () => {
  test("retorna todos los roles cuando la BD responde correctamente", async () => {
    const mockRoles = [
      { id: 1, name: "admin",     description: "Administrador" },
      { id: 2, name: "recepcion", description: "Recepcionista" },
    ];
    mysql.createConnection.mockResolvedValue(buildConnection(mockRoles));
 
    const result = await getRoles();
 
    expect(result).toEqual(mockRoles);
  });
 
  test("lanza error cuando la conexión falla", async () => {
    mysql.createConnection.mockRejectedValue(new Error("Connection refused"));
 
    await expect(getRoles()).rejects.toThrow("Connection refused");
  });
});
 
// ─────────────────────────────────────────────────────────────────
// getRoleById
// ─────────────────────────────────────────────────────────────────
describe("getRoleById()", () => {
  test("retorna el rol correcto cuando existe el id", async () => {
    const mockRole = [{ id: 1, name: "admin", description: "Administrador" }];
    mysql.createConnection.mockResolvedValue(buildConnection(mockRole));
 
    const result = await getRoleById(1);
 
    expect(result).toEqual(mockRole);
  });
 
  test("retorna array vacío cuando el id no existe", async () => {
    mysql.createConnection.mockResolvedValue(buildConnection([]));
 
    const result = await getRoleById(999);
 
    expect(result).toEqual([]);
  });
});
 
// ─────────────────────────────────────────────────────────────────
// insertRole
// ─────────────────────────────────────────────────────────────────
describe("insertRole()", () => {
  test("inserta un rol y retorna el resultado del query", async () => {
    // 2 queries: INSERT roles, INSERT audit_logs
    const conn = buildConnection(
      { insertId: 5, affectedRows: 1 },  // INSERT roles
      { insertId: 1, affectedRows: 1 },  // INSERT audit_logs
    );
    mysql.createConnection.mockResolvedValue(conn);
 
    const result = await insertRole({ name: "limpieza", description: "Personal de limpieza" });
 
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(result.insertId).toBe(5);
  });
 
  test("lanza error si la BD rechaza la inserción", async () => {
    const conn = {
      query:            jest.fn().mockRejectedValue(new Error("Duplicate entry 'admin'")),
      end:              jest.fn().mockResolvedValue(undefined),
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit:           jest.fn().mockResolvedValue(undefined),
      rollback:         jest.fn().mockResolvedValue(undefined),
    };
    mysql.createConnection.mockResolvedValue(conn);
 
    await expect(insertRole({ name: "admin", description: null })).rejects.toThrow("Duplicate entry");
  });
});
 
// ─────────────────────────────────────────────────────────────────
// updateRole
// ─────────────────────────────────────────────────────────────────
describe("updateRole()", () => {
  test("actualiza el rol correctamente y retorna affectedRows", async () => {
    // 3 queries: SELECT old, UPDATE, INSERT audit_logs
    const conn = buildConnection(
      [{ id: 2, name: "recepcion", description: "Recepcionista" }], // SELECT
      { affectedRows: 1, changedRows: 1 },                          // UPDATE
      { insertId: 2, affectedRows: 1 },                             // audit_logs
    );
    mysql.createConnection.mockResolvedValue(conn);
 
    const result = await updateRole({ id: 2, name: "recepcion_senior", description: "Senior" });
 
    expect(conn.beginTransaction).toHaveBeenCalled();
    expect(conn.commit).toHaveBeenCalled();
    expect(result.affectedRows).toBe(1);
  });
 
  test("lanza error cuando el id no existe", async () => {
    mysql.createConnection.mockResolvedValue(buildConnection([])); // SELECT devuelve vacío
 
    await expect(updateRole({ id: 999, name: "x", description: "x" })).rejects.toThrow("El rol no existe");
  });
});
 
// ─────────────────────────────────────────────────────────────────
// deleteRole
// ─────────────────────────────────────────────────────────────────
describe("deleteRole()", () => {
  test("elimina el rol y retorna affectedRows 1", async () => {
    mysql.createConnection.mockResolvedValue(buildConnection({ affectedRows: 1 }));
 
    const result = await deleteRole(3);
 
    expect(result.affectedRows).toBe(1);
  });
 
  test("retorna affectedRows 0 cuando el rol no existe", async () => {
    mysql.createConnection.mockResolvedValue(buildConnection({ affectedRows: 0 }));
 
    const result = await deleteRole(999);
 
    expect(result.affectedRows).toBe(0);
  });
});
 