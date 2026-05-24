/**
 * tests/unit/habitacionesController.test.js
 * Pruebas UNITARIAS — habitacionesController
 *
 * mysql2/promise mockeado: no se requiere BD real.
 * Ejecutar: npx jest tests/unit/habitacionesController.test.js
 */

jest.mock("mysql2/promise");
jest.mock("../../src/config/dbconfig", () => ({
  host: "mock",
  database: "mock",
}));

const mysql = require("mysql2/promise");
const {
  getRooms,
  getRoomById,
  getAvailableRooms,
  insertRoom,
  updateRoom,
  deleteRoom,
} = require("../../src/controllers/habitacionesController");

function buildConnection(queryResult) {
  return {
    query: jest.fn().mockResolvedValue([queryResult]),
    end: jest.fn().mockResolvedValue(undefined),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────
// getRooms
// ─────────────────────────────────────────────────────────────────
describe("getRooms()", () => {
  test("retorna todas las habitaciones correctamente", async () => {
    const mockRooms = [
      {
        id: 1,
        room_number: "101",
        name: "Suite Bosque",
        type: "suite",
        status: "disponible",
      },
      {
        id: 2,
        room_number: "102",
        name: "Doble Valle",
        type: "doble",
        status: "disponible",
      },
    ];
    const conn = buildConnection(mockRooms);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getRooms();

    expect(conn.query).toHaveBeenCalledWith("SELECT * FROM rooms");
    expect(result).toHaveLength(2);
    expect(result[0].room_number).toBe("101");
  });

  test("retorna array vacío si no hay habitaciones registradas", async () => {
    const conn = buildConnection([]);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getRooms();

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────
// getRoomById
// ─────────────────────────────────────────────────────────────────
describe("getRoomById()", () => {
  test("retorna la habitación correcta por id", async () => {
    const mockRoom = [{ id: 1, room_number: "101", name: "Suite Bosque" }];
    const conn = buildConnection(mockRoom);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getRoomById(1);

    expect(conn.query).toHaveBeenCalledWith(
      "SELECT * FROM rooms WHERE id = ?",
      [1],
    );
    expect(result[0].name).toBe("Suite Bosque");
  });

  test("retorna array vacío cuando el id no existe", async () => {
    const conn = buildConnection([]);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getRoomById(9999);

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────
// getAvailableRooms
// ─────────────────────────────────────────────────────────────────
describe("getAvailableRooms()", () => {
  test("retorna habitaciones disponibles para las fechas y capacidad dadas", async () => {
    const mockAvailable = [
      { id: 3, room_number: "103", name: "Individual Norte", capacity: 1 },
    ];
    const conn = buildConnection(mockAvailable);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getAvailableRooms("2025-08-01", "2025-08-05", 1);

    expect(conn.query).toHaveBeenCalledWith(expect.stringContaining("NOT IN"), [
      1,
      "2025-08-05",
      "2025-08-01",
    ]);
    expect(result).toHaveLength(1);
  });

  test("retorna array vacío si todas las habitaciones están ocupadas", async () => {
    const conn = buildConnection([]);
    mysql.createConnection.mockResolvedValue(conn);

    const result = await getAvailableRooms("2025-12-24", "2025-12-26", 2);

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────
// insertRoom
// ─────────────────────────────────────────────────────────────────
describe("insertRoom()", () => {
  test("inserta habitación sin amenities y retorna insertId", async () => {
    const conn = buildConnection({ insertId: 10, affectedRows: 1 });
    mysql.createConnection.mockResolvedValue(conn);

    const room = {
      room_number: "201",
      name: "Doble Sur",
      type: "doble",
      capacity: 2,
      description: "Vista al sur",
      base_price: 250.0,
    };

    const result = await insertRoom(room);

    expect(result.insertId).toBe(10);
    // amenities null cuando no se provee
    expect(conn.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO rooms"),
      expect.arrayContaining([null]), // amenities = null
    );
  });

  test("serializa amenities a JSON antes de insertar", async () => {
    const conn = buildConnection({ insertId: 11, affectedRows: 1 });
    mysql.createConnection.mockResolvedValue(conn);

    const room = {
      room_number: "301",
      name: "Suite Premium",
      type: "suite",
      capacity: 4,
      description: "Amenidades premium",
      base_price: 500.0,
      amenities: ["wifi", "jacuzzi", "minibar"],
    };

    await insertRoom(room);

    const callArgs = conn.query.mock.calls[0][1];
    expect(callArgs).toContain(JSON.stringify(["wifi", "jacuzzi", "minibar"]));
  });
});

// ─────────────────────────────────────────────────────────────────
// deleteRoom
// ─────────────────────────────────────────────────────────────────
describe("deleteRoom()", () => {
  test("elimina correctamente y retorna affectedRows 1", async () => {
    const conn = buildConnection({ affectedRows: 1 });
    mysql.createConnection.mockResolvedValue(conn);

    const result = await deleteRoom(2);

    expect(conn.query).toHaveBeenCalledWith(
      "UPDATE rooms SET status = 'inactiva' WHERE id = ?",
      [2],
    );
    expect(result.affectedRows).toBe(1);
  });
});
