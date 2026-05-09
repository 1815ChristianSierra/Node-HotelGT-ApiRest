class Usuario {
    constructor(id, name, email, password_hash, rol_id, phone, is_active, email_verified_at, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password_hash;
        this.rol_id = rol_id;
        this.phone = phone;
        this.is_active = is_active;
        this.email_verified_at = email_verified_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}

module.exports = Usuario;