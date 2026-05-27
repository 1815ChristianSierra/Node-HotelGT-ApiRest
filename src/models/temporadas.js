class Season {
    constructor(id, name, start_date, end_date, price_adjustment, type, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.start_date = start_date;
        this.end_date = end_date;
        this.price_adjustment = price_adjustment;
        this.type = type;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Season;
