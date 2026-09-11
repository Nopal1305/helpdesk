import pool from "../../../api/db.js";
import InvariantError from "../../../exceptions/invariant-error.js";

class AuthRepositories {
    constructor() {
        this._pool = pool;
    }

    async addUser({ fullName, email, password, role, department }) {
        const query = {
            text: `INSERT INTO users (full_name, email, password, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role, department`,
            values: [fullName, email, password, role, department]
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan akun baru');
        }
        return result.rows[0];
    }

    async addTech({ fullName, email, password, specialization }) {
        const query = {
            text: `INSERT INTO users (full_name, email, password, role, specialization) VALUES ($1, $2, $3, 'IT_STAFF', $4) RETURNING id, full_name, email, role, specialization`,
            values: [fullName, email, password, specialization]
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menambahkan akun teknisi baru');
        }
        return result.rows[0];
    }

    async getUserbyEmail(email) {
        const query = {
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email]
        }
        const result = await this._pool.query(query)
        return result.rows.length ? result.rows[0] : null;
    }

    async getUserById(id) {
        const query = {
            text: `SELECT * FROM users WHERE id = $1`,
            values: [id]
        }
        const result = await this._pool.query(query)
        return result.rows.length ? result.rows[0] : null;
    }

    async updateProfile(id, fullName) {
        const query = {
            text: `UPDATE users SET full_name = $1 WHERE id = $2 RETURNING full_name`,
            values: [fullName, id]
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal memperbarui profil');
        }
        return result.rows[0].full_name;
    }

    async updatePassword(id, hashedPassword) {
        const query = {
            text: `UPDATE users SET password = $1 WHERE id = $2`,
            values: [hashedPassword, id]
        }
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError('Gagal memperbarui password');
        }
    }

    async incrementLoginCount(id) {
        const query = {
            text: `UPDATE users SET login_count = login_count + 1 WHERE id = $1 RETURNING login_count`,
            values: [id]
        }
        const result = await this._pool.query(query);
        return result.rows[0].login_count;
    }

    async addRefreshToken(token) {
        const query = {
            text: `INSERT INTO authentications (token) VALUES ($1)`,
            values: [token]
        }
        await this._pool.query(query)
    }

    async checkRefreshToken(token) {
        const query = {
            text: `SELECT token FROM authentications WHERE token = $1`,
            values: [token]
        }
        const result = await this._pool.query(query)
        if (!result.rows.length) {
            throw new InvariantError('Token tidak ditemukan')
        }
    }

    async deleteRefreshToken(token) {
        const query = {
            text: `DELETE FROM authentications WHERE token = $1`,
            values: [token]
        }
        await this._pool.query(query);
    }

    async getAllUsers() {
        const query = {
            text: `
                SELECT u.id, u.full_name, u.email, u.role, u.department, u.specialization, u.created_at,
                       COALESCE(ROUND(AVG(t.rating), 1), 0) AS average_rating
                FROM users u
                LEFT JOIN tickets t ON u.id = t.assignee_id AND t.status = 'CLOSED'
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async deleteUser(id) {
        const query = {
            text: `DELETE FROM users WHERE id = $1 RETURNING id`,
            values: [id]
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError('Gagal menghapus akun, pengguna tidak ditemukan');
        }
    }

    async getTotalUsers() {
        const query = {
            text: `SELECT COUNT(*) FROM users`
        };
        const result = await this._pool.query(query);
        return parseInt(result.rows[0].count, 10);
    }

    async saveResetOtp(email, otp, expiresAt) {
        const query = {
            text: `UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE email = $3`,
            values: [otp, expiresAt, email]
        };
        await this._pool.query(query);
    }

    async verifyResetOtp(email, otp) {
        const query = {
            text: `SELECT * FROM users WHERE email = $1 AND reset_otp = $2 AND reset_otp_expires > NOW()`,
            values: [email, otp]
        };
        const result = await this._pool.query(query);
        return result.rows.length > 0;
    }

    async clearResetOtp(email) {
        const query = {
            text: `UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL WHERE email = $1`,
            values: [email]
        };
        await this._pool.query(query);
    }

    async updatePasswordByEmail(email, hashedPassword) {
        const query = {
            text: `UPDATE users SET password = $1 WHERE email = $2`,
            values: [hashedPassword, email]
        };
        await this._pool.query(query);
    }
}

export default new AuthRepositories();