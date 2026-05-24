/**
 * tests/integration/api.integration.test.js
 * Pruebas de INTEGRACIÓN — rolesController + habitacionesController + usuariosController
 *
 * Requiere MySQL real en 127.0.0.1:3306 con la BD hotel_laravel cargada.
 * En GitHub Actions la levanta el servicio mysql:8.0 del workflow.
 *
 * Variables de entorno esperadas:
 *   DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD
 *
 * Ejecutar: npx jest tests/integration --forceExit
 */
 
const mysql = require("mysql2/promise");
 
// Cargamos los controllers reales (sin mock)
const { getRoles, insertRole, updateRole, deleteRole, getRoleById } =
  require("../../src/controllers/rolesController");
const { getRooms, insertRoom, getRoomById, deleteRoom } =
  require("../../src/controllers/habitacionesController");
const { getUsers, insertUser, deleteUser } =
  require("../../src/controllers/usuariosController");
 
// ─────────────────────────────────────────────────────────────────
// Limpieza entre pruebas (rollback manual)
// ─────────────────────────────────────────────────────────────────
let connection;
let insertedRoleId;
let insertedRoomId;
let insertedUserId;
 
beforeAll(async () => {
  connection = await mysql.createConnection({
    host:     process.env.DB_HOST     || "127.0.0.1",
    port:     process.env.DB_PORT     || 3306,
    database: process.env.DB_DATABASE || "hotel_laravel",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
  });
});
 
afterAll(async () => {
  // Limpieza final de registros de prueba
  if (insertedUserId)  await connection.query("DELETE FROM users WHERE id = ?",  [insertedUserId]);
  if (insertedRoomId)  await connection.query("DELETE FROM rooms WHERE id = ?",  [insertedRoomId]);
  if (insertedRoleId)  await connection.query("DELETE FROM roles WHERE id = ?",  [insertedRoleId]);
  await connection.end();
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 1 — Insertar un rol y leerlo de vuelta
// ─────────────────────────────────────────────────────────────────
test("E1: insertar un rol y recuperarlo por id", async () => {
  const result = await insertRole({
    name:        `ci_role_${Date.now()}`,
    description: "Rol creado por prueba de integración",
  });
 
  expect(result.affectedRows).toBe(1);
  insertedRoleId = result.insertId;
 
  const rows = await getRoleById(insertedRoleId);
  expect(rows).toHaveLength(1);
  expect(rows[0].description).toBe("Rol creado por prueba de integración");
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 2 — Actualizar el rol insertado
// ─────────────────────────────────────────────────────────────────
test("E2: actualizar el nombre del rol insertado en E1", async () => {
  expect(insertedRoleId).toBeDefined();
 
  const result = await updateRole({
    id:          insertedRoleId,
    name:        `ci_role_updated_${Date.now()}`,
    description: "Descripción actualizada",
  });
 
  expect(result.affectedRows).toBe(1);
 
  const rows = await getRoleById(insertedRoleId);
  expect(rows[0].description).toBe("Descripción actualizada");
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 3 — getRoles devuelve al menos el rol insertado
// ─────────────────────────────────────────────────────────────────
test("E3: getRoles incluye el rol creado en los escenarios anteriores", async () => {
  const roles = await getRoles();
 
  expect(Array.isArray(roles)).toBe(true);
  const found = roles.find((r) => r.id === insertedRoleId);
  expect(found).toBeDefined();
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 4 — Insertar habitación y leerla de vuelta
// ─────────────────────────────────────────────────────────────────
test("E4: insertar una habitación y recuperarla por id", async () => {
  const roomNumber = `CI-${Date.now()}`;
  const result = await insertRoom({
    room_number: roomNumber,
    name:        "Habitación CI Test",
    type:        "individual",
    capacity:    1,
    description: "Creada por integración",
    base_price:  100.0,
    status:      "disponible",
    amenities:   null,
  });
 
  expect(result.affectedRows).toBe(1);
  insertedRoomId = result.insertId;
 
  const rows = await getRoomById(insertedRoomId);
  expect(rows).toHaveLength(1);
  expect(rows[0].room_number).toBe(roomNumber);
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 5 — Insertar usuario con el rol de E1 y verificar
// ─────────────────────────────────────────────────────────────────
test("E5: insertar un usuario con el rol creado en E1 y verificar con getUsers", async () => {
  expect(insertedRoleId).toBeDefined();
 
  const result = await insertUser({
    name:      "CI Usuario Test",
    email:     `ci_user_${Date.now()}@test.com`,
    password:  "hashed_password_placeholder",
    rol_id:    insertedRoleId,
    phone:     "50299999999",
    is_active: 1,
  });
 
  expect(result.affectedRows).toBe(1);
  insertedUserId = result.insertId;
 
  const users = await getUsers();
  const found = users.find((u) => u.id === insertedUserId);
  expect(found).toBeDefined();
  expect(found.rol_nombre).toBeDefined(); // JOIN con roles debe traer el nombre
});
 
// ─────────────────────────────────────────────────────────────────
// ESCENARIO 6 — Eliminar rol con usuarios asignados debe fallar (FK)
// ─────────────────────────────────────────────────────────────────
test("E6: eliminar rol con usuario asignado debe lanzar error de FK", async () => {
  expect(insertedRoleId).toBeDefined();
  expect(insertedUserId).toBeDefined();
 
  // El usuario E5 aún existe → la FK debe bloquear el DELETE
  await expect(deleteRole(insertedRoleId)).rejects.toThrow();
});
 