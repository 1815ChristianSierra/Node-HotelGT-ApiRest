class PaymentMethod {
    constructor(id, name, description, discount_percentage, is_active, created_at) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.discount_percentage = discount_percentage;
        this.is_active = is_active;
        this.created_at = created_at;
    }
}

module.exports = PaymentMethod;