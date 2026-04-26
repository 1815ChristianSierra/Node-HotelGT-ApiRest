class Notification {
    constructor(id, reservation_id, user_id, type, channel, status, sent_at, error_message, created_at) {
        this.id = id;
        this.reservation_id = reservation_id;
        this.user_id = user_id;
        this.type = type;
        this.channel = channel;
        this.status = status;
        this.sent_at = sent_at;
        this.error_message = error_message;
        this.created_at = created_at;
    }
}

module.exports = Notification;
