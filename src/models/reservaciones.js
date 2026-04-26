class Reservation {
    constructor(id, guest_id, room_id, created_by, reservation_code, check_in_date, check_out_date,
        guests_count, total_amount, status, actual_checkin, actual_checkout, notes, cancelled_at, created_at, updated_at) {
        this.id = id;
        this.guest_id = guest_id;
        this.room_id = room_id;
        this.created_by = created_by;
        this.reservation_code = reservation_code;
        this.check_in_date = check_in_date;
        this.check_out_date = check_out_date;
        this.guests_count = guests_count;
        this.total_amount = total_amount;
        this.status = status;
        this.actual_checkin = actual_checkin;
        this.actual_checkout = actual_checkout;
        this.notes = notes;
        this.cancelled_at = cancelled_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Reservation;
