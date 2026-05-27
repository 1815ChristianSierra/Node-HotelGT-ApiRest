class Room {
    constructor(id, room_number, name, type, capacity, description, base_price, status, amenities, created_at, updated_at) {
        this.id = id;
        this.room_number = room_number;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.description = description;
        this.base_price = base_price;
        this.status = status;
        this.amenities = amenities;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Room;