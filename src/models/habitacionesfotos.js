class RoomPhoto {
    constructor(id, room_id, url, caption, is_primary, sort_order, created_at) {
        this.id = id;
        this.room_id = room_id;
        this.url = url;
        this.caption = caption;
        this.is_primary = is_primary;
        this.sort_order = sort_order;
        this.created_at = created_at;
    }
}

module.exports = RoomPhoto;
