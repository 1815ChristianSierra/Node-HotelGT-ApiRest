class Payment {
    constructor(id, reservation_id, received_by, reference_number, amount, method_id, type, status, notes, paid_at, created_at) {
        this.id = id;
        this.reservation_id = reservation_id;
        this.received_by = received_by;
        this.reference_number = reference_number;
        this.amount = amount;
        this.method_id = method_id;
        this.type = type;
        this.status = status;
        this.notes = notes;
        this.paid_at = paid_at;
        this.created_at = created_at;
    }
}

module.exports = Payment;
